defmodule Trento.Infrastructure.SoftwareUpdates.Suma.State do
  @moduledoc """
  State for the SUMA Software Updates discovery adapter
  """
  alias __MODULE__

  defstruct [
    :url,
    :username,
    :password,
    :ca_cert,
    :auth,
    use_ca_cert: false
  ]

  @type t :: %{
          url: String.t() | nil,
          username: String.t() | nil,
          password: String.t() | nil,
          ca_cert: String.t() | nil,
          use_ca_cert: boolean(),
          auth: String.t() | nil
        }

  defimpl Inspect, for: State do
    def inspect(%State{url: url, username: username, use_ca_cert: use_ca_cert}, opts) do
      Inspect.Map.inspect(
        %{
          url: url,
          username: username,
          use_ca_cert: use_ca_cert,
          password: "<REDACTED>",
          auth: "<REDACTED>",
          ca_cert: "<REDACTED>"
        },
        opts
      )
    end
  end
end
