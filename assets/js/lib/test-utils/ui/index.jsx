import React from 'react';

const css = require('fs').readFileSync(
  `${__dirname}/../../../../../priv/static/assets/app.css`,
  'utf8'
);

/**
 * Prepend the application global css in a <style> element.
 * It's meant to be used in component testing when css classes must be resolved.
 *
 * @example
 *
 * render(
 *   <WithStyle>
 *     <Elem />
 *   </WithStyle>
 * );
 */
export function WithStyle({ children }) {
  return (
    <>
      <style>{css}</style>
      {children}
    </>
  );
}
