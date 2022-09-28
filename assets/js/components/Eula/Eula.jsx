import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import Premium from '@components/Eula/Premium';
import Community from '@components/Eula/Community';

const Eula = () => {
  const eulaVisible = useSelector((state) => state.settings.eulaVisible);
  const isPremium = true;
  const dispatch = useDispatch();

  if (isPremium) {
    return <Premium visible={eulaVisible} dispatch={dispatch} />;
  } else {
    return <Community visible={eulaVisible} dispatch={dispatch} />;
  }
};

export default Eula;
