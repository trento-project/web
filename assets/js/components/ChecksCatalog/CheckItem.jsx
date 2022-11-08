import React from 'react';

import { Disclosure, Transition } from '@headlessui/react';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const CheckItem = ({ checkID, premium = false, description, remediation }) => {
  return (
    <li>
      <Disclosure>
        <Disclosure.Button
          as="div"
          className="flex justify-between w-full cursor-pointer hover:bg-gray-100"
        >
          <div className="check-row px-4 py-4 sm:px-6">
            <div className="flex items-center">
              <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                {checkID}
              </p>
              {premium > 0 && (
                <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  Premium
                </p>
              )}
            </div>
            <div className="mt-2 sm:flex sm:justify-between">
              <div className="sm:flex">
                <ReactMarkdown
                  className="markdown text-sm"
                  remarkPlugins={[remarkGfm]}
                >
                  {description}
                </ReactMarkdown>
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
          <Disclosure.Panel className="check-panel border-none">
            <div className="px-8 py-4 sm:px-8">
              <div className="px-4 py-4 sm:px-4 bg-slate-100 rounded">
                <ReactMarkdown className="markdown" remarkPlugins={[remarkGfm]}>
                  {remediation}
                </ReactMarkdown>
              </div>
            </div>
          </Disclosure.Panel>
        </Transition>
      </Disclosure>
    </li>
  );
};

export default CheckItem;
