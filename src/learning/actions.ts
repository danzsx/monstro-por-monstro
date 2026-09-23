import { randomUUID } from 'expo-crypto';
import { useApp } from '@/data/provider';
import { questionById } from '@/content/catalog';
import { battleReducer, BattleAction, BattleState } from '@/battle/machine';
import { evaluateDiagnostic, nextDiagnosticQuestion } from '@/diagnostic/engine';
import { AffectiveCheckIn, AnalyticsEvent, AttemptEvent, NextMonsterDecision, StudentModel } from './types';
import { buildBattlePlan, DAY, selectNextMonster, updateMastery } from './engine';
const timestamp = () => new Date().toISOString();
export function useActions() {
  const { commit } = useApp();
  return {
    saveStudent: (student: StudentModel) => commit(s => ({ ...s, student })),
    answerDiagnostic: (questionId: string, answer: number) => {
      const question = questionById(questionId); const at = timestamp();
      const attempt: AttemptEvent = { id: randomUUID(), topicId: question.topicId, questionId, answer, correct: answer === question.answer, assisted: false, at, source: 'diagnostic' };
      return commit(s => {
        if (s.diagnosticCompletedAt || nextDiagnosticQuestion(s.diagnosticAttempts)?.id !== questionId) return s;
        const diagnosticAttempts = [...s.diagnosticAttempts, attempt];
        const done = !nextDiagnosticQuestion(diagnosticAttempts);
        const event: AnalyticsEvent = { id: randomUUID(), name: 'diagnostic_completed', at };
        return { ...s, diagnosticAttempts, ...(done ? { diagnosticCompletedAt: at, masteries: evaluateDiagnostic(diagnosticAttempts), analytics: [...s.analytics, event] } : {}) };
      }, [{ id: attempt.id, kind: 'attempt', at, payload: attempt }]);
    },
    startBattle: (decision: NextMonsterDecision, micro = false) => {
      const at = timestamp(); const id = randomUUID();
      const event: AnalyticsEvent = { id: randomUUID(), name: 'battle_started', at, topicId: decision.topicId };
      return commit(s => {
        if (s.activeBattle || !s.diagnosticCompletedAt) return s;
        const currentMastery = s.masteries[decision.topicId] ?? { topicId: decision.topicId, score: 0, evidence: 0, encountered: false, stage: 'unseen', reviewLevel: 0 };
        const battle: BattleState = { decision, plan: buildBattlePlan(id, decision, undefined, micro, s.attempts), phase: 'check-in', blockIndex: 0, questionIndex: 0, revealed: false, attempts: [], startedAt: at };
        return { ...s, activeBattle: battle, masteries: { ...s.masteries, [decision.topicId]: { ...currentMastery, encountered: true, stage: currentMastery.stage === 'unseen' ? 'learning' : currentMastery.stage } }, analytics: [...s.analytics, event] };
      }, [{ id: event.id, kind: 'analytics', at, payload: event }]);
    },
    battleAction: (action: BattleAction) => commit(s => s.activeBattle ? { ...s, activeBattle: battleReducer(s.activeBattle, action) } : s),
    setIntervention: (checkIn: AffectiveCheckIn) => {
      const id = randomUUID();
      return commit(s => {
        if (!s.activeBattle) return s;
        const plan = buildBattlePlan(s.activeBattle.plan.id, s.activeBattle.decision, checkIn, s.activeBattle.plan.mode === 'micro', s.attempts);
        return { ...s, checkIns: [...s.checkIns, checkIn], activeBattle: battleReducer(s.activeBattle, { type: 'PLAN', checkIn, plan }) };
      }, [{ id, kind: 'affective', at: checkIn.at, payload: checkIn }]);
    },
    answerBattle: (questionId: string, answer: number) => {
      const question = questionById(questionId); const at = timestamp(); const id = randomUUID();
      return commit(s => {
        const b = s.activeBattle;
        if (!b || b.phase !== 'question' || b.plan.questionIds[b.questionIndex] !== questionId) return s;
        const attempt: AttemptEvent = { id, questionId, topicId: question.topicId, answer, correct: answer === question.answer, assisted: false, at, battleId: b.plan.id, source: b.decision.review ? 'review' : 'practice' };
        return { ...s, activeBattle: battleReducer(b, { type: 'ANSWER', attempt }) };
      });
    },
    startRepair: () => commit(s => s.activeBattle ? { ...s, activeBattle: battleReducer(s.activeBattle, { type: 'START_REPAIR' }) } : s),
    answerRepair: (correct: boolean, chosenIndex: number) => commit(s => s.activeBattle ? { ...s, activeBattle: battleReducer(s.activeBattle, { type: 'REPAIR_ANSWER', correct, chosenIndex }) } : s),
    finishBattle: () => {
      const at = timestamp();
      return commit(s => {
        const battle = s.activeBattle;
        if (!battle || battle.phase !== 'complete' || s.completedBattles.includes(battle.plan.id)) return s;
        const topicId = battle.plan.topicId;
        const currentMastery = s.masteries[topicId] ?? { topicId, score: 0, evidence: 0, encountered: false, stage: 'unseen', reviewLevel: 0 };
        const event: AnalyticsEvent = { id: randomUUID(), name: 'battle_completed', at, topicId };
        return { ...s, masteries: { ...s.masteries, [topicId]: updateMastery(currentMastery, battle.attempts, at) }, attempts: [...s.attempts, ...battle.attempts], completedBattles: [...s.completedBattles, battle.plan.id], firstBattleCompletedAt: s.firstBattleCompletedAt ?? at, lastTopic: topicId, activeBattle: null, analytics: [...s.analytics, event] };
      });
    },
    defer: () => {
      const at = timestamp();
      return commit(s => {
        const decision = selectNextMonster(s.masteries, at, s.activeBattle?.plan.topicId, s.lastTopic);
        if (!decision) return s;
        if (s.lastDeferredAt && Date.parse(at) - Date.parse(s.lastDeferredAt) < DAY) {
          if (s.activeBattle && s.activeBattle.phase !== 'check-in') return s;
          const plan = buildBattlePlan(s.activeBattle?.plan.id ?? randomUUID(), decision, undefined, true, s.attempts);
          return { ...s, activeBattle: { decision, plan, phase: 'check-in', blockIndex: 0, questionIndex: 0, revealed: false, attempts: [], startedAt: at } };
        }
        if (s.activeBattle && s.activeBattle.attempts.length) return s;
        return { ...s, activeBattle: null, lastDeferredAt: at, masteries: { ...s.masteries, [decision.topicId]: { ...s.masteries[decision.topicId], deferredAt: at } } };
      });
    },
    recordReturn: () => {
      const at = timestamp();
      return commit(s => {
        if (!s.firstBattleCompletedAt || s.analytics.some(e => e.name === 'returned_within_7_days')) return s;
        const elapsed = Date.parse(at) - Date.parse(s.firstBattleCompletedAt);
        if (elapsed < DAY || elapsed > DAY * 7) return s;
        return { ...s, lastSeenAt: at, analytics: [...s.analytics, { id: randomUUID(), name: 'returned_within_7_days', at }] };
      });
    },
  };
}
