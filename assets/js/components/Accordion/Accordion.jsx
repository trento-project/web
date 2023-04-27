import React, { isValidElement } from 'react';

import { Disclosure, Transition } from '@headlessui/react';
import { EOS_KEYBOARD_ARROW_DOWN } from 'eos-icons-react';

import classNames from 'classnames';

function Accordion({
  className,
  header,
  headerClassnames,
  withHandle = true,
  withTransition = false,
  rounded = true,
  defaultOpen = false,
  children,
}) {
  const disclosurePanel = (
    <Disclosure.Panel aria-label="accordion-panel">{children}</Disclosure.Panel>
  );
  const isHeaderAnElement = isValidElement(header);
  return (
    <Disclosure
      as="div"
      defaultOpen={defaultOpen}
      className={classNames(
        'bg-white shadow overflow-hidden',
        { 'rounded-md': rounded },
        className
      )}
    >
      {({ open }) => (
        <>
          <Disclosure.Button
            aria-label="accordion-header"
            as="div"
            className={classNames(
              'cursor-pointer flex w-full justify-between border-b border-gray-200',
              headerClassnames
            )}
          >
            {isHeaderAnElement ? (
              header
            ) : (
              <div className="bg-white p-6 sm:px-6">
                <h3 className="text-lg leading-6 font-semibold text-gray-900">
                  {header}
                </h3>
              </div>
            )}

            {withHandle && (
              <div className="flex p-6" aria-label="accordion-handle">
                <EOS_KEYBOARD_ARROW_DOWN
                  className={classNames('self-center fill-gray-500', {
                    'transform rotate-180': open,
                  })}
                />
              </div>
            )}
          </Disclosure.Button>
          {withTransition ? (
            <Transition
              aria-label="accordion-transition-panel"
              enter="transition duration-100 ease-out"
              enterFrom="transform opacity-0"
              enterTo="transform opacity-100"
              leave="transition duration-100 ease-out"
              leaveFrom="transform opacity-100"
              leaveTo="transform opacity-0"
            >
              {disclosurePanel}
            </Transition>
          ) : (
            disclosurePanel
          )}
        </>
      )}
    </Disclosure>
  );
}

export default Accordion;
