export const clusterSteps = (navigate, setIsOpen) => [
  {
    selector: "[data-tour='cluster-title']",
    content: 'This view represents the current state of a registered cluster.',
  },
  {
    selector: "[data-tour='hana-cluster-details']",
    content:
      'This is the main information overview where you can see the most relevant details of this cluster.',
    stepInteraction: true,
  },
  {
    selector: "[data-tour='hana-sync-state']",
    content:
      'The HANA secondary sync state is particulary important. Other value than SOK means the cluster is not functioning properly.',
  },
  {
    selector: "[data-tour='hana-site-details']",
    content: 'These are the configured HANA sites.',
  },
  {
    selector: "[data-tour='hana-site-node-details']",
    content:
      'The details button displays a new view showing the cluster attributes in this node.',
    stepInteraction: true,
    highlightedSelectors: ["[data-tour='modal-content']"],
    mutationObservables: ['#headlessui-portal-root'],
    resizeObservables: ['#headlessui-portal-root'],
  },
  {
    selector: "[data-tour='resources']",
    content: 'This are the cluster resources.',
  },
  {
    selector: "[data-tour='cluster-operations']",
    content:
      'Clicking this button you can find all the cluster wide operations. The operations can be used to run actions that change the current state of the cluster.',
    stepInteraction: true,
    highlightedSelectors: [
      "[data-tour='operation-items']",
      "[data-tour='modal-content']",
    ],
    mutationObservables: [
      '#headlessui-portal-root',
      "[data-tour='modal-overlay']",
    ],
    resizeObservables: [
      '#headlessui-portal-root',
      "[data-tour='modal-content']",
    ],
  },
  {
    selector: "[data-tour='node-operations']",
    content: 'These are node specific operations',
    stepInteraction: true,
    highlightedSelectors: ["[data-tour='operation-items']"],
    mutationObservables: ['#headlessui-portal-root'],
    resizeObservables: ['#headlessui-portal-root'],
  },
  {
    selector: "[data-tour='resource-operations']",
    content: 'And these are resource specific ones.',
    stepInteraction: true,
    highlightedSelectors: ["[data-tour='operation-items']"],
    mutationObservables: ['#headlessui-portal-root'],
    resizeObservables: ['#headlessui-portal-root'],
  },
  {
    selector: "[data-tour='checks-results']",
    content:
      'This box shows the result of the last checks execution. If it is empty, it means that no checks are selected yet.',
  },
  {
    selector: "[data-tour='checks-selection-button']",
    content: 'Clicking here you can select checkt for this cluster.',
    actionAfter: () => {
      navigate(window.location.pathname + '/settings');
    },
  },
  {
    selector: "[data-tour='cluster-settings']",
    content: "Now, let's go and select some checks to run.",
  },
  {
    selector: "[data-tour='checks-selection-container']",
    content: 'Select the checks here.',
    stepInteraction: true,
  },
  {
    selector: "[data-tour='save-checks']",
    content: 'Save the checks.',
    stepInteraction: true,
  },
  {
    selector: "[data-tour='execute-checks']",
    content: "And execute them, if you don't want to wait 5 minutes.",
    // stepInteraction: true,
    actionAfter: () => {
      document.querySelector("[data-tour='execute-checks']").click();
    },
  },
  {
    selector: "[data-tour='execute-checks']",
    content: 'And see if your cluster is compliant or not!',
    highlightedSelectors: ["[data-tour='checks-results']"],
    mutationObservables: ['.tn-cluster-details'],
    resizeObservables: ['.tn-cluster-details'],
  },
];

export const settingsSteps = [
  {
    selector: "[data-tour='api-key']",
    content:
      'First step to get Trento showing your agents data is to copy the API key to your agents..',
  },
  {
    selector: "[data-tour='copy-api-key']",
    content:
      'Copy the content of the API key and set it in the agent configuration file.',
    stepInteraction: true,
  },
  {
    selector: "[data-tour='generate-api-key']",
    content:
      'If you want a API key with an expiration date, click here to create a new one. The modal will guide you through the process.',
    stepInteraction: true,
    highlightedSelectors: ["[data-tour='modal-content']"],
    mutationObservables: ['#headlessui-portal-root'],
    resizeObservables: [
      '#headlessui-portal-root',
      "[data-tour='modal-content']",
    ],
    position: 'bottom',
  },
  {
    selector: "[data-tour='suse-manager-settings']",
    content: 'Setup your Suse Multi Linux Manager configuration now.',
  },
  {
    selector: "[data-tour='configure-suse-manager-settings']",
    content: 'Fill all the required fields in the configuration modal.',
    stepInteraction: true,
    highlightedSelectors: ["[data-tour='modal-content']"],
    mutationObservables: ['#headlessui-portal-root'],
    resizeObservables: [
      '#headlessui-portal-root',
      "[data-tour='modal-content']",
    ],
    position: 'bottom',
  },
  {
    selector: "[data-tour='email-alerts-settings']",
    content:
      'Setup your email alerts. This comes really handy to receive email messages while you are off Trento.',
  },
  {
    selector: "[data-tour='configure-email-alerts-settings']",
    content: 'Fill all the required fields in the configuration modal.',
    stepInteraction: true,
    highlightedSelectors: ["[data-tour='modal-content']"],
    mutationObservables: ['#headlessui-portal-root'],
    resizeObservables: ['#headlessui-portal-root'],
  },
];
