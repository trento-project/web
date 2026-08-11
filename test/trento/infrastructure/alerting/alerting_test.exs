# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Infrastructure.Alerting.AlertingTest do
  @moduledoc false
  use ExUnit.Case, async: true
  use Trento.DataCase

  import ExUnit.CaptureLog

  import Swoosh.TestAssertions

  import Trento.Factory
  import Trento.Support.Helpers.AlertingSettingsHelper

  alias Trento.Clusters.Projections.ClusterReadModel
  alias Trento.Databases.Projections.DatabaseInstanceReadModel
  alias Trento.Hosts.Projections.HostReadModel
  alias Trento.Infrastructure.Alerting.Alerting
  alias Trento.SapSystems.Projections.ApplicationInstanceReadModel

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
      insert(:api_key_settings, expire_at: DateTime.add(DateTime.utc_now(), 28 * 24 + 1, :hour))

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

    test "Notify heartbeat failed including the resources running in the host" do
      failed_at = DateTime.utc_now()

      %ClusterReadModel{id: cluster_id, name: cluster_name} = insert(:cluster)

      %HostReadModel{id: host_id, hostname: hostname} = insert(:host, cluster_id: cluster_id)

      %{id: sap_system_id} = insert(:sap_system)
      %{id: database_id} = insert(:database)

      %ApplicationInstanceReadModel{
        sid: application_sid,
        instance_number: application_instance_number
      } =
        insert(:application_instance,
          host_id: host_id,
          sap_system_id: sap_system_id,
          instance_number: "00"
        )

      %DatabaseInstanceReadModel{sid: database_sid, instance_number: database_instance_number} =
        insert(:database_instance,
          host_id: host_id,
          database_id: database_id,
          instance_number: "10"
        )

      Alerting.notify_heartbeat_failed(host_id, failed_at)

      assert_email_sent(fn %Swoosh.Email{subject: subject, html_body: html_body} ->
        assert subject == "Trento Alert: Host #{hostname} stopped reporting."

        assert html_body =~ "Host: <b>#{hostname}</b>"
        assert html_body =~ "Host ID: <b>#{host_id}</b>"

        assert html_body =~
                 "Stale since: <b>#{Calendar.strftime(failed_at, "%Y-%m-%d %H:%M:%S UTC")}</b>"

        assert html_body =~ "Cluster: <b>#{cluster_name}</b>"
        assert html_body =~ "Cluster ID: <b>#{cluster_id}</b>"

        assert html_body =~
                 "SAP application instance: <b>#{application_sid}</b> - instance number <b>#{application_instance_number}</b>"

        assert html_body =~ "SAP system ID: <b>#{sap_system_id}</b>"

        assert html_body =~
                 "Database instance: <b>#{database_sid}</b> - instance number <b>#{database_instance_number}</b>"

        assert html_body =~ "Database ID: <b>#{database_id}</b>"
      end)
    end

    test "Notify heartbeat failed filtering out deregistered clusters" do
      %ClusterReadModel{id: cluster_id, name: cluster_name} =
        insert(:cluster, deregistered_at: DateTime.utc_now())

      %HostReadModel{id: host_id, hostname: hostname} = insert(:host, cluster_id: cluster_id)

      Alerting.notify_heartbeat_failed(host_id, DateTime.utc_now())

      assert_email_sent(fn %Swoosh.Email{subject: subject, html_body: html_body} ->
        refute html_body =~ cluster_name
        refute html_body =~ cluster_id

        assert subject == "Trento Alert: Host #{hostname} stopped reporting."
      end)
    end

    test "Notify heartbeat failed without resources running in the host" do
      %HostReadModel{id: host_id, hostname: hostname} = insert(:host, cluster_id: nil)

      Alerting.notify_heartbeat_failed(host_id, DateTime.utc_now())

      assert_email_sent(fn %Swoosh.Email{subject: subject, html_body: html_body} ->
        refute html_body =~ "were running on the host"

        assert subject == "Trento Alert: Host #{hostname} stopped reporting."
      end)
    end
  end

  describe "Alerting errors" do
    setup do
      on_exit(fn ->
        Application.put_env(:trento, Trento.Mailer, adapter: Swoosh.Adapters.Test)
      end)
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
