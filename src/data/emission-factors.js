/*
 * Dados-base do MMA: INEAVAR 2025, ano-base 2024. Os registros usados foram
 * filtrados por `Ano Calendario = 2024`. Os fatores por veículo-km foram
 * obtidos pela razão entre Σ `gco2_equivalente` (g CO2e) e Σ `km_ajustado`
 * (veículo-km), nas mesmas linhas de `consumo_emissoes.csv`.
 * Fonte: https://dados.mma.gov.br/dataset/emissoes-atmosfericas-veiculos-automotores
 * Relatório: https://www.gov.br/transportes/pt-br/assuntos/sustentabilidade/MMA_MT_INEAVAR_2025.pdf
 *
 * Hipóteses deste projeto, não dados fornecidos pelo INEAVAR: ocupação de
 * 1,5 passageiro por carro e carga de 10 t por caminhão. Para ônibus
 * rodoviários, a ocupação média é estimada com dados Pass.Km/km de veículo da
 * ANTT TRIIP, não fornecidos pelo INEAVAR. Este cálculo combinado é uma
 * estimativa do projeto, não um indicador oficial; as bases têm escopos
 * estatísticos diferentes. As médias não representam uma rota específica.
 *
 * Fórmulas do modelo (sem cálculo em runtime):
 * - carro/ônibus: (g CO2e / veículo-km) / 1.000 / passageiros por veículo
 *   = kg CO2e/passageiro-km;
 * - caminhão: (g CO2e / veículo-km) / 1.000 / toneladas por veículo
 *   = indicador ilustrativo em kg CO2e/tonelada-km, após agregar as cinco
 *   categorias informadas e dividir por uma carga hipotética de 10 t. Não é
 *   fator oficial de tonelada-quilômetro nem usa tonelada-quilometragem fornecida
 *   pelo MMA.
 *
 * A leitura de `gco2_equivalente` aparenta excluir CO2 biogênico. Também permanece
 * sem esclarecimento documental uma questão de escala nas parcelas de CH4 e N2O;
 * a metodologia de GWP não é considerada confirmada. Os fatores e sua metodologia
 * não foram integralmente validados e não representam medições de uma viagem.
 * Este módulo exporta constantes e não executa cálculos.
 */

const INEAVAR_SOURCE = Object.freeze({
  name: "Inventário Nacional de Emissões Atmosféricas por Veículos Automotores Rodoviários 2025",
  yearBase: 2024,
  organization: "MMA e Ministério dos Transportes",
  datasetUrl: "https://dados.mma.gov.br/dataset/emissoes-atmosfericas-veiculos-automotores",
  reportUrl: "https://www.gov.br/transportes/pt-br/assuntos/sustentabilidade/MMA_MT_INEAVAR_2025.pdf",
  emissionsColumn: "gco2_equivalente",
  mileageColumn: "km_ajustado",
});

