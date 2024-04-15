import chroma from "chroma-js";

export function mix(color: chroma.Color, name: string[]) {
  const blue = chroma("#e6f4ff");
  const hue = color.get("hsl.h");
  if (Math.abs(blue.get("hsl.h") - hue) < 15) {
    color = color.set("hsl.h", hue - 15);
  }
  color = color.mix(blue, 0.1);
  if (name.includes("foreground")) {
    color = color.darken(0.2);
  }
  return color;
}
