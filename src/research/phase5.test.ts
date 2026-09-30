import { aggregateItemErrors, assignedArm, calibrationReadiness, evaluatePolicyExperiment, incidenceByExam, type CodedExamItem, type ExperimentParticipant, type ResearchAttempt } from './phase5';

const examItem = (number: number, topicId: string | null = 'cytology'): CodedExamItem => ({
  number, reviewerA: { id: 'editor-a', topicId }, reviewerB: { id: 'editor-b', topicId },
});

test('incidência exige corpus completo, dupla codificação e adjudicação de divergências', () => {
  const exam = { id: '2025-regular-natureza', year: 2025, application: 'regular', area: 'natureza',
    sourceUrl: 'https://www.gov.br/inep/provas-e-gabaritos', expectedItemCount: 2,
    items: [examItem(91), examItem(92, null)] };
  expect(incidenceByExam([exam])[0]).toMatchObject({ denominator: 2, unclassified: 1,
    topics: { cytology: { count: 1, share: .5 } } });
  expect(() => incidenceByExam([{ ...exam, items: [examItem(91)] }])).toThrow('Corpus incompleto');
  expect(() => incidenceByExam([{ ...exam, items: [examItem(91), { ...examItem(92), reviewerB: { id: 'editor-b', topicId: 'genetics' } }] }]))
    .toThrow('Divergência sem adjudicação');
  expect(() => incidenceByExam([exam, exam])).toThrow('Corpus incompleto ou duplicado');
  expect(() => incidenceByExam([{ ...exam, sourceUrl: 'https://example.com/exam' }])).toThrow('Corpus incompleto');
});

test('erros agregados usam primeira tentativa independente, versão e mínimo de participantes', () => {
  const attempts: ResearchAttempt[] = Array.from({ length: 35 }, (_, i) => ({
    participantId: `p-${i}`, questionId: 'q-1', itemVersion: 2, source: 'practice', assisted: false,
    correct: i >= 12, at: '2026-09-01T00:00:00.000Z',
  }));
  attempts.push({ ...attempts[0], correct: true, at: '2026-09-02T00:00:00.000Z' });
  attempts.push({ ...attempts[0], participantId: 'extra', assisted: true });
  attempts.push({ ...attempts[0], participantId: 'old-version', itemVersion: 1 });
  attempts.push({ ...attempts[0], participantId: 'unknown-version', itemVersion: null });
  const result = aggregateItemErrors(attempts);
  expect(result.released).toEqual([{ questionId: 'q-1', itemVersion: 2, source: 'practice', participants: 35, errorRate: 12 / 35 }]);
  expect(result.suppressedGroups).toBe(1);
  expect(result.missingVersion).toBe(1);
  expect(() => aggregateItemErrors(attempts, 5)).toThrow('Mínimo');
  expect(calibrationReadiness(attempts).readyForExpertReview).toBe(false);
});

test('experimento mantém política de base sem dados e só libera revisão após ganho e guardrails', () => {
  const plan = { id: 'policy-v2', minPerArm: 30, maxComprehensionDrop: .05, maxReturnDrop: .05 };
  expect(evaluatePolicyExperiment(plan, [])).toMatchObject({ ready: false, decision: 'keep-baseline' });
  const people: ExperimentParticipant[] = [];
  const indexes = { baseline: 0, candidate: 0 };
  for (let i = 0; indexes.baseline < 1000 || indexes.candidate < 1000; i++) {
    const id = `p-${i}`, arm = assignedArm(plan.id, id);
    if (indexes[arm] >= 1000) continue;
    const position = indexes[arm]++;
    people.push({ id, arm, entryOpened: true, firstSessionCompleted: position < (arm === 'baseline' ? 300 : 800),
      returnedWithin7Days: position < (arm === 'baseline' ? 700 : 900),
      independentCorrect: position < (arm === 'baseline' ? 700 : 900) ? 5 : 2, independentTotal: 5 });
  }
  expect(evaluatePolicyExperiment(plan, people)).toMatchObject({ ready: true, decision: 'candidate-eligible-for-review' });
  expect(evaluatePolicyExperiment(plan, people.map(p => p.arm === 'candidate' ? { ...p, independentCorrect: 0 } : p)).decision)
    .toBe('keep-baseline');
  expect(() => evaluatePolicyExperiment(plan, [{ ...people[0], arm: people[0].arm === 'baseline' ? 'candidate' : 'baseline' }]))
    .toThrow('Atribuição experimental divergente');
});
