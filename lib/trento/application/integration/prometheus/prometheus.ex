defmodule Trento.Integration.Prometheus do
  @moduledoc """
  Prometheus integration service
  """

  alias Trento.Repo

  alias Trento.HostReadModel

  @spec get_targets :: [map]
  def get_targets do
    Repo.all(HostReadModel)
  end

  @spec get_exporters_status(String.t()) :: {:ok, map} | {:error, any}
  def get_exporters_status(host_id), do: adapter().get_exporters_status(host_id)

  defp adapter,
    do: Application.fetch_env!(:trento, __MODULE__)[:adapter]
end
