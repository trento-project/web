defmodule Trento.Infrastructure.SoftwareUpdates.Auth.Gen do
  @moduledoc """
  Behaviour of the SUMA authentication process.
  """

  alias Trento.Infrastructure.SoftwareUpdates.Suma.State

  @callback authenticate() ::
              {:ok, %State{}} | {:error, any()}

  @callback authenticate(server_name :: String.t()) ::
              {:ok, %State{}} | {:error, any()}

  @callback clear() :: :ok

  @callback clear(server_name :: String.t()) :: :ok
end
