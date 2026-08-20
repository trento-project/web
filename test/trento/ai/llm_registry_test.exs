# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.AI.LLMRegistryTest do
  use ExUnit.Case, async: true

  alias Trento.AI.LLMRegistry

  describe "providers/0" do
    test "returns the supported providers" do
      assert length(LLMRegistry.providers()) > 0
    end
  end

  describe "get_provider_models/1" do
    test "returns a non-empty model list for every supported provider" do
      for provider <- LLMRegistry.providers() do
        assert length(LLMRegistry.get_provider_models(provider)) > 0,
               "#{provider} resolved to no models, its catalog id is likely wrong"
      end
    end

    test "returns an empty list for anything that is not a supported provider" do
      assert [] == LLMRegistry.get_provider_models(:unknown)
      assert [] == LLMRegistry.get_provider_models(:googlez)
      assert [] == LLMRegistry.get_provider_models("openai")
      assert [] == LLMRegistry.get_provider_models(nil)
    end
  end
end
