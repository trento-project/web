defmodule Trento.Infrastructure.Alerting.Emails.EmailAlert do
  @moduledoc false

  import Swoosh.Email
  use TrentoWeb, :html

  embed_templates "email_templates/*"

  def api_key_expired(sender: sender, recipient: recipient) do
    body =
      %{api_key_expired: true}
      |> api_key_expiration()
      |> render_heex_to_string()

    new()
    |> from({"Trento Alerts", sender})
    |> to({"Trento Admin", recipient})
    |> subject("Trento Alert: Api key expired")
    |> html_body(body)
  end

  def api_key_will_expire(days, sender: sender, recipient: recipient) do
    body =
      %{api_key_expired: false, expire_days: days}
      |> api_key_expiration()
      |> render_heex_to_string()

    new()
    |> from({"Trento Alerts", sender})
    |> to({"Trento Admin", recipient})
    |> subject("Trento Alert: Api key will expire in #{days} days")
    |> html_body(body)
  end

  def alert(component, identified_by, identifier, reason, sender: sender, recipient: recipient) do
    body =
      %{
        component: component,
        identified_by: identified_by,
        identifier: identifier,
        alerting_reason: reason
      }
      |> critical_alert()
      |> render_heex_to_string()

    new()
    |> from({"Trento Alerts", sender})
    |> to({"Trento Admin", recipient})
    |> subject("Trento Alert: #{component} #{identifier} needs attention.")
    |> html_body(body)
  end

  defp render_heex_to_string(rendered) do
    rendered
    |> Phoenix.HTML.Safe.to_iodata()
    |> to_string()
  end
end
