# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.AI.ControllerSpecsTest do
  @moduledoc """
  Sanity tests for the `ai_tool/2` macro's `@on_definition` binding —
  uses synthetic controllers defined inside the test module.
  """
  use ExUnit.Case, async: true

  defmodule BindsNextDef do
    use Trento.AI.ControllerSpecs

    ai_tool :foo, display_text: "Foo"
    def bar(_), do: :ok

    def baz(_), do: :ok
  end

  defmodule SkipsPrivateDef do
    use Trento.AI.ControllerSpecs

    ai_tool :public_tool
    defp helper(arg), do: arg
    def public_action(arg), do: helper(arg)
  end

  defmodule MultipleOverrides do
    use Trento.AI.ControllerSpecs

    ai_tool :first, display_text: "First"
    def first_action(_), do: :ok

    ai_tool :second
    def second_action(_), do: :ok
  end

  defmodule NoOverrides do
    use Trento.AI.ControllerSpecs

    def something(_), do: :ok
  end

  describe "ai_tool/2 @on_definition binding" do
    test "binds the tool name to the action of the next public def" do
      assert BindsNextDef.__ai_tool__(:bar) == %{name: "foo", display_text: "Foo"}
    end

    test "does NOT propagate the binding to subsequent defs" do
      assert BindsNextDef.__ai_tool__(:baz) == %{}
    end

    test "ignores intervening defp (binding sticks to next public def)" do
      assert SkipsPrivateDef.__ai_tool__(:helper) == %{}
      assert SkipsPrivateDef.__ai_tool__(:public_action) == %{name: "public_tool"}
    end

    test "records distinct overrides for each ai_tool/def pair" do
      assert MultipleOverrides.__ai_tool__(:first_action) ==
               %{name: "first", display_text: "First"}

      assert MultipleOverrides.__ai_tool__(:second_action) == %{name: "second"}
    end

    test "returns empty map for actions with no override" do
      assert NoOverrides.__ai_tool__(:something) == %{}
      assert NoOverrides.__ai_tool__(:nonexistent) == %{}
    end
  end
end
