import { CYTOLOGY_MODULE } from './cytology';
import { COVALENT_BONDS_MODULE } from './covalent-bonds';
import { parseInteractiveModule, type InteractiveModule } from '../../shared/interactive-module';

export const bundledModule = (topicId: string): InteractiveModule | null => {
  if (topicId === 'cytology') return CYTOLOGY_MODULE;
  if (topicId === 'covalent-bonds') return COVALENT_BONDS_MODULE;
  return null;
};

export function selectInteractiveModule(topicId: string, remote: unknown, online: boolean): InteractiveModule | null {
  if (online) {
    const published = parseInteractiveModule(remote, topicId);
    if (published) return published;
  }
  return bundledModule(topicId);
}
