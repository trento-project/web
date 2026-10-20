# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Infrastructure.SSO do
  @moduledoc """
  Provides a set of functions related to SSO (Single Sign On).
  """

  defdelegate enabled?(), to: Trento.Infrastructure.SSO.Config, as: :sso_enabled?
end
