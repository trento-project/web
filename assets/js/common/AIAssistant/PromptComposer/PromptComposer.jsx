import React from 'react';
import classNames from 'classnames';
import { ComposerPrimitive } from '@assistant-ui/react';

const defaultFootnote = (
  <>
    AI assistants can make mistakes.
    <br />
    <a
      href="https://documentation.suse.com/sles-sap/trento/html/SLES-SAP-trento/index.html"
      className="underline hover:text-gray-500"
    >
      Learn more
    </a>
  </>
);

const COMPOSER_INPUT_CLASS_NAME =
  'w-full border border-gray-300 rounded-lg p-4 text-gray-700 resize-none h-[130px] focus:outline-none focus:border-[#2fb371] focus:ring-1 focus:ring-[#2fb371] placeholder-gray-400 text-lg font-medium bg-white shadow-sm disabled:bg-gray-50 disabled:cursor-not-allowed';

export function PromptInput({
  as: Component = ComposerPrimitive.Input,
  className,
  ...props
}) {
  return (
    <Component
      className={classNames(COMPOSER_INPUT_CLASS_NAME, className)}
      {...props}
    />
  );
}

export function PromptComposer({
  inputSlot,
  actionSlot,
  footnote = defaultFootnote,
}) {
  return (
    <>
      <div className="relative flex w-full flex-col outline-none">
        {inputSlot}
      </div>
      <div className="flex justify-between items-center w-full mt-4">
        <div className="text-sm text-gray-400 leading-tight">{footnote}</div>
        {actionSlot}
      </div>
    </>
  );
}
