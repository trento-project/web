defmodule Trento.Hosts.Commands.SelectHostChecks do
  @moduledoc """
  Select the checks to be executed on a host.
  """

  @required_fields :all

  use Trento.Command

  defcommand do
    field :host_id, Ecto.UUID
    field :checks, {:array, :string}
  end
end
