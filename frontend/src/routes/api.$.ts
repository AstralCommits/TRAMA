import { apiError, withApi } from '@/utils/api.server';

const notFound = withApi(async () => apiError(404, 'Route not found'));

export const loader = notFound;
export const action = notFound;
