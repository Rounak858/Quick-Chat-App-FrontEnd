import axios from "axios";

export const url = "https://quick-chat-app-server-nirb.onrender.com"
// export const url = "http://localhost:6010"

// "proxy": "http://localhost:6010"
export const axiosInstance = axios.create({
    headers: {
        authorization: `Bearer ${localStorage.getItem('token')}`
    }
});
