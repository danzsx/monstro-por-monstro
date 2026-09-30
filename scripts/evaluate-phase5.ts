import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { aggregateItemErrors, calibrationReadiness, evaluatePolicyExperiment, incidenceByExam,
  type ExamBooklet, type ExperimentParticipant, type ExperimentPlan, type ResearchAttempt } from '../src/research/phase5';

const path = process.argv[2];
if (!path) {
  console.log(JSON.stringify({ status: 'awaiting-pilot', policyInUse: 'evidence-v1',
    missing: ['dados consentidos do piloto', 'corpus oficial codificado por dois revisores', 'experimento pré-registrado'] }, null, 2));
  process.exit(0);
}
const raw = readFileSync(resolve(path), 'utf8');
const input = JSON.parse(raw) as {
  dataOrigin?: string; consentConfirmed?: boolean; protocolId?: string;
  examBooklets?: ExamBooklet[]; itemAttempts?: ResearchAttempt[];
  experiment?: { plan: ExperimentPlan; people: ExperimentParticipant[]; preregisteredAt: string; enrollmentStartedAt: string };
};
if (input.dataOrigin !== 'observed' || input.consentConfirmed !== true || !input.protocolId)
  throw new Error('Análise exige protocolo, dados observados e consentimento confirmado.');
if (!Array.isArray(input.examBooklets ?? []) || !Array.isArray(input.itemAttempts ?? []) ||
  input.experiment && !Array.isArray(input.experiment.people)) throw new Error('Formato de dados inválido.');
if ((input.itemAttempts ?? []).some(attempt => !attempt.participantId || /[@\s]/.test(attempt.participantId)) ||
  (input.experiment?.people ?? []).some(person => !person.id || /[@\s]/.test(person.id)))
  throw new Error('Use apenas identificadores pseudônimos, sem e-mail ou espaço.');
const exams = incidenceByExam(input.examBooklets ?? []);
const areas = [...new Set(exams.map(exam => exam.area))];
const incidenceAreas = areas.map(area => ({ area,
  examinedEditions: new Set(exams.filter(exam => exam.area === area).map(exam => `${exam.year}/${exam.application}`)).size }));
const incidenceReady = incidenceAreas.length > 0 && incidenceAreas.every(area => area.examinedEditions >= 3);
const attempts = input.itemAttempts ?? [];
const errors = aggregateItemErrors(attempts);
const calibration = calibrationReadiness(attempts);
let experiment: { decision: string; ready: boolean; reason?: string } = { decision: 'keep-baseline', ready: false, reason: 'Sem experimento pré-registrado.' };
if (input.experiment) {
  const { plan, people, preregisteredAt, enrollmentStartedAt } = input.experiment;
  if (plan.id !== input.protocolId || !Number.isFinite(Date.parse(preregisteredAt)) ||
    !Number.isFinite(Date.parse(enrollmentStartedAt)) || Date.parse(preregisteredAt) >= Date.parse(enrollmentStartedAt))
    throw new Error('Pré-registro deve anteceder a inclusão de participantes e corresponder ao protocolo.');
  const result = evaluatePolicyExperiment(plan, people);
  experiment = { decision: result.decision, ready: result.ready,
    reason: result.ready ? undefined : 'Amostra ou janela de observação insuficiente em pelo menos um braço.' };
}
console.log(JSON.stringify({ protocolId: input.protocolId, inputSha256: createHash('sha256').update(raw).digest('hex'),
  policyInUse: 'evidence-v1', incidence: { readyForEditorialReview: incidenceReady, areas: incidenceAreas,
    perExam: incidenceReady ? exams : [] },
  itemErrors: { publishedGroups: errors.released, suppressedGroups: errors.suppressedGroups,
    attemptsMissingVersion: errors.missingVersion },
  calibration: calibration.readyForExpertReview ? calibration : { readyForExpertReview: false, reasons: calibration.reasons },
  experiment }, null, 2));
