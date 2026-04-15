defmodule TrentoWeb.V1.AIConfigurationJSONTest do
  use ExUnit.Case

  import Trento.Factory

  alias TrentoWeb.V1.AIConfigurationJSON

  describe "rendering AI Configuration" do
    test "AI configuration" do
      %{
        provider: provider,
        model: model
      } = ai_user_configuration = build(:ai_user_configuration)

      scenarios = [
        %{
          ai_configuration: ai_user_configuration,
          expected_ai_configuration: %{
            provider: provider,
            model: model
          }
        },
        %{
          ai_configuration: nil,
          expected_ai_configuration: nil
        },
        %{
          ai_configuration: "foo",
          expected_ai_configuration: nil
        }
      ]

      for %{
            ai_configuration: ai_configuration,
            expected_ai_configuration: expected_ai_configuration
          } <- scenarios do
        assert AIConfigurationJSON.ai_configuration(%{ai_configuration: ai_configuration}) ==
                 expected_ai_configuration
      end
    end
  end
end
