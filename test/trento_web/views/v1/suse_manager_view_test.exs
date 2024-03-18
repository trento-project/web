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
end
