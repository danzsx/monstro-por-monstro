import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useApp } from '@/data/provider';
import { useActions } from './actions';
import { approvedExamQuestions, isEvolutionPilot } from './evolution';
import type { ChecklistItem, ExternalQuestionLog, Topic } from './types';
import { Button, Card, Heading, Pill, Txt } from '@/ui/primitives';
import { colors as c, fonts } from '@/ui/theme';
import { useTask } from '@/ui/use-task';

const theoryItems: { id: ChecklistItem; label: string }[] = [
  { id: 'source_studied', label: 'Estudei uma fonte' },
  { id: 'recalled_without_help', label: 'Tentei lembrar sem consultar' },
  { id: 'explained_in_words', label: 'Expliquei com minhas palavras' },
];
const questionItems: { id: ChecklistItem; label: string }[] = [
  { id: 'solved_without_help', label: 'Resolvi sem ajuda' },
  { id: 'checked_explanation', label: 'Conferi a explicação' },
  { id: 'noted_review', label: 'Registrei o que preciso rever' },
];

function CheckRow({ label, checked, onPress }: { label: string; checked: boolean; onPress: () => void }) {
  return <Pressable accessibilityRole="checkbox" accessibilityLabel={label} accessibilityState={{ checked }} aria-checked={checked} onPress={onPress}
    style={{ flexDirection: 'row', alignItems: 'center', minHeight: 48, gap: 12 }}>
    <View style={{ width: 24, height: 24, borderWidth: 2, borderColor: c.purple, borderRadius: 6, backgroundColor: checked ? c.purple : c.surface, alignItems: 'center', justifyContent: 'center' }}>
      {checked && <Txt color="#FFFFFF" weight="bold">✓</Txt>}
    </View><Txt style={{ flex: 1 }}>{label}</Txt>
  </Pressable>;
}

const emptyForm = () => ({ source: '', locator: '', url: '', studiedAt: new Date().toISOString().slice(0, 10), result: 'unanswered' as ExternalQuestionLog['result'], comment: '' });

