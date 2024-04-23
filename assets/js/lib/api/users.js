import { networkClient } from '@lib/network';

export const listUsers = () => networkClient.get('/users');

export const createUser = (userData) => networkClient.post('/users', userData);

export const getUser = (userId) => networkClient.get(`/users/${userId}`);

export const updateUser = (userId, userData) =>
  networkClient.put(`/users/${userId}`, userData);

export const deleteUser = (userId) => networkClient.delete(`/users/${userId}`);
