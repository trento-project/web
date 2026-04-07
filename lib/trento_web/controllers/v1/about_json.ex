defmodule TrentoWeb.V1.AboutJSON do
  def about(%{
        about_info:
          %{
            version: version,
            sles_subscriptions: sles_subscriptions
          } = about_info
      }),
      do: %{
        version: version,
        sles_subscriptions: sles_subscriptions,
        flavor: "Community",
        wanda_version: Map.get(about_info, :wanda_version),
        postgres_version: Map.get(about_info, :postgres_version),
        rabbitmq_version: Map.get(about_info, :rabbitmq_version),
        prometheus_version: Map.get(about_info, :prometheus_version)
      }
end
