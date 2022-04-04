defmodule Mix.Tasks.InitGrafanaDashboards do
  @moduledoc """
  Init Grafana Dashboards
  """

  use Mix.Task

  import Trento.Tasks.Helper

  alias Trento.Integration.Grafana

  @shortdoc "Init Grafana dashboards."
  def run(_) do
    Application.ensure_all_started(:hackney)

    case Grafana.init_dashboards() do
      :ok ->
        IO.puts(IO.ANSI.green() <> "Grafana dashboards initialized.")

      {:error, reason} ->
        print_error("Failed to init grafana dashboards: #{reason}")
    end
  end
end
