defmodule TrentoWeb.V2.SUSEManagerViewTest do
  use TrentoWeb.ConnCase, async: true

  import Phoenix.View

  import Trento.Factory

  alias TrentoWeb.V2.SUSEManagerView

  describe "renders errata_details.json" do
    test "should render relevant fields" do
      %{errataFrom: errata_from} = errata_details = build(:errata_details)
      fixes = build(:bugzilla_fix)

      errata_details_sans_errata_from = Map.delete(errata_details, :errataFrom)

      expected_errata_details =
        Map.put(errata_details_sans_errata_from, :errata_from, errata_from)

      assert %{
               errata_details: ^expected_errata_details,
               fixes: ^fixes
             } =
               render(SUSEManagerView, "errata_details.json", %{
                 errata_details:
                   Map.put(errata_details_sans_errata_from, :errataFrom, errata_from),
                 fixes: fixes
               })
    end
  end
end
