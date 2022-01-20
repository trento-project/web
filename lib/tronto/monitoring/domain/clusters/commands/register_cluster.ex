defmodule Tronto.Monitoring.Domain.Commands.RegisterCluster do
  @moduledoc """
    Register a cluster to the monitoring system.
  """

  use TypedStruct
  use Domo

  typedstruct do
    @typedoc "RegisterCluster command"

    field :id_cluster, String.t(), enforce: true
    field :id_host, String.t(), enforce: true
    field :name, String.t(), enforce: true
    field :type, :hana_scale_up | :hana_scale_out | :unknown, enforce: true
    field :sid, String.t() | nil, enforce: true
  end

  use Vex.Struct

  validates :id_cluster, uuid: true
  validates :id_host, uuid: true
end
