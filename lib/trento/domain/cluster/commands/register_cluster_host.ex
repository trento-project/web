defmodule Trento.Domain.Commands.RegisterClusterHost do
  @moduledoc """
  Register a cluster node to the monitoring system.
  """

  @required_fields [
    :cluster_id,
    :host_id,
    :name,
    :type,
    :designated_controller
  ]

  use Trento.Command

  alias Trento.Domain.HanaClusterDetails

  defcommand do
    field :cluster_id, Ecto.UUID
    field :host_id, Ecto.UUID
    field :name, :string
    field :type, Ecto.Enum, values: [:hana_scale_up, :hana_scale_out, :unknown]
    field :sid, :string
    field :designated_controller, :boolean

    embeds_one :details, HanaClusterDetails
  end
end
