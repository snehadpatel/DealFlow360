import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as approvalsApi from '../api/approvals';

export const usePendingApprovals = () => {
  return useQuery({
    queryKey: ['approvals', 'pending'],
    queryFn: approvalsApi.getPendingApprovals,
  });
};

export const useApproveQuote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ approvalId, payload }) => approvalsApi.approveQuote(approvalId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    },
  });
};
