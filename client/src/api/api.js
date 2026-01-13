import axios from "axios";

// Axios instance bana rahe hain jo backend se connect karega
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL, 
  withCredentials: true, // ye URL tu .env me likh chuka hai
});

export default api;