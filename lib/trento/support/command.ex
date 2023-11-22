defmodule Trento.Support.Command do
  @moduledoc """
  Adds the macro `defcommand` which is used to define a new command.
  """

  import Trento.Support.Type, only: [deftype: 1]

  defmacro defcommand(block) do
    quote do
      deftype(unquote(block))
    end
  end

  defmacro __using__(_opts) do
    quote do
      use Trento.Support.Type
      import Trento.Support.Command, only: [defcommand: 1]
    end
  end
end
