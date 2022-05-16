defmodule Trento.Application.UseCases.AlertingTest do
  use ExUnit.Case, async: true
  use Trento.DataCase

  import Swoosh.TestAssertions

  import Trento.Factory

  alias Trento.Application.UseCases.Alerting

  @moduletag :integration

  describe "Enabling/Disabling Alerting Feature" do
    setup do
      on_exit(fn ->
        Application.put_env(:trento, :alerting,
          enabled: true,
          recipient: "some.recipient@email.com"
        )
      end)
    end

    test "No email should be sent when alerting is disabled" do
      Application.put_env(:trento, :alerting, enabled: false)
      host_id = Faker.UUID.v4()

      Alerting.notify_heartbeat_failed(host_id)

      assert_no_email_sent()
    end

    test "An error should be raised when alerting is enabled but no recipient was provided" do
      Application.put_env(:trento, :alerting, enabled: true)
      sap_system_id = Faker.UUID.v4()
      insert(:sap_system, id: sap_system_id)

      assert_raise ArgumentError,
                   ~r/Unexpected tuple format, {"Trento Admin", nil} cannot be formatted into a Recipient./,
                   fn -> Alerting.notify_critical_sap_system_health(sap_system_id) end

      assert_no_email_sent()
    end
  end

  describe "Alerting the configured recipient about crucial facts with email notifications" do
    test "Notify Host heartbeating failure" do
      host_id = Faker.UUID.v4()
      host = insert(:host, id: host_id)

      Alerting.notify_heartbeat_failed(host_id)
      assert_email_sent(subject: "Trento Alert: Host #{host.hostname} needs attention.")
    end

    test "Notify Cluster Health going critical" do
      cluster_id = Faker.UUID.v4()
      cluster = insert(:cluster, id: cluster_id)

      Alerting.notify_critical_cluster_health(cluster_id)
      assert_email_sent(subject: "Trento Alert: Cluster #{cluster.name} needs attention.")
    end

    test "Notify Database Health going critical" do
      database_id = Faker.UUID.v4()
      database = insert(:database, id: database_id)

      Alerting.notify_critical_database_health(database_id)
      assert_email_sent(subject: "Trento Alert: Database #{database.sid} needs attention.")
    end

    test "Notify SAP System Health going critical" do
      sap_system_id = Faker.UUID.v4()
      sap_system = insert(:sap_system, id: sap_system_id)

      Alerting.notify_critical_sap_system_health(sap_system_id)
      assert_email_sent(subject: "Trento Alert: Sap System #{sap_system.sid} needs attention.")
    end
  end
end
