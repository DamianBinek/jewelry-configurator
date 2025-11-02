"use client";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";

export function CatalogPanel() {
  const { defs, layers, addBead } = useApp();
  const layerId = layers[0]?.id;
  const [open, setOpen] = useState(true);

  return (
    <div className="text-white">
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between rounded-2xl px-4 py-3 "
      >
        <h3 className="font-semibold">Katalog elementów</h3>
        <ChevronDown
          className={`h-5 w-5 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Expandable content */}
      <div
        className={`transition-[max-height,opacity] duration-500 ease-in-out overflow-hidden ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-4 pt-3 space-y-3 overflow-y-auto max-h-80">
          {defs.map((d) => (
            <Card
              key={d.id}
              className="p-3 flex items-center justify-between gap-3 rounded-2xl bg-transparent backdrop-blur shadow-lg border-none"
            >
              {/* Left: thumbnail + meta */}
              <div className="flex items-center gap-3 min-w-0">
                {/* Thumbnail from d.geometryUrl */}
                {d.beadPreview ? (
                  <div className="h-12 w-12 shrink-0 rounded-xl overflow-hidden bg-zinc-800/40 ring-1 ring-white/10">
                    <img
                      src={d.beadPreview}
                      alt={`${d.name} preview`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        // Hide the image box if URL isn't an image or fails
                        (
                          e.currentTarget.parentElement as HTMLDivElement
                        ).style.display = "none";
                      }}
                    />
                  </div>
                ) : null}

                {/* Name + details */}
                <div className="min-w-0">
                  <div className="font-medium truncate">{d.name}</div>
                  <div className="text-xs text-zinc-500 truncate">
                    {d.materialKind} • {d.baseDiameterMm}mm • ${d.price}
                  </div>
                </div>
              </div>

              {/* Right: action */}
              <Button
                size="sm"
                onClick={() => layerId && addBead(d.id, layerId, 20)}
              >
                Dodaj
              </Button>
            </Card>
          ))}

          {!defs.length && (
            <div className="text-xs text-zinc-400 px-1">
              No items available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
