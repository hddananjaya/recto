import { Screenshot, SectionHeader } from "@/components/landing/section-header";
import {
  LANDING_CONTAINER,
  LANDING_DESKTOP_IMAGE,
  LANDING_SECTION,
} from "@/components/landing/tokens";
import { cn } from "@/lib/utils";

const THEMES = [
  {
    src: "/images/landing/theme-ocean-desktop.webp",
    label: "Dark",
    alt: "Dark theme — charcoal background with gold accent",
    aspectClassName: "aspect-[1280/700]",
    cascadeClassName:
      "md:absolute md:left-0 md:top-3 md:z-10 md:w-[54%] md:max-w-xl md:-rotate-[2.5deg]",
  },
  {
    src: "/images/landing/theme-sky-desktop.webp",
    label: "Sky",
    alt: "Sky theme — photo background with blue sky and clouds",
    aspectClassName: "aspect-[1280/700]",
    cascadeClassName:
      "md:absolute md:left-1/2 md:top-0 md:z-20 md:w-[54%] md:max-w-xl md:-translate-x-1/2 md:rotate-[1deg]",
  },
  {
    src: "/images/landing/theme-cloud-desktop.webp",
    label: "Rose",
    alt: "Rose theme — deep burgundy background with warm accent",
    aspectClassName: "aspect-[1280/700]",
    cascadeClassName:
      "md:absolute md:right-0 md:top-4 md:z-10 md:w-[54%] md:max-w-xl md:rotate-[3deg]",
  },
] as const;

function ThemeCard({
  theme,
  className,
}: {
  theme: (typeof THEMES)[number];
  className?: string;
}) {
  return (
    <figure className={cn("shrink-0", className)}>
      <Screenshot
        src={theme.src}
        alt={theme.alt}
        aspectClassName={theme.aspectClassName}
        imageClassName={LANDING_DESKTOP_IMAGE}
        sizes="(max-width: 768px) 85vw, 380px"
        priority
      />
      <figcaption className="mt-3 text-center text-[13px] font-medium tracking-wide text-[#152238]/45">
        {theme.label}
      </figcaption>
    </figure>
  );
}

export function LandingHeroShowcase() {
  return (
    <section
      id="themes"
      className={LANDING_SECTION}
      aria-labelledby="themes-heading"
    >
      <div className={LANDING_CONTAINER}>
        <SectionHeader
          title="Forms that don't look like Google Forms"
          description="Set colors, fonts, and layout in the editor. Publish when it looks right."
        />

        {/* Mobile: horizontal filmstrip — Sky first (featured) */}
        <div
          className="-mx-4 mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 scrollbar-none md:hidden [&::-webkit-scrollbar]:hidden"
          aria-label="Form theme examples"
        >
          {[THEMES[1], THEMES[0], THEMES[2]].map((theme) => (
            <ThemeCard
              key={theme.src}
              theme={theme}
              className="w-[min(85vw,400px)] snap-center"
            />
          ))}
        </div>

        {/* Desktop: overlapping cascade */}
        <div className="relative mx-auto mt-16 hidden max-w-5xl md:block md:h-[360px] lg:h-[400px]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-12 top-1/2 -z-10 h-48 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(21,34,56,0.06)_0%,transparent_70%)]"
          />
          {THEMES.map((theme) => (
            <ThemeCard
              key={theme.src}
              theme={theme}
              className={theme.cascadeClassName}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