export const EMISSION_FACTORS = Object.freeze({
  // Premissa do modelo: zero apenas para emissões operacionais diretas.
  bicycle: Object.freeze({
    value: 0,
    unit: "kg CO₂e/passageiro-km",
    basis: "operacional direto",
    source: "Premissa do modelo; não é um fator do INEAVAR.",
    formula: "emissão operacional direta assumida = 0",
    limitation: "Não inclui fabricação, manutenção, infraestrutura ou ciclo de vida da bicicleta.",
  }),

  // Recalculo da categoria Automóveis, com filtro `Ano Calendario = 2024`:
  // Σ gco2_equivalente = 65.670.281.864.783 g CO2e;
  // Σ km_ajustado = 698.914.096.148 veículo-km.
  // Conversão: (Σ emissões / Σ km_ajustado) / 1.000 / 1,5 passageiro/veículo.
  // A ocupação de 1,5 é hipótese do projeto, não dado do MMA.
  // O quociente recalculado é aproximadamente 0.0626402989310786; o valor
  // 0.0626402987 permanece conforme fornecido. A diferença absoluta é cerca
  // de 0.0000000002310786 kg CO2e/passageiro-km.
  car: Object.freeze({
    value: 0.0626402987,
    unit: "kg CO₂e/passageiro-km",
    source: INEAVAR_SOURCE,
    category: "Automóveis",
    formula: "(Σ gco2_equivalente / Σ km_ajustado) / 1.000 / ocupação média",
    modelAssumption: Object.freeze({
      averageOccupancy: 1.5,
      occupancyUnit: "passageiros/veículo",
    }),
    limitation: "Fator médio da categoria Automóveis; a ocupação é uma premissa do modelo, não um dado do MMA.",
  }),

  // INEAVAR 2025, ano-base 2024, categoria Ônibus rodoviários:
  // intensidade indicada de 691.0623 g CO2e/veículo-km, após filtro
  // `Ano Calendario = 2024`.
  // ANTT TRIIP 2025, ano de referência 2024: Pass.Km = 23.945.322.900;
  // distância = 1.503.842.958 km. A tabela/série específica não foi confirmada
  // no material disponível e não é identificada aqui por nome ou URL.
  // Ocupação média estimada = Pass.Km / distância = 15.922754947661...;
  // o modelo usa 15.9227549477 passageiros/veículo. O fator combina a
  // intensidade do INEAVAR, convertida de gramas para quilogramas, com essa
  // razão da ANTT. As bases têm escopos estatísticos diferentes; não é fator oficial.
  bus: Object.freeze({
    value: 0.0434009254,
    unit: "kg CO₂e/passageiro-km",
    source: Object.freeze({
      emissions: INEAVAR_SOURCE,
      occupancy: Object.freeze({
        name: "ANTT TRIIP 2025",
        dataYear: 2024,
        passengerKilometers: 23945322900,
        vehicleKilometers: 1503842958,
      }),
    }),
    category: "Ônibus rodoviários",
    formula: "(Σ gco2_equivalente / Σ km_ajustado) / 1.000 / ocupação média",
    modelAssumption: Object.freeze({
      averageOccupancy: 15.9227549477,
      occupancyUnit: "passageiros/veículo",
      derivation: "23.945.322.900 Pass.Km / 1.503.842.958 km",
      emissionIntensity: 691.0623,
      emissionUnit: "g CO₂e/veículo-km",
    }),
    limitation: "Estimativa combinada de INEAVAR e ANTT, não um fator oficial. As bases têm escopos estatísticos diferentes.",
  }),

  // Indicador ilustrativo: somar gco2_equivalente das cinco categorias listadas
  // abaixo, dividir pela soma de km_ajustado das mesmas linhas, converter de
  // gramas para quilogramas e dividir pela carga hipotética de 10 t.
  // A carga de 10 t é hipótese do projeto, não dado do INEAVAR. O resultado
  // não é fator oficial de tonelada-quilômetro nem usa tonelada-quilometragem
  // fornecida pelo MMA. O histórico de cálculo consultado registra apenas a
  // razão agregada aproximada de 572.030734 g CO2e/veículo-km; as somas brutas
  // não estão disponíveis e não são inferidas aqui.
  truck: Object.freeze({
    value: 0.0572030734,
    unit: "kg CO₂e/tonelada-km",
    source: INEAVAR_SOURCE,
    categories: Object.freeze([
      "Caminhões leves",
      "Caminhões médios",
      "Caminhões pesados",
      "Caminhões semileves",
      "Caminhões semipesados",
    ]),
    formula: "emissões agregadas em kg CO₂e / tonelada-quilometragem; fator por veículo-km / carga média",
    modelAssumption: Object.freeze({
      averageLoad: 10,
      loadUnit: "toneladas",
    }),
    limitation: "A carga média de 10 t é hipotética; o MMA não fornece carga útil nem tonelada-quilometragem.",
  }),
});
