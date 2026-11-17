# Carbon Calculator

Calculadora web estática para estimar e comparar emissões de gases de efeito estufa associadas a uma viagem de passageiros ou ao transporte de carga. O projeto foi desenvolvido como desafio da DIO e organiza a interface, os dados metodológicos e as funções de cálculo em módulos separados.

> **Importante:** os valores apresentados são estimativas em kg CO₂e, baseadas em fatores médios e hipóteses documentadas. Não são medições de uma viagem, fatores oficiais para uma rota específica nem garantias de compensação de carbono.

## Objetivo e público

O projeto ajuda a visualizar como diferentes modalidades podem se comparar em uma estimativa de emissões. É voltado a estudantes, participantes de desafios de desenvolvimento e pessoas interessadas em explorar o tema de mobilidade e transporte de forma educativa.

A distância precisa ser informada manualmente. A aplicação não consulta mapas nem calcula a distância real entre as cidades selecionadas.

## Funcionalidades implementadas

- Sugestões de cidades de origem e destino com busca parcial, sem distinção entre maiúsculas/minúsculas ou acentos.
- Validação das cidades contra a lista local cadastrada e bloqueio de origem igual ao destino.
- Campo obrigatório para distância manual da viagem, em quilômetros.
- Estimativa de emissões por passageiro para bicicleta, carro e ônibus rodoviários.
- Estimativa separada para caminhão, informando a distância e a massa da carga em toneladas. A carga é opcional; sem ela, o cálculo do caminhão não é apresentado.
- Estimativa de custo para cada modalidade quando o usuário informa um preço por tonelada de CO₂e. O preço é opcional e não há uma moeda ou cotação predefinida.
- Mensagens de validação e status acessíveis, com foco direcionado ao primeiro campo inválido.
- Layout responsivo, HTML semântico, rótulo para campos, atalho para pular ao conteúdo e indicação visível de foco.

O catálogo local contém 28 cidades: as capitais brasileiras e Goiatuba (GO). Não há cadastro de rotas ou distâncias.

## Tecnologias e arquitetura

- **HTML5:** estrutura semântica e formulário.
- **CSS3:** estilos responsivos, com abordagem mobile-first.
- **JavaScript ES Modules:** interface, dados e cálculos em JavaScript nativo, sem frameworks ou bibliotecas externas.
- **Node.js:** execução dos testes automatizados pelo test runner nativo `node:test`.

```text
carbon-calculator/
├── index.html
├── css/
│   └── style.css
├── src/
│   ├── app.js
│   ├── calculations.js
│   ├── data/
│   │   ├── cities.js
│   │   └── emission-factors.js
│   └── utils/
│       └── cities.js
├── tests/
│   ├── calculations.test.js
│   └── cities.test.js
├── package.json
└── README.md
```

- `index.html` contém o formulário e as áreas de resultados.
- `css/style.css` define o visual e os breakpoints responsivos.
- `src/app.js` conecta eventos, validações e apresentação dos resultados.
- `src/calculations.js` contém as funções puras de cálculo e suas validações numéricas.
- `src/data/cities.js` mantém a lista simulada de cidades.
- `src/data/emission-factors.js` reúne fatores, unidades, hipóteses e notas metodológicas.
- `src/utils/cities.js` implementa busca e validação das cidades.
- `tests/` contém testes das funções de cálculo e da busca de cidades.
- `package.json` define o projeto como módulo ES e o comando de testes; não declara dependências externas.

## Metodologia dos fatores

Os fatores usados pela aplicação estão em [src/data/emission-factors.js](src/data/emission-factors.js). As fórmulas abaixo descrevem o modelo do projeto; não representam uma validação independente dos inventários de origem.

| Modalidade | Fator usado | Unidade e interpretação |
|---|---:|---|
| Bicicleta | `0` | kg CO₂e/passageiro-km; premissa de emissão operacional direta zero |
| Carro | `0.0626402987` | kg CO₂e/passageiro-km |
| Ônibus rodoviários | `0.0434009254` | kg CO₂e/passageiro-km; estimativa combinada |
| Caminhão | `0.0572030734` | kg CO₂e/tonelada-km; indicador ilustrativo baseado em carga hipotética |

### Bicicleta

O modelo assume emissão operacional direta igual a zero. Isso não significa neutralidade de ciclo de vida: fabricação, manutenção, infraestrutura e outras emissões indiretas não são contabilizadas.

### Carro

O fator corresponde à categoria **Automóveis** do INEAVAR, filtrada por `Ano Calendario = 2024`. A documentação do fator registra as somas de `gco2_equivalente` (65.670.281.864.783 g CO₂e) e `km_ajustado` (698.914.096.148 veículo-km). O cálculo por passageiro considera a ocupação hipotética de 1,5 passageiro por veículo:

```text
(Σ emissões em g CO₂e / Σ km_ajustado em veículo-km)
/ 1.000
/ 1,5 passageiro por veículo
```

O fator mantido no código é `0.0626402987`. O recálculo documentado a partir das somas resulta em aproximadamente `0.0626402989310786`, com diferença absoluta de aproximadamente `0.0000000002310786` kg CO₂e/passageiro-km. A ocupação de 1,5 é hipótese do projeto, não dado fornecido pelo INEAVAR.

### Ônibus rodoviários

O fator é uma **estimativa combinada**, não um fator oficial. A intensidade do INEAVAR 2025, ano-base 2024, é de 691,0623 g CO₂e/veículo-km. Para estimar a ocupação, o projeto usa dados ANTT TRIIP 2025 referentes a 2024:

