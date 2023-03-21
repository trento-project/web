defmodule Trento.Domain.Commands.RollUpSapSystem do
  @moduledoc """
  Start a sap_system aggregate rollup
  """

  @required_fields :all

  use Trento.Command

  defcommand do
    field :sap_system_id, Ecto.UUID
  end
end
