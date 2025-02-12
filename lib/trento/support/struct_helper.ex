defmodule Trento.Support.StructHelper do
  @moduledoc """
  This module provides structs utility functions
  """
  @doc """
  Converts struct to map.
  Saniteize struct fields by removing __meta__ and Ecto.Association.NotLoaded.t() fields.
  """
  @spec to_map(map | [map] | struct | [struct]) :: map | [map]
  def to_map(structs) when is_list(structs) do
    Enum.map(structs, &to_map/1)
  end

  def to_map(%NaiveDateTime{} = value), do: value
  def to_map(%DateTime{} = value), do: value
  def to_map(%Date{} = value), do: value

  def to_map(struct) when is_struct(struct) do
    struct
    |> Map.from_struct()
    |> to_map()
  end

  def to_map(map) when is_map(map) do
    map
    |> Enum.reject(fn
      {:__meta__, _} -> true
      {_, %Ecto.Association.NotLoaded{}} -> true
      _ -> false
    end)
    |> Map.new(fn {k, v} -> {stringify_key(k), to_map(v)} end)
  end

  def to_map(value) when is_boolean(value), do: value
  def to_map(value) when is_nil(value), do: value
  def to_map(value) when is_atom(value), do: Atom.to_string(value)
  def to_map(value), do: value

  @doc """
  Converts the string keys of a map to existing atoms.
  If the key does not exist as atom it continues being a string
  """
  @spec to_atomized_map(map | [map] | struct | [struct]) :: map | [map]
  def to_atomized_map(%NaiveDateTime{} = value), do: value
  def to_atomized_map(%DateTime{} = value), do: value
  def to_atomized_map(%Date{} = value), do: value

  def to_atomized_map(struct) when is_struct(struct) do
    struct
    |> Map.from_struct()
    |> to_atomized_map()
  end

  def to_atomized_map(map) when is_map(map) do
    map
    |> Enum.reject(fn
      {:__meta__, _} -> true
      {_, %Ecto.Association.NotLoaded{}} -> true
      _ -> false
    end)
    |> Map.new(fn {k, v} -> {atomize_key(k), to_atomized_map(v)} end)
  end

  def to_atomized_map(list) when is_list(list) do
    Enum.map(list, &to_atomized_map/1)
  end

  def to_atomized_map(value), do: value

  defp stringify_key(key) when is_atom(key), do: Atom.to_string(key)
  defp stringify_key(key), do: key

  defp atomize_key(key) when is_atom(key), do: key

  defp atomize_key(key) do
    String.to_existing_atom(key)
  rescue
    ArgumentError -> key
  end
end
