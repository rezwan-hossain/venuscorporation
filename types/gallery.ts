// types/gallery.ts
export type GalleryImage = {
  id: string;
  src: string;
  alt: string | null;
  service: string | null; // e.g. "weddings" — see lib/gallery-services.ts
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type CreateGalleryImageInput = {
  src: string;
  alt?: string;
  service?: string | null;
};

export type UpdateGalleryImageInput = {
  id: string;
  src: string;
  alt?: string;
  service?: string | null;
};

export type DeleteGalleryImageInput = {
  id: string;
};
