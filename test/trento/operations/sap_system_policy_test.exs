defmodule Trento.Operations.SapSystemPolicyTest do
  @moduledoc false
  use ExUnit.Case, async: true

  require Trento.Enums.Health, as: Health

  alias Trento.Operations.SapSystemPolicy

  import Trento.Factory

  test "should forbid unknown operation" do
    sap_system = build(:sap_system)

    assert {:error, ["Unknown operation"]} ==
             SapSystemPolicy.authorize_operation(:unknown, sap_system, %{})
  end

  describe "sap_system_start" do
    test "should forbid operation if the application cluster is not in maintenance" do
      %{
        name: cluster_name,
        sap_instances: [%{sid: sid, instance_number: instance_number}],
        details: %{resources: [%{id: resource_id}]}
      } =
        cluster = build_cluster_with_maintenance(false)

      sap_system =
        build(:sap_system,
          database_instances: [],
          application_instances:
            build_list(2, :application_instance,
              sid: sid,
              instance_number: instance_number,
              host: build(:host, cluster: cluster)
            )
        )

      assert {:error,
              [
                "Cluster #{cluster_name} or resource #{resource_id} operating this host are not in maintenance mode"
              ]} ==
               SapSystemPolicy.authorize_operation(:sap_system_start, sap_system, %{
                 instance_type: "all"
               })
    end

    test "should forbid operation if database without system replication is not started" do
      sap_system =
        build(:sap_system,
          database_instances: [
            %{sid: sid} =
              build(:database_instance,
                health: Health.unknown(),
                system_replication: nil
              )
          ],
          application_instances:
            build_list(2, :application_instance, host: build(:host, cluster: nil))
        )

      assert {:error, ["Database #{sid} is not started"]} ==
               SapSystemPolicy.authorize_operation(:sap_system_start, sap_system, %{
                 instance_type: "abap"
               })
    end

    test "should forbid operation if database with system replication is not started" do
      sap_system =
        build(:sap_system,
          database_instances: [
            %{sid: sid} =
              build(:database_instance,
                health: Health.unknown(),
                system_replication: "Primary",
                system_replication_site: "Site1"
              ),
            build(:database_instance,
              health: Health.passing(),
              system_replication: "Secondary"
            )
          ],
          application_instances:
            build_list(2, :application_instance, host: build(:host, cluster: nil))
        )

      assert {:error, ["Database #{sid} primary site Site1 is not started"]} ==
               SapSystemPolicy.authorize_operation(:sap_system_start, sap_system, %{
                 instance_type: "abap"
               })
    end

    test "should forbid operation if the message server is not started for other type start request" do
      sap_system =
        build(:sap_system,
          database_instances: [],
          application_instances: [
            %{sid: sid, instance_number: inst_number} =
              build(:application_instance,
                health: Health.unknown(),
                features: "MESSAGESERVER|ENQUE",
                host: build(:host, cluster: nil)
              )
          ]
        )

      assert {:error, ["Instance #{inst_number} of SAP system #{sid} is not started"]} ==
               SapSystemPolicy.authorize_operation(:sap_system_start, sap_system, %{
                 instance_type: "abap"
               })
    end

    test "should authorize operation if cluster is in maintenance" do
      %{sap_instances: [%{sid: sid, instance_number: instance_number}]} =
        cluster = build_cluster_with_maintenance(true)

      sap_system =
        build(:sap_system,
          database_instances: [],
          application_instances:
            build_list(2, :application_instance,
              sid: sid,
              instance_number: instance_number,
              host: build(:host, cluster: cluster)
            )
        )

      assert :ok ==
               SapSystemPolicy.authorize_operation(:sap_system_start, sap_system, %{
                 instance_type: "all"
               })
    end

    test "should authorize operation if cluster is not in maintenance and the request is for application instances" do
      for instance_type <- ["abap", "j2ee"] do
        %{sap_instances: [%{sid: sid, instance_number: instance_number}]} =
          cluster = build_cluster_with_maintenance(false)

        sap_system =
          build(:sap_system,
            database_instances: [],
            application_instances:
              build_list(2, :application_instance,
                sid: sid,
                instance_number: instance_number,
                host: build(:host, cluster: cluster)
              )
          )

        assert :ok ==
                 SapSystemPolicy.authorize_operation(:sap_system_start, sap_system, %{
                   instance_type: instance_type
                 })
      end
    end

    test "should authorize operation if the database is started" do
      sap_system =
        build(:sap_system,
          database_instances: [
            build(:database_instance,
              health: Health.passing(),
              system_replication: nil
            )
          ],
          application_instances:
            build_list(2, :application_instance, host: build(:host, cluster: nil))
        )

      assert :ok ==
               SapSystemPolicy.authorize_operation(:sap_system_start, sap_system, %{})
    end

    test "should authorize operation if message server is started" do
      sap_system =
        build(:sap_system,
          database_instances: [],
          application_instances: [
            build(:application_instance,
              health: Health.passing(),
              features: "MESSAGESERVER|ENQUE",
              host: build(:host, cluster: nil)
            )
          ]
        )

      assert :ok ==
               SapSystemPolicy.authorize_operation(:sap_system_start, sap_system, %{
                 instance_type: "abap"
               })
    end

    test "should authorize operation if message server is stopped but the request will start it" do
      scenarios = [
        %{},
        %{instance_type: "scs"},
        %{instance_type: "all"}
      ]

      for params <- scenarios do
        sap_system =
          build(:sap_system,
            database_instances: [],
            application_instances: [
              build(:application_instance,
                health: Health.unknown(),
                features: "MESSAGESERVER|ENQUE",
                host: build(:host, cluster: nil)
              )
            ]
          )

        assert :ok ==
                 SapSystemPolicy.authorize_operation(:sap_system_start, sap_system, params)
      end
    end
  end

  describe "sap_system_stop" do
    test "should forbid operation if the application cluster is not in maintenance" do
      %{
        name: cluster_name,
        sap_instances: [%{sid: sid, instance_number: instance_number}],
        details: %{resources: [%{id: resource_id}]}
      } =
        cluster = build_cluster_with_maintenance(false)

      sap_system =
        build(:sap_system,
          application_instances:
            build_list(2, :application_instance,
              sid: sid,
              instance_number: instance_number,
              host: build(:host, cluster: cluster)
            )
        )

      assert {:error,
              [
                "Cluster #{cluster_name} or resource #{resource_id} operating this host are not in maintenance mode"
              ]} ==
               SapSystemPolicy.authorize_operation(:sap_system_stop, sap_system, %{
                 instance_type: "all"
               })
    end

    test "should forbid operation if other instances are not stopped and the request is for the message server" do
      sap_system =
        build(:sap_system,
          application_instances: [
            %{sid: sid, instance_number: inst_number} =
              build(:application_instance,
                health: Health.passing(),
                features: "ABAP|GATEWAY|ICMAN|IGS",
                host: build(:host, cluster: nil)
              )
          ]
        )

      assert {:error, ["Instance #{inst_number} of SAP system #{sid} is not stopped"]} ==
               SapSystemPolicy.authorize_operation(:sap_system_stop, sap_system, %{
                 instance_type: "scs"
               })
    end

    test "should authorize operation if cluster is in maintenance" do
      %{sap_instances: [%{sid: sid, instance_number: instance_number}]} =
        cluster = build_cluster_with_maintenance(true)

      sap_system =
        build(:sap_system,
          application_instances:
            build_list(2, :application_instance,
              sid: sid,
              instance_number: instance_number,
              host: build(:host, cluster: cluster)
            )
        )

      assert :ok ==
               SapSystemPolicy.authorize_operation(:sap_system_stop, sap_system, %{
                 instance_type: "all"
               })
    end

    test "should authorize operation if cluster is not in maintenance and the request is for application instances" do
      for instance_type <- ["abap", "j2ee"] do
        %{sap_instances: [%{sid: sid, instance_number: instance_number}]} =
          cluster = build_cluster_with_maintenance(false)

        sap_system =
          build(:sap_system,
            application_instances:
              build_list(2, :application_instance,
                sid: sid,
                instance_number: instance_number,
                host: build(:host, cluster: cluster)
              )
          )

        assert :ok ==
                 SapSystemPolicy.authorize_operation(:sap_system_stop, sap_system, %{
                   instance_type: instance_type
                 })
      end
    end

    test "should authorize operation if the request is not for the message server" do
      sap_system =
        build(:sap_system,
          application_instances: [
            build(:application_instance,
              health: Health.passing(),
              features: "MESSAGESERVER|ENQUE",
              host: build(:host, cluster: nil)
            )
          ]
        )

      assert :ok ==
               SapSystemPolicy.authorize_operation(:sap_system_stop, sap_system, %{
                 instance_type: "abap"
               })
    end

    test "should authorize operation if the message server is stopped" do
      sap_system =
        build(:sap_system,
          application_instances: [
            build(:application_instance,
              health: Health.unknown(),
              features: "MESSAGESERVER|ENQUE",
              host: build(:host, cluster: nil)
            )
          ]
        )

      assert :ok ==
               SapSystemPolicy.authorize_operation(:sap_system_stop, sap_system, %{
                 instance_type: "abap"
               })
    end
  end

  defp build_cluster_with_maintenance(maintenance_mode) do
    [%{id: resource_id, sid: sid}] =
      resources =
      build_list(1, :cluster_resource,
        type: "ocf::heartbeat:SAPInstance",
        managed: not maintenance_mode
      )

    clustered_sap_instances =
      build_list(1, :clustered_sap_instance, sid: sid, resource_id: resource_id)

    cluster_details =
      build(:ascs_ers_cluster_details,
        maintenance_mode: maintenance_mode,
        sap_systems: [],
        resources: resources
      )

    build(:cluster, sap_instances: clustered_sap_instances, details: cluster_details)
  end
end
