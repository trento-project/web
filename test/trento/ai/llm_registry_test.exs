defmodule Trento.AI.LLMRegistryTest do
  use ExUnit.Case, async: true

  alias Trento.AI.LLMRegistry

  import Mox

  setup :verify_on_exit!

  defp expect_config_loader_to_be_called_times(times) do
    expect(Trento.AI.ApplicationConfigLoader.Mock, :load_config, times, fn ->
      [
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
      ]
    end)
  end

  describe "providers/0" do
    test "returns the list of configured providers" do
      expect_config_loader_to_be_called_times(1)

      assert LLMRegistry.providers() == [:provider1, :provider2, :provider3]
    end
  end

  describe "get_provider_models/1" do
    test "returns the list of models for a given provider" do
      expect_config_loader_to_be_called_times(3)

      assert LLMRegistry.get_provider_models(:provider1) == [
               "model1",
               "model2"
             ]

      assert LLMRegistry.get_provider_models(:provider2) == [
               "model3",
               "model4"
             ]

      assert LLMRegistry.get_provider_models(:provider3) == [
               "model5",
               "model6"
             ]
    end

    test "returns an empty list for an unknown provider" do
      expect_config_loader_to_be_called_times(1)

      assert LLMRegistry.get_provider_models(:unknown) == []
      assert LLMRegistry.get_provider_models("foo") == []
    end

    test "returns all available models" do
      expect_config_loader_to_be_called_times(1)

      assert LLMRegistry.get_provider_models(:all) == [
               "model1",
               "model2",
               "model3",
               "model4",
               "model5",
               "model6"
             ]
    end
  end

  describe "model_supported?/1" do
    test "returns true for a supported model" do
      expect_config_loader_to_be_called_times(2)

      assert LLMRegistry.model_supported?("model1") == true
      assert LLMRegistry.model_supported?("model6") == true
    end

    test "returns false for an unsupported model" do
      expect_config_loader_to_be_called_times(1)

      assert LLMRegistry.model_supported?("unknown-model") == false
    end
  end

  describe "provider_supported?/1" do
    test "returns true for a supported provider" do
      expect_config_loader_to_be_called_times(2)

      assert LLMRegistry.provider_supported?(:provider1) == true
      assert LLMRegistry.provider_supported?(:provider2) == true
    end

    test "returns false for an unsupported provider" do
      expect_config_loader_to_be_called_times(1)

      assert LLMRegistry.provider_supported?(:unknown) == false
      assert LLMRegistry.provider_supported?("foo") == false
    end
  end

  describe "model_supported_by_provider?/2" do
    test "returns true if the model is supported by the provider" do
      expect_config_loader_to_be_called_times(2)

      assert LLMRegistry.model_supported_by_provider?("model1", :provider1) == true
      assert LLMRegistry.model_supported_by_provider?("model4", :provider2) == true
    end

    test "returns false if the model is not supported by the provider" do
      expect_config_loader_to_be_called_times(3)

      assert LLMRegistry.model_supported_by_provider?("model1", :provider2) == false
      assert LLMRegistry.model_supported_by_provider?("model3", :provider1) == false
      assert LLMRegistry.model_supported_by_provider?("foo", :provider1) == false
      assert LLMRegistry.model_supported_by_provider?("bar", "baz") == false
    end
  end
end
