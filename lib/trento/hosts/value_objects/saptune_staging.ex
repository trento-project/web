# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

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
