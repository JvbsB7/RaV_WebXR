# Aparelhos testados

Preencha somente depois de abrir o endereço no aparelho real. Emulação de largura no navegador não conta como celular testado.

| Aparelho | Regime que abriu | O que não abriu |
| --- | --- | --- |
| Ambiente automatizado: container Linux e Chromium headless com SwiftShader. Identificação exata em `evidencias/browser.json`. | Cena por tela e relatório da sonda, por HTTPS. WebXR inline informado como suportado. | A consulta real informou immersive-vr e immersive-ar não suportados neste ambiente. Sem headset/celular físico conectado. VR/AR da bateria não implementados. |
| Computador do grupo: Dell Inspiron 15 3530, Intel Core i5-1334U, Intel Iris Xe, Windows 11 Home 10.0.26200, Chrome 153.0.8010.53. Em 2026-09-26, `evidencias/medicao-pc.json`. | Cena por tela, por HTTPS em `localhost`: CPU média 1,10 ms e intervalo médio 16,67 ms (tela de 60 Hz). Sonda: janela suportada; classe "só sustenta o regime de janela" (`evidencias/sonda-pc.png`). | Sonda: immersive-vr e immersive-ar não suportados; nenhuma sessão imersiva aberta. VR/AR da bateria não implementados. |
| Celular: POCO X5 Pro 5G, GPU Adreno 642L, Android 14 (UKQ1.240624.001, sistema 2.0.17.0.UMSMIXM), Chrome 153. Em 2026-09-26, `evidencias/medicao-celular.json`. | Cena por tela, por HTTPS na rede local (`https://IP-DO-COMPUTADOR:5173`): CPU média 0,56 ms e intervalo médio 16,36 ms. Sonda: janela, immersive-vr e immersive-ar declarados como suportados; sessão immersive-ar aberta e encerrada. Concedidos: local-floor, unbounded, hit-test, anchors e plane-detection. Espaços: local-floor, unbounded, local e viewer. Seis graus de liberdade em 7 poses, nenhuma emulada (`evidencias/sonda-celular-*.jpg`). | Não concedidos: bounded-floor, hand-tracking e dom-overlay (a sonda não informa o `root` que o dom-overlay exige). Nenhuma fonte de entrada durante a sondagem, o esperado sem toque na tela. Sessão immersive-vr não sondada. VR/AR da bateria não implementados. |
| Visor físico | Pendente de disponibilidade e teste da sonda. | Cena da bateria em VR/AR ainda não implementada. |

O registro deve incluir modelo, sistema, navegador e versão na coluna aparelho. Acrescente data e arquivo JSON exportado na mesma célula. Não troque “pendente” por “não suporta”: ausência de teste não é resultado negativo.

A cena e a sonda foram executadas no computador e no celular em 2026-09-26. Detalhes do celular em `evidencias/teste-celular.md`.

A sonda classificou o celular como "visor que acompanha rotação e deslocamento", mas é um aparelho de mão. A regra só reconhece aparelho de mão quando há AR sem VR, e o Chrome do Android declara os dois. Vale o que a sessão concedeu, registrado acima, e não o rótulo.

A primeira execução no computador foi descartada. A extensão Immersive Web Emulator estava ativa: ela trocou a identificação do navegador para Quest 3 e fez a sonda declarar VR, AR e controles de Quest num notebook sem visor.

## Verificação externa e ensaio

- Pessoa de fora do grupo executando a partir da etiqueta e somente deste README: pendente. Registrar pessoa, máquina, data e resultado depois de realizar.
- Cada integrante explicando um slide que não fez: pendente. Começar o ensaio pelos slides 5 e 6, cobrando a diferença entre posição local e posição de mundo.
