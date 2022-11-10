defmodule TrentoWeb.HostView do
  use TrentoWeb, :view

  def render("hosts.json", %{hosts: hosts}) do
    render_many(hosts, __MODULE__, "host.json")
  end

  def render("host.json", %{host: host}), do: host
end
