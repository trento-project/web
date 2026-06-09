# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.SapSystems.Events.ApplicationInstanceRegisteredTest do
  use ExUnit.Case

  require Trento.SapSystems.Enums.Status, as: Status

  alias Trento.SapSystems.Events.ApplicationInstanceRegistered

  describe "ApplicationInstanceRegistered event upcasting" do
    test "should upcast ApplicationInstanceRegistered event properly from version 1" do
      sap_system_id = Faker.UUID.v4()

      assert %ApplicationInstanceRegistered{
               version: 2,
               sap_system_id: ^sap_system_id,
               status: Status.red()
             } =
               %{
                 "sap_system_id" => sap_system_id,
                 "health" => "critical"
               }
               |> ApplicationInstanceRegistered.upcast(%{})
               |> ApplicationInstanceRegistered.new!()
    end
  end
end
