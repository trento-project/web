defmodule Mix.Tasks.PruneEvents do
  @moduledoc "Delete events older than X days."

  use Mix.Task
  import Trento.Tasks.Helper

  alias Trento.Integration.Discovery

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
        events_number = Discovery.prune_events(days)
        IO.puts(IO.ANSI.green() <> "Deleted #{events_number} events.")
        discarded_events_number = Discovery.prune_discarded_discovery_events(days)
        IO.puts(IO.ANSI.green() <> "Deleted #{discarded_events_number} discarded events.")

      {:error, error} ->
        print_error("Could not start repo: #{error}")
    end
  end
end
