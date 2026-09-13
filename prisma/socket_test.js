/**
 * socket_test.js
 * Test script for Socket.io chat functionality
 * Tests: connect, join room, send message, receive broadcast
 */
const io = require('socket.io-client');

const CONV_ID = '1e59b0bc-7b4d-40ad-9064-0638482411c7';
const BASE_URL = 'http://localhost:3000';

console.log('=== Socket.io Chat Test ===\n');

// User 1 (simulates Carlos)
const user1 = io(BASE_URL, {
  transports: ['websocket'],
  auth: { userId: 'test_8715c50f', token: '' },
});

// User 2 (simulates Ana)
const user2 = io(BASE_URL, {
  transports: ['websocket'],
  auth: { userId: 'test_6bef90f9', token: '' },
});

let messageReceived = false;

user1.on('connect', () => {
  console.log('[User1] Conectado');
  user1.emit('join', { conversationId: CONV_ID });
  console.log('[User1] Unido a conversación');
});

user2.on('connect', () => {
  console.log('[User2] Conectado');
  user2.emit('join', { conversationId: CONV_ID });
  console.log('[User2] Unido a conversación');

  // Listen for messages
  user2.on('message', (data) => {
    console.log(`[User2] Mensaje recibido: ${JSON.stringify(data)}`);
    messageReceived = true;
    console.log('\n=== RESULTADO ===');
    console.log('✅ Socket.io: mensaje en tiempo real recibido correctamente');
    user1.disconnect();
    user2.disconnect();
    process.exit(0);
  });

  // Wait for join to complete, then send
  setTimeout(() => {
    console.log('[User1] Enviando mensaje...');
    user1.emit('message', {
      conversationId: CONV_ID,
      text: '¡Hola Ana! Este es un mensaje de prueba vía Socket.io',
      type: 'text',
    });
  }, 1000);
});

user1.on('disconnect', () => console.log('[User1] Desconectado'));
user2.on('disconnect', () => console.log('[User2] Desconectado'));

user1.on('connect_error', (err) => console.log('[User1] Error de conexión:', err.message));
user2.on('connect_error', (err) => console.log('[User2] Error de conexión:', err.message));

// Timeout
setTimeout(() => {
  if (!messageReceived) {
    console.log('\n=== RESULTADO ===');
    console.log('❌ Socket.io: NO se recibió el mensaje en tiempo real');
    user1.disconnect();
    user2.disconnect();
    process.exit(1);
  }
}, 5000);
