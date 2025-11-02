// "use client";
// import { useRef } from "react";
// import { usePrice } from "@/components/pricing/pricing";
// import { Button } from "@/components/ui/button";
// import { useApp } from "@/lib/store";
// import {
//   downloadJSON,
//   readJSONFile,
//   isNecklaceConfig,
//   captureCanvasPng,
//   encodeConfigToParam,
// } from "@/lib/io";
// import { NecklaceConfigSchema } from "@/lib/schema";

// export function TopBar() {
//   const price = usePrice();
//   const {
//     addBead,
//     defs,
//     layers,
//     getConfig,
//     lockCamera,
//     setLockCamera,
//     loadConfig,
//   } = useApp();
//   const fileInputRef = useRef<HTMLInputElement | null>(null);

//   const handleExport = async () => {
//     const cfg = getConfig();
//     // dorzucamy miniaturę PNG (jeśli możliwa)
//     const png = await captureCanvasPng();
//     if (png) (cfg as any).previewDataUrl = png;
//     downloadJSON(cfg, "necklace.json");
//   };

//   const handleImportClick = () => fileInputRef.current?.click();

//   const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     try {
//       const obj = await readJSONFile(file);
//       // najpierw szybka walidacja kształtu:
//       if (!isNecklaceConfig(obj)) {
//         alert("Invalid file format.");
//         return;
//       }
//       // mocniejsza walidacja z zod:
//       const parsed = NecklaceConfigSchema.parse(obj);
//       // sprawdzamy, czy defId istnieją (jeśli nie, kontynuujemy, ale ostrzegamy)
//       const unknown = parsed.beads.filter(
//         (b) => !defs.some((d) => d.id === b.defId)
//       );
//       if (unknown.length) {
//         alert(
//           `Unknown bead types in this app: ${[
//             ...new Set(unknown.map((b) => b.defId)),
//           ].join(", ")}`
//         );
//       }
//       loadConfig(parsed);
//     } catch (err) {
//       console.error(err);
//       alert("Failed to import. Make sure it is a valid JSON export.");
//     } finally {
//       if (fileInputRef.current) fileInputRef.current.value = "";
//     }
//   };

//   const handleCopyLink = async () => {
//     const cfg = getConfig();
//     // dla linku nie dokładamy PNG (za duże); czysty config
//     const param = encodeConfigToParam(cfg);
//     const url = new URL(window.location.href);
//     url.searchParams.set("c", param);
//     const link = url.toString();
//     try {
//       await navigator.clipboard.writeText(link);
//       alert("Permalink copied to clipboard!");
//     } catch {
//       // fallback
//       prompt("Copy this link:", link);
//     }
//   };

//   const handleSavePng = async () => {
//     const png = await captureCanvasPng();
//     if (!png) return alert("Canvas not ready yet.");
//     const a = document.createElement("a");
//     a.href = png;
//     a.download = "necklace.png";
//     a.click();
//   };

//   return (
//     // <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex flex-wrap items-center gap-2 bg-black/40 text-white rounded-full px-3 py-1">
//     <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex flex-wrap items-center gap-2 text-whit">
//       <div className="text-sm">
//         Total: <span className="font-semibold">${price.toFixed(2)}</span>
//       </div>

//       {defs[0] && layers[0] && (
//         <Button
//           size="sm"
//           variant="secondary"
//           onClick={() =>
//             addBead(defs[0].id, layers[0].id, layers[0].lengthMm / 2)
//           }
//         >
//           Add sample bead
//         </Button>
//       )}

//       <Button
//         size="sm"
//         variant="secondary"
//         onClick={() => setLockCamera(!lockCamera)}
//         title="Lock / unlock orbit controls"
//       >
//         {lockCamera ? "Unlock view" : "Lock view"}
//       </Button>
//       {/* Export / Import / Link / PNG */}
//       <Button
//         size="sm"
//         variant="secondary"
//         onClick={handleExport}
//         title="Export current necklace to JSON"
//       >
//         Export JSON
//       </Button>
//       <Button
//         size="sm"
//         variant="secondary"
//         onClick={handleImportClick}
//         title="Import necklace from JSON"
//       >
//         Import JSON
//       </Button>
//       <input
//         ref={fileInputRef}
//         type="file"
//         accept="application/json,.json"
//         className="hidden"
//         onChange={handleImportFile}
//       />
//       <Button
//         size="sm"
//         variant="secondary"
//         onClick={handleCopyLink}
//         title="Copy permalink with config"
//       >
//         Copy link
//       </Button>
//       <Button
//         size="sm"
//         variant="secondary"
//         onClick={handleSavePng}
//         title="Save PNG preview"
//       >
//         Save PNG
//       </Button>

