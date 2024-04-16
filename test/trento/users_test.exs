defmodule Trento.UsersTest do
  use Trento.DataCase

  alias Trento.Users
  alias Trento.Users.User

  describe "users" do
    test "list_users returns all users except the deleted ones" do
      %{id: user_id} = create_user()
      create_deleted_user()
      users = Users.list_users()
      assert [%User{id: ^user_id}] = users
      assert length(users) == 1
    end

    test "get_user returns a user when the user exist" do
      %{id: user_id} = create_user()

      assert {:ok, %User{id: ^user_id}} = Users.get_user(user_id)
    end

    test "get_user returns an error when a user does not exist" do
      %{id: user_id} = create_deleted_user()

      assert {:error, :not_found} = Users.get_user(user_id)
    end

    test "create_user with valid data creates a user" do
      assert {:ok, %User{} = user} = Users.create_user(%{
        username: "username",
        password: "some password",
        email: "test@trento.com",
        fullname: "some fullname",
        confirm_password: "some password",
      })
      assert user.password == nil
      assert user.fullname == "some fullname"
      assert user.email == "test@trento.com"
      assert user.username == "username"
    end

    test "create_user with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} =  Users.create_user(%{
        username: "username",
        email: "test@trento.com",
        fullname: "some fullname",
      })
    end

    test "update_user/2 with valid data updates the user" do
      user = create_user()
      {:ok, user} = Users.get_user(user.id)
      assert {:ok, %User{} = user} = Users.update_user(user, %{fullname: "some updated fullname", email: "newemail@test.com"})
      assert user.fullname == "some updated fullname"
      assert user.email == "newemail@test.com"
    end

    test "update_user/2 with invalid data does not update the user" do
      user = create_user()
      {:ok, user} = Users.get_user(user.id)
      assert {:error, changeset} = Users.update_user(user, %{email: "invalid", password: "novalid", password_confirmation: "novalid"})
      assert changeset.errors[:email] == {"is not a valid email", [validation: :email]}
      assert changeset.errors[:password] == {"should be at least %{count} character(s)", [count: 8, validation: :length, kind: :min, type: :string]}
    end

    test "update_user/2 does not update deleted_at" do
      user = create_user()
      {:ok, user} = Users.get_user(user.id)
      assert {:ok, %User{} = user} = Users.update_user(user, %{deleted_at: DateTime.utc_now()})
      assert user.deleted_at == nil
    end

    test "delete_user/1 deletes the user" do
      user = create_user()
      assert {:ok, %User{}} = Users.delete_user(user)
      assert {:error, :not_found} == Users.get_user(user.id)
    end
  end

  # We can't use factory since we have to deal with pow logic
  defp create_user do
    password = "themightypassword8897"
    {:ok, user} = Users.create_user(%{
      email: Faker.Internet.email(),
      fullname: Faker.Pokemon.name(),
      password: password,
      password_confirmation: password,
      username: Faker.Pokemon.name(),
    })
    user
  end

  defp create_deleted_user do
    user = create_user()
    {:ok, user} = Trento.Users.delete_user(user)
    user
  end
end
