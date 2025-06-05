defmodule Trento.Operations.SapSystemPolicyTest do
  @moduledoc false
  use ExUnit.Case, async: true

  alias Trento.Operations.SapSystemPolicy

  import Trento.Factory

  test "should forbid unknown operation" do
    sap_system = build(:sap_system)

    assert {:error, ["Unknown operation"]} ==
             SapSystemPolicy.authorize_operation(:unknown, sap_system, %{})
  end

  describe "SAP instance start" do
    test "should authorize SAP instance start operation" do
      instance = build(:application_instance)

      assert :ok == SapSystemPolicy.authorize_operation(:sap_instance_start, instance, %{})
    end
  end

  describe "SAP instance stop" do
    test "should authorize SAP instance stop operation" do
      instance = build(:application_instance)

      assert :ok == SapSystemPolicy.authorize_operation(:sap_instance_stop, instance, %{})
    end
  end
end
