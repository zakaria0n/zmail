import { Features } from "@/components/sections/features";
import { Faq } from "@/components/sections/faq";
import { HowItWorks } from "@/components/sections/how-it-works";
import { HeroContent } from "@/components/hero/hero-content";
import { Workspace } from "@/components/workspace";
import { MobileSelectionController } from "@/components/mobile-message-sheet";

// The home page is fully client-driven (inbox lives in the browser), so opt
// out of static prerendering.
export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <>
      {/* Hero + workspace */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-10 pt-12 sm:pt-16 md:pt-20">
        <div className="flex flex-col items-center gap-8">
          <HeroContent />
          <div className="w-full">
            <Workspace />
          </div>
        </div>
      </section>

      <Features />
      <HowItWorks />
      <Faq />

      {/* Mobile full-screen message overlay */}
      <MobileSelectionController />
    </>
  );
}
