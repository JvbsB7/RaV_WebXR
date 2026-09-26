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
  readonly referencia: string;
  readonly rastreia: string;
  readonly registroContra: string;
}

export const REGIMES: readonly Regime[] = [
  {
    id: 'inline',
    referencia: 'origem da cena (viewer se houver sessão inline)',
    rastreia: 'nenhum movimento corporal; câmera orbital por mouse',
    registroContra: 'origem virtual da sala, sem registro físico',
    nome: 'Janela',
    tratamentoDoMundo: 'ignora o mundo: a cena vive dentro do retângulo da página',
  },
  {
    id: 'immersive-vr',
    referencia: 'local-floor',
    rastreia: 'cabeça e controles/mãos, conforme poses concedidas',
    registroContra: 'chão estimado ou medido, escala 1:1',
    nome: 'Imersivo virtual',
    tratamentoDoMundo: 'substitui o mundo: nada do ambiente físico é composto no quadro',
  },
  {
    id: 'immersive-ar',
    referencia: 'local; viewer para o raio do hit-test',
    rastreia: 'pose do aparelho e superfícies concedidas',
    registroContra: 'superfície real escolhida por hit-test, escala 1:5',
    nome: 'Imersivo aumentado',
    tratamentoDoMundo: 'compõe sobre o mundo: o fundo é a imagem do ambiente físico',
  },
];