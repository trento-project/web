# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.ChecksScheduling.Policy do
  @moduledoc """
  Policy for the checks schedule of hosts and clusters.

  Changing the schedule requires the same ability as changing the checks selection
  of the target: all:host_checks_selection or all:cluster_checks_selection.
  """

  @behaviour Bodyguard.Policy

  import Trento.Support.AbilitiesHelper

  alias Trento.Users.User

  @write_actions [:update, :create_exception_window, :delete_exception_window]

  def authorize(action, %User{} = user, %{target_type: target_type})
      when action in @write_actions,
      do:
        has_global_ability?(user) or
          user_has_ability?(user, %{name: "all", resource: "#{target_type}_checks_selection"})

  def authorize(_, _, _), do: true
end
