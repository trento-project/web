import React from 'react';
import TrentoLogo from '@static/trento-icon.png';

function GenericError({ message = undefined }) {
  return (
    <main className="bg-white relative overflow-hidden h-screen">
      <div className="container mx-auto h-screen pt-32 md:pt-0 px-6 z-10 flex items-center justify-between">
        <div className="container mx-auto px-6 flex flex-col-reverse lg:flex-row justify-between items-center relative">
          <div className="w-full mb-16 md:mb-8 text-center lg:text-left pr-10">
            <h1 className="font-light font-sans text-center lg:text-left text-5xl lg:text-8xl mt-12 md:mt-0 text-gray-700 ">
              Sorry
            </h1>
            <p className="font-light font-sans text-center lg:text-left text-lg mt-8 text-gray-700">
              An error occurred
            </p>
            <p className="font-light font-mono text-center lg:text-left text-lg text-gray-500">
              {message ?? 'No further information is known at this point'}
            </p>
          </div>
          <div className="block w-full mx-auto md:mt-0 relative max-w-md lg:max-w-2xl">
            <img src={TrentoLogo} alt="trento project logo" />
          </div>
        </div>
      </div>
    </main>
  );
}

export default GenericError;
