defmodule TrentoWeb.V1.SUSEManagerJSONTest do
  use TrentoWeb.ConnCase, async: true

  import Trento.Factory

  alias TrentoWeb.V1.SUSEManagerJSON

  describe "renders software_updates.json" do
    test "should render relevant fields" do
      relevant_patches = build_list(10, :relevant_patch)
      upgradable_packages = build_list(10, :upgradable_package)

      assert %{relevant_patches: relevant_patches, upgradable_packages: upgradable_packages} ==
               SUSEManagerJSON.software_updates(%{
                 relevant_patches: relevant_patches,
                 upgradable_packages: upgradable_packages
               })
    end
  end

  describe "renders errata_details.json" do
    test "should render relevant fields" do
      %{errataFrom: errata_from} = errata_details = build(:errata_details)

      expected_errata_details =
        %{errata_details | type: :bugfix}
        |> Map.delete(:errataFrom)
        |> Map.put(:errata_from, errata_from)

      cves = build_list(10, :cve)

      fixes = build(:bugzilla_fix)

      affected_packages = build_list(10, :affected_package)

      affected_systems = build_list(10, :affected_system)

      assert %{
               errata_details: ^expected_errata_details,
               cves: ^cves,
               fixes: ^fixes,
               affected_packages: ^affected_packages,
               affected_systems: ^affected_systems
             } =
               SUSEManagerJSON.errata_details(%{
                 errata_details: errata_details,
                 cves: cves,
                 fixes: fixes,
                 affected_packages: affected_packages,
                 affected_systems: affected_systems
               })
    end
  end
end
