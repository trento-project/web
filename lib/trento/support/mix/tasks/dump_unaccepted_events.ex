defmodule Mix.Tasks.DumpUnacceptedEvents do
  @moduledoc "The hello mix task: `mix help hello`"

  use Mix.Task
  import Trento.Tasks.Helper

  alias Trento.Integration.Discovery

  @switches [
    path: :string,
    event_number: :integer
  ]

  @aliases [
    p: :path,
    n: :event_number
  ]

  @default_path File.cwd!()
  @default_event_number 10

  @shortdoc "Dump unaccepted discovery events."
  def run(args) do
    case OptionParser.parse(args, switches: @switches, aliases: @aliases) do
      {opts, [scenario_name], _} ->
        case start_repo() do
          {:ok, _} ->
            IO.puts(IO.ANSI.green() <> "Dumping unaccepted events #{scenario_name}...")
            path = Keyword.get(opts, :path, @default_path)
            event_number = Keyword.get(opts, :event_number, @default_event_number)
            dump_unaccepted_events(scenario_name, path, event_number)
            IO.puts(IO.ANSI.green() <> "Done.")

          {:error, error} ->
            print_error("Could not start repo: #{error}")
        end

      {_, _, _} ->
        print_error(
          "Expected dump_unaccepted_events to receive the scenario file name, " <>
            "got: #{inspect(Enum.join(args, " "))}"
        )
    end
  end

  defp dump_unaccepted_events(scenario_name, path, event_number) do
    Discovery.get_unaccepted_events(event_number)
    |> write_events_to_files(scenario_name, path)
  end
end
