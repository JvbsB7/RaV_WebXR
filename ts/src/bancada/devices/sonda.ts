// ---------------------------------------------------------------------------
// A sonda de capacidades: a Tarefa 1 deste módulo.
//
// Ela pergunta ao aparelho o que ele oferece (que tipos de sessão suporta, que
// recursos opcionais concede, que fontes de entrada declara, quantos graus de
// liberdade rastreia) e guarda a resposta numa estrutura que o resto do
// ambiente possa consultar. Não desenha, não carrega malha e não monta cena: o
// que ela produz é conhecimento sobre o aparelho, e é isso que os módulos
// seguintes consomem para decidir o que sequer tentar.
//
// Duas restrições da plataforma moldam o arquivo inteiro, e nenhuma é
// contornável:
//
// 1. Metade das respostas só existe DENTRO de uma sessão. Recursos concedidos,
//    espaços de referência entregues e fontes de entrada são propriedades da
//    sessão, e não do navegador. Sondar de fora devolveria uma lista de
//    suposições bem formatadas.
// 2. Abrir sessão imersiva exige gesto de quem usa. O navegador recusa o pedido
//    que não venha de um toque, e a recusa chega como erro de segurança, que se
//    parece com defeito de código. Daí a sonda ser função chamada por botão, e
//    não coisa que roda ao carregar a página.
// ---------------------------------------------------------------------------

import {
  levantarRelatorio,
  regimesSuportados,
  type LinhaDoRelatorio,
} from '../modes/verificacao';
import {
  RECURSOS_CONSULTADOS,
  estadoDoRecurso,
  nomesConsultados,
  type EstadoDeRecurso,
} from './recursos';
import {
  classificarAparelho,
  grausDeLiberdade,
  type ClasseDeAparelho,
  type GrausDeLiberdade,
} from './graus';

/** Os modos em que uma sessão de sondagem pode ser aberta. */
export type ModoSondavel = 'immersive-vr' | 'immersive-ar';

/**
 * Os espaços que a sonda tenta obter, do mais exigente ao mínimo.
 *
 * A ordem importa para a leitura, e não para o resultado: todos são tentados de
 * qualquer jeito, mas ler a lista de cima para baixo mostra onde o aparelho
 * parou de conceder.
 */
const ESPACOS_TENTADOS: readonly XRReferenceSpaceType[] = [
  'bounded-floor',
  'local-floor',
  'unbounded',
  'local',
  'viewer',
];

/**
 * Quantos quadros a sonda deixa passar antes de ler as fontes de entrada.
 *
 * Não é espera decorativa. As fontes de entrada não estão prontas no instante em
 * que a sessão abre: o aparelho as anuncia nos primeiros quadros, e ler
 * `inputSources` cedo demais devolve lista vazia num visor que tem dois
 * controles na mão de quem está usando.
 */
const QUADROS_ATE_LER_ENTRADAS: number = 30;

export interface RecursoSondado {
  readonly nome: string;
  readonly paraQueServe: string;
  readonly estado: EstadoDeRecurso;
}

export interface FonteDeEntradaSondada {
  /** Lado declarado: left, right ou none. */
  readonly lado: string;
  /** Como a mira é produzida: raio de controle, olhar ou toque na tela. */
  readonly mira: string;
  /** Há pose de punho: objeto rastreado no espaço, e não apenas uma direção. */
  readonly temPoseDePunho: boolean;
  /** Há pose de mão articulada. */
  readonly temMao: boolean;
  /** Perfis declarados pelo aparelho, do mais específico ao mais genérico. */
  readonly perfis: readonly string[];
}

/** O que a sonda descobre sem abrir sessão alguma. */
export interface SondaSemSessao {
  readonly temApiXr: boolean;
  readonly contextoSeguro: boolean;
  readonly regimes: readonly LinhaDoRelatorio[];
  readonly modosSuportados: readonly string[];
}

/** O que só a sessão responde. */
export interface SondaEmSessao {
  readonly modo: ModoSondavel;
  readonly recursos: readonly RecursoSondado[];
  readonly espacosConcedidos: readonly string[];
  readonly fontesDeEntrada: readonly FonteDeEntradaSondada[];
  readonly graus: GrausDeLiberdade;
}

export interface ResultadoDaSonda {
  readonly semSessao: SondaSemSessao;
  readonly emSessao: SondaEmSessao | undefined;
  /** Por que não houve sessão, quando não houve. */
  readonly motivoSemSessao: string | undefined;
  readonly classe: ClasseDeAparelho;
}

/**
 * A API XR não é exposta fora de contexto seguro, e o sintoma é idêntico ao de um
 * aparelho sem suporte. A causa, nesse caso, é a URL, e é o diagnóstico errado
 * mais frequente do laboratório, porque o relatório sai coerente, completo e
 * falso.
 */
function contextoSeguro(): boolean {
  return window.isSecureContext;
}

export async function sondarSemSessao(): Promise<SondaSemSessao> {
  const regimes: LinhaDoRelatorio[] = await levantarRelatorio();

  return {
    temApiXr: navigator.xr !== undefined,
    contextoSeguro: contextoSeguro(),
    regimes,
    modosSuportados: regimesSuportados(regimes),
  };
}

/**
 * Tenta obter cada espaço de referência e devolve os que vieram.
 *
 * O pedido rejeita quando o espaço não é concedido, e é a rejeição que informa: o
 * catch aqui não esconde erro algum, ele É a leitura.
 */
