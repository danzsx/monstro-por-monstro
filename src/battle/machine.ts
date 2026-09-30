import { AcquisitionRecord, AffectiveCheckIn, AttemptEvent, BattlePlan, NextMonsterDecision, RecallRecord } from '@/learning/types';
export type BattlePhase = 'check-in' | 'barrier' | 'time-choice' | 'intervention' | 'source-choice' | 'acquisition-external' | 'acquisition-interactive' | 'lesson' | 'recall' | 'mini-review' | 'question' | 'feedback' | 'repair' | 'complete' | 'paused';
export interface BattleState {
  decision: NextMonsterDecision; plan: BattlePlan;
  phase: BattlePhase;
  checkIn?: AffectiveCheckIn; blockIndex: number; questionIndex: number; revealed: boolean;
  attempts: AttemptEvent[]; startedAt: string; activeMs?: number;
  acquisition?: AcquisitionRecord; recall?: RecallRecord; recallActiveMs?: number;
  recallDraft?: string;
  resumePhase?: Exclude<BattlePhase, 'paused'>; pauseCount?: number;
  repaired?: boolean; repairSelection?: number | null;
}
export type BattleAction =
  | { type: 'OPEN_CHECK_IN' } | { type: 'SKIP_CHECK_IN' }
  | { type: 'CHECK_IN'; checkIn: AffectiveCheckIn }
  | { type: 'PLAN'; plan: BattlePlan; checkIn: AffectiveCheckIn }
  | { type: 'SELECT_TIME'; plan: BattlePlan }
  | { type: 'BEGIN' } | { type: 'REVEAL' } | { type: 'NEXT' }
  | { type: 'CHOOSE_SOURCE'; source: AcquisitionRecord['source']; label: string; at: string; url?: string; materialText?: string }
  | { type: 'COMPLETE_ACQUISITION'; at: string }
  | { type: 'REPORT_RECALL'; report: RecallRecord['report']; at: string }
  | { type: 'PAUSE' } | { type: 'RESUME' }
  | { type: 'START_REPAIR' }
  | { type: 'ANSWER'; attempt: AttemptEvent }
  | { type: 'REPAIR_ANSWER'; correct: boolean; chosenIndex: number };
export function battleReducer(state: BattleState, action: BattleAction): BattleState {
  switch (action.type) {
    case 'OPEN_CHECK_IN': return state.phase === 'intervention' ? { ...state, phase: 'check-in' } : state;
    case 'SKIP_CHECK_IN': return state.phase === 'check-in' ? { ...state, phase: 'time-choice' } : state;
    case 'CHECK_IN': return state.phase === 'check-in' ? { ...state, checkIn: action.checkIn, phase: 'time-choice' } : state;
    case 'PLAN': return ['barrier', 'intervention'].includes(state.phase) ? { ...state, plan: action.plan, checkIn: action.checkIn, phase: 'intervention' } : state;
    case 'SELECT_TIME': return state.phase === 'time-choice' ? { ...state, plan: action.plan, phase: action.plan.version === 2 && !state.decision.review ? 'source-choice' : 'intervention' } : state;
    case 'BEGIN': return state.phase === 'intervention' ? { ...state, phase: state.plan.version === 2 && !state.decision.review && state.plan.mode !== 'exam' ? 'source-choice' : state.plan.blocks.length ? 'lesson' : 'question' } : state;
    case 'CHOOSE_SOURCE':
      if (state.phase !== 'source-choice' || !action.label.trim()) return state;
      if (action.source === 'internal' && !state.plan.blocks.length) return state;
      return { ...state, acquisition: { source: action.source, label: action.label.trim(), selectedAt: action.at, ...(action.url ? { url: action.url } : {}), ...(action.materialText ? { materialText: action.materialText } : {}) }, phase: action.source === 'internal' ? 'lesson' : action.source === 'interactive' ? 'acquisition-interactive' : 'acquisition-external' };
    case 'COMPLETE_ACQUISITION':
      if (!state.acquisition || !(state.phase === 'acquisition-external' || state.phase === 'acquisition-interactive' || state.phase === 'lesson' && state.blockIndex === state.plan.blocks.length - 1)) return state;
      return { ...state, acquisition: { ...state.acquisition, completedAt: action.at }, phase: 'recall', revealed: false };
    case 'REPORT_RECALL':
      if (state.phase !== 'recall' || !state.acquisition?.completedAt) return state;
      return { ...state, recall: { report: action.report, at: action.at, activeMs: state.recallActiveMs ?? 0, ...(state.recallDraft?.trim() ? { text: state.recallDraft.trim() } : {}) }, phase: 'mini-review', revealed: false };
    case 'PAUSE': return state.phase === 'paused' || state.phase === 'complete' ? state : { ...state, resumePhase: state.phase, phase: 'paused', pauseCount: (state.pauseCount ?? 0) + 1 };
    case 'RESUME': return state.phase === 'paused' ? { ...state, phase: state.resumePhase ?? 'intervention', resumePhase: undefined } : state;
    case 'REVEAL': return state.phase === 'lesson' || state.phase === 'recall' ? { ...state, revealed: true } : state;
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
      if (state.phase === 'mini-review') return { ...state, phase: 'question' };
      if (state.phase === 'lesson') {
        const block = state.plan.blocks[state.blockIndex];
        if (!block || block.kind === 'recall' && !state.revealed) return state;
        return state.blockIndex + 1 < state.plan.blocks.length ? { ...state, blockIndex: state.blockIndex + 1, revealed: false } : state.plan.version === 2 ? state : { ...state, phase: 'question' };
      }
      if (state.phase === 'feedback' || state.phase === 'repair') {
        return state.questionIndex + 1 < state.plan.questionIds.length ? { ...state, questionIndex: state.questionIndex + 1, phase: 'question', repaired: false, repairSelection: null } : { ...state, phase: 'complete' };
      }
      return state;
  }
}
