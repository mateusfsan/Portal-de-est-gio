// Erros de domínio sobem do service até o errorHandler central carregando
// o statusCode HTTP correto. Isso evita try/catch espalhado pelos controllers
// (ver CLAUDE.md, seção 6).
export class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
  }
}
