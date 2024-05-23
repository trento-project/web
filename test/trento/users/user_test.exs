defmodule Trento.Users.UsersTest do
  use ExUnit.Case
  use Trento.DataCase

  alias Trento.Users.User

  describe "validation" do
    test "changeset/2 validates email and fullname fields are required" do
      changeset = User.changeset(%User{}, %{})

      assert changeset.errors[:fullname] == {"can't be blank", [validation: :required]}
      assert changeset.errors[:email] == {"can't be blank", [validation: :required]}
    end

    test "changeset/2 validates the email field" do
      changeset = User.changeset(%User{}, %{"email" => "invalid"})

      assert changeset.errors[:email] == {"is not a valid email", [validation: :email]}
    end

    test "changeset/2 validates repetitive and sequential password" do
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

    test "update_changeset/2 validates totp_enabled_at unique valid value is nil" do
      changeset = User.update_changeset(%User{}, %{"totp_enabled_at" => nil})
      refute changeset.errors[:totp_enabled_at]

      changeset = User.update_changeset(%User{}, %{"totp_enabled_at" => DateTime.utc_now()})

      assert changeset.errors[:totp_enabled_at] ==
               {"is invalid", [validation: :inclusion, enum: [nil]]}
    end
  end
end