//       <Button
//         size="sm"
//         variant="secondary"
//         onClick={() => window.location.reload()}
//       >
//         Reset
//       </Button>
//     </div>
//   );
// }

"use client";
import { useRef, useState } from "react";
import { usePrice } from "@/components/pricing/pricing";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/store";
import {
  downloadJSON,
  readJSONFile,
  isNecklaceConfig,
  captureCanvasPng,
  encodeConfigToParam,
} from "@/lib/io";
import { NecklaceConfigSchema } from "@/lib/schema";
import { ChevronDown } from "lucide-react";
import { Card } from "../ui/card";

export function TopBar() {
  const price = usePrice();
  const {
    addBead,
    defs,
    layers,
    getConfig,
    lockCamera,
    setLockCamera,
    loadConfig,
  } = useApp();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(true);

  const handleExport = async () => {
    const cfg = getConfig();
    // dorzucamy miniaturę PNG (jeśli możliwa)
    const png = await captureCanvasPng();
    if (png) (cfg as any).previewDataUrl = png;
    downloadJSON(cfg, "necklace.json");
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const obj = await readJSONFile(file);
      // najpierw szybka walidacja kształtu:
      if (!isNecklaceConfig(obj)) {
        alert("Invalid file format.");
        return;
      }
      // mocniejsza walidacja z zod:
      const parsed = NecklaceConfigSchema.parse(obj);
      // sprawdzamy, czy defId istnieją (jeśli nie, kontynuujemy, ale ostrzegamy)
      const unknown = parsed.beads.filter(
        (b) => !defs.some((d) => d.id === b.defId)
      );
      if (unknown.length) {
        alert(
          `Unknown bead types in this app: ${[
            ...new Set(unknown.map((b) => b.defId)),
          ].join(", ")}`
        );
      }
      loadConfig(parsed);
    } catch (err) {
      console.error(err);
      alert("Failed to import. Make sure it is a valid JSON export.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleCopyLink = async () => {
    const cfg = getConfig();
    // dla linku nie dokładamy PNG (za duże); czysty config
    const param = encodeConfigToParam(cfg);
    const url = new URL(window.location.href);
    url.searchParams.set("c", param);
    const link = url.toString();
    try {
      await navigator.clipboard.writeText(link);
      alert("Permalink copied to clipboard!");
    } catch {
      // fallback
      prompt("Copy this link:", link);
    }
  };

  const handleSavePng = async () => {
    const png = await captureCanvasPng();
    if (!png) return alert("Canvas not ready yet.");
    const a = document.createElement("a");
    a.href = png;
    a.download = "necklace.png";
    a.click();
  };

  return (
    <div className="text-white">
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between rounded-2xl px-4 py-3 "
      >
        <h3 className="font-semibold">Opcje</h3>
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
        <div className="p-4 pt-3 space-y-3 overflow-y-auto max-h-80 flex flex-col">
          <Button
            size="sm"
            onClick={() => setLockCamera(!lockCamera)}
            title="Lock / unlock orbit controls"
          >
            {lockCamera ? "Odblokuj widok" : "Zablokuj widok"}
          </Button>
          {/* Export / Import / Link / PNG */}
          <Button
            size="sm"
            onClick={handleExport}
            title="Export current necklace to JSON"
          >
            Eksportuj
          </Button>
          <Button
            size="sm"
            onClick={handleImportClick}
            title="Import necklace from JSON"
          >
            Importuj
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleImportFile}
          />
          <Button
            size="sm"
            onClick={handleCopyLink}
            title="Copy permalink with config"
          >
            Kopiuj link
          </Button>
          <Button size="sm" onClick={handleSavePng} title="Save PNG preview">
            Zapisz obraz
          </Button>

          <Button size="sm" onClick={() => window.location.reload()}>
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
