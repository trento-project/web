defmodule Trento.Support.DateService do
  @moduledoc """
  DateTime service
  """

  @callback utc_now() :: DateTime.t()
  @callback utc_now(Calendar.calendar()) :: DateTime.t()

  def utc_now(calendar \\ Calendar.ISO), do: impl().utc_now(calendar)

  defp impl,
    do: Application.get_env(:trento, __MODULE__, DateTime)
end
