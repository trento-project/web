defmodule Tronto.Support.DataMapper do
  @moduledoc """
  This module provides an utility function to map an Ecto struct to a DTO.
  """

  @spec to_map(struct) :: map
  def to_map(struct) do
    struct
    |> Map.from_struct()
    |> Enum.reject(fn
      {:__meta__, _} -> true
      {_, %Ecto.Association.NotLoaded{}} -> true
      _ -> false
    end)
    |> Enum.map(fn
      {k, %_{} = v} -> {k, to_map(v)}
      {k, v} -> {k, v}
    end)
    |> Map.new()
  end
end
