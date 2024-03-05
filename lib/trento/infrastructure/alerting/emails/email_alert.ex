defmodule Trento.Infrastructure.Alerting.Emails.EmailAlert do
  @moduledoc false

  import Swoosh.Email

  use Phoenix.Swoosh, view: Trento.Infrastructure.Alerting.Emails.EmailView

  def api_key_expired do
    new()
    |> from({"Trento Alerts", Application.fetch_env!(:trento, :alerting)[:sender]})
    |> to({"Trento Admin", Application.fetch_env!(:trento, :alerting)[:recipient]})
    |> subject("Trento Alert: Api key expired")
    |> render_body("api_key_expiration.html", %{
      api_key_expired: true
    })
  end

  def api_key_will_expire(days) do
    new()
    |> from({"Trento Alerts", Application.fetch_env!(:trento, :alerting)[:sender]})
    |> to({"Trento Admin", Application.fetch_env!(:trento, :alerting)[:recipient]})
    |> subject("Trento Alert: Api key will expire in #{days} days")
    |> render_body("api_key_expiration.html", %{
      api_key_expired: false,
      expire_days: days
    })
  end

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
