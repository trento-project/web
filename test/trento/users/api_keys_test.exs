defmodule Trento.Users.ApiKeysTest do
  use Trento.DataCase

  alias Trento.Users.{
    ApiKey,
    ApiKeys,
    User
  }

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

        assert [] == Trento.Repo.all(from ak in ApiKey, where: ak.user_id == ^user_id)
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
end
