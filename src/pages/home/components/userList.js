import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { CreateNewChat } from "./../../../apiCalls/chat";
import { showLoader, hideLoader } from "./../../../redux/loaderSlice"
import { seeAllChats, setSelectedChat } from "./../../../redux/userSlice"
import moment from "moment";
import { useEffect } from "react";
import store from "../../../redux/store";

function UserList({ searchKey, socket, onlineUsers }) {
    const { AllUsers, allChats, user: currentUser, selectedChat } = useSelector(state => state.userReducer)
    const dispatch = useDispatch();

    const startNewChat = async (searchedUserId) => {
        let response = null;
        try {
            dispatch(showLoader());
            response = await CreateNewChat([currentUser._id, searchedUserId]);
            dispatch(hideLoader())
            if (response.success) {
                toast.success(response.success)
                const newChat = response.data;
                const upDatedChat = [...allChats, newChat]
                dispatch(seeAllChats(upDatedChat));
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || error?.message || "Something went wrong");
            dispatch(hideLoader());
        }

    }
    const openChat = async (searchedUserId) => {
        const chat = allChats.find(chat =>
            chat.members.map(m => m._id).includes(currentUser._id) &&
            chat.members.map(m => m._id).includes(searchedUserId)
        )
        if (chat) {
            dispatch(setSelectedChat(chat));
        }
    }
    const isSelectedchat = (users) => {
        if (selectedChat) {
            return selectedChat.members.map(m => m._id).includes(users._id);
        }
    }
    const isSelectedEmail = (users) => {
        if (selectedChat) {
            return selectedChat.members.map(m => m._id).includes(users._id);
        }
        return false;
    }
    const getLastMessage = (userId) => {
        const chat = allChats.find(chat => chat.members.map(m => m._id).includes(userId));
        if (!chat || !chat.lastMessage) {
            return "";
        } else {
            const messPrefix = chat?.lastMessage?.sender === currentUser._id ? "You: " : "";
            return messPrefix + chat?.lastMessage?.text?.substring(0, 25);
        }
    }
    const getAllMessageTimeStamp = (userId) => {
        const chat = allChats.find(chat => chat.members.map(m => m._id).includes(userId));
        if (!chat || !chat.lastMessage) {
            return "";
        } else {
            return moment(chat?.lastMessage?.createdAt).format('hh.mm A');
        }
    }
    const UnreadMessageCount = (userId) => {
        const chat = allChats.find(chat => {
            const memberIds = chat.members.map(m => m._id);
            return memberIds.includes(userId) && memberIds.includes(currentUser._id);
        });
        if (!chat) {
            return ""; // ❌ Prevent access to undefined
        }
        if (chat?.unreadMessageCount > 0 &&
            chat?.lastMessage?.sender !== currentUser._id &&
            (!selectedChat || selectedChat._id !== chat._id)) {
            return <div className="unread-message-counter">{chat.unreadMessageCount}</div>;
        } else {
            return "";
        }
    }
    function formatName(user) {
        let fname = user.firstName.at(0).toUpperCase() + user.firstName.slice(1).toLowerCase();
        let lname = user.lastName.at(0).toUpperCase() + user.lastName.slice(1).toLowerCase();
        return fname + " " + lname;
    }
    function getData() {
    if (searchKey === '') {
        // When there's no search, show unique chats by user
        const seenUserIds = new Set();
        const uniqueChats = [];
        allChats.forEach(chat => {
            const user = chat.members.find(m => m._id !== currentUser._id);
            if (!seenUserIds.has(user._id)) {
                seenUserIds.add(user._id);
                uniqueChats.push(chat);
            }
        });
        return uniqueChats;
    } else {
        // When there's a search, filter AllUsers list
        return AllUsers.filter(user => {
            return (
                user.firstName.toLowerCase().includes(searchKey.toLowerCase()) ||
                user.lastName.toLowerCase().includes(searchKey.toLowerCase())
            );
        });
    }
}

    useEffect(() => {
        const handleReceivedMessage = (message) => {
            const selectedChat = store.getState().userReducer.selectedChat;
            let allChats = store.getState().userReducer.allChats;
            if (selectedChat?._id !== message.chatID) {
                const updatedChats = allChats.map(chat => {
                    if (chat._id === message.chatID) {
                        return {
                            ...chat,
                            unreadMessageCount: (chat?.unreadMessageCount || 0) + 1,
                            lastMessage: message
                        }
                    }
                    return chat;
                });
                allChats = updatedChats;
            }
            // Find the latest chat
            const latestChat = allChats.find(chat => chat._id === message.chatID);
            // Get all other chats
            const otherChats = allChats.filter(chat => chat._id !== message.chatID);
            // Create a new array latest chgat on top & then other chats
            allChats = [latestChat, ...otherChats];
            dispatch(seeAllChats(allChats));
        }
        socket.on('received-message', handleReceivedMessage);
        return () => {
            socket.off('received-message', handleReceivedMessage);
        }
    }, [socket, dispatch])

    return (
        getData()
            .map(obj => {
                let user = obj;
                if (obj.members) {
                    user = obj.members.find(m => m._id !== currentUser._id);
                }
                return <div className="user-search-filter" onClick={() => openChat(user._id)} key={user._id}>
                    <div className={isSelectedchat(user) ? "selected-user" : "filtered-user"}>
                        <div className="filter-user-display">
                            {user.profilePic &&
                                <div className="user-avatar-container">
                                    <img
                                        src={user.profilePic}
                                        alt="Profile Pic"
                                        className="user-profile-pic"
                                    />
                                    {onlineUsers.includes(user._id) && (
                                        <span className="online-indicator" />
                                    )}
                                </div>
                            }
                            {!user.profilePic &&
                                <div className="user-avatar-container">
                                    <div
                                        className={isSelectedchat(user) ? "user-selected-avatar" : "user-default-profile-pic"}>
                                        {user.firstName[0] + user.lastName[0]}
                                    </div>
                                    {onlineUsers.includes(user._id) && (
                                        <span className="online-indicator" />
                                    )}
                                </div>
                            }
                            <div className="filter-user-details">
                                <div className="user-display-name">{formatName(user)}</div>
                                {/* {onlineUsers.includes(user._id) && (
                                    <div className="user-online-text">Online</div>
                                )} */}
                                <div className={isSelectedEmail(user) ? "user-display-email" : "user-selected-display-email"}>
                                    {getLastMessage(user._id) || user.email}
                                </div>
                            </div>
                            <div>
                                {UnreadMessageCount(user._id)}
                                <div className="last-message-timestamp">{getAllMessageTimeStamp(user._id)}</div>
                            </div>
                            {!allChats.find(chat => chat.members.map(m => m._id).includes(user._id)) &&
                                <div className="user-start-chat">
                                    <button className="user-start-chat-btn"
                                        onClick={() => startNewChat(user._id)}>Start Chat</button>
                                </div>}
                        </div>
                    </div>
                </div>
            })
    )
}

export default UserList;