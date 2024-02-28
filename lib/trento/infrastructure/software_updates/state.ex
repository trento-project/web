defmodule Trento.Infrastructure.SoftwareUpdates.Suma.State do
  @moduledoc """
  State for the SUMA Software Updates discovery adapter
  """

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
end
