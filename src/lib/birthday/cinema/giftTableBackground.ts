import {
  AmbientLight,
  BoxGeometry,
  Color,
  DirectionalLight,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  Plane,
  PlaneGeometry,
  Raycaster,
  Scene,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import type { BufferGeometry } from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { Resources } from "./resources";

export interface GiftBackdrop {
  resize(): void;
  scroll(): void;
  setOptions(options: { paused: boolean; scrolling: boolean }): void;
  destroy(): void;
}

/** Decorative tabletop only. The page, book and story cameras stay independent. */
export async function createGiftBackdrop(
  canvas: HTMLCanvasElement,
  signal: AbortSignal,
  onfailure: () => void,
): Promise<GiftBackdrop> {
  if (signal.aborted) throw new DOMException("Disposed", "AbortError");
  const resources = new Resources();
  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
    powerPreference: "low-power",
  });
  renderer.setClearColor(0, 0);
  const scene = new Scene(),
    camera = new PerspectiveCamera(32, 1, 0.1, 100);
  const gifts = new Group(),
    envelope = new Group(),
    canopy = new Group();
  scene.add(gifts, envelope, canopy, new AmbientLight("#fff6e8", 1.45));
  const light = new DirectionalLight("#fff2d8", 2.1);
  light.position.set(-5, 10, 8);
  scene.add(light);
  const paper = resources.material(
    new MeshStandardMaterial({ color: "#d8c7ab", roughness: 0.94 }),
  );
  const folds = resources.material(
    new MeshStandardMaterial({ color: "#e7dcc8", roughness: 0.98 }),
  );
  const ribbon = resources.material(
    new MeshStandardMaterial({ color: "#869477", roughness: 0.78 }),
  );
  const sealMaterial = resources.material(
    new MeshStandardMaterial({
      vertexColors: true,
      metalness: 0.2,
      roughness: 0.5,
    }),
  );
  let disposed = false,
    paused = false,
    scrolling = false,
    frame = 0,
    lastClock = 0,
    lastPaint = 0,
    wind = 0;
  let width = 1,
    height = 1,
    compact = false,
    scrollRange = 1,
    currentScroll = 0,
    targetScroll = 0;
  let observer: ResizeObserver | undefined;
  const lifetime = new AbortController();
  const abort = () => {
    lifetime.abort();
    destroy();
  };
  signal.addEventListener("abort", abort, { once: true });
  const lost = (event: Event) => {
    event.preventDefault();
    destroy();
    onfailure();
  };
  canvas.addEventListener("webglcontextlost", lost);
  const loader = new STLLoader();
  function artwork() {
    const work = Promise.all(
      ["leaf-monstera.webp", "leaf-fern.webp", "paper-clean.webp"].map((file) =>
        resources.load("/landing-pages/birthday-media/" + file),
      ),
    );
    return new Promise<Awaited<typeof work>>((resolve, reject) => {
      const clear = () => {
        clearTimeout(deadline);
        lifetime.signal.removeEventListener("abort", cancel);
      };
      const cancel = () => {
        clear();
        reject(new DOMException("Disposed", "AbortError"));
      };
      const deadline = window.setTimeout(() => {
        clear();
        reject(new Error("Background artwork unavailable"));
      }, 5000);
      lifetime.signal.addEventListener("abort", cancel, { once: true });
      if (lifetime.signal.aborted) {
        cancel();
        return;
      }
      work.then(
        (value) => {
          clear();
          resolve(value);
        },
        (error) => {
          clear();
          reject(error);
        },
      );
    });
  }
  async function part(name: string): Promise<BufferGeometry | undefined> {
    const request = new AbortController();
    const cancel = () => request.abort();
    lifetime.signal.addEventListener("abort", cancel, { once: true });
    const deadline = window.setTimeout(cancel, 5000);
    try {
      if (lifetime.signal.aborted)
        throw new DOMException("Disposed", "AbortError");
      const path = name === "seal" ? "fs-seal.stl" : `world/${name}.stl`;
      const response = await fetch("/landing-pages/birthday-media/" + path, {
        signal: request.signal,
      });
      if (!response.ok) return;
      const geometry = loader.parse(await response.arrayBuffer());
      if (disposed || request.signal.aborted) {
        geometry.dispose();
        return;
      }
      return resources.geometry(
        geometry.rotateX(-Math.PI / 2).scale(0.01, 0.01, 0.01),
      );
    } catch {
      return;
    } finally {
      clearTimeout(deadline);
      lifetime.signal.removeEventListener("abort", cancel);
    }
  }
  const names = [
    "gift-base",
    "gift-lid",
    "gift-ribbon-x",
    "gift-ribbon-y",
    "gift-bow-left",
    "gift-bow-right",
    "envelope-back",
    "envelope-pocket",
    "envelope-flap",
    "seal",
  ];
  try {
    const [models, textures] = await Promise.all([
      Promise.all(names.map(part)),
      artwork(),
    ]);
    if (disposed || signal.aborted)
      throw new DOMException("Disposed", "AbortError");
    models.forEach((geometry, i) => {
      if (!geometry) return;
      const name = names[i];
      if (name === "seal") {
        const positions = geometry.getAttribute("position"),
          colors = new Float32Array(positions.count * 3),
          color = new Color();
        for (let v = 0; v < positions.count; v++) {
          color.set(
            positions.getY(v) > 0.011 &&
              Math.hypot(positions.getX(v), positions.getZ(v)) < 0.1
              ? "#473520"
              : "#ad8e59",
          );
          colors.set([color.r, color.g, color.b], v * 3);
        }
        geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
        const seal = new Mesh(geometry, sealMaterial);
        seal.position.y = 0.024;
        seal.scale.setScalar(1.2);
        envelope.add(seal);
      } else if (name.startsWith("gift-")) {
        gifts.add(
          new Mesh(
            geometry,
            name === "gift-base" || name === "gift-lid" ? paper : ribbon,
          ),
        );
      } else
        envelope.add(
          new Mesh(geometry, name === "envelope-flap" ? paper : folds),
        );
    });
    if (!models[0]) {
      const base = new Mesh(
        resources.geometry(new BoxGeometry(1.4, 0.7, 1.1)),
        paper,
      );
      base.position.y = 0.35;
      gifts.add(base);
    }
    if (!models[1]) {
      const lid = new Mesh(
        resources.geometry(new BoxGeometry(1.44, 0.04, 1.14)),
        folds,
      );
      lid.position.y = 0.72;
      gifts.add(lid);
    }
    if (!models[6])
      envelope.add(
        new Mesh(resources.geometry(new BoxGeometry(1.6, 0.012, 1.12)), paper),
      );
    const leaves = textures.slice(0, 2).map((texture, i) => {
      const geometry = resources.geometry(new PlaneGeometry(1, 1, 12, 28));
      const mesh = new Mesh(
        geometry,
        resources.material(
          new MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 0.62,
            side: DoubleSide,
            depthWrite: false,
          }),
        ),
      );
      mesh.renderOrder = 2 + i;
      canopy.add(mesh);
      return { mesh, geometry, phase: i ? 1.8 : 0.4, anchor: i ? 0.43 : 0.12 };
    });
    const raycaster = new Raycaster(),
      table = new Plane(new Vector3(0, 1, 0), 0);
    function fitProp(
      object: Group,
      u: number,
      v: number,
      desiredWidth: number,
      modelWidth: number,
      rotation: number,
    ) {
      camera.updateMatrixWorld();
      raycaster.setFromCamera(new Vector2(u * 2 - 1, 1 - v * 2), camera);
      const anchor = raycaster.ray.intersectPlane(table, new Vector3());
      if (!anchor) return;
      object.position.copy(anchor);
      object.rotation.y = rotation;
      const origin = anchor.clone().project(camera),
        unit = anchor
          .clone()
          .add(new Vector3(1, 0, 0))
          .project(camera);
      object.scale.setScalar(
        desiredWidth / ((Math.abs(unit.x - origin.x) * width) / 2) / modelWidth,
      );
    }
    function pose() {
      camera.position.set(
        currentScroll * 0.32,
        8 + currentScroll * 0.24,
        12 - currentScroll * 0.45,
      );
      camera.lookAt(currentScroll * 0.12, 0, 0);
      camera.updateMatrixWorld();
      // Leaves keep their original corner composition, with real out-of-plane flex.
      canopy.position.copy(camera.position);
      canopy.quaternion.copy(camera.quaternion);
    }
    function sizeLeaves() {
      const distance = 7,
        worldH = 2 * Math.tan((camera.fov * Math.PI) / 360) * distance,
        worldW = worldH * camera.aspect;
      const sizes = [
        compact
          ? Math.min(350, width * 0.86)
          : Math.max(340, Math.min(520, width * 0.3)),
        compact ? 300 : Math.max(300, Math.min(470, width * 0.27)),
      ];
      leaves.forEach(({ mesh }, i) => {
        const size = sizes[i],
          left = i
            ? compact
              ? 90
              : Math.max(90, Math.min(200, width * 0.09))
            : compact
              ? -105
              : Math.max(-145, Math.min(-85, -width * 0.07));
        const top = compact
          ? -115
          : Math.max(-140, Math.min(-95, -width * 0.08));
        mesh.position.set(
          ((left + size / 2) / width - 0.5) * worldW,
          (0.5 - (top + size / 2) / height) * worldH,
          -distance,
        );
        mesh.scale.setScalar((size / height) * worldH);
      });
    }
    function flex() {
      for (const { geometry, phase, anchor } of leaves) {
        const positions = geometry.getAttribute("position"),
          uv = geometry.getAttribute("uv");
        const sway =
          (Math.sin(wind * 0.52 + phase) * 0.74 +
            Math.sin(wind * 0.87 + phase * 0.6) * 0.26) *
          0.026;
        for (let i = 0; i < positions.count; i++) {
          const x = uv.getX(i),
            y = 1 - uv.getY(i);
          const wave =
            Math.sin(wind * 0.72 + phase - y * 0.9) * 0.74 +
            Math.sin(wind * 1.13 + phase * 0.8 - y * 0.3) * 0.26;
          const px = x - anchor + Math.pow(y, 1.75) * wave * 0.027;
          positions.setXYZ(
            i,
            Math.cos(sway) * px - Math.sin(sway) * y + anchor - 0.5,
            0.5 - (Math.sin(sway) * px + Math.cos(sway) * y),
            Math.sin(y * 2.4 + wind * 0.7 + phase) * y * y * 0.035,
          );
        }
        positions.needsUpdate = true;
      }
    }
    function render() {
      pose();
      flex();
      renderer.render(scene, camera);
      canvas.dataset.drawCalls = String(renderer.info.render.calls);
      canvas.dataset.triangles = String(renderer.info.render.triangles);
    }
    function schedule() {
      if (!disposed && !paused && !frame) frame = requestAnimationFrame(tick);
    }
    function tick(now: number) {
      frame = 0;
      if (disposed || paused) return;
      const dt = lastClock ? Math.min(0.05, (now - lastClock) / 1000) : 1 / 30;
      lastClock = now;
      const delta = targetScroll - currentScroll;
      currentScroll =
        Math.abs(delta) < 0.0001
          ? targetScroll
          : currentScroll + delta * (1 - Math.exp(-dt * 9));
      if (!scrolling) wind += dt;
      if (now - lastPaint >= 1000 / 30) {
        render();
        lastPaint = now;
      }
      if (!scrolling || Math.abs(targetScroll - currentScroll) > 0.0001)
        schedule();
      else if (now - lastPaint < 1000 / 30) {
        render();
      }
    }
    function scroll() {
      targetScroll = Math.max(0, Math.min(1, scrollY / scrollRange));
      schedule();
    }
    function resize() {
      if (disposed) return;
      width = innerWidth;
      height = innerHeight;
      compact = width <= 640;
      scrollRange = Math.max(1, document.documentElement.scrollHeight - height);
      currentScroll = targetScroll = Math.max(
        0,
        Math.min(1, scrollY / scrollRange),
      );
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      pose();
      renderer.setPixelRatio(
        Math.min(devicePixelRatio || 1, compact ? 1 : 1.25),
      );
      renderer.setSize(width, height, false);
      fitProp(
        gifts,
        compact ? 0.01 : 0.015,
        compact ? 0.735 : 0.76,
        compact ? Math.min(108, width * 0.25) : Math.min(190, width * 0.14),
        1.4,
        -0.35,
      );
      fitProp(
        envelope,
        0.99,
        compact ? 0.735 : 0.78,
        compact ? Math.min(116, width * 0.28) : Math.min(220, width * 0.16),
        1.6,
        0.37,
      );
      sizeLeaves();
      if (!paused) render();
      schedule();
    }
    observer = new ResizeObserver(() => {
      scrollRange = Math.max(
        1,
        document.documentElement.scrollHeight - innerHeight,
      );
      scroll();
    });
    observer.observe(document.body);
    resize();
    return {
      resize,
      scroll,
      setOptions(options) {
        paused = options.paused;
        scrolling = options.scrolling;
        canvas.dataset.paused = String(paused);
        if (paused) {
          cancelAnimationFrame(frame);
          frame = 0;
          lastClock = 0;
        } else schedule();
      },
      destroy,
    };
  } catch (error) {
    destroy();
    throw error;
  }
  function destroy() {
    if (disposed) return;
    disposed = true;
    lifetime.abort();
    cancelAnimationFrame(frame);
    frame = 0;
    signal.removeEventListener("abort", abort);
    canvas.removeEventListener("webglcontextlost", lost);
    observer?.disconnect();
    resources.dispose();
    scene.clear();
    renderer.dispose();
    renderer.forceContextLoss();
  }
}
