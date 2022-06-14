Feature: Host details view
    This is where the user has a detailed view of the status of one specific host in the deployed SAP System

    Background:
        Given an healthy host within a SAP deployment with the following properties
        # hostName: 'vmhdbprd01',
        # sapSystem: 'HDP',
        # clusterName: 'hana_cluster_3',
        # resourceGroup: 'resourceGroupName',
        And a Trento agent installed on it identified by id '9cd46919-5f19-59aa-993e-cf3736c71053'

    Scenario: Detailed view of one specific host is available
        When I navigate to a specific host ('/hosts/9cd46919-5f19-59aa-993e-cf3736c71053')
        Then the displayed host should match the one I clicked
        And the agent version is the correct one

    Scenario: Host details are available in the view
        Given I am in the host details view ('/hosts/9cd46919-5f19-59aa-993e-cf3736c71053')
        Then a link to a SAP system details view with SID equal to 'HDP' should be visible
        And a link to a cluster details view with name `hana_cluster_3` should be under the cluster label
        And one entry with ID '6c9208eb-a5bb-57ef-be5c-6422dedab602' should be present in the SAP instances list

    Scenario: Azure cloud details are available in the view
        Given I am in the host details view ('/hosts/9cd46919-5f19-59aa-993e-cf3736c71053')
        And the host is running on Azure
        Then the displayed details should include all the correct Azure cloud metadata information

    Scenario: AWS cloud details are available in the view
        Given I am in the host details view ('/hosts/9cd46919-5f19-59aa-993e-cf3736c71053')
        And the host is running on AWS
        Then the displayed details should include all the correct AWS cloud metadata information

    Scenario: GCP cloud details are available in the view
        Given I am in the host details view ('/hosts/9cd46919-5f19-59aa-993e-cf3736c71053')
        And the host is running on GCP
        Then the displayed details should include all the correct GCP cloud metadata information

    Scenario: Provider details are not available
        Given I am in the host details view ('/hosts/9cd46919-5f19-59aa-993e-cf3736c71053')
        And the host is running on unknown provider platform
        Then provider not recognized message is displayed

    Scenario: Agent health matches the information resulted from a successful heartbeat
        Given I am in the host details view ('/hosts/9cd46919-5f19-59aa-993e-cf3736c71053')
        Then the displayed details should include a Trento Agent status labeled as 'running'

    Scenario: Node exporter health is running
        Given I am in the host details view ('/hosts/9cd46919-5f19-59aa-993e-cf3736c71053')
        Then the displayed details should include a Node exporter status labeled as 'running'
