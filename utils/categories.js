const CATEGORY_OPTIONS = [
  { value: "trending", label: "Trending", icon: "fa-fire" },
  { value: "rooms", label: "Rooms", icon: "fa-bed" },
  { value: "iconic-cities", label: "Iconic Cities", icon: "fa-mountain-city" },
  { value: "mountains", label: "Mountains", icon: "fa-mountain" },
  { value: "beaches", label: "Beaches", icon: "fa-umbrella-beach" },
  { value: "villa", label: "Villa", icon: "fa-house" },
  { value: "camping", label: "Camping", icon: "fa-campground" },
  { value: "boats", label: "Boats", icon: "fa-ship" },
];

const CATEGORY_VALUES = CATEGORY_OPTIONS.map((category) => category.value);
const CATEGORY_LABELS = Object.fromEntries(CATEGORY_OPTIONS.map((category) => [category.value, category.label]));

const normalizeCategory = (category) => {
  if (typeof category !== "string") return "trending";

  const normalized = category.trim().toLowerCase();
  return CATEGORY_VALUES.includes(normalized) ? normalized : "trending";
};

const getCategoryLabel = (category) => CATEGORY_LABELS[normalizeCategory(category)] || "Trending";

module.exports = {
  CATEGORY_OPTIONS,
  CATEGORY_VALUES,
  normalizeCategory,
  getCategoryLabel,
};
