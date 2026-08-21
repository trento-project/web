# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.AI.LLMBuilder do
  @moduledoc """
  Builds a LangChain chat-model struct for a given User.

  `build/1` is the entry point, routed through `:llm_builder_adapter` so that a
  chat model can be substituted without reaching the provider over the network.
  """

  alias LangChain.ChatModels.{ChatAnthropic, ChatGoogleAI, ChatOpenAI}

  alias Trento.Users
  alias Trento.Users.User

  @behaviour Trento.AI.LLMBuilder

  @callback build_for_user(non_neg_integer()) ::
              {:ok, struct()}
              | {:error, :user_not_found | :no_ai_configuration}

  @spec build(non_neg_integer()) ::
          {:ok, struct()}
          | {:error, :user_not_found | :no_ai_configuration}
  def build(user_id), do: impl().build_for_user(user_id)

  @impl true
  def build_for_user(user_id) do
    case Users.get_user(user_id) do
      {:error, :not_found} ->
        {:error, :user_not_found}

      {:ok, %User{ai_configuration: nil}} ->
        {:error, :no_ai_configuration}

      {:ok, %User{ai_configuration: %{provider: provider, model: model, api_key: api_key}}} ->
        # not checking whether the provider/model pair is valid here
        # because it was validated when saving the user configuration.
        # The question is whether after a user has configured their AI settings,
        # the model/provider pair can be invalidated. Not at the moment
        {:ok, do_build(provider, model, api_key)}
    end
  end

  defp do_build(:google, model, api_key),
    do: ChatGoogleAI.new!(%{model: model, api_key: api_key, stream: true})

  defp do_build(:openai, model, api_key),
    do: ChatOpenAI.new!(%{model: model, api_key: api_key, stream: true})

  defp do_build(:anthropic, model, api_key),
    do:
      ChatAnthropic.new!(%{
        model: model,
        api_key: api_key,
        stream: true,
        thinking: %{type: "enabled"}
      })

  defp impl,
    do:
      :trento
      |> Application.get_env(:ai, [])
      |> Keyword.get(:llm_builder_adapter, __MODULE__)
end
