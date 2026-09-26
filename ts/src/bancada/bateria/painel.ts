import { CanvasTexture, Mesh, MeshBasicMaterial, PlaneGeometry, SRGBColorSpace } from 'three';
import { TETO_MS } from './dominio.ts';
export function criarPainel() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 448;
  const ctx = canvas.getContext('2d')!;
  const textura = new CanvasTexture(canvas);
  textura.colorSpace = SRGBColorSpace;
  const no = new Mesh(new PlaneGeometry(1.65, 0.72), new MeshBasicMaterial({ map: textura }));
  no.name = 'painel-de-custo';
  no.position.set(0, 1.62, -0.68);
  function atualizar(custoMs: number, intervaloMs: number, amostras: number) {
    ctx.fillStyle = '#101820';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#e8ded1';
    ctx.font = 'bold 51px sans-serif';
    ctx.fillText('CUSTO DO QUADRO', 38, 73);
    ctx.font = '44px sans-serif';
    ctx.fillText(`CPU: ${custoMs.toFixed(2)} ms`, 38, 155);
    ctx.fillText(`Intervalo: ${intervaloMs.toFixed(2)} ms`, 38, 222);
    ctx.fillStyle = custoMs > TETO_MS || intervaloMs > TETO_MS ? '#ffb680' : '#9dd9bd';
    ctx.fillText(`Teto: ${TETO_MS.toFixed(2)} ms`, 38, 289);
    ctx.fillStyle = '#aab7c0';
    ctx.font = '32px sans-serif';
    ctx.fillText(`${amostras} quadros / GPU não medida`, 38, 377);
    textura.needsUpdate = true;
  }
  atualizar(0, 0, 0);
  return { no, atualizar };
}
