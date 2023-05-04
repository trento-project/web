import React from 'react';

import Button from '@components/Button';

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

function NotificationBox({ icon, text, buttonText, buttonOnClick }) {
  return (
    <div className="shadow-lg rounded-2xl p-4 bg-white dark:bg-gray-800 w-1/2 m-auto">
      <div className="w-full h-full text-center">
        <div className="flex h-full flex-col justify-between">
          {icon}
          <p className="text-gray-600 dark:text-gray-100 text-md py-2 px-6">
            {extractTextContent(text)}
          </p>
          {buttonText ? (
            <div className="flex items-center justify-center gap-4 mt-8">
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
