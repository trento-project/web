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

  require Trento.Clusters.Enums.ClusterType
  require Trento.Clusters.Enums.EnsaVersion, as: EnsaVersion
  require Trento.SapSystems.Enums.EnsaVersion
  require Logger

  setup [:set_mox_from_context, :verify_on_exit!]

  describe "checks execution with wanda adapter" do
    test "should start a checks execution on demand if checks are selected" do
      %{id: cluster_id, provider: provider, type: cluster_type} = insert(:cluster)
      insert(:host, deregistered_at: DateTime.utc_now(), cluster_id: cluster_id)
      insert_list(2, :host, cluster_id: cluster_id)

      expect(Trento.Infrastructure.Messaging.Adapter.Mock, :publish, fn "executions", message ->
        assert message.group_id == cluster_id
        assert length(message.targets) == 2

        assert message.env == %{
                 "provider" => %{kind: {:string_value, Atom.to_string(provider)}},
                 "cluster_type" => %{kind: {:string_value, Atom.to_string(cluster_type)}}
               }

        assert message.target_type == "cluster"

        :ok
      end)

      assert :ok = Clusters.request_checks_execution(cluster_id)
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

      assert :ok = Clusters.request_checks_execution(cluster_id)
    end

    test "should return an error if the checks execution start fails" do
      %{id: cluster_id} = insert(:cluster)

      expect(Trento.Infrastructure.Messaging.Adapter.Mock, :publish, fn _, _ ->
        {:error, :amqp_error}
      end)

      assert {:error, :amqp_error} = Clusters.request_checks_execution(cluster_id)
    end

    test "should request cluster checks execution when checks are selected" do
      checks = [Faker.UUID.v4(), Faker.UUID.v4()]
      %{id: cluster_id} = insert(:cluster, id: Faker.UUID.v4(), selected_checks: checks)
      %{id: host_id1} = insert(:host, id: Faker.UUID.v4(), cluster_id: cluster_id)
      %{id: host_id2} = insert(:host, id: Faker.UUID.v4(), cluster_id: cluster_id)

      %{id: cluster_id2} =
        insert(:cluster,
          id: Faker.UUID.v4(),
          selected_checks: checks,
          deregistered_at: DateTime.utc_now()
        )

      %{id: host_id3} = insert(:host, id: Faker.UUID.v4(), cluster_id: cluster_id2)
      %{id: host_id4} = insert(:host, id: Faker.UUID.v4(), cluster_id: cluster_id2)

      expect(Trento.Infrastructure.Messaging.Adapter.Mock, :publish, fn "executions",
                                                                        %ExecutionRequested{
                                                                          group_id: ^cluster_id,
                                                                          targets: [
                                                                            %Target{
                                                                              agent_id: ^host_id1,
                                                                              checks: ^checks
                                                                            },
                                                                            %Target{
                                                                              agent_id: ^host_id2,
                                                                              checks: ^checks
                                                                            }
                                                                          ]
                                                                        } ->
        :ok
      end)

      expect(Trento.Infrastructure.Messaging.Adapter.Mock, :publish, 0, fn "executions",
                                                                           %ExecutionRequested{
                                                                             group_id:
                                                                               ^cluster_id2,
                                                                             targets: [
                                                                               %Target{
                                                                                 agent_id:
                                                                                   ^host_id3,
                                                                                 checks: ^checks
                                                                               },
                                                                               %Target{
                                                                                 agent_id:
                                                                                   ^host_id4,
                                                                                 checks: ^checks
                                                                               }
                                                                             ]
                                                                           } ->
        :ok
      end)

      assert :ok = Clusters.request_clusters_checks_execution()
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
        fn h ->
          insert(:application_instance_without_host,
            sap_system_id: sap_system_id,
            host: h,
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
                   kind: {:string_value, Atom.to_string(EnsaVersion.ensa1())}
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
        fn h ->
          insert(:application_instance_without_host,
            sap_system_id: sap_system_id,
            host: h,
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
                   kind: {:string_value, Atom.to_string(EnsaVersion.ensa2())}
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
        fn h ->
          insert(:application_instance_without_host,
            sap_system_id: sap_system_id,
            host: h,
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
                   kind: {:string_value, Atom.to_string(EnsaVersion.ensa2())}
                 }
               }

        assert message.target_type == "cluster"

        :ok
      end)

      assert :ok = Clusters.request_checks_execution(cluster_id)
    end

    test "should start a checks execution on demand for ascs_ers clusters with ENSA 1 version" do
      %SapSystemReadModel{id: sap_system_id_1, sid: sid_1} =
        insert(:sap_system, ensa_version: Trento.SapSystems.Enums.EnsaVersion.ensa1())

      %SapSystemReadModel{id: sap_system_id_2, sid: sid_2} =
        insert(:sap_system, ensa_version: Trento.SapSystems.Enums.EnsaVersion.ensa1())

      %SapSystemReadModel{id: other_cluster_sap_system_id} =
        insert(:sap_system, sid: sid_1, ensa_version: Trento.SapSystems.Enums.EnsaVersion.ensa2())

      %SapSystemReadModel{sid: other_sid} =
        insert(:sap_system, ensa_version: Trento.SapSystems.Enums.EnsaVersion.ensa2())

      %ClusterReadModel{id: cluster_id, provider: provider, type: cluster_type} =
        insert(:cluster,
          type: :ascs_ers,
          additional_sids: [sid_1, sid_2],
          details:
            build(:ascs_ers_cluster_details,
              sap_systems: [
                build(:ascs_ers_cluster_sap_system, sid: sid_1, filesystem_resource_based: false),
                build(:ascs_ers_cluster_sap_system, sid: sid_2, filesystem_resource_based: false)
              ]
            )
        )

      host_1 = insert(:host, cluster_id: cluster_id)

      insert(:application_instance_without_host,
        sap_system_id: sap_system_id_1,
        host: host_1,
        sid: sid_1
      )

      host_2 = insert(:host, cluster_id: cluster_id)

      insert(:application_instance_without_host,
        sap_system_id: sap_system_id_2,
        host: host_2,
        sid: sid_2
      )

      host_with_other_cluster_id = insert(:host)

      insert(:application_instance_without_host,
        sap_system_id: other_cluster_sap_system_id,
        host: host_with_other_cluster_id
      )

      host_with_other_sid = insert(:host, cluster_id: cluster_id)

      insert(:application_instance_without_host,
        sap_system_id: sap_system_id_1,
        host: host_with_other_sid,
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
                   kind: {:string_value, Atom.to_string(EnsaVersion.ensa1())}
                 }
               }

        assert message.target_type == "cluster"

        :ok
      end)

      assert :ok = Clusters.request_checks_execution(cluster_id)
    end

    test "should start a checks execution on demand for ascs_ers clusters with ENSA 2 version" do
      %SapSystemReadModel{id: sap_system_id_1, sid: sid_1} =
        insert(:sap_system, ensa_version: Trento.SapSystems.Enums.EnsaVersion.ensa2())

      %SapSystemReadModel{id: sap_system_id_2, sid: sid_2} =
        insert(:sap_system, ensa_version: Trento.SapSystems.Enums.EnsaVersion.ensa2())

      %SapSystemReadModel{id: other_cluster_sap_system_id} =
        insert(:sap_system, sid: sid_1, ensa_version: Trento.SapSystems.Enums.EnsaVersion.ensa1())

      %SapSystemReadModel{sid: other_sid} =
        insert(:sap_system, ensa_version: Trento.SapSystems.Enums.EnsaVersion.ensa1())

      %ClusterReadModel{id: cluster_id, provider: provider, type: cluster_type} =
        insert(:cluster,
          type: :ascs_ers,
          additional_sids: [sid_1, sid_2],
          details:
            build(:ascs_ers_cluster_details,
              sap_systems: [
                build(:ascs_ers_cluster_sap_system, sid: sid_1, filesystem_resource_based: false),
                build(:ascs_ers_cluster_sap_system, sid: sid_2, filesystem_resource_based: false)
              ]
            )
        )

      host_1 = insert(:host, cluster_id: cluster_id)

      insert(:application_instance_without_host,
        sap_system_id: sap_system_id_1,
        host: host_1,
        sid: sid_1
      )

      host_2 = insert(:host, cluster_id: cluster_id)

      insert(:application_instance_without_host,
        sap_system_id: sap_system_id_2,
        host: host_2,
        sid: sid_2
      )

      host_with_other_cluster_id = insert(:host)

      insert(:application_instance_without_host,
        sap_system_id: other_cluster_sap_system_id,
        host: host_with_other_cluster_id
      )

      host_with_other_sid = insert(:host, cluster_id: cluster_id)

      insert(:application_instance_without_host,
        sap_system_id: sap_system_id_1,
        host: host_with_other_sid,
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
                   kind: {:string_value, Atom.to_string(EnsaVersion.ensa2())}
                 }
               }

        assert message.target_type == "cluster"

        :ok
      end)

      assert :ok = Clusters.request_checks_execution(cluster_id)
    end

    test "should start a checks execution on demand for ascs_ers clusters with mixed ENSA versions" do
      %SapSystemReadModel{id: sap_system_id_1, sid: sid_1} =
        insert(:sap_system, ensa_version: Trento.SapSystems.Enums.EnsaVersion.ensa1())

      %SapSystemReadModel{id: sap_system_id_2, sid: sid_2} =
        insert(:sap_system, ensa_version: Trento.SapSystems.Enums.EnsaVersion.ensa2())

      %SapSystemReadModel{id: other_cluster_sap_system_id} =
        insert(:sap_system, sid: sid_1, ensa_version: Trento.SapSystems.Enums.EnsaVersion.ensa1())

      %SapSystemReadModel{sid: other_sid} =
        insert(:sap_system, ensa_version: Trento.SapSystems.Enums.EnsaVersion.ensa1())

      %ClusterReadModel{id: cluster_id, provider: provider, type: cluster_type} =
        insert(:cluster,
          type: :ascs_ers,
          additional_sids: [sid_1, sid_2],
          details:
            build(:ascs_ers_cluster_details,
              sap_systems: [
                build(:ascs_ers_cluster_sap_system, sid: sid_1, filesystem_resource_based: false),
                build(:ascs_ers_cluster_sap_system, sid: sid_2, filesystem_resource_based: false)
              ]
            )
        )

      host_1 = insert(:host, cluster_id: cluster_id)

      insert(:application_instance_without_host,
        sap_system_id: sap_system_id_1,
        host: host_1,
        sid: sid_1
      )

      host_2 = insert(:host, cluster_id: cluster_id)

      insert(:application_instance_without_host,
        sap_system_id: sap_system_id_2,
        host: host_2,
        sid: sid_2
      )

      host_with_other_cluster_id = insert(:host)

      insert(:application_instance_without_host,
        sap_system_id: other_cluster_sap_system_id,
        host: host_with_other_cluster_id
      )

      host_with_other_sid = insert(:host, cluster_id: cluster_id)

      insert(:application_instance_without_host,
        sap_system_id: sap_system_id_1,
        host: host_with_other_sid,
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
                   kind: {:string_value, Atom.to_string(EnsaVersion.mixed_versions())}
                 }
               }

        assert message.target_type == "cluster"

        :ok
      end)

      assert :ok = Clusters.request_checks_execution(cluster_id)
    end
  end
end
