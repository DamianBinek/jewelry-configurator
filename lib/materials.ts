import * as THREE from "three";

export function createMetalMaterial(): THREE.MeshStandardMaterial {
  const m = new THREE.MeshStandardMaterial({ metalness: 1, roughness: 0.2, color: 0xb5b5b5 });
  return m;
}

export function createGlassMaterial(opts: {
  ior?: number; thickness?: number; attenuationColor?: string; attenuationDistance?: number;
} = {}) {
  const mat = new THREE.MeshPhysicalMaterial({
    metalness: 0,
    roughness: 0.02,
    transmission: 1,
    ior: opts.ior ?? 1.5,
    thickness: opts.thickness ?? 2,
    attenuationColor: opts.attenuationColor ? new THREE.Color(opts.attenuationColor) : undefined,
    attenuationDistance: opts.attenuationDistance ?? 50,
    envMapIntensity: 1.0,
    clearcoat: 0.1,
  });
  return mat;
}