import React, { useState, useCallback } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

import {
  EOS_HOME_OUTLINED,
  EOS_DESKTOP_WINDOWS,
  EOS_COLLOCATION,
  EOS_INFO,
  EOS_SYSTEM_GROUP,
  EOS_STORAGE,
  EOS_LIST,
  EOS_SETTINGS,
  EOS_KEYBOARD_DOUBLE_ARROW_LEFT,
  EOS_KEYBOARD_DOUBLE_ARROW_RIGHT,
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
    href: '/sap_systems',
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

  const sidebarIconColor = 'currentColor';
  const sidebarIconClassName = 'text-gray-400 hover:text-gray-300';
  const sidebarIconSize = '24';

  return (
    <>
      <main className="bg-gray-100 dark:bg-gray-800 relative">
        <div className="flex flex-col h-screen items-start justify-between">
          <div
            className={classNames(
              'h-screen block shadow-lg fixed flex-shrink-0 z-20',
              { 'w-16': isCollapsed, 'w-64': !isCollapsed }
            )}
          >
            <div
              className={classNames('block absolute mt-4', {
                'ml-64': !isCollapsed,
                'ml-16': isCollapsed,
              })}
            >
              <button
                className="flex p-2 items-center rounded-r bg-white text-gray-500 text-md"
                onClick={handleSidebar}
                title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              >
                {isCollapsed ? (
                  <EOS_KEYBOARD_DOUBLE_ARROW_RIGHT
                    size={sidebarIconSize}
                    color={sidebarIconColor}
                    className={sidebarIconClassName}
                  />
                ) : (
                  <EOS_KEYBOARD_DOUBLE_ARROW_LEFT
                    size={sidebarIconSize}
                    color={sidebarIconColor}
                    className={sidebarIconClassName}
                  />
                )}
              </button>
            </div>
            <div className="bg-white h-full dark:bg-gray-700">
              <div className="flex items-center justify-center pt-6">
                <img
                  className={classNames(
                    'h-auto transition-scale duration-100',
                    { 'w-12': isCollapsed, 'w-24': !isCollapsed }
                  )}
                  src={TrentoLogo}
                />{' '}
              </div>
              <nav className="mt-6">
                <div>
                  {navigation.map((item, index) => {
                    return (
                      <NavLink
                        key={index}
                        className={({ isActive }) =>
                          `tn-menu-item w-full text-gray-800 dark:text-white flex items-center pl-6 p-2 my-2 transition-colors duration-200 justify-start ${
                            isActive
                              ? 'pl-5 border-l-4 border-jungle-green-500'
                              : 'hover:pl-5 hover:border-l-4 hover:border-jungle-green-300'
                          }`
                        }
                        to={item.href}
                        end={item.href == '/'}
                        title={item.name}
                      >
                        <span className="text-left">
                          <item.icon />
                        </span>
                        <span
                          className={classNames('mx-2 text-sm font-normal', {
                            hidden: isCollapsed,
                          })}
                        >
                          {item.name}
                        </span>
                      </NavLink>
                    );
                  })}
                </div>
              </nav>
            </div>
          </div>
          <div className="flex flex-col w-full md:space-y-4">
            <header className="w-full h-16 flex items-center justify-between">
              <div className="relative flex flex-col justify-end h-full px-8 md:w-full">
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
                'ml-16': isCollapsed,
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
