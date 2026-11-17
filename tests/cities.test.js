import assert from "node:assert/strict";
import { test } from "node:test";
import {
  findCity,
  isValidCity,
  searchCities,
} from "../src/utils/cities.js";

test("searches cities by full and partial name", () => {
  assert.deepEqual(searchCities("Florianópolis"), [
    { name: "Florianópolis", state: "SC", stateName: "Santa Catarina" },
  ]);
  assert.deepEqual(searchCities("belo"), [
    { name: "Belo Horizonte", state: "MG", stateName: "Minas Gerais" },
  ]);
});

test("searches without case or accent sensitivity", () => {
  assert.deepEqual(searchCities("FLORIANOPOLIS"), [
    { name: "Florianópolis", state: "SC", stateName: "Santa Catarina" },
  ]);
  assert.deepEqual(searchCities("SAO PAULO"), [
    { name: "São Paulo", state: "SP", stateName: "São Paulo" },
  ]);
});

test("searches by state abbreviation", () => {
  assert.deepEqual(
    searchCities("go").map((city) => city.name),
    ["Goiânia", "Goiatuba"],
  );
});

test("limits search results to ten", () => {
  assert.equal(searchCities("a").length, 10);
});

test("returns no results for empty or non-text queries", () => {
  assert.deepEqual(searchCities(""), []);
  assert.deepEqual(searchCities("   "), []);
  assert.deepEqual(searchCities(null), []);
  assert.deepEqual(searchCities(123), []);
});

test("finds a city by name or city and state", () => {
  const florianopolis = {
    name: "Florianópolis",
    state: "SC",
    stateName: "Santa Catarina",
  };
  const goiania = { name: "Goiânia", state: "GO", stateName: "Goiás" };

  assert.deepEqual(findCity("florianopolis"), florianopolis);
  assert.deepEqual(findCity(" Goiânia - GO "), goiania);
});

test("returns null for an unknown city or mismatched state", () => {
  assert.equal(findCity("Atlantis"), null);
  assert.equal(findCity("Goiânia - ZZ"), null);
  assert.equal(findCity("Goiânia - SP"), null);
  assert.equal(findCity(123), null);
});

test("validates known city names and formatted values only", () => {
  assert.equal(isValidCity("Brasília"), true);
  assert.equal(isValidCity("goiania - go"), true);
  assert.equal(isValidCity("Atlantis"), false);
  assert.equal(isValidCity("Goiânia - SP"), false);
  assert.equal(isValidCity(null), false);
});
