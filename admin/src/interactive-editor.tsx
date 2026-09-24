import { useEffect, useMemo, useState } from 'react';
import { supabase } from './lib/supabase';
import { FIGURE_LABELS, parseInteractiveModule, validateInteractiveModule, type FigureId, type InteractiveModule, type ModuleBlock, type ModuleSection } from '../../shared/interactive-module';
import './interactive.css';

type TopicRow = { id: string; name: string; discipline: string };
type ModuleRow = { id: string; topic_id: string; version: number; status: 'draft' | 'review' | 'published' | 'archived'; content: unknown; updated_at: string };
type BlockKind = ModuleBlock['kind'];

const newId = () => crypto.randomUUID();
const lines = (value: string) => value.split('\n').map(item => item.trim()).filter(Boolean);
const blankBlock = (kind: BlockKind): ModuleBlock => {
  const id = newId();
  switch (kind) {
    case 'text': return { id, kind, title: '', body: '' };
    case 'analogy': return { id, kind, title: '', body: '', limit: '' };
    case 'list': return { id, kind, title: '', items: [] };
    case 'figure': return { id, kind, title: '', figureId: 'cell-types', caption: '' };
    case 'check': return { id, kind, prompt: '', options: ['', '', '', ''], answer: 0, explanation: '' };
  }
};
const blankSection = (): ModuleSection => ({ id: newId(), title: '', objective: '', blocks: [blankBlock('text')] });
const blankModule = (topic: TopicRow): InteractiveModule => ({ schemaVersion: 1, topicId: topic.id, title: `Apostila de ${topic.name}`, intro: '', sections: [blankSection()] });
function editableDraft(value: unknown, topicId: string): InteractiveModule | null {
  if (!value || typeof value !== 'object') return null;
  const draft = value as Partial<InteractiveModule>;
  return draft.schemaVersion === 1 && draft.topicId === topicId && Array.isArray(draft.sections)
    ? draft as InteractiveModule
    : null;
}
function moved<T>(items: T[], from: number, to: number): T[] {
  if (to < 0 || to >= items.length) return items;
  const next = [...items];
  next.splice(to, 0, next.splice(from, 1)[0]);
  return next;
}

