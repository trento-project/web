defmodule Trento.Charts.Hosts.HostMemoryChart do
  @moduledoc """
  Represents Memory chart data for a single host

  The chart has different series
    - ram_total
    - ram_used
    - ram_cache_and_buffer
    - ram_free
    - swap_used
  """

  alias Trento.Charts.ChartTimeSeries

  @enforce_keys [:ram_total, :ram_used, :ram_cache_and_buffer, :ram_free, :swap_used]
  defstruct [:ram_total, :ram_used, :ram_cache_and_buffer, :ram_free, :swap_used]

  @type t :: %__MODULE__{
          ram_total: [ChartTimeSeries.t()],
          ram_cache_and_buffer: [ChartTimeSeries.t()],
          ram_free: [ChartTimeSeries.t()],
          ram_used: [ChartTimeSeries.t()],
          swap_used: [ChartTimeSeries.t()]
        }
end
