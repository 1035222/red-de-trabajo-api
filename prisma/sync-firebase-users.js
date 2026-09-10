const admin = require('firebase-admin');
const { PrismaClient } = require('@prisma/client');
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const prisma = new PrismaClient();

async function syncUsers() {
  const users = [
    { email: 'miguelangelvalenciacastano@gmail.com', name: 'Miguel Angel Valencia', location: 'Colombia' },
    { email: 'zabalapreciado@gmail.com', name: 'Usuario Zabalapreciado', location: '' },
  ];

  for (const userData of users) {
    try {
      const firebaseUser = await admin.auth().getUserByEmail(userData.email);
      await prisma.user.upsert({
        where: { id: firebaseUser.uid },
        update: {
          email: userData.email,
          name: userData.name || userData.email.split('@')[0],
          avatarUrl: firebaseUser.photoURL || '',
        },
        create: {
          id: firebaseUser.uid,
          email: userData.email,
          name: userData.name || userData.email.split('@')[0],
          avatarUrl: firebaseUser.photoURL || '',
          location: userData.location || '',
          bio: 'Usuario sincronizado desde Firebase Auth',
        },
      });
      console.log('Usuario sincronizado:', userData.email, firebaseUser.uid);
    } catch (error) {
      console.error('Error sincronizando usuario', userData.email, error);
    }
  }

  await prisma.$disconnect();
  await admin.app().delete();
}

syncUsers();
