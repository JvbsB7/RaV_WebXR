// ---------------------------------------------------------------------------
// Os regimes que este ambiente pergunta ao aparelho se ele sustenta.
//
// A lista é declarada aqui, e não montada a partir do que o aparelho responde,
// porque a pergunta precisa existir antes da resposta: um regime que o aparelho
// não suporta tem de aparecer no relatório como linha negada, e não sumir dele.
// Tabela que só mostra o que deu certo não informa nada sobre o que faltou.
// ---------------------------------------------------------------------------

/** Os modos de sessão que a especificação define. */
export type RegimeId = 'inline' | 'immersive-vr' | 'immersive-ar';

export interface Regime {
  readonly id: RegimeId;
  /** Nome legível, para quem lê o relatório sem conhecer a especificação. */
  readonly nome: string;
  /** O que este regime faz com o mundo de quem observa, em uma frase. */
  readonly tratamentoDoMundo: string;
}

export const REGIMES: readonly Regime[] = [
  {
    id: 'inline',
    nome: 'Janela',
    tratamentoDoMundo: 'ignora o mundo: a cena vive dentro do retângulo da página',
  },
  {
    id: 'immersive-vr',
    nome: 'Imersivo virtual',
    tratamentoDoMundo: 'substitui o mundo: nada do ambiente físico é composto no quadro',
  },
  {
    id: 'immersive-ar',
    nome: 'Imersivo aumentado',
    tratamentoDoMundo: 'compõe sobre o mundo: o fundo é a imagem do ambiente físico',
  },
];
