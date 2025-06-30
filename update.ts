import editInPlace from "json-in-place";
import { copySync } from "fs-extra";
import * as fs from "fs";
import { join } from "path";
import { homedir } from "os";

const overrides: Record<string, string> = {
  "gruvdark-gbm-light": "GruvDark-GBM Light",
  "rose-pine-moon": "Noir Rosé Pine Moon",
  "rose-pine-dawn": "Rosé Pine Dawn",
};

const themes = fs.readdirSync("./themes").map((theme) => {
  const themePath = "./" + join("themes", theme);
  const label =
    overrides[theme.replace(".json", "")] ||
    theme
      .replace(/\.[^.]+$/, "")
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());

  console.log("+", label);

  return {
    label,
    uiTheme: fs.readFileSync(themePath, "utf8").includes('"type": "dark"')
      ? "vs-dark"
      : "vs",
    path: themePath,
  };
});

function setThemesField(pkgJson: string) {
  const pkg = editInPlace(pkgJson);
  pkg.set("contributes", { themes });
  fs.writeFileSync("./package.json", pkg.toString());
}

const pkgJson = fs.readFileSync("./package.json", "utf-8");
const pkg = JSON.parse(pkgJson);

setThemesField(pkgJson);

const installId = pkg.publisher + "." + pkg.name + "-" + pkg.version;
const installPath = join(homedir(), ".vscode", "extensions", installId);
const insidersPath = join(
  homedir(),
  ".vscode-insiders",
  "extensions",
  installId
);

if (fs.existsSync(installPath)) {
  overwriteSync("package.json", installPath);
  overwriteSync("themes", installPath);
}

if (fs.existsSync(insidersPath)) {
  overwriteSync("package.json", insidersPath);
  overwriteSync("themes", insidersPath);
}

function overwriteSync(src: string, dest: string) {
  copySync(src, join(dest, src), { overwrite: true });
}
