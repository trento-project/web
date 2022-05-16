defmodule TrentoWeb.OpenApi.Schema.Provider do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema

  defmodule SupportedProviders do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "SupportedProviders",
      type: :string,
      description: "Detected Provider where the resource is running",
      enum: [:azure, :aws, :gcp, :unknown]
    })
  end

  defmodule FilterableProviders do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "FilterableProvider",
      type: :string,
      description: "A provider that can be used to filter the Catalog",
      # default?
      enum: [:azure, :aws, :gcp]
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

  defmodule ProviderData do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "ProviderMetadata",
      description: "Detected metadata for any provider",
      oneOf: [
        AzureProviderData
      ]
    })
  end
end
