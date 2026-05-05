# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Domain.Events.ChecksExecutionStarted do
  @moduledoc """
  Event of emitted when a checks execution is started.
  """

  use Trento.Support.Event

  defevent do
    field :cluster_id, Ecto.UUID
  end
end
