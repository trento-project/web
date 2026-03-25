const mockData = require('../../../../priv/fixtures/software_updates.json');

export const getSoftwareUpdatesList = () => ({
  relevant_patches: mockData.relevant_patches,
  upgradable_packages: mockData.upgradable_packages,
});

export const getErrataDetails = () => ({
  errata_details: mockData.errata_details,
  cves: mockData.cves,
  fixes: mockData.bugzilla_fixes,
  affected_packages: mockData.affected_packages,
  affected_systems: mockData.affected_systems,
});

export const getPackagesPatches = () => ({
  patches: mockData.upgradable_packages.map((pkg) => ({
    package_id: pkg.to_package_id,
    patches: mockData.relevant_patches.map((patch) => ({
      advisory: patch.advisory_name,
      type: patch.advisory_type,
      synopsis: patch.advisory_synopsis,
      issue_date: patch.date,
      update_date: patch.update_date,
      last_modified_date: patch.update_date,
    })),
  })),
});

export const getHostNotFoundError = () => mockData.errors.host_not_found;
