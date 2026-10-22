import Image from "next/image";
import type { Locale } from "@/content/config";
import type { Content } from "@/lib/radar/schema";
import { radarArtwork } from "@/lib/radar/presentation";

export function RadarArtwork({
  item,
  locale,
  variant = "card",
  priority = false,
}: {
  item: Content;
  locale: Locale;
  variant?: "card" | "feature" | "small";
  priority?: boolean;
}) {
  const artwork = radarArtwork(item);
  return (
    <figure className={`radar-artwork radar-artwork-${variant} radar-theme-${artwork.theme}`}>
      <Image
        src={artwork.image}
        alt={artwork.alt[locale]}
        fill
        sizes={variant === "feature" ? "(max-width: 900px) 100vw, 66vw" : variant === "small" ? "180px" : "(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 420px"}
        preload={priority}
        loading={priority ? undefined : "lazy"}
        className="radar-artwork-image"
      />
      {variant !== "small" && (
        <>
          <span className="radar-artwork-topic">{artwork.label[locale]}</span>
          {artwork.illustration && (
            <figcaption className="radar-artwork-credit">
              {locale === "he" ? "איור מערכת" : "EDITORIAL ART"}
            </figcaption>
          )}
        </>
      )}
    </figure>
  );
}
