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
        description:
          "Indicates the cloud provider detected for the resource, such as Azure, AWS, or GCP, supporting infrastructure identification.",
        enum: Provider.values(),
        example: "azure"
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
        description:
          "Represents a cloud provider that can be used to filter catalog results, supporting targeted queries and resource management.",
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
        description:
          "Metadata detected for resources running on Microsoft Azure, including details about resource group, location, VM size, and more.",
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
        },
        example: %{
          resource_group: "sap-production-rg",
          location: "West Europe",
          vm_size: "Standard_E16s_v3",
          data_disk_number: 4,
          offer: "SLES-SAP",
          sku: "15-SP3",
          admin_username: "azureuser"
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
        description:
          "Metadata detected for resources running on Amazon Web Services (AWS), including account, instance, and network details for infrastructure management.",
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
        },
        example: %{
          account_id: "123456789012",
          ami_id: "ami-0123456789abcdef0",
          availability_zone: "us-west-2a",
          data_disk_number: 3,
          instance_id: "i-0123456789abcdef0",
          instance_type: "r5.4xlarge",
          region: "us-west-2",
          vpc_id: "vpc-0123456789abcdef0"
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
        description:
          "Metadata detected for resources running on Google Cloud Platform (GCP), including disk, image, instance, and network details for infrastructure management.",
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
        },
        example: %{
          disk_number: 2,
          image: "sles-15-sp3-sap-v20220126",
          instance_name: "sap-hana-instance",
          machine_type: "n1-highmem-32",
          network: "default",
          project_id: "my-sap-project-123456",
          zone: "europe-west1-b"
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
        type: :object,
        nullable: true,
        description:
          "Represents detected metadata for any supported cloud provider, including AWS, Azure, or GCP, to support infrastructure identification and management.",
        oneOf: [
          AwsProviderData,
          AzureProviderData,
          GcpProviderData
        ],
        example: %{
          resource_group: "sap-production-rg",
          location: "West Europe",
          vm_size: "Standard_E16s_v3",
          data_disk_number: 4,
          offer: "SLES-SAP",
          sku: "15-SP3",
          admin_username: "azureuser"
        }
      },
      struct?: false
    )
  end
end
