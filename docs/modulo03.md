# Módulo 03: implementação, evidências e limites

Estado do projeto a partir do commit `8c27796` (especificação do Módulo 01). A versão entregue é a marcada com a etiqueta `modulo-03` no GitHub. Os caminhos abaixo são relativos à raiz.

## Os nove passos, conferidos pelo pronto quando

| Passo | Resultado | Evidência e limite |
| --- | --- | --- |
| 1. Cena e custo | Documentado | `especificacao.md`, seção 1: identidade das peças e alcance corporal. A comparação de tolerâncias de 2, 4 e 8 cm é uma hipótese de experimento, não um resultado já obtido. |
| 2. Tarefa | Documentado | Montar seis peças e verificar alcance sentado. Estado final na seção 6. A validação completa pertence aos próximos módulos. |
| 3. Três regimes | Declarado | Seção 9 e `ts/src/bancada/modes/regimes.ts`, com referência, rastreamento e registro. Cena atual por tela; VR/AR futuros. |
| 4. Especificação | Atualizada | 14 seções preservadas. Registro das decisões do Módulo 03 ao fim da seção 14. |
| 5. Sonda real | Executada em computador e celular | O computador declarou só janela. O celular abriu sessão immersive-ar e concedeu local-floor, unbounded, hit-test, anchors e plane-detection, com 6DoF. Limites encontrados: a classe do celular sai como "visor" e o dom-overlay é pedido sem `root`. Visor físico pendente. |
| 6. Relatório legível | Lido nos dois aparelhos | Mesmo endereço, dois relatórios diferentes, lidos na própria tela de cada aparelho. Registro em `aparelhos.md` e capturas em `evidencias/sonda-*`. |
| 7. Árvore | Verificado no navegador e teste numérico | Seis peças com dimensões do domínio. Garra e tubo móvel são filhos do suporte. Mover o pai transporta os filhos sem somar suas coordenadas. |
| 8. Troca de pai | Verificado no navegador e casos de fronteira | Prato 1 troca tampo/suporte com posição preservada. Pais com rotação e escala uniforme também passaram. Escalas não uniformes/nulas e ciclos são recusados. |
| 9. Relógio e orçamento | Implementado e medido em aparelhos reais | Relógio por tempo, painel dentro da cena, teto declarado. Teste simulado de cadências passou. Medido no computador do grupo (intervalo no teto, tela de 60 Hz) e num celular (média abaixo do teto, com quadros isolados acima). GPU não medida. |

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

Medições em aparelhos reais, com `/cena.html` servido pelo `pnpm dev` do computador do grupo, em HTTPS (`contextoSeguro: true` nos dois). Cada valor é a média dos últimos 120 quadros, exportada por **Salvar medição deste aparelho** com o suporte parado e o Prato 1 no tampo.

| | Computador do grupo | Celular |
| --- | --- | --- |
| Fonte | `evidencias/medicao-pc.json`, 2026-09-26T16:07:27.976Z | `evidencias/medicao-celular.json`, 2026-09-26T15:59:51.453Z |
| Aparelho | Dell Inspiron 15 3530, Intel Core i5-1334U (13ª geração), 16 GB, tela de 60 Hz | POCO X5 Pro 5G, GPU Adreno 642L |
| Sistema e navegador | Windows 11 Home 10.0.26200, Chrome 153.0.8010.53 | Android 14 (UKQ1.240624.001), sistema da fabricante 2.0.17.0.UMSMIXM, Chrome 153. O navegador reduz a própria identificação para "Android 10; K"; a versão real foi lida no aparelho |
| Renderizador | `ANGLE (Intel, Intel(R) Iris(R) Xe Graphics (0x0000A7A1) Direct3D11 vs_5_0 ps_5_0, D3D11)` | `ANGLE (Qualcomm, Adreno (TM) 642L, OpenGL ES 3.2)` |
| Viewport do canvas | 1570 × 808, pixel ratio 1 | 393 × 426, pixel ratio 2 |
| CPU média | **1.10 ms** | **0.56 ms** |
| Intervalo médio | **16.67 ms** | **16.36 ms** |
| Geometria | 2858 triângulos, 60 chamadas | 2858 triângulos, 60 chamadas |

