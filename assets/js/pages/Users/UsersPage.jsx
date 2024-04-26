import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listUsers, deleteUser } from '@lib/api/users';

import { toast } from 'react-hot-toast';

import Users from './Users';

const SUCCESS_DELETE_MESSAGE = 'User deleted successfully';
const ERROR_LOADING_MESSAGE = 'An error occurred while loading users';
const ERROR_DELETING_MESSAGE = 'An error occurred while deleting user';

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
        setError(ERROR_LOADING_MESSAGE);
        setUsers([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const onDeleteUser = (userID) => {
    deleteUser(userID)
      .then(() => {
        fetchUsers();
        toast.success(SUCCESS_DELETE_MESSAGE);
      })
      .catch((_error) => {
        setError(ERROR_DELETING_MESSAGE);
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
