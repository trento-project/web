defmodule Trento.AITest do
  use ExUnit.Case

  alias Trento.AI

  import Trento.Factory

  setup do
    original_config = Application.get_env(:trento, :ai)

    on_exit(fn -> Application.put_env(:trento, :ai, original_config) end)
  end

  describe "enabled?/0" do
    test "returns true when AI features are enabled" do
      Application.put_env(:trento, :ai, enabled: true)
      assert AI.enabled?() == true
    end

    test "returns false when AI features are disabled" do
      Application.put_env(:trento, :ai, enabled: false)
      assert AI.enabled?() == false
    end

    test "returns false when AI features are not configured" do
      Application.delete_env(:trento, :ai)
      assert AI.enabled?() == false
    end
  end

  describe "enabling/disabling features" do
    test "features are disabled" do
      Application.put_env(:trento, :ai, enabled: false)
      user = build(:user)

      attrs = %{
        model: "foo",
        api_key: "bar"
      }

      assert AI.create_user_configuration(user, attrs) == {:error, :ai_features_disabled}
      assert AI.update_user_configuration(user, attrs) == {:error, :ai_features_disabled}
    end

    test "features are enabled" do
      Application.put_env(:trento, :ai,
        enabled: true,
        configurations: DummyConfigurations
      )

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
