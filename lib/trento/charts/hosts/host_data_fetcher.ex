defmodule Trento.Charts.HostDataFetcher do
  @moduledoc """
  Behaviour of host charts data fetcher
  """

  alias Trento.Charts.ChartTimeSeries.Sample

  @callback get_cpu_busy_iowait(host_id :: String.t(), from :: integer(), to :: integer()) ::
              {:ok, [Sample.t()]} | {:error, any}

  @callback get_cpu_idle(host_id :: String.t(), from :: integer(), to :: integer()) ::
              {:ok, [Sample.t()]} | {:error, any}

  @callback get_cpu_busy_system(host_id :: String.t(), from :: integer(), to :: integer()) ::
              {:ok, [Sample.t()]} | {:error, any}

  @callback get_cpu_busy_user(host_id :: String.t(), from :: integer(), to :: integer()) ::
              {:ok, [Sample.t()]} | {:error, any}

  @callback get_cpu_busy_other(host_id :: String.t(), from :: integer(), to :: integer()) ::
              {:ok, [Sample.t()]} | {:error, any}
end
