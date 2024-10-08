defmodule TrentoWeb.V1.AboutJSON do
  def about(%{
        about_info: %{version: version, sles_subscriptions: sles_subscriptions}
      }) do
    %{
      version: version,
      sles_subscriptions: sles_subscriptions,
      flavor: "Community"
    }
  end
end
