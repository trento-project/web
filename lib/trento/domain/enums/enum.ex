defmodule Trento.Domain.Enum do
  @moduledoc """
  Enum  module with added macros to define a type,
  check supported values and validate possible values
  """

  defmacro __using__(opts) do
    values = Keyword.fetch!(opts, :values)

    quote do
      @type t :: unquote(Enum.reduce(values, &{:|, [], [&1, &2]}))

      defmacro values, do: unquote(values)

      unquote(
        Enum.map(values, fn value ->
          quote do
            defmacro unquote(value)(), do: unquote(value)
          end
        end)
      )
    end
  end
end
