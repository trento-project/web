Feature: About
    Show Trento info in the about page

    Background:
        Given an healthy SAP deployment of 27 hosts running SLES4SAP with an active subscription
        And a Trento installation on this Cluster

    Scenario: Trento flavor is shown in the about page
        When I open the about page
        Then I should see that the Trento installation is a "Community" one

    Scenario: Trento version is shown in the about page
        When I open the about page
        Then I should see the current version of the Trento installation

    Scenario: Trento GitHub repository is shown in the about page
        When I open the about page
        Then I should a link to the Trento GH repository

    Scenario: SLES for SAP subscription shows 27 hosts found in the about page
        When I open the about page
        Then I should see that the SLES for SAP subscription has 27 hosts
