import {
  Renderer,
  Camera,
  Transform,
  Program,
  Mesh,
  Plane,
  Orbit,
  OGLRenderingContext,
  Texture, TextureLoader,
} from 'ogl';
import vertex from './shaders/ogl_basic_example_vert.glsl';
import fragment from './shaders/ogl_basic_example_frag.glsl';

/**
 * Boilerplate module using OGL
 */

type Item = {
  el: HTMLElement,
  mesh: Mesh,
  width: number,
  height: number,
  x: number,
  y: number,
  top: number,
}

class Scene {
  // Container
  container: HTMLElement | null;

  // Items
  itemEls: NodeList | null;
  items: Item[] = [];

  // Time
  time = performance.now() / 1000;

  // Viewport
  dpr = window.devicePixelRatio;
  resolution: [number, number] = [0, 0];
  viewportWidth = 0;
  viewportHeight = 0;
  scrollOffset: [number, number] = [0, 0];
  prevScrollY = window.scrollY;

  // OGL items
  renderer?: Renderer;
  gl?: OGLRenderingContext;
  camera?: Camera;
  scene?: Transform;
  controls?: Orbit;
  planes: Mesh[] = [];
  textures: Texture[] = [];

  // Uniforms
  uniforms: { [key: string]: { value: number | number[] | boolean | Texture | undefined } } = {};

  constructor(containerSelector = '[data-scene-container]') {
    this.container = document.querySelector(containerSelector);
    this.itemEls = document.querySelectorAll('[data-scene-item]');

    this.init();
  }

  init = () => {
    this.createApp();
    this.createItems();
    this.resize();
    this.update();
  };

  createApp = () => {
    if (!this.container) return;

    // Renderer
    this.renderer = new Renderer({ dpr: this.dpr });
    this.gl = this.renderer.gl;

    // If no GL context, return
    if (!this.gl) return;

    // Add to container
    this.container.appendChild(this.gl.canvas);

    // Set clear color
    this.gl.clearColor(0, 0, 0, 0);

    // Camera
    this.camera = new Camera(this.gl);
    this.controls = new Orbit(this.camera, {
      enableRotate: false,
      enableZoom: false,
      enablePan: false,
    });

    // Resizing
    const resizeObserver = new ResizeObserver(this.resize);
    resizeObserver.observe(this.container);
    window.addEventListener('resize', this.resize);

    // Scene
    this.scene = new Transform();
  };

  createItems = () => {
    if (!this.gl || !this.scene || !this.itemEls) return;

    // Geometry
    const planeGeometry = new Plane(this.gl, { widthSegments: 1, heightSegments: 12 });

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

    // Double up textures so we have enough
    textures = [...textures, ...textures];

    // Mesh
    this.itemEls.forEach((itemEl) => {
      if (!this.gl || !this.scene) return;

      // Program
      const program = new Program(this.gl, {
        vertex,
        fragment,
        uniforms: Object.assign({}, this.uniforms, {
          domWH: { value: [0, 0] },
          domXY: { value: [0, 0] },
        }),
      });

      const plane = new Mesh(this.gl, { geometry: planeGeometry, program: program });
      plane.setParent(this.scene);
      this.planes.push(plane);

      // Texture
      const textureIdx = Math.floor(Math.random() * textures.length);
      const textureUrl = textures[textureIdx];
      const texture = TextureLoader.load(this.gl, { src: `/assets/textures/${textureUrl}` });
      this.textures.push(texture);

      // Remove the chosen texture from the array
      textures = textures.filter((_, idx) => idx !== textureIdx);

      // Add item
      this.items.push({
        el: itemEl as HTMLElement,
        mesh: plane,
        width: 1,
        height: 1,
        x: 0,
        y: 0,
        top: 0,
      });
    });
  };

  updateItems = (deltaTime: number) => {
    // const canvasTop = this.scrollOffset[1];
    // const canvasBottom = canvasTop + this.resolution[1];

    this.items.forEach((item) => {
      item.mesh.program.uniforms.domXY.value = [item.x, item.y];
    });

    // Optimize by hiding items that are not visible
    // item.mesh.visible = item.y < canvasBottom && item.y + item.height > canvasTop;
  };

  resize = () => {
    if (!this.container || !this.renderer || !this.gl || !this.camera || !this.itemEls || !this.planes.length) return;
    const padding = 0;
    const width = this.container.offsetWidth;
    const height = window.outerHeight;
    this.renderer.setSize(width / this.dpr, height / this.dpr);
    this.viewportWidth = width;
    this.viewportHeight = window.innerHeight;
    this.resolution = [this.viewportWidth, this.viewportHeight];

    // Set canvas height
    const canvasHeight = this.viewportHeight * (1 + padding * 2);
    this.gl.canvas.style.width = `${this.viewportWidth}px`;
    this.gl.canvas.style.height = `${canvasHeight}px`;

    // Set scroll offset
    this.scrollOffset = [window.scrollX, window.scrollY];

    // Update item positions
    this.items.forEach((item, idx) => {
      const el = item.el;
      const rect = el.getBoundingClientRect();
      const plane = this.planes[idx];

      const itemWidth = rect.width;
      const itemHeight = rect.height;
      plane.program.uniforms.domWH.value = [itemWidth, itemHeight];

      item.width = itemWidth;
      item.height = itemHeight;
      item.x = rect.left + this.scrollOffset[0];
      item.y = rect.top + this.scrollOffset[1];

      item.mesh.program.uniforms.domWH.value = [item.width, item.height];
    });
  };

  updateUniforms = (deltaTime: number, scrollY: number) => {
    this.uniforms = {
      time: { value: this.time },
      resolution: { value: this.resolution },
    };

    this.planes.forEach((plane, idx) => {
      const texture = this.textures[idx];
      const uniforms = {
        textureMap: { value: texture },
        textureWidth: { value: texture.width },
        textureHeight: { value: texture.height },
        scrollOffset: { value: [window.scrollX, scrollY] },
      };
      plane.program.uniforms = Object.assign({}, plane.program.uniforms, Object.assign({}, this.uniforms, uniforms));
    });
  };

  update = () => {
    window.requestAnimationFrame(this.update);

    if (!this.controls || !this.renderer) return;

    // Scroll
    const scrollY = window.scrollY;
    const scrollDelta = scrollY - this.prevScrollY;

    // Update time
    const newTime = performance.now() / 1000;
    const deltaTime = newTime - this.time;
    this.time = newTime;

    // Update controls
    this.controls.update();

    // Update uniforms
    this.updateUniforms(deltaTime, scrollY);

    this.updateItems(deltaTime);

    // Render
    this.renderer.render({ scene: this.scene, camera: this.camera });

    // Update scroll
    this.prevScrollY = scrollY;
  };
}

export default Scene;
