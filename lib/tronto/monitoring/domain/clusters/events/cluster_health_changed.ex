defmodule Tronto.Monitoring.Domain.Events.ClusterHealthChanged do
  @moduledoc """
  ClusterHealthChanged event
  """

  use TypedStruct

  @type health :: :passing | :warning | :critical | :pending

  @derive Jason.Encoder
  typedstruct do
    @typedoc "ClusterHealthChanged event"

    field :cluster_id, String.t(), enforce: true
    field :health, health, enforce: true
  end
end
