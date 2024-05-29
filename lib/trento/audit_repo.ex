defmodule Trento.AuditRepo do
  use Ecto.Repo,
    otp_app: :trento,
    adapter: Ecto.Adapters.Postgres
end
