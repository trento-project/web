defmodule Trento.Domain.Enums.Provider do
  @moduledoc """
  Type that represents the supported provider values by our agent.
  """

  use Trento.Support.Enum, values: [:azure, :aws, :gcp, :kvm, :nutanix, :unknown]
end
