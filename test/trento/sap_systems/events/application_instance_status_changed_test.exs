# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.SapSystems.Events.ApplicationInstanceStatusChangedTest do
  use ExUnit.Case

  require Trento.SapSystems.Enums.Status, as: Status

  alias Trento.SapSystems.Events.{
    ApplicationInstanceHealthChanged,
    ApplicationInstanceStatusChanged
  }

  describe "ApplicationInstanceStatusChanged event upcasting" do
    test "should upcast ApplicationInstanceStatusChanged event properly from version 1" do
      sap_system_id = Faker.UUID.v4()

      assert %ApplicationInstanceStatusChanged{
               version: 2,
               sap_system_id: ^sap_system_id,
               status: Status.yellow()
             } =
               %{
                 "sap_system_id" => sap_system_id,
                 "health" => "warning"
               }
               |> ApplicationInstanceStatusChanged.upcast(%{})
               |> ApplicationInstanceStatusChanged.new!()
    end

    test "should superseded ApplicationInstanceHealthChanged to ApplicationInstanceStatusChanged" do
      sap_system_id = Faker.UUID.v4()

      assert %ApplicationInstanceStatusChanged{
               version: 2,
               sap_system_id: ^sap_system_id,
               status: Status.green()
             } =
               %{
                 "sap_system_id" => sap_system_id,
                 "health" => "passing"
               }
               |> ApplicationInstanceHealthChanged.supersede(nil).upcast(%{})
               |> ApplicationInstanceStatusChanged.new!()
    end
  end
end
