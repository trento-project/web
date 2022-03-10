Feature: SAP Systems Overview
    This is where the user has an overview of the SAP Systems and their attached HANA databases.

    Background:
        Given an healthy SAP deployment consisting of 27 hosts, 1 hana cluster, 1 netweaver cluster
        Given 3 Application SAP Systems with sids 'NWP', 'NWQ', 'NWD'
        Given 1 HANA database for each SAP System 'HDP', 'HDQ', 'HDD'
        And a Trento installation on this Cluster

    Scenario: Registered SAP Systems should be available in the overview
        When I navigate to the SAP Systems overview page
        Then the discovered SID ar the expected ones
        And the health of each of the systems is healthy
        And the links to the to the details page are working

    Scenario: Attached databases details should be available for each SAP System
        When I navigate to the SAP Systems overview page
        Then For each SAP System, the attached databases details (SID, Tenant, IP) are the expected ones
        And the links to the attached database details pages are working

    Scenario: Instances and their details should be available for each SAP System
        When I navigate to the SAP Systems overview page
        Then For each SAP System, the instances details (SID, Feature, Instance number) are the expected ones
        And every instance has a healthy state
        And every instance has the correct host and cluster
        And the link to the host and cluster details page are working
        And the database instances have the correct System Replication and System replication status attached to Secondary Nodes

    Scenario: Filtering the SAP Systems by SID
        Given I navigate to the SAP Systems overview page
        When I filter by SID
        Then I should see only the SAP Systems with the SID I filtered by

    Scenario: Filtering the SAP Systems by Tag
        Given I navigate to the SAP Systems overview page
        And I tag the SAP System with SID 'NWP' with 'env1'
        And I tag the SAP System with SID 'NWQ' with 'env2'
        And I tag the SAP System with SID 'NWD' with 'env3'
        When I filter by tag
        Then I should see only the SAP Systems with the tag I filtered by

    Scenario: System health state is changed upon new SAP system events
        Given I navigate to the SAP Systems overview page
        When a new SAP system event for the first SAP system with the 1st instance with a GRAY status is received
        And the page is refreshed
        Then the status of the 1st instance in this SAP system is GRAY
        And the SAP system state is GRAY
        When a new SAP system event for the first SAP system with the 2nd instance with a YELLOW status is received
        And the page is refreshed
        Then the status of the 2nd instance in this SAP system is YELLOW
        And the SAP system state is YELLOW
        When a new SAP system event for the first SAP system with the 3rd instance with a RED status is received
        And the page is refreshed
        Then the status of the 3rd instance in this SAP system is RED
        And the SAP system state is RED

    Scenario: System health state is changed upon new HANA database events attached
        Given I navigate to the SAP Systems overview page
        When a new HANA database event for the first SAP system with the 1st HANA instance with a RED status is received
        And the page is refreshed
        Then the status of the 1st HANA instance in this SAP system is RED
        And the SAP system state is RED

    Scenario: SAP diagnostic agent discoveries are not displayed
        Given I navigate to the SAP Systems overview page
        When a new SAP discovery with a SAP diagnostics agent is received
        And the page is refreshed
        Then the discovery with the SAP diagnostics agent is not displayed
