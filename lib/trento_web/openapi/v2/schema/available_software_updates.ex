defmodule TrentoWeb.OpenApi.V2.Schema.AvailableSoftwareUpdates do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema

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
        fixes: AdvisoryFixes
      }
    })
  end
end
