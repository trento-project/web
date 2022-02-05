defmodule Tronto.Monitoring.Domain.Commands.RegisterCluster do
  @moduledoc """
  Register a cluster to the monitoring system.
  """

  use TypedStruct
  use Domo

  typedstruct do
    @typedoc "RegisterCluster command"

    field :cluster_id, String.t(), enforce: true
    field :host_id, String.t(), enforce: true
    field :name, String.t(), enforce: true
    field :type, :hana_scale_up | :hana_scale_out | :unknown, enforce: true
    field :sid, String.t() | nil, enforce: true
  end

  use Vex.Struct

  validates :cluster_id, uuid: true
  validates :host_id, uuid: true
end
