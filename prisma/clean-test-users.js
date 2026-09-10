const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.user.deleteMany({
    where: {
      email: {
        in: [
          'miguelangelvalenciacastano@gmail.com',
          'zabalapreciado@gmail.com',
        ],
      },
    },
  });
  console.log('Usuarios de prueba eliminados de la base de datos local');
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
