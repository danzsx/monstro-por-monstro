import { buildBattlePlan, buildRepairChallenge, calculateRetention, DAY, effectiveScore, emptyMasteries, intervention, isDue, prerequisitesMet, questionForPlan, scheduleReview, selectNextMonster, updateMastery } from './engine';
import { evaluateDiagnostic, nextDiagnosticQuestion, DIAGNOSTIC_GATEWAY_IDS } from '@/diagnostic/engine';
import { TOPICS, questionById } from '@/content/catalog';
import { AttemptEvent, TopicId } from './types';
const NOW = '2026-09-21T12:00:00.000Z';
const later = (days: number) => new Date(Date.parse(NOW) + DAY * days).toISOString();
function attempts(count: number, source: 'practice' | 'review' = 'practice', topicId: TopicId = 'proportions', at = NOW): AttemptEvent[] {
  return Array.from({ length: count }, (_, i) => ({ id: `${source}-${i}`, questionId: `${topicId}-${i + (source === 'review' ? 12 : 6)}`, topicId, correct: true, assisted: false, at, answer: 0, source }));
}
describe('motor de aprendizagem', () => {
  test('pré-requisitos bloqueiam seleção até haver evidência suficiente', () => {
    const m = emptyMasteries(); expect(prerequisitesMet('rule-of-three', m)).toBe(false);
    expect(prerequisitesMet('genetics', m)).toBe(false);
    const first = selectNextMonster(m, NOW);
    expect(first).not.toBeNull();
    expect(prerequisitesMet(first!.topicId, m)).toBe(true);
    m.proportions = { ...m.proportions, score: .8, evidence: 3 };
    expect(prerequisitesMet('rule-of-three', m)).toBe(false);
    m.proportions.firstClearedAt = NOW;
    expect(prerequisitesMet('rule-of-three', m)).toBe(true);
  });
  test('acertos imediatos não bastam; revisão após 24h concede domínio', () => {
    const first = updateMastery(emptyMasteries().proportions, attempts(5), NOW);
    expect(first.stage).toBe('consolidating'); expect(first.nextReviewAt).toBe(later(1));
    expect(updateMastery(first, attempts(5, 'review'), later(.5)).stage).not.toBe('mastered');
    const reviewed = updateMastery(first, attempts(5, 'review', 'proportions', later(1)), later(1));
    expect(reviewed.stage).toBe('mastered'); expect(reviewed.nextReviewAt).toBe(later(4));
  });
  test('microbatalhas acumulam evidências distintas sem exigir sessões longas', () => {
    const all = attempts(6);
    let m = updateMastery(emptyMasteries().proportions, all.slice(0, 2), NOW);
    expect(m.stage).toBe('learning');
    m = updateMastery(m, all.slice(2, 4), NOW); expect(m.stage).toBe('learning');
    m = updateMastery(m, all.slice(4), NOW); expect(m.stage).toBe('consolidating');
  });
  test('questões repetidas e respostas assistidas não simulam evidência independente', () => {
    expect(updateMastery(emptyMasteries().proportions, Array(5).fill(attempts(1)[0]), NOW).stage).toBe('learning');
    expect(updateMastery(emptyMasteries().proportions, attempts(5).map(a => ({ ...a, assisted: true })), NOW).stage).toBe('learning');
  });
  test('revisão vencida volta, e conteúdos consolidados aguardam o intervalo', () => {
    const m = emptyMasteries(); m.proportions = updateMastery(m.proportions, attempts(5), NOW);
    expect(selectNextMonster(m, NOW)?.topicId).not.toBe('proportions');
    expect(selectNextMonster(m, later(2))?.topicId).toBe('proportions');
    expect(isDue(m.proportions, later(1))).toBe(true);
  });
  test('um adiamento muda a prioridade por até 24h; não apaga a necessidade', () => {
    const m = emptyMasteries();
    const first = selectNextMonster(m, NOW)!.topicId;
    m[first].deferredAt = NOW;
    expect(selectNextMonster(m, NOW)?.topicId).not.toBe(first);
    expect(selectNextMonster(m, later(1))?.topicId).toBe(first);
  });
  test('preserva uma batalha ativa apesar de outras prioridades', () => {
    expect(selectNextMonster(emptyMasteries(), NOW, 'cytology')?.topicId).toBe('cytology');
  });
  test('ansiedade preserva a teoria e o tempo escolhido sem alterar domínio', () => {
    const m = emptyMasteries(); const snapshot = JSON.stringify(m); const decision = selectNextMonster(m, NOW)!;
    const checkIn = { topicId: decision.topicId, feeling: 'anxious' as const, barrier: 'difficulty' as const, at: NOW };
    const plan = buildBattlePlan('1', decision, checkIn);
    expect(plan.estimatedMinutes).toBe(15); expect(plan.questionIds).toHaveLength(3); expect(plan.blocks.length).toBeGreaterThan(0);
    const short = buildBattlePlan('short', decision, checkIn, true);
    expect(short.estimatedMinutes).toBe(5); expect(short.questionIds).toHaveLength(1); expect(short.blocks.length).toBeGreaterThan(0);
    expect(JSON.stringify(m)).toBe(snapshot); expect(intervention(checkIn, m.proportions)).toContain('cinco minutos');
  });
  test('intervenção emocional cita monstros já dominados quando há resistência', () => {
    const m = emptyMasteries();
    m.proportions = { ...m.proportions, stage: 'mastered', score: 1 };
    m.cytology = { ...m.cytology, stage: 'mastered', score: 1 };
    const checkIn = { topicId: 'genetics' as const, feeling: 'avoid' as const, barrier: 'difficulty' as const, at: NOW };
    const text = intervention(checkIn, m.genetics, m);
    expect(text).toContain('Você já dominou');
    expect(text).toMatch(/Razões e proporções|Citologia/);
  });
  test('prática e revisão usam bancos diferentes', () => {
    const d = selectNextMonster(emptyMasteries(), NOW)!;
    const p = buildBattlePlan('1', d); const r = buildBattlePlan('2', { ...d, review: true });
    expect(p.questionIds.every(id => questionById(id).purpose === 'practice')).toBe(true);
    expect(r.questionIds.every(id => questionById(id).purpose === 'review')).toBe(true);
  });
  test('questão da sessão permanece estável após mudança do catálogo remoto', () => {
    const d = selectNextMonster(emptyMasteries(), NOW)!;
    const plan = buildBattlePlan('versioned', d);
    const snapshot = plan.questionSnapshots![0];
    expect(snapshot.version).toBe(plan.contentVersion);
    const changedLookup = () => ({ ...snapshot, prompt: 'Outro enunciado', answer: (snapshot.answer + 1) % snapshot.options.length, version: 99 });
    expect(questionForPlan(plan, snapshot.id, changedLookup)).toEqual(snapshot);
  });
  test('retorna vazio quando não há conteúdo elegível ou revisão vencida', () => {
    const m = emptyMasteries(); for (const t of TOPICS) m[t.id] = { ...m[t.id], score: 1, evidence: 5, stage: 'mastered', nextReviewAt: later(3) };
    expect(selectNextMonster(m, NOW)).toBeNull(); expect(scheduleReview(NOW, 99)).toBe(later(30));
  });
  test('curva contínua de esquecimento decai gradativamente após o prazo de revisão', () => {
    const m = emptyMasteries().proportions;
    expect(calculateRetention(m, NOW)).toBe(0);
    const scheduled = { ...m, encountered: true, score: 0.9, stage: 'mastered' as const, lastPracticedAt: NOW, nextReviewAt: later(3) };
    expect(calculateRetention(scheduled, NOW)).toBe(1);
    expect(calculateRetention(scheduled, later(1.5))).toBeGreaterThan(0.85);
    expect(calculateRetention(scheduled, later(3))).toBe(0.85);
    const overdue = calculateRetention(scheduled, later(10));
    expect(overdue).toBeLessThan(0.85);
    expect(overdue).toBeGreaterThanOrEqual(0.1);
    expect(effectiveScore(scheduled, later(10))).toBe(Math.round(0.9 * overdue * 100) / 100);
  });
  test('gerador de reparação cria desafio conceitual consistente e focado', () => {
    const q = questionById('proportions-6');
    const challenge = buildRepairChallenge(q);
    expect(challenge.prompt).toBeTruthy();
    expect(challenge.options).toHaveLength(2);
    expect(challenge.options[challenge.answer]).toContain(q.options[q.answer]);
    expect(challenge.insight).toBe(q.explanation);
  });
});
describe('diagnóstico opcional de familiaridade', () => {
  function simulate(correct: (n: number) => boolean) {
    const result: AttemptEvent[] = [];
    for (let i = 0; i < 25; i++) { const q = nextDiagnosticQuestion(result); if (!q) break; result.push({ id: String(i), questionId: q.id, topicId: q.topicId, answer: correct(i) ? q.answer : -1, correct: correct(i), assisted: false, source: 'diagnostic', at: NOW }); }
    return result;
  }
  test('oferece uma pergunta por tópico e não converte autorrelatos legados em domínio', () => {
    for (const profile of [() => true, () => false, (n: number) => n % 2 === 0]) {
      const a = simulate(profile); expect(a).toHaveLength(4);
      expect(new Set(a.map(a => a.questionId)).size).toBe(a.length);
      const evalMap = evaluateDiagnostic(a);
      for (const id of DIAGNOSTIC_GATEWAY_IDS) { expect(evalMap[id].evidence).toBe(0); expect(evalMap[id].score).toBe(0); }
    }
    expect(evaluateDiagnostic(simulate(() => true)).proportions.stage).toBe('unseen');
  });
  test('pode ser interrompido e retomado sem repetir tópico', () => {
    const first = simulate(() => true).slice(0, 2);
    expect(nextDiagnosticQuestion(first)?.topicId).toBe('cytology');
    expect(nextDiagnosticQuestion(simulate(() => true))).toBeNull();
  });
});
test('catálogo editorial íntegro e sem alternativas duplicadas', () => {
  const ids = new Set<string>();
  for (const t of TOPICS) for (const q of t.questions) {
    expect(ids.has(q.id)).toBe(false); ids.add(q.id);
    expect(q.answer).toBeGreaterThanOrEqual(0); expect(q.answer).toBeLessThan(q.options.length);
    expect(new Set(q.options).size).toBe(q.options.length); expect(q.explanation.length).toBeGreaterThan(15);
  }
  expect(ids.size).toBe(TOPICS.reduce((total, topic) => total + topic.questions.length, 0));
});
