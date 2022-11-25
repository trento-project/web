import React from 'react';
import TrentoLogo from '@static/trento-icon.png';

const AboutPageLogo = () => {
  return (
    <div className="max-w-xs m-auto col-span-3 lg:col-span-1">
      <div className="">
        <img src={TrentoLogo} />
      </div>
    </div>
  );
};

export default AboutPageLogo;
