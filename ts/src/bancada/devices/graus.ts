// Os graus de liberdade dependem das poses observadas, não dos espaços concedidos.

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
  | 'visor-indeterminado'
  | 'aparelho-de-mao-com-camera';


/** Poses do observador medidas em local/local-floor, nunca o espaço viewer contra si. */
export function grausDeLiberdade(observadas: number, emuladas: number): GrausDeLiberdade {
  if (observadas === 0) return 'indeterminado';
  // Posição emulada pode significar 3DoF OU perda temporária de rastreamento.
  return emuladas < observadas ? 'seis' : 'indeterminado';
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
  if (graus === 'indeterminado') return 'visor-indeterminado';
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
    case 'visor-indeterminado':
      return 'Visor disponível, com rastreamento de posição ainda indeterminado.';
    case 'visor-com-posicao':
      return 'Visor que acompanha rotação e deslocamento, com o chão do ambiente como referência.';
    case 'aparelho-de-mao-com-camera':
      return 'Aparelho de mão que compõe o virtual sobre a imagem da própria câmera.';
  }
}
