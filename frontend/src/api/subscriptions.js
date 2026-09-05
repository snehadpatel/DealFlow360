import apiClient from './client';

export const getSubscriptionPlans = () => apiClient.get('/subscriptions/plans');
export const calculateBillingSchedule = (payload) => apiClient.post('/subscriptions/calculate-schedule', payload);
export const updateProration = (payload) => apiClient.post('/subscriptions/prorate', payload);
