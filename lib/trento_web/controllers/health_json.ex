# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule TrentoWeb.HealthJSON do
  def health(%{health: health}), do: health
end
