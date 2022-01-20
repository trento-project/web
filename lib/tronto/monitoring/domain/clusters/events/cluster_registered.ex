defmodule Tronto.Monitoring.Domain.Events.ClusterRegistered do
  @moduledoc """
    This event is emitted when a cluster is registered.
  """

  use TypedStruct

  @derive Jason.Encoder
  typedstruct do
    @typedoc "ClusterRegistered event"

    field :id_cluster, String.t(), enforce: true
    field :name, String.t(), enforce: true
    field :type, :hana_scale_up | :hana_scale_out | :unknown, enforce: true
    field :sid, String.t() | nil, enforce: true
  end
end
