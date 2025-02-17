defmodule Trento.Operations.ApplicationInstancePolicyTest do
  @moduledoc false
  use ExUnit.Case, async: true

  require Trento.Enums.Health, as: Health

  alias Trento.Hosts.Projections.HostReadModel

  alias Trento.Operations.ApplicationInstancePolicy

  import Trento.Factory

  test "should forbid unknown operation" do
    instance = build(:application_instance)

    refute ApplicationInstancePolicy.authorize_operation(:unknown, instance, %{})
  end

  describe "maintenance" do
    test "should forbid operation if the application instance is not stopped" do
      instance = build(:application_instance, health: Health.passing())

      refute ApplicationInstancePolicy.authorize_operation(:maintenance, instance, %{})
    end

    test "should authorize operation if the application instance is not clustered" do
      instance =
        build(:application_instance, health: Health.unknown(), host: %HostReadModel{cluster: nil})

      assert ApplicationInstancePolicy.authorize_operation(:maintenance, instance, %{})
    end

    test "should authorize operation if the cluster is in maintenance mode" do
      scenarios = [
        %{maintenance_mode: true, authorized: true},
        %{maintenance_mode: false, authorized: false}
      ]

      for %{maintenance_mode: maintenance_mode, authorized: authorized} <- scenarios do
        cluster_details =
          build(:hana_cluster_details, maintenance_mode: maintenance_mode, nodes: [])

        cluster = build(:cluster, details: cluster_details)

        instance =
          build(:application_instance,
            health: Health.unknown(),
            host: %HostReadModel{cluster: cluster}
          )

        assert authorized ==
                 ApplicationInstancePolicy.authorize_operation(:maintenance, instance, %{
                   cluster_resource_id: nil
                 })
      end
    end
  end
end
