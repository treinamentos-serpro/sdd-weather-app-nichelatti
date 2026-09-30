## 1. Overview

Aplicação de previsão do tempo que permite pesquisar cidades, consultar as
condições atuais e a previsão para cinco dias, e alternar a unidade de
temperatura entre Celsius e Fahrenheit. A aplicação deve poder ser usada em
dispositivos móveis. Público-alvo: pessoas que precisam consultar o clima de
uma cidade para atividades cotidianas ou planejamento próximo.

O briefing não define provedor de dados, plataforma além do uso em dispositivos
móveis, campos meteorológicos, idioma ou regras detalhadas de interação. Esses
pontos permanecem em aberto nesta análise.

## 2. Functional Requirements

- **RF1 — Buscar cidades:** permitir que a pessoa usuária informe uma cidade e
	inicie uma busca para encontrá-la.
- **RF2 — Consultar clima atual:** permitir visualizar as informações de clima
	atual para a cidade escolhida.
- **RF3 — Consultar previsão:** permitir visualizar a previsão do tempo para
	cinco dias da cidade escolhida.
- **RF4 — Alternar unidade:** permitir alternar entre Celsius e Fahrenheit e
	apresentar as temperaturas na unidade selecionada.
- **RF5 — Usar em dispositivo móvel:** disponibilizar as funções de busca,
	consulta e alternância de unidade em uma interface utilizável em dispositivos
	móveis.
- **RF6 — Comunicar estados da consulta:** informar quando a busca ou consulta
	está em andamento, não encontra resultados ou não pode ser concluída. A ação
	de recuperação para falhas de consulta permanece a definir.

## 3. User Stories

- **US1:** Como pessoa que consulta o clima, quero buscar uma cidade para
	encontrar o local sobre o qual desejo obter informações.
- **US2:** Como pessoa que consulta o clima, quero ver as condições atuais de uma
	cidade para entender como está o tempo nesse local.
- **US3:** Como pessoa que planeja os próximos dias, quero ver a previsão de
	cinco dias para uma cidade para me preparar para o período.
- **US4:** Como pessoa habituada a uma unidade de temperatura, quero alternar
	entre Celsius e Fahrenheit para interpretar as temperaturas na unidade que
	prefiro.
- **US5:** Como pessoa usando um dispositivo móvel, quero acessar as funções da
	aplicação em uma tela móvel para consultar o clima nesse dispositivo.
- **US6:** Como pessoa que aguarda ou não consegue concluir uma consulta, quero
	receber uma indicação clara do estado para entender o resultado da minha
	busca.

## 4. Acceptance Criteria

**US1 / RF1 — Busca de cidades**

- Dado que a pessoa informa o nome de uma cidade e inicia a busca, quando há
	correspondências, então a aplicação apresenta opções de cidade para seleção.
- Dado que a pessoa inicia uma busca sem correspondências, então a aplicação
	informa que nenhuma cidade foi encontrada.
- Dado que o campo de busca está vazio ou contém apenas espaços, quando a pessoa
	tenta buscar, então a aplicação não inicia uma busca de cidade.

**US2 / RF2 — Clima atual**

- Dada uma cidade selecionada, quando os dados atuais estão disponíveis, então
	a aplicação apresenta informações identificadas como clima atual dessa
	cidade.
- Dada uma cidade selecionada, quando os dados atuais ainda estão sendo
	obtidos, então a aplicação indica que a consulta está em andamento.

**US3 / RF3 — Previsão de cinco dias**

- Dada uma cidade selecionada, quando a previsão está disponível, então a
	aplicação apresenta a previsão para cinco dias associada àquela cidade.
- Dada uma cidade selecionada, quando a previsão ainda está sendo obtida, então
	a aplicação indica que a consulta está em andamento.

**US4 / RF4 — Unidade de temperatura**

- Dado que temperaturas estão visíveis, quando a pessoa seleciona Celsius,
	então as temperaturas apresentadas são expressas em Celsius.
- Dado que temperaturas estão visíveis, quando a pessoa seleciona Fahrenheit,
	então as temperaturas apresentadas são expressas em Fahrenheit.
- A unidade selecionada deve ser identificável junto às temperaturas.

**US5 / RF5 — Uso em dispositivos móveis**

- Dado um dispositivo móvel, quando a pessoa abre a aplicação, então consegue
	acessar a busca, selecionar uma cidade, consultar clima e previsão e alterar
	a unidade sem que esses controles ou informações essenciais fiquem fora da
	área utilizável da tela.

**US6 / RF6 — Estados da consulta**

- Enquanto uma busca ou consulta de dados está em andamento, então a aplicação
	apresenta uma indicação desse estado.
- Quando uma busca não retorna cidades, então a aplicação apresenta um estado
	sem resultados que não seja confundido com uma consulta em andamento.
- Quando uma busca ou consulta falha, então a aplicação informa que não foi
	possível concluí-la e mantém a interface utilizável.
- Quando uma busca ou consulta excede 10 segundos, então a aplicação informa
	claramente que o tempo limite foi atingido.
