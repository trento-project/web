defmodule Trento.Charts.ChartTimeSeriesSample do
  @moduledoc """
  ChartTimeSeriesSample represent a sample in a chart timeseries according to the Trento Domain.

  Contains a timestamp, as DateTime and a float value.
  """
  @enforce_keys [:timestamp, :value]
  defstruct [:timestamp, :value]

  @type t :: %__MODULE__{
          timestamp: DateTime.t(),
          value: float()
        }
end
