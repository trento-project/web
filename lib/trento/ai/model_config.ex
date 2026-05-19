# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.AI.ModelConfig do
  @moduledoc """
  Builds a LangChain chat-model struct for a given provider/model/api_key.
  """

  alias Trento.Users
  alias Trento.Users.User
  alias LangChain.ChatModels.{ChatAnthropic, ChatGoogleAI, ChatOpenAI}

  alias Trento.AI.LLMRegistry

  @spec build_user_model_config(String.t()) ::
          {:ok, struct()}
          | {:error, :user_not_found | :no_ai_configuration | :unsupported_provider}
  def build_user_model_config(user_id) do
    case Users.get_user(user_id) do
      {:error, :not_found} ->
        {:error, :user_not_found}

      {:ok, %User{ai_configuration: nil}} ->
        {:error, :no_ai_configuration}

      {:ok, %User{ai_configuration: %{provider: provider, model: model, api_key: api_key}}} ->
        build(provider, model, api_key)
    end
  end

  @spec build(atom(), String.t(), String.t()) ::
          {:ok, struct()} | {:error, :unsupported_provider}
  def build(provider, model, api_key) do
    if LLMRegistry.provider_supported?(provider) do
      {:ok, do_build(provider, model, api_key)}
    else
      {:error, :unsupported_provider}
    end
  end

  defp do_build(:googleai, model, api_key) do
    ChatGoogleAI.new!(%{model: model, api_key: api_key, stream: true})
  end

  defp do_build(:openai, model, api_key) do
    ChatOpenAI.new!(%{model: model, api_key: api_key, stream: true})
  end

  defp do_build(:anthropic, model, api_key) do
    ChatAnthropic.new!(%{
      model: model,
      api_key: api_key,
      stream: true,
      thinking: %{type: "enabled"}
    })
  end
end
