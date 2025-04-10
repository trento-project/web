defmodule Trento.Clusters.ValueObjects.SapInstanceTest do
  @moduledoc false
  use ExUnit.Case, async: true

  import Trento.Factory

  alias Trento.Clusters.ValueObjects.SapInstance

  require Trento.Clusters.Enums.SapInstanceResourceType, as: SapInstanceResourceType

  describe "get_hana_instance_sid/1" do
    test "should return the HANA instance sid" do
      sap_instances = [
        build(:clustered_sap_instance, resource_type: SapInstanceResourceType.sap_instance()),
        %{sid: sid} =
          build(:clustered_sap_instance,
            resource_type: SapInstanceResourceType.sap_hana_topology()
          ),
        build(:clustered_sap_instance, resource_type: SapInstanceResourceType.sap_instance())
      ]

      assert sid == SapInstance.get_hana_instance_sid(sap_instances)
    end

    test "should return empty string if HANA instance is not found" do
      sap_instances =
        build_list(3, :clustered_sap_instance,
          resource_type: SapInstanceResourceType.sap_instance()
        )

      assert "" == SapInstance.get_hana_instance_sid(sap_instances)
    end
  end

  describe "get_sap_instance_sids/1" do
    test "should return SAP instance sids" do
      sid_1 = Faker.Lorem.word()
      sid_2 = Faker.StarWars.planet()

      instance_1 =
        build(:clustered_sap_instance,
          sid: sid_1,
          resource_type: SapInstanceResourceType.sap_instance()
        )

      sap_instances = [
        instance_1,
        build(:clustered_sap_instance, resource_type: SapInstanceResourceType.sap_hana_topology()),
        build(:clustered_sap_instance,
          sid: sid_2,
          resource_type: SapInstanceResourceType.sap_instance()
        ),
        build(:clustered_sap_instance,
          sid: sid_1,
          resource_type: SapInstanceResourceType.sap_instance()
        )
      ]

      assert [sid_1, sid_2] == SapInstance.get_sap_instance_sids(sap_instances)
    end
  end
end
