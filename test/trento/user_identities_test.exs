defmodule Trento.UserIdentitiesTest do
  use Trento.DataCase

  alias Trento.UserIdentities
  alias Trento.Users
  alias Trento.Users.User

  import Trento.Factory

  describe "create_user/3" do
    test "should create the user and assign the global abilities when the user is the default admin and the username is on the nickname claim" do
      %{username: username} = user = build(:user)
      Application.put_env(:trento, :admin_user, username)

      user_id_params = nil

      user_identity_params = %{
        "provider" => "test_provider",
        "token" => %{"access_token" => "access_token"},
        "uid" => Faker.UUID.v4(),
        "userinfo" => %{
          "email" => user.email,
          "sid" => nil,
          "sub" => user.username,
          "nickname" => user.username
        }
      }

      user_params = %{
        "email" => user.email,
        "sid" => nil,
        "nickname" => user.username
      }

      assert {:ok, %User{id: user_id}} =
               UserIdentities.create_user(user_identity_params, user_params, user_id_params)

      {:ok, %{abilities: abilities}} = Users.get_user(user_id)
      assert [%{id: 1}] = abilities

      Application.put_env(:trento, :admin_user, "admin")
    end

    test "should create the user and assign the global abilities when the user is the default admin and the username is on the username claim" do
      %{username: username} = user = build(:user)
      Application.put_env(:trento, :admin_user, username)

      user_id_params = nil

      user_identity_params = %{
        "provider" => "test_provider",
        "token" => %{"access_token" => "access_token"},
        "uid" => Faker.UUID.v4(),
        "userinfo" => %{
          "email" => user.email,
          "sid" => nil,
          "sub" => user.username,
          "username" => user.username
        }
      }

      user_params = %{
        "email" => user.email,
        "sid" => nil,
        "username" => user.username
      }

      assert {:ok, %User{id: user_id}} =
               UserIdentities.create_user(user_identity_params, user_params, user_id_params)

      {:ok, %{abilities: abilities}} = Users.get_user(user_id)
      assert [%{id: 1}] = abilities

      Application.put_env(:trento, :admin_user, "admin")
    end
  end

  describe "upsert/2" do
    test "should assign the global abilities to a user when the user is the default admin" do
      %{id: user_id, username: username} = user = insert(:user)
      Application.put_env(:trento, :admin_user, username)

      {:ok, _} =
        UserIdentities.upsert(user, %{"uid" => user_id, "provider" => "test_provider"})

      {:ok, %{abilities: abilities}} = Users.get_user(user_id)
      assert [%{id: 1}] = abilities
      Application.put_env(:trento, :admin_user, "admin")
    end

    test "should not assign the global abilities to a user when the user is not the default admin" do
      %{id: user_id} = user = insert(:user)

      {:ok, _} =
        UserIdentities.upsert(user, %{"uid" => user_id, "provider" => "test_provider"})

      {:ok, %{abilities: abilities}} = Users.get_user(user_id)
      assert [] = abilities
    end
  end
end
