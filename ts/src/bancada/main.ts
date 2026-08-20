// ---------------------------------------------------------------------------
// A composição do módulo: liga a sonda ao relatório, e mais nada.
//
// A página se divide em dois tempos, e a divisão não é escolha de interface: é
// consequência direta de uma regra do navegador. O que se responde sem sessão
// roda ao carregar. O que só a sessão responde espera um toque no botão, porque
// o pedido de sessão imersiva que não venha de gesto de quem usa é recusado, e
// a recusa chega como erro de segurança, que se parece com defeito de código.
//
// Este módulo ainda não desenha coisa alguma. O único triângulo de que ele chega
// perto é a superfície de composição que a API exige para entregar quadros, e
// nem nela desenhamos.
// ---------------------------------------------------------------------------

import { sondar, sondarSemSessao, type ResultadoDaSonda } from './devices/sonda';
import { montarRegimes, montarSonda } from './relatorio/relatorio';
import { Diario, explicarFalha } from './relatorio/diario';

/**
 * Busca um elemento obrigatório e falha alto quando ele não existe.
 *
 * Página e código são escritos juntos, e um identificador trocado é erro de
 * programação, e não estado que o ambiente deva tolerar em silêncio.
 */
function exigirElemento(id: string): HTMLElement {
  const elemento: HTMLElement | null = document.getElementById(id);
  if (elemento === null) {
    throw new Error(`A página não tem o elemento #${id}.`);
  }
  return elemento;
}

const raizRegimes: HTMLElement = exigirElemento('regimes');
const raizSonda: HTMLElement = exigirElemento('sonda');
const raizDiario: HTMLElement = exigirElemento('diario');
const botaoSondar: HTMLButtonElement = exigirElemento('sondar') as HTMLButtonElement;

const diario: Diario = new Diario();
diario.fixarDestino(raizDiario);

// O aviso de contexto inseguro vem antes de qualquer consulta, porque sem ele
// todo o resto do relatório descreve o endereço achando que descreve o aparelho.
if (!window.isSecureContext) {
  diario.alerta(
    'Esta página não está em contexto seguro. A API XR não é exposta aqui, e o botão vai ' +
      'responder como se o aparelho não tivesse suporte, o que seria mentira sobre o aparelho. ' +
      'Abra o endereço por HTTPS.',
  );
}

// Primeiro tempo: o que se responde sem sessão alguma, ao carregar a página.
// A consulta é assíncrona porque a API responde por promessa: o navegador pode
// precisar perguntar ao runtime do aparelho antes de saber.
void sondarSemSessao()
  .then((semSessao) => {
    montarRegimes(raizRegimes, semSessao.regimes);
    diario.nota(
      semSessao.temApiXr
        ? 'Consulta sem sessão concluída. A metade que só a sessão responde espera um toque no botão.'
        : 'Consulta sem sessão concluída, e não há API XR neste navegador. O relatório de regimes acima diz "sem resposta" em vez de "não suporta", porque a pergunta não chegou a ser feita.',
    );
  })
  .catch((erro: unknown) => {
    diario.falha(explicarFalha(erro));
  });

/**
 * Segundo tempo: a sondagem completa.
 *
 * Toda saída desta função vai para a página. Capturar a exceção e não mostrar
 * nada é o erro mais fácil de cometer aqui, e o mais difícil de perceber: a
 * página fica intacta e silenciosa, e quem está de visor conclui que o botão não
 * funciona.
 */
async function executarSonda(): Promise<void> {
  botaoSondar.disabled = true;
  botaoSondar.textContent = 'Sondando…';
  diario.nota(
    'Sondando. Se o aparelho pedir permissão, aceite: sem ela a sessão não abre, e a recusa ' +
      'aparece aqui como falha.',
  );

  try {
    const resultado: ResultadoDaSonda = await sondar();
    montarSonda(raizSonda, resultado);

    diario.nota(
      resultado.emSessao === undefined
        ? 'Sondagem concluída sem sessão. O relatório diz por quê, e isso é resultado, não erro.'
        : `Sondagem concluída em ${resultado.emSessao.modo} e sessão encerrada.`,
    );
  } catch (erro: unknown) {
    // A falha é resultado, e precisa ser lida no próprio aparelho: quem está de
    // visor não abre console de depuração.
    diario.falha(explicarFalha(erro));
  } finally {
    // O botão volta a funcionar mesmo quando a sondagem falha. Botão que fica
    // travado depois de um erro ensina que o ambiente quebrou, quando o que
    // houve foi uma resposta.
    botaoSondar.disabled = false;
    botaoSondar.textContent = 'Sondar este aparelho';
  }
}

// O gesto de quem usa é obrigatório, e é por isso que a sonda mora num botão.
botaoSondar.addEventListener('click', () => {
  void executarSonda();
});
