import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as quotesApi from '../api/quotes';

export const useQuotes = () => {
  return useQuery({
    queryKey: ['quotes'],
    queryFn: quotesApi.getQuotes,
  });
};

export const useQuoteDetails = (quoteId) => {
  return useQuery({
    queryKey: ['quote', quoteId],
    queryFn: () => quotesApi.getQuoteById(quoteId),
    enabled: !!quoteId,
  });
};

export const useCreateQuote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: quotesApi.createQuote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    },
  });
};
