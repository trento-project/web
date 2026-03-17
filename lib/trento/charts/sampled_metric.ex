defmodule Trento.Charts.SampledMetric do
  @moduledoc """
  Represents metric and its sample at a given time
  """

  alias Trento.Charts.ChartTimeSeriesSample

  @enforce_keys [:metric, :sample]
  defstruct [:metric, :sample]

  @type t :: %__MODULE__{
          metric: map(),
          sample: ChartTimeSeriesSample.t()
        }
end
