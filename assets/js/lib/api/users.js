import { networkClient } from '@lib/network';

export const listUsers = () => networkClient.get('/users');

export const deleteUser = (userId) => networkClient.delete(`/users/${userId}`);
