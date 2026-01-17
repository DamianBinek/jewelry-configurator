// components/scene/NecklaceCurve.tsx
"use client";
import { useMemo } from "react";
import * as THREE from "three";
import { Layer } from "@/lib/store";
import SpringRingClasp from "./SpringRingClasp";

/** Ramanujan (II) — obwód elipsy ~ π [3(a+b) - sqrt((3a+b)(a+3b))]  */
function ellipsePerimeter(a: number, b: number) {
  const h = 3 * (a + b) - Math.sqrt((3 * a + b) * (a + 3 * b));
  return Math.PI * h;
}

/** Wyznacza półosie elipsy (a – pion, b – poziom) dla zadanej długości i proporcji a/b */
function solveEllipseSemiAxes(targetLenM: number, aspect: number) {
  // a = aspect * b
  let bMin = 0.01,
    bMax = 1.5; // sensowne widełki w metrach
  for (let i = 0; i < 40; i++) {
    const b = 0.5 * (bMin + bMax);
    const a = aspect * b;
    const p = ellipsePerimeter(a, b);
    if (p > targetLenM) bMax = b;
    else bMin = b;
  }
  const b = 0.5 * (bMin + bMax);
  const a = aspect * b;
  return { a, b };
}

/** Krzywa owalu w płaszczyźnie XZ z luką (gapAngle) u góry na zapięcie */
class OvalCurve extends THREE.Curve<THREE.Vector3> {
  constructor(
    private a: number, // pół-oś pionowa (Y)
    private b: number, // pół-oś pozioma (X)
    private gapAngle = 0.14, // luka ~8° po każdej stronie szczytu
  ) {
    super();
  }
  getPoint(t: number, target = new THREE.Vector3()) {
    const theta = this.gapAngle * 0.5 + t * (Math.PI * 2 - this.gapAngle);
    const x = this.b * Math.sin(theta);
    const y = this.a * Math.cos(theta);
    return target.set(x, y, 0); // ⬅️ XY zamiast XZ
  }
}

type Props = {
  layer: Layer;
  /** cm 25–50; jeśli podasz layer.lengthMm, ten prop nadpisze (jest wygodniejszy do suwaka) */
  lengthCm?: number;
  /** jak bardzo „spłaszczony" owal:  a/b; 1.15 = delikatny drop jak na zdjęciu */
  aspect?: number;
};

export default function NecklaceCurve({
  layer,
  lengthCm,
  aspect = 1.15,
}: Props) {
  // jednostki sceny = metry (jak u Ciebie: promień 0.0015 => 1.5 mm)
  const lengthM = (lengthCm ? lengthCm * 10 : layer.lengthMm) / 1000;
  // ring zbudowany w XY z normalną +Z  -> chcemy, by normalna była w +X (bokiem do kierunku Y)
  const qZtoX = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 0, 1), // lokalne Z ringu
    new THREE.Vector3(1, 0, 0), // lokalne X końcówki (prostopadłe do Y=kierunek)
  );
  // jeśli ma być „w drugą stronę” (na -X), użyj qZtoMinusX:
  const qZtoMinusX = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 0, 1),
    new THREE.Vector3(-1, 0, 0),
  );

  const { tube, endA, endB } = useMemo(() => {
    // półosie dla zadanej długości
    const { a, b } = solveEllipseSemiAxes(lengthM, aspect);

    // budujemy krzywą z luką u góry (zapięcie wejdzie w przerwę)
    const curve = new OvalCurve(a, b, 0.088);

    // rurka łańcuszka
    const tube = new THREE.TubeGeometry(curve, 512, 0.00048, 12, false);

    // pozycje i styczne na końcach (do ustawienia zapięcia)
    const p0 = curve.getPoint(0);
    const p1 = curve.getPoint(1);
    const t0 = curve.getTangent(0).normalize();
    const t1 = curve.getTangent(1).normalize();

    // przygotuj transformy końców (pozycja + obrót tak, by oś Y patrzyła wzdłuż tangenty)
    const look = new THREE.Vector3(0, 1, 0);
    const q0 = new THREE.Quaternion().setFromUnitVectors(look, t0);
    const q1 = new THREE.Quaternion().setFromUnitVectors(look, t1);

    return {
      tube,
      endA: { pos: p0, rot: q0 },
      endB: { pos: p1, rot: q1 },
    };
  }, [lengthM, aspect]);

  return (
    <group>
      {/* sam „łańcuszek” */}
      <mesh geometry={tube}>
        <meshStandardMaterial
          color={0xffffff}
          metalness={0.9}
          roughness={0.25}
          envMapIntensity={1.0}
        />
      </mesh>
      // LEWY KONIEC – małe kółko
      {/* <group position={endA.pos} quaternion={endA.rot}>
        <mesh position={[0, -0.004, 0]}>
          <torusGeometry args={[0.0022, 0.0005, 12, 18]} />
          <meshStandardMaterial
            color={0xffffff}
            metalness={0.9}
            roughness={0.25}
          />
        </mesh>
      </group> */}
      // PRAWY KONIEC – SPRING RING (inline, jak na referencji)
      <group position={endB.pos} quaternion={endB.rot}>
        {/* lekkie przesunięcie w prawo (wzdłuż osi naszyjnika) */}
        <group position={[0, 0.00265, 0]} quaternion={qZtoMinusX}>
          <SpringRingClasp color={0xffffff} scaleMm={6} openDir={1} roll={0} />
        </group>
      </group>
    </group>
  );
}
