defmodule Trento.Infrastructure.SoftwareUpdates.Auth.State do
  @moduledoc """
  State for the SUMA Software Updates discovery adapter
  """
  alias __MODULE__

  defstruct [
    :url,
    :username,
    :password,
    :ca_cert,
    :auth
  ]

  @type t :: %{
          url: String.t() | nil,
          username: String.t() | nil,
          password: String.t() | nil,
          ca_cert: String.t() | nil,
          auth: String.t() | nil
        }

  defimpl Inspect, for: State do
    def inspect(%State{url: url, username: username}, opts) do
      Inspect.Map.inspect(
        %{
          url: url,
          username: username,
          password: "<REDACTED>",
          auth: "<REDACTED>",
          ca_cert: "<REDACTED>"
        },
        opts
      )
    end
  end
end
