defmodule Trento.Hosts.Enums.Architecture do
  @moduledoc """
  Type that represents the supported architectures by our agent.
  """

  use Trento.Support.Enum, values: [:x86_64, :ppc64le, :s390x, :unknown]
end
