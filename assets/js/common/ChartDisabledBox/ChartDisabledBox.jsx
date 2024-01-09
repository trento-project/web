import React from 'react';

function ChartDisabledBox() {
  return (
    <div
      className="mt-4 bg-white shadow rounded-lg py-4 px-8 mx-auto"
      data-testid="chart-disabled-box"
    >
      <h2 className="font-bold text-center text-xl">
        Charts are disabled, please check documentation for further details
      </h2>
    </div>
  );
}

export default ChartDisabledBox;
