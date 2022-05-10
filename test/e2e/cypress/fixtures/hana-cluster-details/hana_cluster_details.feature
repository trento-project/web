Feature: HANA cluster details
    The detail page of a HANA cluster

    Background:
        Given an SAP HANA scale-up cluster with name "hana_cluster_3" and id "469e7be5-4e20-5007-b044-c6f540a87493"
        Given two sites with one host each are part of the cluster
        Given 3 SBD devices which are part of the cluster of which 2 are in Unhealthy state
        And 1 is in Healthy state

    Scenario: HANA cluster details are the expected ones
        When I navigate to the Pacemaker Clusters Overview (/clusters)
        Then the displayed information should be a summary of the state of a cluster

    Scenario: HANA cluster details should be consistent with the state of the cluster
        When I check the details of the cluster
        Then the name should be 'hana_cluster_3'
        And the SID should be 'HDP'
        And the cluster type should be 'HANA scale-up'
        And the log replication mode should be 'sync'
        And the Fencing type should be 'external/sbd'
        And the HANA secondary sync state should be 'SOK'
        And the SAPHanaSR health state should be '4'
        And the CIB last written time should be 'Jan 25, 2022 15:36:59 UTC'
        And the log operation mode should be 'logreplay'

    Scenario: Cluster sites should have the expected hosts
        When I check the site details
        Then there should be an 'NBG' site
        And it should have a host with role 'Primary'
        And the hostshould have IPs '10.80.1.11, 10.80.1.13'
        And there should also be an 'WDF' site
        And it should have a host with role 'Seconday'
        And the hostshould have IPs '10.80.1.12'

    Scenario: Cluster SBD should have the expected devices with the correct status
        When I check the SDB/Fencing section
        Then it should include device ' /dev/disk/by-id/scsi-SLIO-ORG_IBLOCK_8d286026-c3a6-4404-90ac-f2549b924e77'
        And it's state should be 'Healthy'
        And it should contain device '/dev/disk/by-id/scsi-SLIO-ORG_IBLOCK_8d286026-c3a6-4404-90ac-f2549b912345'
        And it's state should be 'Unhealthy'
        And it should contains device ' /dev/disk/by-id/scsi-SLIO-ORG_IBLOCK_8d286026-c3a6-4404-90ac-f2549b954321'
        And it's state should be 'Unhealthy'

    Scenario: Settings should allow to enable checks from the checks catalog
        When I click on the Settings button
        Then it should show the settings dialog, containing the 5 relevant checks categories
        And after enabling all checks in the catalog
        And after requesting the execution of the checks
        Then the 72 checks should start executing