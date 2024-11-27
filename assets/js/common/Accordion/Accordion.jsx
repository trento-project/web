import React, { isValidElement } from 'react';

import {
  Disclosure,
  DisclosurePanel,
  DisclosureButton,
  Transition,
} from '@headlessui/react';
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
    <DisclosurePanel aria-label="accordion-panel">{children}</DisclosurePanel>
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
          <DisclosureButton
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
          </DisclosureButton>
          {withTransition ? (
            <Transition aria-label="accordion-transition-panel">
              <div className="transition opacity-100 duration-100 ease-out data-[closed]:opacity-0">
                {disclosurePanel}
              </div>
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
