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

      insert(:application_instance_without_host,
        sap_system_id: sap_system_id,
        host_id: host_id_1,
        sid: sid
      )

      insert(:application_instance_without_host,
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

    test "should start a checks execution on demand in a hana cluster if checks are selected" do
      for architecture_type <- [HanaArchitectureType.angi(), HanaArchitectureType.classic()] do
        %{
          id: cluster_id,
          provider: provider,
          type: cluster_type
        } =
          insert(:cluster,
            type: ClusterType.hana_scale_up(),
            details: build(:hana_cluster_details, architecture_type: architecture_type)
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

    test "should return clusters with enriched details" do
      cluster_id = Faker.UUID.v4()

      %{
        name: node_name
      } = node = build(:hana_cluster_node, attributes: %{foo_attribute: "foo_value"})

      details = build(:hana_cluster_details, nodes: [node])

      insert(:cluster_enrichment_data,
        cluster_id: cluster_id,
        details: %{
          nodes: [
            %{
              name: node_name,
              attributes: %{
                bar_attribute: "bar_value"
              }
            }
          ]
        }
      )

      insert(:cluster, id: cluster_id, details: details)

      expected_details =
        %{
          details
          | nodes: [
              %{
                node
                | attributes: %{
                    "foo_attribute" => "foo_value",
                    "bar_attribute" => "bar_value"
                  }
              }
            ]
        }
        |> Jason.encode!()
        |> Jason.decode!()

      [
        %ClusterReadModel{
          id: ^cluster_id,
          details: ^expected_details
        }
      ] = Clusters.get_all_clusters()
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

  describe "data enrichment" do
    test "should create a new cluster enrichment data entry" do
      cib_last_written = Date.to_string(Faker.Date.forward(0))
      cluster_id = Faker.UUID.v4()

      details = %{
        "foo_host" => %{
          "foo_attribute" => "foo_value"
        },
        "bar_host" => %{
          "bar_attribute" => "bar_value"
        }
      }

      assert {:ok,
              %ClusterEnrichmentData{
                cluster_id: ^cluster_id,
                cib_last_written: ^cib_last_written,
                details: ^details
              }} =
               Clusters.update_enrichment_data(cluster_id, %{
                 cib_last_written: cib_last_written,
                 details: details
               })
    end

    test "should properly update enrichment data" do
      %{cluster_id: cluster_id} = insert(:cluster_enrichment_data)

      new_cib_last_written = Date.to_string(Faker.DateTime.forward(2))

      new_details = %{
        "nodes" => [
          %{
            "name" => "foo_host",
            "attributes" => %{
              "foo_attribute" => "another_foo_value",
              "another_attribute" => "another_value"
            }
          },
          %{
            "name" => "bar_host",
            "attributes" => %{
              "bar_attribute" => "bar_value"
            }
          }
        ]
      }

      assert {:ok,
              %ClusterEnrichmentData{
                cib_last_written: ^new_cib_last_written,
                details: ^new_details
              }} =
               Clusters.update_enrichment_data(cluster_id, %{
                 cib_last_written: new_cib_last_written,
                 details: new_details
               })
    end

    test "should partially update enrichment data" do
      %{
        cluster_id: cluster_id,
        cib_last_written: initial_cib_last_written
      } = insert(:cluster_enrichment_data)

      new_details = %{
        "nodes" => [
          %{
            "name" => "foo_host",
            "attributes" => %{
              "foo_attribute" => "another_foo_value",
              "another_attribute" => "another_value"
            }
          }
        ]
      }

      assert {:ok,
              %ClusterEnrichmentData{
                cib_last_written: ^initial_cib_last_written,
                details: ^new_details
              }} =
               Clusters.update_enrichment_data(cluster_id, %{
                 details: new_details
               })

      new_cib_last_written = Date.to_string(Faker.DateTime.forward(2))
      unchanged_details = new_details

      assert {:ok,
              %ClusterEnrichmentData{
                cib_last_written: ^new_cib_last_written,
                details: ^unchanged_details
              }} =
               Clusters.update_enrichment_data(cluster_id, %{
                 cib_last_written: new_cib_last_written
               })
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
                   kind: {:string_value, Atom.to_string(ClusterEnsaVersion.mixed_versions())}
                 }
               }

        assert message.target_type == "cluster"

        :ok
      end)

      assert :ok = Clusters.request_checks_execution(cluster_id)
    end
  end
end
