import React, { useState } from 'react';

import { providerData } from '@components/ProviderLabel/ProviderLabel';

import ProviderSelection from './ProviderSelection';

const providers = Object.keys(providerData);

export default {
  title: 'Components/ProviderSelection',
  components: ProviderSelection,
};

export function Selection() {
  const [selected, setSelected] = useState('azure');

  return (
    <ProviderSelection
      providers={providers}
      selected={selected}
      onChange={setSelected}
    />
  );
}

export function SelectionWithAll() {
  const providersWithAll = ['all'].concat(providers);
  const [selected, setSelected] = useState('all');

  return (
    <ProviderSelection
      providers={providersWithAll}
      selected={selected}
      onChange={setSelected}
    />
  );
}
