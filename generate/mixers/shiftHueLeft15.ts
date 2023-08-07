import chroma from "chroma-js";

export function mix(color: chroma.Color, name: string[]) {
  const hue = color.get("hsl.h");
  return color.set("hsl.h", hue - 15);
}
