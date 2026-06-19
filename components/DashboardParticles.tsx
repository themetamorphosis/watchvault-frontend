"use client";

import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function generateParticleData(count: number) {
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const colors = new Float32Array(count * 3);

  const colorPalette = [
    new THREE.Color("#ff3864"),
    new THREE.Color("#a855f7"),
    new THREE.Color("#38bdf8"),
    new THREE.Color("#ffffff"),
  ];

  for (let i = 0; i < count; i++) {
    const r = 5 + Math.random() * 25;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);

    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);

    sizes[i] = 0.5 + Math.random() * 3.5;

    const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  return { positions, sizes, colors };
}

function Particles({ count = 250 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const mouse = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -(event.clientY / window.innerHeight) * 2 + 1;
      mouse.current.targetX = x * 0.4;
      mouse.current.targetY = y * 0.4;
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const [{ positions, colors }] = useState(() => generateParticleData(count));

  useFrame((state) => {
    if (!pointsRef.current) return;

    // Smoothly interpolate mouse target coordinates (lerp)
    mouse.current.x += (mouse.current.targetX - mouse.current.x) * 0.05;
    mouse.current.y += (mouse.current.targetY - mouse.current.y) * 0.05;

    // Slowly rotate points
    pointsRef.current.rotation.y =
      state.clock.elapsedTime * 0.015 + mouse.current.x;
    pointsRef.current.rotation.x =
      state.clock.elapsedTime * 0.008 + mouse.current.y;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        vertexColors
        transparent
        opacity={0.45}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function DashboardParticles() {
  return (
    <div className="absolute inset-0 -z-10 pointer-events-none w-full h-full overflow-hidden select-none bg-[#030303]">
      {/* Ambient gradients under WebGL */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-rose-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-[30%] right-[10%] w-[40%] h-[40%] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />

      <Canvas
        camera={{ position: [0, 0, 15], fov: 60 }}
        gl={{
          alpha: true,
          antialias: false,
          powerPreference: "high-performance",
        }}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
        dpr={[1, 1.5]}
      >
        <Particles />
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-b from-[#030303]/10 via-transparent to-[#030303]/90 pointer-events-none" />
      {/* Film grain/noise overlay */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
