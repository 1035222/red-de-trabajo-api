const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

async function main() {
  const users = [
    {
      id: uuidv4(),
      email: 'miguelangelvalenciacastano@gmail.com',
      name: 'Miguel Angel Valencia',
      avatarUrl: '',
      bio: 'Usuario registrado desde el seed manual',
      location: 'Colombia',
      rating: 0,
      servicesCount: 0,
      verified: false,
    },
    {
      id: uuidv4(),
      email: 'zabalapreciado@gmail.com',
      name: 'Usuario Zabalapreciado',
      avatarUrl: '',
      bio: 'Usuario registrado desde el seed manual',
      location: '',
      rating: 0,
      servicesCount: 0,
      verified: false,
    },
  ];

  for (const user of users) {
    const created = await prisma.user.create({
      data: user,
    });
    console.log('Usuario creado:', created.email, created.id);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
