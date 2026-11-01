const vertexSource = `
    attribute vec2 position;
    uniform float time, phase, sway, bend, anchor, padding;
    varying vec2 uv;
    void main(){
      float fraction=position.y;
      float flex=sin(time*.72+phase-fraction*.9)*.74+sin(time*1.13+phase*.8-fraction*.3)*.26;
      vec2 point=position+vec2(pow(fraction,1.75)*flex*bend,0.);
      float wind=sin(time*.52+phase)*.74+sin(time*.87+phase*.6)*.26;
      float angle=wind*sway;
      point-=vec2(anchor,0.);
      point=vec2(cos(angle)*point.x-sin(angle)*point.y,sin(angle)*point.x+cos(angle)*point.y);
      point+=vec2(anchor,0.);
      point=vec2(padding)+point*(1.-padding*2.);
      gl_Position=vec4(point.x*2.-1.,1.-point.y*2.,0.,1.);
      uv=vec2(position.x,1.-position.y);
    }`;
const fragmentSource = `
    precision mediump float;
    uniform sampler2D artwork;
    varying vec2 uv;
    void main(){gl_FragColor=texture2D(artwork,uv);}`;

interface Rig {
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  image?: HTMLImageElement;
  anchor: number;
  phase: number;
  sway: number;
  bend: number;
  size: number;
  ratio: number;
  program?: WebGLProgram;
  buffer?: WebGLBuffer;
  texture?: WebGLTexture;
  count: number;
  uniforms: Record<string, WebGLUniformLocation | null>;
}
export function createLeafRig(
  canvases: [HTMLCanvasElement, HTMLCanvasElement],
  onReady: (ready: boolean) => void,
) {
  const settings = [
    { anchor: 0.12, phase: 0.4, sway: 2.2, bend: 8 },
    { anchor: 0.43, phase: 1.8, sway: 3.1, bend: 14 },
  ];
  const rigs: Rig[] = [];
  for (const [index, canvas] of canvases.entries()) {
    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
      powerPreference: 'low-power',
      preserveDrawingBuffer: false,
    });
    if (gl) rigs.push({ canvas, gl, ...settings[index], size: 0, ratio: 1, count: 0, uniforms: {} });
  }
  let ready = false,
    disposed = false,
    paused = false,
    reduced = false,
    compact = false;
  let frame = 0,
    elapsed = 0,
    lastClock = 0,
    lastPaint = 0;
  function build(rig: Rig) {
    const gl = rig.gl;
    function shader(type: number, source: string) {
      const result = gl.createShader(type);
      if (!result) throw new Error('Shader unavailable');
      gl.shaderSource(result, source);
      gl.compileShader(result);
      if (!gl.getShaderParameter(result, gl.COMPILE_STATUS)) throw new Error('Leaf shader unavailable');
      return result;
    }
    const vertex = shader(gl.VERTEX_SHADER, vertexSource),
      fragment = shader(gl.FRAGMENT_SHADER, fragmentSource);
    const program = gl.createProgram();
    if (!program || !rig.image) throw new Error('Leaf artwork unavailable');
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Leaf mesh unavailable');
    const vertices: number[] = [];
    for (let row = 0; row < 28; row++)
      for (let column = 0; column < 12; column++) {
        const x = column / 12,
          y = row / 28,
          right = (column + 1) / 12,
          bottom = (row + 1) / 28;
        vertices.push(x, y, right, y, x, bottom, x, bottom, right, y, right, bottom);
      }
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    const attribute = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(attribute);
    gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0);
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, rig.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    rig.program = program;
    rig.buffer = buffer ?? undefined;
    rig.texture = texture ?? undefined;
    rig.count = vertices.length / 2;
    rig.uniforms = Object.fromEntries(
      ['time', 'phase', 'sway', 'bend', 'anchor', 'padding'].map((name) => [
        name,
        gl.getUniformLocation(program, name),
      ]),
    );
  }
  function paint() {
    for (const rig of rigs) {
      const { gl, size, uniforms } = rig;
      if (!rig.program || !size) continue;
      const padding = Math.max(16, size * 0.05) / size;
      gl.viewport(0, 0, rig.canvas.width, rig.canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(rig.program);
      gl.uniform1f(uniforms.time, elapsed);
      gl.uniform1f(uniforms.phase, rig.phase);
      gl.uniform1f(uniforms.sway, (rig.sway * Math.PI) / 180);
      gl.uniform1f(uniforms.bend, rig.bend / 420 / (1 - padding * 2));
      gl.uniform1f(uniforms.anchor, rig.anchor);
      gl.uniform1f(uniforms.padding, padding);
      gl.drawArrays(gl.TRIANGLES, 0, rig.count);
    }
  }
  function active() {
    return ready && !disposed && !paused && !reduced;
  }
  function tick(now: number) {
    frame = 0;
    if (!active()) {
      lastClock = 0;
      return;
    }
    if (lastClock) elapsed += Math.min((now - lastClock) / 1000, 0.05);
    lastClock = now;
    if (now - lastPaint >= 1000 / 30) {
      paint();
      lastPaint = now;
    }
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    onReady(ready && !reduced && !disposed);
    if (active() && !frame) frame = requestAnimationFrame(tick);
    else if (!active()) {
      cancelAnimationFrame(frame);
      frame = 0;
      lastClock = 0;
    }
  }
  function resize() {
    compact = innerWidth <= 640;
    for (const rig of rigs) {
      rig.size = rig.canvas.getBoundingClientRect().width;
      rig.ratio = Math.min(devicePixelRatio || 1, compact ? 1 : 1.25);
      rig.canvas.width = Math.round(rig.size * rig.ratio);
      rig.canvas.height = rig.canvas.width;
    }
    if (ready) paint();
  }
  async function initialize() {
    if (rigs.length !== 2) return;
    try {
      const images = await Promise.all(
        ['leaf-monstera.webp', 'leaf-fern.webp', 'paper-clean.webp'].map(async (file) => {
          const image = new Image();
          image.src = '/landing-pages/birthday-media/' + file;
          await image.decode();
          return image;
        }),
      );
      if (disposed) return;
      rigs.forEach((rig, index) => {
        rig.image = images[index];
        build(rig);
      });
      ready = true;
      resize();
      sync();
    } catch {
      if (!disposed) {
        ready = false;
        sync();
      }
    }
  }
  const listeners = rigs.map((rig) => {
    const lost = (event: Event) => {
      event.preventDefault();
      ready = false;
      sync();
    };
    rig.canvas.addEventListener('webglcontextlost', lost);
    rig.canvas.addEventListener('webglcontextrestored', initialize);
    return () => {
      rig.canvas.removeEventListener('webglcontextlost', lost);
      rig.canvas.removeEventListener('webglcontextrestored', initialize);
    };
  });
  initialize();
  return {
    setOptions(options: { paused: boolean; reduced: boolean }) {
      paused = options.paused;
      reduced = options.reduced;
      sync();
    },
    resize,
    destroy() {
      disposed = true;
      cancelAnimationFrame(frame);
      listeners.forEach((remove) => remove());
      rigs.forEach((rig) => {
        if (rig.program) rig.gl.deleteProgram(rig.program);
        if (rig.buffer) rig.gl.deleteBuffer(rig.buffer);
        if (rig.texture) rig.gl.deleteTexture(rig.texture);
      });
    },
  };
}
