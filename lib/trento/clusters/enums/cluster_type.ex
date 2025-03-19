defmodule Trento.Clusters.Enums.ClusterType do
  @moduledoc """
  Type that represents the supported cluster types.
  """

  use Trento.Support.Enum,
    values: [:hana_scale_up, :hana_scale_out, :ascs_ers, :hana_ascs_ers, :unknown]
end
