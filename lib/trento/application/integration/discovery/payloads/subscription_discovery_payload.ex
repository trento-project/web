defmodule Trento.Integration.Discovery.SlesSubscriptionDiscoveryPayload do
  @moduledoc """
  Subscription discovery integration event payload
  """

  @required_fields [:arch, :identifier, :status, :version]

  use Trento.Type

  deftype do
    field :arch, :string
    field :expires_at, :string
    field :identifier, :string
    field :starts_at, :string
    field :status, :string
    field :subscription_status, :string
    field :type, :string
    field :version, :string
  end
end
