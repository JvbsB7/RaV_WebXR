# Teste local no celular

Realizado em 2026-09-26, abrindo `https://IP-DO-COMPUTADOR:5173/cena.html` na mesma rede Wi-Fi do computador do grupo, com o `pnpm dev` rodando.

- Medição exportada: `medicao-celular.json`. CPU média 0,56 ms e intervalo médio 16,36 ms em 120 quadros.
- Captura da cena: `cena-celular.jpg`.
- Aparelho: POCO X5 Pro 5G. Android 14 (UKQ1.240624.001), sistema da fabricante 2.0.17.0.UMSMIXM. Dados lidos nas configurações do aparelho.
- Navegador: Chrome 153. GPU declarada: Adreno 642L (OpenGL ES 3.2). Contexto seguro: sim.
- A identificação do navegador no JSON aparece reduzida ("Android 10; K"), como o Chrome faz por padrão. Por isso o modelo e a versão real vêm do aparelho, não do JSON.

## Sonda (`/`)

Capturas `sonda-celular-1-regimes.jpg` a `sonda-celular-5-diario.jpg`, 13:18 a 13:19 (horário local).

- Regimes: janela, immersive-vr e immersive-ar declarados como suportados.
- A sonda abriu e encerrou uma sessão immersive-ar.
- Recursos concedidos: local-floor, unbounded, hit-test, anchors, plane-detection.
- Pedidos e não concedidos: bounded-floor, dom-overlay, hand-tracking. O dom-overlay exige que o pedido informe um elemento `root`, e a sonda não informa; a recusa vem do pedido, não do aparelho.
- Espaços de referência: local-floor, unbounded, local, viewer.
- Seis graus de liberdade: 7 poses observadas, nenhuma com posição emulada.
- Nenhuma fonte de entrada declarada, o esperado num aparelho de mão sem toque na tela.
- Classe exibida: "Visor que acompanha rotação e deslocamento". O rótulo está errado para um celular: a regra só identifica aparelho de mão quando há AR sem VR.
