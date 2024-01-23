defmodule Trento.Vault do
  @moduledoc """
  Configuration for Cloak Vault at startup
  """

  use Cloak.Vault, otp_app: :trento

  @impl GenServer
  def init(config) do
    config =
      Keyword.put(config, :ciphers,
        default: {
          Cloak.Ciphers.AES.GCM,
          tag: "AES.GCM.V1",
          key:
            Base.decode64!(
              System.get_env("SECRET_KEY_BASE") ||
                raise("""
                environment variable SECRET_KEY_BASE is missing.
                You can generate one by calling: mix phx.gen.secret
                """)
            )
        }
      )

    {:ok, config}
  end
end
