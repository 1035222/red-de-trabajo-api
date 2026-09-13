const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const imageUrls = [
  'https://images.unsplash.com/photo-1581578731438-314f53f6f7f5?w=800',
  'https://images.unsplash.com/photo-1503387762-592052b2c5c7?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
];

async function main() {
  const services = await prisma.service.findMany({
    where: { imageUrl: '' },
    select: { id: true, title: true },
    orderBy: { createdAt: 'asc' },
  });

  for (const [index, service] of services.entries()) {
    await prisma.service.update({
      where: { id: service.id },
      data: { imageUrl: imageUrls[index % imageUrls.length] },
    });
    console.log(`Imagen asignada: ${service.title}`);
  }

  console.log(`Servicios actualizados: ${services.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
