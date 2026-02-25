"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

/* ─── GLSL helpers ─── */
const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec2 uResolution;

  varying vec2 vUv;

  /* ── noise helpers ── */
  float hash(float n) {
    return fract(sin(n) * 43758.5453123);
  }

  float hash2(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash2(i);
    float b = hash2(i + vec2(1.0, 0.0));
    float c = hash2(i + vec2(0.0, 1.0));
    float d = hash2(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  /* ── palette: muted rose, violet, cyan ── */
  vec3 rose   = vec3(0.75, 0.20, 0.35);   // softer rose
  vec3 violet = vec3(0.50, 0.28, 0.72);   // muted violet
  vec3 cyan   = vec3(0.20, 0.55, 0.75);   // softer cyan
  vec3 white  = vec3(0.85, 0.85, 0.90);

  /* ── single bar layer ── */
  float barLayer(vec2 uv, float freq, float speed, float time, float seed) {
    // x-frequency: how many vertical bars
    float barX = uv.x * freq;
    float barIndex = floor(barX);
    float barFrac = fract(barX);

    // per-bar randomness
    float barRand = hash(barIndex * 13.73 + seed);

    // bar height oscillates slowly with time + per-bar offset
    float heightBase = 0.2 + 0.4 * barRand;
    float heightOsc = sin(time * speed * (0.2 + barRand * 0.8) + barRand * 6.283) * 0.5 + 0.5;
    float barHeight = heightBase * heightOsc;

    // thickness — narrow bars with gentle edges
    float thickness = 0.2 + barRand * 0.35;
    float barMask = smoothstep(0.5 - thickness * 0.5, 0.5 - thickness * 0.5 + 0.12, barFrac)
                  * (1.0 - smoothstep(0.5 + thickness * 0.5 - 0.12, 0.5 + thickness * 0.5, barFrac));

    // vertical extent — bars grow from bottom center
    float yCenter = 0.5 + sin(time * 0.3 + barRand * 3.14) * 0.1;
    float barVertical = smoothstep(yCenter - barHeight * 0.5, yCenter - barHeight * 0.5 + 0.05, uv.y)
                      * (1.0 - smoothstep(yCenter + barHeight * 0.5 - 0.05, yCenter + barHeight * 0.5, uv.y));

    return barMask * barVertical;
  }

  /* ── subtle glitch burst ── */
  float glitch(vec2 uv, float time) {
    float glitchBlock = floor(uv.x * 30.0);
    float glitchTime = floor(time * 2.0);
    float g = hash(glitchBlock * 7.13 + glitchTime * 3.97);

    // only trigger ~5% of blocks — very sparse
    float trigger = step(0.95, g);
    float intensity = hash(glitchBlock * 11.3 + glitchTime * 5.1) * trigger;

    return intensity * 0.2;
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / uResolution.y;
    vec2 uvAspect = vec2(uv.x * aspect, uv.y);

    float t = uTime;

    // === Layer 1: dense bars (foreground) — slow ===
    float layer1 = barLayer(uv, 90.0, 0.4, t, 0.0);
    vec3 col1 = mix(rose, violet, sin(uv.x * 4.0 + t * 0.15) * 0.5 + 0.5);

    // === Layer 2: medium bars (midground) — slower ===
    float layer2 = barLayer(uv, 50.0, 0.25, t + 2.0, 100.0);
    vec3 col2 = mix(violet, cyan, sin(uv.x * 3.0 + t * 0.1 + 1.0) * 0.5 + 0.5);

    // === Layer 3: sparse bars (background) — slowest ===
    float layer3 = barLayer(uv, 25.0, 0.15, t + 5.0, 200.0);
    vec3 col3 = mix(cyan, rose, sin(uv.x * 5.0 + t * 0.08 + 2.5) * 0.5 + 0.5);

    // Combine layers — much softer intensities
    vec3 color = vec3(0.0);
    color += col3 * layer3 * 0.07;   // back layer — whisper
    color += col2 * layer2 * 0.12;   // mid layer — soft
    color += col1 * layer1 * 0.18;   // front layer — gentle

    // === Rare glitch flicker ===
    float g = glitch(uv, t);
    vec3 glitchColor = mix(white, rose, hash(floor(uv.x * 30.0) + floor(t * 3.0) * 7.0));
    color += glitchColor * g * 0.12;

    // === Very subtle horizontal scan line ===
    float scanY = fract(t * 0.06);
    float scanLine = smoothstep(scanY - 0.015, scanY, uv.y) * (1.0 - smoothstep(scanY, scanY + 0.015, uv.y));
    color += white * scanLine * 0.03;

    // === Ambient glow — soft noise-based nebula underneath ===
    float n1 = noise(uvAspect * 2.5 + t * 0.08);
    float n2 = noise(uvAspect * 4.0 - t * 0.06 + 10.0);  
    vec3 ambient = mix(rose, violet, n1) * 0.03 + mix(cyan, violet, n2) * 0.025;
    color += ambient;

    // === Edge fade (vignette) ===
    float vignette = 1.0 - smoothstep(0.3, 0.85, length(uv - 0.5) * 1.3);
    color *= vignette;

    // === Overall brightness — cinematic dim ===
    color *= 0.65;

    gl_FragColor = vec4(color, 1.0);
  }
`;

/* ─── Shader mesh ─── */
function ShaderPlane() {
  const meshRef = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1920, 1080) },
    }),
    []
  );

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = state.clock.elapsedTime;

      // Update resolution
      const { width, height } = state.size;
      material.uniforms.uResolution.value.set(width, height);
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}

/* ─── Main component ─── */
export default function HeroBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0"
      style={{ isolation: "isolate" }}
    >
      <Canvas
        gl={{
          alpha: true,
          antialias: false,
          powerPreference: "high-performance",
        }}
        camera={{ position: [0, 0, 1] }}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
        dpr={[1, 1.5]}
      >
        <ShaderPlane />
        <EffectComposer>
          <Bloom
            intensity={0.35}
            luminanceThreshold={0.3}
            luminanceSmoothing={0.95}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
