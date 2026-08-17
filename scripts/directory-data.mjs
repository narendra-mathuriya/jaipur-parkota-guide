import { readFile } from "node:fs/promises";
import vm from "node:vm";

export async function loadDirectorySource() {
  const source = await readFile("src/data/directory.ts", "utf8");

  return {
    categories: evaluateExportedArray(source, "categories"),
    directorySpots: evaluateExportedArray(source, "directorySpots")
  };
}

function evaluateExportedArray(source, exportName) {
  const marker = `export const ${exportName}`;
  const start = source.indexOf(marker);

  if (start === -1) {
    throw new Error(`Could not find export ${exportName}`);
  }

  const assignment = source.indexOf("=", start);
  const arrayStart = source.indexOf("[", assignment);
  let depth = 0;

  for (let index = arrayStart; index < source.length; index += 1) {
    const character = source[index];

    if (character === "[") {
      depth += 1;
    }

    if (character === "]") {
      depth -= 1;

      if (depth === 0) {
        const literal = source.slice(arrayStart, index + 1);
        return vm.runInNewContext(literal);
      }
    }
  }

  throw new Error(`Could not parse export ${exportName}`);
}

export function slugify(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/['’]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .toLowerCase();
}

export function buildSpotSlug(spot) {
  return slugify(`${spot.n_en} ${spot.a_en} Jaipur`);
}

export function normalizeSearch(value) {
  return value
    .toLowerCase()
    .replace(/ee/g, "i")
    .replace(/oo/g, "u")
    .replace(/ou/g, "u")
    .replace(/ph/g, "f")
    .replace(/sh/g, "s")
    .replace(/kh/g, "k")
    .replace(/bh/g, "b")
    .replace(/dh/g, "d")
    .replace(/th/g, "t")
    .replace(/ch/g, "c")
    .replace(/jh/g, "j")
    .replace(/w/g, "v")
    .replace(/aa/g, "a")
    .trim();
}
