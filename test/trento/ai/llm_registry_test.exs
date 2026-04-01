defmodule Trento.AI.LlmRegistryTest do
  use ExUnit.Case, async: true

  alias Trento.AI.LlmRegistry

  setup do
    original_config = Application.get_env(:trento, :ai)

    Application.put_env(:trento, :ai,
      enabled: true,
      providers: [
        provider1: [
          models: [
            "model1",
            "model2"
          ]
        ],
        provider2: [
          models: [
            "model3",
            "model4"
          ]
        ],
        provider3: [
          models: [
            "model5",
            "model6"
          ]
        ]
      ]
    )

    on_exit(fn -> Application.put_env(:trento, :ai, original_config) end)
  end

  describe "providers/0" do
    test "returns the list of configured providers" do
      assert LlmRegistry.providers() == [:provider1, :provider2, :provider3]
    end
  end

  describe "get_provider_models/1" do
    test "returns the list of models for a given provider" do
      assert LlmRegistry.get_provider_models(:provider1) == [
               "model1",
               "model2"
             ]

      assert LlmRegistry.get_provider_models(:provider2) == [
               "model3",
               "model4"
             ]

      assert LlmRegistry.get_provider_models(:provider3) == [
               "model5",
               "model6"
             ]
    end

    test "returns an empty list for an unknown provider" do
      assert LlmRegistry.get_provider_models(:unknown) == []
      assert LlmRegistry.get_provider_models("foo") == []
    end

    test "returns all available models" do
      assert LlmRegistry.get_provider_models(:all) == [
               "model1",
               "model2",
               "model3",
               "model4",
               "model5",
               "model6"
             ]
    end
  end

  describe "get_model_provider/1" do
    test "returns the provider for a given model" do
      assert LlmRegistry.get_model_provider("model6") == :provider3
      assert LlmRegistry.get_model_provider("model1") == :provider1
    end

    test "returns nil for an unknown model" do
      assert LlmRegistry.get_model_provider("unknown-model") == nil
    end
  end

  describe "model_supported?/1" do
    test "returns true for a supported model" do
      assert LlmRegistry.model_supported?("model1") == true
      assert LlmRegistry.model_supported?("model6") == true
    end

    test "returns false for an unsupported model" do
      assert LlmRegistry.model_supported?("unknown-model") == false
    end
  end
end
