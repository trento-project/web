defmodule Trento.ActivityLog.ActivityLog.SearchFilter do
  import Ecto.Query

  def search(query, %Flop.Filter{value: value, op: :ilike_or} = _flop_filter, _) do
    conditions =
      value
      |> String.split(["OR", "or", "|", "||"], trim: true)
      |> Enum.map(fn v ->
        v |> String.split([" "], trim: true) |> Enum.map(&all_fields_query/1) |> and_list()
      end)
      |> or_list()

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
