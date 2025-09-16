defmodule Trento.PersonalAccessTokensTest do
  use Trento.DataCase

  alias Trento.PersonalAccessTokens
  alias Trento.PersonalAccessTokens.PersonalAccessToken

  alias Trento.Users.User

  import Trento.Factory

  describe "creating personal access tokens" do
    test "should not allow creating a PAT for a deleted or disabled user" do
      deleted_user = insert(:user, deleted_at: Faker.DateTime.backward(3))
      disabled_user = insert(:user, locked_at: Faker.DateTime.backward(3))

      for user <- [deleted_user, disabled_user] do
        assert {:error, :forbidden} ==
                 PersonalAccessTokens.create_personal_access_token(
                   user,
                   %{
                     name: Faker.Lorem.word()
                   }
                 )
      end
    end

    test "should not allow creating a PAT bound to a user without user id" do
      user = %User{}

      assert {:error,
              %Ecto.Changeset{errors: [user_id: {"can't be blank", [validation: :required]}]}} =
               PersonalAccessTokens.create_personal_access_token(
                 user,
                 %{
                   name: Faker.Lorem.word()
                 }
               )
    end

    test "should not allow creating a PAT bound to a non existent user" do
      user = %User{id: 124}

      assert {:error, %Ecto.Changeset{errors: [user_id: {"User does not exist", _}]}} =
               PersonalAccessTokens.create_personal_access_token(
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
        attrs: %{name: Faker.Lorem.word(), expires_at: "123"},
        expected_errors: [
          expires_at: {"is invalid", [type: :utc_datetime_usec, validation: :cast]}
        ]
      }
    ]

    for %{name: name} = failing_validation_scenario <- failing_validation_scenarios do
      @failing_validation_scenario failing_validation_scenario

      test "should not allow creating a PAT with invalid data - #{name}" do
        %User{id: user_id} = user = insert(:user)

        %{attrs: attrs, expected_errors: expected_errors} = @failing_validation_scenario

        assert {:error, %Ecto.Changeset{errors: ^expected_errors}} =
                 PersonalAccessTokens.create_personal_access_token(user, attrs)

        assert [] ==
                 Trento.Repo.all(from ak in PersonalAccessToken, where: ak.user_id == ^user_id)
      end
    end

    test "should not allow creating a PAT with duplicated name" do
      %User{id: user_id} = user = insert(:user)

      %PersonalAccessToken{name: taken_name} = insert(:personal_access_token, user_id: user_id)

      assert {:error, %Ecto.Changeset{errors: [name: {"has already been taken", _}]}} =
               PersonalAccessTokens.create_personal_access_token(user, %{
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
        attrs: %{name: Faker.Lorem.word(), expires_at: nil}
      },
      %{
        name: "with expiration as string",
        attrs: %{
          name: Faker.Lorem.word(),
          expires_at:
            2
            |> Faker.DateTime.forward()
            |> DateTime.to_iso8601()
        }
      },
      %{
        name: "with expiration as date time",
        attrs: %{name: Faker.Lorem.word(), expires_at: Faker.DateTime.forward(3)}
      }
    ]

    for %{name: name} = scenario <- scenarios do
      @scenario scenario
      test "should allow creating a PAT - #{name}" do
        %User{id: user_id} = user = insert(:user)

        %{attrs: %{name: pat_name} = attrs} = @scenario

        expires_at = Map.get(attrs, :expires_at, nil)

        expected_expiration =
          case expires_at do
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
                %PersonalAccessToken{
                  name: ^pat_name,
                  user_id: ^user_id,
                  expires_at: ^expected_expiration
                }} = PersonalAccessTokens.create_personal_access_token(user, attrs)
      end
    end

    test "should allow creating a personal access token with the same name for different users" do
      %User{id: user_id} = insert(:user)

      %PersonalAccessToken{name: taken_name} = insert(:personal_access_token, user_id: user_id)

      %User{id: other_user_id} = other_user = insert(:user)

      assert {:ok,
              %PersonalAccessToken{
                name: ^taken_name,
                user_id: ^other_user_id
              }} =
               PersonalAccessTokens.create_personal_access_token(other_user, %{name: taken_name})
    end
  end
end
