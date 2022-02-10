defmodule Tronto.AlertEmail do
  @moduledoc false

  import Swoosh.Email

  def alert(text) do
    new()
    |> to({"Tronto Admin", "admin@tronto.io"})
    |> from({"Tronto Alerts", "alerts@tronto.io"})
    |> subject(text)
    |> html_body(
      "<h3>#{text}<h3><br><br><img src='https://c.tenor.com/MYZgsN2TDJAAAAAC/this-is.gif'>"
    )
  end
end
