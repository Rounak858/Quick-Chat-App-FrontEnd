import { useDispatch, useSelector } from "react-redux";
import { createNewMessages, getAllMessages } from "./../../../apiCalls/message";
import './chat.css';
import { hideLoader, showLoader } from "../../../redux/loaderSlice";
import store from "../../../redux/store";
import toast from "react-hot-toast";
import { useEffect, useState, useCallback, useRef } from "react";
import { ClearUnreadMessageCount } from "./../../../apiCalls/chat";
import moment from "moment/moment";
import { seeAllChats } from "../../../redux/userSlice";
import EmojiPicker from "emoji-picker-react";

function ChatArea({ socket }) {
    const dispatch = useDispatch();
    const { selectedChat, user, allChats } = useSelector(state => state.userReducer);
    const [message, setMessage] = useState('');
    const [allMessage, setallMessage] = useState([]);
    const selectedUser = selectedChat?.members?.find(m => m._id !== user._id);
    const chatContainerRef = useRef(null);
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef(null);
    const typingDisplayTimeoutRef = useRef(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    };
    const getAllMessage = useCallback(async (withLoader = true) => {
        if (!selectedChat?._id) return;
        try {
            if (withLoader) dispatch(showLoader());
            const response = await getAllMessages(selectedChat._id);
            if (withLoader) dispatch(hideLoader());
            if (response.success) {
                setallMessage(response.data);
            } else {
                toast.error(response.message || "Message not sent");
            }
        } catch (error) {
            dispatch(hideLoader());
            toast.error(error.message);
        }
    }, [dispatch, selectedChat]);
    const sendMessage = async (image) => {
        try {
            const messages = {
                chatID: selectedChat._id, // ✅ corrected key name
                sender: user._id,
                text: message,
                image
            };
            socket.emit('send-message', {
                ...messages,
                members: selectedChat.members.map(m => m._id),
                read: false,
                createdAt: moment().format("DD-MM-YYYY HH:mm:ss")
            })
            const response = await createNewMessages(messages);
            if (response.success) {
                setMessage("");
                setShowEmojiPicker(false);
                // await getAllMessage(false); // ❌ don’t show loader after sending
            } else {
                toast.error(response.message || "Message not sent");
            }
        } catch (error) {
            toast.error(error.message);
        }
    };
    const formatTime = (timeStamp) => {
        const now = moment();
        const diff = now.diff(moment(timeStamp), 'days');
        if (diff < 1) {
            return `Today ${moment(timeStamp).format('hh:mm A')}`;
        } else if (diff === 1) {
            return `Yesterday ${moment(timeStamp).format('hh:mm A')}`;
        } else {
            return moment(timeStamp).format('MMM D, hh:mm A');
        }
    }
    const clearUnreadMessage = useCallback(async (triggerFromSocket = false) => {
        if (!selectedChat?._id) {
            console.log("No selectedChat ID, returning.");
            return;
        }
        try {
            if (!triggerFromSocket) return dispatch(showLoader());
            socket.emit('clear-unread-message', {
                chatID: selectedChat._id,
                members: selectedChat.members.map(m => m._id)
            });
            const response = await ClearUnreadMessageCount(selectedChat._id);
            console.log("API response:", response);
            if (!triggerFromSocket) dispatch(hideLoader());
            if (response.success) {
                const updatedChats = allChats.map(chat =>
                    chat._id === selectedChat._id ? response.data : chat
                );
                dispatch(seeAllChats(updatedChats));
                setallMessage(prevMsgs =>
                    prevMsgs.map(msg => ({
                        ...msg,
                        read: true
                    }))
                );
            } else {
                toast.error(response.message || "Message not sent");
            }
        } catch (error) {
            toast.error(error.message);
        }
    }, [allChats, selectedChat, socket, dispatch]);
    const handleTyping = (e) => {
        setMessage(e.target.value);
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('user-typing', {
                chatID: selectedChat._id,
                members: selectedChat.members.map(m => m._id),
                sender: user._id
            });
        }, 500); // emit after user pauses for 500ms
    };
    useEffect(() => {
        if (selectedChat?._id) {
            // console.log("📥 Chat opened:", selectedChat._id)
            getAllMessage();
            if (selectedChat?.lastMessage?.sender !== user._id) {
                // console.log("👁 Should clear unread count now");
                clearUnreadMessage();
            } else {
                // console.log("🙅‍♂️ Skipping clearUnread — sender is you");
            }
        }
        const handleMessageCountClear = (data) => {
            const selectedChatId = store.getState().userReducer.selectedChat;
            const allchats = store.getState().userReducer.allChats;

            if (selectedChatId?._id === data.chatID) {
                // UPDATE unread count
                const updatedChats = allchats.map(chat => {
                    if (chat._id === data.chatID) {
                        return { ...chat, unreadMessageCount: 0 };
                    }
                    return chat;
                });
                dispatch(seeAllChats(updatedChats));
                // ✅ UPDATE all messages to read: true
                setallMessage(prevMsg => {
                    return prevMsg.map(msg => {
                        return { ...msg, read: true }
                    })
                }
                );
            }
        };
        const handleReceivedMessage = (data) => {
            const selectedChatId = store.getState().userReducer.selectedChat;
            if (selectedChatId === data.chatID) {
                setallMessage(prevMsg => [...prevMsg, data])
            }
            if (selectedChatId._id === data.chatID && data.sender !== user._id) {
                clearUnreadMessage(true);
            }
        }
        const handleIsTyping = (data) => {
            if (selectedChat._id === data.chatID && String(data.sender) !== String(user._id)) {
                setIsTyping(true);
                if (typingDisplayTimeoutRef.current) {
                    clearTimeout(typingDisplayTimeoutRef.current);
                }
                typingDisplayTimeoutRef.current = setTimeout(() => {
                    setIsTyping(false);
                }, 2000);
            }
        };

        socket.on('started-typing', handleIsTyping);
        socket.on('received-message', handleReceivedMessage);
        socket.on('message-count-clear', handleMessageCountClear);
        return () => {
            socket.off('received-message', handleReceivedMessage);
            socket.off('message-count-clear', handleMessageCountClear);
            socket.off('started-typing', handleIsTyping);
        }
    }, [selectedChat, getAllMessage, clearUnreadMessage, socket, user, dispatch]);

    useEffect(() => {
        scrollToBottom();
    }, [allMessage, isTyping]);
    function formatName(user) {
        let fname = user.firstName.at(0).toUpperCase() + user.firstName.slice(1).toLowerCase();
        let lname = user.lastName.at(0).toUpperCase() + user.lastName.slice(1).toLowerCase();
        return fname + " " + lname;
    }
    const sendImage = async (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            sendMessage(reader.result);
        }
    }
    return (

        <>
            {selectedChat &&
                <div className="app-chat-area">
                    <div className="app-chat-area-header">
                        {formatName(selectedUser)}
                    </div>
                    <div className="main-chat-area" ref={chatContainerRef}>
                        {allMessage.map((message, index) => {
                            const isCurrentUserSender = message.sender === user._id;
                            return <div key={message._id || index}
                                className={`message-container ${isCurrentUserSender ? 'justify-end' : 'justify-start'}`}>
                                <div className={`message-bubble ${isCurrentUserSender ? "send-message" : "received-message"}`}>
                                    <div>{message.text}</div>
                                    <div>{message.image && <img src={message.image} alt="" height="120" width="120" />}</div>
                                    <div className="message-timestamp" >
                                        {formatTime(message.createdAt)}
                                        {isCurrentUserSender && message.read &&
                                            <i
                                                className="fa fa-check-circle"
                                                aria-hidden="true"
                                                style={{ color: "green" }}>
                                            </i>
                                        }
                                    </div>
                                </div>
                            </div>
                        })}
                        {isTyping &&
                            <div
                                className="typing-indicator">
                                <i>
                                    {formatName(selectedUser)} is typing...
                                </i>
                            </div>
                        }
                    </div>
                    {showEmojiPicker &&
                        <div
                            style={{ width: '100%', display: 'flex', justifyContent: 'right', padding: '0px 20px' }}>
                            <EmojiPicker
                                style={{ width: '300px', height: "400px" }}
                                onEmojiClick={(e) => setMessage(message + e.emoji)}>
                            </EmojiPicker>
                        </div>
                    }
                    <div className="send-message-div">
                        <input
                            type="text"
                            className="send-message-input"
                            placeholder="Type a message"
                            value={message}
                            rows={1}
                            onChange={handleTyping}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" &&  !e.shiftKey) {
                                    e.preventDefault();
                                    if(message.trim()) {
                                        sendMessage();
                                    }
                                }
                            }}
                        />
                        <label for="file">
                            <i className="fa fa-picture-o send-image-btn" aria-hidden="true"></i>
                            <input
                                type="file"
                                id="file"
                                style={{ display: "none" }}
                                accept="image/jpg,image/jpeg,image/png,image/gif"
                                onChange={sendImage}
                            />
                        </label>
                        <button
                        type="button"
                            className="fa fa-smile-o send-emoji-btn"
                            aria-hidden="true"
                            onClick={() => {
                                setShowEmojiPicker(!showEmojiPicker);
                            }}
                        ></button>
                        <button
                        type="button"
                            className="fa fa-paper-plane send-message-btn"
                            aria-hidden="true"
                            onClick={() => sendMessage('')}
                        ></button>
                    </div>
                </div>
            }
        </>
    );
}
export default ChatArea;