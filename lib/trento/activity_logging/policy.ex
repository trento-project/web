defmodule Trento.ActivityLog.Policy do
  @moduledoc """
  Policy for the Activity Log resource
  """

  alias Trento.Support.AbilitiesHelper
  alias Trento.Users.User

  def include_all_logs?(user),
    do:
      AbilitiesHelper.has_global_ability?(user) or
        AbilitiesHelper.user_has_ability?(user, %{
          name: "all",
          resource: "users"
        })

  def has_access_to_users?(%User{} = user),
    do:
      AbilitiesHelper.has_global_ability?(user) ||
        AbilitiesHelper.user_has_any_ability?(user, [
          %{
            name: "all",
            resource: "users"
          },
          %{
            name: "activity_log",
            resource: "users"
          }
        ])
end
