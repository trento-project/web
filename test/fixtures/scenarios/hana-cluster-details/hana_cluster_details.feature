Feature: HANA cluster details
    The detail page of a HANA cluster

    Background:
        Given an SAP HANA scale-up cluster with name "hana_cluster_3" and id "9c832998801e28cd70ad77380e82a5c0"
        Given two sites with one host each are part of the cluster
        Given checks were performed on the clusters resulting in 2 checks in critical state,
    2 checks in warning state and 2 checks in passing state

    Scenario: HANA cluster details are the expected ones
        When I navigate to the Pacemaker Clusters Overview (/clusters)
        Then the displayed cluster at a glance detauks should be consistent with the state of the cluster

    Scenario: Cluster health count should show the expected checks status
        When I check the health summary of the cluster
        Then the critical count should be 2
        Then the warning count should be 2
        Then the passing count should be 2

    Scenario: Check results modal should show the expected checks
        When I click on the check results button
        Then the check results modal should be displayed
        And the check results checks list and results should show the expected checks

    Scenario: Check results modal filter works as expected
        When I filter the check results by warning or passing status
        And the check results checks should be the ones in warning or passing status

    Scenario: Cluster sites section should have the expected hosts
        When I scroll to the site section
        Then it should show two sites with one host each
        And the hosts should have the expected host "name", "ip", "virtual ip" and "role"

    Scenario: Host details modal should show the expected host details
        When I click on the host details button
        Then the host details modal should be displayed
        And the "Attribute" tab should show the expected host attributes
        And the "Resources" tab should show the expected host resources

    Scenario: Cluster SBD should have the expected devices and status
        When I scroll to the SBD section
        Then it should show the expected SBD devices name
        And they should have the expected health
