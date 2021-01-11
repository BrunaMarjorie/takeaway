import axios from 'axios';

const api = axios.create({
    //baseURL: 'https://radiant-island-78141.herokuapp.com/'
    baseURL: 'http://localhost:3001'
});


export default api;