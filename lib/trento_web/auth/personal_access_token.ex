defmodule TrentoWeb.Auth.PersonalAccessToken do
  @moduledoc """
  PersonalAccessToken represents a users' generated token.
  """

  @aud "trento_pat"

  @spec aud :: String.t()
  def aud, do: @aud

  def generate! do
    @aud
    |> Kernel.<>("_")
    |> Kernel.<>(
      64
      |> :crypto.strong_rand_bytes()
      |> Base.url_encode64(padding: false)
    )
  end
end
