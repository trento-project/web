import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { capture } from '@lib/analytics';

export default function PostHogPageView() {
  const location = useLocation();
  // Track pageviews
  useEffect(() => {
    capture('$pageview', {
      $current_url: window.location.href,
    });
  }, [location]);

  return null;
}
