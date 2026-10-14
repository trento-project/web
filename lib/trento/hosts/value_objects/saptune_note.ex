# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Hosts.ValueObjects.SaptuneNote do
  @moduledoc """
  Represents a SAP note.
  """
  @required_fields [:id, :additionally_enabled]

  use Trento.Support.Type

  deftype do
    field :id, :string
    field :additionally_enabled, :boolean
  end
end
