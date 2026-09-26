# Aparelhos testados

Preencha somente depois de abrir o endereço no aparelho real. Emulação de largura no navegador não conta como celular testado.

| Aparelho | Regime que abriu | O que não abriu |
| --- | --- | --- |
| Ambiente automatizado: container Linux e Chromium headless com SwiftShader. Identificação exata em `evidencias/browser.json`. | Cena por tela e relatório da sonda, por HTTPS. WebXR inline informado como suportado. | A consulta real informou immersive-vr e immersive-ar não suportados neste ambiente. Sem headset/celular físico conectado. VR/AR da bateria não implementados. |
| Computador do grupo | Pendente de teste. | Ainda não verificado. |
| Celular físico, teste local confirmado pelo grupo. Modelo, sistema e navegador ainda não informados. | Teste local realizado. Detalhes do resultado da sonda ainda não informados. | Resultados de VR/AR e eventuais falhas ainda não informados. |
| Visor físico | Pendente de disponibilidade e teste da sonda. | Cena da bateria em VR/AR ainda não implementada. |

O registro deve incluir modelo, sistema, navegador e versão na coluna aparelho. Acrescente data e arquivo JSON exportado na mesma célula. Não troque “pendente” por “não suporta”: ausência de teste não é resultado negativo.

O grupo confirmou o teste local no celular. Falta completar os dados desse teste; ele não está mais registrado como não realizado. Fonte: `evidencias/teste-celular.md`.

## Verificação externa e ensaio

- Pessoa de fora do grupo executando a partir da etiqueta e somente deste README: pendente. Registrar pessoa, máquina, data e resultado depois de realizar.
- Cada integrante explicando um slide que não fez: pendente. Começar o ensaio pelos slides 5 e 6, cobrando a diferença entre posição local e posição de mundo.
