defmodule Trento.Infrastructure.Prometheus.PromQL do
  @moduledoc """
  PromQL query manipulation utilities.

  Provides functions to inject labels into PromQL expressions using a
  character-level scanner, without relying on regex.
  """

  # PromQL reserved words that should not be treated as metric names.
  # Functions (rate, irate, sum, etc.) are already handled by the ident+(
  # rule in the tokenizer, but we include them here as a safety net.
  #
  # Source: https://github.com/prometheus/prometheus/blob/main/promql/parser/lex.go
  #         https://github.com/prometheus/prometheus/blob/main/promql/parser/functions.go

  # Keywords from lex.go
  @keywords ~w(and or unless offset by without on ignoring group_left group_right bool atan2 smoothed anchored fill fill_left fill_right start end step range)

  # Aggregation operators from lex.go
  @aggregation_operators ~w(sum avg count min max group stddev stdvar topk bottomk count_values quantile limitk limit_ratio)

  # Functions from functions.go
  @functions ~w(abs absent absent_over_time acos acosh asin asinh atan atanh avg_over_time ceil changes clamp clamp_max clamp_min cos cosh count_over_time day_of_month day_of_week day_of_year days_in_month deg delta deriv double_exponential_smoothing exp first_over_time floor histogram_avg histogram_count histogram_fraction histogram_quantile histogram_quantiles histogram_stddev histogram_stdvar histogram_sum hour idelta increase info irate label_join label_replace last_over_time ln log2 log10 mad_over_time max_over_time min_over_time minute month pi predict_linear present_over_time quantile_over_time rad rate resets round scalar sgn sin sinh sort sort_by_label sort_by_label_desc sort_desc sqrt stddev_over_time stdvar_over_time sum_over_time tan tanh time timestamp ts_of_first_over_time ts_of_last_over_time ts_of_max_over_time ts_of_min_over_time vector year)

  @promql_keywords MapSet.new(@keywords ++ @aggregation_operators ++ @functions)

  # Keywords after which a parenthesized group contains label names, not metrics.
  @grouping_keywords MapSet.new(~w(by without on ignoring group_left group_right))

  @doc """
  Injects a label into a PromQL query, scoping all vector selectors.

  Strips any existing matcher for the given label name first, then injects
  `label_name="label_value"` into all vector selectors. Uses a character-level
  scanner for robustness.

  ## Examples

      iex> Trento.Infrastructure.Prometheus.PromQL.inject_label("up", "agentID", "host-123")
      "up{agentID=\\"host-123\\"}"

      iex> Trento.Infrastructure.Prometheus.PromQL.inject_label("up{job=\\"node\\"}", "agentID", "host-123")
      "up{agentID=\\"host-123\\",job=\\"node\\"}"
  """
  @spec inject_label(String.t(), String.t(), String.t()) :: String.t()
  def inject_label(query, label_name, label_value) do
    query
    |> scan_query([])
    |> inject_tokens(label_name, label_value, [])
    |> IO.iodata_to_binary()
  end

  # Tokenizer: walks the query string and produces a list of tokens.
  # Tokens: {:ident, name}, {:braces, inner}, {:lparen}, {:rparen},
  #         {:bracket, inner}, {:other, text}
  defp scan_query(<<>>, acc), do: Enum.reverse(acc)

  defp scan_query(<<c, _::binary>> = input, acc)
       when c in ?a..?z or c in ?A..?Z or c in [?_, ?:] do
    {ident, rest} = collect_ident(input, <<>>)

    # Check if this ident is actually a duration suffix (preceded by a digit)
    if duration_suffix?(ident, acc) do
      scan_query(rest, [{:other, ident} | acc])
    else
      scan_query(rest, [{:ident, ident} | acc])
    end
  end

  defp scan_query(<<"{", rest::binary>>, acc) do
    {inner, rest} = collect_braces(rest, <<>>)
    scan_query(rest, [{:braces, inner} | acc])
  end

  defp scan_query(<<"[", rest::binary>>, acc) do
    {inner, rest} = collect_brackets(rest, <<>>)
    scan_query(rest, [{:bracket, inner} | acc])
  end

  defp scan_query(<<"(", rest::binary>>, acc), do: scan_query(rest, [{:lparen} | acc])
  defp scan_query(<<")", rest::binary>>, acc), do: scan_query(rest, [{:rparen} | acc])

  defp scan_query(<<c, rest::binary>>, acc), do: scan_query(rest, [{:other, <<c>>} | acc])

  # An ident is a duration suffix if the previous non-whitespace token is a digit.
  # Handles cases like 5m, 1h, 30s, etc.
  defp duration_suffix?(_ident, []), do: false

  defp duration_suffix?(ident, [{:other, text} | rest]) do
    trimmed = String.trim_trailing(text)

    if trimmed == "" do
      duration_suffix?(ident, rest)
    else
      last_char = :binary.last(trimmed)
      last_char in ?0..?9 and valid_duration_unit?(ident)
    end
  end

  defp duration_suffix?(_ident, _acc), do: false

  @duration_units MapSet.new(~w(ms s m h d w y))
  defp valid_duration_unit?(ident), do: MapSet.member?(@duration_units, ident)

  defp collect_ident(<<c, rest::binary>>, acc)
       when c in ?a..?z or c in ?A..?Z or c in ?0..?9 or c in [?_, ?:] do
    collect_ident(rest, <<acc::binary, c>>)
  end

  defp collect_ident(rest, acc), do: {acc, rest}

  defp collect_braces(<<"}", rest::binary>>, acc), do: {acc, rest}
  defp collect_braces(<<>>, acc), do: {acc, <<>>}

  defp collect_braces(<<"\"", rest::binary>>, acc) do
    {str, rest} = collect_string(rest, <<>>)
    collect_braces(rest, <<acc::binary, "\"", str::binary, "\"">>)
  end

  defp collect_braces(<<c, rest::binary>>, acc), do: collect_braces(rest, <<acc::binary, c>>)

  defp collect_brackets(<<"]", rest::binary>>, acc), do: {acc, rest}
  defp collect_brackets(<<>>, acc), do: {acc, <<>>}
  defp collect_brackets(<<c, rest::binary>>, acc), do: collect_brackets(rest, <<acc::binary, c>>)

  defp collect_string(<<"\\\"", rest::binary>>, acc),
    do: collect_string(rest, <<acc::binary, "\\\"">>)

  defp collect_string(<<"\"", rest::binary>>, acc), do: {acc, rest}
  defp collect_string(<<c, rest::binary>>, acc), do: collect_string(rest, <<acc::binary, c>>)
  defp collect_string(<<>>, acc), do: {acc, <<>>}

  # Token rewriter: walks the token list and injects the label where needed.
  defp inject_tokens([], _label_name, _label_value, acc), do: Enum.reverse(acc)

  # ident followed by {labels} — inject into braces
  defp inject_tokens([{:ident, name}, {:braces, inner} | rest], label_name, label_value, acc) do
    new_inner = build_labels(inner, label_name, label_value)
    inject_tokens(rest, label_name, label_value, ["#{name}{#{new_inner}}" | acc])
  end

  # ident followed by ( — it's a function call, leave as-is
  defp inject_tokens([{:ident, name}, {:lparen} | rest], label_name, label_value, acc) do
    inject_tokens(rest, label_name, label_value, ["(" | [name | acc]])
  end

  # bare ident — inject {label="value"} unless it's a keyword
  defp inject_tokens([{:ident, name} | rest], label_name, label_value, acc) do
    if MapSet.member?(@promql_keywords, name) do
      # Grouping keywords (by, without, on, ignoring, group_left, group_right):
      # skip the following parenthesized group so label names aren't injected
      if MapSet.member?(@grouping_keywords, name) do
        {group_tokens, remaining} = consume_grouping_clause(rest)
        inject_tokens(remaining, label_name, label_value, group_tokens ++ [name | acc])
      else
        inject_tokens(rest, label_name, label_value, [name | acc])
      end
    else
      inject_tokens(rest, label_name, label_value, [
        "#{name}{#{label_name}=\"#{label_value}\"}" | acc
      ])
    end
  end

  defp inject_tokens([{:braces, inner} | rest], label_name, label_value, acc) do
    inject_tokens(rest, label_name, label_value, ["{#{inner}}" | acc])
  end

  defp inject_tokens([{:bracket, inner} | rest], label_name, label_value, acc) do
    inject_tokens(rest, label_name, label_value, ["[#{inner}]" | acc])
  end

  defp inject_tokens([{:lparen} | rest], label_name, label_value, acc) do
    inject_tokens(rest, label_name, label_value, ["(" | acc])
  end

  defp inject_tokens([{:rparen} | rest], label_name, label_value, acc) do
    inject_tokens(rest, label_name, label_value, [")" | acc])
  end

  defp inject_tokens([{:other, text} | rest], label_name, label_value, acc) do
    inject_tokens(rest, label_name, label_value, [text | acc])
  end

  # Consume optional whitespace + parenthesized group after grouping keywords.
  # Returns {tokens_to_prepend_reversed, remaining_tokens}.
  defp consume_grouping_clause(tokens) do
    {ws_tokens, rest} = consume_whitespace(tokens)

    case rest do
      [{:lparen} | after_paren] ->
        {group, remaining} = consume_until_rparen(after_paren, ["(" | ws_tokens])
        {group, remaining}

      _ ->
        {ws_tokens, rest}
    end
  end

  defp consume_whitespace([{:other, text} = token | rest]) do
    if String.trim(text) == "" do
      {ws, remaining} = consume_whitespace(rest)
      {[text | ws], remaining}
    else
      {[], [token | rest]}
    end
  end

  defp consume_whitespace(tokens), do: {[], tokens}

  # Consume tokens until matching ), emitting them as raw text (no injection).
  defp consume_until_rparen([], acc), do: {acc, []}

  defp consume_until_rparen([{:rparen} | rest], acc), do: {[")" | acc], rest}

  defp consume_until_rparen([{:ident, name} | rest], acc),
    do: consume_until_rparen(rest, [name | acc])

  defp consume_until_rparen([{:other, text} | rest], acc),
    do: consume_until_rparen(rest, [text | acc])

  defp consume_until_rparen([{:lparen} | rest], acc),
    do: consume_until_rparen(rest, ["(" | acc])

  defp consume_until_rparen([{:braces, inner} | rest], acc),
    do: consume_until_rparen(rest, ["{#{inner}}" | acc])

  defp consume_until_rparen([{:bracket, inner} | rest], acc),
    do: consume_until_rparen(rest, ["[#{inner}]" | acc])

  defp build_labels(inner, label_name, label_value) do
    label_matcher = "#{label_name}=\"#{label_value}\""
    cleaned = strip_label(inner, label_name)

    if cleaned == "" do
      label_matcher
    else
      "#{label_matcher},#{cleaned}"
    end
  end

  defp strip_label(inner, label_name) do
    inner
    |> scan_labels(label_name, [])
    |> Enum.join(",")
  end

  # Simple label scanner: splits on commas (respecting quoted strings) and
  # drops any label matcher whose key matches the given label name.
  defp scan_labels(<<>>, _label_name, acc), do: Enum.reverse(acc)

  defp scan_labels(input, label_name, acc) do
    input = String.trim_leading(input)

    case input do
      <<>> ->
        Enum.reverse(acc)

      <<",", rest::binary>> ->
        scan_labels(rest, label_name, acc)

      _ ->
        {label, rest} = collect_label(input, <<>>)
        label = String.trim(label)

        if label != "" and not String.starts_with?(label, label_name) do
          scan_labels(rest, label_name, [label | acc])
        else
          scan_labels(rest, label_name, acc)
        end
    end
  end

  defp collect_label(<<>>, acc), do: {acc, <<>>}
  defp collect_label(<<",", rest::binary>>, acc), do: {acc, rest}

  defp collect_label(<<"\"", rest::binary>>, acc) do
    {str, rest} = collect_string(rest, <<>>)
    collect_label(rest, <<acc::binary, "\"", str::binary, "\"">>)
  end

  defp collect_label(<<c, rest::binary>>, acc), do: collect_label(rest, <<acc::binary, c>>)
end
