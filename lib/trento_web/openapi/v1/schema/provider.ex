defmodule TrentoWeb.OpenApi.V1.Schema.Provider do
  @moduledoc false

  require OpenApiSpex
  require Trento.Enums.Provider, as: Provider

  alias OpenApiSpex.Schema

  defmodule SupportedProviders do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "SupportedProviders",
        type: :string,
        description: "Detected Provider where the resource is running",
        enum: Provider.values()
      },
      struct?: false
    )
  end

  defmodule FilterableProviders do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "FilterableProvider",
        type: :string,
        description: "A provider that can be used to filter the Catalog",
        enum: [:azure, :aws, :gcp, :default]
      },
      struct?: false
    )
  end

  defmodule AzureProviderData do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "AzureProviderData",
        description: "Azure detected metadata",
        type: :object,
        additionalProperties: false,
        properties: %{
          resource_group: %Schema{type: :string},
          location: %Schema{type: :string},
          vm_size: %Schema{type: :string},
          data_disk_number: %Schema{type: :integer},
          offer: %Schema{type: :string},
          sku: %Schema{type: :string},
          admin_username: %Schema{type: :string}
        }
      },
      struct?: false
    )
  end

  defmodule AwsProviderData do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "AwsProviderData",
        description: "AWS detected metadata",
        type: :object,
        additionalProperties: false,
        properties: %{
          account_id: %Schema{type: :string},
          ami_id: %Schema{type: :string},
          availability_zone: %Schema{type: :string},
          data_disk_number: %Schema{type: :integer},
          instance_id: %Schema{type: :string},
          instance_type: %Schema{type: :string},
          region: %Schema{type: :string},
          vpc_id: %Schema{type: :string}
        }
      },
      struct?: false
    )
  end

  defmodule GcpProviderData do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "GcpProviderData",
        description: "GCP detected metadata",
        type: :object,
        additionalProperties: false,
        properties: %{
          disk_number: %Schema{type: :integer},
          image: %Schema{type: :string},
          instance_name: %Schema{type: :string},
          machine_type: %Schema{type: :string},
          network: %Schema{type: :string},
          project_id: %Schema{type: :string},
          zone: %Schema{type: :string}
        }
      },
      struct?: false
    )
  end

  defmodule ProviderData do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "ProviderMetadata",
        nullable: true,
        description: "Detected metadata for any provider",
        oneOf: [
          AwsProviderData,
          AzureProviderData,
          GcpProviderData
        ]
      },
      struct?: false
    )
  end
end
