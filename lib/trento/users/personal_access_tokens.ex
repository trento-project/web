defmodule Trento.Users.PersonalAccessTokens do
  @moduledoc """
  Context for managing user personal access tokens.
  """
  alias Trento.Users.{PersonalAccessToken, User}

  alias Trento.Repo

  @spec create_personal_access_token(User.t(), map()) ::
          {:ok, PersonalAccessToken.t()} | {:error, Ecto.Changeset.t()}
  def create_personal_access_token(%User{id: user_id, deleted_at: nil, locked_at: nil}, attrs) do
    %PersonalAccessToken{user_id: user_id}
    |> PersonalAccessToken.changeset(attrs)
    |> Repo.insert()
  end

  def create_personal_access_token(%User{}, _attrs),
    do: {:error, :forbidden}
end
