const BASE_URL = 'http://localhost:9000/'; 

export const getApiUrl = (endpoint) => `${BASE_URL}${endpoint}`;

export const GENERATECOMMETS = getApiUrl('generate-comments');
export const SENDEMAIL = getApiUrl('send-email');