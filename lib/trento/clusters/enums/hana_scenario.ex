defmodule Trento.Clusters.Enums.HanaScenario do
  @moduledoc """
  Type that represents the supported HANA architecture types.
  """

  use Trento.Support.Enum, values: [:cost_optimized, :performance_optimized, :unknown]
end
