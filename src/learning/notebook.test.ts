import type { ExternalQuestionLog } from './types';
import { removeExternalQuestion, upsertExternalQuestion, validateExternalQuestion } from './notebook';

const base: ExternalQuestionLog = {
  id: 'registro-1', version: 1, topicId: 'cytology', source: 'Livro de biologia', locator: 'p. 42, q. 7',
  studiedAt: '2026-09-20T12:00:00.000Z', result: 'incorrect', comment: 'Confundi membrana e parede celular.', updatedAt: '2026-09-20T12:00:00.000Z',
};

test('registro externo permite criar, editar e excluir apenas no tópico correspondente', () => {
  validateExternalQuestion(base);
  const created = upsertExternalQuestion([], base);
  const edited = upsertExternalQuestion(created, { ...base, result: 'correct', comment: 'Revisei a diferença.' }, true);
  expect(edited).toHaveLength(1);
  expect(edited[0].result).toBe('correct');
  expect(() => upsertExternalQuestion(created, { ...base, topicId: 'genetics' }, true)).toThrow('Registro não encontrado');
  expect(removeExternalQuestion(edited, base.id, 'genetics')).toEqual(edited);
  expect(removeExternalQuestion(edited, base.id, 'cytology')).toEqual([]);
});

test('caderno recusa link inválido e cópia evidente de enunciado', () => {
  expect(() => validateExternalQuestion({ ...base, url: 'javascript:alert(1)' })).toThrow();
  expect(() => validateExternalQuestion({ ...base, comment: `${'Texto de questão. '.repeat(11)}Qual a alternativa correta?` })).toThrow();
  expect(() => validateExternalQuestion({ ...base, comment: 'A) alternativa\nB) alternativa' })).toThrow();
});
