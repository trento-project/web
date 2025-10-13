defmodule Trento.PersonalAccessTokensTest do
  use Trento.DataCase

  alias Trento.PersonalAccessTokens
  alias Trento.PersonalAccessTokens.PersonalAccessToken

  alias Trento.Abilities.Ability
  alias Trento.Users.User

  alias Faker.Random.Elixir, as: FakerRandom

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
                     name: Faker.Lorem.word(),
                     token: Faker.Lorem.word()
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
                   name: Faker.Lorem.word(),
                   token: Faker.Lorem.word()
                 }
               )
    end

    test "should not allow creating a PAT bound to a non existent user" do
      user = %User{id: 124}

      assert {:error, %Ecto.Changeset{errors: [user_id: {"User does not exist", _}]}} =
               PersonalAccessTokens.create_personal_access_token(
                 user,
                 %{
                   name: Faker.Lorem.word(),
                   token: Faker.Lorem.word()
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

        attrs = Map.put(attrs, :token, Faker.Lorem.word())

        assert {:error, %Ecto.Changeset{errors: ^expected_errors}} =
                 PersonalAccessTokens.create_personal_access_token(user, attrs)

        assert [] == load_user_personal_access_tokens(user_id)
      end
    end

    test "should not allow creating a PAT with duplicated name" do
      %User{id: user_id} = user = insert(:user)

      %PersonalAccessToken{name: taken_name} = insert(:personal_access_token, user_id: user_id)

      assert {:error, %Ecto.Changeset{errors: [name: {"has already been taken", _}]}} =
               PersonalAccessTokens.create_personal_access_token(user, %{
                 name: taken_name,
                 token: Faker.Lorem.word()
               })
    end

    test "should not allow recreating the same PAT" do
      %User{id: user_id} = user = insert(:user)

      taken_pat = Faker.Lorem.word()

      %PersonalAccessToken{} = insert(:personal_access_token, user_id: user_id, token: taken_pat)

      assert {:error, %Ecto.Changeset{errors: [hashed_token: {"has already been taken", _}]}} =
               PersonalAccessTokens.create_personal_access_token(user, %{
                 name: "another name",
                 token: taken_pat
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

        attrs = Map.put(attrs, :token, Faker.Lorem.word())

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

      creation_attrs = %{
        name: taken_name,
        token: Faker.Lorem.word()
      }

      assert {:ok,
              %PersonalAccessToken{
                name: ^taken_name,
                user_id: ^other_user_id
              }} = PersonalAccessTokens.create_personal_access_token(other_user, creation_attrs)
    end
  end

  describe "revoking personal access tokens" do
    test "should revoke a deleted user's personal access token" do
      %User{id: user_id} = user = insert(:user, deleted_at: Faker.DateTime.backward(3))

      %PersonalAccessToken{id: pat_id} = insert(:personal_access_token, user_id: user_id)

      assert {:ok, _} = PersonalAccessTokens.revoke_personal_access_token(user, pat_id)

      assert_personal_access_token_items(user_id, 0)
    end

    test "should return an error when revoking a personal access token for a non existing user" do
      %User{} = user = build(:user, id: FakerRandom.random_between(3, 100))

      assert {:error, :not_found} =
               PersonalAccessTokens.revoke_personal_access_token(user, Faker.UUID.v4())
    end

    test "should return an error when revoking an non existent personal access token" do
      %User{id: user_id} = user = insert(:user)

      insert(:personal_access_token, user_id: user_id)

      %PersonalAccessToken{id: non_existent_pat_id} =
        build(:personal_access_token, user_id: user_id)

      assert {:error, :not_found} =
               PersonalAccessTokens.revoke_personal_access_token(user, non_existent_pat_id)

      assert_personal_access_token_items(user_id, 1)
    end

    test "should revoke an existing personal access token" do
      %User{id: user_id} = user = insert(:user)

      [
        %PersonalAccessToken{id: pat_id1},
        %PersonalAccessToken{id: pat_id2}
      ] = insert_list(2, :personal_access_token, user_id: user_id)

      assert {:ok, _} = PersonalAccessTokens.revoke_personal_access_token(user, pat_id1)

      user_keys = load_user_personal_access_tokens(user_id)

      assert 1 == length(user_keys)

      assert [%PersonalAccessToken{id: ^pat_id2}] = user_keys
    end
  end

  describe "validating a Personal Access Token" do
    test "should return false when validating a non existent PAT" do
      non_existent_pat = Faker.Lorem.word()

      assert {:error, :invalid_pat} = PersonalAccessTokens.validate(non_existent_pat)
    end

    test "should return false when validating a PAT for a deleted user" do
      plain_pat = Faker.Lorem.word()

      %User{id: deleted_user_id} = insert(:user, deleted_at: Faker.DateTime.backward(3))

      insert(:personal_access_token, user_id: deleted_user_id, token: plain_pat)

      assert {:error, :invalid_pat} = PersonalAccessTokens.validate(plain_pat)
    end

    test "should return false when validating a PAT for a locked user" do
      plain_pat = Faker.Lorem.word()

      %User{id: locked_user_id} = insert(:user, locked_at: Faker.DateTime.backward(3))

      insert(:personal_access_token, user_id: locked_user_id, token: plain_pat)

      assert {:error, :invalid_pat} = PersonalAccessTokens.validate(plain_pat)
    end

    test "should successfully validate an existing PAT for an active user" do
      plain_pat = Faker.Lorem.word()

      %User{id: user_id} = insert(:user)

      insert(:personal_access_token, user_id: user_id, token: plain_pat)

      assert {:ok, %PersonalAccessToken{}} = PersonalAccessTokens.validate(plain_pat)
    end
  end

  describe "validating and introspecting a Personal Access Token" do
    test "should return an error when validating and introspecting a non existent PAT: invalid jti/user_id combination" do
      non_existent_pat = Faker.Lorem.word()

      assert {:error, :invalid_pat} =
               PersonalAccessTokens.validate_and_introspect(non_existent_pat)
    end

    test "should return an error when validating and introspecting a PAT for a deleted user" do
      %User{id: deleted_user_id} = insert(:user, deleted_at: Faker.DateTime.backward(3))

      pat = Faker.Lorem.word()

      %PersonalAccessToken{} =
        insert(:personal_access_token, user_id: deleted_user_id, token: pat)

      assert {:error, :invalid_pat} =
               PersonalAccessTokens.validate_and_introspect(pat)
    end

    test "should return an error when validating and introspecting a PAT for a locked user" do
      %User{id: locked_user_id} = insert(:user, locked_at: Faker.DateTime.backward(3))

      pat = Faker.Lorem.word()

      %PersonalAccessToken{} =
        insert(:personal_access_token, user_id: locked_user_id, token: pat)

      assert {:error, :invalid_pat} = PersonalAccessTokens.validate_and_introspect(pat)
    end

    test "should successfully validate and introspect an existing PAT for an active user" do
      for factory <- [:user, :user_with_abilities] do
        %User{id: user_id} = insert(factory)

        pat = Faker.Lorem.word()

        %PersonalAccessToken{id: pat_id} =
          insert(:personal_access_token, user_id: user_id, token: pat)

        assert {:ok,
                %PersonalAccessToken{
                  id: ^pat_id,
                  user_id: ^user_id,
                  user: %User{abilities: abilities}
                }} = PersonalAccessTokens.validate_and_introspect(pat)

        if factory == :user do
          assert [] == abilities
        else
          assert Enum.all?(abilities, &match?(%Ability{}, &1))
        end
      end
    end
  end

  defp load_user_personal_access_tokens(user_id),
    do: Trento.Repo.all(from pat in PersonalAccessToken, where: pat.user_id == ^user_id)

  defp assert_personal_access_token_items(user_id, expected_length) do
    assert expected_length == user_id |> load_user_personal_access_tokens |> length
  end
end
