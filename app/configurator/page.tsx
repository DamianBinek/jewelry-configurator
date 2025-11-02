"use client";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { TopBar } from "@/components/panels/TopBar";
import { CatalogPanel } from "@/components/panels/CatalogPanel";
import { InspectorPanel } from "@/components/panels/InspectorPanel";
import { usePrice } from "@/components/pricing/pricing";
import { TitleField } from "@/components/ui/TitleField";

const SceneCanvas = dynamic(() => import("@/components/scene/SceneCanvas"), {
  ssr: false,
});

export default function ConfiguratorPage() {
  const price = usePrice();

  return (
    <>
      {/* Fullscreen scene */}
      <div className="fixed inset-0">
        <div className="canvas-wrap h-full w-full">
          <Suspense
            fallback={<div className="p-4 text-white">Loading 3D…</div>}
          >
            <SceneCanvas />
          </Suspense>
        </div>
      </div>

      {/* Overlay UI (doesn't block the canvas except over the cards) */}
      <div className="pointer-events-none fixed inset-0 z-50">
        {/* Top-left title + total */}
        <div className="flex items-start justify-between p-4 md:p-6">
          <div className="pointer-events-auto select-none">
            <h1 className="text-white/95 drop-shadow text-2xl md:text-3xl font-semibold">
              <TitleField />
            </h1>
            <div className="text-white/80 text-sm mt-1">
              Orientacyjny koszt:{" "}
              <span className="font-semibold">${price.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* RIGHT STACK: TopBar above Inspector */}
        <div
          className="
      pointer-events-auto absolute right-4 md:right-6 top-4 md:top-6
      flex flex-col items-end gap-12 md:gap-14 w-full max-w-[300px]
    "
        >
          <div
            id="top-bar-container"
            className="w-full rounded-2xl bg-black/35 backdrop-blur shadow-lg"
          >
            <TopBar />
          </div>

          <div
            id="inspector-panel-container"
            className="w-full rounded-2xl bg-black/35 backdrop-blur shadow-lg"
          >
            <InspectorPanel />
          </div>
        </div>

        {/* Left catalog card */}
        <div className="pointer-events-auto absolute left-4 md:left-6 top-28 md:top-32 w-full max-w-[300px]">
          <div className="rounded-2xl bg-black/35 backdrop-blur shadow-lg">
            <CatalogPanel />
          </div>
        </div>
      </div>
    </>
  );
}
