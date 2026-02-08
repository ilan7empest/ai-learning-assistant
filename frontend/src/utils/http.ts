import axios from 'axios';

const httpAPI = axios.create({
    baseURL: 'http://localhost:5001/api',
    timeout: 80000,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

// Add a request interceptor
httpAPI.interceptors.request.use(
    (config) => {
        // You can add authorization tokens or other headers here
        const accessToken = localStorage.getItem('token');
        if (accessToken) {
            config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor
httpAPI.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle global errors here
        if (error.response) {
            // Server responded with a status other than 2xx
            console.error('HTTP Error:', error.response.status, error.response.data);
        } else if (error.request) {
            // Request was made but no response received
            console.error('No response received:', error.request);
        } else {
            // Something happened in setting up the request
            console.error('Error setting up request:', error.message);
        }
        return Promise.reject(error);
    }
);

export default httpAPI;