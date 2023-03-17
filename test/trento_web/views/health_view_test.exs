defmodule TrentoWeb.HealthViewTest do
  use ExUnit.Case

  import Phoenix.View

  test "should render data indicating that the database is in a healthy state" do
    assert %{database: "pass"} ==
             render(TrentoWeb.HealthView, "health.json", health: %{database: "pass"})
  end

  test "should render data indicating that the database is in an unhealthy state" do
    assert %{database: "fail"} ==
             render(TrentoWeb.HealthView, "health.json", health: %{database: "fail"})
  end
end
