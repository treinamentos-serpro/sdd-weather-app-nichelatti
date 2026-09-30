# Backlog de Tarefas — Weather App

As tarefas abaixo derivam de `plans/weather-app-plan.md` e `specs/weather-app-spec.md`.
Open-Meteo é a proposta do plano, não uma decisão aprovada na spec. Tarefas de
implementação que dependem dessa escolha ficam bloqueadas até a conclusão de
T-01. Não implementar decisões de produto ainda em aberto sem registrá-las na
spec.

## Entrega 1 — Fechar decisões e contratos

### T-01 — Fechar decisões de integração e qualidade

- **Tipo:** Infra
- **Descrição:** Confirmar o provedor e os campos meteorológicos e fechar os
  critérios mensuráveis de desempenho, acessibilidade e suporte móvel; atualizar
  spec e plano com as decisões.
- **Critérios de aceite:**
  - A spec identifica o provedor aprovado para busca e previsão.
  - A spec lista os campos obrigatórios de clima atual e previsão.
  - A spec define se os cinco dias incluem hoje.
  - A spec define o idioma de busca/apresentação e os dados de localização
    necessários para diferenciar cidades homônimas.
  - A spec define metas de desempenho, timeout, padrão de acessibilidade e
    viewports/navegadores móveis suportados.
  - O plano e os parâmetros de API refletem as decisões registradas.
- **Dependências:** —
- **Arquivos:** `specs/weather-app-spec.md`, `plans/weather-app-plan.md`
- **Rastreabilidade:** RF1, RF2, RF3; RNF Performance, Acessibilidade e
  Responsividade; perguntas abertas sobre provedor, campos, período,
  desambiguação, idioma e critérios não funcionais.

### T-02 — Definir unidade inicial e recuperação de falhas

- **Tipo:** Infra
- **Descrição:** Resolver na spec a unidade inicial/persistência da preferência
  e a ação esperada para repetir uma busca ou consulta com falha.
- **Critérios de aceite:**
  - A spec define qual unidade é selecionada inicialmente e se a escolha é
    mantida após novas consultas ou recarregamento.
  - A spec define se existe ação de tentar novamente e quais dados/entrada ela
    reutiliza.
  - A spec define o limite de timeout e a recuperação de falhas de rede.
  - A spec ou o plano define a precisão/forma de arredondamento para exibição
    das temperaturas.
  - O plano descreve o comportamento aprovado para o estado de unidade e para
    recuperação.
- **Dependências:** —
- **Arquivos:** `specs/weather-app-spec.md`, `plans/weather-app-plan.md`
- **Rastreabilidade:** RF4, RF6; perguntas abertas sobre unidade, retry e
  formatação de temperatura.

### T-03 — Definir os tipos do domínio meteorológico

- **Tipo:** Data
- **Descrição:** Criar os tipos compartilhados de cidade, unidade, clima atual,
  dia de previsão e conjunto de dados conforme os contratos aprovados.
- **Critérios de aceite:**
  - `City`, `TemperatureUnit`, `CurrentWeather`, `ForecastDay` e `WeatherData`
    representam os campos definidos na spec e no plano atualizado.
  - Coordenadas e valores meteorológicos têm tipos explícitos; campos
    opcionais refletem apenas dados realmente opcionais no contrato da API.
  - Os tipos compilam em TypeScript strict.
- **Dependências:** T-01, T-02
- **Arquivos:** `src/types/weather.ts`
- **Rastreabilidade:** RF1–RF4.

## Entrega 2 — Lógica pura e seus testes

### T-04 — Implementar conversão e formatação de temperatura

- **Tipo:** Data
- **Descrição:** Criar funções puras para apresentar temperaturas nas unidades
  Celsius e Fahrenheit com arredondamento consistente.
- **Critérios de aceite:**
  - A conversão usa $F = C \times 9/5 + 32$ e não modifica os valores
    canônicos armazenados.
  - A formatação identifica a unidade e aplica a precisão acordada no plano.
  - A função aceita os tipos de unidade definidos em T-03.