- Quando uma falha de rede é corrigida, então a pessoa pode repetir a mesma
	busca ou consulta por uma ação de tentar novamente.

## 5. Non-Functional Requirements

- **Performance:** o briefing não estabelece metas de tempo. A busca e a
	apresentação de dados devem fornecer retorno de estado enquanto aguardam; os
	limites mensuráveis de resposta precisam ser definidos.
- **Acessibilidade:** controles e informações devem ser operáveis e
	compreensíveis por pessoas que usam tecnologias assistivas e navegação por
	teclado. Padrão de conformidade e critérios detalhados precisam ser definidos.
- **Responsividade:** as funções descritas devem permanecer utilizáveis em
	dispositivos móveis. Faixas de largura, orientação e suporte mínimo precisam
	ser definidos.
- **Resiliência:** falhas de busca ou de obtenção de dados não devem deixar a
	interface sem resposta; a aplicação deve comunicar a falha.

## 6. Edge Cases

| Caso | Comportamento esperado |
| --- | --- |
| Campo de busca vazio ou com espaços | Não iniciar a busca. |
| Cidade sem correspondências | Informar que nenhuma cidade foi encontrada. |
| Nome que corresponde a mais de uma cidade | A forma de distinguir e selecionar as cidades ainda precisa ser definida. |
| Falha na busca de cidades | Informar que a busca não pôde ser concluída, orientar a verificar a conexão quando aplicável, oferecer retry da mesma busca e manter a interface utilizável. |
| Falha ao obter clima atual ou previsão | Informar que a consulta não pôde ser concluída, orientar a verificar a conexão quando aplicável, oferecer retry da mesma cidade e manter a interface utilizável. |
| Resposta de busca ou consulta demorada | Indicar andamento e encerrar a operação após 10 segundos com mensagem explícita de timeout e opção de retry. |
| Previsão indisponível ou incompleta | Comunicar que não há dados suficientes para apresentar a previsão de cinco dias; tratamento por dia precisa ser definido. |
| Temperatura não disponível | O valor ou a apresentação substituta precisam ser definidos; não apresentar um valor como se fosse válido. |
| Tela móvel estreita ou em orientação diferente | Manter acesso às funções essenciais; larguras e orientações suportadas precisam ser definidas. |

## 7. Assumptions

- A consulta de clima é feita para uma cidade escolhida pela pessoa usuária.
- A previsão solicitada cobre cinco dias, mas ainda não está definido se a
	contagem inclui o dia atual.
- A alternância Celsius/Fahrenheit afeta as temperaturas exibidas; outras
	unidades meteorológicas não foram especificadas.
- A aplicação depende de uma fonte de dados meteorológicos, cuja escolha e
	disponibilidade não foram informadas.

## 8. Risks

| Risco | Mitigação proposta |
| --- | --- |
| Serviço de dados indisponível ou lento impede a consulta | Apresentar estado de carregamento e erro sem bloquear a interface; definir limites de espera e recuperação. |
| Cidades com nomes iguais levam à seleção do local incorreto | Exibir contexto suficiente para distinguir resultados, a definir junto às regras de busca. |
| Divergência ou erro de unidade causa interpretação incorreta | Identificar a unidade junto a cada temperatura e validar a alternância em clima atual e previsão. |
| A interface não funciona bem em alguns dispositivos móveis | Definir dispositivos e larguras suportados e verificar os fluxos essenciais nesses tamanhos. |
| Definições incompletas de dados e período geram resultados inconsistentes | Resolver as perguntas em aberto sobre campos meteorológicos, período e dados ausentes antes de fechar a especificação. |

## 9. Out of Scope

O briefing não solicita as seguintes capacidades; não fazem parte desta
especificação inicial:

- Cadastro, autenticação ou perfis de usuário.
- Favoritos ou histórico de cidades.
- Geolocalização automática.
- Alertas ou notificações meteorológicas.
- Funcionalidades além da consulta de clima atual e previsão de cinco dias.

## 10. Open Questions

- Quais campos, além da temperatura, devem compor o clima atual e a previsão?
- A previsão de cinco dias inclui hoje ou representa os cinco dias seguintes?
- Qual nível de detalhe da previsão é esperado: resumo diário, períodos do dia
	ou dados horários?
- Quais detalhes devem identificar cidades homônimas (por exemplo, país ou
	estado), e como a pessoa seleciona o resultado?
- Qual deve ser a unidade inicial? A escolha deve persistir entre consultas ou
	sessões?
- A alternância Celsius/Fahrenheit deve atualizar todos os valores de
	temperatura da tela imediatamente?
- Qual fonte de dados deve ser utilizada e quais são os requisitos de
	disponibilidade, limites de uso e atribuição de dados?
- Qual idioma deve ser usado na interface e nos dados apresentados?
- Quais são as metas mensuráveis de desempenho além do timeout definido de 10
	segundos?
- Como tratar dias ou campos ausentes quando a fonte retorna dados parciais?
- Quais tamanhos de tela, navegadores e orientações móveis devem ser
	suportados?
- Qual padrão de acessibilidade deve ser atendido?
- É necessário manter a última cidade consultada ou algum dado disponível
	quando a conexão falha?