defmodule Trento.Infrastructure.Ollama.Gen do
  @moduledoc """
  Behaviour of an Ollama adapter.
  """

  @callback chat(
              prompt :: String.t(),
              history :: [map],
              model :: String.t(),
              tools :: [map],
              timeout :: integer
            ) :: {:ok, String.t()} | {:error, any}

  @callback health_check() :: {:ok, map} | {:error, any}
end
