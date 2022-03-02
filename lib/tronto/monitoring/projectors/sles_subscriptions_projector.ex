defmodule Tronto.Monitoring.SlesSubscriptionsProjector do
  @moduledoc """
  Check result projector
  """

  use Commanded.Projections.Ecto,
    application: Tronto.Commanded,
    repo: Tronto.Repo,
    name: "sles_subscription_projector"

  import Ecto.Query

  alias Tronto.Monitoring.Domain.Events.{
    SubscriptionsUpdated
  }

  alias Tronto.Monitoring.SlesSubscriptionReadModel

  project(
    %SubscriptionsUpdated{host_id: host_id, subscriptions: subscriptions},
    fn multi ->
      multi =
        Ecto.Multi.delete_all(
          multi,
          :delete_old_sles_subscriptions,
          from(s in SlesSubscriptionReadModel, where: s.host_id == ^host_id)
        )

      subscriptions
      |> Enum.map(fn subscription ->
        SlesSubscriptionReadModel.changeset(
          %SlesSubscriptionReadModel{},
          subscription
        )
      end)
      |> Enum.reduce(multi, fn %{changes: %{host_id: host_id, identifier: identifier}} = changeset,
                               acc ->
        Ecto.Multi.insert(acc, "#{host_id}_#{identifier}", changeset)
      end)
    end
  )
end
