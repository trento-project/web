defmodule Tronto.Repo do
  use Ecto.Repo,
    otp_app: :tronto,
    adapter: Ecto.Adapters.Postgres
end
