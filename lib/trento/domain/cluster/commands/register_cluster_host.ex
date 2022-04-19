defmodule Trento.Domain.Commands.RegisterClusterHost do
  @moduledoc """
  Register a cluster node to the monitoring system.
  """

  @required_fields [
    :cluster_id,
    :host_id,
    :name,
    :type,
    :designated_controller,
    :discovered_health,
    :cloud_provider
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
    field :resources_number, :integer
    field :hosts_number, :integer
    field :discovered_health, Ecto.Enum, values: [:passing, :warning, :critical, :unknown]
    field :cib_last_written, :string
    field :cloud_provider, Ecto.Enum, values: [:azure, :aws, :gcp, :unknown]

    embeds_one :details, HanaClusterDetails
  end
end
