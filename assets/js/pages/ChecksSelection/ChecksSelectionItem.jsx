/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';

import { EOS_SETTINGS_OUTLINED } from 'eos-icons-react';
import { Switch } from '@headlessui/react';

import classNames from 'classnames';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Pill from '@common/Pill';

import { isPermitted } from '@lib/model/users';

const defaultAbilities = [];

const CUSTOMIZATION_ALLOWED_FOR = ['all:all', 'all:check_customization'];

const isCustomizable = (abilities, customizable) =>
  isPermitted(abilities, CUSTOMIZATION_ALLOWED_FOR) && customizable;

function ChecksSelectionItem({
  checkID,
  name,
  description,
  customizable = false,
  customized = false,
  selected,
  userAbilities = defaultAbilities,
  onChange = () => {},
  onCustomize = () => {},
}) {
  return (
    <li>
      <a className="block hover:bg-gray-50">
        <div className="px-4 py-4 sm:px-6">
          <div className="flex items-center">
            <p className="text-sm font-medium">{name}</p>
            <p className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
              {checkID}
            </p>
            {customized && (
              <Pill
                className="bg-white text-jungle-green-500 border border-jungle-green-500 ml-2"
                size="xs"
              >
                MODIFIED
              </Pill>
            )}
          </div>
          <div className="mt-2 sm:flex sm:justify-between">
            <div className="sm:flex">
              <ReactMarkdown className="markdown" remarkPlugins={[remarkGfm]}>
                {description}
              </ReactMarkdown>
            </div>
            <Switch.Group as="div" className="flex items-center">
              {isCustomizable(userAbilities, customizable) && (
                <button
                  type="button"
                  onClick={() => {
                    onCustomize(checkID);
                  }}
                  aria-label="customize-check"
                  className="inline mr-4"
                >
                  <EOS_SETTINGS_OUTLINED className="fill-jungle-green-500" />
                </button>
              )}
              <Switch
                checked={selected}
                className={classNames(
                  { 'bg-jungle-green-500': selected, 'bg-gray-200': !selected },
                  'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer focus:outline-none transition-colors ease-in-out duration-200'
                )}
                onChange={onChange}
              >
                <span
                  aria-hidden="true"
                  className={classNames(
                    { 'translate-x-5': selected, 'translate-x-0': !selected },
                    'inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
                  )}
                />
              </Switch>
            </Switch.Group>
          </div>
        </div>
      </a>
    </li>
  );
}

export default ChecksSelectionItem;
