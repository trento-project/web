const payloadMatchesInstance = (payload, instance) =>
  payload.sap_system_id === instance.sap_system_id &&
  payload.host_id === instance.host_id &&
  payload.instance_number === instance.instance_number;

export const filterByInstances = (currentInstances, newInstances) =>
  currentInstances.filter((currentInstance) =>
    newInstances.every(
      (newInstance) => !payloadMatchesInstance(newInstance, currentInstance)
    )
  );

export const maybeUpdateInstanceHealth = (payload, instance) => {
  if (payloadMatchesInstance(payload, instance)) {
    instance.health = payload.health;
  }
  return instance;
};
