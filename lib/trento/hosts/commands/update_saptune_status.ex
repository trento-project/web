defmodule Trento.Hosts.Commands.UpdateSaptuneStatus do
  @moduledoc """
  Update the saptune status on a specific host.
  """
  alias Trento.Hosts.ValueObjects.SaptuneStatus

  @required_fields [:host_id, :saptune_installed]

  use Trento.Command

  defcommand do
    field :host_id, Ecto.UUID
    field :package_version, :string
    field :saptune_installed, :boolean
    field :sap_running, :boolean
    embeds_one :status, SaptuneStatus
  end
end
