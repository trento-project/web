defmodule TrentoWeb.ActivityLogChannelTest do
  use TrentoWeb.ChannelCase, async: true

  import Trento.Factory
  import Trento.Support.Helpers.AbilitiesTestHelper, only: [clear_default_abilities: 1]

  setup :clear_default_abilities

  describe "joining activity log users channel" do
    test "users can join the activity log channel" do
      %{id: user_id} = insert(:user)

      assert {:ok, _, _socket} =
               TrentoWeb.UserSocket
               |> socket("user_id", %{current_user_id: user_id})
               |> join(
                 TrentoWeb.ActivityLogChannel,
                 "activity_log:" <> Integer.to_string(user_id)
               )
    end

    test "Unauthorized users cannot join the activity log channel" do
      %{id: user_id} = insert(:user)

      non_matching_user_id = user_id + 1

      assert {:error, :unauthorized} =
               TrentoWeb.UserSocket
               |> socket("user_id", %{current_user_id: user_id})
               |> join(
                 TrentoWeb.ActivityLogChannel,
                 "activity_log:" <> Integer.to_string(non_matching_user_id)
               )
    end

    test "Non logged users cannot join an activity log channel" do
      assert {:error, :user_not_logged} =
               TrentoWeb.UserSocket
               |> socket("user_id", %{})
               |> join(TrentoWeb.ActivityLogChannel, "activity_log:8989")
    end
  end

  describe "publishing activity log users" do
    scenarios = [
      %{
        name: "all:all",
        users: ["foo", "bar", "baz", "qux", "quux"],
        current_user: %{
          username: "foo",
          abilities: [
            %{name: "all", resource: "all"},
            %{name: "foo", resource: "bar"}
          ]
        },
        expected_users: ["system", "foo", "bar", "baz", "qux", "quux"]
      },
      %{
        name: "all:users",
        users: ["foo", "bar", "baz", "qux", "quux"],
        current_user: %{
          username: "foo",
          abilities: [
            %{name: "all", resource: "users"},
            %{name: "foo", resource: "bar"}
          ]
        },
        expected_users: ["system", "foo", "bar", "baz", "qux", "quux"]
      },
      %{
        name: "no special permissions",
        users: ["foo", "bar", "baz", "qux", "quux"],
        current_user: %{
          username: "foo",
          abilities: [
            %{name: "foo", resource: "bar"}
          ]
        },
        expected_users: ["system", "foo"]
      },
      %{
        name: "activity_log:users",
        users: ["foo", "bar", "baz", "qux", "quux"],
        current_user: %{
          username: "foo",
          abilities: [
            %{name: "activity_log", resource: "users"}
          ]
        },
        expected_users: ["system", "foo", "bar", "baz", "qux", "quux"]
      }
    ]

    for %{name: name} = scenario <- scenarios do
      @scenario scenario

      test "relevant users are pushed based on permission: #{name}" do
        %{
          users: users,
          current_user: %{
            username: username,
            abilities: abilities
          },
          expected_users: expected_users
        } = @scenario

        current_user_id =
          users
          |> Enum.map(&insert(:user, username: &1))
          |> Enum.find(&(&1.username == username))
          |> Map.get(:id)

        Enum.each(abilities, fn %{name: name, resource: resource} ->
          ability_id =
            :ability
            |> insert(name: name, resource: resource)
            |> Map.get(:id)

          insert(:users_abilities, user_id: current_user_id, ability_id: ability_id)
        end)

        assert {:ok, _, _socket} =
                 TrentoWeb.UserSocket
                 |> socket("user_id", %{current_user_id: current_user_id})
                 |> join(
                   TrentoWeb.ActivityLogChannel,
                   "activity_log:" <> Integer.to_string(current_user_id)
                 )

        assert_push("al_users_pushed", %{users: ^expected_users})
        assert_push("al_users_pushed", %{users: ^expected_users})
        assert_push("al_users_pushed", %{users: ^expected_users})
      end
    end
  end
end
