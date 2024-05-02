defmodule Trento.Commanded do
  @moduledoc """
  Trento Commanded Application
  """

  use Boundary
  use Commanded.Application, otp_app: :trento

  router(Trento.Router)
end
