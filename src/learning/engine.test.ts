import { buildBattlePlan, buildRepairChallenge, calculateRetention, DAY, effectiveScore, emptyMasteries, intervention, isDue, prerequisitesMet, scheduleReview, selectNextMonster, updateMastery } from './engine';
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
    expect(selectNextMonster(m, NOW)?.topicId).toBe('proportions');
    m.proportions = { ...m.proportions, score: .8, evidence: 3 };
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
    const m = emptyMasteries(); m.proportions.deferredAt = NOW;
    expect(selectNextMonster(m, NOW)?.topicId).toBe('cytology');
    expect(selectNextMonster(m, later(1))?.topicId).toBe('proportions');
  });
  test('preserva uma batalha ativa apesar de outras prioridades', () => {
    expect(selectNextMonster(emptyMasteries(), NOW, 'cytology')?.topicId).toBe('cytology');
  });
  test('ansiedade encurta a batalha e não altera domínio', () => {
    const m = emptyMasteries(); const snapshot = JSON.stringify(m); const decision = selectNextMonster(m, NOW)!;
    const checkIn = { topicId: decision.topicId, feeling: 'anxious' as const, barrier: 'difficulty' as const, at: NOW };
    const plan = buildBattlePlan('1', decision, checkIn);
    expect(plan.estimatedMinutes).toBe(5); expect(plan.questionIds).toHaveLength(2);
    expect(JSON.stringify(m)).toBe(snapshot); expect(intervention(checkIn, m.proportions)).toContain('cinco minutos');
  });
  test('prática e revisão usam bancos diferentes', () => {
    const d = selectNextMonster(emptyMasteries(), NOW)!;
    const p = buildBattlePlan('1', d); const r = buildBattlePlan('2', { ...d, review: true });
    expect(p.questionIds.every(id => questionById(id).purpose === 'practice')).toBe(true);
    expect(r.questionIds.every(id => questionById(id).purpose === 'review')).toBe(true);
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
describe('diagnóstico adaptativo', () => {
  function simulate(correct: (n: number) => boolean) {
    const result: AttemptEvent[] = [];
    for (let i = 0; i < 25; i++) { const q = nextDiagnosticQuestion(result); if (!q) break; result.push({ id: String(i), questionId: q.id, topicId: q.topicId, answer: correct(i) ? q.answer : -1, correct: correct(i), assisted: false, source: 'diagnostic', at: NOW }); }
    return result;
  }
  test('termina em 12–20 questões, sem repetições, e distingue perfis', () => {
    for (const profile of [() => true, () => false, (n: number) => n % 2 === 0]) {
      const a = simulate(profile); expect(a.length).toBeGreaterThanOrEqual(12); expect(a.length).toBeLessThanOrEqual(20);
      expect(new Set(a.map(a => a.questionId)).size).toBe(a.length);
      const evalMap = evaluateDiagnostic(a);
      for (const id of DIAGNOSTIC_GATEWAY_IDS) expect(evalMap[id].evidence).toBeGreaterThanOrEqual(3);
    }
    expect(evaluateDiagnostic(simulate(() => true)).proportions.score).toBe(1);
    expect(evaluateDiagnostic(simulate(() => false)).proportions.score).toBe(0);
    expect(evaluateDiagnostic(simulate(() => true)).proportions.stage).toBe('unseen');
  });
  test('escolhe dificuldades distintas após acerto ou erro', () => {
    const a = simulate(() => true); const b = simulate(() => false);
    expect(a.map(a => a.questionId)).not.toEqual(b.map(a => a.questionId));
  });
});
test('catálogo editorial íntegro e sem alternativas duplicadas', () => {
  const ids = new Set<string>();
  for (const t of TOPICS) for (const q of t.questions) {
    expect(ids.has(q.id)).toBe(false); ids.add(q.id);
    expect(q.answer).toBeGreaterThanOrEqual(0); expect(q.answer).toBeLessThan(q.options.length);
    expect(new Set(q.options).size).toBe(q.options.length); expect(q.explanation.length).toBeGreaterThan(15);
  }
  expect(ids.size).toBe(198);
});
