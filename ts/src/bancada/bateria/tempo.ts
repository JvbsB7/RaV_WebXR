export class Relogio {
  private anterior: number | undefined;
  decorrido = 0;
  avancar(instanteMs: number) {
    const intervalo = this.anterior === undefined ? 0 : Math.max(0, (instanteMs - this.anterior) / 1000);
    this.anterior = instanteMs;
    const delta = Math.min(intervalo, 0.1); // Retorno de aba suspensa não provoca salto.
    this.decorrido += delta;
    return { delta, intervaloMs: intervalo * 1000 };
  }
}
export class Orcamento {
  private amostras: { custo: number; intervalo: number }[] = [];
  registrar(custo: number, intervalo: number) {
    if (intervalo <= 0) return;
    this.amostras.push({ custo, intervalo });
    if (this.amostras.length > 120) this.amostras.shift();
  }
  ler() {
    const n = this.amostras.length;
    const media = (campo: 'custo' | 'intervalo') => n ? this.amostras.reduce((s, a) => s + a[campo], 0) / n : 0;
    return { amostras: n, custoMs: media('custo'), intervaloMs: media('intervalo') };
  }
}
