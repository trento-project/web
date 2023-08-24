export const payloadMatchesInstance = (payload, instance) =>
  payload.sap_system_id === instance.sap_system_id &&
  payload.host_id === instance.host_id &&
  payload.instance_number === instance.instance_number;

const filterByInstances = (currentInstances, newInstances) =>
  currentInstances.filter((currentInstance) =>
    newInstances.every(
      (newInstance) => !payloadMatchesInstance(newInstance, currentInstance)
    )
  );

export const upsertInstances = (currentInstances, newInstances) =>
  filterByInstances(currentInstances, newInstances).concat(newInstances);

export const updateInstance = (instances, instanceToUpdate, data) =>
  instances.map((instance) => {
    if (payloadMatchesInstance(instanceToUpdate, instance)) {
      return { ...instance, ...data };
    }
    return instance;
  });
