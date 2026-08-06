# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Config do
  @moduledoc """
  Application configuration helper functions
  """

  @doc """
  Parses a string into a `t:Logger.level/0`.
  """
  @spec parse_log_level(term()) :: {:ok, Logger.level()} | {:error, :invalid_level}
  def parse_log_level(level_str) when is_binary(level_str) do
    level_atom = String.to_existing_atom(level_str)

    if level_atom in Logger.levels() do
      {:ok, level_atom}
    else
      {:error, :invalid_level}
    end
  rescue
    ArgumentError -> {:error, :invalid_level}
  end

  def parse_log_level(_), do: {:error, :invalid_level}
end
