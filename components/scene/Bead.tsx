"use client";
import { useMemo } from "react";
import * as THREE from "three";
import { BeadInstance, useApp } from "@/lib/store";
import { arcLengthAtT, createLayerCurve } from "@/lib/curves";
import { createGlassMaterial, createMetalMaterial } from "@/lib/materials";
import { Billboard } from "@react-three/drei";

function PrimitiveGeometry({ kind }: { kind: string }) {
  if (kind === "sphere6") return <sphereGeometry args={[0.003, 32, 32]} />; // 6mm => 0.003m
  if (kind === "sphere8") return <sphereGeometry args={[0.004, 32, 32]} />; // 8mm => 0.004m
  if (kind === "icosa8") return <icosahedronGeometry args={[0.004, 2]} />;
  return <sphereGeometry args={[0.0035, 32, 32]} />;
}

export default function Bead({ bead }: { bead: BeadInstance }) {
  const { defs, layers, selectedBeadId } = useApp();
  const def = defs.find((d) => d.id === bead.defId)!;
  const layer = layers.find((l) => l.id === bead.layer)!;

  const { position, orientation } = useMemo(() => {
    const curve = createLayerCurve(layer.lengthMm);
    const totalLenM = arcLengthAtT(curve, 1);
    const t = bead.sMm / 1000 / totalLenM;
    const pos = curve.getPoint(t);
    const tangent = curve.getTangent(t);
    const quat = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    quat.setFromUnitVectors(up, tangent.clone().normalize());
    return { position: pos, orientation: quat };
  }, [bead.sMm, layer.lengthMm]);

  const material = useMemo(() => {
    if (def.materialKind === "metal") return createMetalMaterial();
    if (def.materialKind === "glass" || def.materialKind === "gem") {
      return createGlassMaterial({
        ior: def.ior,
        thickness: def.thickness,
        attenuationColor: def.attenuationColor,
        attenuationDistance: def.attenuationDistance,
      });
    }
    return new THREE.MeshStandardMaterial({ color: 0xeeeeee });
  }, [def]);

  const kind = def.geometryUrl.startsWith("__primitive__/")
    ? def.geometryUrl.replace("__primitive__/", "")
    : "sphere6";

  const isSelected = bead.id === selectedBeadId;

  // Promień koralika w metrach z definicji (mm -> m)
  const beadRadiusM = def.baseDiameterMm / 1000 / 2;
  // Cienki 2D ring jako „border”
  const inner = beadRadiusM * 1.06; // delikatnie większy od koralika
  const outer = beadRadiusM * 1.12; // grubość obrysu

  return (
    <group position={position} quaternion={orientation}>
      {/* Główny koralik */}
      <mesh>
        <PrimitiveGeometry kind={kind} />
        <primitive object={material} attach="material" />
      </mesh>

      {/* 2D żółty okrąg — border tylko jeden, bez siatki ani poświaty */}
      {isSelected && (
        <Billboard follow lockX lockY={false} lockZ>
          <mesh renderOrder={999}>
            {/* cienki pierścień, zawsze frontem do kamery */}
            <ringGeometry args={[inner, outer, 64]} />
            <meshBasicMaterial
              color="#FFD700"
              transparent
              opacity={1}
              depthTest={false} // rysuj na wierzchu
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        </Billboard>
      )}
    </group>
  );
}
