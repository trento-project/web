# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Clusters.ValueObjects.SbdDevice do
  @moduledoc """
  Represents the SBDDevice of a HANA cluster.
  """

  @required_fields :all

  use Trento.Support.Type

  deftype do
    field :device, :string
    field :status, :string
  end
end
