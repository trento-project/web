defmodule Trento.Users.PersonalAccessTokens do
  @moduledoc """
  Context for managing user personal access tokens.
  """
  alias Trento.Users.{PersonalAccessToken, User}

  alias Trento.Repo

  @spec get_personal_access_tokens(User.t()) :: [PersonalAccessToken.t()]
  def get_personal_access_tokens(%User{deleted_at: nil} = user) do
    user
    |> Repo.preload(:personal_access_tokens)
    |> Map.fetch!(:personal_access_tokens)
  end

  def get_personal_access_tokens(%User{}), do: []

  @spec create_personal_access_token(User.t(), map()) ::
          {:ok, PersonalAccessToken.t()} | {:error, Ecto.Changeset.t()}
  def create_personal_access_token(%User{id: user_id, deleted_at: nil}, attrs) do
    %PersonalAccessToken{user_id: user_id}
    |> PersonalAccessToken.changeset(attrs)
    |> Repo.insert()
  end

  def create_personal_access_token(%User{deleted_at: _deletion_date}, _attrs),
    do: {:error, :forbidden}
end
