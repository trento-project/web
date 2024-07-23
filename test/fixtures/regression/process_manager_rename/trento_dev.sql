--
-- PostgreSQL database dump
--

-- Dumped from database version 15.7 (Debian 15.7-1.pgdg120+1)
-- Dumped by pg_dump version 16.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: trento_dev; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE trento_dev WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


ALTER DATABASE trento_dev OWNER TO postgres;

\connect trento_dev

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: application_instances; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.application_instances (
    sap_system_id uuid NOT NULL,
    host_id uuid NOT NULL,
    instance_number character varying(255) NOT NULL,
    instance_hostname character varying(255),
    sid character varying(255),
    features character varying(255),
    http_port integer,
    https_port integer,
    start_priority character varying(255),
    health character varying(255),
    absent_at timestamp without time zone,
    inserted_at timestamp without time zone DEFAULT '2024-07-23 08:09:26.532937'::timestamp without time zone NOT NULL,
    updated_at timestamp without time zone DEFAULT '2024-07-23 08:09:26.532937'::timestamp without time zone NOT NULL
);


ALTER TABLE public.application_instances OWNER TO postgres;

--
-- Name: clusters; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clusters (
    id uuid NOT NULL,
    name character varying(255),
    sid character varying(255),
    type character varying(255),
    selected_checks character varying(255)[],
    health character varying(255),
    details jsonb,
    checks_execution character varying(255),
    resources_number integer,
    hosts_number integer,
    provider character varying(255),
    deregistered_at timestamp without time zone,
    additional_sids character varying(255)[] DEFAULT ARRAY[]::character varying[],
    inserted_at timestamp without time zone DEFAULT '2024-07-23 08:09:26.532937'::timestamp without time zone NOT NULL,
    updated_at timestamp without time zone DEFAULT '2024-07-23 08:09:26.532937'::timestamp without time zone NOT NULL
);


ALTER TABLE public.clusters OWNER TO postgres;

--
-- Name: clusters_enrichment_data; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clusters_enrichment_data (
    cluster_id uuid NOT NULL,
    cib_last_written character varying(255),
    inserted_at timestamp without time zone DEFAULT '2024-07-23 08:09:26.532937'::timestamp without time zone NOT NULL,
    updated_at timestamp without time zone DEFAULT '2024-07-23 08:09:26.532937'::timestamp without time zone NOT NULL
);


ALTER TABLE public.clusters_enrichment_data OWNER TO postgres;

--
-- Name: database_instances; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.database_instances (
    database_id uuid NOT NULL,
    host_id uuid NOT NULL,
    instance_number character varying(255) NOT NULL,
    instance_hostname character varying(255),
    sid character varying(255),
    features character varying(255),
    http_port integer,
    https_port integer,
    start_priority character varying(255),
    health character varying(255),
    system_replication character varying(255),
    system_replication_status character varying(255),
    absent_at timestamp without time zone,
    inserted_at timestamp without time zone DEFAULT '2024-07-23 08:09:26.532937'::timestamp without time zone NOT NULL,
    updated_at timestamp without time zone DEFAULT '2024-07-23 08:09:26.532937'::timestamp without time zone NOT NULL
);


ALTER TABLE public.database_instances OWNER TO postgres;

--
-- Name: databases; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.databases (
    id uuid NOT NULL,
    sid character varying(255),
    health character varying(255),
    deregistered_at timestamp without time zone,
    inserted_at timestamp without time zone DEFAULT '2024-07-23 08:09:26.532937'::timestamp without time zone NOT NULL,
    updated_at timestamp without time zone DEFAULT '2024-07-23 08:09:26.532937'::timestamp without time zone NOT NULL,
    tenants jsonb
);


ALTER TABLE public.databases OWNER TO postgres;

