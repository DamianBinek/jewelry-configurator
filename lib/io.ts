// lib/io.ts
export function downloadJSON(data: unknown, filename = "necklace.json") {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
  
  export function readJSONFile<T = unknown>(file: File): Promise<T> {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onerror = () => reject(fr.error);
      fr.onload = () => {
        try {
          const obj = JSON.parse(String(fr.result));
          resolve(obj as T);
        } catch (e) {
          reject(e);
        }
      };
      fr.readAsText(file);
    });
  }
  
  // Minimalna walidacja (bez zależności)
  export function isNecklaceConfig(value: any): value is { version: number; layers: any[]; beads: any[] } {
    return (
      value &&
      typeof value === "object" &&
      value.version === 1 &&
      Array.isArray(value.layers) &&
      Array.isArray(value.beads)
    );
  }
  
  // PNG z canvasa (bierze pierwszy canvas w sekcji .canvas-wrap)
  export async function captureCanvasPng(selector = ".canvas-wrap canvas"): Promise<string | null> {
    const canvas = document.querySelector(selector) as HTMLCanvasElement | null;
    if (!canvas) return null;
    try {
      return canvas.toDataURL("image/png");
    } catch {
      return null;
    }
  }
  
  // Permalink: JSON -> base64 (URI-safe) i z powrotem
  export function encodeConfigToParam(obj: unknown): string {
    const json = JSON.stringify(obj);
    const b64 = typeof window !== "undefined" ? window.btoa(unescape(encodeURIComponent(json))) : "";
    return encodeURIComponent(b64);
  }
  
  export function decodeParamToConfig<T = unknown>(param: string): T | null {
    try {
      const json = decodeURIComponent(param);
      const str = typeof window !== "undefined" ? decodeURIComponent(escape(window.atob(json))) : "";
      return JSON.parse(str) as T;
    } catch {
      return null;
    }
  }
  