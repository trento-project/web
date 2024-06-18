defmodule TrentoWeb.V1.SUSEManagerView do
  use TrentoWeb, :view

  def render("software_updates.json", %{
        relevant_patches: relevant_patches,
        upgradable_packages: upgradable_packages
      }) do
    %{
      relevant_patches:
        render_many(relevant_patches, __MODULE__, "relevant_patch.json", as: :relevant_patch),
      upgradable_packages:
        render_many(upgradable_packages, __MODULE__, "upgradable_package.json",
          as: :upgradable_package
        )
    }
  end

  def render("relevant_patch.json", %{
        relevant_patch: %{
          date: date,
          advisory_name: advisory_name,
          advisory_type: advisory_type,
          advisory_status: advisory_status,
          id: id,
          advisory_synopsis: advisory_synopsis,
          update_date: update_date
        }
      }),
      do: %{
        date: date,
        advisory_name: advisory_name,
        advisory_type: advisory_type,
        advisory_status: advisory_status,
        id: id,
        advisory_synopsis: advisory_synopsis,
        update_date: update_date
      }

  def render("upgradable_package.json", %{
        upgradable_package: %{
          name: name,
          arch: arch,
          from_version: from_version,
          from_release: from_release,
          from_epoch: from_epoch,
          to_version: to_version,
          to_release: to_release,
          to_epoch: to_epoch,
          to_package_id: to_package_id
        }
      }),
      do: %{
        name: name,
        arch: arch,
        from_version: from_version,
        from_release: from_release,
        from_epoch: from_epoch,
        to_version: to_version,
        to_release: to_release,
        to_epoch: to_epoch,
        to_package_id: to_package_id
      }

  def render("patches_for_packages.json", %{patches: patches}), do: %{patches: patches}

  def render("errata_details.json", %{
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
          errataFrom: errataFrom,
          topic: topic,
          description: description,
          references: references,
          notes: notes,
          solution: solution,
          reboot_suggested: reboot_suggested,
          restart_suggested: restart_suggested
        }
      }),
      do: %{
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
        errata_from: errataFrom,
        topic: topic,
        description: description,
        references: references,
        notes: notes,
        solution: solution,
        reboot_suggested: reboot_suggested,
        restart_suggested: restart_suggested
      }
end
