defmodule Trento.Users.ApiKeysTest do
  use Trento.DataCase

  alias Trento.Users.{
    ApiKey,
    ApiKeys,
    User
  }

  alias Faker.Random.Elixir, as: FakerRandom

  import Trento.Factory

  describe "creating api keys" do
    test "should not allow creating an api key for a deleted user" do
      user = insert(:user, deleted_at: Faker.DateTime.backward(3))

      assert {:error, :forbidden} ==
               ApiKeys.create_api_key(
                 user,
                 %{
                   name: Faker.Lorem.word()
                 }
               )
    end

    test "should not allow creating an api key bound to a user without user id" do
      user = %User{}

      assert {:error,
              %Ecto.Changeset{errors: [user_id: {"can't be blank", [validation: :required]}]}} =
               ApiKeys.create_api_key(
                 user,
                 %{
                   name: Faker.Lorem.word()
                 }
               )
    end

    test "should not allow creating an api key bound to a non existent user" do
      user = %User{id: 124}

      assert {:error, %Ecto.Changeset{errors: [user_id: {"User does not exist", _}]}} =
               ApiKeys.create_api_key(
                 user,
                 %{
                   name: Faker.Lorem.word()
                 }
               )
    end

    failing_validation_scenarios = [
      %{
        name: "empty attributes",
        attrs: %{},
        expected_errors: [name: {"can't be blank", [validation: :required]}]
      },
      %{
        name: "nil name",
        attrs: %{name: nil},
        expected_errors: [name: {"can't be blank", [validation: :required]}]
      },
      %{
        name: "empty string name",
        attrs: %{name: ""},
        expected_errors: [name: {"can't be blank", [validation: :required]}]
      },
      %{
        name: "blank name",
        attrs: %{name: " "},
        expected_errors: [name: {"can't be blank", [validation: :required]}]
      },
      %{
        name: "invalid name - number",
        attrs: %{name: 42},
        expected_errors: [name: {"is invalid", [type: :string, validation: :cast]}]
      },
      %{
        name: "invalid name - boolean",
        attrs: %{name: true},
        expected_errors: [name: {"is invalid", [type: :string, validation: :cast]}]
      },
      %{
        name: "invalid expiration date: invalid format",
        attrs: %{name: Faker.Lorem.word(), expire_at: "123"},
        expected_errors: [
          expire_at: {"is invalid", [type: :utc_datetime_usec, validation: :cast]}
        ]
      }
    ]

    for %{name: name} = failing_validation_scenario <- failing_validation_scenarios do
      @failing_validation_scenario failing_validation_scenario

      test "should not allow creating an api key with invalid data - #{name}" do
        %User{id: user_id} = user = insert(:user)

        %{attrs: attrs, expected_errors: expected_errors} = @failing_validation_scenario

        assert {:error, %Ecto.Changeset{errors: ^expected_errors}} =
                 ApiKeys.create_api_key(user, attrs)

        assert [] == load_user_api_keys(user_id)
      end
    end

    test "should not allow creating an api key with duplicated name" do
      %User{id: user_id} = user = insert(:user)

      %ApiKey{name: taken_name} = insert(:api_key, user_id: user_id)

      assert {:error, %Ecto.Changeset{errors: [name: {"has already been taken", _}]}} =
               ApiKeys.create_api_key(user, %{
                 name: taken_name
               })
    end

    scenarios = [
      %{
        name: "without expiration - missing field",
        attrs: %{name: Faker.Lorem.word()}
      },
      %{
        name: "without expiration - nil field",
        attrs: %{name: Faker.Lorem.word(), expire_at: nil}
      },
      %{
        name: "with expiration as string",
        attrs: %{
          name: Faker.Lorem.word(),
          expire_at:
            2
            |> Faker.DateTime.forward()
            |> DateTime.to_iso8601()
        }
      },
      %{
        name: "with expiration as date time",
        attrs: %{name: Faker.Lorem.word(), expire_at: Faker.DateTime.forward(3)}
      }
    ]

    for %{name: name} = scenario <- scenarios do
      @scenario scenario
      test "should allow creating an api key - #{name}" do
        %User{id: user_id} = user = insert(:user)

        %{attrs: %{name: api_key_name} = attrs} = @scenario

        expire_at = Map.get(attrs, :expire_at, nil)

        expected_expiration =
          case expire_at do
            nil ->
              nil

            %DateTime{} = dt ->
              dt

            dt when is_bitstring(dt) ->
              dt
              |> DateTime.from_iso8601()
              |> elem(1)
          end

        assert {:ok,
                %ApiKey{
                  name: ^api_key_name,
                  user_id: ^user_id,
                  expire_at: ^expected_expiration
                }} = ApiKeys.create_api_key(user, attrs)
      end
    end

    test "should allow creating an api key with the same name for different users" do
      %User{id: user_id} = insert(:user)

      %ApiKey{name: taken_name} = insert(:api_key, user_id: user_id)

      %User{id: other_user_id} = other_user = insert(:user)

      assert {:ok,
              %ApiKey{
                name: ^taken_name,
                user_id: ^other_user_id
              }} = ApiKeys.create_api_key(other_user, %{name: taken_name})
    end
  end

  describe "retrieving api keys" do
    test "should not return a deleted user's api keys" do
      user = insert(:user, deleted_at: Faker.DateTime.backward(3))

      insert_list(3, :api_key, user: user)

      assert [] == ApiKeys.get_api_keys(user)
    end

    test "should return an empty list of api keys" do
      users = [insert(:user), insert(:user, api_keys: [])]

      for user <- users do
        assert [] == ApiKeys.get_api_keys(user)
      end
    end

    test "should return a user's api keys" do
      %User{id: user_id} = user = insert(:user)

      api_key1 = insert(:api_key, user_id: user_id)
      api_key2 = insert(:api_key, user_id: user_id, expire_at: nil)

      assert [api_key2, api_key1] == ApiKeys.get_api_keys(user)
    end
  end

  describe "revoking api keys" do
    test "should return an error when revoking an api key for a deleted user" do
      %User{id: user_id} = user = insert(:user, deleted_at: Faker.DateTime.backward(3))

      %ApiKey{name: api_key_name} = insert(:api_key, user_id: user_id)

      assert {:error, :not_found} = ApiKeys.revoke_api_key(user, api_key_name)

      assert_api_key_items(user_id, 1)
    end

    test "should return an error when revoking an api key for a non existing user" do
      %User{} = user = build(:user, id: FakerRandom.random_between(3, 100))

      assert {:error, :not_found} = ApiKeys.revoke_api_key(user, Faker.Lorem.word())
    end

    test "should return an error when revoking an non existent api key" do
      %User{id: user_id} = user = insert(:user)

      insert(:api_key, user_id: user_id)

      %ApiKey{name: non_existent_api_key_name} = build(:api_key, user_id: user_id)

      assert {:error, :not_found} = ApiKeys.revoke_api_key(user, non_existent_api_key_name)

      assert_api_key_items(user_id, 1)
    end

    test "should only revoke the relevant user's api key by name" do
      %User{id: user_id1} = user1 = insert(:user)
      %User{id: user_id2} = insert(:user)

      api_key_name = Faker.Lorem.word()

      insert(:api_key, user_id: user_id1)
      insert(:api_key, user_id: user_id1, name: api_key_name)
      insert(:api_key, user_id: user_id2, name: api_key_name)

      assert {:ok, _} = ApiKeys.revoke_api_key(user1, api_key_name)

      assert_api_key_items(user_id1, 1)
      assert_api_key_items(user_id2, 1)
    end

    test "should revoke an existing api key" do
      %User{id: user_id} = user = insert(:user)

      [
        %ApiKey{name: api_key_name1},
        %ApiKey{name: api_key_name2}
      ] = insert_list(2, :api_key, user_id: user_id)

      assert {:ok, _} = ApiKeys.revoke_api_key(user, api_key_name1)

      user_keys = load_user_api_keys(user_id)

      assert 1 == length(user_keys)

      assert [%ApiKey{name: ^api_key_name2}] = user_keys
    end
  end

  defp load_user_api_keys(user_id),
    do: Trento.Repo.all(from ak in ApiKey, where: ak.user_id == ^user_id)

  defp assert_api_key_items(user_id, expected_length) do
    assert expected_length == user_id |> load_user_api_keys |> length
  end
end
