defmodule Trento.Clusters.Runner do
  @moduledoc """
  Trento runner integration adapter
  """

  @behaviour Trento.Clusters.Gen

  alias Trento.Domain.Commands.RequestChecksExecution

  @impl true
  def request_checks_execution(cluster_id) do
    with {:ok, command} <- RequestChecksExecution.new(%{cluster_id: cluster_id}) do
      commanded().dispatch(command)
    end
  end

  defp commanded,
    do: Application.fetch_env!(:trento, Trento.Commanded)[:adapter]
end
