# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule TrentoWeb.UserSocketTest do
  use TrentoWeb.ChannelCase

  import Mox

  alias TrentoWeb.Auth.AccessToken
  alias TrentoWeb.UserSocket

  setup :verify_on_exit!

  describe "connect/3" do
    test "stores both :current_user_id AND :access_token when JWT validates" do
      # AccessToken.generate_access_token!/1 + verify_and_validate/1 each
      # call Joken.CurrentTime once. Stub both.
      stub(Joken.CurrentTime.Mock, :current_time, fn -> 1_700_000_000 end)

      jwt = AccessToken.generate_access_token!(%{"sub" => 42})

      assert {:ok, socket} = UserSocket.connect(%{"access_token" => jwt}, socket(UserSocket), %{})
      assert socket.assigns.current_user_id == 42
      assert socket.assigns.access_token == jwt
    end

    test "rejects invalid JWT and assigns nothing" do
      assert {:error, _reason} =
               UserSocket.connect(%{"access_token" => "not-a-jwt"}, socket(UserSocket), %{})
    end

    test "rejects missing access_token param" do
      assert {:error, :missing_auth_token} = UserSocket.connect(%{}, socket(UserSocket), %{})
    end
  end
end
