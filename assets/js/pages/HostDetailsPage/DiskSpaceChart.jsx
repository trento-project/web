import React, { useEffect, useState } from 'react';
import { pipe } from 'lodash/fp';
import { calculateFilesystemUsage } from '@common/FilesystemCharts/dataMapper';
import { fetchHostFilesystemData } from '@lib/api/charts';
import { SwapUsageChart } from '@common/FilesystemCharts';
import { MountpointsChart } from '@common/FilesystemCharts';

function DiskSpaceChart({ hostId, updateFrequency = 30000 }) {
  const [chartData, setChartData] = useState({});
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const fetchApiData = async () => {
    const { data: chartApiData } = await fetchHostFilesystemData(hostId);
    pipe(calculateFilesystemUsage, setChartData)(chartApiData);
    setIsInitialLoading(false);
  };

  useEffect(() => {
    fetchApiData();

    const intervalId = setInterval(fetchApiData, updateFrequency);

    return () => clearInterval(intervalId);
  }, []);

  if (isInitialLoading) {
    return <div>Data is loading</div>;
  }

  const { mountpoints, swap } = chartData;

  return (
    <div className="flex gap-2 pt-4">
      <SwapUsageChart
        availBytes={swap?.availBytes}
        usedBytes={swap?.usedBytes}
        totalBytes={swap?.totalBytes}
      />
      <MountpointsChart mountpoints={mountpoints} />
    </div>
  );
}

export default DiskSpaceChart;