export function InteractiveEditor() {
  const [topics, setTopics] = useState<TopicRow[]>([]);
  const [rows, setRows] = useState<ModuleRow[]>([]);
  const [topicId, setTopicId] = useState('');
  const [module, setModule] = useState<InteractiveModule | null>(null);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [draftVersion, setDraftVersion] = useState(1);
  const [activeSection, setActiveSection] = useState(0);
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function reload() {
    const [topicResult, moduleResult] = await Promise.all([
      supabase!.from('topics').select('id,name,discipline').eq('published', true).order('name'),
      supabase!.from('interactive_module_versions').select('id,topic_id,version,status,content,updated_at').order('version', { ascending: false }),
    ]);
    if (topicResult.error || moduleResult.error) throw new Error(topicResult.error?.message ?? moduleResult.error?.message);
    const availableTopics = (topicResult.data ?? []) as TopicRow[];
    setTopics(availableTopics);
    setRows((moduleResult.data ?? []) as ModuleRow[]);
    setTopicId(current => current || availableTopics[0]?.id || '');
  }
  useEffect(() => { void reload().catch(issue => setError(String(issue.message))).finally(() => setLoading(false)); }, []);

  const topic = topics.find(item => item.id === topicId);
  const versions = useMemo(() => rows.filter(row => row.topic_id === topicId), [rows, topicId]);
  const published = versions.find(row => row.status === 'published');
  const existingDraft = versions.find(row => row.status === 'draft');
  const issues = module ? validateInteractiveModule(module, topicId) : [];

  function start() {
    if (!topic) return;
    const source = existingDraft ?? published;
    setModule(existingDraft ? (editableDraft(source?.content, topicId) ?? blankModule(topic)) : (parseInteractiveModule(source?.content, topicId) ?? blankModule(topic)));
    setDraftId(existingDraft?.id ?? null);
    setDraftVersion(existingDraft?.version ?? Math.max(0, ...versions.map(row => row.version)) + 1);
    setActiveSection(0); setPreview(false); setError(''); setNotice('');
  }
  function updateSection(index: number, next: ModuleSection) {
    setModule(current => current && ({ ...current, sections: current.sections.map((item, position) => position === index ? next : item) }));
  }
  function updateBlock(sectionIndex: number, blockIndex: number, next: ModuleBlock) {
    setModule(current => current && ({ ...current, sections: current.sections.map((section, index) => index === sectionIndex ? { ...section, blocks: section.blocks.map((block, position) => position === blockIndex ? next : block) } : section) }));
  }
  async function saveDraft(): Promise<string | null> {
    if (!module) return null;
    const { data: userResult, error: authError } = await supabase!.auth.getUser();
    if (authError || !userResult.user) throw new Error('Sua sessão expirou. Entre novamente.');
    const payload = { topic_id: topicId, version: draftVersion, status: 'draft', content: module, updated_by: userResult.user.id, updated_at: new Date().toISOString() };
    const result = draftId
      ? await supabase!.from('interactive_module_versions').update({ content: module, updated_by: userResult.user.id }).eq('id', draftId).eq('status', 'draft').select('id').single()
      : await supabase!.from('interactive_module_versions').insert(payload).select('id').single();
    if (result.error || !result.data) throw new Error(result.error?.message ?? 'Não foi possível salvar o rascunho.');
    setDraftId(result.data.id as string);
    await reload();
    return result.data.id as string;
  }
  async function save() {
    setBusy(true); setError(''); setNotice('');
    try { await saveDraft(); setNotice('Rascunho salvo. A versão pública continua igual.'); }
    catch (issue) { setError((issue as Error).message); }
    finally { setBusy(false); }
  }
  async function publish() {
    if (issues.length) { setError(issues.join(' ')); return; }
    setBusy(true); setError(''); setNotice('');
    try {
      const id = await saveDraft();
      if (!id) throw new Error('Salve um rascunho antes de publicar.');
      const { error: publishError } = await supabase!.rpc('publish_interactive_module', { p_module_id: id });
      if (publishError) throw publishError;
      await reload(); setModule(null); setDraftId(null); setNotice('Apostila publicada para os alunos.');
    } catch (issue) { setError((issue as Error).message); }
    finally { setBusy(false); }
  }
  async function archive() {
    if (!published) return;
    setBusy(true); setError(''); setNotice('');
    const { error: archiveError } = await supabase!.rpc('archive_interactive_module', { p_module_id: published.id });
    if (archiveError) setError(archiveError.message);
    else { await reload(); setNotice(topicId === 'cytology' ? 'Versão arquivada. A apostila incluída no app volta a aparecer.' : 'Versão arquivada. A apostila deixa de aparecer para os alunos.'); }
    setBusy(false);
  }

  if (loading) return <section className="content"><p>Carregando apostilas…</p></section>;
  return <section className="content interactive-admin">
    <div className="welcome"><div><p className="eyebrow">AULAS QUE GANHAM VIDA</p><h3>Apostilas interativas</h3><p className="muted">Crie etapas curtas para um monstro já publicado. Verificações ajudam o aluno a pensar, sem alterar a pontuação das batalhas.</p></div></div>
    {error && <div className="error" role="alert">{error}</div>}{notice && <div className="success" role="status">{notice}</div>}
    {!topics.length ? <div className="panel"><h3>Nenhum monstro publicado</h3><p>Publique um monstro no catálogo antes de criar uma apostila.</p></div> : <>
      <div className="interactive-toolbar"><label className="field">Monstro do catálogo<select value={topicId} onChange={event => { setTopicId(event.target.value); setModule(null); setDraftId(null); setError(''); setNotice(''); }}>{topics.map(item => <option key={item.id} value={item.id}>{item.name} · {item.discipline}</option>)}</select></label><div className="interactive-status"><span>Publicada: {published ? `v${published.version}` : 'nenhuma'}</span><span>Rascunho: {existingDraft ? `v${existingDraft.version}` : 'nenhum'}</span></div></div>
      {!module ? <div className="panel interactive-start"><div><h3>{topic?.name}</h3><p>{published ? 'Edite em um novo rascunho. A versão atual permanece visível até a publicação.' : 'Comece com uma etapa e adicione cartões no seu ritmo.'}</p></div><div className="interactive-actions"><button className="primary" onClick={start}>{existingDraft ? 'Continuar rascunho' : published ? 'Criar nova versão' : 'Criar apostila'}</button>{published && <button className="link-button danger" disabled={busy} onClick={() => void archive()}>Arquivar versão publicada</button>}</div></div> : <>
        <div className="interactive-actions top-actions"><button className="link-button" onClick={() => setModule(null)}>← Voltar à lista</button><div><span className="muted small">Versão {draftVersion} · {draftId ? 'rascunho salvo' : 'ainda não salvo'}</span><button className="secondary" disabled={busy} onClick={() => void save()}>{busy ? 'Aguarde…' : 'Salvar rascunho'}</button><button className="primary" disabled={busy || !!issues.length} onClick={() => void publish()}>Publicar</button></div></div>
        <div className="interactive-layout"><div className="interactive-main">
          <div className="editor-section"><h3>Apresentação</h3><label className="field">Título<input value={module.title} onChange={event => setModule({ ...module, title: event.target.value })} /></label><label className="field">Convite inicial<textarea rows={3} value={module.intro} onChange={event => setModule({ ...module, intro: event.target.value })} /></label></div>
          <div className="editor-section"><div className="interactive-heading"><div><h3>Etapas</h3><p className="muted small">Uma ideia central por vez. Arraste mentalmente o percurso usando os botões de ordem.</p></div><button className="secondary" onClick={() => { setModule({ ...module, sections: [...module.sections, blankSection()] }); setActiveSection(module.sections.length); }}>+ Etapa</button></div><div className="interactive-step-tabs">{module.sections.map((section, index) => <button key={section.id} className={activeSection === index ? 'selected' : ''} onClick={() => setActiveSection(index)}>{index + 1}. {section.title || 'Nova etapa'}</button>)}</div>
            {module.sections[activeSection] && <div className="interactive-section-form"><div className="interactive-actions"><strong>Etapa {activeSection + 1}</strong><div><button className="link-button" disabled={activeSection === 0} onClick={() => { setModule({ ...module, sections: moved(module.sections, activeSection, activeSection - 1) }); setActiveSection(activeSection - 1); }}>↑ Subir</button><button className="link-button" disabled={activeSection === module.sections.length - 1} onClick={() => { setModule({ ...module, sections: moved(module.sections, activeSection, activeSection + 1) }); setActiveSection(activeSection + 1); }}>↓ Descer</button><button className="link-button danger" onClick={() => { setModule({ ...module, sections: module.sections.filter((_, index) => index !== activeSection) }); setActiveSection(Math.max(0, activeSection - 1)); }}>Remover</button></div></div>
              <label className="field">Título da etapa<input value={module.sections[activeSection].title} onChange={event => updateSection(activeSection, { ...module.sections[activeSection], title: event.target.value })} /></label>
              <label className="field">O que o aluno vai entender<textarea rows={2} value={module.sections[activeSection].objective} onChange={event => updateSection(activeSection, { ...module.sections[activeSection], objective: event.target.value })} /></label>
              <div className="interactive-blocks">{module.sections[activeSection].blocks.map((block, blockIndex) => <div className="item-card" key={block.id}><div className="interactive-actions"><strong>Cartão {blockIndex + 1} · {block.kind}</strong><div><button className="link-button" disabled={blockIndex === 0} onClick={() => updateSection(activeSection, { ...module.sections[activeSection], blocks: moved(module.sections[activeSection].blocks, blockIndex, blockIndex - 1) })}>↑</button><button className="link-button" disabled={blockIndex === module.sections[activeSection].blocks.length - 1} onClick={() => updateSection(activeSection, { ...module.sections[activeSection], blocks: moved(module.sections[activeSection].blocks, blockIndex, blockIndex + 1) })}>↓</button><button className="link-button danger" onClick={() => updateSection(activeSection, { ...module.sections[activeSection], blocks: module.sections[activeSection].blocks.filter((_, index) => index !== blockIndex) })}>Remover</button></div></div>
                <BlockFields block={block} onChange={next => updateBlock(activeSection, blockIndex, next)} />
              </div>)}</div>
              <div className="interactive-add-block"><span className="muted small">Adicionar cartão:</span>{(['text', 'analogy', 'list', 'figure', 'check'] as BlockKind[]).map(kind => <button key={kind} className="secondary" onClick={() => updateSection(activeSection, { ...module.sections[activeSection], blocks: [...module.sections[activeSection].blocks, blankBlock(kind)] })}>{({ text: 'Texto', analogy: 'Analogia', list: 'Lista', figure: 'Diagrama', check: 'Verificação' })[kind]}</button>)}</div>
            </div>}
          </div>
        </div><aside className="interactive-side"><div className="editor-section"><div className="interactive-actions"><h3>Prévia</h3><button className="link-button" onClick={() => setPreview(!preview)}>{preview ? 'Ocultar' : 'Mostrar'}</button></div>{preview ? <Preview module={module} sectionIndex={activeSection} /> : <p className="muted small">Veja a etapa selecionada como sequência de cartões antes de publicar.</p>}</div><div className="editor-section"><h3>Revisão antes de publicar</h3>{issues.length ? <ul className="interactive-issues">{issues.map(issue => <li key={issue}>{issue}</li>)}</ul> : <p className="success">Conteúdo pronto para publicação.</p>}</div></aside></div>
      </>}
    </>}
  </section>;
}

