# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.AI.LLMRegistry do
  @moduledoc """
  This module is responsible for managing the registry of available LLM providers and their models.
  """

  @providers [:openai, :googleai, :anthropic]

  @required_capabilities [
    chat: true,
    reasoning: true,
    tools: true,
    streaming_tool_calls: true
  ]

  @doc """
  Returns the list of configured LLM providers.
  """
  @spec providers :: [atom()]
  def providers, do: @providers

  @doc """
  Returns the list of models for a given provider.
  """
  def get_provider_models(provider) when provider in @providers do
    provider =
      case provider == :googleai do
        true ->
          :google

        _ ->
          provider
      end

    [scope: provider, require: @required_capabilities]
    |> LLMDB.candidates()
    |> Enum.map(fn {_provider, model_id} -> model_id end)
    |> Enum.sort()
  end

  def get_provider_models(_), do: []
end
