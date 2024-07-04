defmodule TrentoWeb.OpenApi.V1.Schema.AvailableSoftwareUpdates do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema

  defmodule UpgradablePackage do
    @moduledoc false
    OpenApiSpex.schema(%{
      title: "UpgradablePackage",
      description: "Upgradable package",
      type: :object,
      additionalProperties: false,
      properties: %{
        arch: %Schema{type: :string, description: "Package name"},
        from_epoch: %Schema{type: :string, description: "From epoch"},
        from_release: %Schema{type: :string, description: "From which release"},
        from_version: %Schema{type: :string, description: "From version"},
        name: %Schema{type: :string, description: "Upgradable package name"},
        to_epoch: %Schema{type: :string, description: "To epoch"},
        to_package_id: %Schema{type: :string, description: "To package id"},
        to_release: %Schema{type: :string, description: "To release"},
        to_version: %Schema{type: :string, description: "To version"}
      }
    })
  end

  defmodule RelevantPatch do
    @moduledoc false
    OpenApiSpex.schema(%{
      title: "RelevantPatch",
      description: "Relevant patch",
      type: :object,
      additionalProperties: false,
      properties: %{
        id: %Schema{type: :integer, description: "Advisory's id"},
        advisory_name: %Schema{type: :string, description: "Advisory name"},
        advisory_status: %Schema{type: :string, description: "Advisory status"},
        advisory_synopsis: %Schema{type: :string, description: "Advisory's synopsis"},
        advisory_type: %Schema{
          type: :string,
          description: "Advisory's type",
          enum: [:security_advisory, :bugfix, :enhancement]
        },
        date: %Schema{type: :string, description: "Advisory's date"},
        update_date: %Schema{type: :string, description: "Advisory's update date"}
      }
    })
  end

  defmodule PatchesForPackage do
    @moduledoc false
    OpenApiSpex.schema(%{
      title: "PatchesForPackage",
      description: "Relevant patches covered by a package upgrade",
      type: :object,
      additionalProperties: false,
      properties: %{
        package_id: %Schema{type: :string, description: ""},
        patches: %Schema{
          type: :array,
          additionalProperties: false,
          items: %Schema{
            title: "PatchForPackage",
            description: "A list of relevant patches that the upgrade covers",
            additionalProperties: false,
            properties: %{
              advisory_type: %Schema{type: :string, description: "Advisory type"},
              advisory: %Schema{type: :string, description: "Advisory name for the patch"},
              synopsis: %Schema{type: :string, description: "Advisory synopsis for the patch"},
              issue_date: %Schema{type: :string, description: "Advisory issue date"},
              last_modified_date: %Schema{
                type: :string,
                description: "Advisory last modified date"
              }
            }
          }
        }
      }
    })
  end

  defmodule AvailableSoftwareUpdatesResponse do
    @moduledoc false
    OpenApiSpex.schema(%{
      title: "AvailableSoftwareUpdatesResponse",
      description: "Response returned from the available software updates endpoint",
      type: :object,
      additionalProperties: false,
      properties: %{
        relevant_patches: %Schema{
          title: "RelevantPatches",
          description: "A list relevant patches for the host",
          type: :array,
          items: RelevantPatch
        },
        upgradable_packages: %Schema{
          title: "UpgradablePackages",
          description: "A list of upgradable packages for the host",
          type: :array,
          items: UpgradablePackage
        }
      }
    })
  end

  defmodule PatchesForPackagesResponse do
    @moduledoc false
    OpenApiSpex.schema(%{
      title: "PatchesForPackagesResponse",
      description: "Response returned from the patches for packages endpoint",
      type: :object,
      additionalProperties: false,
      properties: %{
        patches: %Schema{
          title: "PatchesForPackages",
          description: "A list of the relevant patches covered by the provided package upgrades",
          type: :array,
          items: PatchesForPackage
        }
      }
    })
  end

  defmodule ErrataDetails do
    @moduledoc false
    OpenApiSpex.schema(%{
      title: "ErrataDetails",
      description: "Details for the erratum matching the given advisory name",
      type: :object,
      additionalProperties: false,
      properties: %{
        id: %Schema{type: :number, format: :int, description: "Advisory ID number"},
        issue_date: %Schema{
          type: :string,
          format: "date",
          description: "Advisory issue date"
        },
        update_date: %Schema{
          type: :string,
          format: "date",
          description: "Advisory update date"
        },
        last_modified_date: %Schema{
          type: :string,
          format: "date",
          description: "Advisory last modified date"
        },
        synopsis: %Schema{type: :string, description: "Advisory synopsis"},
        release: %Schema{type: :number, format: :int, description: "Advisory Release number"},
        advisory_status: %Schema{type: :string, description: "Advisory status"},
        vendor_advisory: %Schema{type: :string, description: "Vendor advisory"},
        type: %Schema{type: :string, description: "Advisory type"},
        product: %Schema{type: :string, description: "Advisory product"},
        errata_from: %Schema{type: :string, description: "Advisory errata"},
        topic: %Schema{type: :string, description: "Advisory topic"},
        description: %Schema{type: :string, description: "Advisory description"},
        references: %Schema{type: :string, description: "Advisory references"},
        notes: %Schema{type: :string, description: "Advisory notes"},
        solution: %Schema{type: :string, description: "Advisory solution"},
        reboot_suggested: %Schema{
          type: :boolean,
          description:
            "A boolean flag signaling whether a system reboot is advisable following the application of the errata. Typical example is upon kernel update."
        },
        restart_suggested: %Schema{
          type: :boolean,
          description:
            "A boolean flag signaling a weather reboot of the package manager is advisable following the application of the errata. This is commonly used to address update stack issues before proceeding with other updates."
        }
      }
    })
  end

  defmodule CVEs do
    @moduledoc false
    OpenApiSpex.schema(%{
      title: "CVEs",
      description: "List of CVEs applicable to the errata with the given advisory name.",
      type: :array,
      additionalProperties: false,
      items: %Schema{
        title: "CVE",
        description: "A fix for a publicly known security vulnerability",
        type: :string
      }
    })
  end

  defmodule AdvisoryFixes do
    @moduledoc false
    OpenApiSpex.schema(%{
      title: "AdvisoryFixes",
      description: "Response returned from the get advisory fixes endpoint",
      type: :object,
      additionalProperties: %Schema{type: :string}
    })
  end

  defmodule ErrataDetailsResponse do
    @moduledoc false
    OpenApiSpex.schema(%{
      title: "ErrataDetailsResponse",
      description: "Response returned from the errata details endpoint",
      type: :object,
      additionalProperties: false,
      properties: %{
        errata_details: ErrataDetails,
        cves: CVEs,
        fixes: AdvisoryFixes
      }
    })
  end
end
