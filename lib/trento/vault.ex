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
            Base.decode64!(Application.fetch_env!(:trento, TrentoWeb.Endpoint)[:secret_key_base]),
          iv_length: 12
        }
      )

    {:ok, config}
  end
end
