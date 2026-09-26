// ---------------------------------------------------------------------------
// O catálogo de recursos opcionais, e a classificação do que o aparelho
// respondeu sobre cada um.
//
// Este arquivo existe por causa de uma distinção que o enunciado cobra e que a
// API não entrega pronta: recurso que o aparelho NÃO TEM e recurso que ele TEM e
// NÃO CONCEDEU passam os dois pelo mesmo canal, o `optionalFeatures`, e os dois
// simplesmente não aparecem depois. A lista sozinha não revela a causa. A sonda preserva
// ausência de API e recusa de sessão separadamente no relatório e no diário.
//
// O estado que mais custa a escrever e mais evita erro é o terceiro:
// `indeterminado`. Algumas implementações não expõem `XRSession.enabledFeatures`, e um
// navegador pode abrir sessão sem dizer o que ligou. Sem o terceiro estado, esse
// navegador entra no relatório como aparelho que negou tudo: um aparelho
// competente descrito como incapaz, numa tabela completa e convincente.
// ---------------------------------------------------------------------------

/**
 * O que se sabe sobre um recurso depois de a sessão abrir.
 *
 * - `concedido`: o nome veio em `enabledFeatures`. Pode ser usado.
 * - `nao-concedido`: a sessão reportou a lista e o nome não está nela. Houve resposta,
 *   e a resposta foi não. A razão não é exposta pela API.
 * - `indeterminado`: a sessão não reportou lista alguma. Não houve resposta, e
 *   tratar ausência de resposta como negativa é o que produz relatório
 *   confiante e errado.
 */
export type EstadoDeRecurso = 'concedido' | 'nao-concedido' | 'indeterminado';

export interface RecursoOpcional {
  /** O nome exato que `optionalFeatures` aceita. Não traduzir. */
  readonly nome: string;
  /** O que ele habilita neste ambiente, em uma frase. */
  readonly paraQueServe: string;
}

/**
 * Os recursos que a sonda consulta.
 *
 * A lista é curta por dois motivos, e o segundo não é óbvio. O primeiro é
 * tempo: pedir tudo o que a especificação prevê alonga a sondagem sem retorno.
 * O segundo é risco: um pedido malformado não nega o recurso pedido, derruba a
 * sessão inteira, e a sonda perde tudo o mais que veio buscar.
 *
 * `depth-sensing` está fora por causa exatamente desse risco: ele exige um
 * dicionário de configuração próprio no pedido de sessão, e errar esse
 * dicionário custa a sondagem completa por um recurso de que ainda não
 * precisamos.
 */
export const RECURSOS_CONSULTADOS: readonly RecursoOpcional[] = [
  {
    nome: 'local-floor',
    paraQueServe: 'origem no chão do espaço físico, que é o que põe a cena na altura certa',
  },
  {
    nome: 'bounded-floor',
    paraQueServe: 'origem no chão, mais os limites da área livre que o aparelho conhece',
  },
  {
    nome: 'unbounded',
    paraQueServe: 'espaço sem fronteira declarada, para percursos longos',
  },
  {
    nome: 'hit-test',
    paraQueServe: 'lançar um raio contra as superfícies reais que o aparelho encontrou',
  },
  {
    nome: 'anchors',
    paraQueServe: 'prender um objeto a um ponto do mapa e deixar o aparelho corrigi-lo',
  },
  {
    nome: 'plane-detection',
    paraQueServe: 'receber os planos que o aparelho reconheceu no ambiente',
  },
  {
    nome: 'dom-overlay',
    paraQueServe: 'manter elementos da página visíveis por cima da sessão aumentada',
  },
  {
    nome: 'hand-tracking',
    paraQueServe: 'pose das mãos sem controle, consultado para registro e não usado ainda',
  },
];

/**
 * Classifica um recurso contra a lista que a sessão reportou.
 *
 * `concedidos` vem de `XRSession.enabledFeatures`. `undefined` ali significa
 * "esta sessão não diz", e é o que produz `indeterminado`, nunca `nao-concedido`.
 */
export function estadoDoRecurso(
  nome: string,
  concedidos: readonly string[] | undefined,
): EstadoDeRecurso {
  if (concedidos === undefined) {
    return 'indeterminado';
  }
  return concedidos.includes(nome) ? 'concedido' : 'nao-concedido';
}

/** Os nomes que a sonda envia em `optionalFeatures`. */
export function nomesConsultados(): string[] {
  return RECURSOS_CONSULTADOS.map((recurso) => recurso.nome);
}
