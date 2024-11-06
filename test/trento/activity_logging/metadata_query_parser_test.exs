defmodule Trento.ActivityLog.MetadataQueryParserTest do
  @moduledoc false

  use ExUnit.Case

  alias Trento.ActivityLog.MetadataQueryParser

  @parse_succeed_cases [
    {"foo", "(@.** == \"foo\")"},
    {"  foo", "(@.** == \"foo\")"},
    {"foo  ", "(@.** == \"foo\")"},
    {"  foo  ", "(@.** == \"foo\")"},
    {"foo42", "(@.** == \"foo42\")"},
    {"foo_bar", "(@.** == \"foo_bar\")"},
    {"foo-bar", "(@.** == \"foo-bar\")"},
    {"foo-bar_baz42", "(@.** == \"foo-bar_baz42\")"},
    {"*foo-bar_baz42*", "(@.** like_regex \"^[a-zA-Z0-9_-]*foo-bar_baz42[a-zA-Z0-9_-]*$\")"},
    {"*foo*", "(@.** like_regex \"^[a-zA-Z0-9_-]*foo[a-zA-Z0-9_-]*$\")"},
    {"*foo", "(@.** like_regex \"^[a-zA-Z0-9_-]*foo$\")"},
    {"foo*", "(@.** starts with \"foo\")"},
    {"foo bar", "((@.** == \"foo\") || (@.** == \"bar\"))"},
    {"foo AND bar", "((@.** == \"foo\") && (@.** == \"bar\"))"},
    {"foo OR bar", "((@.** == \"foo\") || (@.** == \"bar\"))"},
    {"foo AND bar AND baz", "((@.** == \"foo\") && (@.** == \"bar\") && (@.** == \"baz\"))"},
    {"foo AND bar OR baz", "((@.** == \"foo\") && (@.** == \"bar\") || (@.** == \"baz\"))"},
    {"foo OR bar AND baz", "((@.** == \"foo\") || (@.** == \"bar\") && (@.** == \"baz\"))"},
    {"foo bar OR baz", "((@.** == \"foo\") || (@.** == \"bar\") || (@.** == \"baz\"))"},
    {"foo OR bar baz", "((@.** == \"foo\") || (@.** == \"bar\") || (@.** == \"baz\"))"},
    {"foo bar baz", "((@.** == \"foo\") || (@.** == \"bar\") || (@.** == \"baz\"))"},
    {"==20", "(@.** == 20)"},
    {">20", "(@.** > 20)"},
    {"<20", "(@.** < 20)"},
    {"!=20", "(@.** != 20)"},
    {">3 AND <5", "((@.** > 3) && (@.** < 5))"},
    {"!=5 AND !=20", "((@.** != 5) && (@.** != 20))"},
    {"==5 OR ==20", "((@.** == 5) || (@.** == 20))"},
    {"<3 OR >5", "((@.** < 3) || (@.** > 5))"},
    {"<3 >5 !=42", "((@.** < 3) || (@.** > 5) || (@.** != 42))"}
  ]

  @parse_fail_cases [
    "",
    "    ",
    "foo;;",
    "foo$",
    "foo;; SELECT 1;;",
    ">42;;SELECT 1;;"
  ]
  describe "Metadata query parsing into Jsonpath expressions" do
    test "Should parse successfully." do
      for {test_case, expected_parse} <- @parse_succeed_cases do
        assert {:ok, parsed_string} = MetadataQueryParser.parse(test_case)

        assert parsed_string == expected_parse
      end
    end

    test "Should not parse successfully" do
      for test_case <- @parse_fail_cases do
        assert {:error, _reason, _trimmed_search_string} = MetadataQueryParser.parse(test_case)
      end
    end
  end
end
