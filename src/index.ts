// src/index.ts

import * as THREE from "three";
import fragmentShader from "./shaders/fragmentShader.glsl";
import vertexShader from "./shaders/vertexShader.glsl";

import "./styles/main.css";

// Define the maximum number of emitters
const MAX_EMITTERS = 6;

// Define the lifespan of each emitter in seconds
// const EMITTER_LIFESPAN = 9.0; // Adjusted to 1 second as per your requirement
const EMITTER_LIFESPAN = 4.8; // Adjusted to 1 second as per your requirement

// Define the interval for autonomous emitter spawning in milliseconds
// const EMITTER_SPAWN_INTERVAL = 4000; // Spawn an emitter every 1 second
const EMITTER_SPAWN_INTERVAL = 900; // Spawn an emitter every 1 second

// Create the scene
const scene = new THREE.Scene();

// Create the camera (Orthographic for 2D effect)
const camera = new THREE.OrthographicCamera(
  window.innerWidth / -2,
  window.innerWidth / 2,
  window.innerHeight / 2,
  window.innerHeight / -2,
  -1000,
  1000
);
camera.position.z = 1;

// Create the renderer and add it to the DOM
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create the geometry (a plane that fills the viewport)
const geometry = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight);

// Create the custom shader material
const material = new THREE.ShaderMaterial({
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  uniforms: {
    time: { value: 0.0 },
    resolution: {
      value: new THREE.Vector2(window.innerWidth, window.innerHeight),
    },
    // Initialize arrays for emitter positions, start times, and ages
    emitterPositions: {
      value: Array(MAX_EMITTERS)
        .fill(null)
        .map(() => new THREE.Vector2(0, 0)),
    },
    emitterStartTimes: { value: new Array(MAX_EMITTERS).fill(0.0) },
    emitterAges: { value: new Array(MAX_EMITTERS).fill(0.0) }, // Uniform for emitter ages
    emitterCount: { value: 0 },
    emitterLifespan: { value: EMITTER_LIFESPAN }, // Pass lifespan to shader
  },
});

// Create the mesh and add it to the scene
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// Interface for Emitter
interface Emitter {
  position: THREE.Vector2;
  startTime: number;
}

// Emitter Pool Class
class EmitterPool {
  private pool: Emitter[] = [];
  private currentIndex: number = 0;

  constructor(private maxEmitters: number) {
    for (let i = 0; i < maxEmitters; i++) {
      this.pool.push({
        position: new THREE.Vector2(0, 0),
        startTime: -Infinity,
      });
    }
  }

  getNextEmitter(currentTime: number): Emitter {
    const emitter = this.pool[this.currentIndex];
    // Reset emitter's start time to current time
    emitter.startTime = currentTime;
    // Update currentIndex in a circular manner
    this.currentIndex = (this.currentIndex + 1) % this.maxEmitters;
    return emitter;
  }

  getActiveEmitters(elapsedTime: number): Emitter[] {
    return this.pool.filter(
      (emitter) => elapsedTime - emitter.startTime < EMITTER_LIFESPAN
    );
  }
}

// Initialize Emitter Pool
const emitterPool = new EmitterPool(MAX_EMITTERS);

// Clock to keep track of time
const clock = new THREE.Clock();

// Function to update shader uniforms based on active emitters
function updateShaderEmitters(activeEmitters: Emitter[]) {
  material.uniforms.emitterCount.value = activeEmitters.length;

  activeEmitters.forEach((emitter, index) => {
    if (index < MAX_EMITTERS) {
      material.uniforms.emitterPositions.value[index].copy(emitter.position);
      material.uniforms.emitterStartTimes.value[index] = emitter.startTime;
      material.uniforms.emitterAges.value[index] =
        clock.getElapsedTime() - emitter.startTime;
    }
  });

  // Fill the remaining emitters with default values
  for (let i = activeEmitters.length; i < MAX_EMITTERS; i++) {
    material.uniforms.emitterPositions.value[i].set(0, 0);
    material.uniforms.emitterStartTimes.value[i] = 0.0;
    material.uniforms.emitterAges.value[i] = 0.0;
  }

  // Notify Three.js that uniforms have been updated
  material.uniforms.emitterPositions.value.needsUpdate = true;
  material.uniforms.emitterStartTimes.value.needsUpdate = true;
  material.uniforms.emitterAges.value.needsUpdate = true;
}

// Function to add a random emitter
function addRandomEmitter() {
  const currentTime = clock.getElapsedTime();

  // Get a new emitter slot from the pool
  const emitter = emitterPool.getNextEmitter(currentTime);

  // Generate random normalized positions (-1 to 1)
  const randomX = Math.random() * 2 - 1;
  const randomY = Math.random() * 2 - 1;

  // Adjust aspect ratio
  const aspect = window.innerWidth / window.innerHeight;
  const normalizedX = randomX * aspect;
  const normalizedY = randomY;

  // Set emitter position
  emitter.position.set(normalizedX, normalizedY);

  // Update shader emitters
  const activeEmitters = emitterPool.getActiveEmitters(currentTime);
  updateShaderEmitters(activeEmitters);
}

// Function to start autonomous emitter generation
function startAutonomousEmitters() {
  // Initial emitter
  addRandomEmitter();

  // Spawn emitters at regular intervals
  setInterval(addRandomEmitter, EMITTER_SPAWN_INTERVAL);
}

// Handle window resize
window.addEventListener("resize", onWindowResize, false);

function onWindowResize() {
  // Update camera
  camera.left = window.innerWidth / -2;
  camera.right = window.innerWidth / 2;
  camera.top = window.innerHeight / 2;
  camera.bottom = window.innerHeight / -2;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Update uniforms
  material.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);

  // Update mesh geometry
  mesh.geometry.dispose();
  mesh.geometry = new THREE.PlaneGeometry(
    window.innerWidth,
    window.innerHeight
  );
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Update uniforms
  const elapsedTime = clock.getElapsedTime();
  material.uniforms.time.value = elapsedTime;

  // Update emitter ages in uniforms
  for (let i = 0; i < MAX_EMITTERS; i++) {
    if (material.uniforms.emitterStartTimes.value[i] !== 0.0) {
      material.uniforms.emitterAges.value[i] =
        elapsedTime - material.uniforms.emitterStartTimes.value[i];
    } else {
      material.uniforms.emitterAges.value[i] = 0.0;
    }
  }
  material.uniforms.emitterAges.value.needsUpdate = true;

  // Render the scene
  renderer.render(scene, camera);
}

// Start autonomous emitter generation
startAutonomousEmitters();

// Start the animation loop
animate();
