# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Infrastructure.Jobs.WorkersTest do
  use ExUnit.Case, async: false
  use Trento.DataCase
  use Oban.Testing, repo: Trento.Repo

  import ExUnit.CaptureLog
  import Mox
  import Swoosh.TestAssertions
  import Trento.Factory
  import Trento.Support.Helpers.AlertingSettingsHelper

  alias Trento.ActivityLog.ActivityLog, as: ActivityLogEntry
  alias Trento.ActivityLog.RetentionTime
  alias Trento.Checks.V1.ExecutionRequested
  alias Trento.Discovery.{DiscardedDiscoveryEvent, DiscoveryEvent}
  alias Trento.Hosts.Commands.CompleteSoftwareUpdatesDiscovery
  alias Trento.Infrastructure.Checks.AMQP.Publisher

  alias Trento.Infrastructure.Jobs.{
    ActivityLogCleaningJob,
    ApiKeyExpirationAlertJob,
    ChecksExecutionJob,
    DiscoveryEventsPruningJob,
    SoftwareUpdatesDiscoveryJob
  }

  alias Trento.Infrastructure.SoftwareUpdates.MockSmlm

  @workers [
    ActivityLogCleaningJob,
    ApiKeyExpirationAlertJob,
    ChecksExecutionJob,
    DiscoveryEventsPruningJob,
    SoftwareUpdatesDiscoveryJob
  ]

  setup :verify_on_exit!

  describe "overlapping runs" do
    test "should skip a new run while the previous one is still running" do
      for worker <- @workers do
        insert_run(worker, "executing")

        assert {:ok, %Oban.Job{conflict?: true}} = Oban.insert(worker.new(%{}))
      end
    end

    test "should run again once the previous run completed" do
      for worker <- @workers do
        insert_run(worker, "completed")

        assert {:ok, %Oban.Job{conflict?: false}} = Oban.insert(worker.new(%{}))
      end
    end
  end

  describe "checks execution" do
    test "should request the due checks executions" do
      %{id: host_id} = insert(:host)

      expect(Trento.Infrastructure.Messaging.Adapter.Mock, :publish, fn Publisher,
                                                                        "executions",
                                                                        %ExecutionRequested{
                                                                          group_id: ^host_id
                                                                        } ->
        :ok
      end)

      assert :ok = perform_job(ChecksExecutionJob, %{})
    end
  end

  describe "software updates discovery" do
    test "should complete when the software updates settings are not configured" do
      log = capture_log(fn -> assert :ok = perform_job(SoftwareUpdatesDiscoveryJob, %{}) end)

      assert log =~ "Software updates settings not configured. Skipping discovery."
    end

    test "should discover the software updates of every host when the settings are configured" do
      insert_software_updates_settings()
      insert_list(3, :host)

      stub_with(Trento.SoftwareUpdates.Discovery.Mock, MockSmlm)

      expect(Trento.Commanded.Mock, :dispatch, 3, fn %CompleteSoftwareUpdatesDiscovery{} ->
        :ok
      end)

      assert :ok = perform_job(SoftwareUpdatesDiscoveryJob, %{})
    end
  end

  describe "api key expiration alert" do
    setup :restore_alerting_app_env

    setup do
      clear_alerting_app_env()
      insert(:alerting_settings, enabled: true)

      :ok
    end

    test "should notify that the api key expired" do
      insert(:api_key_settings, expire_at: DateTime.add(DateTime.utc_now(), -1, :day))

      assert :ok = perform_job(ApiKeyExpirationAlertJob, %{})

      assert_email_sent(subject: "Trento Alert: Api key expired")
    end
  end

  describe "activity log cleaning" do
    test "should delete the activity log entries older than the retention time" do
      insert(:activity_log_settings, retention_time: %RetentionTime{value: 1, unit: :day})

      insert(:activity_log_entry, inserted_at: DateTime.add(DateTime.utc_now(), -2, :day))

      %{id: valid_id} = insert(:activity_log_entry, inserted_at: DateTime.utc_now())

      assert :ok = perform_job(ActivityLogCleaningJob, %{})

      assert [%{id: ^valid_id}] = Trento.Repo.all(ActivityLogEntry)
    end
  end

  describe "discovery events pruning" do
    test "should delete the discovery events older than the given days" do
      old = DateTime.add(DateTime.utc_now(), -11, :day)
      insert(:discovery_event, discovery_type: "discovery_type", payload: %{}, inserted_at: old)
      insert(:discarded_discovery_event, inserted_at: old)

      assert :ok = perform_job(DiscoveryEventsPruningJob, %{older_than: 10})

      assert [] == Trento.Repo.all(DiscoveryEvent)
      assert [] == Trento.Repo.all(DiscardedDiscoveryEvent)
    end

    test "should keep the discovery events younger than the given days" do
      old = DateTime.add(DateTime.utc_now(), -11, :day)
      insert(:discovery_event, discovery_type: "discovery_type", payload: %{}, inserted_at: old)

      assert :ok = perform_job(DiscoveryEventsPruningJob, %{older_than: 20})

      assert [_] = Trento.Repo.all(DiscoveryEvent)
    end
  end

  defp insert_run(worker, state) do
    {:ok, job} = Oban.insert(worker.new(%{}))

    job
    |> Ecto.Changeset.change(state: state)
    |> Trento.Repo.update!()
  end
end
