defmodule TrentoWeb.V1.SUSEManagerViewTest do
  use TrentoWeb.ConnCase, async: true

  import Phoenix.View

  import Trento.Factory

  alias TrentoWeb.V1.SUSEManagerView

  describe "renders software_updates.json" do
    test "should render relevant fields" do
      relevant_patches = build_list(10, :relevant_patch)
      upgradable_packages = build_list(10, :upgradable_package)

      assert %{relevant_patches: relevant_patches, upgradable_packages: upgradable_packages} ==
               render(SUSEManagerView, "software_updates.json", %{
                 relevant_patches: relevant_patches,
                 upgradable_packages: upgradable_packages
               })
    end
  end

  describe "renders errata_details.json" do
    test "should render relevant fields" do
      %{errataFrom: errata_from} = errata_details = build(:errata_details)

      cves =
        Enum.map(
          1..10,
          fn _ ->
            year = Enum.random(1_991..2_024)
            id = Enum.random(0..9_999)
            "CVE-#{year}-#{id}"
          end
        )

      fixes = build(:bugzilla_fix)

      errata_details_sans_errata_from = Map.delete(errata_details, :errataFrom)

      expected_errata_details =
        Map.put(errata_details_sans_errata_from, :errata_from, errata_from)

      assert %{
               errata_details: ^expected_errata_details,
               cves: ^cves,
               fixes: ^fixes
             } =
               render(SUSEManagerView, "errata_details.json", %{
                 errata_details:
                   Map.put(errata_details_sans_errata_from, :errataFrom, errata_from),
                 cves: cves,
                 fixes: fixes
               })
    end
  end
end
