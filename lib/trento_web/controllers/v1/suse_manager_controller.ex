defmodule TrentoWeb.V1.SUSEManagerController do
  use TrentoWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias Trento.Hosts
  alias Trento.Hosts.Projections.HostReadModel

  alias Trento.SoftwareUpdates

  alias TrentoWeb.OpenApi.V1.Schema
  alias TrentoWeb.OpenApi.V1.Schema.AvailableSoftwareUpdates.AvailableSoftwareUpdatesResponse

  plug OpenApiSpex.Plug.CastAndValidate, json_render_error_v2: true
  action_fallback TrentoWeb.FallbackController

  operation :software_updates,
    summary: "Gets available software updates for a given host",
    tags: [],
    description:
      "Endpoint to fetch available relevant patches and upgradable packages for a given host ID.",
    parameters: [
      id: [
        in: :path,
        required: true,
        type: %OpenApiSpex.Schema{type: :string, format: :uuid}
      ]
    ],
    responses: [
      ok:
        {"Available software updates for the host", "application/json",
         AvailableSoftwareUpdatesResponse},
      not_found: Schema.NotFound.response(),
      unprocessable_entity: Schema.UnprocessableEntity.response()
    ]

  @spec software_updates(Plug.Conn.t(), any) :: Plug.Conn.t()
  def software_updates(conn, %{id: host_id}) do
    with {:ok, fqdn} <- get_host_fqdn(host_id),
         {:ok, system_id} <- SoftwareUpdates.Discovery.get_system_id(fqdn),
         {:ok, relevant_patches} <- SoftwareUpdates.Discovery.get_relevant_patches(system_id),
         {:ok, upgradable_packages} <-
           SoftwareUpdates.Discovery.get_upgradable_packages(system_id) do
      render(conn, %{relevant_patches: relevant_patches, upgradable_packages: upgradable_packages})
    end
  end

  defp get_host_fqdn(host_id) do
    case Hosts.get_host_by_id(host_id) do
      nil -> {:error, :not_found}
      %HostReadModel{fully_qualified_domain_name: nil} -> {:error, :fqdn_not_found}
      %HostReadModel{fully_qualified_domain_name: fqdn} -> {:ok, fqdn}
    end
  end
end
