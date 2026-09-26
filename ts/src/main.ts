// cena.html: junta cena, painel, relógio e botões (4 momentos no README).
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { criarBateria } from './bateria/cena.ts';
import { PECAS, TAREFA, AMPLITUDE_M, FREQUENCIA_RAD_S, TETO_MS } from './bateria/dominio.ts';
import { reparentar, descreverArvore } from './bateria/hierarquia.ts';
import { Relogio, Orcamento } from './bateria/tempo.ts';
import { criarPainel } from './bateria/painel.ts';

// Renderizador na div #app. XR ligado para os próximos módulos (aqui não abre sessão).
const tela = document.querySelector<HTMLDivElement>('#app')!;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.xr.enabled = true;
tela.appendChild(renderer.domElement);
const cena = criarBateria();
// Câmera: arrastar gira, roda do mouse aproxima.
const camera = new THREE.PerspectiveCamera(42, 1, 0.01, 50);
camera.position.set(3.4, 3.3, 5.7);
const controles = new OrbitControls(camera, renderer.domElement);
controles.target.set(-0.55, 0.7, 0);
controles.minDistance = 2;
controles.maxDistance = 12;
controles.maxPolarAngle = Math.PI / 2 - 0.05;
controles.update();
// Painel preso à estrutura: move junto com ela.
const painel = criarPainel();
cena.estrutura.add(painel.no);
// Atores da demonstração: suporte do Prato 1 (sobe e desce) e o prato.
const suporte = cena.suportes.get('prato-1')!;
const prato = cena.pecas.get('prato-1')!;
const alturaInicial = suporte.position.y;
const relogio = new Relogio();
const orcamento = new Orcamento();
let movimento = false;
let tempoDoMovimento = 0;
let ultimaAtualizacao = -1;
let ultimaTroca: ReturnType<typeof reparentar> | null = null;

// Lateral da página: tarefa, medidas e árvore.
document.querySelector('#tarefa')!.textContent = TAREFA;
document.querySelector('#inventario')!.textContent = PECAS.map(p => `${p.nome}: Ø ${p.diametro.toFixed(2)} m`).join(' / ');
const atualizarArvore = () => { document.querySelector('#arvore')!.textContent = descreverArvore(cena.sala).join('\n'); };
atualizarArvore();
// Momento 2: liga/desliga o sobe e desce do suporte (garra e anel vão junto por serem filhos).
const botaoMover = document.querySelector<HTMLButtonElement>('#mover')!;
botaoMover.onclick = () => {
  movimento = !movimento;
  botaoMover.textContent = movimento ? 'Pausar ajuste de altura' : 'Demonstrar ajuste de altura';
  botaoMover.setAttribute('aria-pressed', String(movimento));
};
// Momento 3: alterna o pai do Prato 1 (tampo <-> suporte) e mostra antes, depois e erro.
document.querySelector<HTMLButtonElement>('#trocar')!.onclick = () => {
  const novoPai = prato.parent === suporte ? cena.tampo : suporte;
  ultimaTroca = reparentar(prato, novoPai);
  const formatar = (v: number[]) => v.map(n => n.toFixed(6)).join(', ');
  document.querySelector('#resultado')!.textContent =
    `Pai: ${novoPai.name}\nAntes (m): (${formatar(ultimaTroca.antes)})\n` +
    `Depois (m): (${formatar(ultimaTroca.depois)})\nErro: ${ultimaTroca.erro.toExponential(3)} m`;
  atualizarArvore();
};
document.querySelector<HTMLButtonElement>('#reiniciar')!.onclick = () => location.reload();
// Acompanha o tamanho da janela.
function redimensionar() {
  const { width, height } = tela.getBoundingClientRect();
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}
new ResizeObserver(redimensionar).observe(tela);
redimensionar();
// A cada quadro: calcula o delta → move o suporte pelo tempo → atualiza o painel (0,5 s) → mede o custo.
// recorte: laco-por-tempo
renderer.setAnimationLoop((instanteMs) => {
  const inicio = performance.now();
  const { delta, intervaloMs } =
    relogio.avancar(instanteMs);
  if (movimento) tempoDoMovimento += delta;
  suporte.position.y = alturaInicial
    + AMPLITUDE_M * Math.sin(tempoDoMovimento * FREQUENCIA_RAD_S);
  // fim-recorte
  if (relogio.decorrido - ultimaAtualizacao >= 0.5) {
    const leitura = orcamento.ler();
    painel.atualizar(leitura.custoMs, leitura.intervaloMs, leitura.amostras);
    ultimaAtualizacao = relogio.decorrido;
  }
  renderer.render(cena.sala, camera);
  orcamento.registrar(performance.now() - inicio, intervaloMs);
});
// A mesma evidência alimenta a exportação e o teste de navegador.
// Momento 4: é o JSON baixado por "Salvar medição deste aparelho".
function evidencia() {
  const gl = renderer.getContext();
  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  return {
    dataUTC: new Date().toISOString(), navegador: navigator.userAgent,
    renderizador: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
    viewport: [tela.clientWidth, tela.clientHeight], pixelRatio: renderer.getPixelRatio(),
    contextoSeguro: window.isSecureContext, tetoMs: TETO_MS,
    ...orcamento.ler(), chamadas: renderer.info.render.calls, triangulos: renderer.info.render.triangles,
    alturaSuporte: suporte.position.y, movimento, ultimaTroca,
    posicaoPrato: prato.getWorldPosition(new THREE.Vector3()).toArray(),
    posicaoGarra: cena.sala.getObjectByName('garra-prato-1')!.getWorldPosition(new THREE.Vector3()).toArray(),
    paiPrato: prato.parent!.name, painelNaCena: painel.no.parent === cena.estrutura,
    arvore: descreverArvore(cena.sala),
  };
}
Object.assign(window, { evidenciaModulo03: evidencia });
document.querySelector<HTMLButtonElement>('#exportar')!.onclick = () => {
  const url = URL.createObjectURL(new Blob([JSON.stringify(evidencia(), null, 2)], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'medicao-modulo03.json';
  link.click();
  URL.revokeObjectURL(url);
};
