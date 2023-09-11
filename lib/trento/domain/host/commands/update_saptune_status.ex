defmodule Trento.Domain.Commands.UpdateSaptuneStatus do
  @moduledoc """
  Update the saptune status on a specific host.
  """
  alias Trento.Domain.SaptuneStatus

  @required_fields [:host_id, :saptune_installed]

  use Trento.Command

  defcommand do
    field :host_id, Ecto.UUID
    field :package_version, :string
    field :saptune_installed, :boolean
    embeds_one :status, SaptuneStatus
  end
end
