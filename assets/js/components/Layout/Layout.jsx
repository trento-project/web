import React, { useState, useCallback } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

import {
  EOS_HOME_OUTLINED,
  EOS_DESKTOP_WINDOWS,
  EOS_COLLOCATION,
  EOS_INFO,
  EOS_SYSTEM_GROUP,
  EOS_STORAGE,
  EOS_LIST,
  EOS_SETTINGS,
} from 'eos-icons-react';

import TrentoLogo from '../../../static/trento-logo-stacked.svg';

import classNames from 'classnames';

const navigation = [
  { name: 'Dashboard', href: '/', icon: EOS_HOME_OUTLINED },
  {
    name: 'Hosts',
    href: '/hosts',
    icon: EOS_DESKTOP_WINDOWS,
  },
  {
    name: 'Clusters',
    href: '/clusters',
    icon: EOS_COLLOCATION,
  },
  {
    name: 'SAP Systems',
    href: '/sap-systems',
    icon: EOS_SYSTEM_GROUP,
  },
  {
    name: 'HANA Databases',
    href: '/databases',
    icon: EOS_STORAGE,
  },
  {
    name: 'Checks catalog',
    href: '/catalog',
    icon: EOS_LIST,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: EOS_SETTINGS,
  },
  { name: 'About', href: '/about', icon: EOS_INFO },
];

const Layout = () => {
  const { pathname } = useLocation();
  const isCurrentRoute = (route) => pathname === route;
  const [isCollapsed, setCollapsed] = useState(
    localStorage.getItem('sidebar-collapsed')
  );

  const handleSidebar = useCallback(() => {
    setCollapsed(!isCollapsed);
    isCollapsed
      ? localStorage.removeItem('sidebar-collapsed')
      : localStorage.setItem('sidebar-collapsed', true);
  }, [isCollapsed]);

  const csrfToken = document.head.querySelector(
    '[name~=csrf-token][content]'
  ).content;

  return (
    <>
      <main className="bg-gray-100 dark:bg-gray-800 relative">
        <div className="flex flex-col h-screen items-start justify-between">
          <div
            className={classNames(
              'h-screen block shadow-lg fixed w-64 flex-shrink-0 z-20',
              { hidden: isCollapsed }
            )}
          >
            <div className="bg-white h-full dark:bg-gray-700">
              <div className="flex items-center justify-center pt-6">
                <div className="self-center">
                  <img className="h-24 w-auto" src={TrentoLogo} />{' '}
                </div>
              </div>
              <nav className="mt-6">
                <div>
                  {navigation.map((item, index) => {
                    return (
                      <Link
                        key={index}
                        className={`tn-menu-item w-full text-gray-800 dark:text-white flex items-center pl-6 p-2 my-2 transition-colors duration-200 justify-start ${
                          isCurrentRoute(item.href)
                            ? 'border-l-4 border-jungle-green-500'
                            : 'hover:border-l-4 hover:border-jungle-green-500'
                        }`}
                        to={item.href}
                      >
                        <span className="text-left">
                          <item.icon />
                        </span>
                        <span className="mx-2 text-sm font-normal">
                          {item.name}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </nav>
            </div>
          </div>
          <div className="flex flex-col w-full md:space-y-4">
            <header className="w-full h-16 z-40 flex items-center justify-between">
              <div
                className={classNames('block', {
                  'ml-72': !isCollapsed,
                  'ml-6': isCollapsed,
                })}
              >
                <button
                  className="flex p-2 items-center rounded-full bg-white shadow text-gray-500 text-md"
                  onClick={handleSidebar}
                >
                  <svg
                    width="20"
                    height="20"
                    className="text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 1792 1792"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M1664 1344v128q0 26-19 45t-45 19h-1408q-26 0-45-19t-19-45v-128q0-26 19-45t45-19h1408q26 0 45 19t19 45zm0-512v128q0 26-19 45t-45 19h-1408q-26 0-45-19t-19-45v-128q0-26 19-45t45-19h1408q26 0 45 19t19 45zm0-512v128q0 26-19 45t-45 19h-1408q-26 0-45-19t-19-45v-128q0-26 19-45t45-19h1408q26 0 45 19t19 45z"></path>
                  </svg>
                </button>
              </div>

              <div className="relative z-20 flex flex-col justify-end h-full px-8 md:w-full">
                <div className="relative p-5 flex items-center w-full space-x-8 justify-end mr-20">
                  <a
                    href="/session"
                    data-to="/session"
                    data-method="delete"
                    data-csrf={csrfToken}
                    className="flex text-md text-gray-500 hover:text-gray-700"
                  >
                    Sign out
                  </a>
                </div>
              </div>
            </header>
            <div
              className={classNames('pb-24 inset-x-0 bottom-0 px-4 md:px-6', {
                'ml-64': !isCollapsed,
              })}
            >
              <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                  <div className="py-4">
                    <Outlet />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <footer className="p-4 z-30 relative bottom-0 w-full bg-white shadow md:flex md:items-center md:justify-between md:p-6 dark:bg-gray-800">
            <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">
              © 2020-2022 SUSE LLC
            </span>
            <span className="flex items-center mt-3 text-sm text-gray-500 dark:text-gray-400 sm:mt-0">
              This tool is free software released under the Apache License,
              Version 2.0
            </span>
          </footer>
        </div>
      </main>
    </>
  );
};

export default Layout;
