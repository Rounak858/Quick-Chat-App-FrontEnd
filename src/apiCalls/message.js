import { axiosInstance } from ".";

export const createNewMessages = async (message) => {
    try{
        const response = await axiosInstance.post('api/message/new-message',message)
        return response.data;
    } catch (error) {
        return error;
    }
}

export const getAllMessages = async (chatID) => {
    try{
        const response = await axiosInstance.get(`api/message/get-all-messages/${chatID}`)
        return response.data;
    } catch (error) {
        return error;
    }
}