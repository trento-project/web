defmodule Trento.Charts.ChartTimeSeriesSample do
  @enforce_keys [:timestamp, :value]
  defstruct [:timestamp, :value]

  @type t :: %__MODULE__{
          timestamp: DateTime.t(),
          value: float()
        }
end
