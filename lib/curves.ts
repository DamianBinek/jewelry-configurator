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

/**
 * Finds the next available position (in mm) on the necklace curve.
 * Considers existing beads and their sizes to avoid overlap.
 * Returns null if no space is available
 * 
 * @param curve The necklace curve
 * @param existingBeads Array of existing beads with their sMm positions and sizes
 * @param newBeadSizeMm The diameter of the new bead being added
 * @param gapMm Minimum gap between beads
 * @param curveGapAngle The gap angle of the OvalCurve (default 0.14)
 * @returns The sMm position for the new bead, or null if no space available
 */
export function findNextAvailablePosition(
  curve: THREE.Curve<THREE.Vector3>,
  existingBeads: Array<{ sMm: number; sizeMm: number }>,
  newBeadSizeMm: number,
  gapMm: number = 0,
  curveGapAngle: number = 0.14
): number | null {
  const totalLenM = arcLengthAtT(curve, 1);
  const totalLenMm = totalLenM * 1000;
  
  // Calculate the arc length occupied by the gap (in mm)
  const gapArcLength = (curveGapAngle / (Math.PI * 2)) * totalLenMm;
  const usableLenMm = totalLenMm - gapArcLength;
  
  // Gap position (where the curve is unavailable)
  const gapStart = totalLenMm - gapArcLength / 2;
  const gapEnd = gapArcLength / 2;

  const requiredSpace = newBeadSizeMm / 2 + gapMm + newBeadSizeMm / 2;

  if (existingBeads.length === 0) {
    // No beads yet - place after the gap
    const startPos = gapEnd + 10;
    return startPos;
  }

  // Sort existing beads by position
  const sorted = [...existingBeads].sort((a, b) => a.sMm - b.sMm);

  // Check gaps between existing beads
  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    const next = sorted[(i + 1) % sorted.length];

    const currentEnd = current.sMm + current.sizeMm / 2 + gapMm;
    const nextStart = next.sMm - next.sizeMm / 2 - gapMm;

    let availableStart: number;
    let availableEnd: number;

    if (i === sorted.length - 1) {
      // Last bead to first bead (wrapping around)
      // Available space goes from currentEnd to nextStart, wrapping around the curve
      
      // Check if we can fit before the gap
      if (currentEnd < gapStart) {
        availableStart = currentEnd;
        availableEnd = gapStart;
        const space = availableEnd - availableStart;
        
        if (space >= requiredSpace) {
          const candidatePos = availableStart + newBeadSizeMm / 2 + gapMm;
          return candidatePos;
        }
      }

      // Check if we can fit after the gap
      if (nextStart > gapEnd) {
        availableStart = gapEnd;
        availableEnd = nextStart;
        const space = availableEnd - availableStart;
        
        if (space >= requiredSpace) {
          const candidatePos = availableStart + newBeadSizeMm / 2 + gapMm;
          return candidatePos;
        }
      }
    } else {
      // Regular gap between two beads (not wrapping)
      availableStart = currentEnd;
      availableEnd = nextStart;
      const space = availableEnd - availableStart;

      if (space >= requiredSpace) {
        // Check if this space overlaps with the curve gap
        const spaceOverlapsGap = 
          (availableStart < gapEnd && availableEnd > gapStart) ||
          (availableStart < gapEnd && gapStart < availableEnd && availableEnd > gapEnd) ||
          (availableStart < gapStart && availableEnd > gapEnd);

        if (!spaceOverlapsGap) {
          // Space doesn't overlap with curve gap - safe to place here
          const candidatePos = availableStart + newBeadSizeMm / 2 + gapMm;
          return candidatePos;
        }
      }
    }
  }

  return null; // No space available
}

/**
 * Ramanujan (II) approximation for ellipse perimeter
 * obwód elipsy ~ π [3(a+b) - sqrt((3a+b)(a+3b))]
 */
export function ellipsePerimeter(a: number, b: number) {
  const h = 3 * (a + b) - Math.sqrt((3 * a + b) * (a + 3 * b));
  return Math.PI * h;
}

/**
 * Solve ellipse semi-axes for given target length and aspect ratio
 * a = aspect * b (vertical semi-axis, horizontal semi-axis)
 */
export function solveEllipseSemiAxes(targetLenM: number, aspect: number) {
  let bMin = 0.01,
    bMax = 1.5; // sensible range in meters
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

/**
 * Oval curve - ellipse with gap at top for clasp
 * Used by the necklace visualization
 */
export class OvalCurve extends THREE.Curve<THREE.Vector3> {
  constructor(
    private a: number, // vertical semi-axis (Y)
    private b: number, // horizontal semi-axis (X)
    private gapAngle = 0.14 // gap ~8° on each side of top
  ) {
    super();
  }

  getPoint(t: number, target = new THREE.Vector3()) {
    const theta = this.gapAngle * 0.5 + t * (Math.PI * 2 - this.gapAngle);
    const x = this.b * Math.sin(theta);
    const y = this.a * Math.cos(theta);
    return target.set(x, y, 0);
  }
}

/**
 * Create OvalCurve for a necklace layer with given length
 * aspect = 1.15 creates the teardrop drop shape
 */
export function createOvalCurve(lengthMm: number, aspect: number = 1.15): OvalCurve {
  const lengthM = lengthMm / 1000; // convert to meters
  const { a, b } = solveEllipseSemiAxes(lengthM, aspect);
  return new OvalCurve(a, b, 0.088); // 0.088 radians gap
}

/**
 * Convert arc position in mm to curve parameter t (0-1)
 * Uses binary search to find the correct t value for the given arc length
 */
export function sMmToT(curve: THREE.Curve<THREE.Vector3>, sMm: number, gapAngle: number = 0.14): number {
  const totalLenM = arcLengthAtT(curve, 1);
  const totalLenMm = totalLenM * 1000;
  
  // Clamp to valid range [0, totalLenMm)
  const normalizedSMm = ((sMm % totalLenMm) + totalLenMm) % totalLenMm;
  const targetArcLenM = normalizedSMm / 1000; // Convert to meters
  
  // Binary search to find t that gives us the target arc length
  let tMin = 0;
  let tMax = 1;
  const tolerance = 0.0001; // tolerance in meters
  
  for (let iter = 0; iter < 50; iter++) {
    const tMid = (tMin + tMax) / 2;
    const arcLenAtMid = arcLengthAtT(curve, tMid);
    
    if (Math.abs(arcLenAtMid - targetArcLenM) < tolerance) {
      return tMid;
    }
    
    if (arcLenAtMid < targetArcLenM) {
      tMin = tMid;
    } else {
      tMax = tMid;
    }
  }
  
  return (tMin + tMax) / 2;
}
