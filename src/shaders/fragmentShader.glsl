// src/shaders/fragmentShader.glsl

precision highp float;

uniform float time;
uniform vec2 resolution;

// Maximum number of emitters
const int MAX_EMITTERS = 50;

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
    const float speed = 0.5;
    const float frequency = 10.0;
    const float amplitude = 0.5;

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

        // Calculate distance from the current fragment to the emitter
        float dist = distance(uv, origin);

        // Calculate the wave based on distance and elapsed time
        float wave = sin(dist * frequency - age * speed * 2.0 * 3.141592);

        // Calculate attenuation based on distance and age
        // Linearly fade out the wave influence as emitter ages
        float attenuation = amplitude / (dist + 1.0) * (1.0 - normalizedAge);

        // Apply smooth fading
        wave *= attenuation;

        // Sum up the waves
        waveSum += wave;
    }

    // Map wave sum to wave intensity
    float waveIntensity = (sin(waveSum) + 1.0) / 2.0;

    // Define background color (blue like a pool)
    vec3 backgroundColor = vec3(0.0, 0.2, 0.6); // Adjust RGB as needed

    // Calculate overall fade factor (average normalizedAge)
    float fade = 0.0;
    for (int i = 0; i < MAX_EMITTERS; i++) {
        if (i >= emitterCount) {
            break;
        }
        float age = emitterAges[i];
        float normalizedAge = age / emitterLifespan;
        normalizedAge = clamp(normalizedAge, 0.0, 1.0);
        fade += normalizedAge;
    }
    fade = fade / float(emitterCount > 0 ? emitterCount : 1); // Avoid division by zero

    // Clamp fade between 0.0 and 1.0
    fade = clamp(fade, 0.0, 1.0);

    // Blend wave intensity with white based on waveIntensity and fade
    // This ensures waves appear white and fade smoothly into the blue background
    vec3 waveColor = mix(backgroundColor, vec3(1.0), waveIntensity * (1.0 - fade));

    // Final color blending with background
    // Waves are white on the blue background, fading smoothly as emitters age
    vec3 finalColor = waveColor;

    // Apply final color
    gl_FragColor = vec4(finalColor, 1.0);
}
