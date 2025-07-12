import axios from "axios";

export const url = "https://quick-chat-app-backend-ccid.onrender.com"
// export const url = "http://localhost:6010"

// "proxy": "http://localhost:6010"
export const axiosInstance = axios.create({
    headers: {
        authorization: `Bearer ${localStorage.getItem('token')}`
    }
});
