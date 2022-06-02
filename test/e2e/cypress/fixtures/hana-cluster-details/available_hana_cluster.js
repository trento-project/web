export const availableHanaCluster = {
  id: '469e7be5-4e20-5007-b044-c6f540a87493',
  name: 'hana_cluster_3',
  sid: 'HDP',
  clusterType: 'HANA scale-up',
  hanaSystemReplicationMode: 'sync',
  fencingType: 'external/sbd',
  hanaSecondarySyncState: 'SOK',
  sapHanaSRHealthState: 4,
  cibLastWritten: 'Tue Jan 25 15:36:59 2022',
  hanaSystemReplicationOperationMode: 'logreplay',
  sites: [
    {
      name: 'NBG',
      hosts: [
        {
          hostname: 'vmhdbprd01',
          ips: ['10.80.1.11', '10.80.1.13'],
          virtualIps: ['10.80.1.13'],
          role: 'Primary',
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
              failCount: '0',
            },
            {
              id: 'rsc_ip_HDP_HDB10',
              type: 'ocf::heartbeat:IPaddr2',
              role: 'Started',
              status: 'Active',
              failCount: '0',
            },
            {
              id: 'rsc_socat_HDP_HDB10',
              type: 'ocf::heartbeat:azure-lb',
              role: 'Started',
              status: 'Active',
              failCount: '0',
            },
            {
              id: 'rsc_SAPHana_HDP_HDB10',
              type: 'ocf::suse:SAPHana',
              role: 'Master',
              status: 'Active',
              failCount: '0',
            },
            {
              id: 'rsc_SAPHanaTopology_HDP_HDB10',
              type: 'ocf::suse:SAPHanaTopology',
              role: 'Started',
              status: 'Active',
              failCount: '0',
            },
          ],
        },
      ],
    },
    {
      name: 'WDF',
      hosts: [
        {
          hostname: 'vmhdbprd02',
          ips: ['10.80.1.12'],
          virtualIps: [],
          role: 'Secondary',
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
              failCount: '0',
            },
            {
              id: 'rsc_SAPHanaTopology_HDP_HDB10',
              type: 'ocf::suse:SAPHanaTopology',
              role: 'Started',
              status: 'Active',
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
