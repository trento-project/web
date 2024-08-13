defmodule Trento.ActivityLog.Policy do
  @moduledoc """
  Policy for the activity log.

  User with the ability all:all/all:user can see user management activity log entries.
  User with all other abilities can not see any user management activity log entries.
  """

  @behaviour Bodyguard.Policy
  alias Trento.Support.PolicyHelper, as: Helper

  @all_user_ability %{
    name: "all",
    resource: "users"
  }
  def authorize(:get_activity_log, user, _params) do
    case {Helper.has_global_ability?(user), Helper.user_has_ability?(user, @all_user_ability)} do
      {true, _} ->
        true

      {_, true} ->
        true

      _ ->
        false
    end
  end

  def authorize(_, _, _) do
    false
  end
end
