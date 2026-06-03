# `TrentoWeb.Plugs.ChartsDisabledPlug`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento_web/plugs/charts_disabled_plug.ex#L4)

  This plug acts as a barrier for the charts endpoint, return 501 for all the requests.

  The endpoints are accessible only if the ":trento, Trento.Charts, enabled" configuration entry is properly set.

  The plug itself is mounted only when the charts are disabled in the configuration.

---

*Consult [api-reference.md](api-reference.md) for complete listing*
