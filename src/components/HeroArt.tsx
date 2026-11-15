import Image from "next/image";

// Cohesive hero illustration (public/landing/hero.webp): one centered scene of a
// creator scheduling posts and sending links by DM. Rendered as a plain image so
// the whole scene stays visible (no cropping) on desktop and mobile.
export function HeroArt({ src }: { src: string }) {
  return (
    <div className="heroArtFrame">
      <Image
        className="heroArt"
        src={src}
        alt="Illustration of a creator scheduling posts on a calendar while a link is sent by DM"
        width={1536}
        height={1024}
        loading="eager"
        unoptimized
        sizes="(max-width: 1040px) 100vw, 1040px"
      />
    </div>
  );
}
