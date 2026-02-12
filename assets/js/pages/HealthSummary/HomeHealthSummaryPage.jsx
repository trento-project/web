import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useAssistantContext } from '@common/AssistantChat/useAssistantContext';
import HomeHealthSummary from './HomeHealthSummary';

export function HomeHealthSummaryPage() {
  const { loading, sapSystemsHealth } = useSelector(
    (state) => state.sapSystemsHealthSummary
  );

  // Provide context for AI assistant
  const aiContext = useMemo(
    () => ({
      totalSystems: sapSystemsHealth?.length || 0,
      sapSystemsHealth: sapSystemsHealth,
    }),
    [sapSystemsHealth]
  );
  useAssistantContext(`Dashboard: Overview of SAP systems health status.`, aiContext);

  console.log('sapSystemsHealth', sapSystemsHealth);

  return (
    <HomeHealthSummary sapSystemsHealth={sapSystemsHealth} loading={loading} />
  );
}
