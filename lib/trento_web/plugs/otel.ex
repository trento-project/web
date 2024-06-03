defmodule TrentoWeb.Plugs.Otel do
  require OpenTelemetry.Tracer, as: Tracer
  # alias OpenTelemetry.Ctx

  def init(default) do
    default
  end

  def call(conn, _default) do
    _span_ctx = Tracer.start_span(:request_init)
    current_user = conn.assigns.current_user

    Tracer.add_event("OTELLO", [{"user", current_user}])

    conn
  end
end
