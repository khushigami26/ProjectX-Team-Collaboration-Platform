import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

API.interceptors.request.use((req) => {
    const userInfo = localStorage.getItem('userInfo')
        ? JSON.parse(localStorage.getItem('userInfo'))
        : null;

    if (userInfo && userInfo.token) {
        req.headers.Authorization = `Bearer ${userInfo.token}`;
    }
    return req;
});

export default API;
