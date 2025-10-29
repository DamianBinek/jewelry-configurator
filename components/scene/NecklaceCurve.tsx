"use client";
import { useMemo } from "react";
import * as THREE from "three";
import { Layer } from "@/lib/store";
import { createLayerCurve } from "@/lib/curves";

export default function NecklaceCurve({ layer }: { layer: Layer }) {
  const { tube } = useMemo(() => {
    const curve = createLayerCurve(layer.lengthMm);
    // 🔁 zamknięta pętla jak w naszyjniku (ostatni parametr = true)
    const tube = new THREE.TubeGeometry(curve, 512, 0.0015, 12, true);
    return { tube };
  }, [layer.lengthMm]);

  return (
    <mesh geometry={tube}>
      <meshStandardMaterial color={0xdddddd} roughness={0.6} metalness={0.0} />
    </mesh>
  );
}
