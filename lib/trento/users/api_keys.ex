defmodule Trento.Users.ApiKeys do
  @moduledoc """
  Context for managing user API keys.
  """
  alias Trento.Users.{ApiKey, User}

  alias Trento.Repo

  import Ecto.Query

  @spec get_api_keys(User.t()) :: [ApiKey.t()]
  def get_api_keys(%User{deleted_at: nil} = user) do
    user
    |> Repo.preload(:api_keys)
    |> Map.fetch!(:api_keys)
  end

  def get_api_keys(%User{}), do: []

  @spec create_api_key(User.t(), map()) :: {:ok, ApiKey.t()} | {:error, Ecto.Changeset.t()}
  def create_api_key(%User{id: user_id, deleted_at: nil}, attrs) do
    %ApiKey{user_id: user_id}
    |> ApiKey.changeset(attrs)
    |> Repo.insert()
  end

  def create_api_key(%User{deleted_at: _deletion_date}, _attrs), do: {:error, :forbidden}

  @spec revoke_api_key(User.t(), bitstring()) :: {:ok, ApiKey.t()} | {:error, :not_found | any()}
  def revoke_api_key(%User{id: user_id, deleted_at: nil}, name) do
    ApiKey
    |> where([ak], ak.user_id == ^user_id and ak.name == ^name)
    |> Repo.one()
    |> case do
      nil -> {:error, :not_found}
      %ApiKey{} = api_key -> Repo.delete(api_key)
    end
  end

  def revoke_api_key(%User{deleted_at: _deletion_date}, _attrs), do: {:error, :not_found}
end
