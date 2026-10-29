// module/gallery/videos.ts
//
// DEMO videos for the gallery page's "Watch our events" section, shown only
// until the first film is added in admin → Manage Gallery → Event films
// (then the films come from the database: app/actions/gallery-videos.ts).
//   url    — any YouTube link (watch?v=…, youtu.be/…, /shorts/…) or a video
//            file path such as "/videos/wedding.mp4" (in public/videos/)
//   cover  — optional cover photo; without one, YouTube's thumbnail is used
//
// DEMO: placeholder YouTube videos with event photos as covers — replace with
// your own event films.

const photo = (id: string, w = 900) => `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;

export type GalleryVideo = {
  title: string;
  category: string;
  duration?: string;
  url: string;
  cover?: string;
};

export const galleryVideos: GalleryVideo[] = [
  {
    title: "Leadership Summit — highlights",
    category: "Corporate",
    duration: "3:12",
    url: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
    cover: photo("1540575467063-178a50c2df87"),
  },
  {
    title: "Garden wedding film",
    category: "Wedding",
    duration: "4:05",
    url: "https://www.youtube.com/watch?v=eRsGyueVLvQ",
    cover: photo("1519741497674-611481863552"),
  },
  {
    title: "Dhaka City Marathon — race day",
    category: "Sports",
    duration: "2:48",
    url: "https://www.youtube.com/watch?v=R6MlUcmOul8",
    cover: photo("1530143311094-34d807799e8f"),
  },
  {
    title: "Bangladesh Trade Expo — walkthrough",
    category: "Exhibition",
    duration: "2:20",
    url: "https://www.youtube.com/watch?v=WhWc3b3KhnY",
    cover: photo("1560439514-4e9645039924"),
  },
];
