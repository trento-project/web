Feature: Host details view
    This is where the user has a detailed view of the status of one specific host in the deployed SAP System

    Background:
        Given an healthy host within a SAP deployment with the following properties
        # hostName: 'vmhdbprd01',
        # sapSystem: 'HDP',
        # clusterName: 'hana_cluster',
        # resourceGroup: 'resourceGroupName',
        And a Trento agent installed on it identified by id '9cd46919-5f19-59aa-993e-cf3736c71053'


    Scenario: Detailed view of one specific host is available
        When I navigate to a specific host ('/hosts/9cd46919-5f19-59aa-993e-cf3736c71053')
        Then the displayed host should match the one I clicked

    Scenario: Host details are available in the view
        Given I am in the host details view ('/hosts/9cd46919-5f19-59aa-993e-cf3736c71053')
        Then a link to a SAP system details view with SID equal to 'HDP' should be visible
        And a link to a cluster details view with name `hana_cluster` should be under the cluster label
        And one entry with ID '1154f7678ac587e5f0f242830a5201f1' should be present in the SAP instances list

    Scenario: Cloud details are available in the view
        Given I am in the host details view ('/hosts/9cd46919-5f19-59aa-993e-cf3736c71053')
        Then the displayed details should include a VMName matching the hostname vmhdbprd01
        And a Resource group named resourceGroupName

    Scenario: Agent health matches the information resulted from a successful heartbeat
        Given I am in the host details view ('/hosts/9cd46919-5f19-59aa-993e-cf3736c71053')
        Then the displayed details should include a Trento Agent status labeled as 'running'
