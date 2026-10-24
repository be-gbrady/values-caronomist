/** Public canonical origin for values.caronomist.com. */
export const CANONICAL_ORIGIN = "https://values.caronomist.com";

export function canonicalUrl(path = "/"): string {
  if (path === "/" || path === "") return CANONICAL_ORIGIN;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${CANONICAL_ORIGIN}${normalized}`;
}
