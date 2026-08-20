// ---------------------------------------------------------------------------
// A consulta grossa: "este aparelho entra neste regime?"
//
// É a única pergunta que se responde sem abrir sessão alguma, e por isso ela
// roda ao carregar a página, sem esperar toque de ninguém. Tudo o que vem depois
// dela (recursos concedidos, espaços entregues, fontes de entrada) é
// propriedade da sessão, e não do navegador.
//
// A consulta tem três respostas, e não duas. `isSessionSupported` pode rejeitar
// em vez de devolver falso, e a rejeição não significa "não suporta": significa
// que a pergunta não pôde ser feita. Um navegador sem a API XR e um navegador
// que recusou responder são situações diferentes, e achatá-las em "não" produz
// um relatório que acusa o aparelho de algo que ele nunca disse.
// ---------------------------------------------------------------------------

import { REGIMES, type Regime } from './regimes';

/** O que o navegador respondeu sobre um regime, antes de qualquer sessão. */
export type Suporte = 'sim' | 'nao' | 'desconhecido';

export interface LinhaDoRelatorio {
  readonly regime: Regime;
  readonly suporte: Suporte;
  /** Por que a resposta é essa, escrito para ser lido e não para ser parseado. */
  readonly observacao: string;
}

/**
 * Pergunta ao navegador sobre um regime.
 *
 * O `catch` aqui não engole falha: ele captura a terceira resposta. A
 * especificação permite que a consulta rejeite, e a razão mais comum é a
 * política de permissões do documento, que é informação sobre a página, e não
 * sobre o aparelho.
 */
async function consultarRegime(regime: Regime): Promise<LinhaDoRelatorio> {
  const xr: XRSystem | undefined = navigator.xr;

  if (xr === undefined) {
    return {
      regime,
      suporte: 'desconhecido',
      observacao: window.isSecureContext
        ? 'Este navegador não expõe a API XR. A pergunta não chegou a ser feita.'
        : 'A página não está em contexto seguro, e a API XR não é exposta aqui. A causa é o endereço, não o aparelho.',
    };
  }

  try {
    const suportado: boolean = await xr.isSessionSupported(regime.id);
    return {
      regime,
      suporte: suportado ? 'sim' : 'nao',
      observacao: suportado
        ? 'O navegador declara suportar este regime. O que ele concede lá dentro só a sessão diz.'
        : 'O navegador declara não suportar este regime neste aparelho.',
    };
  } catch (erro: unknown) {
    const detalhe: string = erro instanceof Error ? erro.message : 'sem descrição';
    return {
      regime,
      suporte: 'desconhecido',
      observacao: `A consulta foi recusada antes de responder (${detalhe}). Recusa não é negativa: é ausência de resposta.`,
    };
  }
}

/** Consulta todos os regimes declarados e devolve o relatório na ordem da tabela. */
export async function levantarRelatorio(): Promise<LinhaDoRelatorio[]> {
  return Promise.all(REGIMES.map(consultarRegime));
}

/** Os identificadores dos regimes que o navegador declarou suportar. */
export function regimesSuportados(linhas: readonly LinhaDoRelatorio[]): string[] {
  return linhas.filter((linha) => linha.suporte === 'sim').map((linha) => linha.regime.id);
}
