defmodule Trento.ActivityLog.Policy do
  @moduledoc """
  Policy for the activity log.

  User with the ability all:all/all:user can see user management activity log entries.
  User with all other abilities can not see any user management activity log entries.
  """

  @behaviour Bodyguard.Policy
  alias Trento.Support.PolicyHelper

  def authorize(:get_activity_log, _user, _params),
    do: true

  def authorize(:get_activity_log_all, user, _params),
    do:
      PolicyHelper.has_global_ability?(user) or
        PolicyHelper.user_has_ability?(user, %{
          name: "all",
          resource: "users"
        })

  def authorize(_, _, _), do: false
end
