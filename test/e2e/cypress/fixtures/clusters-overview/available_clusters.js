const availableClusters = [
    ['04a81f89c847e82390e35bece2e25c9b', 'drbd_cluster'],
    ['238a4de1239aae2aa87433eed788b3ad', ' drbd_cluster'],
    ['a034a158905404befe08775682910ee1', ' drbd_cluster'],
    ['04b8f8c21f9fd8991224478e8c4362f8', 'hana_cluster_1'],
    ['4e905d706da85f5be14f85fa947c1e39', 'hana_cluster_2'],
    ['9c832998801e28cd70ad77380e82a5c0', 'hana_cluster_3'],
    ['057f083c3be591f4398eed816d4c8cd7', 'netweaver_cluster'],
    ['8bca366a6cb7816555538092a1ddd5aa', 'netweaver_cluster'],
    ['acf59e7a5338f76f55d5055af3273480', 'netweaver_cluster'],
  ];
  
  export const allClusterNames = () =>
    availableClusters.map(([_, clusterName]) => clusterName);
  export const allClusterIds = () =>
    availableClusters.map(([clusterId, _]) => clusterId);
  export const clusterIdByName = (clusterName) =>
    availableClusters.find(([, name]) => name === clusterName)[0];
  export const clusterNameById = (clusterId) =>
    availableClusters.find(([id]) => id === clusterId)[1];
  