- **Dependências:** T-02, T-03
- **Arquivos:** `src/lib/temperature.ts`
- **Rastreabilidade:** RF4.

### T-05 — Testar conversão e formatação de temperatura

- **Tipo:** Test
- **Descrição:** Cobrir casos positivos, negativos, limite e apresentação da
  unidade para as funções de temperatura.
- **Critérios de aceite:**
  - Testes verificam `0 °C → 32 °F`, `100 °C → 212 °F` e `-40 °C → -40 °F`.
  - Testes verificam o caminho de exibição Celsius e Fahrenheit e o
    arredondamento definido.
  - `pnpm test` executa os testes sem falhas.
- **Dependências:** T-04
- **Arquivos:** `tests/unit/temperature.test.ts`
- **Rastreabilidade:** RF4.

### T-06 — Mapear códigos de condição meteorológica

- **Tipo:** Data
- **Descrição:** Criar mapeamento dos códigos aprovados pelo provedor para
  rótulos localizados e identificadores visuais usados pela UI.
- **Critérios de aceite:**
  - Os códigos usados pela API aprovada possuem mapeamento.
  - Um código desconhecido produz um fallback legível, sem quebrar a
    apresentação.
  - O mapeamento não depende de estado React ou de rede.
- **Dependências:** T-01
- **Arquivos:** `src/lib/weatherCodes.ts`
- **Rastreabilidade:** RF2, RF3.

### T-07 — Testar mapeamento de condições

- **Tipo:** Test
- **Descrição:** Verificar os códigos meteorológicos relevantes e o fallback.
- **Critérios de aceite:**
  - Há casos de teste para códigos aprovados que representem condições
    distintas.
  - Um código desconhecido retorna o fallback definido.
  - `pnpm test` executa os testes sem falhas.
- **Dependências:** T-06
- **Arquivos:** `tests/unit/weatherCodes.test.ts`
- **Rastreabilidade:** RF2, RF3.

### T-08 — Formatar datas da previsão

- **Tipo:** Data
- **Descrição:** Criar uma função pura que formate a data de cada item da
  previsão no idioma aprovado.
- **Critérios de aceite:**
  - Uma data ISO válida é formatada usando o fuso/regra acordados no plano.
  - Datas inválidas têm comportamento definido e não derrubam a UI.
  - A função é independente de chamadas de API.
- **Dependências:** T-01, T-03
- **Arquivos:** `src/lib/formatDate.ts`
- **Rastreabilidade:** RF3.

### T-09 — Testar formatação de datas

- **Tipo:** Test
- **Descrição:** Cobrir datas válidas, mudança de dia local e entrada inválida.
- **Critérios de aceite:**
  - Testes verificam a saída para data válida no fuso adotado.
  - Um caso próximo à mudança de dia não apresenta a data do dia incorreto.
  - Entrada inválida segue o fallback definido sem lançar erro inesperado.
- **Dependências:** T-08
- **Arquivos:** `tests/unit/formatDate.test.ts`
- **Rastreabilidade:** RF3.

## Entrega 3 — Integração de dados

### T-10 — Implementar busca de cidades

- **Tipo:** Data
- **Descrição:** Implementar `searchCities(query)` no serviço de geocoding
  aprovado, mapeando a resposta para `City[]`.
- **Critérios de aceite:**
  - O serviço envia os parâmetros aprovados em T-01 e normaliza os campos para
    `City`.
  - Resposta válida sem correspondências retorna lista vazia.
  - Erros HTTP, rede e cancelamento não são tratados como busca sem resultados.
  - Resposta malformada falha de forma controlada.
- **Dependências:** T-01, T-03
- **Arquivos:** `src/services/geocodingService.ts`
- **Rastreabilidade:** RF1, RF6; RNF Resiliência.

### T-11 — Testar busca de cidades

- **Tipo:** Test
- **Descrição:** Testar o serviço de geocoding com respostas simuladas.
- **Critérios de aceite:**
  - Testes cobrem resultados, lista vazia, erro HTTP, falha de rede e resposta
    inválida.
  - É verificado que nome, localização e coordenadas são mapeados corretamente.
  - Nenhum teste depende de chamada real à API.
