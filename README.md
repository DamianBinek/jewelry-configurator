# jewelry-configurator

Inspirational 3D jewelry configurator — Next.js + TypeScript + react-three-fiber + Tailwind + shadcn-style UI (minimal).

## Quick start

```bash
pnpm i   # or yarn / npm
pnpm dev
# open http://localhost:3000/configurator
```

## What's inside

- 3D scene with a necklace cord (Tube over CatmullRomCurve3)
- Beads (primitive geometries for out-of-the-box run)
- Drag along the curve with hard spacing (no overlaps)
- Catalog panel, Inspector panel, Top bar with live price
- Tailwind + minimal shadcn-like Button/Card components
- Ready for real assets (GLB/KTX2/HDRI) later

## Notes

- Replace primitive geometries by GLB models when ready.
- For realistic gems: use `MeshPhysicalMaterial` with transmission/ior/thickness and HDRI environment.
- Set `NEXT_PUBLIC_GA_ID` and add a GA component if needed.