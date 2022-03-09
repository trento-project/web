Feature: Checks catalog
This view shows all the available checks with their detailed information and remediation

Background:
    Given a populated checks catalog with 35 checks

Scenario: All the check groups and checks are shown in the catalog
    When I navigate to the Checks catalog view (/catalog)
    Then the displayed groups should be the ones listed in catalog.json
    And the displayed checks should be the ones listed in catalog.json

Scenario: All the check groups have the correct checks included
    When I navigate to the Checks catalog view (/catalog)
    Then the displayed checks belong properly to their own group

Scenario: Check detailed information is expanded if the information icon is clicked
    When I click the information details for each of the checks
    Then the detailed information box is expanded
    When I click the information details for each of the checks again
    Then the detailed information box is collapsed

Scenario: Check detailed information is expanded if catalog url included the check id
    When I navigate the Checks catalog adding a specific check id (/catalog#00081D)
    Then the detailed information box is expanded
