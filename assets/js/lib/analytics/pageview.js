import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { capture } from '@lib/analytics';
import { useSelector } from 'react-redux';
import { getUserProfile } from '@state/selectors/user';

export default function PostHogPageView() {
  const location = useLocation();
  const { analytics_enabled } = useSelector(getUserProfile);
  const webVersion = document.querySelector('#trento').getAttribute('data-ph-capture-attribute-webversion');

  // Track pageviews
  useEffect(() => {
    capture(analytics_enabled, '$pageview', {
      $current_url: window.location.href,
      webversion: webVersion
    });
  }, [location]);

  return null;
}
