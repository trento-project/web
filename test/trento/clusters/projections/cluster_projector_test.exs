# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Clusters.Projections.ClusterProjectorTest do
  use ExUnit.Case
  use Trento.DataCase

  import Phoenix.ChannelTest
  import TrentoWeb.ChannelCase

  import Trento.Factory

  require Trento.Clusters.Enums.ClusterType, as: ClusterType
  require Trento.Enums.Health, as: Health

  alias Trento.Clusters.Events.{
    ClusterDataMarkedInSync,
    ClusterDataMarkedStale,
    ClusterDeregistered,
    ClusterHealthChanged,
    ClusterRestored
  }

  alias Trento.Clusters.Projections.{
    AscsErsClusterHealthDetails,
    ClusterProjector,
    ClusterReadModel,
    HanaClusterHealthDetails
  }

  alias Trento.ProjectorTestHelper
  alias Trento.Repo

  alias Trento.Support.HealthValueDetails
  alias Trento.Support.StructHelper

  @moduletag :integration

  @endpoint TrentoWeb.Endpoint

  setup do
    {:ok, _, socket} =
      TrentoWeb.UserSocket
      |> socket("user_id", %{some: :assign})
      |> subscribe_and_join(TrentoWeb.MonitoringChannel, "monitoring:clusters")

    %{socket: socket}
  end

  describe "ClusterRegistered" do
    test "projects cluster common fields into the read model" do
      event =
        %{
          cluster_id: cluster_id,
          name: name,
          type: type,
          provider: provider,
          resources_number: resources_number,
          hosts_number: hosts_number,
          health: health,
          state: state,
          details: details,
          sap_instances: sap_instances
        } = build(:cluster_registered_event)

      ProjectorTestHelper.project(ClusterProjector, event, "cluster_projector")

      # `details` is saved as JSON and returned as atom-keyed
      # map. JSON converts atom values to strings. Thus, we first
      # convert the original `details` to full map, then atomize only
      # the keys.
      details_map =
        details
        |> StructHelper.to_map()
        |> StructHelper.to_atomized_map()

      assert %ClusterReadModel{
               id: ^cluster_id,
               name: ^name,
               provider: ^provider,
               type: ^type,
               resources_number: ^resources_number,
               hosts_number: ^hosts_number,
               health: ^health,
               state: ^state,
               details: ^details_map,
               sap_instances: ^sap_instances
             } = Repo.get!(ClusterReadModel, cluster_id)
    end

    @scenarios [
      %{
        type: ClusterType.hana_scale_up(),
        cluster_type_fn: &cluster_registered_event_make_hana/1,
        exp_struct: HanaClusterHealthDetails,
        exp_fields: [:checks_health, :sbd_health, :replication_health]
      },
      %{
        type: ClusterType.ascs_ers(),
        cluster_type_fn: &cluster_registered_event_make_ascs_ers/1,
        exp_struct: AscsErsClusterHealthDetails,
        exp_fields: [:checks_health, :sbd_health, :distributed_health]
      }
    ]
    for scenario <- @scenarios do
      @scenario scenario

      test "projects cluster `health_details` for type #{scenario.type}" do
        %{cluster_type_fn: cluster_type_fn, exp_struct: exp_struct, exp_fields: exp_fields} =
          @scenario

        event =
          :cluster_registered_event
          |> build()
          |> cluster_type_fn.()

        ProjectorTestHelper.project(ClusterProjector, event, "cluster_projector")
        cluster_projection = Repo.get!(ClusterReadModel, event.cluster_id)

        assert %^exp_struct{} = cluster_projection.health_details

        for field <- exp_fields do
          expected_value = Map.fetch!(event.health_details, field)
          projected_value_details = Map.fetch!(cluster_projection.health_details, field)

          assert expected_value == projected_value_details.value
        end
      end
    end

    test "projects cluster `health_details` as nil when event does not contain health details" do
      event = build(:cluster_registered_event, health_details: nil)

      ProjectorTestHelper.project(ClusterProjector, event, "cluster_projector")
      cluster_projection = Repo.get!(ClusterReadModel, event.cluster_id)

      assert nil == cluster_projection.health_details
    end

    test "broadcasts cluster_registered event over phoenix channel" do
      event = %{cluster_id: cluster_id} = build(:cluster_registered_event)

      ProjectorTestHelper.project(ClusterProjector, event, "cluster_projector")

      assert_broadcast(
        "cluster_registered",
        %{id: ^cluster_id, cib_last_written: nil} = message,
        1000
      )

      expected_keys =
        MapSet.new([
          :id,
          :name,
          :provider,
          :type,
          :resources_number,
          :hosts_number,
          :health,
          :health_details,
          :state,
          :details,
          :cib_last_written,
          :selected_checks,
          :stale_at,
          :inserted_at,
          :updated_at,
          :sid,
          :additional_sids,
          :sap_instances
        ])

      assert expected_keys == MapSet.new(Map.keys(message))

      # Check message can be properly encoded to JSON
      assert {:ok, _} = Jason.encode(message)
    end
  end

  describe "ClusterDetailsUpdated" do
    @scenarios [
      %{
        name: "'HANA cluster -> Hana cluster'",
        cluster_type_fn: &cluster_make_hana/1,
        event_type_fn: &cluster_details_updated_event_make_hana/1
      },
      %{
        name: "'Unknown cluster  -> Hana cluster'",
        cluster_type_fn: &cluster_make_unknown/1,
        event_type_fn: &cluster_details_updated_event_make_hana/1
      },
      %{
        name: "'ASCS/ERS cluster -> ASCS/ERS cluster'",
        cluster_type_fn: &cluster_make_ascs_ers/1,
        event_type_fn: &cluster_details_updated_event_make_ascs_ers/1
      },
      %{
        name: "'Unknown cluster -> ASCS/ERS cluster'",
        cluster_type_fn: &cluster_make_unknown/1,
        event_type_fn: &cluster_details_updated_event_make_ascs_ers/1
      }
    ]
    for scenario <- @scenarios do
      @scenario scenario

      test "projects updated fields for case #{scenario.name} into the read model" do
        %{cluster_type_fn: cluster_type_fn, event_type_fn: event_type_fn} = @scenario

        %{id: cluster_id} =
          :cluster
          |> build()
          |> cluster_type_fn.()
          |> insert()

        event =
          %{
            name: name,
            type: type,
            provider: provider,
            resources_number: resources_number,
            hosts_number: hosts_number,
            state: state,
            details: details,
            sap_instances: sap_instances
          } =
          :cluster_details_updated_event
          |> build(cluster_id: cluster_id)
          |> event_type_fn.()

        ProjectorTestHelper.project(
          ClusterProjector,
          event,
          "cluster_projector"
        )

        # `details` is saved as JSON and returned as atom-keyed
        # map. JSON converts atom values to strings. Thus, we first
        # convert the original `details` to full map, then atomize only
        # the keys.
        details_map =
          details
          |> StructHelper.to_map()
          |> StructHelper.to_atomized_map()

        assert %ClusterReadModel{
                 id: ^cluster_id,
                 name: ^name,
                 type: ^type,
                 provider: ^provider,
                 resources_number: ^resources_number,
                 hosts_number: ^hosts_number,
                 state: ^state,
                 details: ^details_map,
                 sap_instances: ^sap_instances
               } = Repo.get!(ClusterReadModel, cluster_id)
      end

      test "broadcasts updated fields for case #{scenario.name} to the phoenix channel" do
        %{cluster_type_fn: cluster_type_fn, event_type_fn: event_type_fn} = @scenario

        %{id: cluster_id} =
          :cluster
          |> build()
          |> cluster_type_fn.()
          |> insert()

        event =
          :cluster_details_updated_event
          |> build(cluster_id: cluster_id)
          |> event_type_fn.()

        ProjectorTestHelper.project(
          ClusterProjector,
          event,
          "cluster_projector"
        )

        assert_broadcast(
          "cluster_details_updated",
          %{id: ^cluster_id} = message,
          1000
        )

        expected_keys =
          MapSet.new([
            :id,
            :name,
            :provider,
            :type,
            :resources_number,
            :hosts_number,
            :state,
            :details,
            :sid,
            :additional_sids,
            :sap_instances,
            :version
          ])

        assert expected_keys == MapSet.new(Map.keys(message))

        # Check message can be properly encoded to JSON
        assert {:ok, _} = Jason.encode(message)
      end
    end

    @scenarios [
      %{
        name: "Hana cluster",
        cluster_type_fn: &cluster_make_hana/1,
        event_type_fn: &cluster_details_updated_event_make_hana/1,
        exp_health_details_module: HanaClusterHealthDetails,
        exp_health_details_fields: [:checks_health, :sbd_health, :replication_health]
      },
      %{
        name: "ASCS/ERS cluster",
        cluster_type_fn: &cluster_make_ascs_ers/1,
        event_type_fn: &cluster_details_updated_event_make_ascs_ers/1,
        exp_health_details_module: AscsErsClusterHealthDetails,
        exp_health_details_fields: [:checks_health, :sbd_health, :distributed_health]
      }
    ]
    for scenario <- @scenarios do
      @scenario scenario

      test "should set default health details after cluster details update to #{scenario.name} from Unknown type" do
        %{id: cluster_id} =
          :cluster
          |> build()
          |> cluster_make_unknown()
          |> insert()

        event =
          :cluster_details_updated_event
          |> build(cluster_id: cluster_id)
          |> @scenario.event_type_fn.()

        ProjectorTestHelper.project(
          ClusterProjector,
          event,
          "cluster_projector"
        )

        cluster_projection = Repo.get!(ClusterReadModel, cluster_id)

        exp_health_details =
          struct!(
            @scenario.exp_health_details_module,
            Map.new(@scenario.exp_health_details_fields, fn k ->
              {k, %HealthValueDetails{value: Health.unknown()}}
            end)
          )

        assert exp_health_details == cluster_projection.health_details
      end

      test "should not change health details after cluster details update for established cluster of type #{scenario.name}" do
        %{id: cluster_id, health_details: original_health_details} =
          :cluster
          |> build()
          |> @scenario.cluster_type_fn.()
          |> insert()

        event =
          :cluster_details_updated_event
          |> build(cluster_id: cluster_id)
          |> @scenario.event_type_fn.()

        ProjectorTestHelper.project(
          ClusterProjector,
          event,
          "cluster_projector"
        )

        cluster_projection = Repo.get!(ClusterReadModel, cluster_id)

        exp_health_details =
          struct!(
            @scenario.exp_health_details_module,
            Map.new(@scenario.exp_health_details_fields, fn k ->
              {k, Map.fetch!(original_health_details, k)}
            end)
          )

        assert exp_health_details == cluster_projection.health_details
      end
    end
  end

  describe "Individual health change" do
    @scenarios [
      %{
        name: "ClusterChecksHealthChanged",
        event: ClusterChecksHealthChanged,
        health_key: :checks_health,
        event_factory: :cluster_checks_health_changed_event
      },
      %{
        name: "ClusterSbdHealthChanged",
        event: ClusterSbdHealthChanged,
        health_key: :sbd_health,
        event_factory: :cluster_sbd_health_changed_event
      }
    ]
    for scenario <- @scenarios do
      @scenario scenario

      test "#{scenario.name} projects its change into the read model" do
        %{health_key: health_key} = @scenario

        %{id: cluster_id} = insert(:cluster)

        event =
          %{^health_key => expected_health} =
          build(@scenario.event_factory,
            cluster_id: cluster_id
          )

        ProjectorTestHelper.project(
          ClusterProjector,
          event,
          "cluster_projector"
        )

        %{health_details: %{^health_key => %{value: actual_health}}} =
          Repo.get!(ClusterReadModel, cluster_id)

        assert expected_health === actual_health
      end
    end

    @scenarios [
      %{
        name: "ClusterReplicationHealthChanged",
        event: ClusterReplicationHealthChanged,
        health_key: :replication_health,
        cluster_type_fn: &cluster_make_hana/1,
        event_factory: :cluster_replication_health_changed_event
      },
      %{
        name: "ClusterDistributedHealthChanged",
        event: ClusterDistributedHealthChanged,
        health_key: :distributed_health,
        cluster_type_fn: &cluster_make_ascs_ers/1,
        event_factory: :cluster_distributed_health_changed_event
      }
    ]
    for scenario <- @scenarios do
      @scenario scenario

      test "#{scenario.name} projects its change into the read model" do
        %{health_key: health_key} = @scenario

        %{id: cluster_id} =
          :cluster
          |> build()
          |> @scenario.cluster_type_fn.()
          |> insert()

        event =
          %{^health_key => expected_health} =
          build(@scenario.event_factory,
            cluster_id: cluster_id
          )

        ProjectorTestHelper.project(
          ClusterProjector,
          event,
          "cluster_projector"
        )

        %{health_details: %{^health_key => %{value: actual_health}}} =
          Repo.get!(ClusterReadModel, cluster_id)

        assert expected_health === actual_health
      end
    end

    @scenarios [
      %{
        name: "ClusterChecksHealthChanged",
        event: ClusterChecksHealthChanged,
        event_factory: :cluster_checks_health_changed_event,
        characteristic_field: :checks_health
      },
      %{
        name: "ClusterSbdHealthChanged",
        event: ClusterSbdHealthChanged,
        event_factory: :cluster_sbd_health_changed_event,
        characteristic_field: :sbd_health
      }
    ]
    for scenario <- @scenarios do
      @scenario scenario

      test "#{scenario.name} broadcast its change to phoenix channel" do
        %{characteristic_field: characteristic_field} = @scenario

        %{id: cluster_id} = insert(:cluster)

        event =
          build(@scenario.event_factory,
            cluster_id: cluster_id
          )

        ProjectorTestHelper.project(
          ClusterProjector,
          event,
          "cluster_projector"
        )

        assert_broadcast(
          "cluster_health_details_changed",
          %{cluster_id: ^cluster_id, health_details: %{^characteristic_field => _}} = message,
          1000
        )

        expected_keys =
          MapSet.new([
            :cluster_id,
            :health_details
          ])

        assert expected_keys == MapSet.new(Map.keys(message))

        # Check message can be properly encoded to JSON
        assert {:ok, _} = Jason.encode(message)
      end
    end

    @scenarios [
      %{
        name: "ClusterReplicationHealthChanged",
        event: ClusterReplicationHealthChanged,
        cluster_type_fn: &cluster_make_hana/1,
        event_factory: :cluster_replication_health_changed_event,
        characteristic_field: :replication_health
      },
      %{
        name: "ClusterDistributedHealthChanged",
        event: ClusterDistributedHealthChanged,
        cluster_type_fn: &cluster_make_ascs_ers/1,
        event_factory: :cluster_distributed_health_changed_event,
        characteristic_field: :distributed_health
      }
    ]
    for scenario <- @scenarios do
      @scenario scenario

      test "#{scenario.name} broadcast its change to phoenix channel" do
        %{characteristic_field: characteristic_field} = @scenario

        %{id: cluster_id} =
          :cluster
          |> build()
          |> @scenario.cluster_type_fn.()
          |> insert()

        event =
          build(@scenario.event_factory,
            cluster_id: cluster_id
          )

        ProjectorTestHelper.project(
          ClusterProjector,
          event,
          "cluster_projector"
        )

        assert_broadcast(
          "cluster_health_details_changed",
          %{cluster_id: ^cluster_id, health_details: %{^characteristic_field => _}} = message,
          1000
        )

        expected_keys =
          MapSet.new([
            :cluster_id,
            :health_details
          ])

        assert expected_keys == MapSet.new(Map.keys(message))

        # Check message can be properly encoded to JSON
        assert {:ok, _} = Jason.encode(message)
      end
    end
  end

  test "should update the deregistered_at field when ClusterDeregistered is received" do
    insert(:cluster, id: cluster_id = Faker.UUID.v4(), name: name = "deregistered_cluster")
    deregistered_at = DateTime.utc_now()

    event = ClusterDeregistered.new!(%{cluster_id: cluster_id, deregistered_at: deregistered_at})

    ProjectorTestHelper.project(ClusterProjector, event, "cluster_projector")
    cluster_projection = Repo.get!(ClusterReadModel, event.cluster_id)

    assert event.deregistered_at == cluster_projection.deregistered_at

    assert_broadcast(
      "cluster_deregistered",
      %{id: ^cluster_id, name: ^name},
      1000
    )
  end

  test "should set deregistered_at field to nil when ClusterRestored is received" do
    %{id: cluster_id, name: name, type: type} =
      insert(:cluster,
        name: "deregistered_cluster",
        selected_checks: [],
        deregistered_at: DateTime.utc_now()
      )

    insert_list(5, :tag, resource_id: cluster_id)

    event = ClusterRestored.new!(%{cluster_id: cluster_id})

    ProjectorTestHelper.project(ClusterProjector, event, "cluster_projector")

    %{tags: tags} =
      cluster_projection =
      ClusterReadModel
      |> Repo.get!(event.cluster_id)
      |> Repo.preload([:tags])

    assert nil == cluster_projection.deregistered_at

    assert_broadcast(
      "cluster_restored",
      %{
        cib_last_written: nil,
        id: ^cluster_id,
        name: ^name,
        type: ^type,
        tags: ^tags
      },
      1000
    )
  end

  test "should broadcast cluster_health_changed after the ClusterHealthChanged event" do
    %{id: cluster_id, name: name, health: health} = insert(:cluster)

    event = %ClusterHealthChanged{cluster_id: cluster_id, health: health}

    ProjectorTestHelper.project(
      ClusterProjector,
      event,
      "cluster_projector"
    )

    assert_broadcast(
      "cluster_health_changed",
      %{cluster_id: ^cluster_id, name: ^name, health: ^health},
      1000
    )
  end

  test "should mark cluster data as stale when ClusterDataMarkedStale event is received" do
    %{id: cluster_id} = insert(:cluster, stale_at: nil)

    stale_at = DateTime.utc_now()

    event = %ClusterDataMarkedStale{
      cluster_id: cluster_id,
      stale_at: stale_at
    }

    ProjectorTestHelper.project(ClusterProjector, event, "cluster_projector")

    cluster = Repo.get!(ClusterReadModel, cluster_id)

    assert cluster.stale_at == stale_at

    assert_broadcast(
      "cluster_stale_changed",
      %{
        id: ^cluster_id,
        stale_at: ^stale_at
      },
      1000
    )
  end

  test "should mark cluster data as fresh when ClusterDataMarkedInSync event is received" do
    %{id: cluster_id} = insert(:cluster, stale_at: DateTime.utc_now())

    event = %ClusterDataMarkedInSync{
      cluster_id: cluster_id
    }

    ProjectorTestHelper.project(ClusterProjector, event, "cluster_projector")

    cluster = Repo.get!(ClusterReadModel, cluster_id)

    assert cluster.stale_at == nil

    assert_broadcast(
      "cluster_stale_changed",
      %{
        id: ^cluster_id,
        stale_at: nil
      },
      1000
    )
  end
end
