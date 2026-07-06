# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.AI.LLMBuilder do
  @moduledoc """
  Builds a LangChain chat-model struct for a given User.
  """

  alias LangChain.ChatModels.{ChatAnthropic, ChatGoogleAI, ChatOpenAI}

  alias Trento.Users
  alias Trento.Users.User

  @spec build_for_user(non_neg_integer()) ::
          {:ok, struct()}
          | {:error, :user_not_found | :no_ai_configuration}
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

  @doc """
  Describes a built chat-model struct as a provider/model pair.

  Inverse of `do_build/3` — lets callers compare or label a model without
  reaching into the LangChain struct internals.
  """
  @spec describe(struct()) :: %{provider: :googleai | :openai | :anthropic, model: String.t()}
  def describe(%ChatGoogleAI{model: model}), do: %{provider: :googleai, model: model}
  def describe(%ChatOpenAI{model: model}), do: %{provider: :openai, model: model}
  def describe(%ChatAnthropic{model: model}), do: %{provider: :anthropic, model: model}

  defp do_build(:googleai, model, api_key),
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
end
