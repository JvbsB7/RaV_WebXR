import assert from 'node:assert/strict';
import { Group, Object3D, Vector3 } from 'three';
import { criarBateria } from '../src/bateria/cena.ts';
import { PECAS, AMPLITUDE_M, FREQUENCIA_RAD_S } from '../src/bateria/dominio.ts';
import { reparentar } from '../src/bateria/hierarquia.ts';
import { Relogio } from '../src/bateria/tempo.ts';
import { grausDeLiberdade } from '../src/bancada/devices/graus.ts';

const cena = criarBateria();

assert.equal(cena.pecas.size, 6);

for (const p of PECAS) {
  const no = cena.pecas.get(p.id);

  assert.equal(no.geometry.parameters.radiusTop * 2, p.diametro);
  assert.equal(no.geometry.parameters.height, p.profundidade);
  assert.equal(no.parent, cena.tampo);
}

assert.equal(cena.bastoes.children.length, 2);
assert.equal(cena.bastoes.visible, false);

const suporte = cena.suportes.get('prato-1');
const garra = cena.sala.getObjectByName('garra-prato-1');

const antesGarra = garra.getWorldPosition(new Vector3());

suporte.position.y += 0.25;

assert.ok(
  Math.abs(
    garra.getWorldPosition(new Vector3()).y -
    antesGarra.y -
    0.25
  ) < 1e-12,
);

const prato = cena.pecas.get('prato-1');
const troca = reparentar(prato, suporte);

assert.ok(troca.erro < 1e-12);
assert.equal(prato.parent, suporte);

suporte.position.y -= 0.25;

assert.ok(
  Math.abs(
    prato.getWorldPosition(new Vector3()).y -
    troca.depois[1] +
    0.25
  ) < 1e-12,
);

console.log(
  'OK: objetos, dimensões, parentesco real e movimento herdado.',
);

const raiz = new Group();
const paiA = new Group();
const paiB = new Group();
const filho = new Object3D();

raiz.add(paiA, paiB);

paiA.position.set(1, 2, -3);
paiA.rotation.set(0.2, 0.4, -0.3);
paiA.scale.setScalar(1.7);

paiB.position.set(-4, 1, 2);
paiB.rotation.set(0.5, -0.8, 0.2);
paiB.scale.setScalar(0.6);

paiA.add(filho);

filho.position.set(0.4, 0.8, -0.2);
filho.rotation.set(0.1, 0.3, 0.2);

filho.updateWorldMatrix(true, false);

const matrizAntes = filho.matrixWorld.clone();
const fronteira = reparentar(filho, paiB);

filho.updateWorldMatrix(true, false);

assert.ok(fronteira.erro < 1e-12);

assert.ok(
  Math.max(
    ...filho.matrixWorld.elements.map(
      (v, i) => Math.abs(v - matrizAntes.elements[i]),
    ),
  ) < 1e-12,
);

assert.throws(
  () => reparentar(paiB, filho),
  /ciclo/,
);

paiA.scale.set(1, 2, 1);

assert.throws(
  () => reparentar(filho, paiA),
  /uniforme/,
);

paiA.scale.setScalar(0);

assert.throws(
  () => reparentar(filho, paiA),
  /uniforme/,
);

console.log(
  'OK: troca preserva a matriz de mundo com rotação e escala uniforme; ciclos e escalas inválidas são recusados.',
);

const alturas = [30, 60, 144].map(fps => {
  const relogio = new Relogio();

  for (let i = 0; i <= fps * 2; i++) {
    relogio.avancar(i * 1000 / fps);
  }

  return (
    1.1 +
    AMPLITUDE_M *
    Math.sin(relogio.decorrido * FREQUENCIA_RAD_S)
  );
});

assert.ok(
  Math.max(...alturas) - Math.min(...alturas) < 1e-12,
);

const pausa = new Relogio();

pausa.avancar(0);

assert.deepEqual(
  pausa.avancar(5000),
  {
    delta: 0.1,
    intervaloMs: 5000,
  },
);

assert.equal(
  grausDeLiberdade(0, 0),
  'indeterminado',
);

assert.equal(
  grausDeLiberdade(30, 30),
  'indeterminado',
);

assert.equal(
  grausDeLiberdade(30, 29),
  'seis',
);

console.log(
  'OK: mesma altura após 2 s a 30, 60 e 144 quadros/s, proteção de pausa e inferência por poses.',
);

console.log(
  JSON.stringify(
    {
      alturasApos2s: alturas,
      troca,
      fronteira,
    },
    null,
    2,
  ),
);