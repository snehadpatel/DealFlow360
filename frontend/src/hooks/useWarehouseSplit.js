import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as warehousesApi from '../api/warehouses';

export const useRecommendedSplit = (quoteId) => {
  return useQuery({
    queryKey: ['warehouse-split', quoteId],
    queryFn: () => warehousesApi.getRecommendedSplit(quoteId),
    enabled: !!quoteId,
  });
};

export const useConfirmSplit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ quoteId, payload }) => warehousesApi.confirmWarehouseSplit(quoteId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouse-split'] });
    },
  });
};
