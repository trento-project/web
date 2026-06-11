# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Support.CommandedUtils do
  @moduledoc false
  alias Trento.ActivityLog

  @type command :: struct

  @spec dispatch(command | [command], Keyword.t()) :: :ok | {:error, any}
  def dispatch(commands, opts \\ [])

  def dispatch(commands, opts) when is_list(commands) do
    Enum.reduce(commands, :ok, fn command, acc ->
      case {commanded().dispatch(command, opts), acc} do
        {:ok, :ok} ->
          :ok

        {:ok, {:error, errors}} ->
          {:error, errors}

        {{:error, error}, :ok} ->
          {:error, [error]}

        {{:error, error}, {:error, errors}} ->
          {:error, [error | errors]}
      end
    end)
  end

  def dispatch(command, opts), do: commanded().dispatch(command, opts)

  def correlated_dispatch(command, ctx) do
    key = ActivityLog.correlation_key(ctx)

    case ActivityLog.get_correlation_id(key) do
      nil ->
        # in case the correlation_id entry has expired
        # or is absent we do the default dispatch
        commanded().dispatch(command)

      correlation_id ->
        # in case correlation_id exists, we
        # pass it on to the dispatch function
        commanded().dispatch(command,
          correlation_id: correlation_id,
          causation_id: correlation_id
        )
    end
  end

  def correlated_dispatch(command) do
    correlation_id = Process.get(:correlation_id)
    commanded().dispatch(command, correlation_id: correlation_id, causation_id: correlation_id)
  end

  defp commanded, do: Application.fetch_env!(:trento, Trento.Commanded)[:adapter]
end
