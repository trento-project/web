import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import Premium from './Premium';
import Community from './Community';

function Eula() {
  const eulaVisible = useSelector((state) => state.settings.eulaVisible);
  const isPremium = useSelector((state) => state.settings.isPremium);
  const dispatch = useDispatch();

  if (isPremium) {
    return <Premium visible={eulaVisible} dispatch={dispatch} />;
  }
  return <Community visible={eulaVisible} dispatch={dispatch} />;
}

export default Eula;
