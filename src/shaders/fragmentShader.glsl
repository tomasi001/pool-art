// src/shaders/fragmentShader.glsl

precision highp float;

uniform float time;
uniform vec2 resolution;

// Maximum number of emitters
const int MAX_EMITTERS = 5;

// Arrays for emitter positions, start times, and ages
uniform vec2 emitterPositions[MAX_EMITTERS];
uniform float emitterStartTimes[MAX_EMITTERS];
uniform float emitterAges[MAX_EMITTERS];
uniform int emitterCount;

// Lifespan of each emitter
uniform float emitterLifespan;

varying vec2 vUv;

void main() {
    // Normalize UV coordinates
    vec2 uv = vUv * 2.0 - 1.0;

    // Adjust aspect ratio
    uv.x *= resolution.x / resolution.y;

    // Initialize wave sum
    float waveSum = 0.0;

    // Parameters for the waves
    const float speed = 0.1;
    const float frequency = 11.0;
    const float amplitude = 0.99;

    // Attenuation parameters for bell curve
    const float fadeInDuration = 0.2;  // 20% of lifespan
    const float fadeOutDuration = 0.2; // 20% of lifespan

    // Iterate through all emitters
    for (int i = 0; i < MAX_EMITTERS; i++) {
        if (i >= emitterCount) {
            break;
        }
        vec2 origin = emitterPositions[i];
        float age = emitterAges[i];

        // Calculate normalized age (0.0 to 1.0)
        float normalizedAge = age / emitterLifespan;
        normalizedAge = clamp(normalizedAge, 0.0, 1.0);

        // Skip emitters that have fully faded
        if (normalizedAge >= 1.0) {
            continue;
        }

        // Calculate attenuation based on a bell curve (fade-in and fade-out)
        float fadeFactor = 1.0;

        if (normalizedAge < fadeInDuration) {
            // Smooth fade-in using smoothstep
            fadeFactor = smoothstep(0.0, fadeInDuration, normalizedAge);
        } else if (normalizedAge > (1.0 - fadeOutDuration)) {
            // Smooth fade-out using smoothstep
            fadeFactor = smoothstep(1.0, 1.0 - fadeOutDuration, normalizedAge);
        }

        // Calculate distance from the current fragment to the emitter
        float dist = distance(uv, origin);

        // Calculate the wave based on distance and elapsed time
        float wave = sin(dist * frequency - age * speed * 6.28318530718); // 2*pi ~ 6.28319

        // Calculate attenuation based on distance and fadeFactor
        float attenuation = amplitude / (dist + 1.0) * fadeFactor;

        // Apply attenuation to wave
        wave *= attenuation;

        // Sum up the waves
        waveSum += wave;
    }

    // Map wave sum directly to wave intensity
    // Scale and clamp to ensure values stay within [0.0, 1.0]
    float waveIntensity = clamp(waveSum * 0.5 + 0.5, 0.0, 1.0);

    // Define background color (white)
    // vec3 backgroundColor = vec3(0.0, 0.5, 0.6); // White background
    vec3 backgroundColor = vec3(1.0); // White background

    // Define wave color (blue)
    vec3 waveColorDesired = vec3(0.0, 0.5, 0.6); // Blue waves
    // vec3 waveColorDesired = vec3(1.0); // Blue waves

    // Blend wave color with background based on waveIntensity
    // This ensures waves appear blue and fade smoothly based on their own intensity
    vec3 finalColor = mix(backgroundColor, waveColorDesired, waveIntensity);

    // Apply final color
    gl_FragColor = vec4(finalColor, 1.0);
}