# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Infrastructure.SoftwareUpdates.Auth.Gen do
  @moduledoc """
  Behaviour of the SUSE Multi-Linux Manager authentication process.
  """

  alias Trento.Infrastructure.SoftwareUpdates.Auth.State

  @callback authenticate() :: {:ok, %State{}} | {:error, any()}

  @callback clear() :: :ok
end
