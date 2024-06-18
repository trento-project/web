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
      %{
        id: id,
        issue_date: issue_date,
        update_date: update_date,
        last_modified_date: last_modified_date,
        synopsis: synopsis,
        release: release,
        advisory_status: advisory_status,
        vendor_advisory: vendor_advisory,
        type: type,
        product: product,
        errataFrom: errata_from,
        topic: topic,
        description: description,
        references: references,
        notes: notes,
        solution: solution,
        reboot_suggested: reboot_suggested,
        restart_suggested: restart_suggested
      } = build(:errata_details)

      assert %{
               id: id,
               issue_date: issue_date,
               update_date: update_date,
               last_modified_date: last_modified_date,
               synopsis: synopsis,
               release: release,
               advisory_status: advisory_status,
               vendor_advisory: vendor_advisory,
               type: type,
               product: product,
               errata_from: errata_from,
               topic: topic,
               description: description,
               references: references,
               notes: notes,
               solution: solution,
               reboot_suggested: reboot_suggested,
               restart_suggested: restart_suggested
             } ==
               render(SUSEManagerView, "errata_details.json", %{
                 errata_details: %{
                   id: id,
                   issue_date: issue_date,
                   update_date: update_date,
                   last_modified_date: last_modified_date,
                   synopsis: synopsis,
                   release: release,
                   advisory_status: advisory_status,
                   vendor_advisory: vendor_advisory,
                   type: type,
                   product: product,
                   errataFrom: errata_from,
                   topic: topic,
                   description: description,
                   references: references,
                   notes: notes,
                   solution: solution,
                   reboot_suggested: reboot_suggested,
                   restart_suggested: restart_suggested
                 }
               })
    end
  end
end
