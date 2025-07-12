// src/socket.js
import { io } from 'socket.io-client';

const Socket = io('https://quick-chat-app-backend-ccid.onrender.com', {
    transports: ['websocket'],
    withCredentials: true,
});

export default Socket;
