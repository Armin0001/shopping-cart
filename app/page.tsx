import { Aisles } from "@/components/Aisles";
import { Floor } from "@/components/Floor";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { Marquee } from "@/components/Marquee";
import { Navbar } from "@/components/Navbar";
import { Runway } from "@/components/Runway";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Marquee
          items={["Right-click anywhere", "Scroll sideways", "Nothing costs anything", "Drag the objects", "Filters follow you"]}
          className="relative z-10 -mb-6 -ml-[2vw] w-[104vw] bg-ink text-acid"
        />
        <Runway />
        <Aisles />
        <Floor />
      </main>
      <Footer />
    </>
  );
}
