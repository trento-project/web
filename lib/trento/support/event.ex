defmodule Trento.Event do
  @moduledoc """
  Adds the macro `defevent` which is used to define a new event.
  """

  import Trento.Type, only: [deftype: 1]

  defmacro defevent(block) do
    quote do
      deftype(unquote(block))
    end
  end

  defmacro __using__(_opts) do
    quote do
      @required_fields nil

      use Trento.Type
      import Trento.Event, only: [defevent: 1]
    end
  end
end
