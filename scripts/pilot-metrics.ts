import { readFileSync } from 'node:fs';
import { dirname, resolve, sep } from 'node:path';
import { pilotMetrics } from '../src/pilot/metrics';
import type { AppState } from '../src/data/state';

const manifestPath = process.argv[2];
if (!manifestPath) throw new Error('Uso: npm run pilot:metrics -- caminho/manifest.json');
const manifest = JSON.parse(readFileSync(resolve(manifestPath), 'utf8')) as { consentConfirmed?: boolean; files?: string[] };
if (manifest.consentConfirmed !== true || !Array.isArray(manifest.files)) throw new Error('Manifesto requer consentConfirmed: true e files.');
const root = dirname(resolve(manifestPath));
const states = manifest.files.map(file => {
  const path = resolve(root, file);
  if (!path.startsWith(root + sep)) throw new Error('Arquivo fora da pasta do manifesto.');
  const input = JSON.parse(readFileSync(path, 'utf8')) as AppState | { state: AppState };
  const state = 'state' in input ? input.state : input;
  if (![1, 2].includes(state.version) || !Array.isArray(state.analytics)) throw new Error('Exportação inválida.');
  return state;
});
if (states.length < 5) throw new Error('Amostra menor que cinco: nenhum agregado será exibido.');
console.log(JSON.stringify(pilotMetrics(states, new Date().toISOString()), null, 2));
