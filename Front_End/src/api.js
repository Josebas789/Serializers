import axios from 'axios'


const API_BASE_URL = 'http://127.0.0.1:8000/api/'

export const api = axios.create({
  baseURL: API_BASE_URL,
})

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common['Authorization']
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          const res = await api.post('token/refresh/',  {
            refresh : refreshToken
          
          });
          
          const {access} = res.data;

          localStorage.setItem('token', access);
          setAuthToken(access);

          console.log('Token refrescado')
          
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);

        }catch (refreshError) {
          console.log('Refresh token, fallido, logging out');
        }
      }
    }
    return Promise.reject(error)
  }
);