import {
  Renderer,
  Camera,
  Transform,
  Program,
  Mesh,
  Plane,
  Orbit,
  OGLRenderingContext,
  Vec3,
  Texture, TextureLoader,
} from 'ogl';
import vertex from './shaders/ogl_basic_example_vert.glsl';
import fragment from './shaders/ogl_basic_example_frag.glsl';

/**
 * Boilerplate module using OGL
 */

class Scene {
  // Container
  container: HTMLElement | null;

  // Items
  items: NodeList | null;

  // Time
  lastTime = performance.now() / 1000;
  time = 0;

  // OGL items
  renderer?: Renderer;
  gl?: OGLRenderingContext;
  camera?: Camera;
  scene?: Transform;
  controls?: Orbit;
  planes: Mesh[] = [];
  texture?: Texture;

  // Dimensions
  fov = 52;
  aspect = 1;
  cameraZ = 7;

  // Uniforms
  uniforms: { [key: string]: { value: number | number[] | boolean | Texture | undefined } } = {};

  constructor(containerSelector = '[data-app-container]') {
    this.container = document.querySelector(containerSelector);
    this.items = document.querySelectorAll('.item');

    this.init();
  }

  init = () => {
    this.createApp();
    this.createItems();
    this.updateUniforms();
    this.resize();
    this.update();
  };

  createApp = () => {
    if (!this.container) return;

    // Renderer
    this.renderer = new Renderer({ dpr: 2 });
    this.gl = this.renderer.gl;

    // If no GL context, return
    if (!this.gl) return;

    // Add to container
    this.container.appendChild(this.gl.canvas);

    // Set clear color
    this.gl.clearColor(0, 0, 0, 0);

    // Camera
    this.camera = new Camera(this.gl, { fov: this.fov, aspect: this.aspect });
    this.camera.position.set(0, 0, this.cameraZ);
    this.camera.lookAt(new Vec3(0, 0, 0));
    this.controls = new Orbit(this.camera, {
      enableRotate: false,
      enableZoom: false,
      enablePan: false,
    });

    // Resizing
    const resizeObserver = new ResizeObserver(this.resize);
    resizeObserver.observe(this.container);
    this.resize();

    // Scene
    this.scene = new Transform();
  };

  createItems = () => {
    if (!this.gl || !this.scene || !this.items) return;

    // Geometry
    const planeGeometry = new Plane(this.gl);

    // Mesh
    this.items.forEach((item) => {
      if (!this.gl || !this.scene) return;

      // Program
      const program = new Program(this.gl, {
        vertex,
        fragment,
        uniforms: Object.assign({}, this.uniforms, {
          color: { value: [Math.random(), Math.random(), Math.random()] },
          time: { value: this.time }, 
        }),
      });

      const plane = new Mesh(this.gl, { geometry: planeGeometry, program: program });
      plane.position.set(0, 0, 0);
      plane.setParent(this.scene);
      this.planes.push(plane);
    });

    // Texture
    this.texture = TextureLoader.load(this.gl, { src: '/assets/gradient-texture.jpg' });
  };

  updateItems = () => {
    if (!this.planes.length) return;

    // Do something here maybe…
  };

  resize = () => {
    if (!this.container || !this.renderer || !this.gl || !this.camera || !this.items || !this.planes.length) return;
    const width = this.container.offsetWidth;
    const height = this.container.offsetHeight;
    this.renderer.setSize(width, height);
    this.camera.perspective({ aspect: this.gl.canvas.width / this.gl.canvas.height });

    const z = height / Math.tan(this.fov * Math.PI / 360) * 0.5;
    this.camera.position.set(0, 0, this.cameraZ);
    const scale = this.cameraZ / z;

    this.items.forEach((itemEl, idx) => {
      const el = itemEl as HTMLElement;
      const rect = el.getBoundingClientRect();
      const plane = this.planes[idx];

      plane.scale.set(
        rect.width * scale, rect.height * scale, 1.0,
      );
      plane.position.set(
        (rect.left + rect.width * 0.5 - width * 0.5) * scale,
        (-rect.top - rect.height * 0.5 + height * 0.5) * scale,
        0.0,
      );
    });
  };

  updateUniforms = () => {
    this.uniforms = {
      time: { value: this.time },
      textureMap: { value: this.texture },
    };

    this.planes.forEach((plane) => {
      plane.program.uniforms = Object.assign({}, plane.program.uniforms, this.uniforms);
    });
  };

  update = () => {
    if (!this.controls || !this.renderer) return;

    // Update controls
    this.controls.update();

    // Update uniforms
    this.updateUniforms();

    // Update time
    const now = performance.now() / 1000;
    this.time += now - this.lastTime;
    this.lastTime = now;

    this.updateItems();

    // Render
    this.renderer.render({ scene: this.scene, camera: this.camera });

    window.requestAnimationFrame(this.update);
  };
}

export default Scene;
