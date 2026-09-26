// Uma unidade equivale a um metro. Fonte: docs/especificacao.md, seção 4.
export const PECAS = [
  { id: 'caixa-1', nome: 'Caixa 1', diametro: 0.30, profundidade: 0.18, altura: 0.75 },
  { id: 'caixa-2', nome: 'Caixa 2', diametro: 0.36, profundidade: 0.22, altura: 0.75 },
  { id: 'caixa-3', nome: 'Caixa 3', diametro: 0.42, profundidade: 0.28, altura: 0.70 },
  { id: 'caixa-4', nome: 'Caixa 4', diametro: 0.48, profundidade: 0.35, altura: 0.62 },
  { id: 'prato-1', nome: 'Prato 1', diametro: 0.40, profundidade: 0.002, altura: 1.10 },
  { id: 'prato-2', nome: 'Prato 2', diametro: 0.55, profundidade: 0.003, altura: 1.00 },
] as const;
export const TAREFA = 'Montar as seis peças da bateria e verificar o alcance sentado.';
export const ESTADO_FINAL = 'Seis peças nos apoios corretos, nas alturas previstas e alcançáveis com os bastões.';
export const AMPLITUDE_M = 0.12;
export const FREQUENCIA_RAD_S = 1;
