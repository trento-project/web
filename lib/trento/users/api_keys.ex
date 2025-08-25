defmodule Trento.Users.ApiKeys do
  @moduledoc """
  Context for managing user API keys.
  """
  alias Trento.Users.{ApiKey, User}

  alias Trento.Repo

  @spec get_api_keys(User.t()) :: [ApiKey.t()]
  def get_api_keys(%User{deleted_at: nil} = user) do
    user
    |> Repo.preload(:api_keys)
    |> Map.fetch!(:api_keys)
  end

  def get_api_keys(%User{}), do: []

  @spec create_api_key(User.t(), map()) :: {:ok, ApiKey.t()} | {:error, Ecto.Changeset.t()}
  def create_api_key(%User{id: user_id, deleted_at: nil}, attrs) do
    %ApiKey{}
    |> ApiKey.changeset(Map.put(attrs, :user_id, user_id))
    |> Repo.insert()
  end

  def create_api_key(%User{deleted_at: _deletion_date}, _attrs), do: {:error, :forbidden}

  def revoke_api_key(%ApiKey{} = api_key) do
    Repo.delete(api_key)
  rescue
    Ecto.StaleEntryError ->
      {:error, :not_found}
  end
end
