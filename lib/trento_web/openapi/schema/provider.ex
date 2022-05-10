defmodule TrentoWeb.OpenApi.Schema.Provider do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema

  defmodule ProviderData do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "ProviderMetadata",
      description: "Detected metadata for any provider",
      oneOf: [
        TrentoWeb.OpenApi.Schema.Provider.AzureProviderData
      ]
    })
  end

  defmodule AzureProviderData do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "AzureProviderData",
      description: "Azure detected metadata",
      type: :object,
      properties: %{
        resource_group: %Schema{type: :string},
        location: %Schema{type: :string},
        vm_size: %Schema{type: :string},
        data_disk_number: %Schema{type: :integer},
        offer: %Schema{type: :string},
        sku: %Schema{type: :string},
        admin_username: %Schema{type: :string}
      }
    })
  end
end
