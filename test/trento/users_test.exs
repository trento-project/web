defmodule Trento.UsersTest do
  use Trento.DataCase

  alias Trento.Users
  alias Trento.Users.User
  import Trento.Factory

  describe "users" do
    test "list_users returns all users except the deleted ones" do
      %{id: user_id} = insert(:user)
      insert(:user, deleted_at: DateTime.utc_now())
      users = Users.list_users()
      assert [%User{id: ^user_id}] = users
      assert length(users) == 1
    end

    test "get_user returns a user when the user exist" do
      %{id: user_id} = insert(:user)

      assert {:ok, %User{id: ^user_id}} = Users.get_user(user_id)
    end

    test "get_user returns an error when a user does not exist" do
      %{id: user_id} = insert(:user, deleted_at: DateTime.utc_now())

      assert {:error, :not_found} = Users.get_user(user_id)
    end

    test "create_user with valid data creates a user" do
      assert {:ok, %User{} = user} =
               Users.create_user(%{
                 username: "username",
                 password: "some password",
                 email: "test@trento.com",
                 fullname: "some fullname",
                 confirm_password: "some password"
               })

      assert user.password == nil
      assert user.fullname == "some fullname"
      assert user.email == "test@trento.com"
      assert user.username == "username"
    end

    test "create_user should return an error if the email has already been taken" do
      user_already_existing = insert(:user)

      assert {:error, changeset} =
               Users.create_user(%{
                 username: "username",
                 password: "some password",
                 email: user_already_existing.email,
                 fullname: "some fullname",
                 confirm_password: "some password"
               })

      assert changeset.errors[:email] ==
               {"has already been taken",
                [{:constraint, :unique}, {:constraint_name, "users_email_index"}]}
    end

    test "create_user with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} =
               Users.create_user(%{
                 username: "username",
                 email: "test@trento.com",
                 fullname: "some fullname"
               })
    end

    test "update_user/2 with valid data updates the user" do
      user = insert(:user)
      {:ok, user} = Users.get_user(user.id)

      assert {:ok, %User{} = user} =
               Users.update_user(user, %{
                 fullname: "some updated fullname",
                 email: "newemail@test.com"
               })

      assert user.fullname == "some updated fullname"
      assert user.email == "newemail@test.com"
    end

    test "update_user/2 will not update user username" do
      user = insert(:user)
      {:ok, fetched_user} = Users.get_user(user.id)

      assert {:ok, %User{} = user} =
               Users.update_user(fetched_user, %{
                 fullname: "some updated fullname",
                 email: "newemail@test.com",
                 username: "newusername"
               })

      assert user.fullname == "some updated fullname"
      assert user.email == "newemail@test.com"
      assert user.username == fetched_user.username
    end

    test "update_user/2 with invalid data does not update the user" do
      user = insert(:user)
      {:ok, user} = Users.get_user(user.id)

      assert {:error, changeset} =
               Users.update_user(user, %{
                 email: "invalid",
                 password: "novalid",
                 password_confirmation: "novalid"
               })

      assert changeset.errors[:email] == {"is not a valid email", [validation: :email]}

      assert changeset.errors[:password] ==
               {"should be at least %{count} character(s)",
                [count: 8, validation: :length, kind: :min, type: :string]}
    end

    test "update_user/2 returns error if the email has already been taken" do
      user = insert(:user)
      user2 = insert(:user)
      {:ok, user} = Users.get_user(user.id)

      assert {:error, changeset} =
               Users.update_user(user, %{
                 email: user2.email
               })

      assert changeset.errors[:email] ==
               {"has already been taken",
                [{:constraint, :unique}, {:constraint_name, "users_email_index"}]}
    end

    test "update_user/2 does not update deleted_at" do
      user = insert(:user)
      {:ok, user} = Users.get_user(user.id)
      assert {:ok, %User{} = user} = Users.update_user(user, %{deleted_at: DateTime.utc_now()})
      assert user.deleted_at == nil
    end

    test "update_user/2 lock the user if enable false is passed as attribute and the user is not locked" do
      user = insert(:user)
      {:ok, user} = Users.get_user(user.id)
      assert {:ok, %User{} = user} = Users.update_user(user, %{enabled: false})
      refute user.locked_at == nil
    end

    test "update_user/2 does no lock the user if enable true is passed as attribute and the user is not locked" do
      user = insert(:user)
      {:ok, user} = Users.get_user(user.id)
      assert {:ok, %User{} = user} = Users.update_user(user, %{enabled: true})
      assert user.locked_at == nil
    end

    test "update_user/2 does not relock the user if enable false is passed as attribute and the user is already locked" do
      user = insert(:user)
      {:ok, user} = Users.get_user(user.id)

      assert {:ok, %User{locked_at: locked_at} = user} =
               Users.update_user(user, %{enabled: false})

      assert {:ok, %User{} = updated_user} = Users.update_user(user, %{enabled: false})
      assert updated_user.locked_at == locked_at
    end

    test "update_user/2 does unlock the user if enable true is passed as attribute and the user is locked" do
      user = insert(:user)
      {:ok, user} = Users.get_user(user.id)
      assert {:ok, %User{} = user} = Users.update_user(user, %{enabled: false})

      assert {:ok, %User{} = updated_user} = Users.update_user(user, %{enabled: true})
      assert updated_user.locked_at == nil
    end

    test "update_user/2 does not update user with id 1" do
      assert {:error, :operation_not_permitted} =
               Users.update_user(%User{id: 1}, %{fullname: "new fullname"})
    end

    test "delete_user/2 does not delete user with id 1" do
      assert {:error, :operation_not_permitted} = Users.delete_user(%User{id: 1})
    end

    test "delete_user/1 deletes the user" do
      %{id: user_id, username: original_username} = user = insert(:user)
      assert {:ok, %User{}} = Users.delete_user(user)
      assert {:error, :not_found} == Users.get_user(user.id)

      %User{deleted_at: deleted_at, username: username} = Trento.Repo.get_by!(User, id: user_id)

      refute deleted_at == nil
      refute username == original_username
    end
  end
end
