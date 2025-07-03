defmodule Trento.Discovery.Payloads.Cluster.CrmmonDiscoveryPayload do
  @moduledoc """
  Crmmon field payload
  """
  alias Trento.Support.ListHelper

  defmodule NodeHistory do
    @moduledoc """
    NodeHistory field payload
    """

    @required_fields []
    use Trento.Support.Type

    deftype do
      embeds_many :nodes, Node do
        field :name, :string

        embeds_many :resource_history, HistoryDetail do
          field :name, :string
          field :fail_count, :integer
          field :migration_threshold, :integer
        end
      end
    end

    def changeset(node_history, attrs) do
      node_history
      |> cast(attrs, [])
      |> cast_embed(:nodes, with: &nodes_changeset/2, required: true)
      |> validate_required_fields(@required_fields)
    end

    def nodes_changeset(nodes, attrs) do
      nodes
      |> cast(attrs, [:name])
      |> cast_embed(:resource_history, with: &resource_history_changeset/2)
      |> validate_required([:name])
    end

    def resource_history_changeset(resource_history, attrs) do
      resource_history
      |> cast(attrs, [:name, :fail_count, :migration_threshold])
      |> validate_required([:name, :fail_count])
    end
  end

  defmodule CrmmonResource do
    @moduledoc """
    CrmmonResource field payload
    """

    @required_fields [
      :id,
      :role,
      :agent,
      :active,
      :failed,
      :blocked,
      :orphaned,
      :failure_ignored,
      :nodes_running_on,
      :managed
    ]
    use Trento.Support.Type

    deftype do
      field :id, :string
      field :role, :string
      field :agent, :string
      field :active, :boolean
      field :failed, :boolean
      field :blocked, :boolean
      field :managed, :boolean
      field :orphaned, :boolean
      field :failure_ignored, :boolean
      field :nodes_running_on, :integer

      embeds_one :node, ResourceNode, primary_key: false do
        field :id, :string
        field :name, :string
        field :cached, :boolean
      end
    end

    def changeset(crmmon_resource, attrs) do
      crmmon_resource
      |> cast(attrs, fields())
      |> cast_embed(:node, with: &resource_node_changeset/2)
      |> validate_required_fields(@required_fields)
    end

    defp resource_node_changeset(resource_node, attrs) do
      resource_node
      |> cast(attrs, [:id, :name, :cached])
      |> validate_required([:id, :name])
    end
  end

  defmodule Summary do
    @moduledoc """
    Summary field payload
    """

    @required_fields []
    use Trento.Support.Type

    deftype do
      embeds_one :nodes, NodesSummary do
        field :number, :integer
      end

      embeds_one :resources, ResourceSummary do
        field :number, :integer
        field :blocked, :integer
        field :disabled, :integer
      end

      embeds_one :last_change, LastChangeSummary do
        field :time, :string
      end
    end

    def changeset(summary, attrs) do
      summary
      |> cast(attrs, [])
      |> cast_embed(:nodes, with: &nodes_changeset/2, required: true)
      |> cast_embed(:resources, with: &resources_changeset/2, required: true)
      |> cast_embed(:last_change, with: &last_change_changeset/2, required: true)
      |> validate_required_fields(@required_fields)
    end

    def nodes_changeset(nodes, attrs) do
      nodes
      |> cast(attrs, [:number])
      |> validate_required([:number])
    end

    def resources_changeset(resources, attrs) do
      resources
      |> cast(attrs, [:number, :blocked, :disabled])
      |> validate_required([:number])
    end

    def last_change_changeset(last_change, attrs) do
      last_change
      |> cast(attrs, [:time])
      |> validate_required([:time])
    end
  end

  @required_fields [:version]

  use Trento.Support.Type

  deftype do
    field :version, :string

    embeds_one :summary, Summary

    embeds_many :nodes, Node, primary_key: false do
      field :id, :string
      field :name, :string
      field :online, :boolean
      field :unclean, :boolean
      field :standby, :boolean
      field :standby_on_fail, :boolean
      field :maintenance, :boolean
      field :pending, :boolean
      field :shutdown, :boolean
    end

    embeds_many :resources, CrmmonResource

    embeds_many :groups, CrmmonGroup, primary_key: false do
      field :id, :string
      field :managed, :boolean, default: true

      embeds_many :resources, CrmmonResource
    end

    embeds_many :clones, CrmmonClone, primary_key: false do
      field :id, :string
      field :failed, :boolean
      field :unique, :boolean
      field :managed, :boolean
      field :multi_state, :boolean
      field :failure_ignored, :boolean

      embeds_many :resources, CrmmonResource
    end

    embeds_one :node_history, NodeHistory

    embeds_one :node_attributes, NodeAttributes do
      embeds_many :nodes, Node do
        field :name, :string

        embeds_many :attributes, Attribute do
          field :name, :string
          field :value, :string
        end
      end
    end
  end

  def changeset(crmmon, attrs) do
    transformed_attrs = transform_nil_lists(attrs)

    crmmon
    |> cast(transformed_attrs, [:version])
    |> cast_embed(:summary, required: true)
    |> cast_embed(:nodes, with: &nodes_changeset/2, required: true)
    |> cast_embed(:resources)
    |> cast_embed(:groups, with: &groups_changeset/2)
    |> cast_embed(:clones, with: &clones_changeset/2)
    |> cast_embed(:node_history, required: true)
    |> cast_embed(:node_attributes, with: &node_attributes_changeset/2, required: true)
    |> validate_required_fields(@required_fields)
  end

  defp nodes_changeset(nodes, attrs) do
    nodes
    |> cast(attrs, [
      :id,
      :name,
      :online,
      :unclean,
      :standby,
      :standby_on_fail,
      :maintenance,
      :pending,
      :shutdown
    ])
    |> validate_required([:id, :name])
  end

  defp groups_changeset(groups, attrs) do
    groups
    |> cast(attrs, [:id, :managed])
    |> cast_embed(:resources)
    |> validate_required([:id])
  end

  defp clones_changeset(clones, attrs) do
    clones
    |> cast(attrs, [:id, :failed, :unique, :managed, :multi_state, :failure_ignored])
    |> cast_embed(:resources)
    |> validate_required([
      :id,
      :failed,
      :unique,
      :failure_ignored
    ])
  end

  defp node_attributes_changeset(node_attributes, attrs) do
    node_attributes
    |> cast(attrs, [])
    |> cast_embed(:nodes, with: &node_attributes_nodes_changeset/2)
  end

  defp node_attributes_nodes_changeset(nodes, attrs) do
    nodes
    |> cast(attrs, [:name])
    |> cast_embed(:attributes, with: &attributes_changeset/2)
    |> validate_required([:name])
  end

  defp attributes_changeset(attributes, attrs) do
    attributes
    |> cast(attrs, [:name, :value])
    |> validate_required([:name, :value])
  end

  defp transform_nil_lists(
         %{"nodes" => nodes, "groups" => groups, "clones" => clones, "resources" => resources} =
           attrs
       ) do
    attrs
    |> Map.put("nodes", ListHelper.to_list(nodes))
    |> Map.put("groups", ListHelper.to_list(groups))
    |> Map.put("clones", ListHelper.to_list(clones))
    |> Map.put("resources", ListHelper.to_list(resources))
  end

  defp transform_nil_lists(attrs), do: attrs
end
