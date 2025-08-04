defmodule TrentoWeb.OpenApi.V1.Schema.AvailableSoftwareUpdates do
  @moduledoc false

  require OpenApiSpex
  require Trento.SoftwareUpdates.Enums.AdvisoryType, as: AdvisoryType

  alias OpenApiSpex.Schema

  defmodule UpgradablePackage do
    @moduledoc false
    OpenApiSpex.schema(
      %{
        title: "UpgradablePackage",
        description: "Upgradable package.",
        type: :object,
        additionalProperties: false,
        properties: %{
          arch: %Schema{type: :string, description: "Package name.", example: "x86_64"},
          from_epoch: %Schema{type: :string, description: "From epoch.", example: "0"},
          from_release: %Schema{type: :string, description: "From which release.", example: "1.1"},
          from_version: %Schema{type: :string, description: "From version.", example: "1.0.0"},
          name: %Schema{
            type: :string,
            description: "Upgradable package name.",
            example: "openssl"
          },
          to_epoch: %Schema{type: :string, description: "To epoch.", example: "0"},
          to_package_id: %Schema{type: :integer, description: "To package id.", example: 5678},
          to_release: %Schema{type: :string, description: "To release.", example: "1.2"},
          to_version: %Schema{type: :string, description: "To version.", example: "1.1.1"}
        },
        example: %{
          arch: "x86_64",
          from_epoch: "0",
          from_release: "1.1",
          from_version: "1.0.0",
          name: "openssl",
          to_epoch: "0",
          to_package_id: 5678,
          to_release: "1.2",
          to_version: "1.1.1"
        }
      },
      struct?: false
    )
  end

  defmodule RelevantPatch do
    @moduledoc false
    OpenApiSpex.schema(
      %{
        title: "RelevantPatch",
        description: "Relevant patch.",
        type: :object,
        additionalProperties: false,
        properties: %{
          id: %Schema{type: :integer, description: "Advisory's id.", example: 1234},
          advisory_name: %Schema{
            type: :string,
            description: "Advisory name.",
            example: "SUSE-SU-2024:0001-1"
          },
          advisory_status: %Schema{
            type: :string,
            description: "Advisory status.",
            example: "stable"
          },
          advisory_synopsis: %Schema{
            type: :string,
            description: "Advisory's synopsis.",
            example: "Critical security update for OpenSSL"
          },
          advisory_type: %Schema{
            type: :string,
            description: "Advisory's type.",
            enum: AdvisoryType.values(),
            example: "security_advisory"
          },
          date: %Schema{type: :string, description: "Advisory's date.", example: "2024-01-15"},
          update_date: %Schema{
            type: :string,
            description: "Advisory's update date.",
            example: "2024-01-15"
          }
        },
        example: %{
          id: 1234,
          advisory_name: "SUSE-SU-2024:0001-1",
          advisory_status: "stable",
          advisory_synopsis: "Critical security update for OpenSSL",
          advisory_type: "security_advisory",
          date: "2024-01-15",
          update_date: "2024-01-15"
        }
      },
      struct?: false
    )
  end

  defmodule PatchesForPackage do
    @moduledoc false
    OpenApiSpex.schema(
      %{
        title: "PatchesForPackage",
        description: "Relevant patches covered by a package upgrade.",
        type: :object,
        additionalProperties: false,
        properties: %{
          package_id: %Schema{type: :integer, description: "To package id"},
          patches: %Schema{
            type: :array,
            additionalProperties: false,
            items: %Schema{
              description: "A list of relevant patches that the upgrade covers.",
              additionalProperties: false,
              properties: %{
                advisory_type: %Schema{type: :string, description: "Advisory type"},
                advisory: %Schema{type: :string, description: "Advisory name for the patch"},
                synopsis: %Schema{type: :string, description: "Advisory synopsis for the patch"},
                issue_date: %Schema{type: :string, description: "Advisory issue date"},
                last_modified_date: %Schema{
                  type: :string,
                  description: "Advisory last modified date."
                }
              }
            },
            example: [
              %{
                advisory_type: "security_advisory",
                advisory: "SUSE-SU-2024:0001-1",
                synopsis: "Critical security update for OpenSSL",
                issue_date: "2024-01-15",
                last_modified_date: "2024-01-15"
              }
            ]
          }
        },
        example: %{
          package_id: 12345,
          patches: [
            %{
              advisory_type: "security_advisory",
              advisory: "SUSE-SU-2024:0001-1",
              synopsis: "Critical security update for OpenSSL",
              issue_date: "2024-01-15",
              last_modified_date: "2024-01-15"
            }
          ]
        }
      },
      struct?: false
    )
  end

  defmodule AvailableSoftwareUpdatesResponse do
    @moduledoc false
    OpenApiSpex.schema(
      %{
        title: "AvailableSoftwareUpdatesResponse",
        description: "Response returned from the available software updates endpoint.",
        type: :object,
        additionalProperties: false,
        properties: %{
          relevant_patches: %Schema{
            description: "A list relevant patches for the host.",
            type: :array,
            items: RelevantPatch,
            example: [
              %{
                id: 1234,
                advisory_name: "SUSE-SU-2024:0001-1",
                advisory_status: "stable",
                advisory_synopsis: "Critical security update for OpenSSL",
                advisory_type: "security_advisory",
                date: "2024-01-15",
                update_date: "2024-01-15"
              }
            ]
          },
          upgradable_packages: %Schema{
            description: "A list of upgradable packages for the host.",
            type: :array,
            items: UpgradablePackage,
            example: [
              %{
                arch: "x86_64",
                from_epoch: "0",
                from_release: "1.1",
                from_version: "1.0.0",
                name: "openssl",
                to_epoch: "0",
                to_package_id: 5678,
                to_release: "1.2",
                to_version: "1.1.1"
              }
            ]
          }
        },
        example: %{
          relevant_patches: [
            %{
              id: 1234,
              advisory_name: "SUSE-SU-2024:0001-1",
              advisory_status: "stable",
              advisory_synopsis: "Critical security update for OpenSSL",
              advisory_type: "security_advisory",
              date: "2024-01-15",
              update_date: "2024-01-15"
            }
          ],
          upgradable_packages: [
            %{
              arch: "x86_64",
              from_epoch: "0",
              from_release: "1.1",
              from_version: "1.0.0",
              name: "openssl",
              to_epoch: "0",
              to_package_id: 5678,
              to_release: "1.2",
              to_version: "1.1.1"
            }
          ]
        }
      },
      struct?: false
    )
  end

  defmodule PatchesForPackagesResponse do
    @moduledoc false
    OpenApiSpex.schema(
      %{
        title: "PatchesForPackagesResponse",
        description: "Response returned from the patches for packages endpoint.",
        type: :object,
        additionalProperties: false,
        example: %{
          patches: [
            %{
              package_id: 1234,
              patches: [
                %{
                  advisory_type: "security_advisory",
                  advisory: "SUSE-SU-2024:0001-1",
                  synopsis: "Critical security update for OpenSSL",
                  issue_date: "2024-01-15",
                  last_modified_date: "2024-01-15"
                }
              ]
            }
          ]
        },
        properties: %{
          patches: %Schema{
            description:
              "A list of the relevant patches covered by the provided package upgrades.",
            type: :array,
            items: PatchesForPackage,
            example: [
              %{
                package_id: 1234,
                patches: [
                  %{
                    advisory_type: "security_advisory",
                    advisory: "SUSE-SU-2024:0001-1",
                    synopsis: "Critical security update for OpenSSL",
                    issue_date: "2024-01-15",
                    last_modified_date: "2024-01-15"
                  }
                ]
              }
            ]
          }
        }
      },
      struct?: false
    )
  end

  defmodule ErrataDetails do
    @moduledoc false
    OpenApiSpex.schema(
      %{
        title: "ErrataDetails",
        description: "Details for the erratum matching the given advisory name.",
        type: :object,
        additionalProperties: false,
        properties: %{
          id: %Schema{type: :number, format: :int, description: "Advisory ID number"},
          issue_date: %Schema{
            type: :string,
            format: "date",
            description: "Advisory issue date."
          },
          update_date: %Schema{
            type: :string,
            format: "date",
            description: "Advisory update date."
          },
          last_modified_date: %Schema{
            type: :string,
            format: "date",
            description: "Advisory last modified date."
          },
          synopsis: %Schema{type: :string, description: "Advisory synopsis"},
          release: %Schema{type: :number, format: :int, description: "Advisory Release number"},
          advisory_status: %Schema{type: :string, description: "Advisory status"},
          vendor_advisory: %Schema{type: :string, description: "Vendor advisory"},
          type: %Schema{type: :string, description: "Advisory type"},
          product: %Schema{type: :string, description: "Advisory product"},
          errata_from: %Schema{type: :string, description: "Advisory errata"},
          topic: %Schema{type: :string, description: "Advisory topic"},
          description: %Schema{type: :string, description: "Advisory description"},
          references: %Schema{type: :string, description: "Advisory references"},
          notes: %Schema{type: :string, description: "Advisory notes"},
          solution: %Schema{type: :string, description: "Advisory solution"},
          reboot_suggested: %Schema{
            type: :boolean,
            description:
              "A boolean flag signaling whether a system reboot is advisable following the application of the errata. Typical example is upon kernel update."
          },
          restart_suggested: %Schema{
            type: :boolean,
            description:
              "A boolean flag signaling a weather reboot of the package manager is advisable following the application of the errata. This is commonly used to address update stack issues before proceeding with other updates."
          }
        },
        example: %{
          id: 12345,
          issue_date: "2024-01-15",
          update_date: "2024-01-15",
          last_modified_date: "2024-01-15",
          synopsis: "Critical security update for OpenSSL",
          release: 1,
          advisory_status: "stable",
          vendor_advisory: "SUSE-SU-2024:0001-1",
          type: "security_advisory",
          product: "SLES",
          errata_from: "security@suse.de",
          topic: "OpenSSL security update",
          description: "This update fixes critical security vulnerabilities in OpenSSL.",
          references: "https://bugzilla.suse.com/show_bug.cgi?id=123456",
          notes: "Please restart affected services after applying this update.",
          solution: "Run zypper patch to apply this update.",
          reboot_suggested: false,
          restart_suggested: true
        }
      },
      struct?: false
    )
  end

  defmodule CVEs do
    @moduledoc false
    OpenApiSpex.schema(
      %{
        title: "CVEs",
        description: "List of CVEs applicable to the errata with the given advisory name.",
        type: :array,
        additionalProperties: false,
        items: %Schema{
          description: "A fix for a publicly known security vulnerability.",
          type: :string
        },
        example: [
          "CVE-2024-1234",
          "CVE-2024-5678"
        ]
      },
      struct?: false
    )
  end

  defmodule AdvisoryFixes do
    @moduledoc false
    OpenApiSpex.schema(
      %{
        title: "AdvisoryFixes",
        description: "Response returned from the get advisory fixes endpoint.",
        type: :object,
        additionalProperties: %Schema{type: :string},
        example: %{
          "CVE-2024-1234" => "Fixed in OpenSSL 1.1.1w",
          "CVE-2024-5678" => "Fixed in OpenSSL 3.0.8"
        }
      },
      struct?: false
    )
  end

  defmodule AffectedPackages do
    @moduledoc false
    OpenApiSpex.schema(
      %{
        title: "AffectedPackages",
        description: "Response returned from the get affected packages endpoint.",
        type: :array,
        additionalProperties: false,
        items: %Schema{
          description: "Metadata for a package effected by an advisory.",
          type: :object,
          properties: %{
            name: %Schema{
              type: :string,
              description: "Package name."
            },
            arch_label: %Schema{
              type: :string,
              description: "Package architecture."
            },
            version: %Schema{
              type: :string,
              description: "Package upstream version."
            },
            release: %Schema{
              type: :string,
              description: "Package RPM release number."
            },
            epoch: %Schema{
              type: :string,
              description: "Package epoch number."
            }
          }
        },
        example: [
          %{
            name: "openssl",
            arch_label: "x86_64",
            version: "1.1.1",
            release: "1.2",
            epoch: "0"
          }
        ]
      },
      struct?: false
    )
  end

  defmodule AffectedSystems do
    @moduledoc false
    OpenApiSpex.schema(
      %{
        title: "AffectedSystems",
        description: "Response returned from the get affected systems endpoint.",
        type: :array,
        additionalProperties: false,
        items: %Schema{
          description: "Metadata for a system effected by an advisory.",
          type: :object,
          properties: %{
            name: %Schema{
              type: :string,
              description: "System name."
            }
          }
        },
        example: [
          %{
            name: "sap-host-01"
          },
          %{
            name: "sap-host-02"
          }
        ]
      },
      struct?: false
    )
  end

  defmodule ErrataDetailsResponse do
    @moduledoc false
    OpenApiSpex.schema(
      %{
        title: "ErrataDetailsResponse",
        description: "Response returned from the errata details endpoint.",
        type: :object,
        additionalProperties: false,
        properties: %{
          errata_details: ErrataDetails,
          cves: CVEs,
          fixes: AdvisoryFixes,
          affected_packages: AffectedPackages,
          affected_systems: AffectedSystems
        },
        example: %{
          errata_details: %{
            id: 12345,
            issue_date: "2024-01-15",
            update_date: "2024-01-15",
            last_modified_date: "2024-01-15",
            synopsis: "Important security update for kernel",
            release: 1,
            advisory_status: "stable",
            vendor_advisory: "SUSE-SU-2024:0001-1",
            type: "security",
            product: "SUSE Linux Enterprise Server 15 SP4",
            errata_from: "SUSE Security Team",
            topic: "Security update",
            description:
              "This update fixes several security vulnerabilities in the Linux kernel.",
            references: "https://www.suse.com/security/cve/CVE-2024-12345.html",
            notes: "Please reboot after installation",
            solution: "Install the updated packages",
            reboot_suggested: true,
            restart_suggested: false
          },
          cves: [
            "CVE-2024-12345",
            "CVE-2024-12346"
          ],
          fixes: %{
            "bsc#123456" => "Fix buffer overflow in network driver",
            "bsc#123457" => "Fix memory leak in filesystem driver"
          },
          affected_packages: [
            %{
              name: "kernel-default",
              arch_label: "x86_64",
              version: "5.14.21-150400.24.82.1",
              release: "1",
              epoch: "0"
            }
          ],
          affected_systems: [
            %{
              name: "sap-host-01"
            },
            %{
              name: "sap-host-02"
            }
          ]
        }
      },
      struct?: false
    )
  end
end
