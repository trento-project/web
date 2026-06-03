# `Trento.Charts.ChartTimeSeries`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/charts/chart_time_series.ex#L4)

 Represents a time series of a chart
 The series has a label and the samples distributed through time

# `t`

```elixir
@type t() :: %Trento.Charts.ChartTimeSeries{
  label: String.t(),
  series: [Trento.Charts.ChartTimeSeriesSample.t()]
}
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*
