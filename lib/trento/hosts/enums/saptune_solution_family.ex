# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Hosts.Enums.SaptuneSolutionFamily do
  @moduledoc """
  Family of Saptune solutions. The solution applied in a host depends on the family
  and the SAP workload running in the host.

  netweaver applies HANA, NETWEAVER or NETWEAVER+HANA, and s4hana applies S4HANA-DBSERVER,
  S4HANA-APPSERVER or S4HANA-APP+DB.
  """

  use Trento.Support.Enum, values: [:netweaver, :s4hana]
end
