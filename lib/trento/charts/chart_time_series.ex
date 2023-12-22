defmodule Trento.Charts.ChartTimeSeries do
  @moduledoc """
   Represents a time series of a chart
   The series has a label and the samples distributed through time
  """

  alias Trento.Charts.ChartTimeSeriesSample

  @enforce_keys [:label, :series]
  defstruct [:label, :series]

  @type t :: %__MODULE__{
          label: String.t(),
          series: [ChartTimeSeriesSample.t()]
        }
end
