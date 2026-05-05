# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Clusters.Commands.SelectChecks do
  @moduledoc """
  Select the checks to be executed in the cluster.
  """

  @required_fields :all

  use Trento.Support.Command

  defcommand do
    field :cluster_id, Ecto.UUID
    field :checks, {:array, :string}
  end
end
