defmodule Trento.Integration.Discovery.ClusterDiscoveryPayload.Cib do
  @moduledoc """
  Cib field payload
  """
  alias Trento.Support.ListHelper

  defmodule Primitive do
    @moduledoc """
    Primitive field payload
    """

    @required_fields [:id, :type, :class, :operations, :instance_attributes]
    use Trento.Type

    deftype do
      field :id, :string
      field :type, :string
      field :class, :string
      field :provider, :string

      embeds_many :operations, Operation, primary_key: false do
        field :id, :string
        field :name, :string
        field :role, :string
        field :timeout, :string
        field :interval, :string
      end

      embeds_many :instance_attributes, InstanceAttribute, primary_key: false do
        field :id, :string
        field :name, :string
        field :value, :string
      end
    end

    defp transform_nil_lists(
           %{"operations" => operations, "instance_attributes" => instance_attributes} = attrs
         ) do
      attrs
      |> Map.put("operations", ListHelper.to_list(operations))
      |> Map.put("instance_attributes", ListHelper.to_list(instance_attributes))
    end

    defp transform_nil_lists(attrs), do: attrs

    def changeset(primitive, attrs) do
      transformed_attrs = transform_nil_lists(attrs)

      primitive
      |> cast(transformed_attrs, fields())
      |> cast_embed(:operations, with: &operations_changeset/2)
      |> cast_embed(:instance_attributes, with: &instance_attributes_changeset/2)
      |> validate_required_fields(@required_fields)
    end

    defp operations_changeset(operations, attrs) do
      operations
      |> cast(attrs, [:id, :name, :role, :timeout, :interval])
      |> validate_required_fields([:id, :name, :role])
    end

    defp instance_attributes_changeset(instance_attributes, attrs) do
      instance_attributes
      |> cast(attrs, [:id, :name, :value])
      |> validate_required_fields([:id, :name, :value])
    end
  end

  defmodule CibResources do
    @moduledoc """
    Resources field payload
    """

    @required_fields [:primitives, :clones, :groups]
    use Trento.Type

    deftype do
      embeds_many :primitives, Primitive

      embeds_many :clones, Clone, primary_key: false do
        field :id, :string

        embeds_one :primitive, Primitive
      end

      embeds_many :groups, Group, primary_key: false do
        field :id, :string

        embeds_many :primitives, Primitive
      end
    end

    def changeset(cib_resources, attrs) do
      transformed_attrs = transform_nil_lists(attrs)

      cib_resources
      |> cast(transformed_attrs, [])
      |> cast_embed(:primitives)
      |> cast_embed(:clones, with: &clones_changeset/2)
      |> cast_embed(:groups, with: &groups_changeset/2)
      |> validate_required_fields(@required_fields)
    end

    defp clones_changeset(clones, attrs) do
      clones
      |> cast(attrs, [:id])
      |> cast_embed(:primitive)
      |> validate_required_fields([:id])
    end

    defp groups_changeset(groups, attrs) do
      groups
      |> cast(attrs, [:id])
      |> cast_embed(:primitives)
      |> validate_required_fields([:id])
    end

    defp transform_nil_lists(
           %{"groups" => groups, "primitives" => primitives, "clones" => clones} = attrs
         ) do
      attrs
      |> Map.put("groups", ListHelper.to_list(groups))
      |> Map.put("primitives", ListHelper.to_list(primitives))
      |> Map.put("clones", ListHelper.to_list(clones))
    end

    defp transform_nil_lists(attrs), do: attrs
  end

  @required_fields [:configuration]

  use Trento.Type

  deftype do
    embeds_one :configuration, Configuration do
      embeds_one :resources, CibResources

      embeds_one :crm_config, CrmConfig do
        embeds_many :cluster_properties, ClusterProperties, primary_key: false do
          field :id, :string
          field :name, :string
          field :value, :string
        end
      end
    end
  end

  def changeset(cib, attrs) do
    cib
    |> cast(attrs, [])
    |> cast_embed(:configuration, with: &configuration_changeset/2)
    |> validate_required_fields(@required_fields)
  end

  def configuration_changeset(configuration, attrs) do
    configuration
    |> cast(attrs, [])
    |> cast_embed(:resources)
    |> cast_embed(:crm_config, with: &crm_config_changeset/2)
    |> validate_required_fields([:resources])
  end

  def crm_config_changeset(crm_config, attrs) do
    crm_config
    |> cast(attrs, [])
    |> cast_embed(:cluster_properties, with: &cluster_properties_changeset/2)
    |> validate_required_fields([:cluster_properties])
  end

  def cluster_properties_changeset(cluster_properties, attrs) do
    cluster_properties
    |> cast(attrs, [:id, :name, :value])
    |> validate_required_fields([:id, :name, :value])
  end
end
