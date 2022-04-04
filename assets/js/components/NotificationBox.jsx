import React from 'react';

const NotificationBox = ({ icon, text, buttonText, buttonOnClick }) => {
  return (
    <div className="shadow-lg rounded-2xl p-4 bg-white dark:bg-gray-800 w-1/2 m-auto">
      <div className="w-full h-full text-center">
        <div className="flex h-full flex-col justify-between">
          {icon}
          <p className="text-gray-600 dark:text-gray-100 text-md py-2 px-6">
            {text}
          </p>
          {buttonText ? (
            <div className="flex items-center justify-between gap-4 mt-8">
              <button
                type="button"
                onClick={buttonOnClick}
                className="py-2 px-4 bg-sky-400 text-white w-32 text-center text-base font-semibold shadow-md rounded-lg m-auto"
              >
                {buttonText}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default NotificationBox;
