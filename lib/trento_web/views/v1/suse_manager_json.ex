defmodule TrentoWeb.V1.SUSEManagerJSON do
  alias Trento.SoftwareUpdates.Enums.AdvisoryType

  def software_updates(%{
        relevant_patches: relevant_patches,
        upgradable_packages: upgradable_packages
      }),
      do: %{
        relevant_patches: Enum.map(relevant_patches, &relevant_patch(%{relevant_patch: &1})),
        upgradable_packages:
          Enum.map(upgradable_packages, &upgradable_package(%{upgradable_package: &1}))
      }

  def patches_for_packages(%{patches: patches}),
    do: %{patches: Enum.map(patches, &package(%{package: &1}))}

  def errata_details(%{
        errata_details: errata_details = %{errataFrom: errataFrom},
        cves: cves,
        fixes: fixes,
        affected_packages: affected_packages,
        affected_systems: affected_systems
      }),
      do: %{
        errata_details:
          errata_details
          |> Map.drop([:errataFrom])
          |> Map.put(:errata_from, errataFrom)
          |> Map.update(:type, "", &AdvisoryType.from_string/1),
        cves: cves,
        fixes: fixes,
        affected_packages: affected_packages,
        affected_systems: affected_systems
      }

  defp relevant_patch(%{
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

  defp upgradable_package(%{
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

  defp package(%{package: %{package_id: package_id, patches: patches}}),
    do: %{package_id: package_id, patches: Enum.map(patches, &patch(%{patch: &1}))}

  defp patch(%{
         patch: %{
           date: date,
           advisory_name: advisory_name,
           advisory_type: advisory_type,
           advisory_synopsis: advisory_synopsis,
           update_date: update_date
         }
       }),
       do: %{
         issue_date: date,
         advisory: advisory_name,
         advisory_type: advisory_type,
         synopsis: advisory_synopsis,
         last_modified_date: update_date
       }
end
