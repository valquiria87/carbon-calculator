import { CITIES } from "../data/cities.js";

function normalize(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function searchCities(query) {
  if (typeof query !== "string") {
    return [];
  }

  const normalizedQuery = normalize(query);
  if (!normalizedQuery) {
    return [];
  }

  return CITIES.filter((city) => {
    return (
      normalize(city.name).includes(normalizedQuery) ||
      normalize(city.state).includes(normalizedQuery)
    );
  }).slice(0, 10);
}

export function findCity(value) {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = normalize(value);
  if (!normalizedValue) {
    return null;
  }

  const formattedValue = normalizedValue.match(/^(.*?)\s*-\s*([a-z]{2})$/);
  if (formattedValue) {
    const [, name, state] = formattedValue;
    return (
      CITIES.find(
        (city) =>
          normalize(city.name) === name.trim() &&
          normalize(city.state) === state,
      ) ?? null
    );
  }

  return (
    CITIES.find((city) => normalize(city.name) === normalizedValue) ?? null
  );
}

export function isValidCity(value) {
  return findCity(value) !== null;
}
