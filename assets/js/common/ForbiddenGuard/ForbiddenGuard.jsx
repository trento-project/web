import React from 'react';
import { useSelector } from 'react-redux';
import { Outlet } from 'react-router';

import { getUserProfile } from '@state/selectors/user';

const ALL_PERMITTED = ['all:all'];

const FORBIDDEN_VIEW = <div>Access to this page is forbidden</div>;

function ForbiddenGuard({
  permitted,
  outletMode = false,
  disabled = false,
  children,
}) {
  if (disabled) {
    return children;
  }

  const permittedFor = ALL_PERMITTED.concat(permitted);
  const { abilities } = useSelector(getUserProfile);

  const userAbilities = abilities.map(
    ({ name, resource }) => `${name}:${resource}`
  );

  const isPermitted = userAbilities.some((ability) =>
    permittedFor.includes(ability)
  );

  if (isPermitted) {
    return outletMode ? <Outlet /> : children;
  }

  if (outletMode) {
    return FORBIDDEN_VIEW;
  }

  return null;
}

export default ForbiddenGuard;
