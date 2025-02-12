defmodule Trento.ClustersTest do
  @moduledoc false
  use ExUnit.Case, async: true
  use Trento.DataCase

  import Mox

  import Trento.Factory

  alias Trento.Clusters

  alias Trento.Clusters.ClusterEnrichmentData

  alias Trento.Clusters.Projections.ClusterReadModel

  alias Trento.SapSystems.Projections.SapSystemReadModel

  alias Trento.Checks.V1.{
    ExecutionRequested,
    Target
  }

  require Trento.Clusters.Enums.ClusterType, as: ClusterType
  require Trento.Clusters.Enums.ClusterEnsaVersion, as: ClusterEnsaVersion
  require Trento.Clusters.Enums.FilesystemType, as: FilesystemType
  require Trento.Clusters.Enums.HanaArchitectureType, as: HanaArchitectureType
  require Trento.Clusters.Enums.HanaScenario, as: HanaScenario

  require Trento.SapSystems.Enums.EnsaVersion, as: EnsaVersion

  require Logger

  setup [:set_mox_from_context, :verify_on_exit!]

  describe "checks execution with wanda adapter" do
    test "should start a checks execution on demand in a ascs_ers cluster if checks are selected" do
      sid = "prd"

      details =
        build(:ascs_ers_cluster_details,
          sap_systems:
            build_list(1, :ascs_ers_cluster_sap_system, filesystem_resource_based: true)
        )

      %{
        id: cluster_id,
        provider: provider,
        type: cluster_type
      } = insert(:cluster, type: ClusterType.ascs_ers(), additional_sids: [sid], details: details)

      insert(:host, deregistered_at: DateTime.utc_now(), cluster_id: cluster_id)
      [%{id: host_id_1}, %{id: host_id_2}] = insert_list(2, :host, cluster_id: cluster_id)

      %{id: sap_system_id, ensa_version: ensa_version} = insert(:sap_system)

      insert(:application_instance,
        sap_system_id: sap_system_id,
        host_id: host_id_1,
        sid: sid
      )

      insert(:application_instance,
        sap_system_id: sap_system_id,
        host_id: host_id_2,
        sid: sid
      )

      expect(Trento.Infrastructure.Messaging.Adapter.Mock, :publish, fn "executions", message ->
        assert message.group_id == cluster_id
        assert length(message.targets) == 2

        assert message.env == %{
                 "provider" => %{kind: {:string_value, Atom.to_string(provider)}},
                 "cluster_type" => %{kind: {:string_value, Atom.to_string(cluster_type)}},
                 "ensa_version" => %{kind: {:string_value, Atom.to_string(ensa_version)}},
                 "filesystem_type" => %{
                   kind: {:string_value, Atom.to_string(FilesystemType.resource_managed())}
                 }
               }

        assert message.target_type == "cluster"

        :ok
      end)

      assert :ok = Clusters.request_checks_execution(cluster_id)
    end

    test "should start a checks execution on demand in a hana cluster performance opt scenario if checks are selected" do
      for architecture_type <- [HanaArchitectureType.angi(), HanaArchitectureType.classic()] do
        %{
          id: cluster_id,
          provider: provider,
          type: cluster_type
        } =
          insert(:cluster,
            type: ClusterType.hana_scale_up(),
            details:
              build(:hana_cluster_details,
                architecture_type: architecture_type,
                hana_scenario: HanaScenario.performance_optimized()
              )
          )

        insert(:host, deregistered_at: DateTime.utc_now(), cluster_id: cluster_id)
        insert_list(2, :host, cluster_id: cluster_id)

        expect(Trento.Infrastructure.Messaging.Adapter.Mock, :publish, fn "executions", message ->
          assert message.group_id == cluster_id
          assert length(message.targets) == 2

          assert message.env == %{
                   "provider" => %{kind: {:string_value, Atom.to_string(provider)}},
                   "cluster_type" => %{kind: {:string_value, Atom.to_string(cluster_type)}},
                   "architecture_type" => %{
                     kind: {:string_value, Atom.to_string(architecture_type)}
                   },
                   "hana_scenario" => %{
                     kind: {:string_value, Atom.to_string(HanaScenario.performance_optimized())}
                   }
                 }

          assert message.target_type == "cluster"

          :ok
        end)

        assert :ok = Clusters.request_checks_execution(cluster_id)
      end
    end

    test "should start a checks execution on demand in a hana cluster cost opt scenario if checks are selected" do
      for architecture_type <- [HanaArchitectureType.angi(), HanaArchitectureType.classic()] do
        %{
          id: cluster_id,
          provider: provider,
          type: cluster_type
        } =
          insert(:cluster,
            type: ClusterType.hana_scale_up(),
            details:
              build(:hana_cluster_details,
                architecture_type: architecture_type,
                hana_scenario: HanaScenario.cost_optimized()
              )
          )

        insert(:host, deregistered_at: DateTime.utc_now(), cluster_id: cluster_id)
        insert_list(2, :host, cluster_id: cluster_id)

        expect(Trento.Infrastructure.Messaging.Adapter.Mock, :publish, fn "executions", message ->
          assert message.group_id == cluster_id
          assert length(message.targets) == 2

          assert message.env == %{
                   "provider" => %{kind: {:string_value, Atom.to_string(provider)}},
                   "cluster_type" => %{kind: {:string_value, Atom.to_string(cluster_type)}},
                   "architecture_type" => %{
                     kind: {:string_value, Atom.to_string(architecture_type)}
                   },
                   "hana_scenario" => %{
                     kind: {:string_value, Atom.to_string(HanaScenario.cost_optimized())}
                   }
                 }

          assert message.target_type == "cluster"

          :ok
        end)

        assert :ok = Clusters.request_checks_execution(cluster_id)
      end
    end

    test "should not start checks execution if the cluster is not registered" do
      expect(Trento.Infrastructure.Messaging.Adapter.Mock, :publish, 0, fn _, _ ->
        :ok
      end)

      assert {:error, :not_found} = Clusters.request_checks_execution(UUID.uuid4())
    end

    test "should not start checks execution if no checks are selected" do
      %{id: cluster_id} = insert(:cluster, selected_checks: [])

      expect(Trento.Infrastructure.Messaging.Adapter.Mock, :publish, 0, fn _, _ ->
        :ok
      end)

      assert {:error, :no_checks_selected} = Clusters.request_checks_execution(cluster_id)
    end

    test "should return an error if the checks execution start fails" do
      %{id: cluster_id} = insert(:cluster)

      expect(Trento.Infrastructure.Messaging.Adapter.Mock, :publish, fn _, _ ->
        {:error, :amqp_error}
      end)

      assert {:error, :amqp_error} = Clusters.request_checks_execution(cluster_id)
    end

    test "should request checks execution for all relevant registered clusters" do
      checks = [Faker.UUID.v4(), Faker.UUID.v4()]

      # Registered Hana scale up cluster and related hosts
      %{id: registered_hana_scale_up_id} =
        insert(:cluster,
          type: ClusterType.hana_scale_up(),
          selected_checks: checks
        )

      [
        %{id: registered_hana_scale_up_host1},
        %{id: registered_hana_scale_up_host2}
      ] = insert_list(2, :host, cluster_id: registered_hana_scale_up_id)

      # Registered Hana scale out cluster and related hosts
      %{id: registered_hana_scale_out_id} =
        insert(:cluster,
          type: ClusterType.hana_scale_out(),
          selected_checks: checks
        )

      [
        %{id: registered_hana_scale_out_host1},
        %{id: registered_hana_scale_out_host2}
      ] = insert_list(2, :host, cluster_id: registered_hana_scale_out_id)

      # Registered ASCS/ERS cluster and related hosts
      %SapSystemReadModel{id: sap_system_id, sid: sid} =
        insert(:sap_system, ensa_version: EnsaVersion.ensa1())

      %{id: registered_ascs_ers_cluster_id} =
        insert(:cluster,
          type: ClusterType.ascs_ers(),
          selected_checks: checks,
          additional_sids: [sid],
          details:
            build(:ascs_ers_cluster_details,
              sap_systems:
                build_list(2, :ascs_ers_cluster_sap_system, filesystem_resource_based: true)
            )
        )

      [
        %{id: registered_ascs_ers_cluster_host1},
        %{id: registered_ascs_ers_cluster_host2}
      ] =
        [ascs_ers_host1, ascs_ers_host2] =
        insert_list(2, :host, cluster_id: registered_ascs_ers_cluster_id)

      Enum.each(
        [ascs_ers_host1, ascs_ers_host2],
        fn %{id: host_id} = host ->
          insert(:application_instance,
            sap_system_id: sap_system_id,
            host_id: host_id,
            host: host,
            sid: sid
          )
        end
      )

      # Deregistered cluster
      %{id: deregistred_cluster_id} =
        insert(:cluster,
          type: ClusterType.hana_scale_up(),
          selected_checks: checks,
          deregistered_at: DateTime.utc_now()
        )

      [
        %{id: deregistred_cluster_host1},
        %{id: deregistred_cluster_host2}
      ] =
        insert_list(2, :host, cluster_id: deregistred_cluster_id)

      # Registered Unknown cluster and related hosts
      %{id: unknown_registered_cluster_id} =
        insert(:cluster,
          type: ClusterType.unknown(),
          selected_checks: checks
        )

      # An execution should be requested for the registered hana scale up cluster
      expect(Trento.Infrastructure.Messaging.Adapter.Mock, :publish, 1, fn "executions",
                                                                           %ExecutionRequested{
                                                                             group_id:
                                                                               ^registered_hana_scale_up_id,
                                                                             targets: [
                                                                               %Target{
                                                                                 agent_id:
                                                                                   ^registered_hana_scale_up_host1,
                                                                                 checks: ^checks
                                                                               },
                                                                               %Target{
                                                                                 agent_id:
                                                                                   ^registered_hana_scale_up_host2,
                                                                                 checks: ^checks
                                                                               }
                                                                             ]
                                                                           } ->
        :ok
      end)

      # An execution should be requested for the registered hana scale out cluster
      expect(Trento.Infrastructure.Messaging.Adapter.Mock, :publish, 1, fn "executions",
                                                                           %ExecutionRequested{
                                                                             group_id:
                                                                               ^registered_hana_scale_out_id,
                                                                             targets: [
                                                                               %Target{
                                                                                 agent_id:
                                                                                   ^registered_hana_scale_out_host1,
                                                                                 checks: ^checks
                                                                               },
                                                                               %Target{
                                                                                 agent_id:
                                                                                   ^registered_hana_scale_out_host2,
                                                                                 checks: ^checks
                                                                               }
                                                                             ]
                                                                           } ->
        :ok
      end)

      # An execution should be requested for the registered ASCS/ERS cluster
      expect(Trento.Infrastructure.Messaging.Adapter.Mock, :publish, 1, fn "executions",
                                                                           %ExecutionRequested{
                                                                             group_id:
                                                                               ^registered_ascs_ers_cluster_id,
                                                                             targets: [
                                                                               %Target{
                                                                                 agent_id:
                                                                                   ^registered_ascs_ers_cluster_host1,
                                                                                 checks: ^checks
                                                                               },
                                                                               %Target{
                                                                                 agent_id:
                                                                                   ^registered_ascs_ers_cluster_host2,
                                                                                 checks: ^checks
                                                                               }
                                                                             ]
                                                                           } ->
        :ok
      end)

      # No execution should be requested for the deregistered cluster
      expect(Trento.Infrastructure.Messaging.Adapter.Mock, :publish, 0, fn "executions",
                                                                           %ExecutionRequested{
                                                                             group_id:
                                                                               ^deregistred_cluster_id,
                                                                             targets: [
                                                                               %Target{
                                                                                 agent_id:
                                                                                   ^deregistred_cluster_host1,
                                                                                 checks: ^checks
                                                                               },
                                                                               %Target{
                                                                                 agent_id:
                                                                                   ^deregistred_cluster_host2,
                                                                                 checks: ^checks
                                                                               }
                                                                             ]
                                                                           } ->
        :ok
      end)

      # No execution should be requested for the unknown cluster
      expect(Trento.Infrastructure.Messaging.Adapter.Mock, :publish, 0, fn "executions",
                                                                           %ExecutionRequested{
                                                                             group_id:
                                                                               ^unknown_registered_cluster_id
                                                                           } ->
        :ok
      end)

      assert :ok = Clusters.request_clusters_checks_execution()
    end
  end

  describe "retrieving a cluster by identifier" do
    test "should not return a non existent cluster" do
      assert {:error, :not_found} == Clusters.by_id(Faker.UUID.v4())
    end

    test "should return an existent cluster, whether it is registered or not" do
      %{id: registered_cluster_id} = insert(:cluster)

      %{id: deregistered_cluster_id} =
        insert(:cluster, deregistered_at: Faker.DateTime.backward(1))

      for cluster_id <- [registered_cluster_id, deregistered_cluster_id] do
        assert {:ok, %ClusterReadModel{id: ^cluster_id}} = Clusters.by_id(cluster_id)
      end
    end
  end

  describe "get clusters" do
    test "should not return soft deleted clusters" do
      cib_last_written = Date.to_string(Faker.Date.forward(0))
      cluster_id = Faker.UUID.v4()

      insert(:cluster, id: cluster_id)
      insert(:cluster, deregistered_at: DateTime.utc_now())
      insert(:cluster_enrichment_data, cluster_id: cluster_id)

      [%ClusterReadModel{id: ^cluster_id, cib_last_written: ^cib_last_written}] =
        Clusters.get_all_clusters()
    end

    test "should return enriched clusters" do
      cib_last_written = Date.to_string(Faker.Date.forward(0))
      cluster_id = Faker.UUID.v4()

      insert(:cluster, id: cluster_id)
      insert(:cluster_enrichment_data, cluster_id: cluster_id)

      [%ClusterReadModel{id: ^cluster_id, cib_last_written: ^cib_last_written}] =
        Clusters.get_all_clusters()
    end
  end

  describe "get_cluster_id_by_host_id/1" do
    test "should return nil if the host is not part of any cluster" do
      assert nil == Clusters.get_cluster_id_by_host_id(UUID.uuid4())
    end

    test "should return the cluster_id" do
      cluster_id = UUID.uuid4()
      host_id = UUID.uuid4()

      insert(:cluster, id: cluster_id)
      insert(:host, id: host_id, cluster_id: cluster_id)

      assert cluster_id == Clusters.get_cluster_id_by_host_id(host_id)
    end
  end

  describe "update cib_last_written" do
    test "should create a new enriched cluster entry" do
      cib_last_written = Date.to_string(Faker.Date.forward(0))
      cluster_id = Faker.UUID.v4()

      {:ok, %ClusterEnrichmentData{cluster_id: ^cluster_id, cib_last_written: ^cib_last_written}} =
        Clusters.update_cib_last_written(cluster_id, cib_last_written)
    end

    test "should update cib_last_written field properly" do
      cluster = insert(:cluster)
      cib_last_written = Date.to_string(Faker.Date.forward(0))

      {:ok, %ClusterEnrichmentData{cib_last_written: ^cib_last_written}} =
        Clusters.update_cib_last_written(cluster.id, cib_last_written)
    end
  end

  describe "ASCS/ERS cluster checks execution" do
    test "should start a checks execution on demand for ascs_ers clusters with a resource managed filesystem type" do
      %SapSystemReadModel{id: sap_system_id, sid: sid} =
        insert(:sap_system, ensa_version: EnsaVersion.ensa1())

      %{id: cluster_id, provider: provider, type: cluster_type} =
        insert(:cluster,
          type: :ascs_ers,
          additional_sids: [sid],
          details:
            build(:ascs_ers_cluster_details,
              sap_systems:
                build_list(2, :ascs_ers_cluster_sap_system, filesystem_resource_based: true)
            )
        )

      insert(:host, deregistered_at: DateTime.utc_now(), cluster_id: cluster_id)
      hosts = insert_list(2, :host, cluster_id: cluster_id)

      Enum.map(
        hosts,
        fn %{id: host_id} ->
          insert(:application_instance,
            sap_system_id: sap_system_id,
            host_id: host_id,
            sid: sid
          )
        end
      )

      expect(Trento.Infrastructure.Messaging.Adapter.Mock, :publish, fn "executions", message ->
        assert message.group_id == cluster_id
        assert length(message.targets) == 2

        assert message.env == %{
                 "provider" => %{kind: {:string_value, Atom.to_string(provider)}},
                 "cluster_type" => %{kind: {:string_value, Atom.to_string(cluster_type)}},
                 "filesystem_type" => %{kind: {:string_value, Atom.to_string(:resource_managed)}},
                 "ensa_version" => %{
                   kind: {:string_value, Atom.to_string(ClusterEnsaVersion.ensa1())}
                 }
               }

        assert message.target_type == "cluster"

        :ok
      end)

      assert :ok = Clusters.request_checks_execution(cluster_id)
    end

    test "should start a checks execution on demand for ascs_ers clusters with a simple mount filesystem type" do
      %SapSystemReadModel{id: sap_system_id, sid: sid} =
        insert(:sap_system, ensa_version: EnsaVersion.ensa2())

      %{id: cluster_id, provider: provider, type: cluster_type} =
        insert(:cluster,
          type: :ascs_ers,
          additional_sids: [sid],
          details:
            build(:ascs_ers_cluster_details,
              sap_systems:
                build_list(2, :ascs_ers_cluster_sap_system, filesystem_resource_based: false)
            )
        )

      insert(:host, deregistered_at: DateTime.utc_now(), cluster_id: cluster_id)
      hosts = insert_list(2, :host, cluster_id: cluster_id)

      Enum.map(
        hosts,
        fn %{id: host_id} ->
          insert(:application_instance,
            sap_system_id: sap_system_id,
            host_id: host_id,
            sid: sid
          )
        end
      )

      expect(Trento.Infrastructure.Messaging.Adapter.Mock, :publish, fn "executions", message ->
        assert message.group_id == cluster_id
        assert length(message.targets) == 2

        assert message.env == %{
                 "provider" => %{kind: {:string_value, Atom.to_string(provider)}},
                 "cluster_type" => %{kind: {:string_value, Atom.to_string(cluster_type)}},
                 "filesystem_type" => %{kind: {:string_value, Atom.to_string(:simple_mount)}},
                 "ensa_version" => %{
                   kind: {:string_value, Atom.to_string(ClusterEnsaVersion.ensa2())}
                 }
               }

        assert message.target_type == "cluster"

        :ok
      end)

      assert :ok = Clusters.request_checks_execution(cluster_id)
    end

    test "should start a checks execution on demand for ascs_ers clusters with a mixed filesystem type" do
      %SapSystemReadModel{id: sap_system_id, sid: sid} =
        insert(:sap_system, ensa_version: EnsaVersion.ensa2())

      %{id: cluster_id, provider: provider, type: cluster_type} =
        insert(:cluster,
          type: :ascs_ers,
          additional_sids: [sid],
          details:
            build(:ascs_ers_cluster_details,
              sap_systems: [
                build(:ascs_ers_cluster_sap_system, filesystem_resource_based: false),
                build(:ascs_ers_cluster_sap_system, filesystem_resource_based: true)
              ]
            )
        )

      insert(:host, deregistered_at: DateTime.utc_now(), cluster_id: cluster_id)
      hosts = insert_list(2, :host, cluster_id: cluster_id)

      Enum.map(
        hosts,
        fn %{id: host_id} ->
          insert(:application_instance,
            sap_system_id: sap_system_id,
            host_id: host_id,
            sid: sid
          )
        end
      )

      expect(Trento.Infrastructure.Messaging.Adapter.Mock, :publish, fn "executions", message ->
        assert message.group_id == cluster_id
        assert length(message.targets) == 2

        assert message.env == %{
                 "provider" => %{kind: {:string_value, Atom.to_string(provider)}},
                 "cluster_type" => %{kind: {:string_value, Atom.to_string(cluster_type)}},
                 "filesystem_type" => %{kind: {:string_value, Atom.to_string(:mixed_fs_types)}},
                 "ensa_version" => %{
                   kind: {:string_value, Atom.to_string(ClusterEnsaVersion.ensa2())}
                 }
               }

        assert message.target_type == "cluster"

        :ok
      end)

      assert :ok = Clusters.request_checks_execution(cluster_id)
    end

    test "should start a checks execution on demand for ascs_ers clusters with ENSA 1 version" do
      sid_1 = Faker.UUID.v4()
      sid_2 = Faker.UUID.v4()
      other_sid = Faker.UUID.v4()

      %SapSystemReadModel{id: sap_system_id_1} =
        insert(:sap_system, sid: sid_1, ensa_version: EnsaVersion.ensa1())

      %SapSystemReadModel{id: sap_system_id_2} =
        insert(:sap_system, sid: sid_2, ensa_version: EnsaVersion.ensa1())

      %SapSystemReadModel{id: other_cluster_sap_system_id} =
        insert(:sap_system, sid: sid_1, ensa_version: EnsaVersion.ensa2())

      insert(:sap_system, sid: other_sid, ensa_version: EnsaVersion.ensa2())

      %ClusterReadModel{id: cluster_id, provider: provider, type: cluster_type} =
        insert(:cluster,
          type: ClusterType.ascs_ers(),
          additional_sids: [sid_1, sid_2],
          details:
            build(:ascs_ers_cluster_details,
              sap_systems: [
                build(:ascs_ers_cluster_sap_system, sid: sid_1, filesystem_resource_based: false),
                build(:ascs_ers_cluster_sap_system, sid: sid_2, filesystem_resource_based: false)
              ]
            )
        )

      %{id: host_id_1} = insert(:host, cluster_id: cluster_id)

      insert(:application_instance,
        sap_system_id: sap_system_id_1,
        host_id: host_id_1,
        sid: sid_1
      )

      %{id: host_id_2} = insert(:host, cluster_id: cluster_id)

      insert(:application_instance,
        sap_system_id: sap_system_id_2,
        host_id: host_id_2,
        sid: sid_2
      )

      %{id: host_id_with_other_cluster_id} = insert(:host)

      insert(:application_instance,
        sap_system_id: other_cluster_sap_system_id,
        host_id: host_id_with_other_cluster_id
      )

      %{id: host_id_with_other_sid} = insert(:host, cluster_id: cluster_id)

      insert(:application_instance,
        sap_system_id: sap_system_id_1,
        host_id: host_id_with_other_sid,
        sid: other_sid
      )

      expect(Trento.Infrastructure.Messaging.Adapter.Mock, :publish, fn "executions", message ->
        assert message.group_id == cluster_id
        assert length(message.targets) == 2

        assert message.env == %{
                 "provider" => %{kind: {:string_value, Atom.to_string(provider)}},
                 "cluster_type" => %{kind: {:string_value, Atom.to_string(cluster_type)}},
                 "filesystem_type" => %{kind: {:string_value, Atom.to_string(:simple_mount)}},
                 "ensa_version" => %{
                   kind: {:string_value, Atom.to_string(ClusterEnsaVersion.ensa1())}
                 }
               }

        assert message.target_type == "cluster"

        :ok
      end)

      assert :ok = Clusters.request_checks_execution(cluster_id)
    end

    test "should start a checks execution on demand for ascs_ers clusters with ENSA 2 version" do
      sid_1 = Faker.UUID.v4()
      sid_2 = Faker.UUID.v4()
      other_sid = Faker.UUID.v4()

      %SapSystemReadModel{id: sap_system_id_1} =
        insert(:sap_system, sid: sid_1, ensa_version: EnsaVersion.ensa2())

      %SapSystemReadModel{id: sap_system_id_2} =
        insert(:sap_system, sid: sid_2, ensa_version: EnsaVersion.ensa2())

      %SapSystemReadModel{id: other_cluster_sap_system_id} =
        insert(:sap_system, sid: sid_1, ensa_version: EnsaVersion.ensa1())

      insert(:sap_system, sid: other_sid, ensa_version: EnsaVersion.ensa1())

      %ClusterReadModel{id: cluster_id, provider: provider, type: cluster_type} =
        insert(:cluster,
          type: ClusterType.ascs_ers(),
          additional_sids: [sid_1, sid_2],
          details:
            build(:ascs_ers_cluster_details,
              sap_systems: [
                build(:ascs_ers_cluster_sap_system, sid: sid_1, filesystem_resource_based: false),
                build(:ascs_ers_cluster_sap_system, sid: sid_2, filesystem_resource_based: false)
              ]
            )
        )

      %{id: host_id_1} = insert(:host, cluster_id: cluster_id)

      insert(:application_instance,
        sap_system_id: sap_system_id_1,
        host_id: host_id_1,
        sid: sid_1
      )

      %{id: host_id_2} = insert(:host, cluster_id: cluster_id)

      insert(:application_instance,
        sap_system_id: sap_system_id_2,
        host_id: host_id_2,
        sid: sid_2
      )

      %{id: host_id_with_other_cluster_id} = insert(:host)

      insert(:application_instance,
        sap_system_id: other_cluster_sap_system_id,
        host_id: host_id_with_other_cluster_id
      )

      %{id: host_id_with_other_sid} = insert(:host, cluster_id: cluster_id)

      insert(:application_instance,
        sap_system_id: sap_system_id_1,
        host_id: host_id_with_other_sid,
        sid: other_sid
      )

      expect(Trento.Infrastructure.Messaging.Adapter.Mock, :publish, fn "executions", message ->
        assert message.group_id == cluster_id
        assert length(message.targets) == 2

        assert message.env == %{
                 "provider" => %{kind: {:string_value, Atom.to_string(provider)}},
                 "cluster_type" => %{kind: {:string_value, Atom.to_string(cluster_type)}},
                 "filesystem_type" => %{kind: {:string_value, Atom.to_string(:simple_mount)}},
                 "ensa_version" => %{
                   kind: {:string_value, Atom.to_string(ClusterEnsaVersion.ensa2())}
                 }
               }

        assert message.target_type == "cluster"

        :ok
      end)

      assert :ok = Clusters.request_checks_execution(cluster_id)
    end

    test "should start a checks execution on demand for ascs_ers clusters with mixed ENSA versions" do
      sid_1 = Faker.UUID.v4()
      sid_2 = Faker.UUID.v4()
      other_sid = Faker.UUID.v4()

      %SapSystemReadModel{id: sap_system_id_1} =
        insert(:sap_system, sid: sid_1, ensa_version: EnsaVersion.ensa1())

      %SapSystemReadModel{id: sap_system_id_2} =
        insert(:sap_system, sid: sid_2, ensa_version: EnsaVersion.ensa2())

      %SapSystemReadModel{id: other_cluster_sap_system_id} =
        insert(:sap_system, sid: sid_1, ensa_version: EnsaVersion.ensa1())

      insert(:sap_system, sid: other_sid, ensa_version: EnsaVersion.ensa1())

      %ClusterReadModel{id: cluster_id, provider: provider, type: cluster_type} =
        insert(:cluster,
          type: ClusterType.ascs_ers(),
          additional_sids: [sid_1, sid_2],
          details:
            build(:ascs_ers_cluster_details,
              sap_systems: [
                build(:ascs_ers_cluster_sap_system, sid: sid_1, filesystem_resource_based: false),
                build(:ascs_ers_cluster_sap_system, sid: sid_2, filesystem_resource_based: false)
              ]
            )
        )

      %{id: host_id_1} = insert(:host, cluster_id: cluster_id)

      insert(:application_instance,
        sap_system_id: sap_system_id_1,
        host_id: host_id_1,
        sid: sid_1
      )

      %{id: host_id_2} = insert(:host, cluster_id: cluster_id)

      insert(:application_instance,
        sap_system_id: sap_system_id_2,
        host_id: host_id_2,
        sid: sid_2
      )

      %{id: host_id_with_other_cluster_id} = insert(:host)

      insert(:application_instance,
        sap_system_id: other_cluster_sap_system_id,
        host_id: host_id_with_other_cluster_id
      )

      %{id: host_id_with_other_sid} = insert(:host, cluster_id: cluster_id)

      insert(:application_instance,
        sap_system_id: sap_system_id_1,
        host_id: host_id_with_other_sid,
        sid: other_sid
      )

      expect(Trento.Infrastructure.Messaging.Adapter.Mock, :publish, fn "executions", message ->
        assert message.group_id == cluster_id
        assert length(message.targets) == 2

        assert message.env == %{
                 "provider" => %{kind: {:string_value, Atom.to_string(provider)}},
                 "cluster_type" => %{kind: {:string_value, Atom.to_string(cluster_type)}},
                 "filesystem_type" => %{kind: {:string_value, Atom.to_string(:simple_mount)}},
                 "ensa_version" => %{
                   kind: {:string_value, Atom.to_string(ClusterEnsaVersion.mixed_versions())}
                 }
               }

        assert message.target_type == "cluster"

        :ok
      end)

      assert :ok = Clusters.request_checks_execution(cluster_id)
    end
  end

  describe "maintenance?/1" do
    test "should return cluster maintenance mode" do
      cluster = build(:cluster, details: build(:hana_cluster_details, maintenance_mode: true))

      assert Clusters.maintenance?(cluster)

      cluster = build(:cluster, details: build(:hana_cluster_details, maintenance_mode: false))

      refute Clusters.maintenance?(cluster)
    end
  end

  describe "resource_managed?/2" do
    test "should return the managed state of a resource" do
      %{id: cluster_resource_id, managed: managed} = cluster_resource = build(:cluster_resource)
      nodes = build_list(1, :hana_cluster_node, resources: [cluster_resource])
      cluster_details = build(:hana_cluster_details, maintenance_mode: false, nodes: nodes)
      cluster = build(:cluster, details: cluster_details)

      assert managed == Clusters.resource_managed?(cluster, cluster_resource_id)
    end

    test "should return the managed state of a grouped resource" do
      %{id: cluster_resource_id, managed: managed} = parent = build(:cluster_resource_parent)
      cluster_resource = build(:cluster_resource, managed: not managed, parent: parent)
      nodes = build_list(1, :hana_cluster_node, resources: [cluster_resource])
      cluster_details = build(:hana_cluster_details, maintenance_mode: false, nodes: nodes)
      cluster = build(:cluster, details: cluster_details)

      assert managed == Clusters.resource_managed?(cluster, cluster_resource_id)
    end

    test "should return false if the resource if not found" do
      cluster = build(:cluster, details: build(:hana_cluster_details))

      refute Clusters.resource_managed?(cluster, "unknown")
    end
  end
end
