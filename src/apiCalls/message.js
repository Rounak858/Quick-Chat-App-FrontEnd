import { axiosInstance,url } from ".";

export const createNewMessages = async (message) => {
    try{
        const response = await axiosInstance.post(url +  'api/message/new-message',message)
        return response.data;
    } catch (error) {
        return error;
    }
}

export const getAllMessages = async (chatID) => {
    try{
        const response = await axiosInstance.get(url + `api/message/get-all-messages/${chatID}`)
        return response.data;
    } catch (error) {
        return error;
    }
}