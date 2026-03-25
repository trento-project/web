const mockData = {
  relevant_patches: [
    {
      date: "2024-02-27",
      advisory_name: "SUSE-15-SP4-2024-630",
      advisory_type: "bugfix",
      advisory_status: "stable",
      id: 4182,
      advisory_synopsis: "Recommended update for cloud-netconfig",
      update_date: "2024-02-27"
    },
    {
      date: "2024-02-26",
      advisory_name: "SUSE-15-SP4-2024-619",
      advisory_type: "security_advisory",
      advisory_status: "stable",
      id: 4174,
      advisory_synopsis: "important: Security update for java-1_8_0-ibm",
      update_date: "2024-02-26"
    }
  ],
  upgradable_packages: [
    {
      name: "elixir",
      arch: "x86_64",
      from_version: "1.15.7",
      from_release: "3",
      from_epoch: "0",
      to_version: "1.16.2",
      to_release: "1",
      to_epoch: "0",
      to_package_id: 92348112636
    },
    {
      name: "systemd",
      arch: "x86_64",
      from_version: "254",
      from_release: "1",
      from_epoch: "",
      to_version: "255",
      to_release: "1",
      to_epoch: "0",
      to_package_id: 8912349843
    }
  ],
  errata_details: {
    type: "security_advisory",
    synopsis: "important: Security update for java-1_8_0-ibm",
    issue_date: "2024-02-27",
    update_date: "2024-02-27",
    last_modified_date: "2024-02-27",
    advisory_status: "stable",
    reboot_suggested: true,
    restart_suggested: true,
    id: 2,
    release: 3,
    vendor_advisory: "IBM",
    product: "IBM® Semeru Runtime™ Certified Edition",
    errataFrom: "SUSE",
    topic: "Java",
    description: "Minor security bug fixes",
    references: "N.A.",
    notes: "N.A.",
    solution: "N.A."
  },
  cves: [
    "SUSE-15-SP4-2024-630",
    "SUSE-15-SP4-2024-234",
    "SUSE-15-SP4-2024-990"
  ],
  bugzilla_fixes: {
    "1210660": "VUL-0: CVE-2023-2137: sqlite2,sqlite3: Heap buffer overflow in sqlite"
  },
  affected_packages: [
    {
      name: "elixir",
      version: "6.9.7",
      release: "2",
      arch_label: "x86_64",
      epoch: "0"
    },
    {
      name: "systemd",
      version: "6.9.7",
      release: "2",
      arch_label: "x86_64",
      epoch: "0"
    }
  ],
  affected_systems: [
    {
      name: "vmdrbddev01"
    },
    {
      name: "vmdrbddev02"
    }
  ],
  errors: {
    host_not_found: {
      errors: [
        {
          detail: "No system ID was found on SUSE Manager for this host.",
          title: "Unprocessable Entity"
        }
      ]
    }
  }
};

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
