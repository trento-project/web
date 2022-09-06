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

      def upcast(params, metadata) do
        params
        |> Map.put_new("version", 1)
        |> upcast_params(metadata)
      end

      defp upcast_params(%{"version" => @version} = params, _) do
        params
      end

      defp upcast_params(%{"version" => version} = params, metadata) do
        params
        |> upcast(metadata, version + 1)
        |> Map.put("version", version + 1)
        |> upcast_params(metadata)
      end
    end
  end

  defmacro __using__(_opts) do
    quote do
      @required_fields nil

      use Trento.Type
      import Trento.Event

      def upcast(params, _, 1), do: params
    end
  end
end
