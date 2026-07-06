# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.AI.LLMBuilderTest do
  use Trento.DataCase, async: true
  use Trento.AI.AICase

  alias LangChain.ChatModels.{ChatAnthropic, ChatGoogleAI, ChatOpenAI}
  alias Trento.AI.LLMBuilder

  import Trento.Factory

  describe "build_for_user/1" do
    test "returns {:error, :user_not_found} when user does not exist" do
      assert {:error, :user_not_found} = LLMBuilder.build_for_user(999_999_999)
    end

    test "returns {:error, :no_ai_configuration} when the user has no AI configuration" do
      %{id: user_id} = insert(:user)

      assert {:error, :no_ai_configuration} = LLMBuilder.build_for_user(user_id)
    end

    test "builds a streaming ChatGoogleAI for the :googleai provider" do
      %{id: user_id} = insert(:user)

      %{api_key: api_key} =
        insert(:ai_user_configuration,
          user_id: user_id,
          provider: :googleai,
          model: "gemini-2.5-flash"
        )

      assert {:ok, %ChatGoogleAI{} = chat_model} = LLMBuilder.build_for_user(user_id)
      assert chat_model.model == "gemini-2.5-flash"
      assert chat_model.api_key == api_key
      assert chat_model.stream == true
    end

    test "builds a streaming ChatOpenAI for the :openai provider" do
      %{id: user_id} = insert(:user)

      %{api_key: api_key} =
        insert(:ai_user_configuration,
          user_id: user_id,
          provider: :openai,
          model: "gpt-4.1"
        )

      assert {:ok, %ChatOpenAI{} = chat_model} = LLMBuilder.build_for_user(user_id)
      assert chat_model.model == "gpt-4.1"
      assert chat_model.api_key == api_key
      assert chat_model.stream == true
    end

    test "builds a streaming ChatAnthropic with thinking enabled for the :anthropic provider" do
      %{id: user_id} = insert(:user)

      %{api_key: api_key} =
        insert(:ai_user_configuration,
          user_id: user_id,
          provider: :anthropic,
          model: "claude-haiku-4-5"
        )

      assert {:ok, %ChatAnthropic{} = chat_model} = LLMBuilder.build_for_user(user_id)
      assert chat_model.model == "claude-haiku-4-5"
      assert chat_model.api_key == api_key
      assert chat_model.stream == true
      assert chat_model.thinking == %{type: "enabled"}
    end
  end

  describe "describe/1" do
    test "describes a ChatGoogleAI struct" do
      chat_model = ChatGoogleAI.new!(%{model: "gemini-2.5-pro", api_key: "k", stream: true})

      assert %{provider: :googleai, model: "gemini-2.5-pro"} = LLMBuilder.describe(chat_model)
    end

    test "describes a ChatOpenAI struct" do
      chat_model = ChatOpenAI.new!(%{model: "gpt-4.1", api_key: "k", stream: true})

      assert %{provider: :openai, model: "gpt-4.1"} = LLMBuilder.describe(chat_model)
    end

    test "describes a ChatAnthropic struct" do
      chat_model = ChatAnthropic.new!(%{model: "claude-haiku-4-5", api_key: "k", stream: true})

      assert %{provider: :anthropic, model: "claude-haiku-4-5"} = LLMBuilder.describe(chat_model)
    end
  end
end
