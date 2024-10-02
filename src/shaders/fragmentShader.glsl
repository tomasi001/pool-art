// src/shaders/fragmentShader.glsl

precision highp float;

uniform float time;
uniform vec2 resolution;

varying vec2 vUv;

void main() {
  // Normalize UV coordinates
  vec2 uv = vUv * 2.0 - 1.0;

  // Adjust aspect ratio
  uv.x *= resolution.x / resolution.y;

  // Initialize color
  float color = 0.0;

  // Parameters for the waves
  const float speed = 0.2;
  const float frequency = 10.0;
  const float amplitude = 0.5;

  // Wave origins
  vec2 origins[5];
  origins[0] = vec2(0.0, 0.0);
  origins[1] = vec2(0.5, 0.5);
  origins[2] = vec2(-0.5, -0.5);
  origins[3] = vec2(-0.5, 0.5);
  origins[4] = vec2(0.5, -0.5);

  // Calculate wave interference
  for (int i = 0; i < 5; i++) {
    float dist = distance(uv, origins[i]);
    color += sin(dist * frequency - time * speed);
  }

  // Normalize color
  color = (sin(color) + 1.0) / 2.0;

  // Apply color
  gl_FragColor = vec4(vec3(color), 1.0);
}