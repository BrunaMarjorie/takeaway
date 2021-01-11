import axios from 'axios';

const api = axios.create({
    baseURL: 'https://radiant-island-78141.herokuapp.com/'
});

export default api;