defmodule Trento.AI.Configurations do
  @moduledoc """
  This module is responsible for managing user AI configurations.
  """

  alias Trento.Users.User

  alias Trento.AI.UserConfiguration

  alias Trento.Repo

  @doc """
  Creates a user configuration for AI.

  Only eligible users (not deleted or locked) can have an AI configuration.
  """
  @spec create_user_configuration(User.t(), map()) ::
          {:ok, UserConfiguration.t()} | {:error, Ecto.Changeset.t()} | {:error, :forbidden}
  def create_user_configuration(
        %User{id: user_id, deleted_at: nil, locked_at: nil},
        attrs
      ) do
    %UserConfiguration{}
    |> UserConfiguration.changeset(Map.put(attrs, :user_id, user_id))
    |> Repo.insert()
  end

  def create_user_configuration(%User{}, _), do: {:error, :forbidden}

  @doc """
  Updates a user configuration for AI.

  Only eligible users (not deleted or locked) can update their AI configuration.

  If the user does not have an existing configuration, an error will be returned.
  """
  @spec update_user_configuration(User.t(), map()) ::
          {:ok, UserConfiguration.t()}
          | {:error, Ecto.Changeset.t()}
          | {:error, :forbidden | :not_found}
  def update_user_configuration(
        %User{id: user_id, deleted_at: nil, locked_at: nil},
        attrs
      )
      when not is_nil(user_id) do
    case Repo.get_by(UserConfiguration, user_id: user_id) do
      nil ->
        {:error, :not_found}

      %UserConfiguration{} = user_configuration ->
        user_configuration
        |> UserConfiguration.changeset(attrs)
        |> Repo.update()
    end
  end

  def update_user_configuration(%User{}, _), do: {:error, :forbidden}
end
