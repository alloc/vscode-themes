import chroma from "chroma-js";
import fs from "fs";
import { dirname, join } from "path";
import { jsonc } from "jsonc";
import chalk from "chalk";
import minimist from "minimist";

let {
  _: [templatePath],
  m: mixerName,
  o: outFile,
} = minimist(process.argv.slice(2));

const template = jsonc.parse(
  fs.readFileSync(templatePath || join(__dirname, "template.json"), "utf8")
);

const mixer: {
  mix(color: chroma.Color, keyPath: string[]): chroma.Color;
} = mixerName ? require(`./mixers/${mixerName}.ts`) : { mix: (c) => c };

const uiColors: any[][] = [];
const tokenColors: any[][] = [];

applyMixer(template);

logColors(uiColors);
logColors(tokenColors);

if (outFile) {
  outFile = join("themes", outFile.replace(/(\.json)?$/, ".json"));
  fs.mkdirSync(dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, jsonc.stringify(template, { space: 2 }));
} else {
  console.warn(
    "\n" + chalk.yellow("No output file specified, not writing anything")
  );
}

function logColors(colors: any[][]) {
  const alphaSort = (a: any[], b: any[]) => (b[1] > a[1] ? -1 : 1);
  colors.sort(alphaSort).forEach((color) => console.log(...color));
}

function applyMixer(obj: any, parents: any[] = [], keyPath: any[] = []): void {
  if (Array.isArray(obj)) {
    return obj.forEach((value, i) =>
      applyMixer(value, [...parents, obj], [...keyPath, i])
    );
  }
  if (!obj || typeof obj !== "object") {
    return;
  }
  for (const key in obj) {
    const value = obj[key];
    if (typeof value === "string" && value.startsWith("#")) {
      let names: string[];
      let colors: any[][];

      if (keyPath[0] === "tokenColors" && keyPath.at(-1) === "settings") {
        const tokenColor = parents.at(-1);
        let scopes: string | string[] = tokenColor.scope;
        if (typeof scopes === "string") {
          scopes = scopes.split(/ *, */);
        }
        names = scopes.map((scope) => [scope, chalk.bold(key)].join("."));
        colors = tokenColors;
      } else {
        names = [[...keyPath, chalk.bold(key)].join(".")];
        colors = uiColors;
      }

      const sourceColor = chroma(value);

      for (const name of names) {
        const color = mixer.mix(sourceColor, name.split("."));
        // TODO: what if mixer returns different color for different name??
        obj[key] = color.hex();

        const hue = color.get("hsl.h");
        const saturation = color.get("hsl.s");
        const lightness = color.get("hsl.l");
        const brightness = color.get("hsv.v");

        colors.push([
          chalk.hex(value)("█ ") + `%s\n  %s\t(H: %O, S: %O, L: %O, B: %O)`,
          name,
          chalk.blue(value.toUpperCase()),
          isNaN(hue) ? -1 : +hue.toFixed(1),
          +(saturation * 100).toFixed(1),
          +(lightness * 100).toFixed(1),
          +(brightness * 100).toFixed(1),
        ]);
      }
    } else {
      applyMixer(value, [...parents, obj], [...keyPath, key]);
    }
  }
}
