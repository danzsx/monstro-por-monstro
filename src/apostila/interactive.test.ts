import { CYTOLOGY_MODULE } from './cytology';
import { bundledModule, selectInteractiveModule } from './selection';
import { describeOsmosis } from './osmosis';
import { parseInteractiveModule, validateInteractiveModule } from '../../shared/interactive-module';

test('a apostila autoral tem seis etapas, verificações e formato válido', () => {
  expect(CYTOLOGY_MODULE.sections).toHaveLength(6);
  expect(validateInteractiveModule(CYTOLOGY_MODULE)).toEqual([]);
  expect(CYTOLOGY_MODULE.sections.every(section => section.blocks.some(block => block.kind === 'check'))).toBe(true);
});

test('conteúdo inválido não substitui a apostila incluída no app', () => {
  expect(bundledModule('cytology')).toBe(CYTOLOGY_MODULE);
  expect(selectInteractiveModule('cytology', { schemaVersion: 99 }, true)).toBe(CYTOLOGY_MODULE);
  expect(selectInteractiveModule('cytology', null, false)).toBe(CYTOLOGY_MODULE);
  expect(parseInteractiveModule({ ...CYTOLOGY_MODULE, topicId: 'other' }, 'cytology')).toBeNull();
  expect(selectInteractiveModule('other', CYTOLOGY_MODULE, true)).toBeNull();
});

test('uma versão publicada válida aparece online e a versão local volta offline', () => {
  const remote = { ...CYTOLOGY_MODULE, title: 'Versão publicada' };
  expect(selectInteractiveModule('cytology', remote, true)).toBe(remote);
  expect(selectInteractiveModule('cytology', remote, false)).toBe(CYTOLOGY_MODULE);
});

test('o esquema de osmose distingue sentido da água e resposta celular', () => {
  expect(describeOsmosis('hypo', 'animal').direction).toBe('→');
  expect(describeOsmosis('hypo', 'plant').result).toMatch(/túrgida/);
  expect(describeOsmosis('hyper', 'plant').result).toMatch(/plasmólise/);
  expect(describeOsmosis('hyper', 'animal').direction).toBe('←');
  expect(describeOsmosis('iso', 'animal').label).toMatch(/Sem fluxo líquido/);
});
