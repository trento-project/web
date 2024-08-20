defmodule Trento.ActivityLog.Policy do
  @moduledoc """
  Policy for the activity log.

  User with the ability all:all/all:users can see all logs including user management 
  activity log entries when accessing from the get_activity_log_all action.
  All users with any ability can access all logs except user management from the 
  get_activity_log action.
  """

  @behaviour Bodyguard.Policy
  alias Trento.Support.PolicyHelper

  def authorize(:get_activity_log_all, user, _params),
    do:
      PolicyHelper.has_global_ability?(user) or
        PolicyHelper.user_has_ability?(user, %{
          name: "all",
          resource: "users"
        })

  def authorize(_, _, _), do: true
end
