defmodule Tronto.Commanded do
  @moduledoc """
  Tronto Commanded Application
  """

  use Commanded.Application, otp_app: :tronto

  router(Tronto.Router)
end
