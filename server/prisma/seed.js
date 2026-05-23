import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mesmo número de rounds usado no service de auth.
const BCRYPT_ROUNDS = 10;

// Senhas fracas DE PROPÓSITO — são apenas para o ambiente de desenvolvimento.
// Nunca rode este seed em produção.
const usuarios = [
  {
    nome: 'Coordenador Dev',
    email: 'coordenador@portal.dev',
    senha: 'coord1234',
    papel: 'coordenador',
  },
  {
    nome: 'Orientador Dev',
    email: 'orientador@portal.dev',
    senha: 'orient1234',
    papel: 'orientador',
  },
  {
    nome: 'Aluno Dev',
    email: 'aluno@portal.dev',
    senha: 'aluno1234',
    papel: 'aluno',
    ra: '2024001',
  },
];

async function main() {
  for (const u of usuarios) {
    const senhaHash = await bcrypt.hash(u.senha, BCRYPT_ROUNDS);
    // upsert por email torna o seed idempotente — pode rodar várias vezes sem erro.
    await prisma.usuario.upsert({
      where: { email: u.email },
      update: { nome: u.nome, papel: u.papel, ra: u.ra ?? null },
      create: {
        nome: u.nome,
        email: u.email,
        senhaHash,
        papel: u.papel,
        ra: u.ra ?? null,
      },
    });
    console.log(`✓ ${u.papel.padEnd(12)} ${u.email}`);
  }
}

main()
  .then(() => {
    console.log('Seed concluído.');
  })
  .catch((err) => {
    console.error('Seed falhou:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
