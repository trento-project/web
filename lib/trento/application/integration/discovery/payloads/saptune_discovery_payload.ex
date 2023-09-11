defmodule Trento.Integration.Discovery.SaptuneDiscoveryPayload do
  alias Trento.Integration.Discovery.SaptuneDiscoveryPayload.{
    ServiceStatus,
    Solution,
    Staging,
    Note
  }

  @required_fields [
    :services,
    :tuning_state,
    :configured_version,
    :package_version,
    :enabled_solution,
    :applied_solution,
    :enabled_notes,
    :applied_notes,
    :staging
  ]

  use Trento.Type

  deftype do
    field :package_version, :string
    field :configured_version, :string
    field :tuning_state, :string

    embeds_many :services, ServiceStatus
    embeds_many :enabled_notes, Note
    embeds_many :applied_notes, Note
    embeds_one :enabled_solution, Solution
    embeds_one :applied_solution, Solution
    embeds_one :staging, Staging

    def changeset(payload, attrs) do
      payload
      |> cast(attrs, fields())
      |> cast_embed(:services)
      |> cast_embed(:enabled_solution)
      |> cast_embed(:applied_solution)
      |> cast_embed(:staging)
      |> cast_embed(:enabled_notes)
      |> cast_embed(:applied_notes)
    end
  end

  defmodule ServiceStatus do
    @required_fields [:enabled, :active, :name]

    use Trento.Type

    deftype do
      field :name, :string
      field :enabled, :boolean
      field :active, :boolean
    end

    def changeset(service_status, attrs) do
      %{"name" => service_name, "status" => status_list} = attrs

      transformed_attrs = %{
        name: service_name,
        enabled: enabled?(status_list),
        active: active?(status_list)
      }

      service_status
      |> cast(transformed_attrs, fields())
      |> validate_required_fields(@required_fields)
    end

    defp enabled?(service_status) do
      Enum.any?(service_status, fn status -> status == "enabled" end)
    end

    defp active?(service_status) do
      Enum.any?(service_status, fn status -> status == "active" end)
    end
  end

  defmodule Solution do
    @required_fields [:id]

    use Trento.Type

    deftype do
      field :id, :string
      field :notes, {:array, :string}
      field :partial, :boolean
    end
  end

  defmodule Staging do
    @required_fields [:id]

    use Trento.Type

    deftype do
      field :enabled, :boolean
      field :notes, {:array, :string}
      field :solutions_ids, {:array, :string}
    end
  end

  defmodule Note do
    @required_fields [:id, :additionally_enabled]

    use Trento.Type

    deftype do
      field :id, :string
      field :additionally_enabled, :boolean
    end
  end
end
