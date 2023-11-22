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

export const WithCustomStyles = {
  args: {
    targetType: 'host',
    containerClassName:
      'inline-flex bg-jungle-green-500 p-1 rounded-full self-center',
    iconClassName: 'fill-white',
  },
};

export const HostWithLabel = {
  args: {
    targetType: 'host',
    withLabel: true,
    iconClassName: 'inline mr-2 h-4',
  },
};

export const ClusterWithLabel = {
  args: {
    targetType: 'cluster',
    withLabel: true,
    iconClassName: 'inline mr-2 h-4',
  },
};

export const WithCustomLabel = {
  args: {
    targetType: 'host',
    withLabel: true,
    iconClassName: 'inline mr-2 h-4',
    labelMap: {
      host: 'Custom host label',
    },
  },
};
