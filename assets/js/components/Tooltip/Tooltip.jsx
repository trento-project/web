import React from 'react';

import classNames from 'classnames';

function Tooltip({ children, tooltipText, width = 'w-full' }) {
  const tipRef = React.createRef(null);

  const handleMouseEnter = () => {
    tipRef.current.style.opacity = 1;
    tipRef.current.style.marginTop = '10px';
    tipRef.current.style['z-index'] = '10';
  };

  const handleMouseLeave = () => {
    tipRef.current.style.opacity = 0;
    tipRef.current.style.marginTop = '5px';
    tipRef.current.style['z-index'] = '-10';
  };

  return (
    <>
      <div
        className="w-full h-full absolute inset-0 flex justify-center items-center"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
      <div
        className={classNames(
          width,
          'absolute whitespace-no-wrap bg-gradient-to-r from-black to-gray-700 text-white px-4 py-2 rounded flex items-center transition-all duration-150'
        )}
        style={{ top: '100%', opacity: 0 }}
        ref={tipRef}
      >
        <div
          className="bg-black h-3 w-3 absolute"
          style={{ top: '-6px', right: '50%', transform: 'rotate(45deg)' }}
        />
        {tooltipText}
      </div>
    </>
  );
}

export default Tooltip;
