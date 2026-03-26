defmodule Trento.Infrastructure.Commanded.Middleware.EnrichRegisterDatabaseInstanceTest do
  use ExUnit.Case
  use Trento.DataCase

  import Trento.Factory

  alias Trento.Databases.Commands.RegisterDatabaseInstance
  alias Trento.Infrastructure.Commanded.Middleware.Enrichable

  test "should return an enriched command updating the system replication tier for secondary instances" do
    %{id: database_id} = insert(:database)

    insert(:database_instance,
      database_id: database_id,
      system_replication_site_id: 1,
      system_replication_tier: 1
    )

    command =
      build(
        :register_database_instance_command,
        database_id: database_id,
        system_replication_active_primary_site: 1,
        system_replication: "Secondary",
        system_replication_tier: nil
      )

    assert {:ok,
            %RegisterDatabaseInstance{
              system_replication_tier: 2
            }} =
             Enrichable.enrich(command, %{})
  end

  test "should return unmodified command when active primary site does not have a tier" do
    %{id: database_id} = insert(:database)

    insert(:database_instance,
      database_id: database_id,
      system_replication_site_id: 1,
      system_replication_tier: nil
    )

    command =
      build(
        :register_database_instance_command,
        database_id: database_id,
        system_replication_active_primary_site: 1,
        system_replication: "Secondary",
        system_replication_tier: nil
      )

    assert {:ok, command} == Enrichable.enrich(command, %{})
  end

  test "should return unmodified command when there is not any matching primary site id" do
    %{id: database_id} = insert(:database)

    insert(:database_instance,
      database_id: database_id,
      system_replication_site_id: 1,
      system_replication_tier: nil
    )

    command =
      build(
        :register_database_instance_command,
        database_id: database_id,
        system_replication_active_primary_site: 2,
        system_replication: "Secondary",
        system_replication_tier: nil
      )

    assert {:ok, command} == Enrichable.enrich(command, %{})
  end

  test "should return unmodified command when there is not any other instance in the database" do
    command =
      build(
        :register_database_instance_command,
        system_replication_active_primary_site: 1,
        system_replication: "Secondary",
        system_replication_tier: nil
      )

    assert {:ok, command} == Enrichable.enrich(command, %{})
  end

  test "should return unmodified command for primary instance" do
    command =
      build(
        :register_database_instance_command,
        system_replication: "Primary"
      )

    assert {:ok, command} == Enrichable.enrich(command, %{})
  end

  test "should return unmodified command for secondary instance when tier is already found" do
    command =
      build(
        :register_database_instance_command,
        system_replication: "Secondary",
        system_replication_tier: 1
      )

    assert {:ok, command} == Enrichable.enrich(command, %{})
  end
end
