import chroma from "chroma-js";

export function mix(color: chroma.Color, name: string[]) {
  if (color.hex() === "#000000") {
    const val = color.get("hsv.v");
    return color.set("hsv.v", 0.3);
  }
  const sat = color.get("hsv.s");
  return color.set("hsv.s", sat * 0.66);
}
