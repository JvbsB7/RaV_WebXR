// ---------------------------------------------------------------------------
// A apresentação do que a sonda descobriu: a outra metade da Tarefa 2.
//
// Tudo aqui monta elemento de página, e nada aqui consulta o aparelho. A
// separação é o que permite trocar esta camada inteira quando houver cena: o
// painel definitivo deste ambiente será objeto do mundo, preso à própria cena e
// lido de dentro do visor. Ele não pode existir ainda pelo motivo mais simples
// possível: não há cena. Enquanto ela não chega, o relatório sai em HTML comum,
// e essa é uma decisão temporária que vale declarar em vez de esconder: quando a
// cena existir, este é o arquivo que muda de lugar, e nada mais.
//
// Duas escolhas de apresentação são de engenharia, e não de gosto. O corpo de
// texto é generoso porque leitura a um braço de distância, com a resolução
// angular que um visor tem, não é leitura de tela de computador. E nenhuma
// capacidade ausente vira controle desabilitado: botão morto ensina que o
// ambiente não funciona no aparelho, quando a lição certa é qual capacidade
// falta.
// ---------------------------------------------------------------------------

import type { EstadoDeRecurso } from '../devices/recursos';
import { descreverClasse, type GrausDeLiberdade } from '../devices/graus';
import type { ResultadoDaSonda, SondaEmSessao } from '../devices/sonda';
import type { LinhaDoRelatorio, Suporte } from '../modes/verificacao';

// --- Peças pequenas de montagem -------------------------------------------

function celula(texto: string, cabecalho: boolean = false): HTMLTableCellElement {
  const elemento: HTMLTableCellElement = document.createElement(cabecalho ? 'th' : 'td');
  elemento.textContent = texto;
  return elemento;
}

function paragrafo(texto: string, classe?: string): HTMLParagraphElement {
  const elemento: HTMLParagraphElement = document.createElement('p');
  elemento.textContent = texto;
  if (classe !== undefined) {
    elemento.className = classe;
  }
  return elemento;
}

function subtitulo(texto: string): HTMLHeadingElement {
  const elemento: HTMLHeadingElement = document.createElement('h3');
  elemento.textContent = texto;
  return elemento;
}

function tabela(titulos: readonly string[]): HTMLTableElement {
  const elemento: HTMLTableElement = document.createElement('table');
  const cabecalho: HTMLTableRowElement = elemento.insertRow();
  for (const titulo of titulos) {
    cabecalho.appendChild(celula(titulo, true));
  }
  return elemento;
}

/**
 * Tabelas largas precisam rolar dentro de si mesmas, e não empurrar a página.
 * Num aparelho de mão a página inteira rolando de lado torna o texto ao redor
 * impossível de acompanhar.
 */
function envolverTabela(grade: HTMLTableElement): HTMLElement {
  const moldura: HTMLDivElement = document.createElement('div');
  moldura.className = 'rolagem';
  moldura.appendChild(grade);
  return moldura;
}

// --- Rótulos --------------------------------------------------------------
//
// Cada estado de três valores tem seu rótulo escrito por extenso, e nenhum deles
// é abreviado para "não". O relatório é lido por quem não escreveu o código, e a
// diferença entre "o aparelho respondeu não" e "o aparelho não respondeu" é o
// conteúdo inteiro deste módulo.

function rotuloDoSuporte(suporte: Suporte): string {
  switch (suporte) {
    case 'sim':
      return 'suportado';
    case 'nao':
      return 'não suportado';
    case 'desconhecido':
      return 'sem resposta';
  }
}

function rotuloDoEstado(estado: EstadoDeRecurso): string {
  switch (estado) {
    case 'concedido':
      return 'concedido';
    case 'nao-concedido':
      return 'pedido e não concedido';
    case 'indeterminado':
      return 'sem resposta: a sessão não disse o que ligou';
  }
}

function rotuloDosGraus(graus: GrausDeLiberdade): string {
  switch (graus) {
    case 'tres':
      return 'três graus de liberdade: acompanha para onde a cabeça aponta, e não para onde ela vai';
    case 'seis':
      return 'seis graus de liberdade: acompanha orientação e deslocamento';
    case 'indeterminado':
      return 'posição rastreada indeterminada: não houve pose válida ou todas as posições foram emuladas';
  }
}

// --- A consulta sem sessão ------------------------------------------------

/**
 * A tabela dos regimes, com a resposta do navegador em cada linha.
 *
 * As duas primeiras colunas são declaração deste projeto e não mudam de aparelho
 * para aparelho. A última é a única que o aparelho preenche, e por isso fica no
 * fim: lê-se a pergunta e, ao lado dela, a resposta.
 */
export function montarRegimes(raiz: HTMLElement, linhas: readonly LinhaDoRelatorio[]): void {
  raiz.replaceChildren();

  raiz.appendChild(subtitulo('Regimes: o que este aparelho responde'));
  raiz.appendChild(
    paragrafo(
      'Esta é a pergunta grossa, e é a única que se responde sem abrir sessão alguma: ' +
        'o aparelho entra neste regime? O que ele concede uma vez lá dentro está na sonda, ' +
        'mais abaixo, e espera um toque no botão.',
    ),
  );

  const grade: HTMLTableElement = tabela([
    'Regime',
    'O que faz com o mundo',
    'Neste aparelho',
  ]);

  for (const linha of linhas) {
    const fileira: HTMLTableRowElement = grade.insertRow();
    fileira.appendChild(celula(linha.regime.nome));
    fileira.appendChild(celula(linha.regime.tratamentoDoMundo));

    const resposta: HTMLTableCellElement = celula(
      `${rotuloDoSuporte(linha.suporte)}. ${linha.observacao}`,
    );
    resposta.className = `suporte suporte-${linha.suporte}`;
    fileira.appendChild(resposta);
  }

  raiz.appendChild(envolverTabela(grade));
}