--
-- Name: discarded_discovery_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.discarded_discovery_events (
    id bigint NOT NULL,
    payload jsonb,
    reason text,
    inserted_at timestamp without time zone DEFAULT '2024-07-23 08:09:26.532937'::timestamp without time zone NOT NULL,
    updated_at timestamp without time zone DEFAULT '2024-07-23 08:09:26.532937'::timestamp without time zone NOT NULL
);


ALTER TABLE public.discarded_discovery_events OWNER TO postgres;

--
-- Name: discarded_discovery_events_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.discarded_discovery_events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.discarded_discovery_events_id_seq OWNER TO postgres;

--
-- Name: discarded_discovery_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.discarded_discovery_events_id_seq OWNED BY public.discarded_discovery_events.id;


--
-- Name: discovery_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.discovery_events (
    id bigint NOT NULL,
    agent_id uuid,
    discovery_type character varying(255),
    payload jsonb,
    inserted_at timestamp without time zone DEFAULT '2024-07-23 08:09:26.532937'::timestamp without time zone NOT NULL,
    updated_at timestamp without time zone DEFAULT '2024-07-23 08:09:26.532937'::timestamp without time zone NOT NULL
);


ALTER TABLE public.discovery_events OWNER TO postgres;

--
-- Name: discovery_events_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.discovery_events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.discovery_events_id_seq OWNER TO postgres;

--
-- Name: discovery_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.discovery_events_id_seq OWNED BY public.discovery_events.id;


--
-- Name: fun_with_flags_toggles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fun_with_flags_toggles (
    id bigint NOT NULL,
    flag_name character varying(255) NOT NULL,
    gate_type character varying(255) NOT NULL,
    target character varying(255) NOT NULL,
    enabled boolean NOT NULL
);


ALTER TABLE public.fun_with_flags_toggles OWNER TO postgres;

--
-- Name: fun_with_flags_toggles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.fun_with_flags_toggles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.fun_with_flags_toggles_id_seq OWNER TO postgres;

--
-- Name: fun_with_flags_toggles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.fun_with_flags_toggles_id_seq OWNED BY public.fun_with_flags_toggles.id;


--
-- Name: heartbeats; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.heartbeats (
    agent_id character varying(255) NOT NULL,
    "timestamp" timestamp without time zone,
    inserted_at timestamp without time zone DEFAULT '2024-07-23 08:09:26.532937'::timestamp without time zone NOT NULL,
    updated_at timestamp without time zone DEFAULT '2024-07-23 08:09:26.532937'::timestamp without time zone NOT NULL
);


ALTER TABLE public.heartbeats OWNER TO postgres;

--
-- Name: hosts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hosts (
    id uuid NOT NULL,
    hostname character varying(255),
    ip_addresses character varying(255)[],
    agent_version character varying(255),
    heartbeat character varying(255),
    provider character varying(255),
    cluster_id uuid,
    provider_data jsonb,
    deregistered_at timestamp without time zone,
    selected_checks character varying(255)[] DEFAULT ARRAY[]::character varying[],
    saptune_status jsonb,
    health character varying(255),
    fully_qualified_domain_name character varying(255),
    inserted_at timestamp without time zone DEFAULT '2024-07-23 08:09:26.532937'::timestamp without time zone NOT NULL,
    updated_at timestamp without time zone DEFAULT '2024-07-23 08:09:26.532937'::timestamp without time zone NOT NULL
);


ALTER TABLE public.hosts OWNER TO postgres;

--
-- Name: projection_versions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.projection_versions (
    projection_name text NOT NULL,
    last_seen_event_number bigint,
    inserted_at timestamp without time zone DEFAULT '2024-07-23 08:09:26.532937'::timestamp without time zone NOT NULL,
    updated_at timestamp without time zone DEFAULT '2024-07-23 08:09:26.532937'::timestamp without time zone NOT NULL
);


ALTER TABLE public.projection_versions OWNER TO postgres;

