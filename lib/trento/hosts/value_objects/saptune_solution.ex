# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Hosts.ValueObjects.SaptuneSolution do
  @moduledoc """
  Represents a Saptune solution
  """
  @required_fields [:id]

  use Trento.Support.Type

  deftype do
    field :id, :string
    field :notes, {:array, :string}
    field :partial, :boolean
  end
end
