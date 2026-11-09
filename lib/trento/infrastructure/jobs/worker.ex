# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Infrastructure.Jobs.Worker do
  @moduledoc """
  Defines an Oban worker for a periodic job that calls a single function.

      use Trento.Infrastructure.Jobs.Worker, call: {Trento.ActivityLog, :clear_expired_logs}

  The job runs once per schedule (`max_attempts: 1`), is skipped while a previous run is
  still waiting or running, and ignores the result of the function. `:args` lists the job
  arguments passed to the function, in order:

      use Trento.Infrastructure.Jobs.Worker,
        call: {Trento.Discovery, :prune_discovery_events},
        args: ["older_than"]
  """

  defmacro __using__(opts) do
    {module, function} = Keyword.fetch!(opts, :call)
    arg_names = Keyword.get(opts, :args, [])

    quote do
      use Oban.Worker, max_attempts: 1, unique: [period: :infinity, states: :incomplete]

      @impl Oban.Worker
      def perform(%Oban.Job{args: args}) do
        arguments = Enum.map(unquote(arg_names), &Map.fetch!(args, &1))

        apply(unquote(module), unquote(function), arguments)

        :ok
      end
    end
  end
end