--
-- Name: sap_systems; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sap_systems (
    id uuid NOT NULL,
    sid character varying(255),
    tenant character varying(255),
    db_host character varying(255),
    health character varying(255),
    deregistered_at timestamp without time zone,
    ensa_version character varying(255),
    inserted_at timestamp without time zone DEFAULT '2024-07-23 08:09:26.532937'::timestamp without time zone NOT NULL,
    updated_at timestamp without time zone DEFAULT '2024-07-23 08:09:26.532937'::timestamp without time zone NOT NULL,
    database_id uuid
);


ALTER TABLE public.sap_systems OWNER TO postgres;

--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


ALTER TABLE public.schema_migrations OWNER TO postgres;

--
-- Name: settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.settings (
    installation_settings_installation_id uuid,
    inserted_at timestamp without time zone DEFAULT '2024-07-23 08:09:26.532937'::timestamp without time zone NOT NULL,
    updated_at timestamp without time zone DEFAULT '2024-07-23 08:09:26.532937'::timestamp without time zone NOT NULL,
    id uuid NOT NULL,
    type character varying(255) NOT NULL,
    api_key_settings_jti uuid,
    api_key_settings_created_at timestamp without time zone,
    api_key_settings_expire_at timestamp without time zone,
    suse_manager_settings_url character varying(255),
    suse_manager_settings_username character varying(255),
    suse_manager_settings_password bytea,
    suse_manager_settings_ca_cert bytea,
    suse_manager_settings_ca_uploaded_at timestamp without time zone
);


ALTER TABLE public.settings OWNER TO postgres;

--
-- Name: sles_subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sles_subscriptions (
    host_id uuid NOT NULL,
    identifier character varying(255) NOT NULL,
    version character varying(255),
    arch character varying(255),
    status character varying(255),
    subscription_status character varying(255),
    type character varying(255),
    starts_at character varying(255),
    expires_at character varying(255),
    inserted_at timestamp without time zone DEFAULT '2024-07-23 08:09:26.532937'::timestamp without time zone NOT NULL,
    updated_at timestamp without time zone DEFAULT '2024-07-23 08:09:26.532937'::timestamp without time zone NOT NULL
);


ALTER TABLE public.sles_subscriptions OWNER TO postgres;

