defmodule Trento.AI.Policy do
  @behaviour Bodyguard.Policy
  import Trento.Support.AbilitiesHelper
  alias Trento.Users

  def is_authorized_call?(:ask, user_id) do
    {:ok, user} = Users.get_user(user_id)
    authorize(:ask, user, %{})
  end

  @impl true
  def authorize(:ask, user, _params) do
    has_global_ability?(user)
  end

  def authorize(_action, _user, _params) do
    false
  end
end
