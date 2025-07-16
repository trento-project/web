defmodule Trento.ActivityLog.ScopedCorrelations do
  @moduledoc """
  For usage in test suites where-in we want per test process isolation
  of the cache keys.
  """
  @behaviour Trento.ActivityLog.Correlations

  @impl true
  def correlation_key(_ctx) do
    # Allow fetching the correlation key provisioned from the calling
    # process to prevent leakage of the key across test process boundaries.
    # In some cases, there is a parent-process/child-process state checking needed,
    # for instance in the SMLM settings save/change where-in there is a
    # Task spawned off at some point over the course of the save/change
    # execution. This ProcessTree invocation helps look for the key in
    # parent process too. This is because the key may not be found in the child process's
    # dictionary post an async call/spawn.
    case ProcessTree.get(:correlation_key, default: nil) do
      nil ->
        nil

      key ->
        # test scenario, where we want the key to be owned/scoped per-test process
        key
    end
  end

  @impl true
  defdelegate put_correlation_id(key, value),
    to: Trento.ActivityLog.Correlations.UnscopedCorrelations

  @impl true
  defdelegate get_correlation_id(key), to: Trento.ActivityLog.Correlations.UnscopedCorrelations

  @impl true
  defdelegate expire_correlation_id(key, ttl),
    to: Trento.ActivityLog.Correlations.UnscopedCorrelations
end
