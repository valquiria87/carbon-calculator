import assert from "node:assert/strict";
import { test } from "node:test";
import {
  calculateBicycleEmissions,
  calculateBusEmissions,
  calculateCarEmissions,
  calculateCarbonCreditCost,
  calculateTruckEmissions,
} from "../src/calculations.js";

test("calcula emissões de bicicleta em kg CO₂e", () => {
  assert.equal(calculateBicycleEmissions(100), 0);
});

test("calcula emissões de carro em kg CO₂e sem arredondamento", () => {
  assert.equal(calculateCarEmissions(100), 6.26402987);
});

test("calcula emissões de ônibus em kg CO₂e sem arredondamento", () => {
  assert.equal(calculateBusEmissions(1), 0.0434009254);
});

test("calcula emissões de caminhão em kg CO₂e sem arredondamento", () => {
  assert.equal(calculateTruckEmissions(100, 10), 57.2030734);
});

test("calcula custo ilustrativo dos créditos", () => {
  assert.equal(calculateCarbonCreditCost(1500, 100), 150);
});

test("aceita distância e carga iguais a zero", () => {
  assert.equal(calculateBicycleEmissions(0), 0);
  assert.equal(calculateCarEmissions(0), 0);
  assert.equal(calculateBusEmissions(0), 0);
  assert.equal(calculateTruckEmissions(0, 10), 0);
  assert.equal(calculateTruckEmissions(10, 0), 0);
  assert.equal(calculateCarbonCreditCost(0, 100), 0);
  assert.equal(calculateCarbonCreditCost(1000, 0), 0);
});

test("rejeita entradas negativas", () => {
  assert.throws(() => calculateBicycleEmissions(-1), RangeError);
  assert.throws(() => calculateCarEmissions(-1), RangeError);
  assert.throws(() => calculateBusEmissions(-1), RangeError);
  assert.throws(() => calculateTruckEmissions(-1, 1), RangeError);
  assert.throws(() => calculateTruckEmissions(1, -1), RangeError);
  assert.throws(() => calculateCarbonCreditCost(-1, 1), RangeError);
  assert.throws(() => calculateCarbonCreditCost(1, -1), RangeError);
});

test("rejeita NaN e Infinity", () => {
  assert.throws(() => calculateBicycleEmissions(Number.NaN), RangeError);
  assert.throws(() => calculateCarEmissions(Number.POSITIVE_INFINITY), RangeError);
  assert.throws(() => calculateBusEmissions(Number.NEGATIVE_INFINITY), RangeError);
  assert.throws(() => calculateTruckEmissions(Number.NaN, 1), RangeError);
  assert.throws(() => calculateTruckEmissions(1, Number.POSITIVE_INFINITY), RangeError);
  assert.throws(() => calculateCarbonCreditCost(Number.NaN, 1), RangeError);
  assert.throws(() => calculateCarbonCreditCost(1, Number.POSITIVE_INFINITY), RangeError);
});

test("rejeita valores não numéricos", () => {
  assert.throws(() => calculateBicycleEmissions("10"), TypeError);
  assert.throws(() => calculateCarEmissions(null), TypeError);
  assert.throws(() => calculateBusEmissions(undefined), TypeError);
  assert.throws(() => calculateTruckEmissions("10", 1), TypeError);
  assert.throws(() => calculateTruckEmissions(10, "1"), TypeError);
  assert.throws(() => calculateCarbonCreditCost("100", 1), TypeError);
  assert.throws(() => calculateCarbonCreditCost(100, "1"), TypeError);
});

test("rejeita resultados não finitos causados por overflow", () => {
  assert.throws(
    () => calculateTruckEmissions(Number.MAX_VALUE, 2),
    RangeError,
  );
  assert.throws(
    () => calculateCarbonCreditCost(Number.MAX_VALUE, Number.MAX_VALUE),
    RangeError,
  );
});
