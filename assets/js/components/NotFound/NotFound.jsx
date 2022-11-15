import React from 'react';
import { useNavigate } from 'react-router-dom';

import Button from '@components/Button';
import TrentoLogo from '@static/trento-icon.png';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <main className="bg-white relative overflow-hidden h-screen relative">
      <div className="container mx-auto h-screen pt-32 md:pt-0 px-6 z-10 flex items-center justify-between">
        <div className="container mx-auto px-6 flex flex-col-reverse lg:flex-row justify-between items-center relative">
          <div className="w-full mb-16 md:mb-8 text-center lg:text-left">
            <h1 className="font-light font-sans text-center lg:text-left text-5xl lg:text-8xl mt-12 md:mt-0 text-gray-700">
              Sorry,<br></br>the page is in another castle.
            </h1>
            <Button
              className="px-2 py-2 w-36 mt-16"
              onClick={() => {
                navigate(`/`);
              }}
            >
              Go back home
            </Button>
          </div>
          <div className="block w-full mx-auto md:mt-0 relative max-w-md lg:max-w-2xl">
            <img src={TrentoLogo} />
          </div>
        </div>
      </div>
    </main>
  );
};

export default NotFound;
