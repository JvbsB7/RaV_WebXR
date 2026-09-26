# Módulo 03: implementação, evidências e limites

Estado do projeto baseado no commit anterior `8c27796`. A etiqueta local da entrega é `modulo-03`. A publicação no GitHub depende de autenticação, indisponível nesta sessão. Os caminhos abaixo são relativos à raiz.

## Os nove passos, conferidos pelo pronto quando

| Passo | Resultado | Evidência e limite |
| --- | --- | --- |
| 1. Cena e custo | Documentado | `especificacao.md`, seção 1: identidade das peças e alcance corporal. A comparação de tolerâncias de 2, 4 e 8 cm é uma hipótese de experimento, não um resultado já obtido. |
| 2. Tarefa | Documentado | Montar seis peças e verificar alcance sentado. Estado final na seção 6. A validação completa pertence aos próximos módulos. |
| 3. Três regimes | Declarado | Seção 9 e `ts/src/bancada/modes/regimes.ts`, com referência, rastreamento e registro. Cena atual por tela; VR/AR futuros. |
| 4. Especificação | Atualizada | 14 seções preservadas. Registro das decisões do Módulo 03 ao fim da seção 14. |
| 5. Sonda real | Código implementado, teste parcial | Consulta WebXR real e relatório sem inventar capacidades. O container respondeu sem suporte imersivo; recursos dentro de sessão precisam de um aparelho físico. |
| 6. Relatório legível | Código implementado, registro parcial | Página HTML testada no Chromium. O grupo confirmou teste local no celular. Falta registrar modelo, navegador e resultados da sonda para a comparação entre aparelhos. |
| 7. Árvore | Verificado no navegador e teste numérico | Seis peças com dimensões do domínio. Garra e tubo móvel são filhos do suporte. Mover o pai transporta os filhos sem somar suas coordenadas. |
| 8. Troca de pai | Verificado no navegador e casos de fronteira | Prato 1 troca tampo/suporte com posição preservada. Pais com rotação e escala uniforme também passaram. Escalas não uniformes/nulas e ciclos são recusados. |
| 9. Relógio e orçamento | Implementado, validação física pendente | Relógio por tempo, painel dentro da cena, teto declarado. Teste simulado de cadências passou; intervalo no container ficou acima do teto. Falta comparação de computadores reais. |

## Decisões e alternativas apresentadas

| Slide | Como | Decisão e alternativa descartada |
| --- | --- | --- |
| 2 | Cena, inventário e dimensões do domínio | Diâmetros separados em 6 cm nos tambores. Kit com diâmetros quase iguais aumentaria a dificuldade de identificar a peça. Folgas continuam provisórias. |
| 3 | Regimes com referência, rastreamento e registro | Usar o mesmo registro nos três confundiria a origem virtual com chão e mesa reais. |
| 4 | Consultar isSessionSupported e requestSession | Deduzir capacidades pelo nome do navegador não comprova o que a sessão concedeu. |
| 5 | Hierarquia suporte/garra/encaixe | Coordenadas absolutas por objeto exigiriam sincronizar cada descendente em toda regulagem. |
| 6 | attach e medição antes/depois | Copiar posição a cada quadro adicionaria dependência da ordem de atualização. |
| 7 | Delta de tempo e janela de medição | Contar quadros tornaria a velocidade dependente da máquina. |

## Medição do navegador

Fonte integral: `evidencias/browser.json`. Captura em 2026-09-23T23:49:43.972Z.

