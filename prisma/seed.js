require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const categories = [
    { name: 'Plomería', icon: 'plumbing', color: '#004AC6' },
    { name: 'Electricidad', icon: 'electrical_services', color: '#006A61' },
    { name: 'Limpieza', icon: 'cleaning_services', color: '#2563EB' },
    { name: 'Pintura', icon: 'format_paint', color: '#B4C5FF' },
    { name: 'Carpintería', icon: 'carpenter', color: '#86F2E4' },
    { name: 'Jardinería', icon: 'yard', color: '#D3E4FE' },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }

  console.log('Seed ejecutado correctamente');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
