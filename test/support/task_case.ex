defmodule Trento.TaskCase do
  @moduledoc """
  This module defines the test case to be used by tests that require operating on async tasks.
  """

  use ExUnit.CaseTemplate

  using do
    quote do
      def wait_for_tasks_completion(timeout \\ 5_000) do
        Trento.TasksSupervisor
        |> Task.Supervisor.children()
        |> Enum.map(fn pid ->
          Process.monitor(pid)

          pid
        end)
        |> wait_for_pids(timeout)
      end

      defp wait_for_pids([], timeout), do: nil

      defp wait_for_pids(pids, timeout) do
        receive do
          {:DOWN, _ref, :process, pid, _reason} ->
            pids
            |> List.delete(pid)
            |> wait_for_pids(timeout)
        after
          timeout -> :timeout
        end
      end
    end
  end
end
