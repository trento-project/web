Feature: HANA database details view
    This is where the user has a detailed view of the status of one specific discovered HANA database

    Background:
        Given a discovered HANA database within a SAP deployment with the following properties
        # Id: 'fd44c254ccb14331e54015c720c7a1f2',
        # Sid: 'HDD',
        # Hosts: ['vmhdbdev01', 'vmhdbdev02']
        And 2 hosts associated to the HANA database

    Scenario: Detailed view of one specific HANA database is available
        When I navigate to a specific HANA database ('/databases/fd44c254ccb14331e54015c720c7a1f2')
        Then the displayed HANA database SID is correct
        And the displayed HANA database has "HANA Database" type

    Scenario: Not found is given when the HANA database is not available
        When I navigate to a specific HANA database ('/databases/other')
        Then Not found message is displayed

    Scenario: HANA database instances are properly shown
        Given I navigate to a specific HANA database ('/databases/fd44c254ccb14331e54015c720c7a1f2')
        Then 2 instances are displayed
        And the data of each instance is correct
        And the status of each instance is GREEN

    Scenario: HANA database instances status change event is received
        Given I navigate to a specific HANA database ('/databases/fd44c254ccb14331e54015c720c7a1f2')
        When a new HANA database event for this database with the 1st instance with a GRAY status is received
        And the page is refreshed
        Then the status of the 1st instance is GRAY
        When a new HANA database event for this database with the 1st instance with a GREEN status is received
        And the page is refreshed
        Then the status of the 1st instance is GREEN
        When a new HANA database event for this database with the 1st instance with a YELLOW status is received
        And the page is refreshed
        Then the status of the 1st instance is YELLOW
        When a new HANA database event for this database with the 1st instance with a RED status is received
        And the page is refreshed
        Then the status of the 1st instance is RED

    Scenario: New instance is discovered in the HANA database
        Given I navigate to a specific HANA database ('/databases/fd44c254ccb14331e54015c720c7a1f2')
        When a new instance is discovered in a new agent
        Then the new instace is added in the layout table

    Scenario: The hosts table shows all associated hosts
        Given I navigate to a specific HANA database ('/databases/fd44c254ccb14331e54015c720c7a1f2')
        Then the hosts table shows all the associated hosts
        And each host has correct data
