import { TextureLoader, SRGBColorSpace } from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { Resources } from '../cinema/resources';

export class WorldResources extends Resources {
  private closed = false;
  async loadTexture(url: string, signal: AbortSignal) {
    const texture = await new TextureLoader().loadAsync(url);
    if (signal.aborted || this.closed) { texture.dispose(); throw new DOMException('Disposed','AbortError'); }
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = 4;
    return this.texture(texture);
  }
  async loadGeometry(url: string, signal: AbortSignal) {
    const response = await fetch(url, { signal });
    if (!response.ok) throw new Error('Model unavailable');
    const geometry = new STLLoader().parse(await response.arrayBuffer());
    if (signal.aborted || this.closed) { geometry.dispose(); throw new DOMException('Disposed','AbortError'); }
    // SolidCraft mm/Z-up -> world metres-like units/Y-up.
    geometry.rotateX(-Math.PI / 2).scale(.01,.01,.01);
    return this.geometry(geometry);
  }
  override dispose() { this.closed = true; super.dispose(); }
}
