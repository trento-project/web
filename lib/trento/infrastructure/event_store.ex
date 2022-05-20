defmodule Trento.EventStore do
  @moduledoc false

  use EventStore, otp_app: :trento, enable_hard_deletes: true
end