export function MonsterStudyControls({ topic }: { topic: Topic }) {
  const { state } = useApp();
  const actions = useActions();
  const task = useTask();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string>();
  const [showForm, setShowForm] = useState(false);
  const [notice, setNotice] = useState('');
  const checklist = state.topicChecklists?.[topic.id];
  const mastery = state.masteries[topic.id];
  const logs = (state.externalQuestionLogs ?? []).filter(log => log.topicId === topic.id).sort((a, b) => b.studiedAt.localeCompare(a.studiedAt));
  const examItems = approvedExamQuestions(topic.questions);
  const canStudy = topic.prerequisiteIds.every(id => { const prerequisite = state.masteries[id]; return prerequisite && (isEvolutionPilot(id) ? !!prerequisite.firstClearedAt : prerequisite.evidence >= 3 && prerequisite.score >= .65); });
  const canExam = isEvolutionPilot(topic.id) && !!mastery?.evolvedAt && examItems.length >= 2;
  const field = { fontFamily: fonts.body, fontSize: 15, color: c.ink, padding: 13, borderRadius: 12, borderWidth: 1, borderColor: c.line, backgroundColor: c.surface };
  const save = () => task.run(async () => {
    const date = new Date(`${form.studiedAt}T12:00:00.000Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.studiedAt) || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== form.studiedAt) throw new Error('Informe uma data válida no formato AAAA-MM-DD.');
    await actions.saveExternalQuestion({ id: editingId, topicId: topic.id, source: form.source, locator: form.locator, url: form.url.trim() || undefined,
      studiedAt: date.toISOString(), result: form.result, comment: form.comment });
    setEditingId(undefined); setForm(emptyForm()); setShowForm(false); setNotice('Questão registrada na sua jornada privada.');
  });
  const startExam = () => task.run(async () => {
    if (state.activeBattle) { router.push('/battle'); return; }
    await actions.startBattle({ topicId: topic.id, reasons: ['Prática de prova escolhida no bestiário.'], review: true, score: 0, suggestedMode: 'exam' });
    router.push('/battle');
  });
  const retryFirstForm = () => task.run(async () => {
    if (state.activeBattle) { router.push('/battle'); return; }
    await actions.startBattle({ topicId: topic.id, reasons: ['Nova tentativa de fixação escolhida na ficha do monstro.'], review: false, score: 0, suggestedMode: 'learn' });
    router.push('/battle');
  });
  return <View style={{ gap: 16 }}>
    <Card style={{ gap: 14 }}><Heading size={23}>Meu caminho neste monstro</Heading><Txt size={13} color={c.muted}>Marque o que fez para se orientar. Estes itens não dão pontos e podem ser alterados.</Txt>
      <Txt weight="bold" color={c.purple}>Teoria</Txt>{theoryItems.map(item => <CheckRow key={item.id} label={item.label} checked={!!checklist?.checked[item.id]} onPress={() => task.run(() => actions.setChecklistItem(topic.id, item.id, !checklist?.checked[item.id]))} />)}
      <Txt weight="bold" color={c.purple}>Questões</Txt>{questionItems.map(item => <CheckRow key={item.id} label={item.label} checked={!!checklist?.checked[item.id]} onPress={() => task.run(() => actions.setChecklistItem(topic.id, item.id, !checklist?.checked[item.id]))} />)}
      <View style={{ borderTopWidth: 1, borderColor: c.line, paddingTop: 10 }}><CheckRow label="Compreendi a teoria" checked={!!checklist?.theoryUnderstood} onPress={() => task.run(() => actions.setTheoryUnderstood(topic.id, !checklist?.theoryUnderstood))} /></View>
      <Txt size={12} color={c.muted}>Essa declaração só completa a primeira conquista quando vier acompanhada de três respostas corretas, distintas e sem ajuda na mesma sessão. Ela não mede domínio por si só.</Txt>
    </Card>
    {isEvolutionPilot(topic.id) && <Card style={{ gap: 12, backgroundColor: c.lavender }}><Heading size={22}>{mastery?.evolvedAt ? 'Sua segunda forma está aqui' : 'Uma segunda forma pode nascer'}</Heading>
      <Txt color={c.muted}>{mastery?.evolvedAt ? 'A primeira conquista permanece. Questões novas, depois de um intervalo, ajudam a verificar o que ficou.' : 'Depois de compreender a teoria e acertar três questões de fixação sem ajuda, este monstro evolui.'}</Txt>
      {canExam ? <Button title="Praticar duas questões do ENEM" onPress={startExam} busy={task.busy} /> : mastery?.evolvedAt ? <Txt size={13} color={c.muted}>As questões oficiais dentro do app aguardam comprovação dos direitos de reprodução.</Txt> : null}
      {!mastery?.evolvedAt && canStudy && <Button title={state.activeBattle ? 'Continuar sessão' : 'Estudar teoria e fixar o conteúdo'} variant="secondary" onPress={retryFirstForm} busy={task.busy} />}
    </Card>}
    <Card style={{ gap: 13 }}><Heading size={22}>Questões que fiz fora do app</Heading><Txt size={13} color={c.muted}>Guarde apenas referência, resultado e comentário pessoal. Não copie enunciados, imagens ou dados de outras pessoas.</Txt>
      <Button title={showForm ? 'Fechar formulário' : 'Registrar questão que fiz fora do app'} variant="secondary" onPress={() => { setShowForm(!showForm); setEditingId(undefined); setForm(emptyForm()); }} />
      {showForm && <View style={{ gap: 9 }}>
        <Txt weight="bold">Fonte</Txt><TextInput accessibilityLabel="Fonte da questão" placeholder="Livro, apostila ou lista" value={form.source} maxLength={120} onChangeText={source => setForm(f => ({ ...f, source }))} style={field} />
        <Txt weight="bold">Identificação</Txt><TextInput accessibilityLabel="Página ou número da questão" placeholder="Página 42, questão 7" value={form.locator} maxLength={80} onChangeText={locator => setForm(f => ({ ...f, locator }))} style={field} />
        <Txt weight="bold">Link opcional</Txt><TextInput accessibilityLabel="Link da fonte" placeholder="https://..." value={form.url} onChangeText={url => setForm(f => ({ ...f, url }))} autoCapitalize="none" style={field} />
        <Txt weight="bold">Data (AAAA-MM-DD)</Txt><TextInput accessibilityLabel="Data da resolução" value={form.studiedAt} onChangeText={studiedAt => setForm(f => ({ ...f, studiedAt }))} style={field} />
        <Txt weight="bold">Como foi?</Txt><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>{([
          ['correct', 'Acertei'], ['incorrect', 'Errei'], ['unanswered', 'Não concluí'],
        ] as const).map(([result, label]) => <Button key={result} title={label} variant={form.result === result ? 'primary' : 'secondary'} onPress={() => setForm(f => ({ ...f, result }))} />)}</View>
        <Txt weight="bold">Comentário pessoal</Txt><TextInput accessibilityLabel="Comentário sobre a questão" placeholder="O que preciso rever?" value={form.comment} onChangeText={comment => setForm(f => ({ ...f, comment }))} maxLength={240} multiline style={{ ...field, minHeight: 86, textAlignVertical: 'top' }} />
        <Button title={editingId ? 'Salvar alterações' : 'Salvar registro'} busy={task.busy} disabled={!form.source.trim() || !form.locator.trim()} onPress={save} />
      </View>}
      {logs.map(log => <View key={log.id} style={{ borderTopWidth: 1, borderColor: c.line, paddingTop: 12, gap: 6 }}><Txt weight="bold">{log.source} · {log.locator}</Txt><Txt size={13} color={c.muted}>{new Date(log.studiedAt).toLocaleDateString('pt-BR')} · {log.result === 'correct' ? 'Acertei' : log.result === 'incorrect' ? 'Errei' : 'Não concluí'} · informado por você</Txt>{!!log.comment && <Txt>{log.comment}</Txt>}{!!log.url && <Txt size={12} color={c.purple}>{log.url}</Txt>}
        <View style={{ flexDirection: 'row', gap: 8 }}><Button title="Editar" variant="ghost" onPress={() => { setEditingId(log.id); setForm({ source: log.source, locator: log.locator, url: log.url ?? '', studiedAt: log.studiedAt.slice(0, 10), result: log.result, comment: log.comment }); setShowForm(true); }} /><Button title="Excluir" variant="ghost" onPress={() => task.run(() => actions.deleteExternalQuestion(log.id, topic.id))} /></View>
      </View>)}
      {!logs.length && <Pill>NENHUMA QUESTÃO REGISTRADA</Pill>}
    </Card>
    {!!notice && <Txt accessibilityLiveRegion="polite" color={c.greenDark}>{notice}</Txt>}{task.error && <Txt accessibilityLiveRegion="polite" color={c.danger}>{task.error}</Txt>}
  </View>;
}
