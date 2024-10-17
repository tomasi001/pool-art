// src/shaders/fragmentShader.glsl

precision highp float;

uniform float time;
uniform vec2 resolution;

// Maximum number of emitters
const int MAX_EMITTERS = 100;

// Arrays for emitter positions and start times
uniform vec2 emitterPositions[MAX_EMITTERS];
uniform float emitterStartTimes[MAX_EMITTERS];
uniform int emitterCount;

varying vec2 vUv;

void main() {
    // Normalize UV coordinates
    vec2 uv = vUv * 2.0 - 1.0;

    // Adjust aspect ratio
    uv.x *= resolution.x / resolution.y;

    // Initialize color
    float color = 0.0;

    // Parameters for the waves
    const float speed = 0.5;
    const float frequency = 10.0;
    const float amplitude = 0.5;

    // Iterate through all emitters
    for (int i = 0; i < MAX_EMITTERS; i++) {
        if (i >= emitterCount) {
            break;
        }
        vec2 origin = emitterPositions[i];
        float startTime = emitterStartTimes[i];

        float elapsed = time - startTime;

        if (elapsed < 0.0) continue; // Skip if emission hasn't started

        // Calculate distance from the current fragment to the emitter
        float dist = distance(uv, origin);

        // Calculate the wave based on distance and elapsed time
        float wave = sin(dist * frequency - elapsed * speed);

        // Apply attenuation based on distance and time
        wave *= amplitude / (dist + 1.0) * smoothstep(0.0, 10.0, elapsed);

        // Sum up the waves
        color += wave;
    }

    // Normalize color
    color = (sin(color) + 1.0) / 2.0;

    // Apply color
    gl_FragColor = vec4(vec3(color), 1.0);
}
