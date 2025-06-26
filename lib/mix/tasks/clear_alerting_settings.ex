defmodule Mix.Tasks.ClearAlertingSettings do
  @moduledoc "Delete the record for alerting settings from the DB."

  use Mix.Task

  import Trento.Tasks.Helper

  alias Trento.Repo
  alias Trento.Settings.AlertingSettings

  @impl Mix.Task
  def run(_args) do
    case start_repo() do
      {:ok, _} ->
        IO.puts(IO.ANSI.green() <> "Deleting alerting settings record from DB")

        if clear_alerting_settings() do
          IO.puts(IO.ANSI.green() <> "Deleted")
        end

        IO.puts(IO.ANSI.green() <> "Done")

      {:error, error} ->
        print_error("Could not start repo: #{error}")
    end
  end

  defp clear_alerting_settings do
    {count, _} = Repo.delete_all(AlertingSettings.base_query())
    count > 0
  end
end
