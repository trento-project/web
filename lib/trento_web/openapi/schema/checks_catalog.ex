defmodule TrentoWeb.OpenApi.Schema.ChecksCatalog do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema

  alias TrentoWeb.OpenApi.Schema.Provider

  defmodule Check do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "Check",
      description: "An available check to be executed on the target infrastructure",
      type: :object,
      properties: %{
        sap_system_id: %Schema{type: :string, description: "Check ID", format: :uuid},
        name: %Schema{type: :string, description: "Check Name"},
        description: %Schema{type: :string, description: "Check Description"},
        remediation: %Schema{type: :string, description: "Check Remediation"},
        implementation: %Schema{type: :string, description: "Check Implementation"},
        labels: %Schema{type: :string, description: "Check Labels"},
        premium: %Schema{
          type: :boolean,
          description: "Indicates whether the current check is a Premium check"
        },
        group: %Schema{
          type: :string,
          description: "Check Group, available when requiring a Flat Catalog"
        },
        provider: Provider.SupportedProviders
      }
    })
  end

  defmodule FlatCatalog do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "FlatCatalog",
      description: "A flat list of the available Checks",
      type: :array,
      items: Check
    })
  end

  defmodule ChecksGroup do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "ChecksGroup",
      description: "A Group of related Checks (Corosync, Pacemaker ...)",
      type: :object,
      properties: %{
        group: %Schema{type: :string, description: "Group Name"},
        checks: FlatCatalog
      }
    })
  end

  defmodule ProviderCatalog do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "ProviderCatalog",
      description: "A Provider specific Catalog, and respective values",
      type: :object,
      properties: %{
        provider: %Schema{
          title: "ChecksProvider",
          type: :string,
          description:
            "The provider determining the values for the attached checks (azure, aws ...)",
          # ??
          enum: [:azure, :aws, :gcp, :unknown]
        },
        groups: %Schema{
          title: "ChecksGroups",
          description: "A list of ChecksGroup for the respective provider",
          type: :array,
          items: ChecksGroup
        }
      }
    })
  end

  defmodule GroupedCatalog do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "GroupedCatalog",
      description:
        "A list of available Checks: grouped by provider (azure, aws ...) and checks groups (Corosync, Pacemaker ...)",
      type: :array,
      items: ProviderCatalog
    })
  end

  defmodule Catalog do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "ChecksCatalog",
      description: "A representation of the Checks Catalog",
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
                  description: "Corosync `token` timeout is set to `5000`\n",
                  id: "156F64",
                  implementation:
                    "---\n\n- name: \"{{ name }}.check\"\n  lineinfile:\n    path: /etc/corosync/corosync.conf\n    regexp: '^(\\s+){{ key_name }}:'\n    line: \"\\t{{ key_name }}: {{ expected[name] }}\"\n    insertafter: 'totem {'\n  register: config_updated\n  when:\n    - ansible_check_mode\n\n- block:\n    - name: Post results\n      import_role:\n        name: post-results\n  when:\n    - ansible_check_mode\n  vars:\n    status: \"{{ config_updated is not changed }}\"",
                  labels: "generic",
                  name: "1.1.1",
                  premium: false,
                  remediation:
                    "## Abstract\nThe value of the Corosync `token` timeout is not set as recommended.\n\n## Remediation\n\nAdjust the corosync `token` timeout as recommended on the best practices, and reload the corosync configuration\n\n1. Set the correct `token` timeout in the totem session in the corosync config file `/etc/corosync/corosync.conf`. This action must be repeated in all nodes of the cluster.\n   ```\n   [...]\n   totem { \n          token: <timeout value> \n         }\n   [...]\n   ```   \n2. Reload the corosync configuration:\n   `crm corosync reload`\n\n## References\n- https://docs.microsoft.com/en-us/azure/virtual-machines/workloads/sap/high-availability-guide-suse-pacemaker\n"
                },
                %{
                  description: "Corosync is running with `token` timeout set to `5000`\n",
                  id: "53D035",
                  implementation:
                    "---\n\n- name: \"{{ name }}.check\"\n  shell: 'corosync-cmapctl | grep \"runtime.config.totem.token (u32) = \" | sed \"s/^.*= //\"'\n  check_mode: false\n  register: config_updated\n  changed_when: config_updated.stdout != expected['1.1.1']\n\n- block:\n    - name: Post results\n      import_role:\n        name: post-results\n  when:\n    - ansible_check_mode\n  vars:\n    status: \"{{ config_updated is not changed }}\"",
                  labels: "generic",
                  name: "1.1.1.runtime",
                  premium: false,
                  remediation:
                    "## Abstract\nThe runtime value of the Corosync `token` timeout is not set as recommended.\n\n## Remediation\n\nAdjust the corosync `token` timeout as recommended on the best practices, and reload the corosync configuration\n\n\n1. Set the correct `token` timeout in the totem session in the corosync config file `/etc/corosync/corosync.conf`. This action must be repeated in all nodes of the cluster.\n   ```\n   [...]\n   totem { \n          token: <timeout value> \n         }\n   [...]\n   ```   \n2. Reload the corosync configuration:\n   `crm corosync reload`\n\n## References\n- https://docs.microsoft.com/en-us/azure/virtual-machines/workloads/sap/high-availability-guide-suse-pacemaker\n"
                }
              ],
              group: "Corosync"
            },
            %{
              checks: [
                %{
                  description: "Fencing is enabled in the cluster attributes\n",
                  id: "205AF7",
                  implementation:
                    "---\n\n- name: \"{{ name }}.check\"\n  command: 'crm_attribute -t crm_config -G -n stonith-enabled --quiet'\n  check_mode: false\n  register: config_updated\n  changed_when: config_updated.stdout != expected[name]\n\n- block:\n    - name: Post results\n      import_role:\n        name: post-results\n  when:\n    - ansible_check_mode\n  vars:\n    status: \"{{ config_updated is not changed }}\"",
                  labels: "generic",
                  name: "1.2.1",
                  premium: false,
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
    })
  end

  defmodule CatalogNotfound do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "CatalogNotfound",
      description: "No Catalog was found for the provided query",
      type: :object,
      properties: %{
        error: %Schema{
          type: :string,
          enum: [:not_found]
        }
      },
      example: %{error: "not_found"}
    })
  end
end
