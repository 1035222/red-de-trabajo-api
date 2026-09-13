/**
 * seedTestUsers.js
 * ===================
 * Script de desarrollo para sembrar usuarios de prueba en la base de datos.
 *
 * IMPORTANTE: Este script crea USUARIOS DE PRUEBA / DESARROLLO, no usuarios reales.
 * Los usuarios usan IDs UUID (no Firebase UIDs) y están diseñados para testing
 * del flujo de chat, perfiles y búsqueda de servicios.
 *
 * Para usarlo: node prisma/seedTestUsers.js
 */
const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

async function main() {
  // --- Seed categories (including new ones: Diseño, Fotografía) ---
  const categories = [
    { name: 'Plomería', icon: 'plumbing', color: '#004AC6' },
    { name: 'Electricidad', icon: 'electrical_services', color: '#006A61' },
    { name: 'Limpieza', icon: 'cleaning_services', color: '#2563EB' },
    { name: 'Pintura', icon: 'format_paint', color: '#B4C5FF' },
    { name: 'Carpintería', icon: 'carpenter', color: '#86F2E4' },
    { name: 'Jardinería', icon: 'yard', color: '#D3E4FE' },
    { name: 'Diseño', icon: 'design_style', color: '#7B2CBF' },
    { name: 'Fotografía', icon: 'camera_alt', color: '#475569' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }
  console.log('Categorías sembradas/verificadas');

  // Build category lookup
  const allCats = await prisma.category.findMany({ select: { id: true, name: true } });
  const catMap = {};
  for (const c of allCats) {
    catMap[c.name] = c.id;
  }

  const testUsers = [
    {
      id: `test_${uuidv4().substring(0, 8)}`,
      email: 'carlos.test@redtrabajo.dev',
      name: 'Carlos Méndez',
      bio: 'Plomero certificado con 10+ años de experiencia. Especializado en reparaciones urgentes y mantenimiento preventivo.',
      location: 'Ciudad de México, CDMX',
      avatarUrl: 'https://i.pravatar.cc/150?img=1',
      services: [
        {
          title: 'Reparación de tuberías',
          price: '$35/hr',
          description: 'Servicio profesional de plomería para reparaciones, instalaciones y mantenimiento.',
          category: 'Plomería',
          imageUrl: 'https://images.unsplash.com/photo-1581578731438-314f53f6f7f5?w=400',
          featured: true,
        },
        {
          title: 'Instalación de grifos',
          price: '$50/hr',
          description: 'Instalación y reemplazo de grifos, lavabos y sanitarios.',
          category: 'Plomería',
          imageUrl: 'https://images.unsplash.com/photo-1604418920250-9cde9f9bd26a?w=400',
          featured: false,
        },
      ],
    },
    {
      id: `test_${uuidv4().substring(0, 8)}`,
      email: 'ana.test@redtrabajo.dev',
      name: 'Ana Ruiz',
      bio: 'Electricista certificada. Proyectos residenciales y comerciales. Garantía de 2 años en todo trabajo.',
      location: 'Guadalajara, Jalisco',
      avatarUrl: 'https://i.pravatar.cc/150?img=2',
      services: [
        {
          title: 'Instalación eléctrica completa',
          price: '$45/hr',
          description: 'Electricista certificada para proyectos residenciales y comerciales.',
          category: 'Electricidad',
          imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a2692?w=400',
          featured: true,
        },
      ],
    },
    {
      id: `test_${uuidv4().substring(0, 8)}`,
      email: 'maria.test@redtrabajo.dev',
      name: 'María Torres',
      bio: 'Limpieza profesional de hogares y oficinas. Uso de productos ecológicos y 100% garantizados.',
      location: 'Monterrey, Nuevo León',
      avatarUrl: 'https://i.pravatar.cc/150?img=3',
      services: [
        {
          title: 'Limpieza profunda de oficinas',
          price: '$28/hr',
          description: 'Servicio completo de limpieza para espacios comerciales y residenciales.',
          category: 'Limpieza',
          imageUrl: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=400',
          featured: true,
        },
      ],
    },
    {
      id: `test_${uuidv4().substring(0, 8)}`,
      email: 'luis.test@redtrabajo.dev',
      name: 'Luis Gómez',
      bio: 'Diseñador gráfico y digital con 8 años de experiencia. Branding, logotipos y diseño UX.',
      location: 'Medellín, Colombia',
      avatarUrl: 'https://i.pravatar.cc/150?img=4',
      services: [
        {
          title: 'Diseño de logotipo corporativo',
          price: '$200',
          description: 'Creación de identidad visual completa: logotipo, paleta de colores y manual de marca.',
          category: 'Diseño',
          imageUrl: 'https://images.unsplash.com/photo-1541740904875-6939cbc17524?w=400',
          featured: true,
        },
        {
          title: 'Rediseño de marca',
          price: '$350',
          description: 'Actualización completa de tu marca: estudio de mercado, propuesta de rediseño y entrega de archivos.',
          category: 'Diseño',
          imageUrl: 'https://images.unsplash.com/photo-1498050108023-c528d2ed4f87?w=400',
          featured: false,
        },
      ],
    },
    {
      id: `test_${uuidv4().substring(0, 8)}`,
      email: 'sofia.test@redtrabajo.dev',
      name: 'Sofía Ramírez',
      bio: 'Fotógrafa profesional. Eventos, productos y retratos. Capturando momentos especiales con creatividad.',
      location: 'Bogotá, Colombia',
      avatarUrl: 'https://i.pravatar.cc/150?img=5',
      services: [
        {
          title: 'Fotografía de eventos',
          price: '$150',
          description: 'Cobertura profesional de bodas, eventos corporativos y celebraciones.',
          category: 'Fotografía',
          imageUrl: 'https://images.unsplash.com/photo-1519085361265-2cc0f1d2f4d1?w=400',
          featured: true,
        },
      ],
    },
    {
      id: `test_${uuidv4().substring(0, 8)}`,
      email: 'diego.test@redtrabajo.dev',
      name: 'Diego Castañeda',
      bio: 'Carpintero y constructor de muebles a medida. Madera sostenible y acabados de calidad.',
      location: 'Barcelona, España',
      avatarUrl: 'https://i.pravatar.cc/150?img=6',
      services: [
        {
          title: 'Mueble de comedor personalizado',
          price: '$800',
          description: 'Fabricación de muebles de comedor a medida en madera sostenible. Incluye diseño y entrega.',
          category: 'Carpintería',
          imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea90c?w=400',
          featured: true,
        },
      ],
    },
    {
      id: `test_${uuidv4().substring(0, 8)}`,
      email: 'valeria.test@redtrabajo.dev',
      name: 'Valeria Luna',
      bio: 'Pintora profesional de interiores y exteriores. Trabajo limpio, respetuoso con el entorno.',
      location: 'Lima, Perú',
      avatarUrl: 'https://i.pravatar.cc/150?img=7',
      services: [
        {
          title: 'Pintura de sala de estar',
          price: '$300',
          description: 'Pintura profesional de interiores con acabados perfectos. Incluye preparación y limpieza.',
          category: 'Pintura',
          imageUrl: 'https://images.unsplash.com/photo-1562259640-b6e5baa7599e?w=400',
          featured: true,
        },
      ],
    },
    {
      id: `test_${uuidv4().substring(0, 8)}`,
      email: 'javier.test@redtrabajo.dev',
      name: 'Javier Herrera',
      bio: 'Jardinero y paisajista. Diseño de jardines sostenibles, riego eficiente y mantenimiento integral.',
      location: 'Santiago, Chile',
      avatarUrl: 'https://i.pravatar.cc/150?img=8',
      services: [
        {
          title: 'Diseño de jardín residencial',
          price: '$600',
          description: 'Diseño e implementación de jardines sostenibles. Sistema de riego y plantas nativas.',
          category: 'Jardinería',
          imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400',
          featured: true,
        },
        {
          title: 'Mantenimiento de jardín',
          price: '$120/mes',
          description: 'Servicio de mantenimiento semanal: poda, riego, fertilización y control de plagas.',
          category: 'Jardinería',
          imageUrl: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec4?w=400',
          featured: false,
        },
      ],
    },
  ];

  for (const user of testUsers) {
    const catId = catMap[user.services[0].category];

    const createdUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        bio: user.bio,
        location: user.location,
        avatarUrl: user.avatarUrl,
      },
      create: {
        id: user.id,
        email: user.email,
        name: user.name,
        bio: user.bio,
        location: user.location,
        avatarUrl: user.avatarUrl,
      },
    });

    console.log(`Usuario creado/actualizado: ${createdUser.name} (${createdUser.id})`);

    // Create services for this user
    for (const svc of user.services) {
      const existing = await prisma.service.findFirst({
        where: { title: svc.title, providerId: createdUser.id },
      });

      if (!existing) {
        await prisma.service.create({
          data: {
            id: uuidv4(),
            title: svc.title,
            price: svc.price,
            description: svc.description,
            categoryName: svc.category,
            categoryId: catMap[svc.category] || 1,
            imageUrl: svc.imageUrl,
            rating: 4.5,
            reviewsCount: 10,
            featured: svc.featured,
            providerId: createdUser.id,
          },
        });
        console.log(`  -> Servicio creado: ${svc.title} (${svc.category})`);
      }
    }

    // Update servicesCount
    const serviceCount = await prisma.service.count({
      where: { providerId: createdUser.id },
    });

    await prisma.user.update({
      where: { id: createdUser.id },
      data: { servicesCount: serviceCount },
    });
  }

  console.log('\n--- Resumen del seed ---');
  const totalUsers = await prisma.user.count({ where: { email: { endsWith: '@redtrabajo.dev' } } });
  const totalServices = await prisma.service.count();
  console.log(`Usuarios de prueba: ${totalUsers}`);
  console.log(`Servicios totales: ${totalServices}`);
  console.log('Categorías:', (await prisma.category.findMany({ select: { name: true } })).map(c => c.name).join(', '));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
