defmodule TrentoWeb.Plugs.Otel do
  @moduledoc false
  require OpenTelemetry.Tracer, as: Tracer

  def init(default) do
    default
  end

  def call(conn, _default) do
    current_user = conn.assigns.current_user

    Tracer.add_event("Otel", [{"user", current_user}])

    conn
  end
end
