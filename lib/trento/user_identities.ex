defmodule Trento.UserIdentities do
  @moduledoc """
  The UserIdentities context, serves as custom context for PowAssent
  """
  use PowAssent.Ecto.UserIdentities.Context,
    repo: Trento.Repo,
    user: Trento.Users.User

  alias Trento.Users.User

  @impl true
  @doc """
  redefining the PowAssent upsert method, if a IDP user is associated with a locked user
  """
  def upsert(%User{locked_at: locked_at} = user, _)
      when not is_nil(locked_at),
      do: {:error, {:user_not_allowed, user}}

  def upsert(user, user_identity_params), do: pow_assent_upsert(user, user_identity_params)
end
