// src/index.ts

import * as THREE from "three";
import fragmentShader from "./shaders/fragmentShader.glsl";
import vertexShader from "./shaders/vertexShader.glsl";

import "./styles/main.css";

// Define the maximum number of emitters
const MAX_EMITTERS = 50;

// Define the lifespan of each emitter in seconds
const EMITTER_LIFESPAN = 0.9;

// Define the delay between emitters in seconds
const EMITTER_DELAY = 0; // Reduced delay to prevent overloading

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
    // Initialize arrays for emitter positions and start times
    emitterPositions: {
      value: new Array(MAX_EMITTERS).fill(new THREE.Vector2(0, 0)),
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

// Variable to store emitters
interface Emitter {
  position: THREE.Vector2;
  startTime: number;
}

const emitters: Emitter[] = [];

// Clock to keep track of time
const clock = new THREE.Clock();

// Variable to track the last emitter addition time
let lastEmitterTime = -Infinity;

// Event listener for mouse movement
function onMouseMove(event: MouseEvent) {
  const currentTime = clock.getElapsedTime();

  // Check if enough time has passed since the last emitter
  if (currentTime - lastEmitterTime < EMITTER_DELAY) {
    return; // Do not add a new emitter yet
  }

  // Update the last emitter time
  lastEmitterTime = currentTime;

  // Convert mouse position to normalized device coordinates (-1 to 1)
  const x = (event.clientX / window.innerWidth) * 2 - 1;
  const y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Adjust for aspect ratio
  const aspect = window.innerWidth / window.innerHeight;
  const normalizedX = x * aspect;
  const normalizedY = y;

  // Add a new emitter if under the MAX_EMITTERS limit
  if (emitters.length < MAX_EMITTERS) {
    addEmitter(new THREE.Vector2(normalizedX, normalizedY));
  }
}

// Function to add a new emitter
function addEmitter(position: THREE.Vector2) {
  const currentTime = clock.getElapsedTime();
  emitters.push({ position, startTime: currentTime });
  updateShaderEmitters();
}

// Update shader uniforms with the current emitters
function updateShaderEmitters() {
  const positions = material.uniforms.emitterPositions.value;
  const startTimes = material.uniforms.emitterStartTimes.value;

  emitters.forEach((emitter, index) => {
    if (index < MAX_EMITTERS) {
      positions[index] = emitter.position;
      startTimes[index] = emitter.startTime;
      // Do NOT reset ages[index] here
    }
  });

  material.uniforms.emitterCount.value = emitters.length;
  material.uniforms.emitterPositions.value.needsUpdate = true;
  material.uniforms.emitterStartTimes.value.needsUpdate = true;
  // No need to update emitterAges here
}

// Add event listener for mouse movement
window.addEventListener("mousemove", onMouseMove, false);

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

  // Update emitter ages
  material.uniforms.emitterAges.value.forEach((age: number, index: number) => {
    if (index < emitters.length) {
      material.uniforms.emitterAges.value[index] =
        elapsedTime - emitters[index].startTime;
    }
  });
  material.uniforms.emitterAges.value.needsUpdate = true;

  // Remove emitters older than EMITTER_LIFESPAN seconds
  const newEmitters = emitters.filter(
    (emitter) => elapsedTime - emitter.startTime < EMITTER_LIFESPAN
  );

  if (newEmitters.length !== emitters.length) {
    emitters.length = 0; // Clear the array
    emitters.push(...newEmitters); // Add the remaining emitters
    updateShaderEmitters(); // Update shader uniforms
  }

  // Render the scene
  renderer.render(scene, camera);
}

animate();
