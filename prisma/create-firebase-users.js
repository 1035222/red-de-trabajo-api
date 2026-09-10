const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function createUsers() {
  const users = [
    {
      email: 'miguelangelvalenciacastano@gmail.com',
      password: 'Colombia*.1994',
      displayName: 'Miguel Angel Valencia',
    },
    {
      email: 'zabalapreciado@gmail.com',
      password: '123456',
      displayName: 'Usuario Zabalapreciado',
    },
  ];

  for (const userData of users) {
    try {
      const existing = await admin.auth().getUserByEmail(userData.email).catch(() => null);
      if (existing) {
        const updated = await admin.auth().updateUser(existing.uid, {
          password: userData.password,
          displayName: userData.displayName,
        });
        console.log('Usuario actualizado en Firebase Auth:', updated.email, updated.uid);
      } else {
        const userRecord = await admin.auth().createUser({
          email: userData.email,
          password: userData.password,
          displayName: userData.displayName,
          emailVerified: false,
        });
        console.log('Usuario creado en Firebase Auth:', userRecord.email, userRecord.uid);
      }
    } catch (error) {
      console.error('Error procesando usuario', userData.email, error);
    }
  }

  await admin.app().delete();
}

createUsers();