```text
23.945.322.900 Pass.Km / 1.503.842.958 km
= aproximadamente 15,9227549477 passageiros por veículo
```

O fator é obtido convertendo a intensidade para quilogramas e dividindo pela ocupação estimada:

```text
691,0623 / 1.000 / 15,9227549477
≈ 0,0434009254 kg CO₂e/passageiro-km
```

As bases têm escopos estatísticos diferentes. O projeto não registra o identificador ou o nome da tabela/série específica da ANTT nem um link oficial direto para ela; esses dados não devem ser interpretados como uma taxa oficial de ocupação para uma rota ou viagem individual.

### Caminhão

O fator é um indicador ilustrativo calculado pela soma das emissões das cinco categorias de caminhão listadas no módulo de fatores, dividida pela soma dos quilômetros ajustados correspondentes. A razão é convertida de gramas para quilogramas e dividida pela carga hipotética de 10 toneladas:

```text
(Σ emissões agregadas em g CO₂e / Σ km_ajustado em veículo-km)
/ 1.000
/ 10 toneladas
```

O histórico metodológico disponível registra apenas o intermediário aproximado de 572,030734 g CO₂e/veículo-km; as somas brutas não estão disponíveis no projeto. A carga de 10 t é uma hipótese do modelo, não um dado do INEAVAR. Portanto, o valor não é um fator oficial de tonelada-quilômetro nem usa tonelada-quilometragem fornecida pelo MMA.

### Cálculos apresentados

Para cada modalidade de passageiros, a aplicação multiplica o fator pela distância informada:

```text
emissões por passageiro (kg CO₂e)
= distância (km) × fator (kg CO₂e/passageiro-km)
```

Para o caminhão, a massa da carga informada pelo usuário é multiplicada pela distância e pelo fator:

```text
emissões da carga (kg CO₂e)
= distância (km) × carga (t) × fator (kg CO₂e/tonelada-km)
```

Quando o usuário fornece um preço por tonelada de CO₂e, o custo indicativo é calculado por:

```text
custo (moeda)
= emissões (kg CO₂e) / 1.000 × preço informado (moeda/t CO₂e)
```

Esse cálculo não define uma moeda, não consulta cotações e não representa a compra ou a aposentadoria de créditos de carbono.

## Fontes e limitações

Os links do INEAVAR abaixo são os registrados no próprio projeto:

- MMA, conjunto de dados do inventário: [Emissões Atmosféricas por Veículos Automotores](https://dados.mma.gov.br/dataset/emissoes-atmosfericas-veiculos-automotores).
- Relatório INEAVAR 2025: [MMA/Ministério dos Transportes](https://www.gov.br/transportes/pt-br/assuntos/sustentabilidade/MMA_MT_INEAVAR_2025.pdf).
- ANTT TRIIP 2025: a fonte e os números usados estão descritos no projeto, mas não há link oficial direto nem identificação da tabela/série registrada. Nenhum URL é presumido neste README.

Limitações metodológicas importantes:

- Os fatores representam médias agregadas e não uma rota, veículo, ocupação ou operação específicos.
- A distância é inserida manualmente e não é verificada por serviço de mapas.
- A ocupação de carro (1,5 passageiro/veículo) e a carga de referência do caminhão (10 t) são hipóteses do projeto.
- O fator de ônibus combina bases com escopos estatísticos diferentes.
- O fator de caminhão é ilustrativo e não equivale a um fator oficial baseado em tonelada-quilometragem.
- A leitura de `gco2_equivalente` aparenta excluir CO₂ biogênico; essa interpretação não é tratada como confirmada. Também há uma questão documental não esclarecida sobre a escala de CH₄ e N₂O, e o GWP não é considerado confirmado.
- Os fatores e sua metodologia não foram integralmente validados. Os resultados não devem ser usados como inventário oficial, medição real ou recomendação financeira.

## Executar localmente

### Requisitos

- Navegador moderno com suporte a JavaScript ES Modules.
- Node.js 16.17.0 ou superior para executar os testes com `node:test` e a opção `node --test`. A série Node.js 16 está fora de suporte; para uso cotidiano, prefira uma versão LTS atualmente suportada.

Não é necessário instalar dependências do projeto.

### Servir a aplicação

Como a aplicação usa módulos JavaScript, abra-a por um servidor HTTP local, em vez de depender do protocolo `file://`. Por exemplo, com Python instalado:

```powershell
python -m http.server 8000
```

Execute o comando na raiz do projeto e acesse `http://localhost:8000` no navegador. Python é apenas uma opção para servir os arquivos localmente; não é dependência da aplicação.

### Executar os testes

No PowerShell, na raiz do projeto:

```powershell
npm.cmd test
```

Os testes cobrem cálculos de emissões e custo, entradas numéricas inválidas e funções de busca e validação de cidades.

## Melhorias futuras

Os itens abaixo são possibilidades futuras e **não fazem parte das funcionalidades implementadas**:

- Associar cidades a rotas e distâncias verificáveis, com fonte e data de atualização.
- Ampliar e manter o catálogo de cidades.
- Registrar a identificação e o link oficial da tabela/série ANTT usada na estimativa de ocupação.
- Revisar e fortalecer a rastreabilidade metodológica dos fatores, incluindo as questões documentais de CO₂ biogênico, CH₄, N₂O e GWP.
- Adicionar testes automatizados de interface e fluxos completos no navegador.
- Configurar e validar a publicação do site no GitHub Pages.
