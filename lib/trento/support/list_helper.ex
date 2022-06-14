defmodule Trento.Support.ListHelper do
  @moduledoc """
  This module provides list utility functions
  """
  @doc """
  Converts a nil value to an empty list.
  This is useful for changeset, where the field is an EmbedsMany but
  the received value is nil instead of an empty list
  """

  def to_list(list) when is_list(list), do: list
  def to_list(nil), do: []
end
