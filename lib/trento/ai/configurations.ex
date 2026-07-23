# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.AI.Configurations do
  @moduledoc """
  This module is responsible for managing user AI configurations.
  """

  import Ecto.Query

  alias Trento.Users.User

  alias Trento.AI.Configurations.Events
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
    |> tap(fn
      {:ok, _} -> Events.broadcast_created(user_id)
      _ -> :ok
    end)
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
        |> tap(fn
          {:ok, updated} -> maybe_broadcast_update(user_configuration, updated)
          _ -> :ok
        end)
    end
  end

  def update_user_configuration(%User{}, _), do: {:error, :forbidden}

  # Notify every open AI Assistant channel for this user (all browser tabs) so
  # they surface a model-change notice — but only when the provider or model
  # actually changed (api-key-only edits stay silent).
  defp maybe_broadcast_update(%UserConfiguration{} = before, %UserConfiguration{} = later) do
    if before.provider != later.provider or before.model != later.model do
      Events.broadcast_updated(later.user_id, %{
        provider: later.provider,
        model: later.model
      })
    end

    :ok
  end

  @doc """
  Clears a user's AI configuration.

  Only eligible users (not deleted or locked) can clear their AI configuration.
  """
  @spec clear_user_configuration(User.t()) :: :ok | {:error, :forbidden}
  def clear_user_configuration(%User{id: user_id, deleted_at: nil, locked_at: nil})
      when not is_nil(user_id) do
    Repo.delete_all(from u in UserConfiguration, where: u.user_id == ^user_id)

    Events.broadcast_cleared(user_id)

    :ok
  end

  def clear_user_configuration(%User{}), do: {:error, :forbidden}
end
