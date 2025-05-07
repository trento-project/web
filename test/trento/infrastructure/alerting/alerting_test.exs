defmodule Trento.Infrastructure.Alerting.AlertingTest do
  @moduledoc false
  use ExUnit.Case, async: true
  use Trento.DataCase

  import ExUnit.CaptureLog

  import Swoosh.TestAssertions

  import Trento.Factory
  import Trento.Support.Helpers.AlertingSettingsHelper

  alias Trento.Infrastructure.Alerting.Alerting

  @moduletag :integration

  setup :restore_alerting_app_env

  describe "When alerting is disabled or not configured" do
    test "no email is sent and error is returned when alerting is not configured" do
      clear_alerting_app_env()

      host_id = Faker.UUID.v4()

      result = Alerting.notify_critical_host_health(host_id)

      assert_no_email_sent()
      assert :ok = result
    end

    test "no email should be sent when alerting is disabled" do
      Application.put_env(:trento, :alerting, enabled: false)
      host_id = Faker.UUID.v4()

      result = Alerting.notify_critical_host_health(host_id)

      assert_no_email_sent()
      assert :ok = result
    end
  end

  describe "Alerting the configured recipient about crucial facts with email notifications" do
    setup do
      Application.put_env(:trento, :alerting, enabled: true)
    end

    test "Notify api key will be expired soon" do
      insert(:api_key_settings, expire_at: DateTime.add(DateTime.utc_now(), 28, :day))

      Alerting.notify_api_key_expiration()

      assert_email_sent(subject: "Trento Alert: Api key will expire in 28 days")
    end

    test "Notify api key is expired" do
      insert(:api_key_settings, expire_at: DateTime.add(DateTime.utc_now(), -1, :day))

      Alerting.notify_api_key_expiration()

      assert_email_sent(subject: "Trento Alert: Api key expired")
    end

    test "Should not notify if the api key expiration is infinite" do
      insert(:api_key_settings, expire_at: nil)

      Alerting.notify_api_key_expiration()

      assert_no_email_sent()
    end

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
      on_exit(fn -> Application.put_env(:trento, Trento.Mailer, adapter: Swoosh.Adapters.Test) end)
    end

    test "should be caught if SMTP server is wrongly set up" do
      relay_ip_address = Faker.Internet.ip_v4_address()

      Application.put_env(
        :trento,
        :alerting,
        enabled: true,
        smtp_server: "smtp://#{relay_ip_address}"
      )

      Application.put_env(:trento, Trento.Mailer, adapter: Swoosh.Adapters.SMTP)

      host_id = Faker.UUID.v4()
      insert(:host, id: host_id)

      assert capture_log(fn -> Alerting.notify_critical_host_health(host_id) end) =~
               "Failed to lookup smtp://#{relay_ip_address}"
    end
  end
end
