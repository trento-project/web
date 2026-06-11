# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Databases.Events.DatabaseInstanceStatusChangedTest do
  use ExUnit.Case

  require Trento.SapSystems.Enums.Status, as: Status

  alias Trento.Databases.Events.{
    DatabaseInstanceHealthChanged,
    DatabaseInstanceStatusChanged
  }

  describe "DatabaseInstanceStatusChanged event upcasting" do
    test "should upcast DatabaseInstanceStatusChanged event properly from version 1" do
      database_id = Faker.UUID.v4()

      assert %DatabaseInstanceStatusChanged{
               version: 3,
               database_id: ^database_id,
               status: Status.green()
             } =
               %{
                 "database_id" => database_id,
                 "health" => "passing"
               }
               |> DatabaseInstanceStatusChanged.upcast(%{})
               |> DatabaseInstanceStatusChanged.new!()
    end

    test "should superseded DatabaseInstanceHealthChanged to DatabaseInstanceStatusChanged" do
      database_id = Faker.UUID.v4()

      assert %DatabaseInstanceStatusChanged{
               version: 3,
               database_id: ^database_id,
               status: Status.green()
             } =
               %{
                 "database_id" => database_id,
                 "health" => "passing"
               }
               |> DatabaseInstanceHealthChanged.supersede(nil).upcast(%{})
               |> DatabaseInstanceStatusChanged.new!()
    end
  end
end
