import { requireUser } from "@/lib/auth";
import { PageHero } from "@/components/ui/kit";
import { DM_TEMPLATES } from "@/lib/dmTemplates";
import TemplatesGallery from "./TemplatesGallery";

export const metadata = { title: "Templates" };

export default async function TemplatesPage() {
  await requireUser();
  return (
    <>
      <PageHero
        eyebrow="Auto-DM"
        title="Templates"
        accent="for every goal"
        lede="Pick a ready-made automation, add your link and save it. Nothing goes live until you do."
        art="/landing/card-dm.webp"
        artAlt=""
      />
      <TemplatesGallery templates={DM_TEMPLATES} />
    </>
  );
}
