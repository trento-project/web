defmodule Trento.Users.UsersTest do
  use ExUnit.Case
  use Trento.DataCase

  alias Trento.Users.User

  describe "validation" do
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
  end
end
