import React from 'react';

import Button from '@common/Button';

const extractTextContent = (text) =>
  Array.isArray(text)
    ? text
        .filter((textRow) => !!textRow)
        .map((textRow) => (
          <span key={textRow} className="block">
            {textRow}
          </span>
        ))
    : text;

function NotificationBox({ icon, title, text, buttonText, buttonOnClick }) {
  return (
    <div className="shadow-lg rounded-2xl p-4 bg-white dark:bg-gray-800">
      <div className="w-full h-full text-center">
        <div className="flex h-full flex-col justify-between">
          {icon}
          {title && (
            <p className="text-gray-900 dark:text-gray-100 font-bold text-3xl py-2 px-6">
              {title}
            </p>
          )}
          <p className="text-gray-900 dark:text-gray-100 text-md py-2 px-6">
            {extractTextContent(text)}
          </p>
          {buttonText ? (
            <div className="flex items-center justify-center gap-4 mt-4 w-1/8 m-auto">
              <Button type="primary" className="w-32" onClick={buttonOnClick}>
                {buttonText}
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default NotificationBox;