- **Dependências:** T-10
- **Arquivos:** `tests/unit/geocodingService.test.ts`
- **Rastreabilidade:** RF1, RF6; RNF Resiliência.

### T-12 — Implementar consulta de clima e previsão

- **Tipo:** Data
- **Descrição:** Implementar `getWeather(latitude, longitude)`, mapear clima
  atual e cinco dias para `WeatherData` e validar a estrutura retornada.
- **Critérios de aceite:**
  - A chamada usa endpoint e parâmetros aprovados em T-01.
  - A resposta é mapeada em clima atual e exatamente cinco dias conforme a
    regra de contagem aprovada.
  - Datas e campos são associados pelo índice correto das séries diárias.
  - Falhas HTTP, rede, cancelamento e respostas incompletas geram erro
    controlado; valores ausentes não são convertidos em zero.
- **Dependências:** T-01, T-03, T-06, T-08
- **Arquivos:** `src/services/weatherService.ts`
- **Rastreabilidade:** RF2, RF3, RF6; RNF Resiliência.

### T-13 — Testar consulta de clima e previsão

- **Tipo:** Test
- **Descrição:** Cobrir o mapeamento e os erros do serviço meteorológico com
  `fetch` simulado.
- **Critérios de aceite:**
  - Testes cobrem resposta válida, cinco dias, mapeamento dos campos e datas.
  - Testes cobrem erro HTTP, falha de rede, timeout/cancelamento e resposta
    parcial/inválida.
  - Testes não fazem chamadas reais ao provedor.
- **Dependências:** T-12
- **Arquivos:** `tests/unit/weatherService.test.ts`
- **Rastreabilidade:** RF2, RF3, RF6; RNF Resiliência.

## Entrega 4 — Orquestração e estados

### T-14 — Implementar o hook de consulta meteorológica

- **Tipo:** Data
- **Descrição:** Criar `useWeather` para coordenar busca, seleção de cidade,
  consulta de dados, unidade e recuperação de erro.
- **Critérios de aceite:**
  - O estado distingue repouso, busca, seleção, carregamento meteorológico,
    vazio, sucesso e erro.
  - Ações expostas permitem buscar, selecionar cidade, trocar unidade e repetir
    a ação com falha conforme T-02.
  - Uma resposta obsoleta não substitui o resultado de uma consulta mais
    recente.
  - A troca de unidade não dispara nova requisição.
- **Dependências:** T-02, T-03, T-04, T-10, T-12
- **Arquivos:** `src/hooks/useWeather.ts`
- **Rastreabilidade:** RF1–RF4, RF6.

### T-15 — Testar estados e ações do hook

- **Tipo:** Test
- **Descrição:** Testar as transições do hook com serviços simulados.
- **Critérios de aceite:**
  - Testes verificam busca com resultado e sem resultado, seleção, sucesso e
    erro nas duas operações.
  - Testes verificam retry conforme T-02 e que uma resposta antiga não vence
    uma solicitação mais recente.
  - Trocar unidade atualiza a unidade exposta sem nova chamada de serviço.
- **Dependências:** T-14
- **Arquivos:** `tests/unit/useWeather.test.ts`
- **Rastreabilidade:** RF1–RF4, RF6.

## Entrega 5 — Interface

### T-16 — Criar campo de busca acessível

- **Tipo:** UI
- **Descrição:** Implementar `SearchBar` com entrada de cidade e ação de busca.
- **Critérios de aceite:**
  - Campo tem label acessível e pode ser operado por teclado.
  - Valor vazio ou composto apenas por espaços não inicia a busca.
  - O componente sinaliza visualmente e semanticamente quando está desabilitado
    durante busca.
- **Dependências:** T-14
- **Arquivos:** `src/components/SearchBar.tsx`
- **Rastreabilidade:** RF1; RNF Acessibilidade.

### T-17 — Exibir e selecionar resultados de cidade

- **Tipo:** UI
- **Descrição:** Implementar a lista de cidades encontradas com contexto de
  país/região definido em T-01.
