Feature: SAP system details view
    This is where the user has a detailed view of the status of one specific discovered SAP system

    Background:
        Given a discovered SAP system within a SAP deployment with the following properties
        # Id: 'f534a4ad-cef7-5234-b196-e67082ffb50c',
        # Sid: 'NWD',
        # Hosts: ['vmnwdev01', 'vmnwdev02', 'vmnwdev03', 'vmnwdev04']
        And 4 hosts associated to the SAP system

    Scenario: Detailed view of one specific SAP system is available
        When I navigate to a specific SAP system ('/sap_systems/f534a4ad-cef7-5234-b196-e67082ffb50c')
        Then the displayed SAP system SID is correct
        And the displayed SAP system has "Application server" type

    Scenario: Not found is given when the SAP system is not available
        When I navigate to a specific SAP system ('/sapsystems/other')
        Then Not found message is displayed

    Scenario: SAP system instances are properly shown
        Given I navigate to a specific SAP system ('/sap_systems/f534a4ad-cef7-5234-b196-e67082ffb50c')
        Then 4 instances are displayed
        And the data of each instance is correct
        And the status of each instance is GREEN

    Scenario: SAP system instances status change event is received
        Given I navigate to a specific SAP system ('/sap_systems/f534a4ad-cef7-5234-b196-e67082ffb50c')
        When a new SAP system event for this system with the 1st instance with a GRAY status is received
        Then the status of the 1st instance is GRAY
        When a new SAP system event for this system with the 1st instance with a GREEN status is received
        Then the status of the 1st instance is GREEN
        When a new SAP system event for this system with the 1st instance with a YELLOW status is received
        Then the status of the 1st instance is YELLOW
        When a new SAP system event for this system with the 1st instance with a RED status is received
        Then the status of the 1st instance is RED

    Scenario: New instance is discovered in the SAP system
        Given I navigate to a specific SAP system ('/sap_systems/f534a4ad-cef7-5234-b196-e67082ffb50c')
        When a new instance is discovered in a new agent
        Then the new instance is added in the layout table

    Scenario: The hosts table shows all associated hosts
        Given I navigate to a specific SAP system ('/sap_systems/f534a4ad-cef7-5234-b196-e67082ffb50c')
        Then the hosts table shows all the associated hosts
        And each host has correct data
