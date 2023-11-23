defmodule Trento.SapSystems.Commands.RollUpSapSystem do
  @moduledoc """
  Start a sap system aggregate rollup.
  """

  @required_fields :all

  use Trento.Support.Command

  defcommand do
    field :sap_system_id, Ecto.UUID
  end
end
