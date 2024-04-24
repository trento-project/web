import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import { listUsers, deleteUser } from '@lib/api/users';
import { format, parseISO } from 'date-fns';

import Button from '@common/Button';
import Table from '@common/Table';
import PageHeader from '@common/PageHeader';
import Modal from '@common/Modal';
import Tooltip from '@common/Tooltip';

const USER_CREATE_ROUTE = '/users/new';

function Users() {
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [userData, setUserData] = useState([]);
  const [userUpdateTrigger, setUserUpdateTrigger] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const allUsers = await listUsers();
        const preparedListOfUsers = allUsers.data.map(
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

        setUserData(preparedListOfUsers);
      } catch (error) {
        toast.error(`An error occurred during loading users`);
        setUserData([]);
      }
    };

    fetchUsers();
    setUserUpdateTrigger(false);
  }, [userUpdateTrigger]);

  const handleDeleteUser = async (userId) => {
    try {
      await deleteUser(userId);
      setUserUpdateTrigger(true);
    } catch (error) {
      toast.error(`An error occurred during deleting user`);
    }
  };

  const usersTableConfig = {
    pagination: true,
    usePadding: false,
    columns: [
      {
        title: 'Username',
        key: 'username',
        render: (content, item) => (
          <Link
            className="text-jungle-green-500 hover:opacity-75"
            to={`/users/${item.id}/edit`}
          >
            {content}
          </Link>
        ),
      },
      {
        title: 'Full Name',
        key: 'fullname',
      },
      {
        title: 'Email',
        key: 'email',
      },
      {
        title: 'Status',
        key: 'enabled',
      },
      {
        title: 'Created',
        key: 'created',
      },

      {
        title: 'Actions',
        key: 'actions',
        render: (content, item) => (
          <>
            {item.id !== 1 ? (
              <Button
                type="danger-no-border"
                onClick={() => {
                  setModalOpen(true);
                  setDeleteUserId(item.id);
                }}
              >
                Delete
              </Button>
            ) : (
              <Tooltip content="Admin user can not be deleted">
                <Button type="danger-op-50-no-border">Delete</Button>
              </Tooltip>
            )}

            {modalOpen && deleteUserId === item.id && (
              <Modal
                open={modalOpen}
                className="!w-3/4 !max-w-3xl"
                onClose={() => setModalOpen(false)}
                title="Delete User"
              >
                <div className="flex flex-col my-2">
                  <span className="my-1 mb-4 text-gray-500">
                    Are you sure you want to delete the following user account?
                  </span>
                  <span className="my-1 mb-4 text-gray-500">
                    {' '}
                    {item.username}
                  </span>

                  <div className="w-1/6 h-4/5 flex">
                    <Button
                      type="danger-bold"
                      className=" mr-4"
                      onClick={() => handleDeleteUser(deleteUserId)}
                    >
                      Delete
                    </Button>

                    <Button
                      type="primary-white"
                      className="w-1/6"
                      onClick={() => setModalOpen(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </Modal>
            )}
          </>
        ),
      },
    ],
  };

  return (
    <div className="flex flex-wrap">
      <div className="flex w-1/2 h-auto overflow-hidden overflow-ellipsis break-words">
        <PageHeader className="font-bold">Users</PageHeader>
      </div>
      <div className="flex w-1/2 justify-end">
        <div className="flex w-fit whitespace-nowrap">
          <Button
            className="inline-block mx-1 border-green-500 border"
            size="small"
            onClick={() => navigate(USER_CREATE_ROUTE)}
          >
            Create User
          </Button>
        </div>{' '}
      </div>
      <Table config={usersTableConfig} data={userData} />
    </div>
  );
}

export default Users;
