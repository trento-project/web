defmodule Trento.Charts.Hosts.HostCpuChart do
  @moduledoc """
  Represents CPU chart data for a single host

  The chart has different series
    - busy_iowait
    - idle
    - busy_system
    - busy_user
    - busy_other
  """

  @required_fields :all

  use Trento.Support.Type

  alias Trento.Charts.ChartTimeSeries

  deftype do
    embeds_one :busy_iowait, ChartTimeSeries
    embeds_one :idle, ChartTimeSeries
    embeds_one :busy_system, ChartTimeSeries
    embeds_one :busy_user, ChartTimeSeries
    embeds_one :busy_other, ChartTimeSeries
  end
end
