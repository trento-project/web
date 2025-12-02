defmodule TrentoWeb.Plugs.UpdateLastLoginAtPlug do
  @moduledoc """
  This plug updates the last login at value in a successful login attempt.
  """

  @behaviour Plug
  import Plug.Conn

  alias Trento.Users
  alias Trento.Users.User

  def init(default), do: default

  def call(conn, _default) do
    register_before_send(conn, fn
      %{assigns: %{current_user: %User{} = logged_user}} = conn ->
        # running an async task to avoid any failure to affect the login itself
        task =
          Task.Supervisor.start_child(Trento.TasksSupervisor, fn ->
            Users.update_last_login_at(logged_user)
          end)

        # add task to private to enable easy testing
        put_private(conn, :trento_supervised_task, task)

      conn ->
        conn
    end)
  end
end
