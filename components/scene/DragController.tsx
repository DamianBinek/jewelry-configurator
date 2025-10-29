"use client";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useRef, useState, useEffect } from "react";
import { useApp } from "@/lib/store";
import { arcLengthAtT, closestTOnCurve, createLayerCurve } from "@/lib/curves";

export default function DragController() {
  const { camera, scene, gl } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const [dragId, setDragId] = useState<string | null>(null);
  const { beads, moveBead, layers, defs, gapMm, selectBead } = useApp();

  function onPointerDown(e: PointerEvent) {
    const el = gl.domElement;
    const rect = el.getBoundingClientRect();
    mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.current.setFromCamera(mouse.current, camera);
    const intersects = raycaster.current.intersectObjects(scene.children, true);
    const hit = intersects.find((i) => (i.object as any).isMesh);
    if (!hit) return;

    let closest: { id: string; dist: number } | null = null;
    for (const b of beads) {
      const layer = layers.find((l) => l.id === b.layer)!;
      const curve = createLayerCurve(layer.lengthMm);
      const totalLenM = arcLengthAtT(curve, 1);
      const t = b.sMm / 1000 / totalLenM;
      const p = curve.getPoint(t);
      const d = p.distanceTo(hit.point);
      if (!closest || d < closest.dist) closest = { id: b.id, dist: d };
    }
    if (closest && closest.dist < 0.03) {
      setDragId(closest.id);
      selectBead(closest.id);
    }
  }

  function onPointerMove(e: PointerEvent) {
    if (!dragId) return;

    const el = gl.domElement;
    const rect = el.getBoundingClientRect();
    mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.current.setFromCamera(mouse.current, camera);

    // Rzut na płaszczyznę roboczą
    const planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const hitPoint = new THREE.Vector3();
    raycaster.current.ray.intersectPlane(planeZ, hitPoint);

    const bead = beads.find((b) => b.id === dragId)!;
    const layer = layers.find((l) => l.id === bead.layer)!;
    const curve = createLayerCurve(layer.lengthMm);

    // 1) Docelowe t i surowe s (mm) dla pozycji kursora
    const t = closestTOnCurve(curve, hitPoint, 120);
    const sMeters = arcLengthAtT(curve, t);
    let sRawMm = sMeters * 1000;

    // Parametry przeciąganego
    const selfDef = defs.find((d) => d.id === bead.defId)!;
    const rSelf = selfDef.baseDiameterMm / 2;

    // Pozostali na tej warstwie
    const others = beads
      .filter((b) => b.layer === bead.layer && b.id !== bead.id)
      .sort((a, b) => a.sMm - b.sMm);

    // 2) Jeśli najedziemy na inny koralik → snap ZA niego (po kierunku krzywej)
    // Definicja kolizji przedziałowej: |sRaw - sOther| < rSelf + rOther
    const VISUAL_BIAS_MM = -0.05; // domyka mikroszczeliny; możesz dać 0
    for (const o of others) {
      const oDef = defs.find((d) => d.id === o.defId)!;
      const rO = oDef.baseDiameterMm / 2;
      const collideHalfSpan = rSelf + rO;
      if (Math.abs(sRawMm - o.sMm) <= collideHalfSpan) {
        // snap ZA ten koralik
        sRawMm = o.sMm + (rO + rSelf) + VISUAL_BIAS_MM;
        break;
      }
    }

    // 3) Po ewentualnym snapie wyznaczamy nowe sąsiedztwo (gdzie „wkładamy” koralik)
    let insertIdx = others.findIndex((b) => sRawMm < b.sMm);
    if (insertIdx === -1) insertIdx = others.length;

    const prev = insertIdx > 0 ? others[insertIdx - 1] : null;
    const next = insertIdx < others.length ? others[insertIdx] : null;

    const prevDef = prev ? defs.find((d) => d.id === prev.defId)! : null;
    const nextDef = next ? defs.find((d) => d.id === next.defId)! : null;

    // 4) Zero przerw: min/max to sumy promieni; bias domyka szczeliny
    const min =
      prev && prevDef
        ? prev.sMm + (prevDef.baseDiameterMm / 2 + rSelf) + VISUAL_BIAS_MM
        : 0;

    const max =
      next && nextDef
        ? next.sMm - (nextDef.baseDiameterMm / 2 + rSelf) - VISUAL_BIAS_MM
        : layer.lengthMm;

    // 5) Klamrujemy i zapisujemy
    const sClamped = Math.max(min, Math.min(max, sRawMm));
    moveBead(dragId, sClamped);
  }

  function onPointerUp() {
    setDragId(null);
  }

  useEffect(() => {
    const el = gl.domElement as HTMLCanvasElement;
    const d = (e: any) => onPointerDown(e);
    const m = (e: any) => onPointerMove(e);
    const u = () => onPointerUp();
    el.addEventListener("pointerdown", d);
    window.addEventListener("pointermove", m);
    window.addEventListener("pointerup", u);
    return () => {
      el.removeEventListener("pointerdown", d);
      window.removeEventListener("pointermove", m);
      window.removeEventListener("pointerup", u);
    };
  }, [gl, beads, dragId]);

  return null;
}