- Teto: **16.67 ms** (1000 / 60).
- No computador, o intervalo médio (16.6675 ms) coincide com o teto porque o navegador desenha no ritmo da tela de 60 Hz. Não é folga medida: é o limite imposto pelo monitor.
- No celular, a média ficou abaixo do teto, mas quadros isolados passam dele: a captura `evidencias/cena-celular.jpg` mostra intervalo de 16,71 ms naquele instante. Não há alegação de 60 FPS sustentados em nenhum dos dois.
- Nos dois aparelhos a CPU gasta menos de 7% do teto. O custo da GPU não é medido, então esse número sozinho não garante fluidez.
- As capturas `evidencias/cena-pc.png` e `evidencias/cena-celular.jpg` mostram o painel em outro instante das mesmas execuções (PC: CPU 1,07 ms, intervalo 16,67 ms; celular: CPU 0,47 ms, intervalo 16,71 ms).
- O slide 7 mostra a média do computador (1,10 ms e 16,67 ms) e a do celular (0,56 ms e 16,36 ms). A imagem do painel no slide é `evidencias/painel-pc.png`, recorte sem alteração de `evidencias/cena-pc.png`: origem (895, 370), largura 300 e altura 211 pixels, ampliado para 580 × 408.
- São medições pontuais de um aparelho de cada classe, não um benchmark.

### Captura automatizada anterior (container)

Fonte integral: `evidencias/browser.json`. Captura em 2026-09-23T23:49:43.972Z. Mantida como referência de um ambiente sem GPU.

- Máquina: Container Linux, Chromium headless, renderização por software.
- Sistema: linux 6.18.44. CPU: AMD EPYC 9V74 80-Core Processor. 9 CPUs lógicas e 10 GB expostos ao container.
- Navegador: Chromium 134.0.6998.35.
- Renderizador declarado: `ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)`.
- Viewport do canvas: 1265 × 863 pixels. Pixel ratio: 1.
- Janela: 120 quadros recentes. CPU média: **0.74 ms**. Intervalo médio: **30.83 ms**.
- A imagem `evidencias/cena-slide.png` mostra outro instante da mesma execução: CPU 0,71 ms e intervalo 34,58 ms. O painel se atualiza a cada 0,5 s.
- `evidencias/painel-captura.png` é apenas o recorte desse painel, sem alteração dos números: origem (765, 220), largura 290 e altura 204 pixels na imagem anterior. O slide 7 usava esses valores até a medição nos aparelhos reais.
- Teto: **16.67 ms** (1000 / 60). O intervalo observado excedeu o teto; não há alegação de 60 FPS sustentados.
- Geometria visível: 2858 triângulos e 60 chamadas de desenho nesta captura.
- O tempo de CPU mede o trecho entre o início do callback e o retorno de renderer.render. Não mede a execução completa da GPU. O intervalo inclui a cadência do navegador e o agendamento do ambiente.
- A captura é uma medição pontual, não um benchmark de desempenho de computadores da turma. A largura móvel de 390 × 844 verifica layout somente, sem simular capacidades XR.

## Sonda nos aparelhos

| | Computador do grupo | Celular (POCO X5 Pro 5G) |
| --- | --- | --- |
| Janela / VR / AR | suportado / não / não | suportado / suportado / suportado |
| Sessão aberta | nenhuma | immersive-ar, encerrada em seguida |
| Recursos concedidos | não se aplica | local-floor, unbounded, hit-test, anchors, plane-detection |
| Pedidos e não concedidos | não se aplica | bounded-floor, dom-overlay, hand-tracking |
| Graus de liberdade | não se aplica | seis (7 poses, nenhuma emulada) |
| Fontes de entrada | não se aplica | nenhuma durante a sondagem (sem toque na tela) |
| Capturas | `evidencias/sonda-pc.png` | `evidencias/sonda-celular-*.jpg` |

- A classe exibida no celular ("visor que acompanha rotação e deslocamento") está errada. `graus.ts` só reconhece aparelho de mão quando há AR sem VR, e o Chrome do Android declara os dois.
- O dom-overlay não concedido vem do pedido: a sonda não informa o `root` exigido. Não é resultado do aparelho.
- A primeira sondagem do computador foi descartada. A extensão Immersive Web Emulator declarou VR, AR e controles de Quest 3 num notebook sem visor. É o caso que o slide 4 descreve: o que conta é o que a sessão concede, não a identificação.

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

- Criar e publicar a etiqueta `modulo-03` depois do último commit.
- Sondar um visor físico. Computador e celular já foram sondados e medidos.
- Corrigir na sonda a classe do celular (hoje sai "visor") e o pedido de dom-overlay sem `root`.
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
