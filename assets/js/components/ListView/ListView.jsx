import React from 'react';
import classNames from 'classnames';

function ListView({
  className,
  orientation = 'horizontal',
  data,
  titleClassName,
}) {
  return (
    <div
      className={
        orientation === 'vertical'
          ? classNames(className, 'grid grid-flow-col gap-5 auto-cols-fr')
          : classNames(className, 'grid grid-flow-row gap-5')
      }
    >
      {data.map(({ title, content, render = (component) => <span>
            {component}
          </span> }) => (
        <div
          key={title}
          className={
            orientation === 'vertical'
              ? 'grid grid-flow-row'
              : 'grid grid-flow-col auto-cols-fr gap-5'
          }
        >
          <div className={classNames(titleClassName, 'font-bold')}>{title}</div>
          <div className="">{render(content)}</div>
        </div>
      ))}
    </div>
  );
}

export default ListView;
