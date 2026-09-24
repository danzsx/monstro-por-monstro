export const FIGURE_LABELS = {
  'cell-types': 'Três jeitos de organizar uma célula',
  'membrane-transport': 'A portaria da membrana',
  osmosis: 'Laboratório de osmose',
  'cell-workflow': 'Energia e instruções em movimento',
} as const;

export type FigureId = keyof typeof FIGURE_LABELS;
export type ModuleBlock =
  | { id: string; kind: 'text'; title: string; body: string }
  | { id: string; kind: 'analogy'; title: string; body: string; limit: string }
  | { id: string; kind: 'list'; title: string; items: string[] }
  | { id: string; kind: 'figure'; title: string; figureId: FigureId; caption: string }
  | { id: string; kind: 'check'; prompt: string; options: [string, string, string, string]; answer: number; explanation: string };

export type ModuleSection = { id: string; title: string; objective: string; blocks: ModuleBlock[] };
export type InteractiveModule = {
  schemaVersion: 1;
  topicId: string;
  title: string;
  intro: string;
  sections: ModuleSection[];
};

const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const filled = (value: unknown): value is string => typeof value === 'string' && !!value.trim();

export function validateInteractiveModule(value: unknown, expectedTopicId?: string): string[] {
  const issues: string[] = [];
  if (!record(value)) return ['A apostila deve ser um objeto.'];
  if (value.schemaVersion !== 1) issues.push('Versão de formato inválida.');
  if (!filled(value.topicId) || (expectedTopicId && value.topicId !== expectedTopicId)) issues.push('Vínculo com o tópico inválido.');
  if (!filled(value.title)) issues.push('Informe o título da apostila.');
  if (!filled(value.intro)) issues.push('Informe a introdução da apostila.');
  if (!Array.isArray(value.sections) || !value.sections.length) return [...issues, 'Adicione pelo menos uma etapa.'];
  const sectionIds = new Set<string>();
  value.sections.forEach((section: unknown, sectionIndex: number) => {
    const name = `Etapa ${sectionIndex + 1}`;
    if (!record(section)) { issues.push(`${name}: dados inválidos.`); return; }
    if (!filled(section.id) || sectionIds.has(section.id)) issues.push(`${name}: ID vazio ou repetido.`);
    else sectionIds.add(section.id);
    if (!filled(section.title) || !filled(section.objective)) issues.push(`${name}: informe título e objetivo.`);
    if (!Array.isArray(section.blocks) || !section.blocks.length) { issues.push(`${name}: adicione pelo menos um cartão.`); return; }
    const blockIds = new Set<string>();
    section.blocks.forEach((block: unknown, blockIndex: number) => {
      const label = `${name}, cartão ${blockIndex + 1}`;
      if (!record(block)) { issues.push(`${label}: dados inválidos.`); return; }
      if (!filled(block.id) || blockIds.has(block.id)) issues.push(`${label}: ID vazio ou repetido.`);
      else blockIds.add(block.id);
      switch (block.kind) {
        case 'text':
          if (!filled(block.title) || !filled(block.body)) issues.push(`${label}: informe título e texto.`);
          break;
        case 'analogy':
          if (!filled(block.title) || !filled(block.body) || !filled(block.limit)) issues.push(`${label}: complete a analogia e seu limite.`);
          break;
        case 'list':
          if (!filled(block.title) || !Array.isArray(block.items) || !block.items.length || block.items.some(item => !filled(item))) issues.push(`${label}: informe título e itens.`);
          break;
        case 'figure':
          if (!filled(block.title) || !filled(block.caption) || !filled(block.figureId) || !(block.figureId in FIGURE_LABELS)) issues.push(`${label}: escolha um diagrama e informe a legenda.`);
          break;
        case 'check':
          if (!filled(block.prompt) || !Array.isArray(block.options) || block.options.length !== 4 || block.options.some(option => !filled(option)) || !Number.isInteger(block.answer) || (block.answer as number) < 0 || (block.answer as number) > 3 || !filled(block.explanation)) issues.push(`${label}: complete enunciado, quatro alternativas, gabarito e explicação.`);
          else if (new Set(block.options.map(option => (option as string).trim().toLocaleLowerCase('pt-BR'))).size !== 4) issues.push(`${label}: as alternativas não podem se repetir.`);
          break;
        default: issues.push(`${label}: tipo de cartão desconhecido.`);
      }
    });
  });
  return issues;
}

export function parseInteractiveModule(value: unknown, expectedTopicId?: string): InteractiveModule | null {
  return validateInteractiveModule(value, expectedTopicId).length ? null : value as InteractiveModule;
}
