defmodule Trento.Users.ApiKeys do
  @moduledoc """
  Context for managing user API keys.
  """
  alias Trento.Users.{ApiKey, User}

  alias Trento.Repo

  @spec create_api_key(User.t(), map()) :: {:ok, ApiKey.t()} | {:error, Ecto.Changeset.t()}
  def create_api_key(%User{id: user_id, deleted_at: nil}, attrs) do
    %ApiKey{}
    |> ApiKey.changeset(Map.put(attrs, :user_id, user_id))
    |> Repo.insert()
  end

  def create_api_key(%User{deleted_at: _deletion_date}, _attrs), do: {:error, :forbidden}
end
