defmodule Trento.UsersTest do
  use Trento.DataCase

  alias Trento.Abilities.{
    Ability,
    UsersAbilities
  }

  alias Trento.Users
  alias Trento.Users.User
  import Trento.Factory

  describe "user profile" do
    test "update_user_profile does not update the profile when fields are not present" do
      %{id: user_id, username: username, password_hash: password_hash} = insert(:user)
      {:ok, user} = Users.get_user(user_id)

      assert {:ok,
              %User{
                locked_at: locked_at,
                password_hash: updated_password_hash,
                fullname: updated_fullname,
                email: updated_email
              } = user} =
               Users.update_user_profile(user, %{})

      assert user.fullname == updated_fullname
      assert user.email == updated_email
      assert user.username == username
      assert nil == locked_at
      assert password_hash == updated_password_hash
    end

    test "update_user_profile does not require current password when the password field is not involved in the update" do
      %{id: user_id} =
        insert(:user)

      {:ok, user} = Users.get_user(user_id)

      assert {:ok, %User{} = user} =
               Users.update_user_profile(user, %{
                 fullname: "some updated fullname",
                 email: "newemail@test.com"
               })

      assert user.fullname == "some updated fullname"
      assert user.email == "newemail@test.com"
    end

    test "update_user_profile update only the user profile fields" do
      %{id: user_id, username: username, password_hash: password_hash, password: current_password} =
        insert(:user)

      {:ok, user} = Users.get_user(user_id)

      assert {:ok, %User{locked_at: locked_at, password_hash: updated_password_hash} = user} =
               Users.update_user_profile(user, %{
                 fullname: "some updated fullname",
                 email: "newemail@test.com",
                 username: "new_username",
                 enabled: false,
                 current_password: current_password,
                 password: "newpassword989",
                 confirm_password: "newpassword989"
               })

      assert user.fullname == "some updated fullname"
      assert user.email == "newemail@test.com"
      assert user.username == username
      assert nil == locked_at
      assert password_hash != updated_password_hash
    end

    test "update_user_profile removes password change request if password is changed" do
      %{id: user_id, password: current_password} =
        insert(:user, password_change_requested_at: DateTime.utc_now())

      {:ok, user} = Users.get_user(user_id)

      assert {:ok, %User{} = user} =
               Users.update_user_profile(user, %{
                 fullname: "some updated fullname"
               })

      refute user.password_change_requested_at == nil

      assert {:ok, %User{} = user} =
               Users.update_user_profile(user, %{
                 current_password: current_password,
                 password: "newpassword989",
                 confirm_password: "newpassword989"
               })

      assert user.password_change_requested_at == nil
    end
  end

  describe "users" do
    test "list_users returns all users except the deleted ones" do
      %{id: user_id} = insert(:user)
      %{id: ability_id} = insert(:ability)
      insert(:users_abilities, user_id: user_id, ability_id: ability_id)

      insert(:user, deleted_at: DateTime.utc_now())
      users = Users.list_users()
      assert [%User{id: ^user_id, abilities: [%{id: ^ability_id}]}] = users
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

    test "get_user return a user with the abilities" do
      %{id: user_id} = insert(:user)
      %{id: ability_id} = insert(:ability)
      insert(:users_abilities, user_id: user_id, ability_id: ability_id)

      assert {:ok, %User{id: ^user_id, abilities: [%{id: ^ability_id}]}} = Users.get_user(user_id)
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
      assert user.locked_at == nil
      assert user.abilities == []
      refute user.password_change_requested_at == nil

      assert [] == Trento.Repo.all(from u in UsersAbilities, where: u.user_id == ^user.id)
    end

    test "create_user creates a disabled user" do
      %{username: username, email: email, fullname: fullname} = build(:user)

      assert {:ok, %User{} = user} =
               Users.create_user(%{
                 username: username,
                 password: "some password",
                 email: email,
                 fullname: fullname,
                 confirm_password: "some password",
                 enabled: false
               })

      refute user.locked_at == nil
    end

    test "create_user with abilities attaches the abilities to the user" do
      [%Ability{id: ability_id1}, %Ability{id: ability_id2}] =
        abilities = insert_list(2, :ability)

      assert {:ok, %User{} = user} =
               Users.create_user(%{
                 username: "username",
                 password: "some password",
                 email: "test@trento.com",
                 fullname: "some fullname",
                 confirm_password: "some password",
                 abilities: abilities
               })

      assert user.username == "username"
      assert user.abilities == abilities
      refute user.password_change_requested_at == nil

      assert [
               %UsersAbilities{ability_id: ^ability_id1},
               %UsersAbilities{ability_id: ^ability_id2}
             ] =
               Trento.Repo.all(from u in UsersAbilities, where: u.user_id == ^user.id)
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

    test "update_user/2 deletes the user abilities" do
      [%Ability{id: ability_id1}, %Ability{id: ability_id2}] = insert_list(2, :ability)
      user = insert(:user)
      insert(:users_abilities, user_id: user.id, ability_id: ability_id1)
      insert(:users_abilities, user_id: user.id, ability_id: ability_id2)

      {:ok, user} = Users.get_user(user.id)

      assert {:ok, %User{} = user} =
               Users.update_user(user, %{
                 fullname: "some updated fullname",
                 email: "newemail@test.com",
                 abilities: []
               })

      assert user.abilities == []
      assert [] == Trento.Repo.all(from u in UsersAbilities, where: u.user_id == ^user.id)
    end

    test "update_user/2 updates the user abilities" do
      [%Ability{id: ability_id1}, %Ability{id: ability_id2}] = insert_list(2, :ability)
      user = insert(:user)
      insert(:users_abilities, user_id: user.id, ability_id: ability_id1)

      new_abilities = build_list(1, :ability, id: ability_id2)

      {:ok, user} = Users.get_user(user.id)

      assert {:ok, %User{} = user} =
               Users.update_user(user, %{
                 fullname: "some updated fullname",
                 email: "newemail@test.com",
                 abilities: new_abilities
               })

      assert user.abilities == new_abilities

      assert [%UsersAbilities{ability_id: ^ability_id2}] =
               Trento.Repo.all(from u in UsersAbilities, where: u.user_id == ^user.id)
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
      assert {:error, :forbidden} =
               Users.update_user(%User{id: 1}, %{fullname: "new fullname"})
    end

    test "update_user/2 returns stale error when the lock version in the update is not valid" do
      user = insert(:user)
      {:ok, user} = Users.get_user(user.id)

      assert {:ok, updated_user} =
               Users.update_user(user, %{
                 fullname: "some updated fullname"
               })

      assert {:error, :stale_entry} =
               Users.update_user(updated_user, %{
                 fullname: "some updated fullname 2",
                 lock_version: 1
               })
    end

    test "update_user/2 requests password change if password is changed" do
      %{id: user_id} = insert(:user)
      {:ok, user} = Users.get_user(user_id)

      assert {:ok, %User{} = user} =
               Users.update_user(user, %{
                 fullname: "some updated fullname"
               })

      assert user.password_change_requested_at == nil

      assert {:ok, %User{} = user} =
               Users.update_user(user, %{
                 password: "newpassword989",
                 confirm_password: "newpassword989"
               })

      refute user.password_change_requested_at == nil
    end

    test "update_user/2 allows TOTP to be disabled but not enabled again" do
      user = insert(:user, totp_enabled_at: DateTime.utc_now())
      {:ok, user} = Users.get_user(user.id)

      assert {:ok, %User{} = user} = Users.update_user(user, %{totp_disabled: true})
      assert user.totp_enabled_at == nil
      assert {:ok, %User{} = user} = Users.update_user(user, %{totp_disabled: false})
      assert user.totp_enabled_at == nil
    end

    test "delete_user/2 does not delete user with id 1" do
      assert {:error, :forbidden} = Users.delete_user(%User{id: 1})
    end

    test "delete_user/1 deletes the user" do
      %{id: user_id, username: original_username, email: original_email} = user = insert(:user)

      assert {:ok, %User{}} = Users.delete_user(user)
      assert {:error, :not_found} == Users.get_user(user.id)

      %User{deleted_at: deleted_at, username: username, email: email} =
        Trento.Repo.get_by!(User, id: user_id)

      refute deleted_at == nil
      refute username == original_username
      refute email == original_email
      assert username == "#{original_username}__#{deleted_at}"
      assert email == "#{original_email}__#{deleted_at}"
    end

    test "delete_user/1 deletes user abilities" do
      [%Ability{id: ability_id1}, %Ability{id: ability_id2}] = insert_list(2, :ability)
      %{id: user_id} = user = insert(:user)
      insert(:users_abilities, user_id: user_id, ability_id: ability_id1)
      insert(:users_abilities, user_id: user_id, ability_id: ability_id2)

      assert {:ok, %User{}} = Users.delete_user(user)

      %User{deleted_at: deleted_at} =
        Trento.Repo.get_by!(User, id: user_id)

      refute deleted_at == nil
      assert [] == Trento.Repo.all(from u in UsersAbilities, where: u.user_id == ^user_id)
    end

    test "reset_totp/1 reset user topt values" do
      user =
        insert(:user, %{
          totp_enabled_at: DateTime.utc_now(),
          totp_secret: Faker.Internet.domain_name(),
          totp_last_used_at: DateTime.utc_now()
        })

      assert {:ok,
              %User{
                totp_enabled_at: nil,
                totp_secret: nil,
                totp_last_used_at: nil
              }} = Users.reset_totp(user)
    end

    test "initiate_totp_enrollment/1 returns error if the totp is already configured for the user" do
      user =
        insert(:user, %{
          totp_enabled_at: DateTime.utc_now(),
          totp_secret: Faker.Internet.domain_name(),
          totp_last_used_at: DateTime.utc_now()
        })

      assert {:error, :totp_already_enabled} == Users.initiate_totp_enrollment(user)
    end

    test "initiate_totp_enrollment/1 could not initiate enrollment for the default admin" do
      assert {:error, :forbidden} == Users.initiate_totp_enrollment(%User{id: 1})
    end

    test "initiate_totp_enrollment/1 returns a totp secret for enrollment" do
      user =
        insert(:user)

      {:ok, %{secret: secret, secret_qr_encoded: secret_qr_encoded}} =
        Users.initiate_totp_enrollment(user)

      assert {:ok, %User{totp_secret: totp_secret, totp_enabled_at: nil, totp_last_used_at: nil}} =
               Users.get_user(user.id)

      assert secret == totp_secret
      refute secret_qr_encoded == nil
    end

    test "confirm_totp_enrollment/2 returns error if the user has already the totp enabled" do
      user =
        insert(:user, %{
          totp_enabled_at: DateTime.utc_now(),
          totp_secret: Faker.Internet.domain_name(),
          totp_last_used_at: DateTime.utc_now()
        })

      assert {:error, :totp_already_enabled} == Users.confirm_totp_enrollment(user, "123")
    end

    test "confirm_totp_enrollment/2 returns error if the user is the default admin" do
      assert {:error, :forbidden} == Users.confirm_totp_enrollment(%User{id: 1}, "123")
    end

    test "confirm_totp_enrollment/2 returns error if the totp is not valid for the secret" do
      user =
        insert(:user, %{
          totp_enabled_at: nil,
          totp_secret: Faker.Internet.domain_name(),
          totp_last_used_at: nil
        })

      assert {:error, :enrollment_totp_not_valid} == Users.confirm_totp_enrollment(user, "123")
    end

    test "confirm_totp_enrollment/2 returns the updated user with otp configured if the otp is valid for enrollment secret" do
      secret = NimbleTOTP.secret()

      user =
        insert(:user, %{
          totp_enabled_at: nil,
          totp_secret: secret,
          totp_last_used_at: nil
        })

      assert {:ok, %User{totp_enabled_at: totp_enabled_at, totp_last_used_at: totp_last_used_at}} =
               Users.confirm_totp_enrollment(user, NimbleTOTP.verification_code(secret))

      refute totp_enabled_at == nil
      refute totp_last_used_at == nil
      assert totp_enabled_at == totp_last_used_at
    end

    test "validate_totp/2 validates only if totp is enabled" do
      user = insert(:user, totp_enabled_at: nil)

      assert {:ok, ^user} = Users.validate_totp(user, Faker.StarWars.planet())
    end

    test "validate_totp/2 validates totp correctly" do
      secret = NimbleTOTP.secret()
      totp_code = NimbleTOTP.verification_code(secret)

      user =
        insert(:user,
          totp_enabled_at: DateTime.utc_now(),
          totp_secret: secret,
          totp_last_used_at: nil
        )

      assert {:ok, %User{totp_last_used_at: last_used_at}} = Users.validate_totp(user, totp_code)
      refute last_used_at == nil

      assert {:error, :totp_invalid} = Users.validate_totp(user, Faker.StarWars.planet())
    end

    test "validate_totp/2 refuses already used totp code" do
      secret = NimbleTOTP.secret()
      totp_code = NimbleTOTP.verification_code(secret)

      user =
        insert(:user,
          totp_enabled_at: DateTime.utc_now(),
          totp_secret: secret,
          totp_last_used_at: DateTime.utc_now()
        )

      assert {:error, :totp_invalid} = Users.validate_totp(user, totp_code)
    end
  end
end
