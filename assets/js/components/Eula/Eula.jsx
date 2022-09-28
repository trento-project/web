import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import Premium from '@components/Eula/Premium';

const Eula = () => {
  const eulaVisible = useSelector((state) => state.settings.eulaVisible);
  const dispatch = useDispatch();

  return (
    <Premium visible={eulaVisible} dispatch={dispatch} />
  );
};

export default Eula;
