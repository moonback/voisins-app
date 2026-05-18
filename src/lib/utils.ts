import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeCategory(value?: string) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function getMissionImageUrls(mission: { images?: unknown; photos?: unknown }) {
  const images = Array.isArray(mission.images) ? mission.images : [];
  const photos = Array.isArray(mission.photos) ? mission.photos : [];

  return [...images, ...photos].filter((value): value is string => typeof value === "string" && value.length > 0);
}