- Máquina: Container Linux, Chromium headless, renderização por software.
- Sistema: linux 6.18.44. CPU: AMD EPYC 9V74 80-Core Processor. 9 CPUs lógicas e 10 GB expostos ao container.
- Navegador: Chromium 134.0.6998.35.
- Renderizador declarado: `ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)`.
- Viewport do canvas: 1265 × 863 pixels. Pixel ratio: 1.
- Janela: 120 quadros recentes. CPU média: **0.74 ms**. Intervalo médio: **30.83 ms**.
- A imagem `evidencias/cena-slide.png` mostra outro instante da mesma execução: CPU 0,71 ms e intervalo 34,58 ms. O painel se atualiza a cada 0,5 s; os valores grandes do slide 7 correspondem à amostra do JSON acima.
- `evidencias/painel-captura.png` é apenas o recorte desse painel, sem alteração dos números: origem (765, 220), largura 290 e altura 204 pixels na imagem anterior.
- Teto: **16.67 ms** (1000 / 60). O intervalo observado excedeu o teto; não há alegação de 60 FPS sustentados.
- Geometria visível: 2858 triângulos e 60 chamadas de desenho nesta captura.
- O tempo de CPU mede o trecho entre o início do callback e o retorno de renderer.render. Não mede a execução completa da GPU. O intervalo inclui a cadência do navegador e o agendamento do ambiente.
- A captura é uma medição pontual, não um benchmark de desempenho de computadores da turma. A largura móvel de 390 × 844 verifica layout somente, sem simular capacidades XR.

## Troca de pai

No navegador, com o suporte pausado após regular a altura:

| Coordenada (m) | Antes | Depois |
| --- | --- | --- |
| X | -1.750000 | -1.750000 |
| Y | 0.761000 | 0.761000 |
| Z | 0.300000 | 0.300000 |

Erro medido: **2.289e-16 m**. O valor abaixo de 1e-12 m representa apenas arredondamento de ponto flutuante neste teste.

A composição é `M_mundo = M_pai × M_local`. Ao trocar de pai, `M_local_nova = inversa(M_novo_pai) × M_mundo_anterior`. `Object3D.attach` aplica essa transformação. As dimensões são parâmetros da geometria; os nós usam escala uniforme. A operação preserva o mundo no instante da troca. Movimentos posteriores do novo pai naturalmente movem o filho.

## Teste do relógio

`pnpm test` simula dois segundos com cadências de 30, 60 e 144 quadros/s. A altura resultou em 1.209115691219082, 1.2091156912190817 e 1.2091156912190815 m. Isso verifica o cálculo, mas não substitui executar em duas máquinas. O retorno de uma pausa de 5 s entrega delta de 0,1 s à animação e preserva 5000 ms como intervalo medido.

## Pendências que também aparecem no slide 7

- Publicar os arquivos e a etiqueta no GitHub autenticado.
- Completar o registro do teste local já realizado no celular: modelo, navegador e resultados da sonda. A comparação documentada entre classes de aparelho depende desses dados.
- Medir custo e cadência no computador do grupo. A cadência do container excedeu 16,67 ms.
- Confirmar execução por alguém de fora do grupo, em outra máquina, a partir da etiqueta.
- Cada integrante explicar um slide que não produziu, sem ler roteiro.
- A montagem completa, o alcance sentado e a bateria em VR/AR são próximos módulos. Não são demonstrados como prontos.

## Preparação para as perguntas

- Slide 2: por que diâmetro sozinho não resolve a distinção entre prato e tambor? Responder com profundidade e comparação entre peças.
- Slide 3: por que viewer serve ao raio, mas não fixa a bateria numa mesa? O raio acompanha o observador; o objeto precisa permanecer no espaço local.
- Slide 4: recurso não concedido não prova permissão negada. A API expõe a lista concedida; a causa da ausência nem sempre aparece.
- Slide 5: a posição local pertence ao pai; a posição de mundo resulta da composição de toda a cadeia.
- Slide 6: transformar um nó em filho de seu descendente cria ciclo. Escala não uniforme combinada com rotação pode produzir cisalhamento; este marco recusa esse caso.
- Slide 7: CPU abaixo do teto com intervalo alto pode indicar GPU ou agendamento. Não se promete fluidez olhando só a CPU.

## Fontes técnicas

- Requisitos do Módulo 03 fornecidos pelo professor na atividade.
- Especificação do grupo em `docs/especificacao.md`.
- WebXR Device API: https://www.w3.org/TR/webxr/ (espaços, poses e recursos concedidos).
- Three.js Object3D: documentação e implementação de `attach` na dependência fixada pelo lockfile.
