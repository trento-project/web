defmodule Trento.SapSystems.Commands.RestoreSapSystem do
  @moduledoc """
  Restore a previously deregistered SapSystem.
  """

  @required_fields :all

  use Trento.Support.Command

  defcommand do
    field :sap_system_id, Ecto.UUID
    field :db_host, :string
    field :tenant, :string
  end
end
