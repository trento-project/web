defmodule TrentoWeb.HealthJSONTest do
  use ExUnit.Case

  alias TrentoWeb.HealthJSON

  test "should render data indicating that the database is in a healthy state" do
    assert %{database: "pass"} ==
             HealthJSON.health(%{health: %{database: "pass"}})
  end

  test "should render data indicating that the database is in an unhealthy state" do
    assert %{database: "fail"} ==
             HealthJSON.health(%{health: %{database: "fail"}})
  end
end
