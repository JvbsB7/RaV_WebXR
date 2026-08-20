import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import basicSsl from '@vitejs/plugin-basic-ssl';

// WebXR exige HTTPS (contexto seguro), inclusive na rede local.
// O basicSsl gera um certificado autoassinado automaticamente.
// O config roda como módulo ES, onde __dirname não existe.
const pagina = (nome: string): string => fileURLToPath(new URL(nome, import.meta.url));

export default defineConfig({
  plugins: [basicSsl()],
  server: {
    host: true, // escuta em 0.0.0.0 -> acessível pelos outros aparelhos da rede
    port: 5173,
    // Se for usar um túnel (cloudflared/ngrok), libere o host aqui:
    // allowedHosts: ['.trycloudflare.com', '.ngrok-free.app'],
  },
  build: {
    target: 'es2020',
    sourcemap: true,
    rollupOptions: {
      // Duas páginas: a sonda na raiz, que é a entrega deste módulo, e a cena
      // que já existia. A sonda fica na raiz porque a verificação do módulo é
      // abrir O MESMO endereço em aparelhos de classes diferentes.
      input: {
        sonda: pagina('index.html'),
        cena: pagina('cena.html'),
      },
    },
  },
});
