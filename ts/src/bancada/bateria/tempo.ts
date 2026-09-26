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
