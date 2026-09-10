const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function main() {
  const email = 'miguelangelvalenciacastano@gmail.com';
  const user = await admin.auth().getUserByEmail(email);
  const customToken = await admin.auth().createCustomToken(user.uid);
  console.log('UID:', user.uid);
  console.log('CustomToken:', customToken);
  await admin.app().delete();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
