import { AffectiveCheckIn, AttemptEvent, BattlePlan, NextMonsterDecision } from '@/learning/types';
export interface BattleState {
  decision: NextMonsterDecision; plan: BattlePlan;
  phase: 'check-in' | 'barrier' | 'intervention' | 'lesson' | 'question' | 'feedback' | 'repair' | 'complete';
  checkIn?: AffectiveCheckIn; blockIndex: number; questionIndex: number; revealed: boolean;
  attempts: AttemptEvent[]; startedAt: string; activeMs?: number;
  repaired?: boolean; repairSelection?: number | null;
}
export type BattleAction =
  | { type: 'CHECK_IN'; checkIn: AffectiveCheckIn }
  | { type: 'PLAN'; plan: BattlePlan; checkIn: AffectiveCheckIn }
  | { type: 'BEGIN' } | { type: 'REVEAL' } | { type: 'NEXT' }
  | { type: 'START_REPAIR' }
  | { type: 'ANSWER'; attempt: AttemptEvent }
  | { type: 'REPAIR_ANSWER'; correct: boolean; chosenIndex: number };
export function battleReducer(state: BattleState, action: BattleAction): BattleState {
  switch (action.type) {
    case 'CHECK_IN': return state.phase === 'check-in' ? { ...state, checkIn: action.checkIn, phase: action.checkIn.feeling === 'confident' ? 'intervention' : 'barrier' } : state;
    case 'PLAN': return ['barrier', 'intervention'].includes(state.phase) ? { ...state, plan: action.plan, checkIn: action.checkIn, phase: 'intervention' } : state;
    case 'BEGIN': return state.phase === 'intervention' ? { ...state, phase: state.plan.blocks.length ? 'lesson' : 'question' } : state;
    case 'REVEAL': return state.phase === 'lesson' ? { ...state, revealed: true } : state;
    case 'ANSWER': return state.phase === 'question' && action.attempt.questionId === state.plan.questionIds[state.questionIndex] ? { ...state, phase: 'feedback', attempts: [...state.attempts, action.attempt], repaired: false, repairSelection: null } : state;
    case 'START_REPAIR': return state.phase === 'feedback' ? { ...state, phase: 'repair', repairSelection: null } : state;
    case 'REPAIR_ANSWER':
      if (state.phase !== 'repair') return state;
      if (action.correct) {
        const last = state.attempts.at(-1);
        const attempts = last ? [...state.attempts.slice(0, -1), { ...last, repaired: true }] : state.attempts;
        return { ...state, repaired: true, repairSelection: action.chosenIndex, attempts };
      }
      return { ...state, repaired: false, repairSelection: action.chosenIndex };
    case 'NEXT':
      if (state.phase === 'lesson') {
        if (state.plan.blocks[state.blockIndex].kind === 'recall' && !state.revealed) return state;
        return state.blockIndex + 1 < state.plan.blocks.length ? { ...state, blockIndex: state.blockIndex + 1, revealed: false } : { ...state, phase: 'question' };
      }
      if (state.phase === 'feedback' || state.phase === 'repair') {
        return state.questionIndex + 1 < state.plan.questionIds.length ? { ...state, questionIndex: state.questionIndex + 1, phase: 'question', repaired: false, repairSelection: null } : { ...state, phase: 'complete' };
      }
      return state;
  }
}
