# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule TrentoWeb.OpenApi.Unversioned.ApiSpec do
  @moduledoc """
  OpenApi specification entry point for unversioned endpoints
  """

  use TrentoWeb.OpenApi.ApiSpec,
    api_version: "unversioned"
end
