export const availableHanaCluster = {
  id: '469e7be5-4e20-5007-b044-c6f540a87493',
  name: 'hana_cluster_3',
  sid: 'HDP',
  systemID: '6c9208eb-a5bb-57ef-be5c-6422dedab602',
  clusterType: 'HANA Scale Up Perf. Opt.',
  architectureType: 'Classic',
  provider: 'Azure',
  hanaSystemReplicationMode: 'sync',
  fencingType: 'external/sbd',
  maintenanceMode: false,
  hanaSecondarySyncState: 'SOK',
  sapHanaSRHealthState: 4,
  cibLastWritten: 'Tue Jan 25 15:36:59 2022',
  hanaSystemReplicationOperationMode: 'logreplay',
  sites: [
    {
      name: 'NBG',
      state: 'Primary',
      srHealthState: 'fill-jungle-green-500',
      hosts: [
        {
          hostname: 'vmhdbprd01',
          ips: ['10.80.1.11', '10.80.1.13'],
          virtualIps: ['10.80.1.13'],
          role: 'Primary',
          indexserver_actual_role: 'master',
          nameserver_actual_role: 'master',
          status: 'tn-online',
          attributes: [
            {
              attribute: 'hana_hdp_clone_state',
              value: 'PROMOTED',
            },
            {
              attribute: 'hana_hdp_op_mode',
              value: 'logreplay',
            },
            {
              attribute: 'hana_hdp_remoteHost',
              value: 'vmhdbprd02',
            },
            {
              attribute: 'hana_hdp_roles',
              value: '4:P:master1:master:worker:master',
            },
            {
              attribute: 'hana_hdp_site',
              value: 'NBG',
            },
            {
              attribute: 'hana_hdp_srmode',
              value: 'sync',
            },
            {
              attribute: 'hana_hdp_sync_state',
              value: 'PRIM',
            },
            {
              attribute: 'hana_hdp_version',
              value: '2.00.057.00.1629894416',
            },
            {
              attribute: 'hana_hdp_vhost',
              value: 'vmhdbprd01',
            },
            {
              attribute: 'lpa_hdp_lpt',
              value: '1643125019',
            },
            {
              attribute: 'master-rsc_SAPHana_HDP_HDB10',
              value: '150',
            },
          ],
          resources: [
            {
              id: 'stonith-sbd',
              type: 'stonith:external/sbd',
              role: 'Started',
              status: 'Active',
              managed: true,
              failCount: '0',
            },
            {
              id: 'rsc_ip_HDP_HDB10',
              type: 'ocf::heartbeat:IPaddr2',
              role: 'Started',
              status: 'Active',
              managed: true,
              failCount: '0',
            },
            {
              id: 'rsc_socat_HDP_HDB10',
              type: 'ocf::heartbeat:azure-lb',
              role: 'Started',
              status: 'Active',
              managed: true,
              failCount: '0',
            },
            {
              id: 'rsc_SAPHana_HDP_HDB10',
              type: 'ocf::suse:SAPHana',
              role: 'Master',
              status: 'Active',
              managed: true,
              failCount: '0',
            },
            {
              id: 'rsc_SAPHanaTopology_HDP_HDB10',
              type: 'ocf::suse:SAPHanaTopology',
              role: 'Started',
              status: 'Active',
              managed: true,
              failCount: '0',
            },
          ],
        },
      ],
    },
    {
      name: 'WDF',
      state: 'Secondary',
      srHealthState: 'fill-jungle-green-500',
      hosts: [
        {
          hostname: 'vmhdbprd02',
          ips: ['10.80.1.12'],
          virtualIps: [],
          role: 'Secondary',
          indexserver_actual_role: 'master',
          nameserver_actual_role: 'master',
          status: 'tn-online',
          attributes: [
            {
              attribute: 'hana_hdp_clone_state',
              value: 'DEMOTED',
            },
            {
              attribute: 'hana_hdp_op_mode',
              value: 'logreplay',
            },
            {
              attribute: 'hana_hdp_remoteHost',
              value: 'vmhdbprd01',
            },
            {
              attribute: 'hana_hdp_roles',
              value: '4:S:master1:master:worker:master',
            },
            {
              attribute: 'hana_hdp_site',
              value: 'WDF',
            },
            {
              attribute: 'hana_hdp_srmode',
              value: 'sync',
            },
            {
              attribute: 'hana_hdp_sync_state',
              value: 'SOK',
            },
            {
              attribute: 'hana_hdp_version',
              value: '2.00.057.00.1629894416',
            },
            {
              attribute: 'hana_hdp_vhost',
              value: 'vmhdbprd02',
            },
            {
              attribute: 'lpa_hdp_lpt',
              value: '30',
            },
            {
              attribute: 'master-rsc_SAPHana_HDP_HDB10',
              value: '100',
            },
          ],
          resources: [
            {
              id: 'rsc_SAPHana_HDP_HDB10',
              type: 'ocf::suse:SAPHana',
              role: 'Slave',
              status: 'Active',
              managed: true,
              failCount: '0',
            },
            {
              id: 'rsc_SAPHanaTopology_HDP_HDB10',
              type: 'ocf::suse:SAPHanaTopology',
              role: 'Started',
              status: 'Active',
              managed: true,
              failCount: '0',
            },
          ],
        },
      ],
    },
  ],
  sbd: [
    {
      deviceName:
        '/dev/disk/by-id/scsi-SLIO-ORG_IBLOCK_8d286026-c3a6-4404-90ac-f2549b924e77',
      status: 'Healthy',
    },
    {
      deviceName:
        '/dev/disk/by-id/scsi-SLIO-ORG_IBLOCK_8d286026-c3a6-4404-90ac-f2549b912345',
      status: 'Unhealthy',
    },
    {
      deviceName:
        '/dev/disk/by-id/scsi-SLIO-ORG_IBLOCK_8d286026-c3a6-4404-90ac-f2549b954321',
      status: 'Unhealthy',
    },
  ],
};

