defmodule Mix.Tasks.DumpScenario do
  @moduledoc "The hello mix task: `mix help hello`"

  use Mix.Task
  import Trento.Tasks.Helper

  alias Trento.Integration.Discovery

  @switches [
    path: :string
  ]

  @aliases [
    p: :path
  ]

  @default_path File.cwd!()

  @shortdoc "Dump the current discovery scenario."
  def run(args) do
    case OptionParser.parse(args, switches: @switches, aliases: @aliases) do
      {opts, [scenario_name], _} ->
        case start_repo() do
          {:ok, _} ->
            IO.puts(IO.ANSI.green() <> "Dumping scenario #{scenario_name}...")
            dump_scenario(scenario_name, Keyword.get(opts, :path, @default_path))
            IO.puts(IO.ANSI.green() <> "Done.")

          {:error, error} ->
            print_error("Could not start repo: #{error}")
        end

      {_, _, _} ->
        print_error(
          "Expected dump_scenario to receive the scenario file name, " <>
            "got: #{inspect(Enum.join(args, " "))}"
        )
    end
  end

  defp dump_scenario(scenario_name, path) do
    Discovery.get_current_discovery_events()
    |> write_events_to_files(scenario_name, path)
  end
end
