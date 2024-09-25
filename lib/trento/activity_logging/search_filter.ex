defmodule Trento.ActivityLog.ActivityLog.SearchFilter do
  import Ecto.Query

  def search(query, %Flop.Filter{value: value, op: op} = _flop_filter, _) do
    conditions =
      case op do
        :== ->
          value |> String.split([" "], trim: true) |> Enum.map(&fixed_fields_query/1) |> or_list()

        :ilike_or ->
          value
          |> String.split(["OR", "or", "|", "||"], trim: true)
          |> Enum.map(fn v ->
            v |> String.split([" "], trim: true) |> Enum.map(&all_fields_query/1) |> and_list()
          end)
          |> or_list()

        _ ->
          false
      end

    where(query, ^conditions)
  end

  defp or_list([]) do
    dynamic([r], false)
  end

  defp or_list([expr | rest]) do
    dynamic([r], ^expr or ^or_list(rest))
  end

  defp and_list([]) do
    dynamic([r], true)
  end

  defp and_list([expr | rest]) do
    dynamic([r], ^expr and ^and_list(rest))
  end

  defp fixed_fields_query(value) do
    tenant = string_field(:tenant)
    name = string_field(:name)
    hostname = string_field(:hostname)
    instance_hostname = string_field(:instance_hostname)
    vm_name = string_field(:provider_data, :vm_name)
    additional_sids = json_field(:additional_sids)

    parsed_value = value

    dynamic(
      [r],
      ^tenant == ^parsed_value or
        ^name == ^parsed_value or ^hostname == ^parsed_value or
        ^instance_hostname == ^parsed_value or ^vm_name == ^parsed_value or
        ^in_array(additional_sids, [parsed_value])
    )
  end

  defp string_field(name) do
    n = name |> to_string()

    dynamic(
      [r],
      fragment(
        "?->>?",
        field(r, :metadata),
        ^n
      )
    )
  end

  defp string_field(parent, name) do
    n = name |> to_string()
    p = parent |> to_string()

    dynamic(
      [r],
      fragment(
        "?->?->>?",
        field(r, :metadata),
        ^p,
        ^n
      )
    )
  end

  defp json_field(name)
       when name in [:additional_sids, :tenants] do
    n = name |> to_string()

    dynamic(
      [r],
      fragment(
        "?->?",
        field(r, :metadata),
        ^n
      )
    )
  end

  defp in_array(field_expr, value) when is_list(value) do
    dynamic(
      [r],
      fragment(
        "(? @> ?::jsonb)",
        ^field_expr,
        ^value
      )
    )
  end

  defp all_fields_query(value) when is_binary(value) do
    dynamic(
      [r],
      fragment(
        "jsonb_path_exists(?, '$.**[*] \\? (@ like_regex ? flag \"i\")')",
        field(r, :metadata),
        literal(^value)
      )
    )
  end
end

# -- tenant, tenants->>0->>'name', provider_data->>'vm_name', name, instance_hostname, hostname, additional_sids->>0
