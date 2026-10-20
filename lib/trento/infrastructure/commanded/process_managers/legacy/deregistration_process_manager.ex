# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.DeregistrationProcessManager do
  @moduledoc """
  Legacy DeregistrationProcessManager module
  """

  def superseded_by,
    do: Trento.Infrastructure.Commanded.ProcessManagers.DeregistrationProcessManager
end
