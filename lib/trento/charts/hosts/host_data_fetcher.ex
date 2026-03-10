defmodule Trento.Charts.HostDataFetcher do
  @moduledoc """
  Behaviour of host charts data fetcher
  """

  alias Trento.Charts.ChartTimeSeriesSample

  @type sampled_metric :: %{metric: map(), sample: ChartTimeSeriesSample.t()}

  @callback cpu_busy_iowait(host_id :: String.t(), from :: DateTime.t(), to :: DateTime.t()) ::
              {:ok, [ChartTimeSeriesSample.t()]} | {:error, any}

  @callback cpu_idle(host_id :: String.t(), from :: DateTime.t(), to :: DateTime.t()) ::
              {:ok, [ChartTimeSeriesSample.t()]} | {:error, any}

  @callback cpu_busy_system(host_id :: String.t(), from :: DateTime.t(), to :: DateTime.t()) ::
              {:ok, [ChartTimeSeriesSample.t()]} | {:error, any}

  @callback cpu_busy_user(host_id :: String.t(), from :: DateTime.t(), to :: DateTime.t()) ::
              {:ok, [ChartTimeSeriesSample.t()]} | {:error, any}

  @callback cpu_busy_other(host_id :: String.t(), from :: DateTime.t(), to :: DateTime.t()) ::
              {:ok, [ChartTimeSeriesSample.t()]} | {:error, any}

  @callback cpu_busy_irqs(host_id :: String.t(), from :: DateTime.t(), to :: DateTime.t()) ::
              {:ok, [ChartTimeSeriesSample.t()]} | {:error, any}

  @callback ram_total(host_id :: String.t(), from :: DateTime.t(), to :: DateTime.t()) ::
              {:ok, [ChartTimeSeriesSample.t()]} | {:error, any}

  @callback ram_used(host_id :: String.t(), from :: DateTime.t(), to :: DateTime.t()) ::
              {:ok, [ChartTimeSeriesSample.t()]} | {:error, any}

  @callback ram_cache_and_buffer(host_id :: String.t(), from :: DateTime.t(), to :: DateTime.t()) ::
              {:ok, [ChartTimeSeriesSample.t()]} | {:error, any}

  @callback ram_free(host_id :: String.t(), from :: DateTime.t(), to :: DateTime.t()) ::
              {:ok, [ChartTimeSeriesSample.t()]} | {:error, any}

  @callback swap_used(host_id :: String.t(), from :: DateTime.t(), to :: DateTime.t()) ::
              {:ok, [ChartTimeSeriesSample.t()]} | {:error, any}

  @callback num_cpus(from :: DateTime.t(), to :: DateTime.t()) ::
              {:ok, integer()} | {:error, any}

  @callback filesystem_usage(host_id :: String.t()) ::
              {:ok,
               %{
                 swap: [sampled_metric()],
                 devices: [sampled_metric()],
                 filesystems: [sampled_metric()]
               }}
              | {:error, any}
end
