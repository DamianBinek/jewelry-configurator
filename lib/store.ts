import { create } from "zustand";
import { createOvalCurve, findNextAvailablePosition } from "./curves";

export type MaterialKind = "glass" | "gem" | "metal" | "wood";
export type LayerId = string;

export interface NecklaceConfig {
  version: 1;
  title: string;
  layers: Layer[];
  beads: BeadInstance[];
  // opcjonalnie: podgląd PNG
  previewDataUrl?: string;
}

export interface BeadDef {
  id: string;
  name: string;
  geometryUrl: string; // glTF lub __primitive__/sphere6 itd.
  beadPreview: string;
  materialKind: MaterialKind;
  price: number; // Y za sztukę
  baseDiameterMm: number;
  transmission?: number; // dla glass/gem
  ior?: number;
  thickness?: number;
  attenuationColor?: string; // hex
  attenuationDistance?: number;
}

export interface Layer {
  id: LayerId;
  name: string;
  lengthMm: number; // X
  cordMaterial: "steel" | "silk" | "nylon";
  cordPrice: number; // cena bazowa dla tej warstwy
}

export interface BeadInstance {
  id: string;
  defId: string;
  layer: LayerId;
  sMm: number; // pozycja po długości łuku
  diameterMm?: number;
  rotation?: number;
}

interface AppState {
  title: string;
  layers: Layer[];
  beads: BeadInstance[];
  defs: BeadDef[];
  selectedBeadId?: string;
  gapMm: number;           // minimalny odstęp
  lockCamera: boolean;     // 🔒 nowość
  lastError?: string;      // error message

  setTitle: (title: string) => void; 
  addBead: (defId: string, layer: LayerId, sMm?: number) => void;
  moveBead: (id: string, sMm: number) => void;
  removeBead: (id: string) => void;
  selectBead: (id?: string) => void;
  setLayerLength: (layerId: string, lengthMm: number) => void;
  addLayer: (name: string, lengthMm: number) => void;
  setLockCamera: (v: boolean) => void;     // 🔒 nowość
  loadDefaults: () => void;
  getConfig: () => NecklaceConfig;
  loadConfig: (cfg: NecklaceConfig) => void;
}

export const useApp = create<AppState>((set, get) => ({
  layers: [],
  title: 'My Necklace',
  beads: [],
  defs: [],
  gapMm: 0, //odstęp między koralikami
  lockCamera: false, // ustaw na true, jeśli chcesz startowo zablokowaną kamerę
  lastError: undefined,

  setTitle: (title) => set({ title: title }),

  addBead: (defId, layer, sMm) =>
    set((state): Partial<AppState> => {
      // Find the bead definition to get its size
      const def = state.defs.find((d) => d.id === defId);
      const beadSizeMm = def?.baseDiameterMm || 6; // Default 6mm if not found

      // Find the layer to get its length
      const layerObj = state.layers.find((l) => l.id === layer);
      if (!layerObj) {
        return {
          lastError: "Layer not found",
        };
      }

      // If sMm not provided, calculate the next available position
      let finalSMm: number | null = sMm ?? null;
      if (finalSMm === null) {
        const curve = createOvalCurve(layerObj.lengthMm);
        const existingBeadsOnLayer = state.beads
          .filter((b) => b.layer === layer)
          .map((b) => {
            const beadDef = state.defs.find((d) => d.id === b.defId);
            return {
              sMm: b.sMm,
              sizeMm: beadDef?.baseDiameterMm || 6,
            };
          });
        finalSMm = findNextAvailablePosition(
          curve,
          existingBeadsOnLayer,
          beadSizeMm,
          state.gapMm,
          0.14 // gapAngle from OvalCurve
        );
        
        // Check if space is available
        if (finalSMm === null) {
          return {
            lastError: "No space available on necklace for this bead",
          };
        }
      }

      return {
        beads: [...state.beads, { id: crypto.randomUUID(), defId, layer, sMm: finalSMm }],
        lastError: undefined,
      };
    }),

  moveBead: (id, sMm) =>
    set((state) => ({
      beads: state.beads.map((b) => (b.id === id ? { ...b, sMm } : b)),
    })),

  removeBead: (id) =>
    set((state) => ({ beads: state.beads.filter((b) => b.id !== id) })),

  selectBead: (id) => set({ selectedBeadId: id }),

  setLayerLength: (layerId, lengthMm) =>
    set((state) => ({
      layers: state.layers.map((l) => (l.id === layerId ? { ...l, lengthMm } : l)),
    })),

  addLayer: (name, lengthMm) =>
    set((state) => ({
      layers: [
        ...state.layers,
        { id: crypto.randomUUID(), name, lengthMm, cordMaterial: "nylon", cordPrice: 15 },
      ],
    })),

  setLockCamera: (v) => set({ lockCamera: v }),

  loadDefaults: () =>
    set(() => ({
      title: 'My Necklace',
      layers: [{ id: "L1", name: "Layer 1", lengthMm: 420, cordMaterial: "nylon", cordPrice: 15 }],
      defs: [
        { id: "metal_ball", name: "Metal Ball 6mm", geometryUrl: "__primitive__/sphere6", beadPreview: "https://png.pngtree.com/png-vector/20250110/ourmid/pngtree-natural-blue-turquoise-gemstone-with-dark-veins-for-jewelry-making-and-png-image_15129112.png", materialKind: "metal", price: 2, baseDiameterMm: 6 },
        { id: "glass_ball", name: "Glass Ball 8mm", geometryUrl: "__primitive__/sphere8", beadPreview: "https://png.pngtree.com/png-clipart/20250517/original/pngtree-a-polished-irregularly-shaped-black-stone-with-subtle-white-veining-reflecting-png-image_21019148.png", materialKind: "glass", price: 3, baseDiameterMm: 8, transmission: 1, ior: 1.5, thickness: 2, attenuationColor: "#8fd3ff", attenuationDistance: 40 },
        { id: "gem_emerald", name: "Gem Emerald 8mm", geometryUrl: "__primitive__/icosa8", beadPreview: "https://wroczynski.pl/environment/cache/images/500_500_productGfx_3744/Jaspis-czerwony%2C-naturalny-kamien-szlifowany%2C--ksztalt-zagielek%2C-rozmiar-48mm-x-31mm-kaboszon-do-oprawy..webp", materialKind: "gem", price: 6, baseDiameterMm: 8, transmission: 1, ior: 1.57, thickness: 2.5, attenuationColor: "#2ecc71", attenuationDistance: 30 },
      ],
      beads: [],
    })),
    getConfig: () => {
      const { title, layers, beads } = get();
      return { version: 1, title, layers, beads };
    },
  
    loadConfig: (cfg) =>
      set(() => ({
        title: cfg.title,
        layers: cfg.layers,
        beads: cfg.beads,
        // defs zostają bez zmian – import używa istniejących defId z katalogu
      })),
}));
