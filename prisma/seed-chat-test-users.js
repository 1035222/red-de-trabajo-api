const admin = require('firebase-admin');
const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id,
});

const prisma = new PrismaClient();

const testUsers = [
  {
    email: 'carlos.chat@redtrabajo.dev',
    password: 'ChatTest.2026!',
    name: 'Carlos Chat',
    bio: 'Usuario de prueba para conversaciones.',
    location: 'Medellín',
    avatarUrl: 'https://i.pravatar.cc/150?img=12',
    greeting: 'Hola Miguel, estoy probando el chat contigo.',
  },
  {
    email: 'ana.chat@redtrabajo.dev',
    password: 'ChatTest.2026!',
    name: 'Ana Chat',
    bio: 'Usuaria de prueba para conversaciones.',
    location: 'Bogotá',
    avatarUrl: 'https://i.pravatar.cc/150?img=47',
    greeting: 'Hola Miguel, te escribo para probar la comunicación.',
  },
];

async function getOrCreateFirebaseUser(data) {
  const existing = await admin.auth().getUserByEmail(data.email).catch(() => null);
  if (existing) {
    return admin.auth().updateUser(existing.uid, {
      password: data.password,
      displayName: data.name,
      photoURL: data.avatarUrl,
    });
  }
  return admin.auth().createUser({
    email: data.email,
    password: data.password,
    displayName: data.name,
    photoURL: data.avatarUrl,
    emailVerified: false,
  });
}

async function ensureConversation(miguel, testUser, greeting) {
  let conversation = await prisma.conversation.findFirst({
    where: {
      OR: [
        { userOneId: miguel.id, userTwoId: testUser.id },
        { userOneId: testUser.id, userTwoId: miguel.id },
      ],
    },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        id: uuidv4(),
        userOneId: miguel.id,
        userTwoId: testUser.id,
        updatedAt: new Date(),
      },
    });
  }

  const existingMessage = await prisma.chatMessage.findFirst({
    where: { conversationId: conversation.id, senderId: testUser.id, text: greeting },
  });
  if (!existingMessage) {
    const message = await prisma.chatMessage.create({
      data: {
        id: uuidv4(),
        conversationId: conversation.id,
        senderId: testUser.id,
        text: greeting,
        type: 'text',
        status: 'sent',
      },
    });
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastMessageId: message.id, updatedAt: new Date() },
    });
  }

  return conversation.id;
}

async function main() {
  const miguelAuth = await admin.auth().getUserByEmail('miguelangelvalenciacastano@gmail.com');
  const miguel = await prisma.user.upsert({
    where: { id: miguelAuth.uid },
    update: { email: miguelAuth.email, name: miguelAuth.displayName || 'Miguel Angel Valencia' },
    create: {
      id: miguelAuth.uid,
      email: miguelAuth.email,
      name: miguelAuth.displayName || 'Miguel Angel Valencia',
      avatarUrl: miguelAuth.photoURL || '',
    },
  });

  for (const data of testUsers) {
    const authUser = await getOrCreateFirebaseUser(data);
    const user = await prisma.user.upsert({
      where: { id: authUser.uid },
      update: {
        email: data.email,
        name: data.name,
        bio: data.bio,
        location: data.location,
        avatarUrl: data.avatarUrl,
      },
      create: {
        id: authUser.uid,
        email: data.email,
        name: data.name,
        bio: data.bio,
        location: data.location,
        avatarUrl: data.avatarUrl,
      },
    });
    const conversationId = await ensureConversation(miguel, user, data.greeting);
    console.log(`${data.email} | uid=${user.id} | conversación=${conversationId}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await admin.app().delete();
  });
