import { AmbientLight, DirectionalLight, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { Resources } from './resources';
import { buildBook } from './bookScene';
import { buildGallery } from './galleryScene';
import { buildCandle } from './candleScene';
import type { CinemaDriver, CinemaMode, CinemaPhoto, Composition } from './types';

export async function createCinema(
  canvas: HTMLCanvasElement,
  mode: CinemaMode,
  photos: readonly CinemaPhoto[],
  onFailure: () => void,
  signal: AbortSignal,
): Promise<CinemaDriver> {
  if (signal.aborted) throw new DOMException('Scene disposed', 'AbortError');
  const resources = new Resources();
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setClearColor(0xece7dc, 0);
  const scene = new Scene(),
    camera = new PerspectiveCamera(35, 1, 0.1, 100);
  scene.add(new AmbientLight(0xfff7e8, 1.5));
  const light = new DirectionalLight(0xfff9ee, 2);
  light.position.set(-3, 5, 6);
  scene.add(light);
  let composition: Composition | undefined,
    disposed = false,
    paused = true,
    progress = 0,
    last = -1,
    aspect = 1;
  let rejectInitialization: ((reason: unknown) => void) | undefined;
  function render() {
    if (disposed || paused || !composition || last === progress) return;
    composition.update(progress, aspect);
    renderer.render(scene, camera);
    last = progress;
  }
  function resize() {
    if (disposed) return;
    const width = Math.max(1, canvas.clientWidth),
      height = Math.max(1, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, innerWidth <= 640 ? 1 : 1.35));
    renderer.setSize(width, height, false);
    aspect = width / height;
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    composition?.resize?.();
    last = -1;
    render();
  }
  function destroy() {
    if (disposed) return;
    disposed = true;
    signal.removeEventListener('abort', destroy);
    canvas.removeEventListener('webglcontextlost', lost);
    rejectInitialization?.(new DOMException('Scene disposed', 'AbortError'));
    rejectInitialization = undefined;
    resources.dispose();
    scene.clear();
    renderer.dispose();
    renderer.forceContextLoss();
  }
  function lost(event: Event) {
    event.preventDefault();
    destroy();
    onFailure();
  }
  canvas.addEventListener('webglcontextlost', lost);
  signal.addEventListener('abort', destroy, { once: true });
  try {
    composition = await new Promise<Composition>((resolve, reject) => {
      rejectInitialization = reject;
      if (mode === 'candle') resolve(buildCandle(scene, camera, resources));
      else {
        const building =
          mode === 'book'
            ? buildBook(scene, camera, resources, canvas)
            : buildGallery(scene, camera, resources, photos);
        building.then(resolve, reject);
      }
    });
    rejectInitialization = undefined;
    if (disposed) throw new Error('Scene disposed');
    resize();
  } catch (error) {
    destroy();
    throw error;
  }
  return {
    update(value) {
      progress = value;
      render();
    },
    resize,
    setPaused(value) {
      paused = value;
      if (!value) render();
    },
    destroy,
  };
}
