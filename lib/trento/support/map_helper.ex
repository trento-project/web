defmodule Trento.Support.MapHelper do
  @moduledoc """
  This module provides map utility functions
  """

  @doc """
  Converts any map to a map with atom keys.
  """
  def atomize_keys(map) do
    map
    |> Jason.encode!()
    |> Jason.decode!(keys: :atoms)
  end
end
