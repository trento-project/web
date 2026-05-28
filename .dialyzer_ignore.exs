# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

[
  # keeping for reference
  # Dialyzer :call_without_opaque warnings for MapSet and Ecto.Multi are known false positives
  # in Elixir 1.19 / Erlang 28. These occur because Dialyzer manages to "peek" into the
  # internal representation of these opaque types (seeing them as maps or sets) and then
  # complains when they are passed back to functions expecting the opaque type.
  # The code follows all best practices and uses standard public APIs.
  # {"lib/trento/discovery/policies/cluster_policy.ex", :call_without_opaque},
  # {"lib/trento/heartbeats.ex", :call_without_opaque},
  # {"lib/trento/software_updates/discovery.ex", :call_without_opaque},
  # {"lib/trento/user_identities.ex", :call_without_opaque},
  # {"lib/trento/users.ex", :call_without_opaque},
  # {"deps/commanded_ecto_projections/lib/projections/ecto.ex", :call_without_opaque}
]
