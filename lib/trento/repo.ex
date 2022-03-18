defmodule Trento.Repo do
  use Ecto.Repo,
    otp_app: :trento,
    adapter: Ecto.Adapters.Postgres
end
