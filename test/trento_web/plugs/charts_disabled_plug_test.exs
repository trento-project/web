defmodule TrentoWeb.Plugs.ChartsDisabledPlugTest do
  use TrentoWeb.ConnCase, async: true
  use Plug.Test

  alias TrentoWeb.Plugs.ChartsDisabledPlug

  test "should return 501 when called" do
    conn = conn(:get, "/foo")

    conn = ChartsDisabledPlug.call(conn, [])

    assert %{
             "errors" => [
               %{
                 "detail" =>
                   "Charts endpoints are disabled, check the documentation for further details",
                 "title" => "Not implemented"
               }
             ]
           } = json_response(conn, 501)
  end
end
