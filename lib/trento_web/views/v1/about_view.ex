defmodule TrentoWeb.V1.AboutView do
  use TrentoWeb, :view

  def render("about.json", %{
        about_info: %{version: version, sles_subscriptions: sles_subscriptions}
      }),
      do: %{
        version: version,
        sles_subscriptions: sles_subscriptions,
        flavor: "Community"
      }
end
