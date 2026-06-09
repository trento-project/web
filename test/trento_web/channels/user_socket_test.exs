# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule TrentoWeb.UserSocketTest do
  use TrentoWeb.ChannelCase

  import Mox

  alias TrentoWeb.Auth.AccessToken
  alias TrentoWeb.UserSocket

  setup :verify_on_exit!

  describe "connect/3" do
    setup do
      url = Faker.Internet.url()
      %{connect_info: %{uri: URI.parse(url)}, expected_origin: url}
    end

    test "stores :current_user_id, :access_token and :request_origin when JWT validates", %{
      connect_info: connect_info,
      expected_origin: expected_origin
    } do
      # AccessToken.generate_access_token!/1 + verify_and_validate/1 each
      # call Joken.CurrentTime once. Stub both.
      stub(Joken.CurrentTime.Mock, :current_time, fn -> 1_700_000_000 end)

      jwt = AccessToken.generate_access_token!(%{"sub" => 42})

      assert {:ok, %{assigns: assigns}} =
               UserSocket.connect(%{"access_token" => jwt}, socket(UserSocket), connect_info)

      assert %{
               current_user_id: 42,
               access_token: ^jwt,
               request_origin: ^expected_origin
             } = assigns
    end

    test "rejects invalid JWT and assigns nothing", %{connect_info: connect_info} do
      assert {:error, _reason} =
               UserSocket.connect(
                 %{"access_token" => "not-a-jwt"},
                 socket(UserSocket),
                 connect_info
               )
    end

    test "rejects missing access_token param", %{connect_info: connect_info} do
      assert {:error, :missing_auth_token} =
               UserSocket.connect(%{}, socket(UserSocket), connect_info)
    end
  end
end
