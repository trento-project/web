import React, { useEffect, useRef, useState } from 'react';
import { get } from '@lib/network';
import { addMinutes, parseISO, subMinutes } from 'date-fns';
import TimeSeriesLineChart from '@common/TimeSeriesLineChart/TimeSeriesLineChart';

function HostChart({
  hostId,
  chartId,
  chartTitle,
  yAxisFormatter,
  yAxisScaleType,
  yAxisMaxValue,
  startInterval = subMinutes(new Date(), 10),
  endInterval = new Date(),
  updateFrequency = 30000,
}) {
  const [chartStartInterval, setChartStartInterval] = useState(startInterval);
  const [chartEndInterval, setChartEndInterval] = useState(endInterval);
  const [chartData, setChartData] = useState([]);

  const chartRef = useRef(null);
  const startIntervalRef = useRef(startInterval);
  const endIntervalRef = useRef(endInterval);

  useEffect(() => {
    startIntervalRef.current = chartStartInterval;
  }, [chartStartInterval]);

  useEffect(() => {
    endIntervalRef.current = chartEndInterval;
  }, [chartEndInterval]);

  const fetchApiData = async (start, end) => {
    const { data: chartApiData } = await get(
      `charts/hosts/${hostId}/${chartId}?from=${start.toISOString()}&to=${end.toISOString()}`
    );

    const updatedChartData = Object.keys(chartApiData).map((chartKey) => ({
      name: chartApiData[chartKey].label,
      timeFrames: chartApiData[chartKey].series.map((frame) => ({
        time: parseISO(frame.timestamp),
        value: frame.value,
      })),
    }));

    return updatedChartData;
  };

  useEffect(() => {
    async function startDataFetching() {
      setInterval(async () => {
        const fetchInterval = {
          start: addMinutes(startIntervalRef.current, 1),
          end: addMinutes(endIntervalRef.current, 1),
        };
        if (chartRef.current && chartRef.current.getZoomLevel() < 3.5) {
          const updatedChartData = await fetchApiData(
            fetchInterval.start,
            fetchInterval.end
          );

          setChartData(updatedChartData);
          setChartStartInterval(fetchInterval.start);
          setChartEndInterval(fetchInterval.end);
        }
      }, updateFrequency);

      const initialData = await fetchApiData(startInterval, endInterval);
      setChartData(initialData);
    }
    startDataFetching();
  }, []);

  if (chartData.length === 0) {
    return <div>Data is loading</div>;
  }

  return (
    <TimeSeriesLineChart
      chartWrapperClassNames="h-[350px]"
      title={chartTitle}
      datasets={chartData}
      start={chartStartInterval}
      end={chartEndInterval}
      chartRef={chartRef}
      yAxisScaleType={yAxisScaleType}
      yAxisMaxValue={yAxisMaxValue}
      yAxisLabelFormatter={yAxisFormatter}
      onIntervalChange={() => {}}
    />
  );
}

export default HostChart;
