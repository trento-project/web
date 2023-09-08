defmodule Trento.Integration.Discovery.SaptuneDiscoveryPayload do
  alias Trento.Integration.Discovery.SaptuneDiscoveryPayload.ServiceStatus
  @required_fields nil

  use Trento.Type

  deftype do
    field :package_version, :string
    field :configured_version, :string
    field :tuning_state, :string

    field :staging, :string

    embeds_many :services, ServiceStatus
    embeds_one :enabled_solution, Solution
    embeds_one :applied_solution, Solution

    def changeset(payload, attrs) do
      attrs = enrich_with_services_list(attrs)

      payload
      |> cast(attrs, fields())
      |> cast_embed(:services)
    end

    defp enrich_with_services_list(%{"services" => service_map} = attrs) do
      %{
        attrs
        | "services" =>
            Enum.map(service_map, fn {service_name, status} ->
              %{"name" => service_name, "status" => status}
            end)
      }
    end

    defp enrich_with_services_list(attrs), do: attrs

    defp extract_enabled_solution(%{
           "solution_enabled" => [solution_enabled],
           "notes_enabled_by_solution" => [%{"note_list" => note_list}]
         }) do
      format_solution(%{
        "solution_id" => solution_enabled,
        "note_list" => note_list,
        "applied_partially" => false
      })
    end

    defp extract_applied_solution(%{
           "solution_applied" => [solution_applied],
           "notes_applied_by_solution" => [%{"note_list" => note_list}]
         }) do
      format_solution(%{solution_applied | "note_list" => note_list})
    end

    defp format_solution(%{
           "solution_id" => solution_id,
           "note_list" => note_list,
           "applied_partially" => partially_applied
         }),
         do: %{id: solution_id, notes: note_list, partially: partially_applied}
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
        enabled: extract_enabled(status_list),
        active: extract_active(status_list)
      }

      service_status
      |> cast(transformed_attrs, fields())
      |> validate_required_fields(@required_fields)
    end

    defp extract_enabled(service_status) do
      Enum.any?(service_status, fn status -> status == "enabled" end)
    end

    defp extract_active(service_status) do
      Enum.any?(service_status, fn status -> status == "active" end)
    end
  end

  defmodule Solution do
    @required_fields [:id, :notes, :partial]

    use Trento.Type

    deftype do
      field :id, :string
      field :notes, {:array, :string}
      field :partial, :boolean
    end
  end

  defmodule Staging do
    @required_fields [:id, :notes, :solutions]

    use Trento.Type

    deftype do
      field :enabled, :boolean
      field :notes, {:array, :string}

      embeds_many :solutions, Solution
    end
  end
end
