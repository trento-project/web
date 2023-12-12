defmodule Trento.Charts.Hosts.HostCpuChart do
  @moduledoc """
  Represents CPU chart data for a single host

  The chart has different series
    - busy_iowait
    - idle
    - busy_system
    - busy_user
    - busy_other
    - busy_irqs
  """

  alias Trento.Charts.ChartTimeSeries

  @enforce_keys [:busy_iowait, :idle, :busy_system, :busy_user, :busy_other, :busy_irqs]
  defstruct [:busy_iowait, :idle, :busy_system, :busy_user, :busy_other, :busy_irqs]

  @type t :: %__MODULE__{
          busy_iowait: [ChartTimeSeries.t()],
          busy_irqs: [ChartTimeSeries.t()],
          busy_other: [ChartTimeSeries.t()],
          busy_system: [ChartTimeSeries.t()],
          busy_user: [ChartTimeSeries.t()],
          idle: [ChartTimeSeries.t()]
        }
end
