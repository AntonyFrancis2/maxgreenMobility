import type { CardAlign } from "@/lib/site";

export function resolveCardAlign(v: string | undefined): CardAlign {
  if (v === "center" || v === "end") return v;
  return "start";
}

/** Flex column stack for section “cards”: aligns icon blobs + typographic rhythm. */
export function siteCardStackClass(align: CardAlign | undefined): string {
  switch (resolveCardAlign(align)) {
    case "center":
      return "flex flex-col items-center text-center";
    case "end":
      return "flex flex-col items-end text-right";
    default:
      return "flex flex-col items-start text-left";
  }
}

/** Use on `<ul>` whose `<li>` use `flex gap-…` rows (e.g. check + text). */
export function siteBulletListLiClass(align: CardAlign | undefined): string {
  switch (resolveCardAlign(align)) {
    case "center":
      return "[&>li]:flex [&>li]:justify-center";
    case "end":
      return "[&>li]:flex [&>li]:justify-end";
    default:
      return "[&>li]:flex [&>li]:justify-start";
  }
}

/** Top label row inside a card (icons + headings). */
export function siteCardTitleRowClass(align: CardAlign | undefined): string {
  switch (resolveCardAlign(align)) {
    case "center":
      return "flex items-center justify-center gap-2 text-sm font-extrabold";
    case "end":
      return "flex items-center justify-end gap-2 text-sm font-extrabold";
    default:
      return "flex items-center gap-2 text-sm font-extrabold";
  }
}