export const availableHanaClusterCostOpt = {
  id: 'ee7ea205-d5cc-5bbd-a345-10cad2aae2d7',
  name: 'hana_cost_opt',
  sid: ['HDC', 'QAS'],
  systemID: [
    '35fce256-f5c8-5f96-bb58-022d6d2729e7',
    '57399859-155b-56f1-ae38-492283a8d758',
  ],
  clusterType: 'HANA Scale Up Cost Opt.',
  architectureType: 'Classic',
  provider: 'Azure',
  hanaSystemReplicationMode: 'sync',
  fencingType: 'external/sbd',
  maintenanceMode: false,
  hanaSecondarySyncState: 'SOK',
  sapHanaSRHealthState: 4,
  cibLastWritten: 'Mon Aug 26 14:52:19 2024',
  hanaSystemReplicationOperationMode: 'logreplay',
  sites: [],
  sbd: [],
};

export const availableAngiCluster = {
  id: '69851bfe-5364-5ea8-93e1-cbe14268ccaf',
  name: 'hana_angi',
  sid: 'HN9',
  systemID: '3daab481-1f21-5e32-84bc-0014bda8efdf',
  clusterType: 'HANA Scale Up',
  architectureType: 'Angi',
  provider: 'Azure',
  hanaSystemReplicationMode: 'sync',
  fencingType: 'external/sbd',
  maintenanceMode: false,
  hanaSecondarySyncState: 'SOK',
  cibLastWritten: 'Mon Jun 10 13:03:57 2024',
  hanaSystemReplicationOperationMode: 'logreplay',
  hosts: [
    {
      id: '851a4dd3-9693-44c3-a40b-b32d22872e74',
    },
    {
      id: '4b67842f-ccf7-46a4-a344-9e918648b117',
    },
  ],
  sites: [
    {
      name: 'WDF',
      state: 'Primary',
    },
    {
      name: 'ROT',
      state: 'Secondary',
    },
  ],
};
