// ---------------------------------------------------------------------------
// Graus de liberdade e classe do aparelho, inferidos do que a sessão concedeu.
//
// A API XR não expõe um número de graus de liberdade, e isso não é omissão da
// especificação. O navegador não conversa com o sensor: conversa com o runtime
// do aparelho, e o que esse runtime entrega são espaços de referência. Pedir um
// espaço é pedir uma promessa ("entrego pose medida assim"), e conceder é
// dizer que a promessa se sustenta.
//
// A inferência daqui é conservadora de propósito, e o caso ambíguo devolve
// `indeterminado` em vez de uma aposta. Um relatório que afirma seis graus com
// evidência fraca será citado como se fosse medida; um que diz "não dá para
// saber daqui" será verificado por alguém.
// ---------------------------------------------------------------------------

/** O que se pode afirmar sobre rastreamento de posição a partir do concedido. */
export type GrausDeLiberdade = 'tres' | 'seis' | 'indeterminado';

/**
 * A classe do aparelho, deduzida da capacidade declarada e nunca do nome que o
 * navegador diz ter.
 *
 * A cadeia de identificação do navegador é a informação mais fácil de obter e a
 * mais confortável de ler. Ela também é editável por quem usa, imitada por
 * outros aparelhos e envelhece a cada versão. O que a sessão concede é o que o
 * aparelho faz agora, na mão de quem está com ele.
 */
export type ClasseDeAparelho =
  | 'sem-api'
  | 'somente-janela'
  | 'visor-sem-posicao'
  | 'visor-com-posicao'
  | 'aparelho-de-mao-com-camera';


/**
 * A regra da inferência, escrita por extenso porque é ela que precisa poder ser
 * contestada:
 *
 * - `local-floor`, `bounded-floor` e `unbounded` exigem que o aparelho saiba
 *   onde está o chão em relação a quem observa. Um visor que só gira não tem
 *   como sustentar isso: a concessão é evidência forte de posição rastreada.
 * - `viewer` sozinho é o mínimo que qualquer sessão entrega. A origem acompanha
 *   quem observa, e translação alguma é observável a partir dela. É evidência
 *   forte da ausência.
 * - `local` no meio do caminho é ambíguo de verdade. A especificação o descreve
 *   como origem próxima de quem observa no início da sessão, e um aparelho de
 *   três graus pode concedê-lo mantendo a posição sempre na origem. Daí
 *   `indeterminado`.
 */
export function grausDeLiberdade(concedidos: readonly string[]): GrausDeLiberdade {
  const espacosComChao: readonly string[] = ['local-floor', 'bounded-floor', 'unbounded'];
  const temChao: boolean = espacosComChao.some((espaco) => concedidos.includes(espaco));

  if (temChao) {
    return 'seis';
  }
  if (concedidos.length === 1 && concedidos[0] === 'viewer') {
    return 'tres';
  }
  return 'indeterminado';
}

/**
 * Classifica o aparelho pela combinação de regimes suportados e posição
 * rastreada.
 *
 * `modosSuportados` vem da consulta feita sem sessão alguma, e é por isso que
 * esta função responde mesmo quando nenhuma sessão chegou a abrir.
 */
export function classificarAparelho(
  modosSuportados: readonly string[],
  graus: GrausDeLiberdade,
  temApiXr: boolean,
): ClasseDeAparelho {
  if (!temApiXr) {
    return 'sem-api';
  }

  const suportaVr: boolean = modosSuportados.includes('immersive-vr');
  const suportaAr: boolean = modosSuportados.includes('immersive-ar');

  if (!suportaVr && !suportaAr) {
    return 'somente-janela';
  }
  // Aparelho que compõe sobre o mundo e não sustenta sessão virtual completa é o
  // celular: a câmera vê o ambiente, e ninguém veste a tela no rosto.
  if (suportaAr && !suportaVr) {
    return 'aparelho-de-mao-com-camera';
  }
  return graus === 'tres' ? 'visor-sem-posicao' : 'visor-com-posicao';
}

/** Uma frase legível para cada classe, usada no relatório. */
export function descreverClasse(classe: ClasseDeAparelho): string {
  switch (classe) {
    case 'sem-api':
      return 'Navegador sem a API XR, ou página fora de contexto seguro.';
    case 'somente-janela':
      return 'Aparelho que só sustenta o regime de janela. É o caso do desktop comum.';
    case 'visor-sem-posicao':
      return 'Visor que acompanha a rotação da cabeça e não acompanha o deslocamento.';
    case 'visor-com-posicao':
      return 'Visor que acompanha rotação e deslocamento, com o chão do ambiente como referência.';
    case 'aparelho-de-mao-com-camera':
      return 'Aparelho de mão que compõe o virtual sobre a imagem da própria câmera.';
  }
}
