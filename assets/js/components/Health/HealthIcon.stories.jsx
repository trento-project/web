import React from 'react';
import HealthIcon from '.';

export default {
  title: 'HealthIcon',
  component: HealthIcon,
};

export function Passing() {
  return <HealthIcon health="passing" />;
}

export function Warning() {
  return <HealthIcon health="warning" />;
}

export function Critical() {
  return <HealthIcon health="critical" />;
}

export function Pending() {
  return <HealthIcon health="pending" />;
}

export function Default() {
  return <HealthIcon health="unknown" />;
}

export function ExtraLarge() {
  return <HealthIcon health="passing" size="xl" />;
}
