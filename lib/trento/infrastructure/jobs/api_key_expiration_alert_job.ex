# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Infrastructure.Jobs.ApiKeyExpirationAlertJob do
  @moduledoc """
  Sends an alert when the API key is about to expire or expired.
  """

  use Trento.Infrastructure.Jobs.Worker,
    call: {Trento.Infrastructure.Alerting.Alerting, :notify_api_key_expiration}
end
