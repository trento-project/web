defmodule TrentoWeb.Plugs.UpdateLastLoginAtPlugTest do
  @moduledoc false
  use TrentoWeb.ConnCase, async: true

  import Trento.Factory

  alias Trento.Users

  alias TrentoWeb.Plugs.UpdateLastLoginAtPlug

  test "should update user last login at timestamp on valid login", %{
    conn: conn
  } do
    %{id: user_id} = user = insert(:user)

    conn
    |> Pow.Plug.assign_current_user(user, [])
    |> UpdateLastLoginAtPlug.call(nil)
    |> send_resp(200, "")

    # wait until the async task is finished
    [pid] = Task.Supervisor.children(Trento.TasksSupervisor)
    ref = Process.monitor(pid)
    assert_receive {:DOWN, ^ref, _, _, _}

    {:ok, updated_user} = Users.get_user(user_id)
    assert updated_user.last_login_at != nil
  end

  test "should not update user last login at timestamp if the login fails", %{
    conn: conn
  } do
    %{id: user_id} = insert(:user)

    conn
    |> UpdateLastLoginAtPlug.call(nil)
    |> send_resp(401, "")

    {:ok, updated_user} = Users.get_user(user_id)
    assert updated_user.last_login_at == nil
  end
end
