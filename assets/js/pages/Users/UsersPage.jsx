import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listUsers, deleteUser } from '@lib/api/users';
import { format, parseISO } from 'date-fns';

import { toast } from 'react-hot-toast';

import Users from './Users';

function UsersPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [userUpdateTrigger, setUserUpdateTrigger] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState([]);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const fetchUsers = () => {
    setLoading(true);
    listUsers()
      .then((response) => {
        setUserData(response.data);
        setLoading(false);
      })
      .catch((_error) => {
        setError('An error occurred during loading users');
        setUserData([]);
        setLoading(false);
      });
  };

  const handleDeleteUser = (userId) => {
    deleteUser(userId)
      .then(() => {
        setUserUpdateTrigger(true);
      })
      .catch((_error) => {
        setError('An error occurred during deleting user');
      });
  };

  useEffect(() => {
    fetchUsers();
    setUserUpdateTrigger(false);
  }, [userUpdateTrigger]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      setError(null);
    }
  }, [error]);

  const usersTableData = userData.map(
    ({ id, username, created_at, enabled, fullname, email }) => ({
      id,
      username,
      created: format(parseISO(created_at), 'MMMM dd, yyyy'),
      actions: 'Delete',
      enabled: enabled ? 'Enabled' : 'Disabled',
      fullname,
      email,
    })
  );

  return (
    <Users
      handleDeleteUser={handleDeleteUser}
      navigate={navigate}
      setModalOpen={setModalOpen}
      setDeleteUserId={setDeleteUserId}
      deleteUserId={deleteUserId}
      modalOpen={modalOpen}
      users={usersTableData}
      loading={loading}
    />
  );
}

export default UsersPage;
