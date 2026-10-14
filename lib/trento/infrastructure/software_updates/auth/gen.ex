# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Infrastructure.SoftwareUpdates.Auth.Gen do
  @moduledoc """
  Behaviour of the SUSE Multi-Linux Manager authentication process.
  """

  alias Trento.Infrastructure.SoftwareUpdates.Auth.State

  @callback authenticate() :: {:ok, %State{}} | {:error, any()}

  @callback clear() :: :ok
end
