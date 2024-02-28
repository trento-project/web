defmodule Trento.Infrastructure.Alerting.AlertingTest do
  @moduledoc false
  use ExUnit.Case, async: true
  use Trento.DataCase

  import ExUnit.CaptureLog

  import Swoosh.TestAssertions

  import Trento.Factory

  alias Trento.Infrastructure.Alerting.Alerting

  @moduletag :integration

  @some_sender "some.sender@email.com"
  @some_recipient "some.recipient@email.com"

  describe "Enabling/Disabling Alerting Feature" do
    setup do
      on_exit(fn ->
        Application.put_env(:trento, :alerting,
          enabled: true,
          sender: @some_sender,
          recipient: @some_recipient
        )
      end)
    end

    test "No email should be sent when alerting is disabled" do
      Application.put_env(:trento, :alerting, enabled: false)
      host_id = Faker.UUID.v4()

      Alerting.notify_critical_host_health(host_id)

      assert_no_email_sent()
    end

    test "An error should be raised when alerting is enabled but no recipient was provided" do
      Application.put_env(:trento, :alerting,
        enabled: true,
        sender: @some_sender
        # no recipient set
      )

      sap_system_id = Faker.UUID.v4()
      insert(:sap_system, id: sap_system_id)

      assert_raise ArgumentError,
                   ~r/Unexpected tuple format, {"Trento Admin", nil} cannot be formatted into a Recipient./,
                   fn -> Alerting.notify_critical_sap_system_health(sap_system_id) end

      assert_no_email_sent()
    end

    test "An error should be raised when alerting is enabled but no sender was provided" do
      Application.put_env(:trento, :alerting,
        enabled: true,
        # no sender set
        recipient: @some_recipient
      )

      sap_system_id = Faker.UUID.v4()
      insert(:sap_system, id: sap_system_id)

      assert_raise ArgumentError,
                   ~r/Unexpected tuple format, {"Trento Alerts", nil} cannot be formatted into a Recipient./,
                   fn -> Alerting.notify_critical_sap_system_health(sap_system_id) end

      assert_no_email_sent()
    end
  end

  describe "Alerting the configured recipient about crucial facts with email notifications" do
    test "Notify Host Health going critical" do
      host_id = Faker.UUID.v4()
      host = insert(:host, id: host_id)

      Alerting.notify_critical_host_health(host_id)
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

  describe "Alerting errors" do
    setup do
      on_exit(fn ->
        Application.put_env(:trento, :alerting,
          enabled: true,
          sender: @some_sender,
          recipient: @some_recipient
        )

        Application.put_env(:trento, Trento.Mailer, adapter: Swoosh.Adapters.Test)
      end)
    end

    test "should be caught if SMTP server is wrongly set up" do
      relay_ip_address = Faker.Internet.ip_v4_address()

      Application.put_env(:trento, Trento.Mailer,
        adapter: Swoosh.Adapters.SMTP,
        relay: "smtp://#{relay_ip_address}"
      )

      Application.put_env(:trento, :alerting,
        enabled: true,
        sender: @some_sender,
        recipient: @some_recipient
      )

      host_id = Faker.UUID.v4()
      insert(:host, id: host_id)

      assert capture_log(fn -> Alerting.notify_critical_host_health(host_id) end) =~
               "Failed to lookup smtp://#{relay_ip_address}"
    end
  end
end