--
-- Name: software_updates_discovery_result; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.software_updates_discovery_result (
    host_id uuid NOT NULL,
    system_id character varying(255),
    relevant_patches jsonb,
    upgradable_packages jsonb,
    failure_reason character varying(255),
    inserted_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.software_updates_discovery_result OWNER TO postgres;

--
-- Name: tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tags (
    id bigint NOT NULL,
    value character varying(255),
    resource_id uuid,
    resource_type character varying(255),
    inserted_at timestamp without time zone DEFAULT '2024-07-23 08:09:26.532937'::timestamp without time zone NOT NULL,
    updated_at timestamp without time zone DEFAULT '2024-07-23 08:09:26.532937'::timestamp without time zone NOT NULL
);


ALTER TABLE public.tags OWNER TO postgres;

--
-- Name: tags_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tags_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tags_id_seq OWNER TO postgres;

--
-- Name: tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tags_id_seq OWNED BY public.tags.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    username character varying(255) NOT NULL,
    password_hash character varying(255),
    inserted_at timestamp without time zone DEFAULT '2024-07-23 08:09:26.532937'::timestamp without time zone NOT NULL,
    updated_at timestamp without time zone DEFAULT '2024-07-23 08:09:26.532937'::timestamp without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: discarded_discovery_events id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discarded_discovery_events ALTER COLUMN id SET DEFAULT nextval('public.discarded_discovery_events_id_seq'::regclass);


--
-- Name: discovery_events id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discovery_events ALTER COLUMN id SET DEFAULT nextval('public.discovery_events_id_seq'::regclass);


--
-- Name: fun_with_flags_toggles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fun_with_flags_toggles ALTER COLUMN id SET DEFAULT nextval('public.fun_with_flags_toggles_id_seq'::regclass);


--
-- Name: tags id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags ALTER COLUMN id SET DEFAULT nextval('public.tags_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: application_instances; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.application_instances (sap_system_id, host_id, instance_number, instance_hostname, sid, features, http_port, https_port, start_priority, health, absent_at, inserted_at, updated_at) FROM stdin;
\.


--
-- Data for Name: clusters; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clusters (id, name, sid, type, selected_checks, health, details, checks_execution, resources_number, hosts_number, provider, deregistered_at, additional_sids, inserted_at, updated_at) FROM stdin;
\.


--
-- Data for Name: clusters_enrichment_data; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clusters_enrichment_data (cluster_id, cib_last_written, inserted_at, updated_at) FROM stdin;
\.


--
-- Data for Name: database_instances; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.database_instances (database_id, host_id, instance_number, instance_hostname, sid, features, http_port, https_port, start_priority, health, system_replication, system_replication_status, absent_at, inserted_at, updated_at) FROM stdin;
\.


--
-- Data for Name: databases; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.databases (id, sid, health, deregistered_at, inserted_at, updated_at, tenants) FROM stdin;
\.


--
-- Data for Name: discarded_discovery_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.discarded_discovery_events (id, payload, reason, inserted_at, updated_at) FROM stdin;
\.


--
-- Data for Name: discovery_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.discovery_events (id, agent_id, discovery_type, payload, inserted_at, updated_at) FROM stdin;
1	9cd46919-5f19-59aa-993e-cf3736c71053	host_discovery	{"hostname": "vmhdbprd01", "cpu_count": 4, "os_version": "15-SP3", "ip_addresses": ["127.0.0.1", "::1", "10.80.1.11", "10.80.1.13", "fe80::20d:3aff:fe23:2c6b"], "socket_count": 1, "agent_version": "2.1.0", "total_memory_mb": 32107, "fully_qualified_domain_name": "vmhdbprd01.l15cqsinwnpu5gfyrf1r5l51fe.ax.internal.cloudapp.net"}	2024-07-23 08:10:21.857771	2024-07-23 08:10:21.857771
\.


--
-- Data for Name: fun_with_flags_toggles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fun_with_flags_toggles (id, flag_name, gate_type, target, enabled) FROM stdin;
\.


--
-- Data for Name: heartbeats; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.heartbeats (agent_id, "timestamp", inserted_at, updated_at) FROM stdin;
\.


--
-- Data for Name: hosts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.hosts (id, hostname, ip_addresses, agent_version, heartbeat, provider, cluster_id, provider_data, deregistered_at, selected_checks, saptune_status, health, fully_qualified_domain_name, inserted_at, updated_at) FROM stdin;
9cd46919-5f19-59aa-993e-cf3736c71053	vmhdbprd01	{10.80.1.11,10.80.1.13}	2.1.0	unknown	\N	\N	\N	\N	{}	\N	unknown	vmhdbprd01.l15cqsinwnpu5gfyrf1r5l51fe.ax.internal.cloudapp.net	2024-07-23 08:10:22.264165	2024-07-23 08:10:22.264165
\.


--
-- Data for Name: projection_versions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.projection_versions (projection_name, last_seen_event_number, inserted_at, updated_at) FROM stdin;
host_projector	1	2024-07-23 08:10:22.227934	2024-07-23 08:10:22.230343
\.


--
-- Data for Name: sap_systems; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sap_systems (id, sid, tenant, db_host, health, deregistered_at, ensa_version, inserted_at, updated_at, database_id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.schema_migrations (version, inserted_at) FROM stdin;
20211211133519	2024-07-23 08:09:25
20211212192656	2024-07-23 08:09:25
20211228124832	2024-07-23 08:09:25
20211228125531	2024-07-23 08:09:25
20220119193711	2024-07-23 08:09:25
20220129160042	2024-07-23 08:09:25
20220129161631	2024-07-23 08:09:25
20220209151154	2024-07-23 08:09:25
20220302090722	2024-07-23 08:09:25
20220302154246	2024-07-23 08:09:25
20220302161146	2024-07-23 08:09:26
20220303092533	2024-07-23 08:09:26
20220303092814	2024-07-23 08:09:26
20220303134205	2024-07-23 08:09:26
20220304084057	2024-07-23 08:09:26
20220308142241	2024-07-23 08:09:26
20220309094147	2024-07-23 08:09:26
20220311173044	2024-07-23 08:09:26
20220314130006	2024-07-23 08:09:26
20220315133348	2024-07-23 08:09:26
20220316140828	2024-07-23 08:09:26
20220320190026	2024-07-23 08:09:26
20220329101245	2024-07-23 08:09:26
20220331121957	2024-07-23 08:09:26
20220404142441	2024-07-23 08:09:26
20220405142819	2024-07-23 08:09:26
20220411084543	2024-07-23 08:09:26
20220420082408	2024-07-23 08:09:26
20220420122023	2024-07-23 08:09:26
20220518074335	2024-07-23 08:09:26
20220601162519	2024-07-23 08:09:26
20220729073320	2024-07-23 08:09:26
20230118130238	2024-07-23 08:09:26
20230123162618	2024-07-23 08:09:26
20230123162816	2024-07-23 08:09:26
20230123162928	2024-07-23 08:09:26
20230309094053	2024-07-23 08:09:26
20230323161309	2024-07-23 08:09:26
20230505124514	2024-07-23 08:09:26
20230509114833	2024-07-23 08:09:26
20230608105745	2024-07-23 08:09:26
20230613101433	2024-07-23 08:09:26
20230613102033	2024-07-23 08:09:26
20230616114036	2024-07-23 08:09:26
20230822144338	2024-07-23 08:09:26
20230822144348	2024-07-23 08:09:26
20230905141817	2024-07-23 08:09:26
20230926082236	2024-07-23 08:09:26
20240118164648	2024-07-23 08:09:26
20240130130617	2024-07-23 08:09:26
20240214153742	2024-07-23 08:09:26
20240221134250	2024-07-23 08:09:26
20240227102315	2024-07-23 08:09:26
20240319102315	2024-07-23 08:09:26
20240320152419	2024-07-23 08:09:26
20240321095516	2024-07-23 08:09:26
20240327074541	2024-07-23 08:09:26
20240404165703	2024-07-23 08:09:26
20240408112012	2024-07-23 08:09:26
20240408124205	2024-07-23 08:09:26
20240422105737	2024-07-23 08:09:26
20240502105156	2024-07-23 08:09:26
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.settings (installation_settings_installation_id, inserted_at, updated_at, id, type, api_key_settings_jti, api_key_settings_created_at, api_key_settings_expire_at, suse_manager_settings_url, suse_manager_settings_username, suse_manager_settings_password, suse_manager_settings_ca_cert, suse_manager_settings_ca_uploaded_at) FROM stdin;
b98efc75-e091-4ed7-bc86-7bda890e1f88	2024-07-23 08:09:26.532937	2024-07-23 08:09:26.532937	d471321c-e827-432b-a7e5-c1eb426c2552	installation_settings	\N	\N	\N	\N	\N	\N	\N	\N
\N	2024-07-23 08:09:42.43469	2024-07-23 08:09:42.43469	020ce43b-80b5-4a98-823e-79483a321ee0	api_key_settings	254167af-2223-4abc-ae85-243405a2b308	2024-07-23 08:09:42.40808	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: sles_subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sles_subscriptions (host_id, identifier, version, arch, status, subscription_status, type, starts_at, expires_at, inserted_at, updated_at) FROM stdin;
\.


--
-- Data for Name: software_updates_discovery_result; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.software_updates_discovery_result (host_id, system_id, relevant_patches, upgradable_packages, failure_reason, inserted_at, updated_at) FROM stdin;
\.


--
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tags (id, value, resource_id, resource_type, inserted_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, password_hash, inserted_at, updated_at) FROM stdin;
1	admin	$pbkdf2-sha512$100000$TzHbgSTdl1Etyd4/omY4Tg==$Tpb69r8HTh/9hbMxBfJClpC3os23P62IZ9IqyavYB+ITMRbn7oE5vOVgbLCzwq4TO7NbNSkm5GOFkendqQ0cew==	2024-07-23 08:09:42.39273	2024-07-23 08:09:42.39273
\.


--
-- Name: discarded_discovery_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.discarded_discovery_events_id_seq', 1, false);


--
-- Name: discovery_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.discovery_events_id_seq', 1, true);


--
-- Name: fun_with_flags_toggles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.fun_with_flags_toggles_id_seq', 1, false);


--
-- Name: tags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tags_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- Name: application_instances application_instances_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_instances
    ADD CONSTRAINT application_instances_pkey PRIMARY KEY (sap_system_id, host_id, instance_number);


--
-- Name: clusters_enrichment_data clusters_enrichment_data_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clusters_enrichment_data
    ADD CONSTRAINT clusters_enrichment_data_pkey PRIMARY KEY (cluster_id);


--
-- Name: clusters clusters_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clusters
    ADD CONSTRAINT clusters_pkey PRIMARY KEY (id);


--
-- Name: database_instances database_instances_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.database_instances
    ADD CONSTRAINT database_instances_pkey PRIMARY KEY (database_id, host_id, instance_number);


--
-- Name: databases databases_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.databases
    ADD CONSTRAINT databases_pkey PRIMARY KEY (id);


--
-- Name: discarded_discovery_events discarded_discovery_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discarded_discovery_events
    ADD CONSTRAINT discarded_discovery_events_pkey PRIMARY KEY (id);


--
-- Name: discovery_events discovery_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discovery_events
    ADD CONSTRAINT discovery_events_pkey PRIMARY KEY (id);


--
-- Name: fun_with_flags_toggles fun_with_flags_toggles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fun_with_flags_toggles
    ADD CONSTRAINT fun_with_flags_toggles_pkey PRIMARY KEY (id);


--
-- Name: heartbeats heartbeats_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.heartbeats
    ADD CONSTRAINT heartbeats_pkey PRIMARY KEY (agent_id);


--
-- Name: hosts hosts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hosts
    ADD CONSTRAINT hosts_pkey PRIMARY KEY (id);


--
-- Name: projection_versions projection_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projection_versions
    ADD CONSTRAINT projection_versions_pkey PRIMARY KEY (projection_name);


--
-- Name: sap_systems sap_systems_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sap_systems
    ADD CONSTRAINT sap_systems_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: sles_subscriptions sles_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sles_subscriptions
    ADD CONSTRAINT sles_subscriptions_pkey PRIMARY KEY (host_id, identifier);


--
-- Name: software_updates_discovery_result software_updates_discovery_result_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.software_updates_discovery_result
    ADD CONSTRAINT software_updates_discovery_result_pkey PRIMARY KEY (host_id);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: application_instances_host_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX application_instances_host_id_index ON public.application_instances USING btree (host_id);


--
-- Name: clusters_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX clusters_id_index ON public.clusters USING btree (id);


--
-- Name: database_instances_host_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX database_instances_host_id_index ON public.database_instances USING btree (host_id);


--
-- Name: databases_tenants; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX databases_tenants ON public.databases USING gin (tenants);


--
-- Name: fwf_flag_name_gate_target_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX fwf_flag_name_gate_target_idx ON public.fun_with_flags_toggles USING btree (flag_name, gate_type, target);


--
-- Name: settings_type_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX settings_type_index ON public.settings USING btree (type);


--
-- Name: sles_subscriptions_host_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sles_subscriptions_host_id_index ON public.sles_subscriptions USING btree (host_id);


--
-- Name: tags_value_resource_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX tags_value_resource_id_index ON public.tags USING btree (value, resource_id);


--
-- Name: users_username_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_username_index ON public.users USING btree (username);


--
-- PostgreSQL database dump complete
--

