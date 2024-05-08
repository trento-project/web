import React from 'react';
import { Menu } from '@headlessui/react';
import { Link } from 'react-router-dom';

import { EOS_ACCOUNT_CIRCLE_OUTLINED } from 'eos-icons-react';

function ProfileMenu({ username, email, logout }) {
  return (
    <Menu as="div" className="relative inline-block text-left z-10">
      <Menu.Button as="button" className="group">
        <span className="flex items-center">
          <EOS_ACCOUNT_CIRCLE_OUTLINED
            size="24"
            color="currentColor"
            className="text-gray-600 group-hover:text-gray-400"
          />
          <span className="text-gray-600 ml-2 group-hover:text-gray-400">
            {username}
          </span>
          <svg
            className="ml-2 h-5 w-5 group-hover:text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </Menu.Button>

      <Menu.Items
        as="div"
        className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
      >
        <Menu.Item>
          <span className="text-gray-700 block px-4 py-2 text-sm border-b border-gray-300">
            <span className="block font-bold">{username}</span>
            <span className="block">{email}</span>
          </span>
        </Menu.Item>
        <Menu.Item>
          <Link
            to="/profile"
            className="text-gray-700 hover:bg-gray-100 block px-4 py-4 text-sm"
          >
            Profile
          </Link>
        </Menu.Item>
        <Menu.Item>
          <button
            type="button"
            onClick={logout}
            className="w-full text-left text-gray-700 hover:bg-gray-100 block px-4 py-4 text-sm"
          >
            Sign out
          </button>
        </Menu.Item>
      </Menu.Items>
    </Menu>
  );
}

export default ProfileMenu;
