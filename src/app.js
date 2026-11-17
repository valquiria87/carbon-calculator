import {
  calculateBicycleEmissions,
  calculateBusEmissions,
  calculateCarEmissions,
  calculateCarbonCreditCost,
  calculateTruckEmissions,
} from "./calculations.js";
import { findCity, searchCities } from "./utils/cities.js";

function getElement(id) {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Elemento obrigatório não encontrado: #${id}`);
  }
  return element;
}

const form = getElement("trip-form");
const originInput = getElement("origin");
const destinationInput = getElement("destination");
const cityOptions = getElement("city-options");
const distanceInput = getElement("manual-distance");
const cargoInput = getElement("cargo-mass");
const creditPriceInput = getElement("credit-price");
const formStatus =
  document.getElementById("form-status") ?? getElement("calculation-status");

const outputElements = {
  bicycle: getElement("bicycle-result"),
  car: getElement("car-result"),
  bus: getElement("bus-result"),
  truck: getElement("truck-result"),
  creditBicycle: getElement("credit-bicycle"),
  creditCar: getElement("credit-car"),
  creditBus: getElement("credit-bus"),
  creditTruck: getElement("credit-truck"),
};

const fieldHelp = {
  distance: getElement("distance-help"),
  cargo: getElement("cargo-help"),
  creditPrice: getElement("credit-price-help"),
};

const fieldErrors = {
  origin: getElement("origin-error"),
  destination: getElement("destination-error"),
};

const defaultHelp = {
  distance: fieldHelp.distance.textContent,
  cargo: fieldHelp.cargo.textContent,
  creditPrice: fieldHelp.creditPrice.textContent,
};

const emissionFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 3,
});
const costFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 2,
});

const initialOutputText = "Aguardando cálculo";
let hasResults = false;

form.noValidate = true;
formStatus.setAttribute("role", "status");
formStatus.setAttribute("aria-live", "polite");
formStatus.setAttribute("aria-atomic", "true");

function setStatus(message) {
  formStatus.textContent = message;
}

function setFieldError(input, errorElement, message) {
  input.setAttribute("aria-invalid", "true");
  errorElement.textContent = message;
}

function clearFieldError(input, errorElement) {
  input.removeAttribute("aria-invalid");
  errorElement.textContent = "";
}

function focusFirstInvalidField() {
  const firstInvalidField = document.querySelector('[aria-invalid="true"]');
  if (firstInvalidField) {
    firstInvalidField.focus();
  }
}

function resetOutputs(message = initialOutputText) {
  Object.values(outputElements).forEach((output) => {
    output.textContent = message;
  });
  hasResults = false;
}

function updateCityOptions(query) {
  cityOptions.replaceChildren();

  const options = document.createDocumentFragment();
  searchCities(query).forEach((city) => {
    const option = document.createElement("option");
    option.value = `${city.name} - ${city.state}`;
    options.append(option);
  });
  cityOptions.append(options);
}

function validateRequiredCity(input, errorElement, label, issues) {
  const city = findCity(input.value);
  if (!city) {
    setFieldError(
      input,
      errorElement,
      `Selecione uma cidade válida de ${label} na lista de sugestões.`,
    );
    issues.push(`A cidade de ${label} deve ser selecionada da lista.`);
    return null;
  }

  clearFieldError(input, errorElement);
  return city;
}

function displayEmission(output, calculator, args, label, issues) {
  try {
    const emissions = calculator(...args);
    output.textContent = emissionFormatter.format(emissions);
    return emissions;
  } catch (error) {
    if (!(error instanceof RangeError) && !(error instanceof TypeError)) {
      throw error;
    }

    output.textContent = "Indisponível";
    issues.push(`Não foi possível calcular as emissões de ${label}.`);
    return null;
  }
}

function displayCredit(output, emissions, price, issues, label) {
  if (emissions === null) {
    output.textContent = "Emissões indisponíveis";
    return;
  }

  try {
    const cost = calculateCarbonCreditCost(emissions, price);
    output.textContent = `${costFormatter.format(cost)} (moeda)`;
  } catch (error) {
    if (!(error instanceof RangeError) && !(error instanceof TypeError)) {
      throw error;
    }

    output.textContent = "Indisponível";
    issues.push(`Não foi possível estimar o custo de créditos para ${label}.`);
  }
}

setStatus(
  "Informe origem, destino e a distância manual obrigatória da viagem para gerar as estimativas.",
);

function clearPreviousResultsOnEdit() {
  if (!hasResults) {
    return;
  }

  resetOutputs();
  setStatus("Os dados foram alterados. Envie o formulário para recalcular.");
}

originInput.addEventListener("input", () => {
  updateCityOptions(originInput.value);
  clearFieldError(originInput, fieldErrors.origin);
  clearPreviousResultsOnEdit();
});

destinationInput.addEventListener("input", () => {
  updateCityOptions(destinationInput.value);
  clearFieldError(destinationInput, fieldErrors.destination);
  clearPreviousResultsOnEdit();
});

distanceInput.addEventListener("input", () => {
  distanceInput.removeAttribute("aria-invalid");
  fieldHelp.distance.textContent = defaultHelp.distance;
  clearPreviousResultsOnEdit();
});

cargoInput.addEventListener("input", () => {
  cargoInput.removeAttribute("aria-invalid");
  fieldHelp.cargo.textContent = defaultHelp.cargo;
  clearPreviousResultsOnEdit();
});

