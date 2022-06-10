defmodule Trento.Integration.Discovery.CloudDiscoveryPayload do
  @moduledoc """
  Cloud discovery integration event payload
  """

  @required_fields []

  use Trento.Type
  import PolymorphicEmbed, only: [cast_polymorphic_embed: 3]

  deftype do
    field :provider, Ecto.Enum, values: [:aws, :gcp, :azure, :unknown], default: :unknown

    field :metadata, PolymorphicEmbed,
      types: [azure: __MODULE__.AzureMetadata, aws: __MODULE__.AwsMetadata],
      on_type_not_found: :nilify,
      on_replace: :update
  end

  def changeset(event, attrs) do
    enriched_attrs = enrich_metadata_type(attrs)

    event
    |> cast(enriched_attrs, [:provider])
    |> cast_polymorphic_embed(:metadata, required: false)
  end

  defp enrich_metadata_type(%{"provider" => provider, "metadata" => %{} = metadata} = attrs),
    do: %{attrs | "metadata" => Map.put(metadata, "__type__", provider)}

  defp enrich_metadata_type(attrs), do: attrs

  defmodule AzureMetadata do
    @moduledoc nil

    @required_fields nil
    use Trento.Type

    deftype do
      embeds_one :compute, Compute do
        field :name, :string
        field :resource_group_name, :string
        field :location, :string
        field :vm_size, :string
        field :offer, :string
        field :sku, :string

        embeds_one :os_profile, OsProfile do
          field :admin_username, :string
        end

        embeds_one :storage_profile, StorageProfile do
          field :data_disks, {:array, :map}
        end
      end
    end

    def changeset(event, attrs) do
      event
      |> cast(attrs, [])
      |> cast_embed(:compute,
        with: fn event, attrs ->
          event
          |> cast(attrs, [
            :name,
            :resource_group_name,
            :location,
            :vm_size,
            :offer,
            :sku
          ])
          |> cast_embed(:os_profile,
            with: fn event, attrs -> event |> cast(attrs, [:admin_username]) end
          )
          |> cast_embed(:storage_profile,
            with: fn event, attrs -> event |> cast(attrs, [:data_disks]) end
          )
        end
      )
      |> validate_required_fields(@required_fields)
    end
  end

  defmodule AwsMetadata do
    @moduledoc nil

    @required_fields :all
    use Trento.Type

    deftype do
      field :account_id, :string
      field :ami_id, :string
      field :availability_zone, :string
      field :data_disk_number, :integer
      field :instance_id, :string
      field :instance_type, :string
      field :region, :string
      field :vpc_id, :string
    end
  end
end
