defmodule Trento.Support.StructHelper do
  @moduledoc """
  This module provides structs utility functions
  """
  @doc """
  Converts struct to map.
  Saniteize struct fields by removing __meta__ and Ecto.Association.NotLoaded.t() fields.
  """
  @spec to_map(struct | [struct]) :: map
  def to_map(structs) when is_list(structs) do
    Enum.map(structs, &to_map/1)
  end

  def to_map(%NaiveDateTime{} = value), do: value
  def to_map(%DateTime{} = value), do: value
  def to_map(%Date{} = value), do: value

  def to_map(struct) when is_struct(struct) do
    struct
    |> Map.from_struct()
    |> Enum.reject(fn
      {:__meta__, _} -> true
      {_, %Ecto.Association.NotLoaded{}} -> true
      _ -> false
    end)
    |> Enum.map(fn
      {k, v} -> {Atom.to_string(k), to_map(v)}
    end)
    |> Map.new()
  end

  def to_map(value), do: value
end
