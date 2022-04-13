defmodule Trento.ApiKeyTest do
  use ExUnit.Case

  alias Trento.Application.Auth.ApiKey

  setup_all do
    %{
      scenarios: [
        %{
          installation_id: "some-installation-id",
          api_key:
            "SFMyNTY.g2gDdAAAAAFkAA9pbnN0YWxsYXRpb25faWRtAAAAFHNvbWUtaW5zdGFsbGF0aW9uLWlkYQBkAAhpbmZpbml0eQ.1BK6v9h8jw3JVavFvYWjp90PZpOGtLcnys6mSgqcLQM"
        },
        %{
          installation_id: "another-installation-id",
          api_key:
            "SFMyNTY.g2gDdAAAAAFkAA9pbnN0YWxsYXRpb25faWRtAAAAF2Fub3RoZXItaW5zdGFsbGF0aW9uLWlkYQBkAAhpbmZpbml0eQ.acX8VYHlDyG3lDBiDKgl02nfw-hHnY4gk3040Lxna4c"
        }
      ]
    }
  end

  describe "Signing data and generating an API key" do
    test "should always generate expected api_key for current installation", %{
      scenarios: scenarios
    } do
      Enum.each(scenarios, fn %{installation_id: installation_id, api_key: expected_api_key} ->
        Enum.each(1..3, fn _ ->
          assert expected_api_key ==
                   ApiKey.sign(%{
                     installation_id: installation_id
                   })
        end)
      end)
    end
  end

  describe "Verifying an API key" do
    test "should reject an unauthenticated API key" do
      assert {:error, :unauthenticated} = ApiKey.verify("definitely-a-fake-api-key")
    end

    test "should verify an authenticated API key", %{scenarios: scenarios} do
      Enum.each(scenarios, fn %{installation_id: installation_id, api_key: api_key} ->
        assert {:ok,
                %{
                  installation_id: ^installation_id
                }} = ApiKey.verify(api_key)
      end)
    end
  end
end
