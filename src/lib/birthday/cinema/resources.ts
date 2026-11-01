import { CanvasTexture, SRGBColorSpace, TextureLoader } from 'three';
import type { BufferGeometry, Material, Texture } from 'three';

export class Resources {
  private geometries = new Set<BufferGeometry>();
  private materials = new Set<Material>();
  private textures = new Set<Texture>();
  private disposed = false;
  geometry<T extends BufferGeometry>(value: T): T {
    if (this.disposed) {
      value.dispose();
      throw new Error('Scene disposed');
    }
    this.geometries.add(value);
    return value;
  }
  material<T extends Material>(value: T): T {
    if (this.disposed) {
      value.dispose();
      throw new Error('Scene disposed');
    }
    this.materials.add(value);
    return value;
  }
  texture<T extends Texture>(value: T): T {
    if (this.disposed) {
      value.dispose();
      throw new Error('Scene disposed');
    }
    this.textures.add(value);
    return value;
  }
  async load(url: string) {
    const texture = this.texture(await new TextureLoader().loadAsync(url));
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = 4;
    return texture;
  }
  canvas(value: HTMLCanvasElement) {
    return this.texture(new CanvasTexture(value));
  }
  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.geometries.forEach((value) => value.dispose());
    this.materials.forEach((value) => value.dispose());
    this.textures.forEach((value) => value.dispose());
    this.geometries.clear();
    this.materials.clear();
    this.textures.clear();
  }
}
