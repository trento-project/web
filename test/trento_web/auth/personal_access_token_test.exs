defmodule TrentoWeb.Auth.PersonalAccessTokenTest do
  @moduledoc false

  alias TrentoWeb.Auth.PersonalAccessToken

  use ExUnit.Case, async: true

  describe "personal access token generation" do
    test "generated PAT should have expected prefix" do
      pat = PersonalAccessToken.generate()

      assert String.starts_with?(pat, PersonalAccessToken.aud() <> "_")
    end

    test "generated PAT should be a valid base64 encoded entry" do
      pat = PersonalAccessToken.generate()

      assert {:ok, _} =
               pat
               |> String.replace(PersonalAccessToken.aud() <> "_", "")
               |> Base.url_decode64(padding: false)
    end

    test "should generate unique PATs" do
      one_million = 1_000_000

      assert 1..one_million
             |> Enum.map(fn _ -> PersonalAccessToken.generate() end)
             |> Enum.uniq()
             |> Enum.count() == one_million
    end
  end
end
