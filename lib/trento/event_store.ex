# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.EventStore do
  @moduledoc false

  use EventStore, otp_app: :trento
end
