defmodule Trento.Charts.HostDataFetcher do
  @moduledoc """
  Behaviour of host charts data fetcher
  """

  alias Trento.Charts.ChartTimeSeriesSample

  @callback cpu_busy_iowait(host_id :: String.t(), from :: integer(), to :: integer()) ::
              {:ok, [ChartTimeSeriesSample.t()]} | {:error, any}

  @callback cpu_idle(host_id :: String.t(), from :: integer(), to :: integer()) ::
              {:ok, [ChartTimeSeriesSample.t()]} | {:error, any}

  @callback cpu_busy_system(host_id :: String.t(), from :: integer(), to :: integer()) ::
              {:ok, [ChartTimeSeriesSample.t()]} | {:error, any}

  @callback cpu_busy_user(host_id :: String.t(), from :: integer(), to :: integer()) ::
              {:ok, [ChartTimeSeriesSample.t()]} | {:error, any}

  @callback cpu_busy_other(host_id :: String.t(), from :: integer(), to :: integer()) ::
              {:ok, [ChartTimeSeriesSample.t()]} | {:error, any}

  @callback cpu_busy_irqs(host_id :: String.t(), from :: integer(), to :: integer()) ::
              {:ok, [ChartTimeSeriesSample.t()]} | {:error, any}
end
