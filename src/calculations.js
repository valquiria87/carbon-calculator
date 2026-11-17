import { EMISSION_FACTORS } from "./data/emission-factors.js";

function validateNonNegativeFinite(value, name) {
  if (typeof value !== "number") {
    throw new TypeError(`${name} deve ser um número.`);
  }

  if (!Number.isFinite(value)) {
    throw new RangeError(`${name} deve ser finito.`);
  }

  if (value < 0) {
    throw new RangeError(`${name} não pode ser negativo.`);
  }

  return value;
}

function validateResult(value) {
  if (!Number.isFinite(value)) {
    throw new RangeError("O resultado calculado não é finito.");
  }

  return value;
}

function calculatePassengerEmissions(distanceKm, factor) {
  const distance = validateNonNegativeFinite(distanceKm, "A distância");
  return validateResult(distance * factor.value);
}

export function calculateBicycleEmissions(distanceKm) {
  return calculatePassengerEmissions(distanceKm, EMISSION_FACTORS.bicycle);
}

export function calculateCarEmissions(distanceKm) {
  return calculatePassengerEmissions(distanceKm, EMISSION_FACTORS.car);
}

export function calculateBusEmissions(distanceKm) {
  return calculatePassengerEmissions(distanceKm, EMISSION_FACTORS.bus);
}

export function calculateTruckEmissions(distanceKm, loadTonnes) {
  const distance = validateNonNegativeFinite(distanceKm, "A distância");
  const load = validateNonNegativeFinite(loadTonnes, "A carga");
  return validateResult(distance * load * EMISSION_FACTORS.truck.value);
}

export function calculateCarbonCreditCost(emissionsKg, pricePerTonne) {
  const emissions = validateNonNegativeFinite(emissionsKg, "As emissões");
  const price = validateNonNegativeFinite(pricePerTonne, "O preço por tonelada");
  return validateResult((emissions / 1000) * price);
}
