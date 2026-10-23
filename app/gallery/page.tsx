// app/gallery/page.tsx
import GalleryPage from "@/module/gallery/pages/GalleryPage";
import { getGalleryImages } from "../actions/gallery";

export const metadata = {
  title: "Gallery",
  description: "Photos from weddings, summits, race days and celebrations planned by Venus Corporation.",
};

export default async function Page() {
  const images = await getGalleryImages();

  return <GalleryPage images={images} />;
}
