/**
 * Brand illustrations (isometric 3D, generated with Higgsfield).
 * Served through next/image (Vercel fetches + caches them, delivered from our
 * own domain). To self-host: download each file into /public/illustrations/
 * and replace the URL with "/illustrations/<name>.png".
 */
const CDN =
  "https://d8j0ntlcm91z4.cloudfront.net/user_3Km3PeOIcRa6RJV8EoG95ZC6TzG";

export const illustrations = {
  francais: `${CDN}/hf_20261104_201606_86a3c10b-65b3-44f5-8ccd-03476278a313.png`,
  maths: `${CDN}/hf_20261104_201539_487c6fb5-057c-48f0-8e74-a2116c9c9474.png`,
  study: `${CDN}/hf_20261104_201539_d697d4c1-1183-4fa4-8953-726d2a6d639f.png`,
  quiz: `${CDN}/hf_20261104_201539_ffe0074d-2cad-475b-a9ff-56a0855a9f8f.png`,
  fiches: `${CDN}/hf_20261104_201627_2f25c227-eaea-4a19-897c-323132b4428f.png`,
} as const;

/** Subject illustration for a category slug (falls back to the study scene). */
export function subjectIllustration(slug: string | undefined): string {
  if (slug === "francais") return illustrations.francais;
  if (slug === "mathematiques") return illustrations.maths;
  return illustrations.study;
}
