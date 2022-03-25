import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import { Disclosure, Transition } from '@headlessui/react';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import ProviderSelection from './ProviderSelection';

const ChecksCatalog = () => {
  const catalog = useSelector((state) => state.catalog.catalog);
  const providers = catalog.map((provider) => provider.provider);
  const [selected, setSelected] = useState(providers[0]);

  useEffect(() => {
    setSelected(providers[0]);
  }, [providers[0]]);

  return (
    <div>
      <ProviderSelection
        providers={providers}
        selected={selected}
        setSelected={setSelected}
      />
      {catalog
        .filter((provider) => provider.provider == selected)
        .map(({ _, groups }) =>
          groups.map(({ group, checks }) => (
            <div
              key={group.id}
              className="bg-white shadow overflow-hidden sm:rounded-md mb-8"
            >
              <div className="bg-white px-4 py-5 border-b border-gray-200 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {group}
                </h3>
              </div>
              <ul role="list" className="divide-y divide-gray-200">
                {checks.map((check) => (
                  <li key={check.id}>
                    <Disclosure>
                      <Disclosure.Button
                        as="div"
                        className="flex justify-between w-full cursor-pointer hover:bg-gray-100"
                      >
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center">
                            <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {check.id}
                            </p>
                            {check.premium > 0 && (
                              <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Premium
                              </p>
                            )}
                          </div>
                          <div className="mt-2 sm:flex sm:justify-between">
                            <div className="sm:flex">
                              <p className="flex items-center text-sm">
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm]}
                                >
                                  {check.description}
                                </ReactMarkdown>
                              </p>
                            </div>
                          </div>
                        </div>
                      </Disclosure.Button>
                      <Transition
                        enter="transition duration-100 ease-out"
                        enterFrom="transform opacity-0"
                        enterTo="transform opacity-100"
                        leave="transition duration-100 ease-out"
                        leaveFrom="transform opacity-100"
                        leaveTo="transform opacity-0"
                      >
                        <Disclosure.Panel className="border-none">
                          <div className="px-8 py-4 sm:px-8">
                            <div className="px-4 py-4 sm:px-4 bg-slate-100 rounded">
                              <ReactMarkdown
                                className="markdown"
                                remarkPlugins={[remarkGfm]}
                              >
                                {check.remediation}
                              </ReactMarkdown>
                            </div>
                          </div>
                        </Disclosure.Panel>
                      </Transition>
                    </Disclosure>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
    </div>
  );
};

export default ChecksCatalog;
