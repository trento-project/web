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
end
