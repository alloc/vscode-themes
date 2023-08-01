import editInPlace from "json-in-place";
import * as fs from "fs";
import path from "path";

const themes = fs.readdirSync("./themes").map((theme) => {
  const themePath = "./" + path.join("themes", theme);
  return {
    label: theme
      .replace(/\.[^.]+$/, "")
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase()),
    uiTheme: fs.readFileSync(themePath, "utf8").includes('"type": "dark"')
      ? "vs-dark"
      : "vs",
    path: themePath,
  };
});

const pkgJson = fs.readFileSync("./package.json", "utf-8");
const pkg = editInPlace(pkgJson);
pkg.set("contributes", { themes });
fs.writeFileSync("./package.json", pkg.toString());
