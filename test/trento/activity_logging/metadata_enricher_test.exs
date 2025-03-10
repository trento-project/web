defmodule Trento.ActivityLog.MetadataEnricherTest do
  @moduledoc false

  use ExUnit.Case, async: true
  use Trento.DataCase, async: true

  import Trento.Factory

  alias Trento.ActivityLog.Logger.Parser.MetadataEnricher

  test "should pass through unsupported activities" do
    scenarios = [
      %{
        activity: :foo,
        metadata: %{foo: "bar"}
      },
      %{
        activity: :bar,
        metadata: %{}
      },
      %{
        activity: :baz,
        metadata: %{baz: "foo"}
      }
    ]

    for %{activity: activity, metadata: metadata} <- scenarios do
      assert {:ok, ^metadata} = MetadataEnricher.enrich(activity, metadata)
    end
  end

  describe "enriching tagging/untagging activities" do
    test "should pass through enriching unrecognized taggable resources" do
      scenarios = [
        %{
          activity: :resource_tagging,
          metadata: %{resource_id: Faker.UUID.v4(), resource_type: :foo}
        },
        %{
          activity: :resource_untagging,
          metadata: %{resource_id: Faker.UUID.v4(), resource_type: :bar}
        }
      ]

      for %{activity: activity, metadata: metadata} <- scenarios do
        assert {:ok, ^metadata} = MetadataEnricher.enrich(activity, metadata)
      end
    end

    test "should not enrich tagging activities for missing resources" do
      scenarios = [
        %{
          activity: :resource_tagging,
          metadata: %{resource_id: Faker.UUID.v4(), resource_type: :host}
        },
        %{
          activity: :resource_tagging,
          metadata: %{resource_id: Faker.UUID.v4(), resource_type: :cluster}
        },
        %{
          activity: :resource_tagging,
          metadata: %{resource_id: Faker.UUID.v4(), resource_type: :database}
        },
        %{
          activity: :resource_tagging,
          metadata: %{resource_id: Faker.UUID.v4(), resource_type: :sap_system}
        },
        %{
          activity: :resource_untagging,
          metadata: %{resource_id: Faker.UUID.v4(), resource_type: :host}
        },
        %{
          activity: :resource_untagging,
          metadata: %{resource_id: Faker.UUID.v4(), resource_type: :cluster}
        },
        %{
          activity: :resource_untagging,
          metadata: %{resource_id: Faker.UUID.v4(), resource_type: :database}
        },
        %{
          activity: :resource_untagging,
          metadata: %{resource_id: Faker.UUID.v4(), resource_type: :sap_system}
        }
      ]

      for %{activity: activity, metadata: metadata} <- scenarios do
        assert {:ok, ^metadata} = MetadataEnricher.enrich(activity, metadata)
      end
    end

    test "should enrich tagging activities" do
      %{id: host_id, hostname: hostname} = insert(:host)
      %{id: cluster_id, name: cluster_name} = insert(:cluster)
      %{id: database_id, sid: database_sid} = insert(:database)
      %{id: sap_system_id, sid: sap_system_sid} = insert(:sap_system)

      initial_host_tagging_metadata = %{resource_id: host_id, resource_type: :host}
      expected_host_tagging_metadata = Map.put(initial_host_tagging_metadata, :hostname, hostname)

      initial_cluster_tagging_metadata = %{resource_id: cluster_id, resource_type: :cluster}

      expected_cluster_tagging_metadata =
        Map.put(initial_cluster_tagging_metadata, :name, cluster_name)

      initial_database_tagging_metadata = %{resource_id: database_id, resource_type: :database}

      expected_database_tagging_metadata =
        Map.put(initial_database_tagging_metadata, :sid, database_sid)

      initial_sap_system_tagging_metadata = %{
        resource_id: sap_system_id,
        resource_type: :sap_system
      }

      expected_sap_system_tagging_metadata =
        Map.put(initial_sap_system_tagging_metadata, :sid, sap_system_sid)

      scenarios = [
        %{
          activity: :resource_tagging,
          metadata: initial_host_tagging_metadata,
          expected_metadata: expected_host_tagging_metadata
        },
        %{
          activity: :resource_tagging,
          metadata: initial_cluster_tagging_metadata,
          expected_metadata: expected_cluster_tagging_metadata
        },
        %{
          activity: :resource_tagging,
          metadata: initial_database_tagging_metadata,
          expected_metadata: expected_database_tagging_metadata
        },
        %{
          activity: :resource_tagging,
          metadata: initial_sap_system_tagging_metadata,
          expected_metadata: expected_sap_system_tagging_metadata
        },
        %{
          activity: :resource_untagging,
          metadata: initial_host_tagging_metadata,
          expected_metadata: expected_host_tagging_metadata
        },
        %{
          activity: :resource_untagging,
          metadata: initial_cluster_tagging_metadata,
          expected_metadata: expected_cluster_tagging_metadata
        },
        %{
          activity: :resource_untagging,
          metadata: initial_database_tagging_metadata,
          expected_metadata: expected_database_tagging_metadata
        },
        %{
          activity: :resource_untagging,
          metadata: initial_sap_system_tagging_metadata,
          expected_metadata: expected_sap_system_tagging_metadata
        }
      ]

      for %{
            activity: activity,
            metadata: initial_metadata,
            expected_metadata: expected_metadata
          } <- scenarios do
        assert {:ok, ^expected_metadata} = MetadataEnricher.enrich(activity, initial_metadata)
      end
    end
  end

  describe "enriching checks execution requests" do
    test "should pass through unrecognizable checks execution requests" do
      for activity <- [:host_checks_execution_request, :cluster_checks_execution_request] do
        metadata_missing_recognizable_item = %{foo: "bar"}

        assert {:ok, ^metadata_missing_recognizable_item} =
                 MetadataEnricher.enrich(activity, metadata_missing_recognizable_item)
      end
    end

    test "should enrich host checks execution request" do
      %{id: host_id, hostname: hostname} = insert(:host)

      initial_metadata = %{host_id: host_id}

      assert {:ok,
              %{
                host_id: ^host_id,
                hostname: ^hostname
              }} =
               MetadataEnricher.enrich(:host_checks_execution_request, initial_metadata)
    end

    test "should enrich cluster checks execution request" do
      %{id: cluster_id, name: cluster_name} = insert(:cluster)

      initial_metadata = %{cluster_id: cluster_id}

      assert {:ok,
              %{
                cluster_id: ^cluster_id,
                name: ^cluster_name
              }} =
               MetadataEnricher.enrich(:cluster_checks_execution_request, initial_metadata)
    end

    test "should enrich user deletion request" do
      %{id: user_id, username: username} = insert(:user, deleted_at: Faker.DateTime.backward(1))

      initial_metadata = %{user_id: user_id}

      assert {:ok,
              %{
                user_id: ^user_id,
                username: ^username
              }} =
               MetadataEnricher.enrich(:user_deletion, initial_metadata)
    end
  end

  describe "enriching operation activities" do
    test "should enrich operation completed events in hosts" do
      %{id: host_id, hostname: hostname} = insert(:host)

      initial_metadata = %{
        resource_id: host_id,
        operation: :saptune_solution_apply
      }

      assert {:ok, %{hostname: ^hostname}} =
               MetadataEnricher.enrich(:operation_completed, initial_metadata)
    end

    test "should enrich operation requested events in hosts" do
      %{id: host_id, hostname: hostname} = insert(:host)

      initial_metadata = %{
        resource_id: host_id,
        operation: :saptune_solution_apply
      }

      assert {:ok, %{hostname: ^hostname}} =
               MetadataEnricher.enrich(:operation_requested, initial_metadata)
    end
  end

  describe "domain event activity log metadata enrichment" do
    test "should not enrich domain events related metadata already having required info" do
      not_enrichable_events = [
        {:host_registered, build(:host_registered_event)},
        {:host_details_updated, build(:host_details_updated_event)},
        {:cluster_registered, build(:cluster_registered_event)},
        {:cluster_details_updated, build(:cluster_details_updated_event)},
        {:database_registered_event, build(:database_registered_event)},
        {:sap_system_registered_event, build(:sap_system_registered_event)}
      ]

      for {activity, event} <- not_enrichable_events do
        metadata = Map.from_struct(event)
        assert {:ok, ^metadata} = MetadataEnricher.enrich(activity, metadata)
      end
    end

    test "should enrich with hostname" do
      %{id: host_id, hostname: hostname} = insert(:host)

      enrichable_events = [
        {:heartbeat_succeeded, build(:heartbeat_succeded, host_id: host_id)},
        {:heartbeat_failed, build(:heartbeat_failed, host_id: host_id)},
        {:host_checks_health_changed, build(:host_checks_health_changed, host_id: host_id)},
        {:host_checks_selected, build(:host_checks_selected, host_id: host_id)},
        {:host_health_changed, build(:host_health_changed_event, host_id: host_id)},
        {:saptune_status_updated, build(:saptune_status_updated_event, host_id: host_id)},
        {:software_updates_discovery_requested,
         build(:software_updates_discovery_requested_event, host_id: host_id)}
      ]

      for {activity, event} <- enrichable_events do
        initial_metadata = Map.from_struct(event)
        enriched_metadata = Map.put(initial_metadata, :hostname, hostname)

        refute Map.has_key?(initial_metadata, :hostname)
        assert {:ok, ^enriched_metadata} = MetadataEnricher.enrich(activity, initial_metadata)
      end
    end

    test "should enrich with clustername" do
      %{id: cluster_id, name: cluster_name} = insert(:cluster)

      enrichable_events = [
        {:cluster_checks_health_changed,
         build(:cluster_checks_health_changed_event, cluster_id: cluster_id)},
        {:checks_selected, build(:cluster_checks_selected_event, cluster_id: cluster_id)},
        {:cluster_discovered_health_changed,
         build(:cluster_discovered_health_changed_event, cluster_id: cluster_id)},
        {:cluster_health_changed, build(:cluster_health_changed_event, cluster_id: cluster_id)}
      ]

      for {activity, event} <- enrichable_events do
        initial_metadata = Map.from_struct(event)
        enriched_metadata = Map.put(initial_metadata, :name, cluster_name)

        refute Map.has_key?(initial_metadata, :name)
        assert {:ok, ^enriched_metadata} = MetadataEnricher.enrich(activity, initial_metadata)
      end
    end

    test "should enrich with database sid" do
      %{id: database_id, sid: database_sid} = insert(:database)

      enrichable_events = [
        {:database_health_changed,
         build(:database_health_changed_event, database_id: database_id)},
        {:database_tenants_updated,
         build(:database_tenants_updated_event, database_id: database_id)},
        {:database_deregistered, build(:database_deregistered_event, database_id: database_id)},
        {:database_restored, build(:database_restored_event, database_id: database_id)}
      ]

      for {activity, event} <- enrichable_events do
        initial_metadata = Map.from_struct(event)
        enriched_metadata = Map.put(initial_metadata, :sid, database_sid)

        refute Map.has_key?(initial_metadata, :sid)
        assert {:ok, ^enriched_metadata} = MetadataEnricher.enrich(activity, initial_metadata)
      end
    end

    test "should enrich with sap system sid" do
      %{id: sap_system_id, sid: sap_system_sid} = insert(:sap_system)

      enrichable_events = [
        {:sap_system_health_changed,
         build(:sap_system_health_changed_event, sap_system_id: sap_system_id)},
        {:sap_system_restored, build(:sap_system_restored_event, sap_system_id: sap_system_id)},
        {:application_instance_moved,
         build(:application_instance_moved_event, sap_system_id: sap_system_id)}
      ]

      for {activity, event} <- enrichable_events do
        initial_metadata = Map.from_struct(event)
        enriched_metadata = Map.put(initial_metadata, :sid, sap_system_sid)

        refute Map.has_key?(initial_metadata, :sid)
        assert {:ok, ^enriched_metadata} = MetadataEnricher.enrich(activity, initial_metadata)
      end
    end
  end

  describe "metadata enrichment combination" do
    for scenario <- [:hostname_is_available, :hostname_is_not_available] do
      @scenario scenario
      test "should combine metadata enrichment when all components are available and '#{scenario}'" do
        %{id: cluster_id, name: cluster_name} = insert(:cluster)

        %{id: host_id, hostname: hostname} =
          insert(:host,
            hostname:
              case @scenario do
                :hostname_is_available -> Faker.Lorem.word()
                :hostname_is_not_available -> nil
              end
          )

        enrichable_events = [
          {:host_added_to_cluster,
           build(:host_added_to_cluster_event, host_id: host_id, cluster_id: cluster_id)},
          {:host_removed_from_cluster,
           build(:host_removed_from_cluster_event, host_id: host_id, cluster_id: cluster_id)}
        ]

        for {activity, event} <- enrichable_events do
          metadata = Map.from_struct(event)

          enriched_metadata =
            metadata
            |> Map.put(:hostname, hostname)
            |> Map.put(:name, cluster_name)

          assert {:ok, ^enriched_metadata} = MetadataEnricher.enrich(activity, metadata)
        end
      end
    end

    test "should combine metadata enrichment when some components are not yet available" do
      %{id: cluster_id, name: cluster_name} = insert(:cluster)

      enrichable_events = [
        {:host_added_to_cluster, build(:host_added_to_cluster_event, cluster_id: cluster_id)},
        {:host_removed_from_cluster,
         build(:host_removed_from_cluster_event, cluster_id: cluster_id)}
      ]

      for {activity, event} <- enrichable_events do
        metadata = Map.from_struct(event)

        enriched_metadata = Map.put(metadata, :name, cluster_name)

        assert {:ok, ^enriched_metadata} = MetadataEnricher.enrich(activity, metadata)
      end
    end
  end
end
