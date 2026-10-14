# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.EventStore do
  @moduledoc false

  use EventStore, otp_app: :trento
end
