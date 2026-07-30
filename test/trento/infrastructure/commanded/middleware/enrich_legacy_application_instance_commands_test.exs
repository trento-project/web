# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Infrastructure.Commanded.Middleware.EnrichLegacyApplicationInstanceCommandsTest do
  use Trento.DataCase

  import Trento.Factory

  alias Trento.Infrastructure.Commanded.Middleware.Enrichable

  for command_factory <- [
        :deregister_application_instance_command,
        :mark_application_instance_data_stale_command
      ] do
    describe "#{command_factory}" do
      test "should return sap_system_not_registered if the system ID belongs to a database" do
        %{id: database_id} = insert(:database)

        command =
          build(
            unquote(command_factory),
            sap_system_id: database_id
          )

        assert {:error, :sap_system_not_registered} =
                 Enrichable.enrich(command, %{})
      end

      test "should return the command unchanged" do
        command = build(unquote(command_factory))

        assert {:ok, ^command} =
                 Enrichable.enrich(command, %{})
      end
    end
  end
end
