defmodule Ecto.Payload do
  @moduledoc """
  Ecto Type that represents a JSONB payload that contains an array or a map.
  """

  use Ecto.Type
  def type, do: :map

  # Provide custom casting rules.
  def cast(data) when is_list(data) or is_map(data) do
    {:ok, data}
  end

  # Everything else is a failure though
  def cast(_), do: :error

  # When loading data from the database, we are guaranteed to
  # receive a map or list
  def load(data) when is_list(data) or is_map(data) do
    {:ok, data}
  end

  # When dumping data to the database, we *expect* a map or list
  # so we need to guard against them.
  def dump(data) when is_list(data) or is_map(data), do: {:ok, data}
  def dump(_), do: :error
end
