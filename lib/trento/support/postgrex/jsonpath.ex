defmodule Trento.Postgrex.Jsonpath do
  @moduledoc false

  @behaviour Postgrex.Extension

  @impl Postgrex.Extension
  def init(opts) do
    Keyword.get(opts, :decode_copy, :copy)
  end

  @impl Postgrex.Extension
  def matching(_state), do: [type: "jsonpath"]

  @impl Postgrex.Extension
  def format(_state), do: :text

  @impl Postgrex.Extension
  def encode(_state) do
    quote do
      bin when is_binary(bin) ->
        [<<byte_size(bin)::signed-size(32)>> | bin]
    end
  end

  @impl Postgrex.Extension
  def decode(:reference) do
    quote do
      <<len::signed-size(32), bin::binary-size(len)>> ->
        bin
    end
  end

  def decode(:copy) do
    quote do
      <<len::signed-size(32), bin::binary-size(len)>> ->
        :binary.copy(bin)
    end
  end
end
