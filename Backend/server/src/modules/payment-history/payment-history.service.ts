import { getPaymentHistoryRepo, deletePaymentHistoryRepo } from "./payment-history.repository";

export const getPaymentHistoryService = () => getPaymentHistoryRepo();
export const deletePaymentHistoryService = (ids: string[]) => deletePaymentHistoryRepo(ids);
