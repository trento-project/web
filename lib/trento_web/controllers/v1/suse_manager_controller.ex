defmodule TrentoWeb.V1.SUSEManagerController do
  use TrentoWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias Trento.Hosts
  alias Trento.Hosts.Projections.HostReadModel

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
    summary: "Gets available software updates for a given host.",
    tags: ["Target Infrastructure"],
    description:
      "Retrieves all available relevant patches and upgradable packages for a specified host, supporting automated software management and system maintenance.",
    parameters: [
      id: [
        in: :path,
        description:
          "Unique identifier of the host for which software updates are being requested. This value must be a valid UUID string.",
        required: true,
        type: %OpenApiSpex.Schema{
          type: :string,
          format: :uuid,
          example: "d59523fc-0497-4b1e-9fdd-14aa7cda77f1"
        }
      ]
    ],
    responses: [
      ok:
        {"A comprehensive list of available software updates for the specified host, including all relevant patches and upgradable packages.",
         "application/json", AvailableSoftwareUpdatesResponse},
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
    summary: "Gets patches covered by package upgrades in SUSE Multi-Linux Manager.",
    tags: ["Target Infrastructure"],
    description:
      "Retrieves all relevant patches that are covered by package upgrades in SUSE Multi-Linux Manager for a specified host, supporting compliance and system maintenance.",
    parameters: [
      host_id: [
        in: :query,
        description:
          "Unique identifier of the host for which patch information is being requested. This value must be a valid UUID string.",
        required: true,
        type: %OpenApiSpex.Schema{
          type: :string,
          format: :uuid,
          example: "d59523fc-0497-4b1e-9fdd-14aa7cda77f1"
        }
      ]
    ],
    responses: [
      ok:
        {"A detailed list of all relevant patches covered by package upgrades in SUSE Multi-Linux Manager for the specified host.",
         "application/json", PatchesForPackagesResponse}
    ]

  @spec patches_for_packages(Plug.Conn.t(), any) :: Plug.Conn.t()
  def patches_for_packages(conn, %{host_id: host_id}) do
    with {:ok, packages_patches} <- SoftwareUpdates.get_packages_patches(host_id) do
      render(conn, %{patches: packages_patches})
    end
  end

  operation :errata_details,
    summary: "Gets the details for an advisory.",
    tags: ["Target Infrastructure"],
    description:
      "Retrieves detailed information for a specified advisory, including CVEs, bug fixes, affected packages, and systems, supporting vulnerability management and compliance.",
    parameters: [
      advisory_name: [
        in: :path,
        description:
          "The name of the advisory for which details are being requested, such as SUSE-2025-1234.",
        required: true,
        type: %OpenApiSpex.Schema{
          type: :string,
          example: "SUSE-2025-1234"
        }
      ]
    ],
    responses: [
      ok:
        {"Detailed information about the specified advisory, including CVEs, bug fixes, affected packages, and systems.",
         "application/json", ErrataDetailsResponse}
    ]

  @spec errata_details(Plug.Conn.t(), any) :: Plug.Conn.t()
  def errata_details(conn, %{advisory_name: advisory_name}) do
    hosts = Hosts.get_all_hosts()

    registered_hosts =
      Enum.flat_map(hosts, fn %HostReadModel{
                                fully_qualified_domain_name: fqdn,
                                hostname: hostname
                              } ->
        [fqdn, hostname]
      end)

    with {:ok, errata_details} <- Discovery.get_errata_details(advisory_name),
         {:ok, cves} <- Discovery.get_cves(advisory_name),
         {:ok, fixes} <- Discovery.get_bugzilla_fixes(advisory_name),
         {:ok, affected_packages} <- Discovery.get_affected_packages(advisory_name),
         {:ok, affected_systems} <- Discovery.get_affected_systems(advisory_name) do
      render(conn, %{
        errata_details: errata_details,
        cves: cves,
        fixes: fixes,
        affected_packages: affected_packages,
        affected_systems:
          Enum.filter(affected_systems, fn %{name: system} ->
            Enum.member?(registered_hosts, system)
          end)
      })
    end
  end
end
