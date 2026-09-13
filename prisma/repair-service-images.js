const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();
const imageFor = (seed) => `https://picsum.photos/seed/${seed}/800/500`;

async function main() {
  const services = await prisma.service.findMany({ orderBy: { createdAt: 'asc' } });
  for (const [index, service] of services.entries()) {
    await prisma.service.update({
      where: { id: service.id },
      data: { imageUrl: imageFor(`service-${index + 1}`) },
    });
  }

  const testUsers = [
    { email: 'carlos.chat@redtrabajo.dev', name: 'Carlos Chat', category: 'Plomería', title: 'Reparaciones de plomería', description: 'Pruebas de servicios de Carlos para el chat.', price: '$35/hr', seed: 'carlos-plomeria' },
    { email: 'ana.chat@redtrabajo.dev', name: 'Ana Chat', category: 'Electricidad', title: 'Instalaciones eléctricas', description: 'Pruebas de servicios de Ana para el chat.', price: '$40/hr', seed: 'ana-electricidad' },
  ];

  for (const data of testUsers) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    const category = await prisma.category.findUnique({ where: { name: data.category } });
    if (!user || !category) continue;

    const existing = await prisma.service.findFirst({ where: { providerId: user.id, title: data.title } });
    if (existing) {
      await prisma.service.update({ where: { id: existing.id }, data: { imageUrl: imageFor(data.seed) } });
      continue;
    }

    await prisma.service.create({
      data: {
        id: uuidv4(),
        title: data.title,
        providerId: user.id,
        categoryId: category.id,
        categoryName: data.category,
        imageUrl: imageFor(data.seed),
        price: data.price,
        description: data.description,
      },
    });
  }

  console.log(`Imágenes reparadas: ${services.length}; servicios de prueba verificados.`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
