import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listUsers, deleteUser } from '@lib/api/users';

import { toast } from 'react-hot-toast';

import Users from './Users';

export const SUCCESS_DELETE_MESSAGE = 'User deleted successfully';
export const ERROR_DELETE_MESSAGE = 'An error occurred: User not found';
export const ERROR_FETCH_MESSAGE = 'An error occurred: Fetching users failed';

function UsersPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const fetchUsers = () => {
    setLoading(true);
    listUsers()
      .then((response) => {
        setUsers(response.data);
      })
      .catch((_error) => {
        setError(ERROR_FETCH_MESSAGE);
        setUsers([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const onDeleteUser = (userID) => {
    deleteUser(userID)
      .then(() => {
        toast.success(SUCCESS_DELETE_MESSAGE);
      })
      .catch((_error) => {
        setError(ERROR_DELETE_MESSAGE);
      })
      .finally(() => {
        fetchUsers();
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (error) {
      toast.error(error);
      setError(null);
    }
  }, [error]);

  return (
    <Users
      onDeleteUser={onDeleteUser}
      navigate={navigate}
      users={users}
      loading={loading}
    />
  );
}

export default UsersPage;
