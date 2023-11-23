defmodule Trento.Infrastructure.Alerting.Emails.EmailAlert do
  @moduledoc false

  import Swoosh.Email

  use Phoenix.Swoosh, view: Trento.Infrastructure.Alerting.Emails.EmailView

  def alert(component, identified_by, identifier, reason) do
    new()
    |> from({"Trento Alerts", Application.fetch_env!(:trento, :alerting)[:sender]})
    |> to({"Trento Admin", Application.fetch_env!(:trento, :alerting)[:recipient]})
    |> subject("Trento Alert: #{component} #{identifier} needs attention.")
    |> render_body("critical.html", %{
      component: component,
      identified_by: identified_by,
      identifier: identifier,
      alerting_reason: reason
    })
  end
end
