defmodule Trento.Infrastructure.Commanded.Middleware.EnrichDeregisterApplicationInstanceTest do
  use ExUnit.Case
  use Trento.DataCase

  import Trento.Factory

  alias Trento.Infrastructure.Commanded.Middleware.Enrichable

  test "should return sap_system_not_registered if the system ID belongs to a database" do
    %{id: database_id} = insert(:database)

    command =
      build(
        :deregister_application_instance_command,
        sap_system_id: database_id
      )

    assert {:error, :sap_system_not_registered} =
             Enrichable.enrich(command, %{})
  end

  test "should return the deregistration command" do
    command = build(:deregister_application_instance_command)

    assert {:ok, ^command} =
             Enrichable.enrich(command, %{})
  end
end
