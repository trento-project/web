defmodule TrentoWeb.V2.SUSEManagerView do
  use TrentoWeb, :view

  def render("errata_details.json", %{
        errata_details: errata_details = %{errataFrom: errataFrom},
        fixes: fixes
      }),
      do: %{
        errata_details:
          errata_details
          |> Map.drop([:errataFrom])
          |> Map.put(:errata_from, errataFrom),
        fixes: fixes
      }
end
