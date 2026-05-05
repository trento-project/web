# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule TrentoWeb.OpenApi.Unversioned.ApiSpec do
  @moduledoc """
  OpenApi specification entry point for unversioned endpoints
  """

  use TrentoWeb.OpenApi.ApiSpec,
    api_version: "unversioned"
end
