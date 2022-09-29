defmodule Trento.Domain.Enum.ClusterType do
  @moduledoc """
  Type that represents the supported cluster types.
  """

  use Trento.Domain.Enum, values: [:hana_scale_up, :hana_scale_out, :unknown]
end
