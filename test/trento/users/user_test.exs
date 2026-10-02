# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Users.UsersTest do
  use ExUnit.Case
  use Trento.DataCase

  alias Trento.Users.User

  describe "changeset/2" do
    test "validates email and fullname fields are required" do
      changeset = User.changeset(%User{}, %{})

      assert changeset.errors[:fullname] == {"can't be blank", [validation: :required]}
      assert changeset.errors[:email] == {"can't be blank", [validation: :required]}
    end

    test "validates the email field" do
      changeset = User.changeset(%User{}, %{"email" => "invalid"})

      assert changeset.errors[:email] == {"is not a valid email", [validation: :email]}
    end

    test "validates repetitive and sequential password" do
      changeset = User.changeset(%User{}, %{"password" => "secret1222"})
      assert changeset.errors[:password] == {"has repetitive characters", []}

      changeset = User.changeset(%User{}, %{"password" => "secret1223"})
      refute changeset.errors[:password]

      changeset = User.changeset(%User{}, %{"password" => "secret1234"})
      assert changeset.errors[:password] == {"has sequential characters", []}

      changeset = User.changeset(%User{}, %{"password" => "secret1235"})
      refute changeset.errors[:password]

      changeset = User.changeset(%User{}, %{"password" => "secretefgh"})
      assert changeset.errors[:password] == {"has sequential characters", []}

      changeset = User.changeset(%User{}, %{"password" => "secretafgh"})
      refute changeset.errors[:password]
    end
  end

  describe "update_changeset/2" do
    test "validates totp_enabled_at unique valid value is nil" do
      changeset = User.update_changeset(%User{}, %{"totp_enabled_at" => nil})
      refute changeset.errors[:totp_enabled_at]

      changeset = User.update_changeset(%User{}, %{"totp_enabled_at" => DateTime.utc_now()})

      assert changeset.errors[:totp_enabled_at] ==
               {"is invalid", [validation: :inclusion, enum: [nil]]}
    end
  end

  describe "profile_update_changeset/2" do
    test "validates analytics_enabled_at field is cast properly" do
      changeset =
        User.profile_update_changeset(%User{}, %{"analytics_enabled_at" => DateTime.utc_now()})

      assert changeset.changes[:analytics_enabled_at]
    end

    test "validates analytics_eula_accepted_at field is cast properly" do
      changeset =
        User.profile_update_changeset(%User{}, %{
          "analytics_eula_accepted_at" => DateTime.utc_now()
        })

      assert changeset.changes[:analytics_eula_accepted_at]
    end

    test "validates timezone field is cast properly" do
      changeset =
        User.profile_update_changeset(%User{}, %{
          "timezone" => "Europe/Berlin"
        })

      assert changeset.changes[:timezone] == "Europe/Berlin"
    end

    test "rejects invalid IANA timezone" do
      changeset =
        User.profile_update_changeset(%User{}, %{
          "timezone" => "US/Pacific-New"
        })

      assert changeset.errors[:timezone]
    end
  end

  describe "profile_update_sso_enabled_changeset/2" do
    test " validates analytics fields are cast properly" do
      changeset =
        User.profile_update_sso_enabled_changeset(%User{}, %{
          "fullname" => "name",
          "analytics_enabled_at" => DateTime.utc_now(),
          "analytics_eula_accepted_at" => DateTime.utc_now()
        })

      refute changeset.changes[:fullname]
      assert changeset.changes[:analytics_enabled_at]
      assert changeset.changes[:analytics_eula_accepted_at]
    end

    test "profile_update_sso_enabled_changeset/2 validates timezone field is cast properly" do
      changeset =
        User.profile_update_sso_enabled_changeset(%User{}, %{
          "timezone" => "Europe/Berlin"
        })

      assert changeset.changes[:timezone] == "Europe/Berlin"
    end

    test "profile_update_sso_enabled_changeset/2 rejects invalid IANA timezone" do
      changeset =
        User.profile_update_sso_enabled_changeset(%User{}, %{
          "timezone" => "US/Pacific-New"
        })

      assert changeset.errors[:timezone]
    end
  end

  describe "profile_update_admin_changeset/2" do
    test " validates analytics fields are cast properly" do
      changeset =
        User.profile_update_admin_changeset(%User{}, %{
          "fullname" => "name",
          "analytics_enabled_at" => DateTime.utc_now(),
          "analytics_eula_accepted_at" => DateTime.utc_now(),
          "timezone" => "Europe/Berlin"
        })

      refute changeset.changes[:fullname]
      assert changeset.changes[:analytics_enabled_at]
      assert changeset.changes[:analytics_eula_accepted_at]
      assert changeset.changes[:timezone] == "Europe/Berlin"
    end

    test "rejects invalid IANA timezone" do
      changeset =
        User.profile_update_admin_changeset(%User{}, %{
          "timezone" => "US/Pacific-New"
        })

      assert changeset.errors[:timezone]
    end
  end
end