- **Critérios de aceite:**
  - Cada opção apresenta nome e o contexto disponível aprovado para
    desambiguação.
  - Selecionar uma opção chama a ação de seleção com o objeto `City` correto.
  - Opções podem ser alcançadas e selecionadas por teclado.
- **Dependências:** T-03, T-14
- **Arquivos:** `src/components/CityResults.tsx`
- **Rastreabilidade:** RF1; RNF Acessibilidade.

### T-18 — Criar componentes de carregamento, vazio e erro

- **Tipo:** UI
- **Descrição:** Implementar apresentação distinguível dos estados de busca,
  consulta, sem resultados e falha.
- **Critérios de aceite:**
  - Busca e consulta em andamento têm indicação identificável.
  - Resultado vazio não é confundido com carregamento ou falha.
  - Erro informa que a operação não pôde ser concluída e oferece retry conforme
    T-02.
  - Mensagens são expostas de forma compreensível a tecnologias assistivas.
- **Dependências:** T-02, T-14
- **Arquivos:** `src/components/states/LoadingState.tsx`,
  `src/components/states/EmptyState.tsx`,
  `src/components/states/ErrorState.tsx`
- **Rastreabilidade:** RF6; RNF Acessibilidade e Resiliência.

### T-19 — Exibir clima atual

- **Tipo:** UI
- **Descrição:** Implementar o componente de clima atual com os campos
  aprovados em T-01.
- **Critérios de aceite:**
  - Os dados são identificados como clima atual da cidade selecionada.
  - Temperatura e demais campos aprovados são apresentados com unidade ou
    formato identificável.
  - Campo ausente segue o comportamento definido para dado indisponível e não
    aparece como zero válido.
- **Dependências:** T-03, T-04, T-06
- **Arquivos:** `src/components/CurrentWeather.tsx`
- **Rastreabilidade:** RF2, RF4.

### T-20 — Exibir previsão de cinco dias

- **Tipo:** UI
- **Descrição:** Implementar lista e item visual de previsão diária para os
  cinco dias retornados.
- **Critérios de aceite:**
  - São exibidos os cinco dias validados, cada um com data e campos aprovados
    em T-01.
  - Temperaturas mínima e máxima usam a unidade selecionada.
  - Layout mantém os itens e seus dados legíveis em viewport móvel.
- **Dependências:** T-03, T-04, T-06, T-08
- **Arquivos:** `src/components/ForecastList.tsx`,
  `src/components/ForecastDayItem.tsx`
- **Rastreabilidade:** RF3, RF4, RF5.

### T-21 — Criar controle de unidade

- **Tipo:** UI
- **Descrição:** Implementar controle acessível de alternância entre Celsius e
  Fahrenheit.
- **Critérios de aceite:**
  - Ambas as unidades podem ser selecionadas por mouse e teclado.
  - A unidade selecionada é identificável visualmente e por tecnologia
    assistiva.
  - A ação atualiza a unidade do estado conforme T-02 sem novo request.
- **Dependências:** T-02, T-14
- **Arquivos:** `src/components/UnitToggle.tsx`
- **Rastreabilidade:** RF4; RNF Acessibilidade.

### T-22 — Integrar o fluxo no aplicativo

- **Tipo:** UI
- **Descrição:** Compor busca, resultados, clima, previsão, unidade e estados no
  `App`, conectando-os ao hook.
- **Critérios de aceite:**
  - É possível iniciar busca, selecionar cidade e ver os dados retornados.
  - Estados vazio, loading e erro aparecem no contexto da operação correta.
  - Alternar unidade atualiza clima atual e todos os valores da previsão.
  - A estrutura não apresenta dados de cidade anterior como se fossem da nova
    seleção durante carregamento/erro.
- **Dependências:** T-14, T-16, T-17, T-18, T-19, T-20, T-21
- **Arquivos:** `src/App.tsx`
- **Rastreabilidade:** RF1–RF4, RF6.

### T-23 — Ajustar responsividade e acessibilidade da interface

- **Tipo:** UI
- **Descrição:** Revisar o fluxo integrado para uso em telas móveis, teclado e
  tecnologias assistivas.
