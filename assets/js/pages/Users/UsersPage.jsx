import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listUsers, deleteUser } from '@lib/api/users';

import { toast } from 'react-hot-toast';

import Users from './Users';

const successDeleteMessage = 'User deleted successfully';
const errorLoadingMessage = 'An error occurred during loading users';
const errorDeletingMessage = 'An error occurred during deleting user';

function UsersPage() {
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState([]);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const fetchUsers = () => {
    setLoading(true);
    listUsers()
      .then((response) => {
        setUserData(response.data);
      })
      .catch((_error) => {
        setError(errorLoadingMessage);
        setUserData([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const onDeleteUser = (userId) => {
    deleteUser(userId)
      .then(() => {
        fetchUsers();
        toast.success(successDeleteMessage);
      })
      .catch((_error) => {
        setError(errorDeletingMessage);
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
      users={userData}
      loading={loading}
    />
  );
}

export default UsersPage;
