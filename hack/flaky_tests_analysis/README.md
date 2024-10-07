# Flaky Tests Analysis

Provides make targets to check for flaky tests across BE, FE and E2E suites. These make targets when invoked with appropriate params, return a mostly complete list of flaky tests, ordered by a computed measure of flakiness.

## How it works

1. Run phase: Runs test suite repeatedly (e.g. 100 times), and collecting trace of each run in JUnit format.
2. Analyze phase: Once there are JUnit files collected in one place, running the analyze-files target computes measures of flakiness over all executed tests and returns the top N (40 by default) tests.

### Run phase

```
# for running entire be, fe or e2e suite
❯ make N-TIMES=500 gen-test-data-be
❯ make N-TIMES=500 gen-test-data-fe
❯ make N-TIMES=500 gen-test-data-e2e

# Run specific suite/grouping of be, fe or e2e tests
❯ make RUN_ONLY=./test/trento/users_test.exs  N-TIMES=100 gen-test-data-be
❯ make RUN_ONLY=generatePassword.test.js  N-TIMES=50 gen-test-data-fe
❯ make RUN_ONLY=./cypress/e2e/about.cy.js N-TIMES=10 gen-test-data-e2e
```
By default this will write to the `/tmp` directory. Approximate run time is 30 minutes per 100 test runs.

Next we pass the generated JUnit XML files and pass them to the python script.
The script parses the files and scores the failing tests according to their "flip-rate".
We also save a raw log of the CLI output of `mix test`. This would be useful for searching through 
and understanding the reasons/trace of failing/flaky tests.

### Analyze phase

First, we install python dependencies needed by the script file.
There is a make target provided by this, as well as a requirements file should one choose to do so in a custom/different way.


```
❯ make venv-create
❯ source .venv/bin/activate
❯ make install-deps

```

```
# Here we analyze files generated from run of be tests, but the commands are same/similar for files from fe or e2e tests.
❯ make PATH-TO-JUNIT-FILES=/tmp analyze-files
flaky --junit-files=/tmp --grouping-option=runs --window-size=5 --window-count=100 --top-n=40

Top 40 flaky tests based on latest window exponential weighted moving average fliprate score
Elixir.Trento.Infrastructure.Alerting.AlertingTest::test Alerting the configured recipient about crucial facts with email notifications Notify api key will be expired soon --- score: 0.1038
Elixir.TrentoWeb.V1.ProfileControllerTest::test should not confirm a totp enrollment if totp is already enabled for the user --- score: 0.08546
Elixir.Trento.Infrastructure.Commanded.EventHandlers.DatabaseDeregistrationEventHandlerTest::test should dispatch DeregisterSapSystem commands when a tenant is removed --- score: 0.08458
Elixir.TrentoWeb.V1.UsersControllerTest::test index lists all users --- score: 0.07423
Elixir.TrentoWeb.V1.HostControllerTest::test delete should allow the request when the user has cleanup:host ability --- score: 0.07392
Elixir.TrentoWeb.V1.ProfileControllerTest::test should not confirm a totp enrollment if totp is not valid --- score: 0.05231
Elixir.Trento.SapSystems.SapSystemTest::test SAP System registration should register and not move an application instance, if the instance number exists but it's in another host and the application is not clustered --- score: 0.05102
Elixir.TrentoWeb.V1.UsersControllerTest::test update user should not update the user if parameters are valid but an error is returned from update operation --- score: 0.05001
Elixir.Trento.Infrastructure.Checks.AMQP.ConsumerTest::test handle_error/1 should reject unknown events and move them to the dead letter queue --- score: 0.05001
Elixir.Trento.SapSystems.SapSystemTest::test SAP System registration should not register or move application, if the application has an already existing instance number and the host is the same --- score: 0.05001
Elixir.TrentoWeb.V1.ClusterControllerTest::test request check executions should perform the request when the user has all:cluster_checks_execution ability --- score: 0.05001
Elixir.TrentoWeb.V1.HostControllerTest::test Request check executions should perform the request when the user has all:host_checks_execution ability --- score: 0.05001
Elixir.TrentoWeb.V1.ProfileControllerTest::test should not reset totp when a reset is requested for the default admin --- score: 0.05001
Elixir.Trento.UsersTest::test users update_user/2 returns error if the email has already been taken --- score: 0.05001
Elixir.TrentoWeb.V1.SapSystemControllerTest::test forbidden response should return forbidden on any controller action if the user does not have the right permission --- score: 0.05001
Elixir.TrentoWeb.V1.TagsControllerTest::test forbidden actions should not return forbidden on any controller action if the user have the right ability for the tag resource --- score: 0.05001
Elixir.TrentoWeb.V1.ProfileControllerTest::test should return forbidden if the totp enrollment is requested for default admin --- score: 0.05001
Elixir.Trento.SapSystems.SapSystemTest::test SAP System registration should move an application instance if the host_id changed and the instance number already exists and the application is clustered --- score: 0.02501
Elixir.TrentoWeb.V1.ProfileControllerTest::test should not confirm a totp enrollment for the default admin --- score: 0.02501
Elixir.TrentoWeb.V1.DatabaseControllerTest::test delete should allow the request when the user has cleanup:database_instance ability --- score: 0.02501
Elixir.TrentoWeb.V1.SapSystemControllerTest::test delete should allow the request when the user has cleanup:application_instance ability --- score: 0.02501
Elixir.TrentoWeb.V1.UsersControllerTest::test update user should update the user if parameters are valid --- score: 0.02501
```


From front-end jest tests:

```
❯ make analyze-files
python check_flakes.py --junit-files=/tmp --grouping-option=runs --window-size=5 --window-count=100 --top-n=40

Top 40 flaky tests based on latest window exponential weighted moving average fliprate score
SuseManagerSettingsModal component::should try to save all the fields --- score: 0.4945
SuseManagerSettingsModal component::should attempt saving only what changed --- score: 0.4945
PatchList::renders the content correctly --- score: 0.1325
search::should not match not included words --- score: 0.06413
Table component::should display the header --- score: 0.05145
Label Component::should display an info tooltip if specified --- score: 0.05001
UsersPage::should render toast with error message when deleting failed --- score: 0.05001
Table component › filtering::should filter by the chosen filter option with default filter --- score: 0.05001
UpgradablePackagesList component::should render the upgradable packages list --- score: 0.03644
HanaClusterDetails component::should display a host link in the site details if the host is registered --- score: 0.02501
```
