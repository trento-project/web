defmodule Trento.AlertEmail do
  @moduledoc false

  import Swoosh.Email

  def alert(text) do
    new()
    |> to({"Trento Admin", "admin@trento.io"})
    |> from({"Trento Alerts", "alerts@trento.io"})
    |> subject(text)
    |> html_body(
      "<h3>#{text}<h3><br><br><img src='https://c.tenor.com/MYZgsN2TDJAAAAAC/this-is.gif'>"
    )
  end
end
