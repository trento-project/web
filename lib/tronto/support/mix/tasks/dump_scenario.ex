defmodule Mix.Tasks.DumpScenario do
  @moduledoc "The hello mix task: `mix help hello`"

  use Mix.Task
  import Tronto.Tasks.Helper

  alias Tronto.Monitoring.Integration.Discovery
  alias Tronto.Monitoring.Integration.DiscoveryEvent

  @switches [
    path: :string
  ]

  @aliases [
    p: :path
  ]

  @default_path File.cwd!()

  @shortdoc "Simply calls the Hello.say/0 function."
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
    events = Discovery.get_current_discovery_events()

    Enum.map(
      events,
      fn %DiscoveryEvent{
           agent_id: agent_id,
           discovery_type: discovery_type,
           payload: payload
         } ->
        data =
          Jason.encode!(%{
            agent_id: agent_id,
            discovery_type: discovery_type,
            payload: payload
          })

        scenario_path = Path.join(path, scenario_name)
        File.mkdir_p!(scenario_path)

        scenario_path
        |> Path.join("#{agent_id}_#{discovery_type}.json")
        |> File.write!(data)
      end
    )
  end
end
