defmodule Tronto.Monitoring.Domain.SlesSubscription do
  @moduledoc """
  SLES subscriptions value object
  """

  use TypedStruct
  use Domo

  @derive Jason.Encoder
  typedstruct do
    @typedoc "SlesSubscription value object"

    field :host_id, String.t(), enforce: true
    field :identifier, String.t(), enforce: true
    field :version, String.t(), enforce: true
    field :arch, String.t(), enforce: true
    field :status, String.t(), enforce: true
    field :subscription_status, String.t()
    field :type, String.t()
    field :starts_at, String.t()
    field :expires_at, String.t()
  end
end
