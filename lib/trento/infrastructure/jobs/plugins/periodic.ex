# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Infrastructure.Jobs.Plugins.Periodic do
  @moduledoc """
  Oban plugin that calls functions at a fixed interval, on the leader node only.

  Used for the periodic tasks that need a resolution under one minute,
  which Oban cron does not provide (for example the heartbeat check).
  Runs are aligned to the wall clock and not persisted: a missed run is skipped.

      plugins: [
        {Trento.Infrastructure.Jobs.Plugins.Periodic,
         tasks: [
           heartbeat_check: [every: :timer.seconds(10), mfa: {Trento.Heartbeats, :dispatch_heartbeat_failed_commands, []}]
         ]}
      ]
  """

  @behaviour Oban.Plugin

  use GenServer

  require Logger

  alias Oban.Peer

  @impl Oban.Plugin
  def start_link(opts) do
    {name, opts} = Keyword.pop(opts, :name)

    GenServer.start_link(__MODULE__, opts, name: name)
  end

  @impl Oban.Plugin
  def validate(opts) do
    case Keyword.pop(opts, :tasks) do
      {tasks, []} ->
        validate_tasks(tasks)

      {_tasks, rest} ->
        {:error, "unknown options #{inspect(Keyword.keys(rest))}, expected :tasks"}
    end
  end

  @impl GenServer
  def init(opts) do
    tasks =
      opts
      |> Keyword.fetch!(:tasks)
      |> Map.new(fn {name, task} -> {name, Map.new(task)} end)
      |> tap(&Enum.each(&1, fn {name, %{every: every}} -> schedule(name, every) end))

    {:ok, %{conf: Keyword.fetch!(opts, :conf), tasks: tasks}}
  end

  @impl GenServer
  def handle_info({:run, name}, %{conf: conf, tasks: tasks} = state) do
    %{every: every, mfa: {module, function, args}} = Map.fetch!(tasks, name)

    if Peer.leader?(conf) do
      try do
        apply(module, function, args)
      catch
        kind, reason ->
          Logger.error(
            "Periodic task #{name} failed: " <> Exception.format(kind, reason, __STACKTRACE__)
          )
      end
    end

    schedule(name, every)

    {:noreply, state}
  end

  @doc false
  # Milliseconds from `now` to the next multiple of `every` on the wall clock
  @spec next_run_in(integer(), pos_integer()) :: pos_integer()
  def next_run_in(now, every), do: every - rem(now, every)

  defp schedule(name, every) do
    Process.send_after(self(), {:run, name}, next_run_in(System.os_time(:millisecond), every))
  end

  defp validate_tasks(nil), do: {:error, "expected :tasks to be set"}

  defp validate_tasks(tasks) do
    with :ok <- validate_tasks_format(tasks) do
      case Enum.reject(tasks, &function_defined?/1) do
        [] -> :ok
        undefined -> {:error, Enum.map_join(undefined, ", ", &undefined_function/1)}
      end
    end
  end

  defp validate_tasks_format(tasks) do
    if Keyword.keyword?(tasks) and Enum.all?(tasks, fn {_name, task} -> valid_task?(task) end) do
      :ok
    else
      {:error,
       "expected a keyword list of name: [every: pos_integer(), mfa: {module, function, args}]"}
    end
  end

  defp valid_task?(task) when is_list(task),
    do: Keyword.keyword?(task) and task |> Map.new() |> valid_task_fields?()

  defp valid_task?(_task), do: false

  defp valid_task_fields?(%{every: every, mfa: {module, function, args}})
       when is_integer(every) and every > 0 and is_atom(module) and is_atom(function) and
              is_list(args),
       do: true

  defp valid_task_fields?(_fields), do: false

  defp function_defined?({_name, task}) do
    {module, function, args} = task[:mfa]

    Code.ensure_loaded?(module) and function_exported?(module, function, length(args))
  end

  defp undefined_function({name, task}) do
    {module, function, args} = task[:mfa]

    "task #{inspect(name)} calls #{Exception.format_mfa(module, function, length(args))}, which is undefined"
  end
end
