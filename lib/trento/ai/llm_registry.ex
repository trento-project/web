# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.AI.LLMRegistry do
  @moduledoc """
  This module is responsible for managing the registry of available LLM providers and their models.
  """

  alias ReqLLM.ModelHelpers
  @providers [:openai, :googleai, :anthropic]

  @doc """
  Returns the list of configured LLM providers.
  """
  @spec providers :: [atom()]
  def providers, do: @providers

  @doc """
  Returns the list of models for a given provider or all models if `:all` is passed.
  """
  @spec get_provider_models(atom() | :all) :: [bitstring()]
  def get_provider_models(:all),
    do:
      get_provider_models(:googleai) ++
        get_provider_models(:anthropic) ++ get_provider_models(:openai)

  def get_provider_models(provider) when provider in @providers do
    provider =
      case provider == :googleai do
        true ->
          :google

        _ ->
          provider
      end

    models = LLMDB.models(provider)

    models
    |> Enum.filter(fn m ->
      ModelHelpers.streaming_tool_calls?(m) && ModelHelpers.reasoning_enabled?(m) &&
        ModelHelpers.chat?(m)
    end)
    |> Enum.map(& &1.id)
  end

  def get_provider_models(_), do: []

  @doc """
  Checks if a given model is supported by a specific provider.
  """
  @spec model_supported_by_provider?(bitstring(), atom()) :: boolean()
  def model_supported_by_provider?(model, provider) do
    model in get_provider_models(provider)
  end

  @doc """
  Checks if a given model is supported by any provider.
  """
  @spec model_supported?(bitstring()) :: boolean()
  def model_supported?(model), do: model in get_provider_models(:all)

  @doc """
  Checks if a given provider is supported.
  """
  @spec provider_supported?(atom()) :: boolean()
  def provider_supported?(provider) when is_atom(provider), do: provider in providers()

  def provider_supported?(_), do: false
end
