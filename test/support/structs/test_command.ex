defmodule TestCommand do
  @moduledoc false

  use TypedStruct

  typedstruct do
    field :id, String.t(), enforce: true
  end

  use Vex.Struct

  validates :id, uuid: true
end
