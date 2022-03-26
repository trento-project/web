defmodule Trento.Domain.SlesSubscription do
  @moduledoc """
  SLES subscriptions value object
  """

  @required_fields [
    :host_id,
    :identifier,
    :version,
    :arch,
    :status
  ]

  use Trento.Type

  deftype do
    field :host_id, :string
    field :identifier, :string
    field :version, :string
    field :arch, :string
    field :status, :string
    field :subscription_status, :string
    field :type, :string
    field :starts_at, :string
    field :expires_at, :string
  end
end
