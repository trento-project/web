# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.AI.LLMRegistryTest do
  use ExUnit.Case, async: true

  alias Trento.AI.LLMRegistry

  # Capabilities the agent needs from every selectable model.
  @required_capabilities [
    {[:chat], true},
    {[:reasoning, :enabled], true},
    {[:streaming, :tool_calls], true}
  ]

  describe "providers/0" do
    test "returns the supported providers" do
      assert [:openai, :googleai, :anthropic] == LLMRegistry.providers()
    end
  end

  describe "get_provider_models/1" do
    test "returns a non-empty model list for every supported provider" do
      for provider <- LLMRegistry.providers() do
        assert [_ | _] = LLMRegistry.get_provider_models(provider),
               "#{provider} resolved to no models, its catalog id is likely wrong"
      end
    end

    test "returns only models the agent can drive" do
      for provider <- LLMRegistry.providers(),
          model <- LLMRegistry.get_provider_models(provider),
          {path, expected} <- @required_capabilities do
        actual_provider = Map.get(%{googleai: :google}, provider, provider)
        capabilities = LLMDB.capabilities({actual_provider, model})

        assert get_in(capabilities, path) == expected,
               "#{provider}/#{model} is selectable but fails #{inspect(path)}"
      end
    end

    test "rejects models that miss a required capability" do
      selectable = MapSet.new(LLMRegistry.get_provider_models(:anthropic))

      rejected =
        :anthropic
        |> LLMDB.models()
        |> Enum.reject(fn model ->
          Enum.all?(@required_capabilities, fn {path, expected} ->
            get_in(model.capabilities, path) == expected
          end)
        end)

      assert rejected != [], "catalog has no unusable anthropic model left to assert on"

      for model <- rejected do
        refute MapSet.member?(selectable, model.id),
               "#{model.id} lacks a required capability but is selectable"
      end
    end

    test "returns every supported provider's models when :all is passed" do
      expected =
        LLMRegistry.providers()
        |> Enum.flat_map(&LLMRegistry.get_provider_models/1)
        |> MapSet.new()

      assert expected == MapSet.new(LLMRegistry.get_provider_models(:all))
    end

    test "returns an empty list for anything that is not a supported provider" do
      assert [] == LLMRegistry.get_provider_models(:unknown)
      assert [] == LLMRegistry.get_provider_models(:googlez)
      assert [] == LLMRegistry.get_provider_models("openai")
      assert [] == LLMRegistry.get_provider_models(nil)
    end
  end

  describe "provider_supported?/1" do
    test "returns true for every supported provider" do
      for provider <- LLMRegistry.providers() do
        assert LLMRegistry.provider_supported?(provider)
      end
    end

    test "returns false for anything else" do
      refute LLMRegistry.provider_supported?(:unknown)
      refute LLMRegistry.provider_supported?(:googlez)
      refute LLMRegistry.provider_supported?("openai")
      refute LLMRegistry.provider_supported?(nil)
    end
  end

  describe "model_supported?/1" do
    test "returns true for a model offered by any provider" do
      for provider <- LLMRegistry.providers() do
        [model | _] = LLMRegistry.get_provider_models(provider)

        assert LLMRegistry.model_supported?(model)
      end
    end

    test "returns false for a model no provider offers" do
      refute LLMRegistry.model_supported?("unknown-model")
      refute LLMRegistry.model_supported?("")
    end
  end

  describe "model_supported_by_provider?/2" do
    test "returns true when the provider offers the model" do
      for provider <- LLMRegistry.providers() do
        [model | _] = LLMRegistry.get_provider_models(provider)

        assert LLMRegistry.model_supported_by_provider?(model, provider)
      end
    end

    test "returns false when another provider offers the model" do
      [anthropic_model | _] = LLMRegistry.get_provider_models(:anthropic)

      refute LLMRegistry.model_supported_by_provider?(anthropic_model, :openai)
      refute LLMRegistry.model_supported_by_provider?(anthropic_model, :googleai)
    end

    test "returns false for an unsupported provider or model" do
      [model | _] = LLMRegistry.get_provider_models(:openai)

      refute LLMRegistry.model_supported_by_provider?(model, :unknown)
      refute LLMRegistry.model_supported_by_provider?(model, "openai")
      refute LLMRegistry.model_supported_by_provider?("unknown-model", :openai)
      refute LLMRegistry.model_supported_by_provider?("bar", "baz")
    end
  end
end
