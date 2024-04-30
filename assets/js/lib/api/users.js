import { del, get, post } from '@lib/network';

export const listUsers = () => get('/users');

export const createUser = (payload) => post('/users', payload);

export const deleteUser = (userID) => del(`/users/${userID}`);
