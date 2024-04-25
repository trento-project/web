import { networkClient } from '@lib/network';

export const listUsers = () => networkClient.get('/users');

export const deleteUser = (userID) => networkClient.delete(`/users/${userID}`);
