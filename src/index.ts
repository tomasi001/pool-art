// src/index.ts

import * as THREE from 'three';
import fragmentShader from './shaders/fragmentShader.glsl';
import vertexShader from './shaders/vertexShader.glsl';

import './styles/main.css';

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
    },
});

// Create the mesh and add it to the scene
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// Handle window resize
window.addEventListener('resize', onWindowResize, false);

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
    material.uniforms.resolution.value.x = window.innerWidth;
    material.uniforms.resolution.value.y = window.innerHeight;

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
    material.uniforms.time.value += 0.05;

    // Render the scene
    renderer.render(scene, camera);
}

animate();