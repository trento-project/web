defmodule Trento.Clusters.Enums.ClusterHostStatus do
  @moduledoc """
  Type that represents whether a host is online or offline in a cluster.
  """

  use Trento.Support.Enum, values: [:online, :offline]
end
