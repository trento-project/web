import { del, get, patch, post } from '@lib/network';

export const listUsers = () => get('/users');

export const getUser = (userID) => get(`/users/${userID}`);

export const createUser = (payload) => post('/users', payload);

export const editUser = (userID, payload) => patch(`/users/${userID}`, payload);

export const deleteUser = (userID) => del(`/users/${userID}`);
