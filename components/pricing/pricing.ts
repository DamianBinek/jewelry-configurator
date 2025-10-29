import { useApp } from "@/lib/store";

export function usePrice() {
  const { beads, defs, layers } = useApp();
  const beadPrice = beads.reduce((acc, b) => acc + (defs.find(d => d.id === b.defId)?.price ?? 0), 0);
  const cordPrice = layers.reduce((acc, l) => acc + l.cordPrice, 0);
  return beadPrice + cordPrice;
}