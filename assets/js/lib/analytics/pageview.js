import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { capture } from '@lib/analytics';
import { useSelector } from 'react-redux';
import { getUserProfile } from '@state/selectors/user';

export default function PostHogPageView() {
  const location = useLocation();
  const { analytics_enabled } = useSelector(getUserProfile);
  const webversion = document
    .querySelector('#trento')
    .getAttribute('data-ph-capture-attribute-webversion');
  const environment = document
    .querySelector('#trento')
    .getAttribute('data-ph-capture-attribute-environment');

  // Track pageviews
  useEffect(() => {
    capture(analytics_enabled, '$pageview', {
      $current_url: window.location.href,
      webversion,
      environment,
    });
  }, [location]);

  return null;
}
