"use client";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useEffect } from "react";
import { useApp } from "@/lib/store";
import NecklaceCurve from "./NecklaceCurve";
import Bead from "./Bead";
import DragController from "./DragController";

export default function SceneCanvas() {
  const { beads, layers, loadDefaults, lockCamera } = useApp();

  useEffect(() => {
    loadDefaults();
  }, [loadDefaults]);

  return (
    <Canvas
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      camera={{ position: [0, 0, 0.32], fov: 40 }}
    >
      <color attach="background" args={["#0f172a"]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[1, 1, 1]} intensity={0.7} />
      <Environment preset="studio" background={false} />

      {layers.map((l) => (
        <NecklaceCurve key={l.id} layer={l} aspect={1.15} />
      ))}

      {beads.map((b) => (
        <Bead key={b.id} bead={b} />
      ))}

      <DragController />
      {/* 🔒 kontrola blokady kamery */}
      <OrbitControls
        target={[0, 0, 0]}
        enabled={!lockCamera}
        enablePan={false}
        minDistance={0.18}
        maxDistance={0.7}
      />
    </Canvas>
  );
}
