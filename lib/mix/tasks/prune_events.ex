# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Mix.Tasks.PruneEvents do
  @moduledoc "Delete events older than X days."

  use Mix.Task
  import Trento.Tasks.Helper

  alias Trento.Discovery

  @switches [
    days: :integer
  ]

  @aliases [
    d: :days
  ]

  @default_older_than 10

  @shortdoc "Delete events older than X days."
  def run(args) do
    {opts, _, _} = OptionParser.parse(args, switches: @switches, aliases: @aliases)

    case start_repo() do
      {:ok, _} ->
        days = Keyword.get(opts, :days, @default_older_than)
        IO.puts(IO.ANSI.green() <> "Pruning events...")
        Discovery.prune_discovery_events(days)
        IO.puts(IO.ANSI.green() <> "Done.")

      {:error, error} ->
        print_error("Could not start repo: #{error}")
    end
  end
end
