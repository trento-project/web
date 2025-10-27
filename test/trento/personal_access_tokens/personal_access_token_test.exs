defmodule Trento.PersonalAccessTokens.PersonalAccessTokenTest do
  use ExUnit.Case, async: true

  alias Trento.PersonalAccessTokens.PersonalAccessToken

  alias Faker.Random.Elixir, as: RandomElixir

  import Trento.DataCase, only: [errors_on: 1]

  describe "token hashing" do
    test "hashes the token" do
      plain_token = Faker.Lorem.word()

      hashed_token = PersonalAccessToken.hash_token(plain_token)

      assert hashed_token != plain_token

      assert {:ok, _} = Base.decode64(hashed_token, padding: false)
    end

    test "same token produces the same hash" do
      plain_token = Faker.Lorem.word()

      assert PersonalAccessToken.hash_token(plain_token) ==
               PersonalAccessToken.hash_token(plain_token)
    end

    test "different tokens produce different hashes" do
      plain_token1 = Faker.Pizza.cheese()
      plain_token2 = Faker.Lorem.word()

      assert PersonalAccessToken.hash_token(plain_token1) !=
               PersonalAccessToken.hash_token(plain_token2)
    end
  end

  describe "changeset/2" do
    test "token must be present" do
      attrs = %{
        name: Faker.Lorem.word(),
        expires_at: Faker.DateTime.forward(3),
        user_id: RandomElixir.random_between(1, 100)
      }

      changeset = PersonalAccessToken.changeset(%PersonalAccessToken{}, attrs)

      refute changeset.valid?
      assert %{token: ["can't be blank"]} = errors_on(changeset)
    end

    test "hashed token is set in changeset" do
      plain_token = Faker.Lorem.word()
      hashed_token = PersonalAccessToken.hash_token(plain_token)

      attrs = %{
        token: plain_token,
        name: Faker.Lorem.word(),
        expires_at: Faker.DateTime.forward(3),
        user_id: RandomElixir.random_between(1, 100)
      }

      changeset = PersonalAccessToken.changeset(%PersonalAccessToken{}, attrs)

      assert changeset.valid?
      assert changeset.changes.hashed_token == hashed_token
    end

    test "hashed token is calculated based on token" do
      plain_token = Faker.Lorem.word()
      hashed_token = PersonalAccessToken.hash_token(plain_token)

      attrs = %{
        token: plain_token,
        hashed_token: "someotherhash",
        name: Faker.Lorem.word(),
        expires_at: Faker.DateTime.forward(3),
        user_id: Faker.Random.Elixir.random_between(1, 100)
      }

      changeset = PersonalAccessToken.changeset(%PersonalAccessToken{}, attrs)

      assert changeset.valid?
      assert changeset.changes.hashed_token == hashed_token
    end
  end
end
