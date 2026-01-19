import { SAPTUNE_SOLUTION_OPERATION_FORBIDDEN_MSG } from './ForbiddenMessages';

import {
  getOperationLabel,
  getOperationInternalName,
  getOperationResourceType,
  getOperationForbiddenMessage,
  operationSucceeded,
  getOperationTitle,
} from '.';

describe('operations', () => {
  it.each`
    operation                       | label
    ${'unknown'}                    | ${'unknown'}
    ${'saptune_solution_apply'}     | ${'Apply Saptune solution'}
    ${'saptune_solution_change'}    | ${'Change Saptune solution'}
    ${'cluster_maintenance_change'} | ${'Cluster maintenance change'}
    ${'cluster_resource_refresh'}   | ${'Refresh cluster resources'}
    ${'sap_instance_start'}         | ${'SAP instance start'}
    ${'sap_instance_stop'}          | ${'SAP instance stop'}
    ${'sap_system_start'}           | ${'SAP system start'}
    ${'sap_system_stop'}            | ${'SAP system stop'}
    ${'pacemaker_enable'}           | ${'Enable Pacemaker'}
    ${'pacemaker_disable'}          | ${'Disable Pacemaker'}
    ${'database_start'}             | ${'Database start'}
    ${'database_stop'}              | ${'Database stop'}
    ${'cluster_host_start'}         | ${'Start cluster host'}
    ${'cluster_host_stop'}          | ${'Stop cluster host'}
    ${'reboot'}                     | ${'Reboot host'}
  `(`should return the operation $operation label`, ({ operation, label }) => {
    expect(getOperationLabel(operation)).toBe(label);
  });

  it.each`
    operation                       | title
    ${'unknown'}                    | ${'unknown operation'}
    ${'database_start'}             | ${'Start database'}
    ${'database_stop'}              | ${'Stop database'}
    ${'sap_system_start'}           | ${'Start SAP system'}
    ${'sap_system_stop'}            | ${'Stop SAP system'}
    ${'sap_instance_start'}         | ${'Start SAP instance'}
    ${'sap_instance_stop'}          | ${'Stop SAP instance'}
    ${'saptune_solution_apply'}     | ${'Apply Saptune solution'}
    ${'saptune_solution_change'}    | ${'Change Saptune solution'}
    ${'pacemaker_enable'}           | ${'Enable Pacemaker'}
    ${'pacemaker_disable'}          | ${'Disable Pacemaker'}
    ${'cluster_maintenance_change'} | ${'Maintenance change'}
    ${'cluster_host_start'}         | ${'Start cluster host'}
    ${'cluster_host_stop'}          | ${'Stop cluster host'}
    ${'cluster_resource_refresh'}   | ${'Refresh resources'}
    ${'reboot'}                     | ${'Reboot host'}
  `(`should return the operation $operation title`, ({ operation, title }) => {
    expect(getOperationTitle(operation)).toBe(title);
  });

  it.each`
    operation                        | name
    ${'unknown'}                     | ${'unknown'}
    ${'saptuneapplysolution@v1'}     | ${'saptune_solution_apply'}
    ${'saptunechangesolution@v1'}    | ${'saptune_solution_change'}
    ${'clustermaintenancechange@v1'} | ${'cluster_maintenance_change'}
    ${'clusterresourcerefresh@v1'}   | ${'cluster_resource_refresh'}
    ${'sapinstancestart@v1'}         | ${'sap_instance_start'}
    ${'sapinstancestop@v1'}          | ${'sap_instance_stop'}
    ${'sapsystemstart@v1'}           | ${'sap_system_start'}
    ${'sapsystemstop@v1'}            | ${'sap_system_stop'}
    ${'pacemakerenable@v1'}          | ${'pacemaker_enable'}
    ${'pacemakerdisable@v1'}         | ${'pacemaker_disable'}
    ${'databasestart@v1'}            | ${'database_start'}
    ${'databasestop@v1'}             | ${'database_stop'}
    ${'crmclusterstart@v1'}          | ${'cluster_host_start'}
    ${'crmclusterstop@v1'}           | ${'cluster_host_stop'}
    ${'hostreboot@v1'}               | ${'reboot'}
  `(
    `should return the operation $operation internal name`,
    ({ operation, name }) => {
      expect(getOperationInternalName(operation)).toBe(name);
    }
  );

  it.each`
    operation                       | resourceType
    ${'unknown'}                    | ${'unknown'}
    ${'saptune_solution_apply'}     | ${'host'}
    ${'saptune_solution_change'}    | ${'host'}
    ${'cluster_maintenance_change'} | ${'cluster'}
    ${'cluster_resource_refresh'}   | ${'cluster'}
    ${'sap_instance_start'}         | ${'application_instance'}
    ${'sap_instance_stop'}          | ${'application_instance'}
    ${'sap_system_start'}           | ${'sap_system'}
    ${'sap_system_stop'}            | ${'sap_system'}
    ${'pacemaker_enable'}           | ${'cluster_host'}
    ${'pacemaker_disable'}          | ${'cluster_host'}
    ${'database_start'}             | ${'database'}
    ${'database_stop'}              | ${'database'}
    ${'cluster_host_start'}         | ${'cluster_host'}
    ${'cluster_host_stop'}          | ${'cluster_host'}
    ${'reboot'}                     | ${'host'}
  `(
    `should return the operation $operation resource type`,
    ({ operation, resourceType }) => {
      expect(getOperationResourceType(operation)).toBe(resourceType);
    }
  );

  it.each`
    operation                    | message
    ${'unknown'}                 | ${null}
    ${'saptune_solution_apply'}  | ${SAPTUNE_SOLUTION_OPERATION_FORBIDDEN_MSG}
    ${'saptune_solution_change'} | ${SAPTUNE_SOLUTION_OPERATION_FORBIDDEN_MSG}
  `(
    `should return the operation $operation forbidden message`,
    ({ operation, message }) => {
      expect(getOperationForbiddenMessage(operation)).toBe(message);
    }
  );

  it('should check if an operation succeeded', () => {
    expect(operationSucceeded('UPDATED')).toBeTruthy();
    expect(operationSucceeded('NOT_UPDATED')).toBeTruthy();
    expect(operationSucceeded('FAILED')).toBeFalsy();
  });
});
