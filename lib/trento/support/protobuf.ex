defmodule Trento.Support.Protobuf do
  @moduledoc """
  Helper functions to use Protobuf mapping
  """
  def from_map(map) do
    %{fields: protobuf_map} =
      map
      |> Enum.into(%{}, fn {key, value} -> {from_key(key), from_value(value)} end)
      |> Google.Protobuf.from_map()

    protobuf_map
  end

  defp from_key(key) when is_atom(key), do: Atom.to_string(key)
  defp from_key(key), do: key

  defp from_value(nil), do: nil
  defp from_value(value) when is_boolean(value), do: value
  defp from_value(value) when is_atom(value), do: Atom.to_string(value)
  defp from_value(value), do: value
end
