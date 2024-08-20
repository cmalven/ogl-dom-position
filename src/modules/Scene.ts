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
  textures: Texture[] = [];

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
    window.addEventListener('resize', this.resize);
    this.resize();

    // Scene
    this.scene = new Transform();
  };

  createItems = () => {
    if (!this.gl || !this.scene || !this.items) return;

    // Geometry
    const planeGeometry = new Plane(this.gl);

    // Available textures
    let textures = [
      'andreas-gucklhorn-mawU2PoJWfU-unsplash.jpg',
      'bailey-zindel-NRQV-hBF10M-unsplash.jpg',
      'blake-verdoorn-cssvEZacHvQ-unsplash.jpg',
      'casey-horner-4rDCa5hBlCs-unsplash.jpg',
      'chris-lee-70l1tDAI6rM-unsplash.jpg',
      'clement-m-igX2deuD9lc-unsplash.jpg',
      'daniel-malikyar-F1leFzugQfM-unsplash.jpg',
      'daniela-kokina-hOhlYhAiizc-unsplash.jpg',
      'eberhard-grossgasteiger-BXasVMRGsuo-unsplash.jpg',
      'henry-be-IicyiaPYGGI-unsplash.jpg',
      'johannes-andersson-UCd78vfC8vU-unsplash.jpg',
      'kimon-maritz-zMV7sqlJNow-unsplash.jpg',
      'mourad-saadi-GyDktTa0Nmw-unsplash.jpg',
      'ren-ran-bBiuSdck8tU-unsplash.jpg',
      'samsommer-vddccTqwal8-unsplash.jpg',
      'shifaaz-shamoon-oR0uERTVyD0-unsplash.jpg',
    ];


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

      // Texture
      const textureIdx = Math.floor(Math.random() * textures.length);
      const textureUrl = textures[textureIdx];
      const texture = TextureLoader.load(this.gl, { src: `/assets/textures/${textureUrl}` });
      this.textures.push(texture);

      // Remove the chosen texture from the array
      textures = textures.filter((_, idx) => idx !== textureIdx);
    });
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
    };

    this.planes.forEach((plane, idx) => {
      const texture = this.textures[idx];
      const uniforms = {
        textureMap: { value: texture },
        textureWidth: { value: texture.width },
        textureHeight: { value: texture.height },
        planeScale: { value: [plane.scale[0], plane.scale[1]] },
      };
      plane.program.uniforms = Object.assign({}, plane.program.uniforms, Object.assign({}, this.uniforms, uniforms));
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
