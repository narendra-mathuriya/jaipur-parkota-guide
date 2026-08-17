import { loadDirectorySource, normalizeSearch } from "./directory-data.mjs";

const { directorySpots } = await loadDirectorySource();
const indexed = directorySpots.map((spot) => {
  const raw = [
    spot.id,
    spot.n,
    spot.n_en,
    spot.i,
    spot.i_en,
    spot.a,
    spot.a_en,
    spot.s,
    spot.s_en,
    spot.en
  ]
    .join(" ")
    .toLowerCase();

  return { ...spot, raw, normalized: normalizeSearch(raw) };
});

assertSearch("kachori", (results) => results.length >= 3);
assertSearch("gurudwara", (results) => results.length >= 5);
assertSearch("panna johari", (results) =>
  results.some((spot) => spot.n_en === "Gopal Ji Ka Rasta")
);
assertCategory("temple", (results) => results.length >= 20);
assertCategory("streetfood", (results) =>
  results.some((spot) => spot.n_en.includes("Samrat"))
);

console.log("Search and category filter checks passed.");

function search(query, category = "all") {
  const rawTokens = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const normalizedTokens = normalizeSearch(query).split(/\s+/).filter(Boolean);

  return indexed.filter((spot) => {
    if (category !== "all" && !spot.cats.includes(category)) {
      return false;
    }

    return rawTokens.every((token, index) => {
      const normalizedToken = normalizedTokens[index] || token;
      return spot.raw.includes(token) || spot.normalized.includes(normalizedToken);
    });
  });
}

function assertSearch(query, assertion) {
  const results = search(query);

  if (!assertion(results)) {
    throw new Error(`Search assertion failed for "${query}"`);
  }
}

function assertCategory(category, assertion) {
  const results = search("", category);

  if (!assertion(results)) {
    throw new Error(`Category assertion failed for "${category}"`);
  }
}
