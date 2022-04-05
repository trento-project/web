defmodule Trento.Application.UseCases.AlertingTest do
  use ExUnit.Case, async: true
  use Trento.DataCase

  import Swoosh.TestAssertions

  import Trento.Factory

  alias Trento.Application.UseCases.Alerting

  @moduletag :integration

  describe "Alerting the configured recipient about crucial facts with email notifications" do
    test "Notify Host heartbeating failure" do
      host_id = Faker.UUID.v4()
      host = host_projection(id: host_id)

      Alerting.notify_heartbeat_failed(host_id)
      assert_email_sent(subject: "Trento Alert: Host #{host.hostname} needs attention.")
    end

    test "Notify Cluster Health going critical" do
      cluster_id = Faker.UUID.v4()
      cluster = cluster_projection(id: cluster_id)

      Alerting.notify_critical_cluster_health(cluster_id)
      assert_email_sent(subject: "Trento Alert: Cluster #{cluster.name} needs attention.")
    end

    test "Notify Database Health going critical" do
      database_id = Faker.UUID.v4()
      database = database_projection(id: database_id)

      Alerting.notify_critical_database_health(database_id)
      assert_email_sent(subject: "Trento Alert: Database #{database.sid} needs attention.")
    end

    test "Notify SAP System Health going critical" do
      sap_system_id = Faker.UUID.v4()
      sap_system = sap_system_projection(id: sap_system_id)

      Alerting.notify_critical_sap_system_health(sap_system_id)
      assert_email_sent(subject: "Trento Alert: Sap System #{sap_system.sid} needs attention.")
    end
  end
end
