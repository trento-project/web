defmodule Trento.AITest do
  use ExUnit.Case

  alias Trento.AI

  import Trento.Factory

  import Mox

  setup :verify_on_exit!

  describe "enabled?/0" do
    test "returns true when AI features are enabled" do
      expect(Trento.AI.ApplicationConfigLoader.Mock, :load_config, fn -> [enabled: true] end)

      assert AI.enabled?() == true
    end

    test "returns false when AI features are disabled" do
      expect(Trento.AI.ApplicationConfigLoader.Mock, :load_config, fn -> [enabled: false] end)
      assert AI.enabled?() == false
    end

    test "returns false when AI features are not configured" do
      expect(Trento.AI.ApplicationConfigLoader.Mock, :load_config, fn -> [] end)
      assert AI.enabled?() == false
    end
  end

  describe "enabling/disabling features" do
    test "features are disabled" do
      expect(Trento.AI.ApplicationConfigLoader.Mock, :load_config, 2, fn -> [enabled: false] end)
      user = build(:user)

      attrs = %{
        model: "foo",
        api_key: "bar"
      }

      assert AI.create_user_configuration(user, attrs) == {:error, :ai_features_disabled}
      assert AI.update_user_configuration(user, attrs) == {:error, :ai_features_disabled}
    end

    test "features are enabled" do
      expect(Trento.AI.ApplicationConfigLoader.Mock, :load_config, 4, fn ->
        [
          enabled: true,
          configurations: DummyConfigurations
        ]
      end)

      user = build(:user)

      attrs = %{
        model: "foo",
        api_key: "bar"
      }

      assert AI.create_user_configuration(user, attrs) == {:ok, :created}
      assert AI.update_user_configuration(user, attrs) == {:ok, :updated}
    end
  end
end

defmodule DummyConfigurations do
  def create_user_configuration(_user, _attrs) do
    {:ok, :created}
  end

  def update_user_configuration(_user, _attrs) do
    {:ok, :updated}
  end
end
