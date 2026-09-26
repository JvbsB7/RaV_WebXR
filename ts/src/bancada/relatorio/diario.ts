// ---------------------------------------------------------------------------
// O diário da sondagem: o que aconteceu, escrito onde se possa ler.
//
// É a metade menos vistosa da Tarefa 2, e a que decide se o módulo funciona no
// aparelho. O console de depuração não existe dentro de um visor: quem está com
// a tela no rosto não abre painel de desenvolvedor, não lê aviso de rede e não vê
// exceção. Todo canal de erro que o desenvolvimento web trata como natural
// desaparece no instante em que a tela sobe para os olhos.
//
// O espelho no console continua existindo, e não por hábito: com o aparelho
// ligado ao computador por depuração remota, o mesmo texto em dois lugares é o
// que permite comparar o que a página mostrou com o que o navegador registrou.
// Divergência entre os dois é sintoma próprio, e vale poder notá-la.
// ---------------------------------------------------------------------------

export type Severidade = 'nota' | 'alerta' | 'falha';

export interface Entrada {
  readonly severidade: Severidade;
  readonly texto: string;
  /** O instante em que a entrada foi registrada, para dar ordem à leitura. */
  readonly momento: Date;
}

/**
 * Acumula as entradas e as escreve num elemento da página.
 *
 * O acúmulo é o que permite ao diário existir antes do elemento existir: a
 * sondagem pode falhar durante o carregamento, e mensagem perdida por não ter
 * onde ser escrita é a pior categoria de mensagem. Ela existiu, foi formatada,
 * e ninguém a leu.
 */
export class Diario {
  private readonly entradas: Entrada[] = [];
  private destino: HTMLElement | undefined = undefined;

  public fixarDestino(destino: HTMLElement): void {
    this.destino = destino;
    this.redesenhar();
  }

  public nota(texto: string): void {
    this.registrar('nota', texto);
  }

  public alerta(texto: string): void {
    this.registrar('alerta', texto);
  }

  public falha(texto: string): void {
    this.registrar('falha', texto);
  }

  private registrar(severidade: Severidade, texto: string): void {
    this.entradas.push({ severidade, texto, momento: new Date() });
    // O espelho no console serve à depuração remota. Nunca é o canal principal.
    console.info(`[bancada:${severidade}] ${texto}`);
    this.redesenhar();
  }

  private redesenhar(): void {
    const destino: HTMLElement | undefined = this.destino;
    if (destino === undefined) {
      return;
    }

    destino.replaceChildren();

    for (const entrada of this.entradas) {
      const linha: HTMLParagraphElement = document.createElement('p');
      linha.className = `diario diario-${entrada.severidade}`;
      linha.textContent = `${horario(entrada.momento)} · ${entrada.texto}`;
      destino.appendChild(linha);
    }
  }
}

function horario(momento: Date): string {
  const doisDigitos = (valor: number): string => valor.toString().padStart(2, '0');
  return `${doisDigitos(momento.getHours())}:${doisDigitos(momento.getMinutes())}:${doisDigitos(momento.getSeconds())}`;
}

/**
 * Traduz o que veio de um catch em texto legível.
 *
 * A recusa de sessão chega como erro cru, um nome de classe e uma frase curta em
 * inglês, e é exatamente isso que faz alguém concluir que o código quebrou
 * quando o que houve foi o aparelho dizendo não. Os casos traduzidos são os que
 * aparecem de verdade; o resto cai no genérico, que ao menos diz que parou.
 */
export function explicarFalha(erro: unknown): string {
  if (erro instanceof DOMException) {
    switch (erro.name) {
      case 'NotSupportedError':
        return 'O aparelho recusou a sessão neste modo. Ele não a sustenta, e o pedido foi respondido. Não houve defeito no código.';
      case 'SecurityError':
        return 'O navegador recusou o pedido por falta de gesto de quem usa, ou por contexto inseguro. O botão precisa ser tocado, e a página precisa estar em conexão cifrada.';
      case 'InvalidStateError':
        return 'Já existe uma sessão aberta neste navegador. Encerre a anterior antes de sondar de novo.';
      case 'NotAllowedError':
        return 'A permissão foi negada no diálogo do sistema. Sem ela a sessão não abre, e a decisão é de quem está com o aparelho.';
      default:
        return `A sondagem parou com ${erro.name}: ${erro.message}`;
    }
  }
  if (erro instanceof Error) {
    return `A sondagem parou: ${erro.message}`;
  }
  return 'A sondagem parou por um motivo que o navegador não descreveu.';
}
