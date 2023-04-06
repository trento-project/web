import React from 'react';
import PremiumPill from '.';

export default {
  title: 'PremiumPill',
  component: PremiumPill,
};

export function PremiumPillDefault() {
  return <PremiumPill />;
}

export function PremiumPillRed() {
  return <PremiumPill className="bg-red-100" />;
}

export function PremiumPillYellow() {
  return <PremiumPill className="bg-yellow-100 text-black" />;
}

export function PremiumPillWithMarginLeft() {
  return <PremiumPill className="ml-6" />;
}
