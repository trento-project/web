defmodule Trento.PersonalAccessTokens do
  @moduledoc """
  Context for managing user personal access tokens.
  """
  alias Trento.PersonalAccessTokens.PersonalAccessToken
  alias Trento.Users.User

  alias Trento.Repo

  @spec create_personal_access_token(User.t(), map()) ::
          {:ok, PersonalAccessToken.t()} | {:error, Ecto.Changeset.t()} | {:error, :forbidden}
  def create_personal_access_token(%User{id: user_id, deleted_at: nil, locked_at: nil}, attrs) do
    %PersonalAccessToken{}
    |> PersonalAccessToken.changeset(Map.put(attrs, :user_id, user_id))
    |> Repo.insert()
  end

  def create_personal_access_token(%User{}, _attrs),
    do: {:error, :forbidden}
end
