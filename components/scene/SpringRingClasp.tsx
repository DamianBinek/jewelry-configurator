// components/scene/SpringRingClasp.tsx
"use client";
import * as THREE from "three";

type Props = {
  color?: number;
  metalness?: number;
  roughness?: number;
  scaleMm?: number; // zewn. średnica ringu, np. 6 mm
  roll?: number; // dodatkowy obrót wokół osi łańcuszka (radiany)
  openDir?: 1 | -1; // 1 – szczelina po prawej, -1 – po lewej
};

export default function SpringRingClasp({
  color = 0xd4af37,
  metalness = 0.95,
  roughness = 0.22,
  scaleMm = 6,
  roll = 0,
  openDir = 1,
}: Props) {
  const S = scaleMm / 1000;
  const R = S * 0.5 * 0.78; // promień torusa (środek drutu)
  const T = S * 0.08; // grubość drutu
  const GAP = Math.PI * 0.26; // szerokość szczeliny
  const mat = new THREE.MeshStandardMaterial({ color, metalness, roughness });

  return (
    // UWAGA: brak rotacji globalnej — płaszczyzna ringu = XY (inline do osi-Y)
    <group rotation={[0, 0, roll]}>
      {/* ring z przerwą – szczelina ustawiona w osi X (lewo/prawo) */}
      <mesh material={mat} rotation={[0, 0, openDir > 0 ? 0 : Math.PI]}>
        <torusGeometry args={[R, T, 16, 48, Math.PI * 2 - GAP]} />
      </mesh>

      {/* „zaczep” przy szczelinie */}
      <mesh material={mat} position={[openDir * (R + T * 0.55), 0, 0]}>
        {/* @ts-ignore */}
        <capsuleGeometry args={[T * 0.52, T * 1.2, 6, 10]} />
      </mesh>

      {/* dźwignia zapadki wzdłuż szczeliny */}
      <group
        position={[openDir * (R - T * 0.2), 0, 0]}
        rotation={[0, 0, openDir * 0.05]}
      >
        {/* pręt */}
        <mesh material={mat}>
          {/* @ts-ignore */}
          <capsuleGeometry args={[T * 0.35, R * 0.55, 6, 10]} />
        </mesh>
        {/* zawias */}
        <mesh material={mat} position={[-openDir * (R * 0.3), 0, 0]}>
          <sphereGeometry args={[T * 0.45, 12, 12]} />
        </mesh>
        {/* języczek */}
        <mesh
          material={mat}
          position={[openDir * (R * 0.34), 0, 0]}
          rotation={[0, 0, openDir * 0.08]}
        >
          <boxGeometry args={[T * 1.6, T * 0.35, T * 0.9]} />
        </mesh>
      </group>

      {/* mały „łącznik” w osi Y do wpięcia w ostatnie ogniwo łańcuszka */}
      <mesh material={mat} position={[0, -R - T * 0.7, 0]}>
        <torusGeometry args={[T * 0.9, T * 0.35, 12, 16]} />
      </mesh>

      {/* górne oczko (bail) – opcjonalne */}
      <mesh material={mat} position={[0, R + T * 1.3, 0]}>
        <torusGeometry args={[T * 1.9, T * 0.45, 12, 18]} />
      </mesh>
    </group>
  );
}
