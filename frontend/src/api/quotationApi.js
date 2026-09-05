import apiClient from './client';

export const getQuotationById = async (id) => {
  try {
    const res = await apiClient.get(`/quotes/${id}`);
    return res;
  } catch (err) {
    console.error(`Failed to fetch quote ${id} from DB:`, err);
    throw err;
  }
};

export const acceptQuotation = async (quotationId) => {
  try {
    const res = await apiClient.post(`/quotes/${quotationId}/confirm`);
    return res;
  } catch (err) {
    console.error(`Failed to accept quotation ${quotationId} in DB:`, err);
    throw err;
  }
};
