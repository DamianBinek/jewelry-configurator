import * as THREE from "three";

/**
 * Proceduralna krzywa „łezka” przypominająca klasyczny naszyjnik.
 * lengthMm = przybliżony obwód (dla skali); wynik to zamknięta pętla.
 *
 * Parametry heurystyczne dobrane pod realistyczny kształt:
 *  - spłaszczona góra
 *  - wydłużony dół (łezka)
 */
export function createLayerCurve(lengthMm: number) {
  const perimeter = Math.max(200, lengthMm) / 1000; // metry, dolny limit żeby nie robić degeneracji
  const width = (perimeter / Math.PI) * 0.85;   // szerokość
  const height = (perimeter / Math.PI) * 1.10;  // wysokość
  const topFlattenPow = 1.7;                    // spłaszczenie góry
  const bottomStretch = 1.15;                   // wydłużenie dołu

  const N = 220;                                // liczba punktów dyskretyzacji
  const pts: THREE.Vector3[] = [];

  for (let i = 0; i < N; i++) {
    const t = (i / N) * Math.PI * 2;            // 0..2π
    const sx = Math.sin(t);
    const cy = Math.cos(t);

    const x = (width / 2) * sx;

    // spłaszczaj górę (cy>0) i wydłużaj dół (cy<0)
    const cyAbs = Math.pow(Math.abs(cy), topFlattenPow);
    let y = -(height / 2) * Math.sign(cy) * cyAbs;
    if (cy < 0) y *= bottomStretch;

    pts.push(new THREE.Vector3(x, y, 0));
  }

  // Zamknięta, gładka krzywa
  const curve = new THREE.CatmullRomCurve3(pts, true, "catmullrom", 0.5);
  return curve;
}

/** Najbliższy parametr t na krzywej do punktu w przestrzeni */
export function closestTOnCurve(curve: THREE.Curve<THREE.Vector3>, point: THREE.Vector3, samples = 100) {
  let bestT = 0;
  let bestD = Infinity;
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const c = curve.getPoint(t);
    const d = c.distanceToSquared(point);
    if (d < bestD) {
      bestD = d;
      bestT = t;
    }
  }
  return bestT;
}

/** Przybliżona długość łuku od 0 do t (metry) */
export function arcLengthAtT(curve: THREE.Curve<THREE.Vector3>, t: number, steps = 80) {
  let len = 0;
  let prev = curve.getPoint(0);
  for (let i = 1; i <= steps; i++) {
    const tt = (t * i) / steps;
    const p = curve.getPoint(tt);
    len += p.distanceTo(prev);
    prev = p;
  }
  return len; // meters
}
