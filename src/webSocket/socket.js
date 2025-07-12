// src/socket.js
import { io } from 'socket.io-client';

const Socket = io('http://localhost:6010', {
    transports: ['websocket'],
    withCredentials: true,
});

export default Socket;
