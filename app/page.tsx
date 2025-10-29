import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <main className="max-w-5xl mx-auto p-6 space-y-8">
      <section className="text-center space-y-4 py-16">
        <h1 className="text-4xl md:text-5xl font-bold">Design your necklace in 3D</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-300">
          Ultra-realistic beads, drag along the cord, instant pricing.
        </p>
        <Link href="/configurator"><Button className="mt-4">Open Configurator</Button></Link>
      </section>
    </main>
  );
}