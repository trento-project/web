Feature: Checks catalog
This view shows all the available checks with their detailed information and remediation

Background:
    Given a populated checks catalog with 35 checks

Scenario: All the check groups and checks are shown in the catalog
    When I navigate to the Checks catalog view (/catalog)
    Then the displayed groups should be the ones listed in "catalog.json"
    And the displayed checks should be the ones listed in "catalog.json"

Scenario: All the check groups have the correct checks included
    When I navigate to the Checks catalog view (/catalog)
    Then the displayed checks belong properly to their own group

Scenario: The catalog shows the provider specific checks
    When I select azure as the provider
    Then the catalog with the checks belonging to azure are shown
    When I select aws as the provider
    Then the catalog with the checks belonging to aws are shown

Scenario: Check detailed information is expanded if the check row is clicked
    When I click the check entry row
    Then the detailed information box is expanded
    When I click the check entry row again
    Then the detailed information box is collapsed
