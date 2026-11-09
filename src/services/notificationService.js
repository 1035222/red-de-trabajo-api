const { v4: uuidv4 } = require('uuid');
const prisma = require('../config/database');
const getFirebaseAdmin = require('../config/firebase');

async function notifyUser({ userId, title, body, data = {} }) {
  try {
    const notification = await prisma.notification.create({
      data: {
        id: uuidv4(),
        userId,
        title,
        body,
        data: Object.keys(data).length > 0 ? data : undefined,
      },
    });

    const registrations = await prisma.fcmToken.findMany({
      where: { userId },
      select: { token: true },
    });

    if (registrations.length === 0) return notification;

    const messageData = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, String(value)]),
    );
    const result = await getFirebaseAdmin().messaging().sendEachForMulticast({
      tokens: registrations.map(({ token }) => token),
      notification: { title, body },
      android: {
        notification: {
          channelId: 'red_de_trabajo_notifications',
          sound: 'default',
        },
      },
      apns: {
        payload: {
          aps: { sound: 'default' },
        },
      },
      data: messageData,
    });

    const invalidTokens = result.responses
      .map((response, index) => ({ response, token: registrations[index].token }))
      .filter(({ response }) =>
        ['messaging/invalid-registration-token', 'messaging/registration-token-not-registered']
          .includes(response.error?.code),
      )
      .map(({ token }) => token);

    if (invalidTokens.length > 0) {
      await prisma.fcmToken.deleteMany({ where: { token: { in: invalidTokens } } });
    }

    if (result.failureCount > invalidTokens.length) {
      console.error(`FCM could not deliver ${result.failureCount} notification(s) to user ${userId}`);
    }

    return notification;
  } catch (error) {
    console.error(`Could not create or send notification to user ${userId}:`, error);
    return null;
  }
}

module.exports = { notifyUser };
