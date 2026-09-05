import { useMutation } from '@tanstack/react-query';
import { getUpsellRecommendations } from '../api/ai';

export const useUpsell = () => {
  return useMutation({
    mutationFn: getUpsellRecommendations,
  });
};
