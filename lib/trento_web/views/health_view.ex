defmodule TrentoWeb.HealthView do
  use TrentoWeb, :view

  def render("health.json", %{health: health}), do: health
end
