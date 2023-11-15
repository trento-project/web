import TargetIcon from './TargetIcon';

export default {
  title: 'Components/TargetIcon',
  component: TargetIcon,
};

export const Host = {
  args: { targetType: 'host' },
};

export const Cluster = {
  args: { targetType: 'cluster' },
};
