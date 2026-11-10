import { apiError, withApi } from '@/lib/api.server';

const notFound = withApi(async () => apiError(404, 'Route not found'));

export const loader = notFound;
export const action = notFound;
