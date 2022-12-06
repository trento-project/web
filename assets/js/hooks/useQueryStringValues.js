import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const useQueryStringValues = (paramsNames) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [extractedParams, setExtractedParams] = useState({});

  useEffect(() => {
    const paramsFromQs = paramsNames.reduce((acc, curr) => ({
      ...acc,
      [curr]: searchParams.getAll(curr),
    }), {});

    setExtractedParams(paramsFromQs);
  }, [searchParams]);

  return { extractedParams, setQueryValues: setSearchParams };
};

export default useQueryStringValues;
