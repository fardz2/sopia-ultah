import type { BufferGeometry } from 'three';
import type { WorldResources } from './resources';
import { modelManifest } from './modelManifest';
export type WorldAssets = Map<string, BufferGeometry>;
export async function loadWorldAssets(resources: WorldResources, signal: AbortSignal): Promise<WorldAssets> {
  const result: WorldAssets = new Map();
  await Promise.all(modelManifest.map(async ({name,url}) => {
    const controller = new AbortController();
    const cancel = () => controller.abort();
    signal.addEventListener('abort', cancel, { once: true });
    if (signal.aborted) cancel();
    const timer = setTimeout(cancel, 5000);
    try { result.set(name, await resources.loadGeometry(url, controller.signal)); }
    catch { /* Decorative CAD parts have geometry substitutes. */ }
    finally { clearTimeout(timer); signal.removeEventListener('abort',cancel); }
  }));
  return result;
}
