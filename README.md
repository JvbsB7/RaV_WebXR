# Bateria acústica — Grupo 1 — Módulo 03

Ambiente para montar seis peças de uma bateria e verificar o alcance de quem está sentado. Neste marco estão implementados a cena por tela, a árvore de objetos, a troca de pai com conferência numérica e o laço por tempo com custo visível dentro da cena.

Repositório: https://github.com/JvbsB7/RaV_WebXR

Integrantes: Ian Jabriel, João Vitor, Gabriel Lenzi, Vinicius Gatti, Gabriel Verri e David Martins.

## Como executar

Requisitos: Node.js 24 e pnpm 11.19.0. Se necessário, instale o gerenciador com `npm install -g pnpm@11.19.0`.

Para obter o marco, depois que a etiqueta estiver publicada no GitHub:

```sh
git clone --branch modulo-03 https://github.com/JvbsB7/RaV_WebXR.git
cd RaV_WebXR/ts
pnpm install --frozen-lockfile
pnpm dev
```

Se recebeu um ZIP, extraia-o, entre na pasta `ts` e execute os dois últimos comandos. Abra o endereço HTTPS informado pelo Vite. O servidor de desenvolvimento usa certificado local autoassinado. No computador, o endereço normalmente é `https://localhost:5173`.

- `/` abre a sonda real de capacidades.
- `/cena.html` abre a demonstração da bateria sem precisar de headset.
- Em outro aparelho na mesma rede, use `https://IP-DO-COMPUTADOR:5173`. Libere a porta no firewall e aceite apenas o certificado do seu próprio servidor de desenvolvimento. Um certificado não aceito ou contexto inseguro impede a sonda de consultar WebXR.

Não abra os HTML diretamente por duplo clique. O Vite é necessário para servir os módulos TypeScript.

## Demonstração em quatro momentos

1. Abra `/cena.html`: quatro tambores e dois pratos estão sobre a mesa; estrutura, banco e painel estão na sala. Os bastões permanecem ocultos no estado inicial previsto.
2. Clique em **Demonstrar ajuste de altura**. A garra e o anel de encaixe acompanham o suporte do Prato 1 por parentesco. Pause para observar.
3. Clique em **Trocar pai do Prato 1**. Leia as posições antes e depois e o erro em metros. O prato permanece onde estava no mundo. Retome o ajuste para vê-lo acompanhar o novo pai. Clique novamente para soltá-lo no tampo preservando sua posição atual.
4. Mostre o painel preso à estrutura: custo de CPU, intervalo entre quadros e teto de 16,67 ms. **Salvar medição deste aparelho** exporta os valores e o navegador em JSON. Registre manualmente modelo do aparelho, sistema e navegador em `docs/aparelhos.md`.

O parentesco distante após a troca é proposital: encaixar no destino alteraria a posição no mundo e impediria observar a preservação. A lógica de encaixe pertence ao módulo posterior.

## Conferência técnica

Dentro de `ts`:

```sh
pnpm test
pnpm build
pnpm preview
```

O teste numérico confere dimensões, herança de transformação, posição e matriz de mundo após reparentar com pais rotacionados e escalas uniformes, rejeição de ciclos/escalas inválidas, relógio a 30/60/144 quadros por segundo e ausência de evidência de rastreamento.

## Arquivos para a entrega

- `grupo01_modulo03.pptx`: sete slides, na ordem do enunciado.
- [Especificação em 14 seções](docs/especificacao.md).
- [Estado do marco, evidências e decisões](docs/modulo03.md).
- [Aparelhos e regimes testados](docs/aparelhos.md).
- `docs/evidencias/`: resultados reais dos testes e capturas usadas nos slides.

## Onde já foi visto funcionando

Em 2026-09-26, pelo `pnpm dev` do computador do grupo:

- **Notebook Dell Inspiron 15 3530** (Intel Core i5-1334U, Iris Xe, Windows 11, Chrome 153): a cena por tela abriu, com CPU média de 1,10 ms e intervalo de 16,67 ms. A sonda declarou só o regime de janela.
- **Celular POCO X5 Pro 5G** (Android 14, Chrome 153), pela rede local: a cena por tela abriu, com CPU média de 0,56 ms e intervalo de 16,36 ms. A sonda abriu uma sessão immersive-ar e registrou seis graus de liberdade.

O que abriu e o que não abriu em cada aparelho está em [docs/aparelhos.md](docs/aparelhos.md). Os números vêm de `docs/evidencias/medicao-pc.json` e `medicao-celular.json`.

## Limitações declaradas

A montagem completa, a validação de alcance, os modelos externos e a bateria nos regimes VR/AR ainda são etapas futuras. A sonda pode abrir uma sessão curta para consultar capacidades, o que não significa que a cena da bateria esteja disponível nesses regimes.

- A sonda classifica o celular como "visor", porque só reconhece aparelho de mão quando há AR sem VR. Ela também pede dom-overlay sem o `root` que esse recurso exige. As duas correções foram adiadas; o que conta no registro é o que a sessão concedeu.
- Nenhum visor físico foi sondado ainda.
- O tempo da GPU não é medido.
- A execução por alguém de fora do grupo e o ensaio cruzado continuam pendentes.

Consulte o slide 7 e `docs/aparelhos.md`.

## Uso de inteligência artificial

O grupo usou assistentes de IA (Claude e Codex) neste trabalho para:

- entender como o trabalho deveria ser realizado, porque o grupo não conhecia a base do conteúdo;
- ajudar na arquitetura do código;
- ajudar a montar os slides;
- documentar o projeto.

O detalhamento do que veio do grupo e do que veio do assistente na especificação está em `docs/especificacao.md`, seção 14, "Sobre o uso de ferramentas de IA". As medições e as capturas dos aparelhos foram feitas pelo grupo nos próprios aparelhos.

Os arquivos antigos `ts/src/scene.ts`, `controllers.ts` e `ar.ts` permanecem como histórico da base inicial, sem importação pela demonstração do Módulo 03.