// --- O resultado da sonda -------------------------------------------------

function tabelaDeRecursos(sonda: SondaEmSessao): HTMLElement {
  const grade: HTMLTableElement = tabela(['Recurso', 'Para que serve', 'Neste aparelho']);

  for (const recurso of sonda.recursos) {
    const fileira: HTMLTableRowElement = grade.insertRow();
    fileira.appendChild(celula(recurso.nome));
    fileira.appendChild(celula(recurso.paraQueServe));

    const estado: HTMLTableCellElement = celula(rotuloDoEstado(recurso.estado));
    estado.className = `estado estado-${recurso.estado}`;
    fileira.appendChild(estado);
  }

  return envolverTabela(grade);
}

function tabelaDeFontes(sonda: SondaEmSessao): HTMLElement {
  if (sonda.fontesDeEntrada.length === 0) {
    return paragrafo(
      'Nenhuma fonte de entrada foi declarada durante a sondagem. Num visor isso costuma ' +
        'significar controle desligado ou fora de alcance; num aparelho de mão é o esperado ' +
        'até o primeiro toque na tela, porque a fonte de entrada nasce do toque.',
    );
  }

  const grade: HTMLTableElement = tabela([
    'Lado',
    'Mira',
    'Pose de punho',
    'Mão articulada',
    'Perfis',
  ]);

  for (const fonte of sonda.fontesDeEntrada) {
    const fileira: HTMLTableRowElement = grade.insertRow();
    fileira.appendChild(celula(fonte.lado));
    fileira.appendChild(celula(fonte.mira));
    fileira.appendChild(celula(fonte.temPoseDePunho ? 'sim' : 'não'));
    fileira.appendChild(celula(fonte.temMao ? 'sim' : 'não'));
    fileira.appendChild(celula(fonte.perfis.length === 0 ? 'nenhum' : fonte.perfis.join(', ')));
  }

  return envolverTabela(grade);
}

function blocoDosEspacos(sonda: SondaEmSessao): HTMLElement {
  const bloco: HTMLElement = document.createElement('section');

  bloco.appendChild(subtitulo('Espaços de referência e graus de liberdade'));
  bloco.appendChild(
    paragrafo(
      sonda.espacosConcedidos.length === 0
        ? 'Nenhum espaço de referência foi concedido, o que é raro o bastante para desconfiar da sondagem antes de desconfiar do aparelho.'
        : `Concedidos: ${sonda.espacosConcedidos.join(', ')}.`,
    ),
  );

  bloco.appendChild(paragrafo(rotuloDosGraus(sonda.graus), `graus graus-${sonda.graus}`));
  bloco.appendChild(
    paragrafo(
      `${sonda.posesObservadas} poses observadas, ${sonda.posesEmuladas} com posição emulada. ` +
        'A concessão de local-floor não comprova 6DoF. Posição emulada pode indicar perda de rastreamento.',
      'nota-de-rodape',
    ),
  );

  return bloco;
}

/**
 * Escreve o resultado da sonda no elemento indicado.
 *
 * Esta função não decide nada sobre o aparelho: ela só torna legível o que a
 * camada de dispositivos já decidiu.
 */
export function montarSonda(raiz: HTMLElement, resultado: ResultadoDaSonda): void {
  raiz.replaceChildren();

  const titulo: HTMLHeadingElement = document.createElement('h2');
  titulo.textContent = 'Sonda de capacidades';
  raiz.appendChild(titulo);

  raiz.appendChild(paragrafo(descreverClasse(resultado.classe), 'classe'));
  raiz.appendChild(
    paragrafo(
      'A classe acima foi deduzida do que o aparelho concedeu, e não do nome que o navegador ' +
        'diz ter. A cadeia de identificação é editável, imitada por outros aparelhos e envelhece ' +
        'a cada versão; o que a sessão concede é o que este aparelho faz agora.',
      'nota-de-rodape',
    ),
  );

  // A primeira linha do relatório é sobre o endereço, e não sobre o aparelho.
  // Sem contexto seguro tudo o que vem abaixo descreve a URL, e o relatório sai
  // coerente, completo e falso.
  raiz.appendChild(
    paragrafo(
      resultado.semSessao.contextoSeguro
        ? 'A página está em contexto seguro, então a ausência de um recurso é resposta do aparelho.'
        : 'A página NÃO está em contexto seguro. Nada abaixo é informação sobre o aparelho: é o endereço impedindo a pergunta de ser feita.',
      resultado.semSessao.contextoSeguro ? 'aviso aviso-bom' : 'aviso aviso-ruim',
    ),
  );

  const sonda: SondaEmSessao | undefined = resultado.emSessao;
  if (sonda === undefined) {
    raiz.appendChild(
      paragrafo(
        resultado.motivoSemSessao ?? 'Não houve sessão, e o motivo não foi registrado.',
        'aviso aviso-ruim',
      ),
    );
    return;
  }

  raiz.appendChild(subtitulo(`Recursos opcionais pedidos em ${sonda.modo}`));
  raiz.appendChild(
    paragrafo(
      'Todos foram pedidos como opcionais. Marcar um único deles como obrigatório faria o ' +
        'aparelho recusar a sessão inteira por causa daquele item, e a sonda perderia tudo o ' +
        'que veio buscar.',
    ),
  );
  raiz.appendChild(tabelaDeRecursos(sonda));

  raiz.appendChild(blocoDosEspacos(sonda));

  raiz.appendChild(subtitulo('Fontes de entrada declaradas'));
  raiz.appendChild(tabelaDeFontes(sonda));
}
