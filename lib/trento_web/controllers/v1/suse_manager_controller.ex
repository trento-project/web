defmodule TrentoWeb.V1.SUSEManagerController do
  use TrentoWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias Trento.SoftwareUpdates
  alias Trento.SoftwareUpdates.Discovery

  alias TrentoWeb.OpenApi.V1.Schema

  alias TrentoWeb.OpenApi.V1.Schema.AvailableSoftwareUpdates.{
    AvailableSoftwareUpdatesResponse,
    ErrataDetailsResponse,
    PatchesForPackagesResponse
  }

  plug OpenApiSpex.Plug.CastAndValidate, json_render_error_v2: true
  action_fallback TrentoWeb.FallbackController

  operation :software_updates,
    summary: "Gets available software updates for a given host",
    tags: ["Platform"],
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
    with {:ok,
          %{
            relevant_patches: relevant_patches,
            upgradable_packages: upgradable_packages
          }} <-
           SoftwareUpdates.get_software_updates(host_id) do
      render(conn, %{relevant_patches: relevant_patches, upgradable_packages: upgradable_packages})
    end
  end

  operation :patches_for_packages,
    summary: "Gets patches covered by package upgrades in SUSE Manager",
    tags: ["Platform"],
    description: "Endpoint to fetch relevant patches covered by package upgrades in SUSE Manager",
    parameters: [
      package_ids: [
        in: :query,
        required: true,
        type: %OpenApiSpex.Schema{
          type: :array,
          items: %OpenApiSpex.Schema{
            type: :string
          }
        }
      ]
    ],
    responses: [
      ok:
        {"Available software updates for the host", "application/json",
         PatchesForPackagesResponse}
    ]

  @spec patches_for_packages(Plug.Conn.t(), any) :: Plug.Conn.t()
  def patches_for_packages(conn, %{package_ids: package_ids}) do
    with {:ok, packages_patches} <- SoftwareUpdates.get_packages_patches(package_ids) do
      render(conn, %{patches: packages_patches})
    end
  end

  operation :errata_details,
    summary: "Gets the details for an advisory",
    tags: ["Platform"],
    description: "Endpoint to fetch advisory details for a given advisory name",
    parameters: [
      advisory_name: [
        in: :path,
        required: true,
        type: %OpenApiSpex.Schema{type: :string}
      ]
    ],
    responses: [
      ok: {"Errata details for the advisory", "application/json", ErrataDetailsResponse}
    ]

  @spec errata_details(Plug.Conn.t(), any) :: Plug.Conn.t()
  def errata_details(conn, %{advisory_name: advisory_name}) do
    with {:ok, errata_details} <- Discovery.get_errata_details(advisory_name),
         {:ok, fixes} <- Discovery.get_bugzilla_fixes(advisory_name) do
      render(conn, %{errata_details: errata_details, fixes: fixes})
    end
  end
end
