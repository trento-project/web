defmodule Trento.SlesSubscriptionsProjector do
  @moduledoc """
  Check result projector
  """

  use Commanded.Projections.Ecto,
    application: Trento.Commanded,
    repo: Trento.Repo,
    name: "sles_subscription_projector"

  import Ecto.Query

  alias Trento.Domain.Events.SlesSubscriptionsUpdated

  alias Trento.SlesSubscriptionReadModel

  project(
    %SlesSubscriptionsUpdated{host_id: host_id, subscriptions: subscriptions},
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
          Map.from_struct(subscription)
        )
      end)
      |> Enum.reduce(multi, fn %{changes: %{host_id: host_id, identifier: identifier}} = changeset,
                               acc ->
        Ecto.Multi.insert(acc, "#{host_id}_#{identifier}", changeset)
      end)
    end
  )

  def after_update(
        %SlesSubscriptionsUpdated{host_id: id, subscriptions: subscriptions},
        _,
        _
      ) do
    TrentoWeb.Endpoint.broadcast(
      "monitoring:hosts",
      "host_details_updated",
      %{
        id: id,
        sles_subscriptions: subscriptions
      }
    )
  end
end
