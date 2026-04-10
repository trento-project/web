defmodule Trento.AI.LLMRegistry do
  @moduledoc """
  This module is responsible for managing the registry of available LLM providers and their models.
  """

  alias Trento.AI.ApplicationConfigLoader

  @doc """
  Returns the list of configured LLM providers.
  """
  @spec providers :: [atom()]
  def providers, do: Keyword.keys(get_ai_providers_config())

  @doc """
  Returns the list of models for a given provider or all models if `:all` is passed.
  """
  @spec get_provider_models(atom() | :all) :: [bitstring()]
  def get_provider_models(:all),
    do:
      Enum.flat_map(get_ai_providers_config(), fn {_provider, config} ->
        Keyword.get(config, :models, [])
      end)

  def get_provider_models(provider) when is_atom(provider) do
    get_ai_providers_config()
    |> Keyword.get(provider, [])
    |> Keyword.get(:models, [])
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

  defp get_ai_providers_config, do: Keyword.get(ApplicationConfigLoader.load(), :providers, [])
end
