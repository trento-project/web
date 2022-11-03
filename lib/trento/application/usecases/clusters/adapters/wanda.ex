defmodule Trento.Clusters.Wanda do
  @moduledoc """
  Wanda integration adapter
  """

  @behaviour Trento.Clusters.Gen

  import Ecto.Query

  require Logger

  alias Trento.{
    ClusterReadModel,
    HostReadModel
  }

  alias Trento.Integration.Checks

  alias Trento.Repo

  @impl true
  def request_checks_execution(cluster_id) do
    ClusterReadModel
    |> Repo.get(cluster_id)
    |> maybe_request_checks_execution()
  end

  defp maybe_request_checks_execution(nil), do: {:error, :cluster_not_found}
  defp maybe_request_checks_execution(%{selected_checks: []}), do: :ok

  defp maybe_request_checks_execution(%{
         id: cluster_id,
         provider: provider,
         selected_checks: selected_checks
       }) do
    hosts_data =
      Repo.all(
        from h in HostReadModel,
          select: %{host_id: h.id},
          where: h.cluster_id == ^cluster_id
      )

    Checks.request_execution(
      UUID.uuid4(),
      cluster_id,
      provider,
      hosts_data,
      selected_checks
    )
  end

  defp maybe_request_checks_execution(error), do: error
end
