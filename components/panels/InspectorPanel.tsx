"use client";
import { useState, useMemo } from "react";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePrice } from "@/components/pricing/pricing";
import { ChevronDown } from "lucide-react";

export function InspectorPanel() {
  const { beads, defs, selectedBeadId, removeBead, selectBead } = useApp();
  const bead = beads.find((b) => b.id === selectedBeadId);
  const total = usePrice();

  const [open, setOpen] = useState(true);

  const sortedBeads = useMemo(
    () => beads.slice().sort((a, b) => a.sMm - b.sMm),
    [beads]
  );

  return (
    <div className="text-white">
      {/* Header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between rounded-2xl px-4 py-3"
        aria-expanded={open}
      >
        <h3 className="font-semibold">Details</h3>
        <ChevronDown
          className={`h-5 w-5 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Expandable content */}
      <div
        className={`transition-[max-height,opacity] duration-500 ease-in-out overflow-hidden ${
          open ? "max-h-[700px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-4 space-y-6">
          {/* Selected bead */}
          <section className="space-y-3">
            {/* <h4 className="font-semibold">Selected bead</h4> */}
            {!bead ? (
              <div className="text-sm text-zinc-500">
                Select a bead on the scene or from the list below…
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-sm">
                  ID: <span className="font-mono">{bead.id.slice(0, 8)}</span>
                </div>
                <div className="text-sm">
                  Position: {bead.sMm.toFixed(1)} mm
                </div>
                <Button
                  variant="destructive"
                  onClick={() => removeBead(bead.id)}
                >
                  Remove
                </Button>
              </div>
            )}
          </section>

          {/* All beads (scrollable) */}
          <section className="space-y-3">
            <h4 className="font-semibold">All beads</h4>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {sortedBeads.length === 0 ? (
                <div className="text-sm text-zinc-500">No beads yet.</div>
              ) : (
                sortedBeads.map((b) => {
                  const def = defs.find((d) => d.id === b.defId);
                  const isActive = b.id === selectedBeadId;
                  return (
                    <Card
                      key={b.id}
                      className={`p-3 flex items-center justify-between cursor-pointer transition rounded-2xl bg-transparent backdrop-blur shadow-lg border-none ${
                        isActive
                          ? "ring-2 ring-brand-500"
                          : "hover:bg-zinc-50/5"
                      }`}
                      onClick={() => selectBead(b.id)}
                      title="Select this bead"
                    >
                      <div className="min-w-0">
                        <div className="font-medium truncate">
                          {def?.name ?? b.defId}
                        </div>
                        <div className="text-xs text-zinc-500">
                          {def?.materialKind ?? "bead"} •{" "}
                          {def?.baseDiameterMm ?? "-"}mm • s={b.sMm.toFixed(1)}
                          mm
                        </div>
                      </div>
                      <div className="text-xs text-zinc-500">
                        ${def?.price?.toFixed(2) ?? "0.00"}
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </section>

          {/* Total */}
          <section className="pt-2 border-t border-zinc-200/20">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-500">Total cost</span>
              <span className="font-semibold">${total.toFixed(2)}</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
