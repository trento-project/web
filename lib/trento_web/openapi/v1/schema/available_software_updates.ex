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
        description:
          "Represents a software package that can be upgraded to a newer version, including relevant metadata for update management.",
        type: :object,
        additionalProperties: false,
        properties: %{
          arch: %Schema{
            type: :string,
            description:
              "Specifies the architecture type for the upgradable package, such as x86_64 or arm64.",
            example: "x86_64"
          },
          from_epoch: %Schema{
            type: :string,
            description:
              "Indicates the epoch value from which the package is being upgraded, used for version control.",
            example: "0"
          },
          from_release: %Schema{
            type: :string,
            description:
              "Shows the release version from which the package is being upgraded, aiding in update tracking.",
            example: "1.1"
          },
          from_version: %Schema{
            type: :string,
            description:
              "Displays the version number from which the package is being upgraded, providing historical context.",
            example: "1.0.0"
          },
          name: %Schema{
            type: :string,
            description:
              "The name of the software package that is eligible for upgrade, used for identification and management.",
            example: "openssl"
          },
          to_epoch: %Schema{
            type: :string,
            description:
              "Indicates the epoch value to which the package will be upgraded, supporting version management.",
            example: "0"
          },
          to_package_id: %Schema{
            type: :integer,
            description:
              "Unique identifier for the package version being upgraded to, used for tracking updates.",
            example: 5678
          },
          to_release: %Schema{
            type: :string,
            description:
              "Shows the release version to which the package will be upgraded, aiding in update planning.",
            example: "1.2"
          },
          to_version: %Schema{
            type: :string,
            description:
              "Displays the version number to which the package will be upgraded, providing future context.",
            example: "1.1.1"
          }
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
        description:
          "Represents a software patch that is relevant to the current system or package, including details for update application.",
        type: :object,
        additionalProperties: false,
        properties: %{
          id: %Schema{
            type: :integer,
            description:
              "Unique identifier for the advisory associated with the patch, used for reference and management.",
            example: 1234
          },
          advisory_name: %Schema{
            type: :string,
            description:
              "The name of the advisory related to the patch, used for identification and compliance tracking.",
            example: "SUSE-SU-2024:0001-1"
          },
          advisory_status: %Schema{
            type: :string,
            description:
              "Indicates the current status of the advisory, such as stable, pending, or deprecated, for update management.",
            example: "stable"
          },
          advisory_synopsis: %Schema{
            type: :string,
            description:
              "Provides a brief summary of the advisory, outlining the main points and impact of the patch.",
            example: "Critical security update for OpenSSL"
          },
          advisory_type: %Schema{
            type: :string,
            description:
              "Specifies the type of advisory, such as security, bugfix, or enhancement, for classification purposes.",
            enum: AdvisoryType.values(),
            example: "security_advisory"
          },
          date: %Schema{
            type: :string,
            description:
              "The date when the advisory was issued, providing a timeline for patch application.",
            example: "2024-01-15"
          },
          update_date: %Schema{
            type: :string,
            description:
              "The date when the advisory was last updated, helping track changes and revisions over time.",
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
        description:
          "Details the relevant software patches that are included as part of a package upgrade, supporting system maintenance.",
        type: :object,
        additionalProperties: false,
        properties: %{
          package_id: %Schema{
            type: :integer,
            description:
              "Unique identifier for the package being upgraded, used for tracking and management."
          },
          patches: %Schema{
            type: :array,
            additionalProperties: false,
            items: %Schema{
              description:
                "A list containing all relevant software patches that are addressed by the current upgrade, supporting compliance and maintenance.",
              additionalProperties: false,
              properties: %{
                advisory_type: %Schema{
                  type: :string,
                  description:
                    "Specifies the type of advisory associated with the patch, such as security or bugfix."
                },
                advisory: %Schema{
                  type: :string,
                  description:
                    "The name of the advisory linked to the patch, used for identification and tracking."
                },
                synopsis: %Schema{
                  type: :string,
                  description:
                    "A brief summary of the advisory, outlining the main points and impact of the patch."
                },
                issue_date: %Schema{
                  type: :string,
                  description:
                    "The date when the advisory was issued, providing historical context for the patch."
                },
                last_modified_date: %Schema{
                  type: :string,
                  description:
                    "The date when the advisory was last modified, helping track updates and changes over time."
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
        description:
          "Represents the response returned from the available software updates endpoint, including details about upgradable packages and relevant patches.",
        type: :object,
        additionalProperties: false,
        properties: %{
          relevant_patches: %Schema{
            description:
              "A list containing all relevant software patches applicable to the host, supporting maintenance and compliance.",
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
            description:
              "A list containing all software packages on the host that are eligible for upgrade, supporting system updates.",
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
        description:
          "Represents the response returned from the patches for packages endpoint, detailing all relevant patches for upgraded packages.",
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
        description:
          "Provides detailed information for the erratum that matches the specified advisory name, supporting update management.",
        type: :object,
        additionalProperties: false,
        properties: %{
          id: %Schema{
            type: :number,
            format: :int,
            description: "Unique identifier for the advisory, used for reference and management."
          },
          issue_date: %Schema{
            type: :string,
            format: "date",
            description:
              "The date when the advisory was issued, providing historical context for the erratum."
          },
          update_date: %Schema{
            type: :string,
            format: "date",
            description:
              "The date when the advisory was last updated, helping track changes and revisions for the erratum."
          },
          last_modified_date: %Schema{
            type: :string,
            format: "date",
            description:
              "The date when the advisory was last modified, supporting update tracking for the erratum."
          },
          synopsis: %Schema{
            type: :string,
            description: "A brief summary of the advisory, outlining its main points and impact."
          },
          release: %Schema{
            type: :number,
            format: :int,
            description:
              "Indicates the release number associated with the advisory, supporting version tracking."
          },
          advisory_status: %Schema{
            type: :string,
            description:
              "Shows the current status of the advisory, such as stable or pending, for update management."
          },
          vendor_advisory: %Schema{
            type: :string,
            description:
              "Information provided by the vendor regarding the advisory, supporting compliance and tracking."
          },
          type: %Schema{
            type: :string,
            description:
              "Specifies the type of advisory, such as security or bugfix, for classification purposes."
          },
          product: %Schema{
            type: :string,
            description:
              "The product associated with the advisory, used for identification and management."
          },
          errata_from: %Schema{
            type: :string,
            description:
              "Indicates the source of the errata, supporting traceability and compliance."
          },
          topic: %Schema{
            type: :string,
            description:
              "The topic covered by the advisory, providing context for the update or fix."
          },
          description: %Schema{
            type: :string,
            description:
              "A detailed explanation of the advisory, outlining its purpose and impact."
          },
          references: %Schema{
            type: :string,
            description:
              "Lists references related to the advisory, supporting further research and validation."
          },
          notes: %Schema{
            type: :string,
            description:
              "Additional notes regarding the advisory, providing extra context or instructions."
          },
          solution: %Schema{
            type: :string,
            description:
              "Describes the recommended solution or remediation for the advisory, supporting resolution."
          },
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
        description:
          "Provides a list of CVEs that are applicable to the errata associated with the specified advisory name, supporting vulnerability management.",
        type: :array,
        additionalProperties: false,
        items: %Schema{
          description:
            "Represents a fix for a publicly known security vulnerability, including details for remediation and compliance.",
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
        description:
          "Represents the response returned from the get advisory fixes endpoint, detailing all fixes for advisories in the system.",
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
        description:
          "Represents the response returned from the get affected packages endpoint, listing all packages affected by advisories.",
        type: :array,
        additionalProperties: false,
        items: %Schema{
          description:
            "Provides metadata for a package affected by an advisory, supporting tracking and management of vulnerabilities.",
          type: :object,
          properties: %{
            name: %Schema{
              type: :string,
              description:
                "The name of the package affected by the advisory, used for identification and management."
            },
            arch_label: %Schema{
              type: :string,
              description:
                "Specifies the architecture of the affected package, such as x86_64 or arm64, for compatibility tracking."
            },
            version: %Schema{
              type: :string,
              description:
                "Displays the upstream version of the affected package, supporting version control and update planning."
            },
            release: %Schema{
              type: :string,
              description:
                "Indicates the RPM release number of the affected package, supporting package management and updates."
            },
            epoch: %Schema{
              type: :string,
              description:
                "Shows the epoch number of the affected package, supporting versioning and update tracking."
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
        description:
          "Represents the response returned from the get affected systems endpoint, listing all systems affected by advisories.",
        type: :array,
        additionalProperties: false,
        items: %Schema{
          description:
            "Provides metadata for a system affected by an advisory, supporting tracking and management of vulnerabilities.",
          type: :object,
          properties: %{
            name: %Schema{
              type: :string,
              description:
                "The name of the system affected by the advisory, used for identification and management."
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
        description:
          "Represents the response returned from the errata details endpoint, providing details about errata for advisories.",
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
