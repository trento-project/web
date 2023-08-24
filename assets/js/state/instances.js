export const instancesMatch = (instance1, instance2) =>
  instance1.sap_system_id === instance2.sap_system_id &&
  instance1.host_id === instance2.host_id &&
  instance1.instance_number === instance2.instance_number;

const filterByInstances = (currentInstances, newInstances) =>
  currentInstances.filter((currentInstance) =>
    newInstances.every(
      (newInstance) => !instancesMatch(newInstance, currentInstance)
    )
  );

export const upsertInstances = (currentInstances, newInstances) =>
  filterByInstances(currentInstances, newInstances).concat(newInstances);

export const updateInstance = (instances, instanceToUpdate, data) =>
  instances.map((instance) => {
    if (instancesMatch(instanceToUpdate, instance)) {
      return { ...instance, ...data };
    }
    return instance;
  });
