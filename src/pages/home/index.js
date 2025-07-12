import Header from './components/header';
import Sidebar from './components/sidebar';
import ChatArea from './components/chat';
import './style.css';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:6010');
function Home() {
    const { selectedChat, user } = useSelector(state => state.userReducer);
    const [onlineUsers, setOnlineUsers] = useState([]);

    useEffect(() => {
        if (user) {
            // Join a room for the user and emit a login event
            socket.emit('join-room', user._id);
            socket.emit('user-login', user._id);
            
            // Listen to changes in online users list from the server
            socket.on('online-users', (users) => {
                setOnlineUsers(users);
            });
        }
        return () => {
            socket.off('online-users');
        };
    }, [user]);

    return (
        <div>
            <Header socket={socket} />
            <div className="main-content">
                {/* Pass onlineUsers to Sidebar */}
                <Sidebar socket={socket} onlineUsers={onlineUsers} />
                {selectedChat && <ChatArea socket={socket} />}
            </div>
        </div>
    );
}

export default Home;