- **Critérios de aceite:**
  - Busca, seleção, consulta e unidade podem ser acessadas em viewport móvel sem
    controles essenciais fora da área utilizável.
  - Fluxo completo é operável por teclado e há foco visível nos controles.
  - Inputs, opções, estados e botões têm nomes/semântica acessíveis.
  - Não há rolagem horizontal que impeça acessar informação essencial no
    viewport móvel definido pelo projeto.
- **Dependências:** T-22
- **Arquivos:** `src/App.tsx`, `src/components/**/*.tsx`,
  `src/index.css`
- **Rastreabilidade:** RF5; RNF Responsividade e Acessibilidade.

## Entrega 6 — Testes de interface e ponta a ponta

### T-24 — Testar componentes e interações da interface

- **Tipo:** Test
- **Descrição:** Cobrir componentes de entrada, seleção, estados, dados e
  alternância de unidade com Testing Library.
- **Critérios de aceite:**
  - Testes cobrem input inválido, seleção de cidade, loading, vazio, erro e
    sucesso.
  - Testes verificam retry conforme T-02 e alternância de unidade nos valores
    atuais e previstos.
  - Interações essenciais podem ser encontradas por role/label, não por detalhe
    interno de implementação.
- **Dependências:** T-16, T-17, T-18, T-19, T-20, T-21, T-22
- **Arquivos:** `tests/unit/components.test.tsx`
- **Rastreabilidade:** RF1–RF4, RF6; RNF Acessibilidade.

### T-25 — Testar o fluxo ponta a ponta em desktop e mobile

- **Tipo:** Test
- **Descrição:** Criar cenários Playwright determinísticos para o fluxo de
  consulta e estados de falha.
- **Critérios de aceite:**
  - O fluxo busca → seleciona → consulta clima/previsão → alterna unidade passa
    sem depender de APIs externas reais.
  - Um cenário verifica ausência de resultados e outro falha/recuperação.
  - O fluxo essencial passa no viewport desktop e no viewport móvel definido.
- **Dependências:** T-22, T-23
- **Arquivos:** `tests/e2e/weather-app.spec.ts`, `playwright.config.ts`
- **Rastreabilidade:** RF1–RF6; RNF Responsividade.

## Entrega 7 — Verificação final

### T-26 — Executar os gates de qualidade do projeto

- **Tipo:** Test
- **Descrição:** Rodar a suíte unitária, E2E, lint e build após integração.
- **Critérios de aceite:**
  - `pnpm test`, `pnpm test:e2e`, `pnpm lint` e `pnpm build` terminam com
    sucesso.
  - Falhas encontradas são registradas e corrigidas nas tarefas proprietárias
    antes de marcar o backlog concluído.
- **Dependências:** T-05, T-07, T-09, T-11, T-13, T-15, T-24, T-25
- **Arquivos:** `src/`, `tests/`, `playwright.config.ts`, `package.json`
- **Rastreabilidade:** RF1–RF6; RNF Performance, Acessibilidade,
  Responsividade e Resiliência; metas e ambientes definidos em T-01 devem ser
  verificados.

## Rastreabilidade resumida

| Requisito | Tarefas principais |
| --- | --- |
| RF1 — Busca de cidades | T-01, T-03, T-10, T-11, T-14, T-16, T-17, T-22, T-24, T-25 |
| RF2 — Clima atual | T-01, T-03, T-06, T-12, T-13, T-19, T-22, T-25 |
| RF3 — Previsão de cinco dias | T-01, T-03, T-08, T-12, T-13, T-20, T-22, T-25 |
| RF4 — Unidade de temperatura | T-02, T-03, T-04, T-05, T-14, T-21, T-22, T-24 |
| RF5 — Uso em dispositivos móveis | T-20, T-23, T-25 |
| RF6 — Estados e falhas | T-02, T-10–T-15, T-18, T-22, T-24, T-25 |
| RNF — Acessibilidade | T-16–T-18, T-21, T-23–T-25 |
| RNF — Responsividade | T-20, T-23, T-25 |
| RNF — Resiliência | T-10–T-15, T-18, T-25 |