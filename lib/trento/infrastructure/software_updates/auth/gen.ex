defmodule Trento.Infrastructure.SoftwareUpdates.Auth.Gen do
  @moduledoc """
  Behaviour of the SUMA authentication process.
  """

  alias Trento.Infrastructure.SoftwareUpdates.Suma.State

  @callback authenticate() :: {:ok, %State{}} | {:error, any()}

  @callback clear() :: :ok
end