creditPriceInput.addEventListener("input", () => {
  creditPriceInput.removeAttribute("aria-invalid");
  fieldHelp.creditPrice.textContent = defaultHelp.creditPrice;
  clearPreviousResultsOnEdit();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  resetOutputs();

  const issues = [];
  const origin = validateRequiredCity(
    originInput,
    fieldErrors.origin,
    "origem",
    issues,
  );
  const destination = validateRequiredCity(
    destinationInput,
    fieldErrors.destination,
    "destino",
    issues,
  );
  const sameCity =
    origin !== null &&
    destination !== null &&
    origin.name === destination.name &&
    origin.state === destination.state;
  if (sameCity) {
    setFieldError(
      originInput,
      fieldErrors.origin,
      "A origem deve ser diferente do destino.",
    );
    setFieldError(
      destinationInput,
      fieldErrors.destination,
      "O destino deve ser diferente da origem.",
    );
    issues.push("A origem e o destino devem ser cidades diferentes.");
  }

  const distanceText = distanceInput.value.trim();
  const distance = distanceInput.valueAsNumber;
  if (!distanceText) {
    distanceInput.setAttribute("aria-invalid", "true");
    fieldHelp.distance.textContent =
      "Informe a distância manual da viagem em quilômetros.";
    issues.push("Informe a distância manual da viagem em quilômetros.");
  } else if (!Number.isFinite(distance) || distance <= 0) {
    distanceInput.setAttribute("aria-invalid", "true");
    fieldHelp.distance.textContent =
      "Informe uma distância positiva e finita para a viagem, em quilômetros.";
    issues.push(
      "A distância da viagem deve ser um valor positivo e finito em quilômetros.",
    );
  }

  if (
    !origin ||
    !destination ||
    sameCity ||
    !distanceText ||
    !Number.isFinite(distance) ||
    distance <= 0
  ) {
    setStatus(issues.join(" "));
    focusFirstInvalidField();
    return;
  }

  const cargoText = cargoInput.value.trim();
  const cargo = cargoInput.valueAsNumber;
  const hasCargo = cargoText.length > 0 || cargoInput.validity.badInput;
  const validCargo = hasCargo && Number.isFinite(cargo) && cargo > 0;
  if (hasCargo && !validCargo) {
    cargoInput.setAttribute("aria-invalid", "true");
    const cargoError = !Number.isFinite(cargo)
      ? "A carga deve ser um número finito em toneladas."
      : cargo === 0
        ? "A carga deve ser maior que zero."
        : "A carga não pode ser negativa.";
    fieldHelp.cargo.textContent = cargoError;
    issues.push(cargoError);
  } else {
    cargoInput.removeAttribute("aria-invalid");
    fieldHelp.cargo.textContent = defaultHelp.cargo;
  }

  const priceText = creditPriceInput.value.trim();
  const price = creditPriceInput.valueAsNumber;
  const hasPrice = priceText.length > 0;
  const validPrice = hasPrice && Number.isFinite(price) && price >= 0;
  if (hasPrice && !validPrice) {
    creditPriceInput.setAttribute("aria-invalid", "true");
    fieldHelp.creditPrice.textContent =
      "Informe um preço finito e não negativo por tonelada de CO₂e.";
    issues.push("O preço dos créditos deve ser finito e não negativo.");
  } else if (!hasPrice) {
    issues.push("Informe um preço para estimar os custos dos créditos.");
  }

  const bicycleEmissions = displayEmission(
    outputElements.bicycle,
    calculateBicycleEmissions,
    [distance],
    "bicicleta",
    issues,
  );
  const carEmissions = displayEmission(
    outputElements.car,
    calculateCarEmissions,
    [distance],
    "carro",
    issues,
  );
  const busEmissions = displayEmission(
    outputElements.bus,
    calculateBusEmissions,
    [distance],
    "ônibus",
    issues,
  );
  const truckEmissions = validCargo
    ? displayEmission(
        outputElements.truck,
        calculateTruckEmissions,
        [distance, cargo],
        "caminhão",
        issues,
      )
    : null;

  if (!validCargo) {
    const truckUnavailableMessage = hasCargo
      ? "Carga inválida"
      : "Informe a carga para calcular";
    outputElements.truck.textContent = truckUnavailableMessage;
    outputElements.creditTruck.textContent = truckUnavailableMessage;
  }

  if (validPrice) {
    displayCredit(
      outputElements.creditBicycle,
      bicycleEmissions,
      price,
      issues,
      "bicicleta",
    );
    displayCredit(
      outputElements.creditCar,
      carEmissions,
      price,
      issues,
      "carro",
    );
    displayCredit(
      outputElements.creditBus,
      busEmissions,
      price,
      issues,
      "ônibus",
    );
    if (validCargo) {
      displayCredit(
        outputElements.creditTruck,
        truckEmissions,
        price,
        issues,
        "caminhão",
      );
    }
  } else {
    const creditMessage = hasPrice ? "Preço inválido" : "Preço não informado";
    outputElements.creditBicycle.textContent = creditMessage;
    outputElements.creditCar.textContent = creditMessage;
    outputElements.creditBus.textContent = creditMessage;
    if (validCargo) {
      outputElements.creditTruck.textContent = creditMessage;
    }
  }

  hasResults = true;
  setStatus(
    issues.length
      ? `Cálculo concluído com pendências. ${issues.join(" ")}`
      : "Estimativas calculadas em kg CO₂e. Os custos são ilustrativos e usam o preço informado.",
  );
  focusFirstInvalidField();
});
