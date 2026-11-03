/** Turns "var(--x)" into its actual colour, for canvas drawing. Plain colours pass through. */
export function resolveColor(c: string) {
  const m = /^var\((--[\w-]+)\)$/.exec(c.trim());
  if (!m) return c;
  return getComputedStyle(document.documentElement).getPropertyValue(m[1]).trim() || "#ffffff";
}
