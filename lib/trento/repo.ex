defmodule Trento.Repo do
  use Boundary, deps: [Ecto]

  use Ecto.Repo,
    otp_app: :trento,
    adapter: Ecto.Adapters.Postgres
end
