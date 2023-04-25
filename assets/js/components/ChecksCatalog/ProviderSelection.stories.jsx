import React, { useState } from 'react';
import ProviderSelection from './ProviderSelection';

const providers = ['azure', 'aws', 'gcp'];

export default {
  title: 'ProviderSelection',
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
