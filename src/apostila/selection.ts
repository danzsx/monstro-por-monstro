import { CYTOLOGY_MODULE } from './cytology';
import { parseInteractiveModule, type InteractiveModule } from '../../shared/interactive-module';

export const bundledModule = (topicId: string): InteractiveModule | null => topicId === 'cytology' ? CYTOLOGY_MODULE : null;

export function selectInteractiveModule(topicId: string, remote: unknown, online: boolean): InteractiveModule | null {
  if (online) {
    const published = parseInteractiveModule(remote, topicId);
    if (published) return published;
  }
  return bundledModule(topicId);
}
