import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

import {
  EOS_HOME_OUTLINED,
  EOS_VIRTUAL_HOST_MANAGER,
  EOS_CLUSTER_ROLE,
  EOS_INFO,
  EOS_SYSTEM_GROUP,
  EOS_STORAGE,
  EOS_LIST,
} from 'eos-icons-react';

import TrentoLogo from '../../../static/trento-logo-stacked.svg';
import HammeringStefano from '../../../static/hammering_stefano.png';

const navigation = [
  { name: 'Dashboard', href: '/', icon: EOS_HOME_OUTLINED },
  {
    name: 'Hosts',
    href: '/hosts',
    icon: EOS_VIRTUAL_HOST_MANAGER,
  },
  {
    name: 'Clusters',
    href: '/clusters',
    icon: EOS_CLUSTER_ROLE,
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
    icon: EOS_LIST
  },
  { name: 'About', href: '/about', icon: EOS_INFO },
];

const Layout = () => {
  const { pathname } = useLocation();
  const isCurrentRoute = (route) => pathname === route;

  return (
    <main className="bg-gray-100 dark:bg-gray-800 h-screen overflow-hidden relative">
      <div className="flex items-start justify-between">
        <div className="h-screen hidden lg:block shadow-lg relative w-80">
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
                      className={`w-full text-gray-800 dark:text-white flex items-center pl-6 p-2 my-2 transition-colors duration-200 justify-start ${
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
            <div className="block lg:hidden ml-6">
              <button className="flex p-2 items-center rounded-full bg-white shadow text-gray-500 text-md">
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
            <div className="relative z-20 flex flex-col justify-end h-full px-3 md:w-full">
              <div className="relative p-1 flex items-center w-full space-x-4 justify-end">
                <button className="flex p-2 items-center rounded-full text-gray-400 hover:text-gray-700 bg-white shadow text-md">
                  <svg
                    width="20"
                    height="20"
                    className=""
                    fill="currentColor"
                    viewBox="0 0 1792 1792"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M1520 1216q0-40-28-68l-208-208q-28-28-68-28-42 0-72 32 3 3 19 18.5t21.5 21.5 15 19 13 25.5 3.5 27.5q0 40-28 68t-68 28q-15 0-27.5-3.5t-25.5-13-19-15-21.5-21.5-18.5-19q-33 31-33 73 0 40 28 68l206 207q27 27 68 27 40 0 68-26l147-146q28-28 28-67zm-703-705q0-40-28-68l-206-207q-28-28-68-28-39 0-68 27l-147 146q-28 28-28 67 0 40 28 68l208 208q27 27 68 27 42 0 72-31-3-3-19-18.5t-21.5-21.5-15-19-13-25.5-3.5-27.5q0-40 28-68t68-28q15 0 27.5 3.5t25.5 13 19 15 21.5 21.5 18.5 19q33-31 33-73zm895 705q0 120-85 203l-147 146q-83 83-203 83-121 0-204-85l-206-207q-83-83-83-203 0-123 88-209l-88-88q-86 88-208 88-120 0-204-84l-208-208q-84-84-84-204t85-203l147-146q83-83 203-83 121 0 204 85l206 207q83 83 83 203 0 123-88 209l88 88q86-88 208-88 120 0 204 84l208 208q84 84 84 204z"></path>
                  </svg>
                </button>
                <button className="flex p-2 items-center rounded-full bg-white shadow text-gray-400 hover:text-gray-700 text-md">
                  <svg
                    width="20"
                    height="20"
                    className="text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 1792 1792"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M912 1696q0-16-16-16-59 0-101.5-42.5t-42.5-101.5q0-16-16-16t-16 16q0 73 51.5 124.5t124.5 51.5q16 0 16-16zm816-288q0 52-38 90t-90 38h-448q0 106-75 181t-181 75-181-75-75-181h-448q-52 0-90-38t-38-90q50-42 91-88t85-119.5 74.5-158.5 50-206 19.5-260q0-152 117-282.5t307-158.5q-8-19-8-39 0-40 28-68t68-28 68 28 28 68q0 20-8 39 190 28 307 158.5t117 282.5q0 139 19.5 260t50 206 74.5 158.5 85 119.5 91 88z"></path>
                  </svg>
                </button>
                <span className="w-1 h-8 rounded-lg bg-gray-200"></span>
                <a href="#" className="block relative">
                  <img
                    src={HammeringStefano}
                    className="mx-auto object-cover rounded-full h-10 w-10 "
                  />
                </a>
                <button className="flex items-center text-gray-500 dark:text-white text-md">
                  Hammering Stefano
                  <svg
                    width="20"
                    height="20"
                    className="ml-2 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 1792 1792"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M1408 704q0 26-19 45l-448 448q-19 19-45 19t-45-19l-448-448q-19-19-19-45t19-45 45-19h896q26 0 45 19t19 45z"></path>
                  </svg>
                </button>
              </div>
            </div>
          </header>
          <div className="overflow-auto h-screen pb-24 px-4 md:px-6">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                <div className="py-4">
                  <Outlet />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Layout;
