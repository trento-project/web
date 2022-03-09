defmodule Tronto.Seeds.Helpers do
  @moduledoc """
  This module contains helper functions for dev seeds generation.
  """

  def generate_sequential_uuid(number) do
    tail =
      number
      |> Integer.to_string()
      |> String.pad_leading(12, "a")

    "aaaaaaaa-bbbb-bbbb-bbbb-#{tail}"
  end
end
