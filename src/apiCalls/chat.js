import {axiosInstance,url} from './index'

export const getAllChats = async () => {
    try{
        const response = await axiosInstance.get(url + '/api/chat/get-all-chats');
        return response.data;
    } catch(error) {
        return error;
    }
} 
export const CreateNewChat = async (members) => {
    try{
        const response = await axiosInstance.post(url + 'api/chat/create-new-chat',{members});
        return response.data;
    } catch(error) {
        return error;
    }
}
export const ClearUnreadMessageCount = async (chatId) => {
    try{
        const response = await axiosInstance.post(url + 'api/chat/clear-unread-message',{chatID: chatId});
        return response.data;
    } catch(error) {
        return error;
    }
} 

// export default getAllChats;
