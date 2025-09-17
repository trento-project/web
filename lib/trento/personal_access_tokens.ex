defmodule Trento.PersonalAccessTokens do
  @moduledoc """
  Context for managing user personal access tokens.
  """
  alias Trento.PersonalAccessTokens.PersonalAccessToken
  alias Trento.Users.User

  alias Trento.Repo

  import Ecto.Query

  @spec validate(bitstring(), non_neg_integer()) :: :ok | {:error, :forbidden | :not_found}
  def validate(jti, user_id) do
    PersonalAccessToken
    |> Repo.get_by(jti: jti, user_id: user_id)
    |> Repo.preload(:user)
    |> case do
      nil ->
        {:error, :not_found}

      %PersonalAccessToken{
        user: %User{
          deleted_at: deleted_at,
          locked_at: locked_at
        }
      }
      when not is_nil(deleted_at) or not is_nil(locked_at) ->
        {:error, :forbidden}

      %PersonalAccessToken{} ->
        :ok
    end
  end

  @spec create_personal_access_token(User.t(), map()) ::
          {:ok, PersonalAccessToken.t()} | {:error, Ecto.Changeset.t()} | {:error, :forbidden}
  def create_personal_access_token(%User{id: user_id, deleted_at: nil, locked_at: nil}, attrs) do
    %PersonalAccessToken{}
    |> PersonalAccessToken.changeset(Map.put(attrs, :user_id, user_id))
    |> Repo.insert()
  end

  def create_personal_access_token(%User{}, _attrs),
    do: {:error, :forbidden}

  @spec revoke_personal_access_token(User.t(), bitstring()) ::
          {:ok, PersonalAccessToken.t()} | {:error, :not_found | any()}
  def revoke_personal_access_token(%User{id: user_id}, token_id) do
    PersonalAccessToken
    |> where([pat], pat.jti == ^token_id and pat.user_id == ^user_id)
    |> Repo.one()
    |> case do
      nil -> {:error, :not_found}
      %PersonalAccessToken{} = personal_access_token -> Repo.delete(personal_access_token)
    end
  end
end
