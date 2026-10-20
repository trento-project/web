# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Domain.Events.ChecksExecutionStarted do
  @moduledoc """
  Event of emitted when a checks execution is started.
  """

  use Trento.Support.Event

  defevent do
    field :cluster_id, Ecto.UUID
  end
end
