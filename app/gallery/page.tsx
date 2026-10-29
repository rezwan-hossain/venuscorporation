// app/gallery/page.tsx
import GalleryPage from "@/module/gallery/pages/GalleryPage";
import { getGalleryImages } from "../actions/gallery";
import { getGalleryVideos } from "../actions/gallery-videos";
import { galleryVideos as demoVideos } from "@/module/gallery/videos";

export const metadata = {
  title: "Gallery",
  description:
    "Photos from weddings, summits, race days and celebrations planned by Venus Corporation.",
};

export default async function Page() {
  const [images, savedVideos] = await Promise.all([
    getGalleryImages(),
    getGalleryVideos(),
  ]);

  // Event films: the ones added in admin. Until the first one is added
  // (savedVideos is null), the demo films in module/gallery/videos.ts show.
  const videos =
    savedVideos === null
      ? demoVideos
      : savedVideos.map((v) => ({
          title: v.title,
          category: v.category ?? "Event film",
          duration: v.duration ?? undefined,
          url: v.url,
        }));

  return <GalleryPage images={images} videos={videos} />;
}
