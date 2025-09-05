defmodule TrentoWeb.OpenApi.V1.Schema.ChecksCatalog do
  @moduledoc false

  require OpenApiSpex

  alias OpenApiSpex.Schema
  alias TrentoWeb.OpenApi.V1.Schema.Provider

  defmodule Check do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "Check",
        description:
          "Represents a check that can be executed on the target infrastructure, including its details, remediation, and implementation.",
        type: :object,
        additionalProperties: false,
        properties: %{
          id: %Schema{
            type: :string,
            description: "Unique identifier for the check, used for tracking and management.",
            format: :uuid,
            example: "123e4567-e89b-12d3-a456-426614174000"
          },
          name: %Schema{
            type: :string,
            description:
              "The name assigned to the check, used for identification and organization."
          },
          description: %Schema{
            type: :string,
            description:
              "A detailed explanation of what the check does and its purpose in the system."
          },
          remediation: %Schema{
            type: :string,
            description:
              "Instructions or steps to remediate issues found by the check, supporting resolution and compliance."
          },
          implementation: %Schema{
            type: :string,
            description:
              "Details about how the check is implemented, including scripts or logic used for execution."
          },
          labels: %Schema{
            type: :string,
            description:
              "Labels associated with the check, used for categorization and filtering in the catalog."
          },
          premium: %Schema{
            type: :boolean,
            description:
              "Shows whether the check is considered a Premium check, which may require additional licensing or access.",
            deprecated: true
          },
          group: %Schema{
            type: :string,
            description:
              "The group to which the check belongs, used for organization and filtering in flat catalogs."
          },
          provider: Provider.SupportedProviders
        }
      },
      struct?: false
    )
  end

  defmodule FlatCatalog do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "FlatCatalog",
        description:
          "A flat list containing all available checks, supporting direct access and management without grouping.",
        type: :array,
        items: Check
      },
      struct?: false
    )
  end

  defmodule ChecksGroup do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "ChecksGroup",
        description:
          "Represents a group of related checks, such as Corosync or Pacemaker, supporting organization and management.",
        additionalProperties: false,
        type: :object,
        properties: %{
          group: %Schema{
            type: :string,
            description:
              "The name of the group containing related checks, used for identification and organization."
          },
          checks: FlatCatalog
        }
      },
      struct?: false
    )
  end

  defmodule ProviderCatalog do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "ProviderCatalog",
        description:
          "Represents a provider-specific catalog, including all relevant checks and their values for that provider.",
        additionalProperties: false,
        type: :object,
        properties: %{
          provider: %Schema{
            title: "ChecksProvider",
            type: :string,
            description:
              "Specifies the provider that determines the values for the attached checks, such as Azure, AWS, or GCP.",
            enum: [:azure, :aws, :gcp, :default]
          },
          groups: %Schema{
            title: "ChecksGroups",
            description:
              "A list containing all check groups for the respective provider, supporting organization and management.",
            type: :array,
            items: ChecksGroup
          }
        }
      },
      struct?: false
    )
  end

  defmodule GroupedCatalog do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "GroupedCatalog",
        description:
          "A list of available checks grouped by provider (such as Azure or AWS) and by check groups (such as Corosync or Pacemaker).",
        type: :array,
        items: ProviderCatalog
      },
      struct?: false
    )
  end

  defmodule Catalog do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "ChecksCatalog",
        description:
          "Represents the full checks catalog, including all available checks and their organization for the system.",
        oneOf: [
          GroupedCatalog,
          FlatCatalog
        ],
        example: [
          %{
            groups: [
              %{
                checks: [
                  %{
                    description: "Corosync `token` timeout is set to `5000`\n.",
                    id: "156F64",
                    implementation:
                      "---\n\n- name: \"{{ name }}.check\"\n  lineinfile:\n    path: /etc/corosync/corosync.conf\n    regexp: '^(\\s+){{ key_name }}:'\n    line: \"\\t{{ key_name }}: {{ expected[name] }}\"\n    insertafter: 'totem {'\n  register: config_updated\n  when:\n    - ansible_check_mode\n\n- block:\n    - name: Post results\n      import_role:\n        name: post-results\n  when:\n    - ansible_check_mode\n  vars:\n    status: \"{{ config_updated is not changed }}\"",
                    labels: "generic",
                    name: "1.1.1",
                    remediation:
                      "## Abstract\nThe value of the Corosync `token` timeout is not set as recommended.\n\n## Remediation\n\nAdjust the corosync `token` timeout as recommended on the best practices, and reload the corosync configuration\n\n1. Set the correct `token` timeout in the totem session in the corosync config file `/etc/corosync/corosync.conf`. This action must be repeated in all nodes of the cluster.\n   ```\n   [...]\n   totem { \n          token: <timeout value> \n         }\n   [...]\n   ```   \n2. Reload the corosync configuration:\n   `crm corosync reload`\n\n## References\n- https://docs.microsoft.com/en-us/azure/virtual-machines/workloads/sap/high-availability-guide-suse-pacemaker\n"
                  },
                  %{
                    description: "Corosync is running with `token` timeout set to `5000`\n.",
                    id: "53D035",
                    implementation:
                      "---\n\n- name: \"{{ name }}.check\"\n  shell: 'corosync-cmapctl | grep \"runtime.config.totem.token (u32) = \" | sed \"s/^.*= //\"'\n  check_mode: false\n  register: config_updated\n  changed_when: config_updated.stdout != expected['1.1.1']\n\n- block:\n    - name: Post results\n      import_role:\n        name: post-results\n  when:\n    - ansible_check_mode\n  vars:\n    status: \"{{ config_updated is not changed }}\"",
                    labels: "generic",
                    name: "1.1.1.runtime",
                    remediation:
                      "## Abstract\nThe runtime value of the Corosync `token` timeout is not set as recommended.\n\n## Remediation\n\nAdjust the corosync `token` timeout as recommended on the best practices, and reload the corosync configuration\n\n\n1. Set the correct `token` timeout in the totem session in the corosync config file `/etc/corosync/corosync.conf`. This action must be repeated in all nodes of the cluster.\n   ```\n   [...]\n   totem { \n          token: <timeout value> \n         }\n   [...]\n   ```   \n2. Reload the corosync configuration:\n   `crm corosync reload`\n\n## References\n- https://docs.microsoft.com/en-us/azure/virtual-machines/workloads/sap/high-availability-guide-suse-pacemaker\n"
                  }
                ],
                group: "Corosync"
              },
              %{
                checks: [
                  %{
                    description: "Fencing is enabled in the cluster attributes\n.",
                    id: "205AF7",
                    implementation:
                      "---\n\n- name: \"{{ name }}.check\"\n  command: 'crm_attribute -t crm_config -G -n stonith-enabled --quiet'\n  check_mode: false\n  register: config_updated\n  changed_when: config_updated.stdout != expected[name]\n\n- block:\n    - name: Post results\n      import_role:\n        name: post-results\n  when:\n    - ansible_check_mode\n  vars:\n    status: \"{{ config_updated is not changed }}\"",
                    labels: "generic",
                    name: "1.2.1",
                    remediation:
                      "## Abstract\nFencing is mandatory to guarantee data integrity for your SAP Applications.\nRunning a HA Cluster without fencing is not supported and might cause data loss.\n\n## Remediation\nExecute the following command to enable it:\n```\ncrm configure property stonith-enabled=true\n```\n\n## References\n- https://documentation.suse.com/sle-ha/15-SP3/html/SLE-HA-all/cha-ha-fencing.html#sec-ha-fencing-recommend\n"
                  }
                ],
                group: "Pacemaker"
              }
            ],
            provider: "aws"
          }
        ]
      },
      struct?: false
    )
  end

  defmodule CatalogNotfound do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "CatalogNotfound",
        description:
          "Indicates that no catalog was found for the provided query, supporting error handling and troubleshooting.",
        additionalProperties: false,
        type: :object,
        properties: %{
          error: %Schema{
            type: :string,
            enum: [:not_found]
          }
        },
        example: %{error: "not_found"}
      },
      struct?: false
    )
  end

  defmodule UnableToLoadCatalog do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "UnableToLoadCatalog",
        description:
          "Indicates that an error occurred while loading the catalog, such as the catalog not being ready or another issue.",
        additionalProperties: false,
        type: :object,
        properties: %{
          error: %Schema{
            type: :string,
            description:
              "A message describing the error encountered while loading the catalog, supporting troubleshooting."
          }
        },
        example: %{error: "(not_ready|some other error message)"}
      },
      struct?: false
    )
  end
end
