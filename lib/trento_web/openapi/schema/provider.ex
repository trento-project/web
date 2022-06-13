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
      enum: [:azure, :aws, :gcp, :default]
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

  defmodule AwsProviderData do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "AwsProviderData",
      description: "AWS detected metadata",
      type: :object,
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
    })
  end

  defmodule GcpProviderData do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "GcpProviderData",
      description: "GCP detected metadata",
      type: :object,
      properties: %{
        disk_number: %Schema{type: :integer},
        image: %Schema{type: :string},
        instance_name: %Schema{type: :string},
        machine_type: %Schema{type: :string},
        network: %Schema{type: :string},
        project_id: %Schema{type: :string},
        zone: %Schema{type: :string}
      }
    })
  end

  defmodule ProviderData do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "ProviderMetadata",
      description: "Detected metadata for any provider",
      oneOf: [
        AwsProviderData,
        AzureProviderData,
        GcpProviderData
      ]
    })
  end
end
