# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Operations.SchedulePolicy do
  @moduledoc """
  Scheduling, changing or cancelling the schedule of an operation requires
  the same ability as requesting that operation.
  """

  @behaviour Bodyguard.Policy

  alias Trento.Hosts.Projections.HostReadModel
  alias Trento.Users.User

  require Trento.Operations.Enums.HostOperations, as: HostOperations

  @host_operations Enum.map(HostOperations.values(), &Atom.to_string/1)

  def authorize(action, %User{} = user, %{operation: operation})
      when action in [:create, :update, :delete] and operation in @host_operations,
      do: Trento.Hosts.Policy.authorize(String.to_existing_atom(operation), user, HostReadModel)

  def authorize(_, _, _), do: true
end
