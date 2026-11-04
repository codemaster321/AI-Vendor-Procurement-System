import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Attach the JWT to every request. (Setting axios.defaults in AuthContext does not
// reach this instance — axios.create() copies defaults at creation time.)
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Expired / invalid session: clear it and send the user to login
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (!['/login', '/signup'].includes(window.location.pathname)) {
                window.location.assign('/login');
            }
        }
        return Promise.reject(error);
    }
);

// RFP APIs
export const createRFP = (data) => api.post('/rfps', data);
export const getAllRFPs = () => api.get('/rfps');
export const getRFPById = (id) => api.get(`/rfps/${id}`);
export const sendRFPToVendors = (data) => api.post('/rfps/send', data);
export const updateRFP = (id, data) => api.put(`/rfps/${id}`, data);
export const deleteRFP = (id) => api.delete(`/rfps/${id}`);

// Vendor APIs
export const createVendor = (data) => api.post('/vendors', data);
export const getAllVendors = () => api.get('/vendors');
export const getVendorById = (id) => api.get(`/vendors/${id}`);
export const updateVendor = (id, data) => api.put(`/vendors/${id}`, data);
export const deleteVendor = (id) => api.delete(`/vendors/${id}`);

// Proposal APIs
export const createProposal = (data) => api.post('/proposals', data);
export const getProposalsByRFP = (rfpId) => api.get(`/proposals/rfp/${rfpId}`);
export const compareProposals = (rfpId) => api.get(`/proposals/compare/${rfpId}`);
export const updateProposal = (id, data) => api.put(`/proposals/${id}`, data);
export const deleteProposal = (id) => api.delete(`/proposals/${id}`);

export default api;
