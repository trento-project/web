# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Domain.Events.SapSystemTombstoned do
  @moduledoc """
  This event is emitted when a SAP system is deregistered (decommissioned)
  """

  use Trento.Support.Event

  defevent superseded_by: Trento.SapSystems.Events.SapSystemTombstoned do
    field :sap_system_id, Ecto.UUID
  end
end
