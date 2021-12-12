defmodule Tronto.Monitoring.Heartbeat.Cache do
  @moduledoc false

  use Nebulex.Cache,
    otp_app: :tronto,
    adapter: Nebulex.Adapters.Replicated
end
