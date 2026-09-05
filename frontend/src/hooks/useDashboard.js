import { useQuery } from '@tanstack/react-query';
import * as dashboardApi from '../api/dashboard';

export const useDealHealthStats = () => {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: dashboardApi.getDealHealthStats,
    refetchInterval: 1000 * 60,
  });
};
