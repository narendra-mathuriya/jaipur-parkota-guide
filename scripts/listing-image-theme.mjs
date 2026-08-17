export const sourceByTheme = {
  jewelry: "jewelry.png",
  textiles: "textiles.png",
  food: "food.png",
  temple: "temple.png",
  parks: "parks.png",
  mall: "mall.png",
  heritage: "heritage.png",
  crafts: "crafts.png",
  cafe: "cafe.png",
  general: "general.png"
};

const themeByCategory = {
  jewelry: "jewelry",
  textiles: "textiles",
  wedding: "textiles",
  streetfood: "food",
  food: "food",
  temple: "temple",
  parks: "parks",
  cafe: "cafe",
  mall: "mall",
  crafts: "crafts",
  sightseeing: "heritage",
  outskirts: "heritage",
  general: "general"
};

const modifierCategories = new Set(["upcoming", "toddler"]);

export function pickListingImageTheme(spot) {
  for (const category of spot.cats) {
    if (modifierCategories.has(category)) {
      continue;
    }

    const theme = themeByCategory[category];
    if (theme) {
      return theme;
    }
  }

  return "general";
}
