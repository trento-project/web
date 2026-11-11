# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Checks.FrequencyTest do
  use ExUnit.Case, async: true

  alias Trento.Checks.Frequency

  test "should list the allowed frequencies, from the most to the least frequent" do
    assert [
             %Frequency{value: 5, unit: :minute},
             %Frequency{value: 15, unit: :minute},
             %Frequency{value: 30, unit: :minute},
             %Frequency{value: 1, unit: :hour},
             %Frequency{value: 6, unit: :hour},
             %Frequency{value: 12, unit: :hour},
             %Frequency{value: 24, unit: :hour},
             %Frequency{value: 1, unit: :week},
             %Frequency{value: 2, unit: :week},
             %Frequency{value: 4, unit: :week}
           ] == Frequency.allowed()
  end

  test "should default to every 5 minutes" do
    assert %Frequency{value: 5, unit: :minute} == Frequency.default()
  end

  describe "validation" do
    test "should accept the allowed frequencies" do
      for %Frequency{value: value, unit: unit} = frequency <- Frequency.allowed() do
        assert {:ok, frequency} == Frequency.new(%{value: value, unit: unit})
      end
    end

    test "should cast the values of a request" do
      assert {:ok, %Frequency{value: 6, unit: :hour}} ==
               Frequency.new(%{"value" => "6", "unit" => "hour"})
    end

    test "should refuse a value that is not allowed for its unit" do
      for {value, unit} <- [
            {1, :minute},
            {10, :minute},
            {60, :minute},
            {2, :hour},
            {48, :hour},
            {3, :week},
            {0, :week},
            {-5, :minute}
          ] do
        assert {:error, {:validation, %{value: [_]}}} =
                 Frequency.new(%{value: value, unit: unit})
      end
    end

    test "should refuse a saved value that is not allowed for a new unit" do
      changeset = Frequency.changeset(%Frequency{value: 1, unit: :hour}, %{unit: :minute})

      refute changeset.valid?

      assert [value: {"must be one of 5, 15, 30 when the unit is minute", _}] =
               changeset.errors
    end

    test "should refuse an unknown unit" do
      assert {:error, {:validation, %{unit: ["is invalid"]}}} =
               Frequency.new(%{value: 1, unit: :day})
    end

    test "should require a value and a unit" do
      assert {:error, {:validation, %{value: ["can't be blank"], unit: ["can't be blank"]}}} =
               Frequency.new(%{})
    end
  end

  describe "to_minutes/1" do
    test "should convert a frequency to minutes" do
      for {value, unit, minutes} <- [
            {5, :minute, 5},
            {15, :minute, 15},
            {30, :minute, 30},
            {1, :hour, 60},
            {6, :hour, 360},
            {12, :hour, 720},
            {24, :hour, 1_440},
            {1, :week, 10_080},
            {2, :week, 20_160},
            {4, :week, 40_320}
          ] do
        assert minutes == Frequency.to_minutes(%Frequency{value: value, unit: unit})
      end
    end
  end

  describe "parse/1" do
    test "should parse disabled" do
      assert {:ok, :disabled} == Frequency.parse("disabled")
    end

    test "should parse a missing value as no frequency" do
      assert {:ok, nil} == Frequency.parse(nil)
    end

    test "should parse the compact notation of the allowed frequencies" do
      for {notation, value, unit} <- [
            {"5m", 5, :minute},
            {"15m", 15, :minute},
            {"30m", 30, :minute},
            {"1h", 1, :hour},
            {"6h", 6, :hour},
            {"12h", 12, :hour},
            {"24h", 24, :hour},
            {"1w", 1, :week},
            {"2w", 2, :week},
            {"4w", 4, :week}
          ] do
        assert {:ok, %Frequency{value: value, unit: unit}} == Frequency.parse(notation)
      end
    end

    test "should parse a plain number of minutes matching an allowed frequency" do
      for {notation, value, unit} <- [
            {"5", 5, :minute},
            {"15", 15, :minute},
            {"30", 30, :minute},
            {"60", 1, :hour},
            {"360", 6, :hour},
            {"720", 12, :hour},
            {"1440", 24, :hour},
            {"10080", 1, :week},
            {"20160", 2, :week},
            {"40320", 4, :week}
          ] do
        assert {:ok, %Frequency{value: value, unit: unit}} == Frequency.parse(notation)
      end
    end

    test "should refuse anything else" do
      for notation <- [
            "",
            "7",
            "10",
            "0",
            "7m",
            "2h",
            "3w",
            "-5m",
            "5mm",
            "1d",
            "5 m",
            "1H",
            "Disabled",
            "never"
          ] do
        assert {:error, :invalid_frequency} == Frequency.parse(notation)
      end
    end
  end

  describe "format/1" do
    test "should write the compact notation of a frequency, which parse/1 reads back" do
      assert ~w(5m 15m 30m 1h 6h 12h 24h 1w 2w 4w) ==
               Enum.map(Frequency.allowed(), &Frequency.format/1)

      for frequency <- Frequency.allowed() do
        assert {:ok, frequency} == frequency |> Frequency.format() |> Frequency.parse()
      end
    end

    test "should write disabled, which parse/1 reads back" do
      assert {:ok, :disabled} == :disabled |> Frequency.format() |> Frequency.parse()
    end

    test "should list disabled and the compact notation of the allowed frequencies" do
      assert "disabled, 5m, 15m, 30m, 1h, 6h, 12h, 24h, 1w, 2w, 4w" ==
               Frequency.format_allowed()
    end
  end
end
