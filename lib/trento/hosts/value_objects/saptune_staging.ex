# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Hosts.ValueObjects.SaptuneStaging do
  @moduledoc """
  Represents the Staging of Saptune.
  """
  @required_fields [:enabled]

  use Trento.Support.Type

  deftype do
    field :enabled, :boolean
    field :notes, {:array, :string}
    field :solutions_ids, {:array, :string}
  end
end