async function lerEspacos(sessao: XRSession): Promise<string[]> {
  const concedidos: string[] = [];

  for (const tipo of ESPACOS_TENTADOS) {
    try {
      await sessao.requestReferenceSpace(tipo);
      concedidos.push(tipo);
    } catch {
      // Espaço não concedido. É resposta do aparelho, e não falha do código.
    }
  }

  return concedidos;
}

function lerFontesDeEntrada(sessao: XRSession): FonteDeEntradaSondada[] {
  const fontes: FonteDeEntradaSondada[] = [];

  for (const fonte of sessao.inputSources) {
    fontes.push({
      lado: fonte.handedness,
      mira: fonte.targetRayMode,
      temPoseDePunho: fonte.gripSpace !== undefined,
      temMao: fonte.hand !== undefined && fonte.hand !== null,
      perfis: [...fonte.profiles],
    });
  }

  return fontes;
}

/**
 * A superfície de composição mínima.
 *
 * A especificação só entrega quadros a uma sessão que tenha superfície de
 * composição declarada. Não desenhamos nada nela: ela é a condição para o laço de
 * quadros existir, e dizê-lo aqui em voz alta evita que este trecho seja lido,
 * dois módulos adiante, como o começo de um segundo renderizador.
 */
function declararCamadaMinima(sessao: XRSession): void {
  const tela: HTMLCanvasElement = document.createElement('canvas');
  const gl: WebGL2RenderingContext | null = tela.getContext('webgl2', {
    xrCompatible: true,
  });

  if (gl === null) {
    throw new Error('Este navegador não entregou contexto WebGL 2 compatível com XR.');
  }

  sessao.updateRenderState({ baseLayer: new XRWebGLLayer(sessao, gl) });
}

/** Deixa passar alguns quadros, para dar tempo de as fontes de entrada aparecerem. */
function aguardarQuadros(sessao: XRSession, quantos: number): Promise<void> {
  return new Promise<void>((resolver) => {
    let restantes: number = quantos;

    const passo: XRFrameRequestCallback = (): void => {
      restantes -= 1;
      if (restantes > 0) {
        sessao.requestAnimationFrame(passo);
        return;
      }
      resolver();
    };

    sessao.requestAnimationFrame(passo);
  });
}

export async function sondarEmSessao(modo: ModoSondavel): Promise<SondaEmSessao> {
  const xr: XRSystem | undefined = navigator.xr;
  if (xr === undefined) {
    throw new Error('Não há API XR neste navegador.');
  }

  // Todo recurso vai como opcional, sem exceção. Marcar um único deles como
  // obrigatório faria o aparelho recusar a sessão inteira por causa daquele item,
  // e a sonda perderia exatamente a informação que veio buscar. O que queremos
  // saber é o que ele concede, e para isso ele precisa primeiro deixar entrar.
  const sessao: XRSession = await xr.requestSession(modo, {
    optionalFeatures: nomesConsultados(),
  });

  try {
    declararCamadaMinima(sessao);

    const concedidos: readonly string[] | undefined = sessao.enabledFeatures;
    const espacos: string[] = await lerEspacos(sessao);

    await aguardarQuadros(sessao, QUADROS_ATE_LER_ENTRADAS);
    const fontes: FonteDeEntradaSondada[] = lerFontesDeEntrada(sessao);

    return {
      modo,
      recursos: RECURSOS_CONSULTADOS.map((recurso) => ({
        nome: recurso.nome,
        paraQueServe: recurso.paraQueServe,
        estado: estadoDoRecurso(recurso.nome, concedidos),
      })),
      espacosConcedidos: espacos,
      fontesDeEntrada: fontes,
      graus: grausDeLiberdade(espacos),
    };
  } finally {
    // A sessão precisa terminar mesmo quando a sondagem falha no meio. A razão é
    // física, e não estética: sessão imersiva viva com a página parada prende o
    // visor numa tela vazia, e quem está com o aparelho no rosto só sai pelo menu
    // do sistema.
    await sessao.end();
  }
}

/**
 * Escolhe o modo mais informativo entre os que o aparelho declara suportar.
 *
 * O aumentado vem primeiro porque tudo o que o virtual concede ele também
 * concede, mais os recursos que só existem quando há mundo real a consultar.
 */
export function modoPreferido(
  modosSuportados: readonly string[],
): ModoSondavel | undefined {
  const ordem: readonly ModoSondavel[] = ['immersive-ar', 'immersive-vr'];
  return ordem.find((modo) => modosSuportados.includes(modo));
}

export async function sondar(): Promise<ResultadoDaSonda> {
  const semSessao: SondaSemSessao = await sondarSemSessao();
  const modo: ModoSondavel | undefined = modoPreferido(semSessao.modosSuportados);

  if (modo === undefined) {
    return {
      semSessao,
      emSessao: undefined,
      motivoSemSessao: semSessao.temApiXr
        ? 'Este aparelho não declara sessão imersiva alguma, e metade da sonda não tem onde acontecer. É informação sobre o aparelho, e não defeito do código.'
        : 'Sem API XR neste navegador. Se a página não está em contexto seguro, a causa é o endereço, e não o aparelho.',
      classe: classificarAparelho(
        semSessao.modosSuportados,
        'indeterminado',
        semSessao.temApiXr,
      ),
    };
  }

  const emSessao: SondaEmSessao = await sondarEmSessao(modo);

  return {
    semSessao,
    emSessao,
    motivoSemSessao: undefined,
    classe: classificarAparelho(
      semSessao.modosSuportados,
      emSessao.graus,
      semSessao.temApiXr,
    ),
  };
}
