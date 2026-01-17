"use client";
import { useApp } from "@/lib/store";
import { Gem } from "lucide-react"; // or Pencil, Tag, etc.
import { useState } from "react";

export function TitleField() {
  const { title, setTitle } = useApp();
  const [val, setVal] = useState(title);

  // update local as you type; write to store on blur (and Enter)
  const commit = () => setTitle(val.trim() || "My Necklace");

  return (
    <div className="group relative w-[min(80vw,280px)]">
      {/* left icon */}
      {/* <Gem className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" /> */}

      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.currentTarget as HTMLInputElement).blur();
          if (e.key === "Escape") {
            setVal(title);
            (e.currentTarget as HTMLInputElement).blur();
          }
        }}
        placeholder="My Necklace"
        className="
          block w-full pr-3 py-1.5
          rounded-xl bg-white/0
          text-white/95 placeholder:text-white/40
          outline-none
          border border-transparent
          group-hover:border-white/40 focus:border-white/70
          transition
          drop-shadow
          text-center
          sm:text-left
        "
      />
    </div>
  );
}
