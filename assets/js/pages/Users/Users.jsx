import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { noop } from 'lodash';
import { format, parseISO } from 'date-fns';

import { isAdmin } from '@lib/model/users';

import Banner from '@common/Banners/Banner';
import Button from '@common/Button';
import Modal from '@common/Modal';
import PageHeader from '@common/PageHeader';
import Table from '@common/Table';
import Tooltip from '@common/Tooltip';

const defaultUsers = [];

function Users({
  onDeleteUser = noop,
  navigate = noop,
  users = defaultUsers,
  loading = false,
  singleSignOnEnabled = false,
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [user, setUser] = useState(null);

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
        render: (content, item) => (
          <span>{item.enabled ? 'Enabled' : 'Disabled'}</span>
        ),
      },
      {
        title: 'Created',
        key: 'created_at',
        render: (content, item) => (
          <span>{format(parseISO(item.created_at), 'MMMM dd, yyyy')}</span>
        ),
      },
      {
        title: 'Actions',
        key: 'actions',
        render: (content, item) => (
          <Button
            className="text-red-500 text-left w-auto"
            size="small"
            type="transparent"
            disabled={isAdmin(item)}
            onClick={() => {
              setModalOpen(true);
              setUser(item);
            }}
          >
            <Tooltip
              content="Admin user cannot be deleted"
              isEnabled={isAdmin(item)}
            >
              Delete
            </Tooltip>
          </Button>
        ),
      },
    ],
  };

  return (
    <div className="flex flex-wrap">
      <div className="flex w-1/2 h-auto overflow-hidden overflow-ellipsis break-words">
        <PageHeader className="font-bold">Users</PageHeader>
      </div>
      {!singleSignOnEnabled && (
        <div className="flex w-1/2 justify-end">
          <div className="flex w-fit whitespace-nowrap">
            <Button
              className="inline-block mx-1"
              size="small"
              disabled={loading}
              onClick={() => navigate('/users/new')}
            >
              Create User
            </Button>
          </div>
        </div>
      )}
      <Modal
        open={modalOpen}
        className="!w-3/4 !max-w-3xl"
        onClose={() => setModalOpen(false)}
        title="Delete User"
      >
        <div className="flex flex-col my-2">
          <Banner type="warning">
            <span className="text-sm">This action cannot be undone.</span>
          </Banner>
          <span className="my-1  text-gray-500">
            Are you sure you want to delete the following user account?
          </span>

          <span className="my-1 mb-4 text-gray-600">{user?.username}</span>

          <div className="w-1/6 h-4/5 flex">
            <Button
              type="danger-bold"
              className=" mr-4"
              onClick={() => {
                onDeleteUser(user.id);
                setModalOpen(false);
                setUser(null);
              }}
            >
              Delete
            </Button>

            <Button
              type="primary-white"
              className="w-1/6"
              onClick={() => {
                setModalOpen(false);
                setUser(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      <Table
        className="pt-2"
        config={usersTableConfig}
        data={loading ? defaultUsers : users}
        emptyStateText={loading ? 'Loading...' : 'No data available'}
      />
    </div>
  );
}

export default Users;
