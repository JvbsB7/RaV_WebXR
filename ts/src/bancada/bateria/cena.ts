import * as THREE from 'three';
import { PECAS } from './dominio';

export function criarBateria() {
  const sala = new THREE.Scene();
  sala.name = 'sala';
  sala.background = new THREE.Color('#161e28');
  sala.add(new THREE.HemisphereLight(0xffffff, 0x596571, 2.8));

  const luz = new THREE.DirectionalLight(0xffffff, 2);
  luz.position.set(3, 6, 4);
  sala.add(luz);

  const material = (cor: string) => new THREE.MeshStandardMaterial({ color: cor, roughness: 1 });
  const metal = material('#8997a4');
  const cinza = material('#5b6b76');
  const piso = material('#263340');

  function grupo(nome: string, pai: THREE.Object3D, x = 0, y = 0, z = 0) {
    const no = new THREE.Group();
    no.name = nome;
    no.position.set(x, y, z);
    pai.add(no);
    return no;
  }

  function caixa(
    nome: string,
    largura: number,
    altura: number,
    profundidade: number,
    mat: THREE.Material,
    pai: THREE.Object3D,
    x = 0,
    y = 0,
    z = 0,
  ) {
    const no = new THREE.Mesh(new THREE.BoxGeometry(largura, altura, profundidade), mat);
    no.name = nome;
    no.position.set(x, y, z);
    pai.add(no);
    return no;
  }

  function cilindro(
    nome: string,
    raio: number,
    altura: number,
    mat: THREE.Material,
    pai: THREE.Object3D,
    x = 0,
    y = 0,
    z = 0,
  ) {
    const no = new THREE.Mesh(new THREE.CylinderGeometry(raio, raio, altura, 24), mat);
    no.name = nome;
    no.position.set(x, y, z);
    pai.add(no);
    return no;
  }

  caixa('piso', 7, 0.04, 5, piso, sala, -0.7, -0.02);
  caixa('parede-fundo', 7, 2.8, 0.04, piso, sala, -0.7, 1.4, -2.5);

  const bateria = grupo('bateria', sala, 0.9, 0, -0.1);
  const estrutura = grupo('estrutura', bateria);
  caixa('travessa', 1.45, 0.045, 0.045, metal, estrutura, 0, 0.35);

  for (const x of [-0.7, 0.7]) {
    cilindro('pe-da-estrutura', 0.024, 0.65, metal, estrutura, x, 0.325);
    caixa('base-da-estrutura', 0.08, 0.035, 0.8, metal, estrutura, x, 0.0175);
  }

  const posicoes = [
    [-0.42, 0.13],
    [0, -0.2],
    [0.44, 0.1],
    [0.68, 0.58],
    [-0.64, -0.35],
    [0.6, -0.38],
  ];

  const suportes = new Map<string, THREE.Group>();

  for (const [i, peca] of PECAS.entries()) {
    const [x, z] = posicoes[i];

    caixa(
      'braco-' + peca.id,
      0.025,
      0.025,
      Math.abs(z),
      metal,
      estrutura,
      x,
      0.35,
      z / 2,
    );

    cilindro(
      'haste-' + peca.id,
      0.012,
      peca.altura - 0.35,
      metal,
      estrutura,
      x,
      (peca.altura + 0.35) / 2,
      z,
    );

    const suporte = grupo(
      'suporte-' + peca.id,
      estrutura,
      x,
      peca.altura,
      z,
    );

    cilindro(
      'tubo-movel-' + peca.id,
      0.009,
      0.3,
      metal,
      suporte,
      0,
      -0.15,
    );

    caixa(
      'garra-' + peca.id,
      0.12,
      0.04,
      0.12,
      metal,
      suporte,
      0,
      -0.02,
    );

    suportes.set(peca.id, suporte);
  }

  const mesa = grupo('mesa', sala, -1.75);

  const tampo = caixa(
    'tampo',
    2.2,
    0.04,
    1.2,
    cinza,
    mesa,
    0,
    0.74,
  );

  for (const x of [-0.95, 0.95]) {
    for (const z of [-0.45, 0.45]) {
      caixa(
        'pe-da-mesa',
        0.055,
        0.72,
        0.055,
        metal,
        mesa,
        x,
        0.36,
        z,
      );
    }
  }

  return {
    sala,
    bateria,
    estrutura,
    mesa,
    tampo,
    suportes,
  };
}