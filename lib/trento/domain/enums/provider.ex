defmodule Trento.Domain.Enum.Provider do
  @moduledoc """
  Type that represents the supported provider values by our agent.
  """

  use Trento.Domain.Enum, values: [:azure, :aws, :gcp, :kvm, :nutanix, :default, :unknown]
end
