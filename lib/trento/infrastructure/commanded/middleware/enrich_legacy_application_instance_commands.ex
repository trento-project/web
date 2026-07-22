# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defimpl Trento.Infrastructure.Commanded.Middleware.Enrichable,
  for: [
    Trento.SapSystems.Commands.DeregisterApplicationInstance,
    Trento.SapSystems.Commands.MarkApplicationInstanceDataStale
  ] do
  @moduledoc """
  This enrichment protocol is an exception caused by legacy events.
  If the deregistration process manager state is populated by legacy events,
  specially old sap system data, it can have application instances with IDs
  that now belong to the database aggregate.
  This causes many issues.
  In order to avoid that, application instance commands whose sap_system_id
  belongs to a database aggregate are ignored.
  """

  alias Trento.SapSystems.Commands.{
    DeregisterApplicationInstance,
    MarkApplicationInstanceDataStale
  }

  alias Trento.Databases.Projections.DatabaseReadModel

  alias Trento.Repo

  @spec enrich(
          DeregisterApplicationInstance.t() | MarkApplicationInstanceDataStale.t(),
          map
        ) :: {:ok, map} | {:error, any}
  def enrich(%{sap_system_id: sap_system_id} = command, _) do
    case Repo.get(DatabaseReadModel, sap_system_id) do
      %DatabaseReadModel{} ->
        {:error, :sap_system_not_registered}

      nil ->
        {:ok, command}
    end
  end
end