function BlockFields({ block, onChange }: { block: ModuleBlock; onChange: (block: ModuleBlock) => void }) {
  if (block.kind === 'check') return <><label className="field">Pergunta<textarea rows={2} value={block.prompt} onChange={event => onChange({ ...block, prompt: event.target.value })} /></label><div className="interactive-options">{block.options.map((option, index) => <label className="field" key={index}>Alternativa {String.fromCharCode(65 + index)}<div className="interactive-option"><input type="radio" name={`answer-${block.id}`} checked={block.answer === index} onChange={() => onChange({ ...block, answer: index })} aria-label={`Alternativa ${String.fromCharCode(65 + index)} correta`} /><input value={option} onChange={event => onChange({ ...block, options: block.options.map((item, position) => position === index ? event.target.value : item) as [string, string, string, string] })} /></div></label>)}</div><label className="field">Explicação após responder<textarea rows={3} value={block.explanation} onChange={event => onChange({ ...block, explanation: event.target.value })} /></label></>;
  return <><label className="field">Título<input value={block.title} onChange={event => onChange({ ...block, title: event.target.value })} /></label>
    {(block.kind === 'text' || block.kind === 'analogy') && <label className="field">{block.kind === 'analogy' ? 'Analogia' : 'Texto'}<textarea rows={4} value={block.body} onChange={event => onChange({ ...block, body: event.target.value })} /></label>}
    {block.kind === 'analogy' && <label className="field">Onde a analogia deixa de valer<textarea rows={2} value={block.limit} onChange={event => onChange({ ...block, limit: event.target.value })} /></label>}
    {block.kind === 'list' && <label className="field">Itens · um por linha<textarea rows={5} value={block.items.join('\n')} onChange={event => onChange({ ...block, items: lines(event.target.value) })} /></label>}
    {block.kind === 'figure' && <><label className="field">Diagrama disponível<select value={block.figureId} onChange={event => onChange({ ...block, figureId: event.target.value as FigureId })}>{Object.entries(FIGURE_LABELS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label><label className="field">Legenda<textarea rows={2} value={block.caption} onChange={event => onChange({ ...block, caption: event.target.value })} /></label></>}
  </>;
}

function Preview({ module, sectionIndex }: { module: InteractiveModule; sectionIndex: number }) {
  const section = module.sections[sectionIndex];
  if (!section) return <p className="muted">Adicione uma etapa.</p>;
  return <div className="interactive-preview"><p className="eyebrow">ETAPA {sectionIndex + 1} DE {module.sections.length}</p><h4>{section.title || 'Sem título'}</h4><p>{section.objective}</p>{section.blocks.map(block => <div className="interactive-preview-card" key={block.id}>{block.kind === 'check' ? <><strong>Verificação</strong><p>{block.prompt}</p><ol type="A">{block.options.map((option, index) => <li key={index}>{option}</li>)}</ol></> : <><strong>{block.title || 'Sem título'}</strong>{block.kind === 'figure' ? <p>Diagrama: {FIGURE_LABELS[block.figureId]}</p> : block.kind === 'list' ? <ul>{block.items.map((item, index) => <li key={index}>{item}</li>)}</ul> : <p>{block.body}</p>}</>}</div>)}</div>;
}
