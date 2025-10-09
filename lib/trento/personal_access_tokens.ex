defmodule Trento.PersonalAccessTokens do
  @moduledoc """
  Context for managing user personal access tokens.
  """
  alias Trento.PersonalAccessTokens.PersonalAccessToken
  alias Trento.Users.User

  alias Trento.Repo

  import Ecto.Query

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
    |> where([pat], pat.id == ^token_id and pat.user_id == ^user_id)
    |> Repo.one()
    |> case do
      nil -> {:error, :not_found}
      %PersonalAccessToken{} = personal_access_token -> Repo.delete(personal_access_token)
    end
  end

  @spec valid?(PersonalAccessToken.t()) :: boolean()
  def valid?(%PersonalAccessToken{} = pat) do
    pat
    |> Repo.preload(:user)
    |> valid_pat?()
  end

  @spec validate_and_introspect(bitstring()) ::
          {:ok, PersonalAccessToken.t()} | {:error, :invalid_token}
  def validate_and_introspect(token) do
    token
    |> load_pat()
    |> Repo.preload(user: [:abilities])
    |> then(
      &case valid_pat?(&1) do
        true -> {:ok, &1}
        false -> {:error, :invalid_token}
      end
    )
  end

  def load_pat(token) do
    Repo.get_by(PersonalAccessToken,
      hashed_token: PersonalAccessToken.hash_token(token)
    )
  end

  # defp load_user_pat(id, user_id),
  #   do: Repo.get_by(PersonalAccessToken, id: id, user_id: user_id)

  defp valid_pat?(nil), do: false

  defp valid_pat?(%PersonalAccessToken{
         user: nil
       }),
       do: false

  defp valid_pat?(%PersonalAccessToken{
         user: %User{
           deleted_at: deleted_at
         }
       })
       when not is_nil(deleted_at),
       do: false

  defp valid_pat?(%PersonalAccessToken{
         user: %User{
           locked_at: locked_at
         }
       })
       when not is_nil(locked_at),
       do: false

  defp valid_pat?(%PersonalAccessToken{
         expires_at: expires_at
       }) do
    expires_at == nil or DateTime.compare(expires_at, DateTime.utc_now()) == :gt
  end
end
