import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import useAIContext from '@hooks/useAIContext';
import HomeHealthSummary from './HomeHealthSummary';

export function HomeHealthSummaryPage() {
  const { loading, sapSystemsHealth } = useSelector(
    (state) => state.sapSystemsHealthSummary
  );

  // Provide context for AI assistant
  const aiContext = useMemo(
    () => ({
      page: 'Dashboard',
      description: 'Overview of SAP systems health status',
      data: {
        totalSystems: sapSystemsHealth?.length || 0,
        healthSummary: sapSystemsHealth.reduce((acc, system) => {
          const health = system.health || 'unknown';
          acc[health] = (acc[health] || 0) + 1;
          return acc;
        }, {}),
      },
    }),
    [sapSystemsHealth]
  );
  useAIContext(aiContext);

  return (
    <HomeHealthSummary sapSystemsHealth={sapSystemsHealth} loading={loading} />
  );
}
