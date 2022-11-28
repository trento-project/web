import { isValid, max, parseISO } from 'date-fns';
import { useEffect, useState } from 'react';

export const useChecksResult = (cluster) => {
  const [checksResult, setChecksResult] = useState({
    passing: 0,
    warning: 0,
    critical: 0,
  });
  const [lastCheckExecution, setLastCheckExecution] = useState(new Date());

  useEffect(() => {
    if (cluster?.checks_results?.length == 0) return;

    const selectedCheckResults = cluster?.checks_results.filter((result) => cluster?.selected_checks.includes(result?.check_id));

    if (!selectedCheckResults) return;

    const lastCheckExecution = max(
      cluster?.checks_results.map((result) => parseISO(result.updated_at)),
    );

    if (isValid(lastCheckExecution)) {
      setLastCheckExecution(lastCheckExecution);
    }

    const result = selectedCheckResults.reduce(
      (acc, curr) => ({
        ...acc,
        [curr.result]: acc[curr.result] + 1,
      }),
      { passing: 0, warning: 0, critical: 0 },
    );

    setChecksResult(result);
  }, [cluster?.checks_results, cluster?.selected_checks]);

  return { ...checksResult, lastCheckExecution };
};
