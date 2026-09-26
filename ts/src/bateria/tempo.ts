// Relógio: anima pelo tempo passado, não por quadro. Assim 30, 60 ou 144 quadros/s dão o mesmo resultado.
export class Relogio {
  // anterior = instante do último quadro (ms); decorrido = total em segundos.
  private anterior: number | undefined;
  decorrido = 0;
  // Recebe o instante do quadro (ms). Devolve delta (s, para animar) e intervaloMs (para o painel).
  avancar(instanteMs: number) {
    // Primeiro quadro: intervalo 0.
    const intervalo = this.anterior === undefined ? 0 : Math.max(0, (instanteMs - this.anterior) / 1000);
    this.anterior = instanteMs;
    const delta = Math.min(intervalo, 0.1); // Retorno de aba suspensa não provoca salto.
    this.decorrido += delta;
    return { delta, intervaloMs: intervalo * 1000 };
  }
}
// Orçamento: média dos últimos 120 quadros (custo de CPU e intervalo), para o painel não piscar.
export class Orcamento {
  private amostras: { custo: number; intervalo: number }[] = [];
  // Ignora o primeiro quadro e descarta a amostra mais antiga depois de 120.
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
