# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Infrastructure.Alerting.Emails.EmailAlert do
  @moduledoc false

  import Swoosh.Email
  use TrentoWeb, :html

  alias Trento.Infrastructure.Alerting.Emails.EmailLayout

  alias Trento.Hosts.Projections.HostReadModel

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

  def heartbeat_failed(
        %HostReadModel{
          id: host_id,
          hostname: hostname,
          cluster: cluster,
          application_instances: application_instances,
          database_instances: database_instances
        },
        failed_at,
        sender: sender,
        recipient: recipient
      ) do
    body =
      %{
        host_id: host_id,
        hostname: hostname,
        failed_at: Calendar.strftime(failed_at, "%Y-%m-%d %H:%M:%S UTC"),
        cluster: cluster,
        application_instances: application_instances,
        database_instances: database_instances
      }
      |> heartbeat_failure()
      |> render_heex_to_string()

    new()
    |> from({"Trento Alerts", sender})
    |> to({"Trento Admin", recipient})
    |> subject("Trento Alert: Host #{hostname} stopped reporting.")
    |> html_body(body)
  end

  defp render_heex_to_string(rendered) do
    rendered
    |> Phoenix.HTML.Safe.to_iodata()
    |> to_string()
  end
end
