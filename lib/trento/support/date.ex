defmodule Trento.Support.DateService do
  @moduledoc """
  DateTime service
  """

  @callback utc_now() :: DateTime.t()
  @callback utc_now(Calendar.calendar()) :: DateTime.t()

  def utc_now(calendar \\ Calendar.ISO), do: DateTime.utc_now(calendar)
end
