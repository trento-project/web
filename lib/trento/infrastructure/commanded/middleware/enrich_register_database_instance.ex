defimpl Trento.Infrastructure.Commanded.Middleware.Enrichable,
  for: Trento.Databases.Commands.RegisterDatabaseInstance do
  @moduledoc """
  This enrichment protocol enriches the database instance system replication
  tier value if the instance is in a stopped state (or transitioning to stopped)
  and it is configured as secondary.
  This is a best-effort approach. If the active site is not in the already
  registered instances list or does not have a valid tier, the tier continues being nil.
  """

  alias Trento.Databases.Commands.RegisterDatabaseInstance

  alias Trento.Databases

  @spec enrich(RegisterDatabaseInstance.t(), map) :: {:ok, map}
  def enrich(
        %RegisterDatabaseInstance{
          database_id: database_id,
          system_replication_active_primary_site: primary_site,
          system_replication: "Secondary",
          system_replication_tier: nil
        } = command,
        _
      ) do
    detected_tier =
      database_id
      |> Databases.get_database_instances_by_id()
      |> Enum.find_value(fn %{
                              system_replication_site_id: site_id,
                              system_replication_tier: tier
                            } ->
        if site_id == primary_site and not is_nil(tier) do
          tier + 1
        end
      end)

    {:ok, %RegisterDatabaseInstance{command | system_replication_tier: detected_tier}}
  end

  def enrich(command, _), do: {:ok, command}
end
