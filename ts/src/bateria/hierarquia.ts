import { Object3D, Vector3 } from 'three';

// Cada nó guarda posição LOCAL (relativa ao pai). Mundo = pai × local.

// Só aceita escala positiva e igual nos 3 eixos; senão a troca de pai distorce o objeto.
function conferirEscala(no: Object3D | null): void {
  for (; no; no = no.parent) {
    const { x, y, z } = no.scale;
    if (x <= 0 || Math.abs(x - y) > 1e-10 || Math.abs(x - z) > 1e-10) {
      throw new Error('Use escala positiva e uniforme nos nós. Dimensione a geometria.');
    }
  }
}
// Troca o pai sem o objeto sair do lugar. Devolve posição antes, depois e o erro.
export function reparentar(objeto: Object3D, novoPai: Object3D) {
  // Não deixa pendurar o objeto num filho dele mesmo (ciclo).
  for (let no: Object3D | null = novoPai; no; no = no.parent) {
    if (no === objeto) throw new Error('A troca criaria um ciclo na árvore.');
  }
  conferirEscala(objeto);
  conferirEscala(novoPai);
  // Garante matrizes de mundo atualizadas antes de medir.
  objeto.updateWorldMatrix(true, false);
  novoPai.updateWorldMatrix(true, false);
  // recorte: troca-de-pai
  const antes = objeto.getWorldPosition(new Vector3());
  novoPai.attach(objeto);
  const depois = objeto.getWorldPosition(new Vector3());
  const erro = antes.distanceTo(depois);
  // fim-recorte
  // attach aplica M_local = inversa(M_novoPai) * M_mundo.
  // Erro esperado ~1e-16 m (só arredondamento).
  return { antes: antes.toArray(), depois: depois.toArray(), erro };
}
// Nomes da árvore com recuo por nível (lista "Árvore da cena" na página).
export function descreverArvore(raiz: Object3D): string[] {
  const linhas: string[] = [];
  function visitar(no: Object3D, nivel: number) {
    if (no.name) linhas.push('  '.repeat(nivel) + no.name);
    for (const filho of no.children) visitar(filho, nivel + 1);
  }
  visitar(raiz, 0);
  return linhas;
}
