import React from 'react';
import { Link } from 'react-router-dom';
import Button from '@common/Button';
import Table from '@common/Table';
import PageHeader from '@common/PageHeader';
import Modal from '@common/Modal';
import Tooltip from '@common/Tooltip';
import Banner from '@common/Banners/Banner';
import { EOS_LOADING_ANIMATED } from 'eos-icons-react';

const USER_CREATE_ROUTE = '/users/new';

function Users({
  handleDeleteUser = () => {},
  navigate = () => {},
  setModalOpen = () => {},
  setDeleteUserId = () => {},
  deleteUserId = 0,
  modalOpen = false,
  users = [],
  loading = false,
}) {
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
                  <Banner type="warning">
                    <span className="text-sm">
                      This Action cannot be undone
                    </span>
                  </Banner>
                  <span className="my-1  text-gray-500">
                    Are you sure you want to delete the following user account?
                  </span>
                  <span className="my-1 mb-4 text-gray-600">
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
        </div>
      </div>
      {loading ? (
        <div className="flex flex-col items-center justify-center w-full">
          <EOS_LOADING_ANIMATED
            size="xxl"
            className="inline align-bottom fill-green-400"
          />
          Loading...
        </div>
      ) : (
        <Table config={usersTableConfig} data={users} />
      )}
    </div>
  );
}

export default Users;
