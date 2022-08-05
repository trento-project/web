defmodule Trento.Event do
  @moduledoc """
  Adds the macro `defevent` which is used to define a new event.
  """

  import Trento.Type, only: [deftype: 1]

  defmacro defevent(opts \\ [], do: block) do
    quote do
      @version Keyword.get(unquote(opts), :version, 1)

      deftype do
        field :version, :integer, default: @version
        unquote(block)
      end

      def new(params) do
        1..@version
        |> Enum.reduce(params, fn version, acc -> upcast(acc, version) end)
        |> super()
      end
    end
  end

  defmacro __using__(_opts) do
    quote do
      @required_fields nil

      use Trento.Type
      import Trento.Event

      def upcast(params, 1), do: params
    end
  end
end
