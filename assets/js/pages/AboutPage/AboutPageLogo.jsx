import React from 'react';
import TrentoLogo from '@static/trento-icon.png';

function AboutPageLogo() {
  return (
    <div className="max-w-xs m-auto col-span-3 lg:col-span-1">
      <div className="">
        <img src={TrentoLogo} alt="trento project logo" />
      </div>
    </div>
  );
}

export default AboutPageLogo;
