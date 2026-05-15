# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defimpl AgenticRuntime.Scope, for: Trento.Users.User do
  def owner_id(%Trento.Users.User{id: id}), do: id
end
