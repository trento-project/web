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
-- Name: trento_eventstore_dev; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE trento_eventstore_dev WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


ALTER DATABASE trento_eventstore_dev OWNER TO postgres;

\connect trento_eventstore_dev

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
-- Name: event_store_delete(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.event_store_delete() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  message text;
BEGIN
  IF current_setting('eventstore.enable_hard_deletes', true) = 'on' OR
    current_setting('eventstore.reset', true) = 'on'
  THEN
    -- Allow DELETE
    RETURN OLD;
  ELSE
    -- Prevent DELETE
    message := 'EventStore: ' || TG_ARGV[0];

    RAISE EXCEPTION USING MESSAGE = message, ERRCODE = 'feature_not_supported';
  END IF;
END;
$$;


ALTER FUNCTION public.event_store_delete() OWNER TO postgres;

--
-- Name: event_store_exception(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.event_store_exception() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  message text;
BEGIN
  message := 'EventStore: ' || TG_ARGV[0];

  RAISE EXCEPTION USING MESSAGE = message;
END;
$$;


ALTER FUNCTION public.event_store_exception() OWNER TO postgres;

--
-- Name: notify_events(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.notify_events() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  old_stream_version bigint;
  channel text;
  payload text;
BEGIN
    -- Payload text contains:
    --  * `stream_uuid`
    --  * `stream_id`
    --  * first `stream_version`
    --  * last `stream_version`
    -- Each separated by a comma (e.g. 'stream-12345,1,1,5')

    IF TG_OP = 'UPDATE' THEN
      old_stream_version := OLD.stream_version + 1;
    ELSE
      old_stream_version := 1;
    END IF;

    channel := TG_TABLE_SCHEMA || '.events';
    payload := NEW.stream_uuid || ',' || NEW.stream_id || ',' || old_stream_version || ',' || NEW.stream_version;

    -- Notify events to listeners
    PERFORM pg_notify(channel, payload);

    RETURN NULL;
END;
$$;


ALTER FUNCTION public.notify_events() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.events (
    event_id uuid NOT NULL,
    event_type text NOT NULL,
    causation_id uuid,
    correlation_id uuid,
    data jsonb NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.events OWNER TO postgres;

--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.schema_migrations (
    major_version integer NOT NULL,
    minor_version integer NOT NULL,
    patch_version integer NOT NULL,
    migrated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.schema_migrations OWNER TO postgres;

--
-- Name: snapshots; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.snapshots (
    source_uuid text NOT NULL,
    source_version bigint NOT NULL,
    source_type text NOT NULL,
    data jsonb NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.snapshots OWNER TO postgres;

--
-- Name: stream_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stream_events (
    event_id uuid NOT NULL,
    stream_id bigint NOT NULL,
    stream_version bigint NOT NULL,
    original_stream_id bigint,
    original_stream_version bigint
);


ALTER TABLE public.stream_events OWNER TO postgres;

--
-- Name: streams; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.streams (
    stream_id bigint NOT NULL,
    stream_uuid text NOT NULL,
    stream_version bigint DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.streams OWNER TO postgres;

--
-- Name: streams_stream_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.streams_stream_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.streams_stream_id_seq OWNER TO postgres;

--
-- Name: streams_stream_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.streams_stream_id_seq OWNED BY public.streams.stream_id;


--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscriptions (
    subscription_id bigint NOT NULL,
    stream_uuid text NOT NULL,
    subscription_name text NOT NULL,
    last_seen bigint,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.subscriptions OWNER TO postgres;

--
-- Name: subscriptions_subscription_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.subscriptions_subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.subscriptions_subscription_id_seq OWNER TO postgres;

--
-- Name: subscriptions_subscription_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.subscriptions_subscription_id_seq OWNED BY public.subscriptions.subscription_id;


--
-- Name: streams stream_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.streams ALTER COLUMN stream_id SET DEFAULT nextval('public.streams_stream_id_seq'::regclass);


--
-- Name: subscriptions subscription_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions ALTER COLUMN subscription_id SET DEFAULT nextval('public.subscriptions_subscription_id_seq'::regclass);


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.events (event_id, event_type, causation_id, correlation_id, data, metadata, created_at) FROM stdin;
35b8d0e2-fb1a-4eb7-923f-a7e1ed589f04	Elixir.Trento.Hosts.Events.HostRegistered	5ef6d63d-4947-4598-8850-62b0d41ec2e0	5c81f7de-49a8-49d2-ad09-3056b2cc1fa2	{"health": null, "host_id": "9cd46919-5f19-59aa-993e-cf3736c71053", "version": 4, "hostname": "vmhdbprd01", "cpu_count": 4, "heartbeat": "unknown", "os_version": "15-SP3", "ip_addresses": ["10.80.1.11", "10.80.1.13"], "socket_count": 1, "agent_version": "2.1.0", "total_memory_mb": 32107, "installation_source": "unknown", "fully_qualified_domain_name": "vmhdbprd01.l15cqsinwnpu5gfyrf1r5l51fe.ax.internal.cloudapp.net"}	{}	2024-07-23 08:10:21.978494+00
332d66ed-a947-4d8e-8bbd-64ed2ef1f357	Elixir.Trento.Hosts.Events.SoftwareUpdatesDiscoveryRequested	5ef6d63d-4947-4598-8850-62b0d41ec2e0	5c81f7de-49a8-49d2-ad09-3056b2cc1fa2	{"host_id": "9cd46919-5f19-59aa-993e-cf3736c71053", "version": 1, "fully_qualified_domain_name": "vmhdbprd01.l15cqsinwnpu5gfyrf1r5l51fe.ax.internal.cloudapp.net"}	{}	2024-07-23 08:10:21.997606+00
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.schema_migrations (major_version, minor_version, patch_version, migrated_at) FROM stdin;
1	3	2	2024-07-23 08:09:39.285649+00
\.


--
-- Data for Name: snapshots; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.snapshots (source_uuid, source_version, source_type, data, metadata, created_at) FROM stdin;
"deregistration_process_manager"-"9cd46919-5f19-59aa-993e-cf3736c71053"	1	Elixir.Trento.DeregistrationProcessManager	{"cluster_id": null, "database_instances": [], "application_instances": []}	\N	2024-07-23 08:10:22.231113+00
\.


--
-- Data for Name: stream_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stream_events (event_id, stream_id, stream_version, original_stream_id, original_stream_version) FROM stdin;
35b8d0e2-fb1a-4eb7-923f-a7e1ed589f04	0	1	1	1
332d66ed-a947-4d8e-8bbd-64ed2ef1f357	0	2	1	2
35b8d0e2-fb1a-4eb7-923f-a7e1ed589f04	1	1	1	1
332d66ed-a947-4d8e-8bbd-64ed2ef1f357	1	2	1	2
\.


--
-- Data for Name: streams; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.streams (stream_id, stream_uuid, stream_version, created_at, deleted_at) FROM stdin;
0	$all	2	2024-07-23 08:09:39.285649+00	\N
1	9cd46919-5f19-59aa-993e-cf3736c71053	2	2024-07-23 08:10:22.013573+00	\N
\.


--
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscriptions (subscription_id, stream_uuid, subscription_name, last_seen, created_at) FROM stdin;
3	$all	database_deregistration_event_handler	2	2024-07-23 08:09:41.306434+00
10	$all	roll_up_event_handler	2	2024-07-23 08:09:41.315213+00
5	$all	stream_roll_up_event_handler	2	2024-07-23 08:09:41.307278+00
2	$all	alerts_event_handler	2	2024-07-23 08:09:41.306467+00
11	$all	sles_subscription_projector	2	2024-07-23 08:09:41.320901+00
8	$all	database_projector	2	2024-07-23 08:09:41.314622+00
6	$all	cluster_projector	2	2024-07-23 08:09:41.311857+00
4	$all	sap_system_database_health_event_handler	2	2024-07-23 08:09:41.308056+00
7	$all	sap_system_projector	2	2024-07-23 08:09:41.314542+00
12	$all	database_restore_event_handler	2	2024-07-23 08:09:41.320517+00
9	$all	software_updates_discovery_event_handler	2	2024-07-23 08:09:41.31494+00
13	$all	deregistration_process_manager	2	2024-07-23 08:09:41.326737+00
1	$all	host_projector	2	2024-07-23 08:09:41.306718+00
\.


--
-- Name: streams_stream_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.streams_stream_id_seq', 1, true);


--
-- Name: subscriptions_subscription_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.subscriptions_subscription_id_seq', 13, true);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (event_id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (major_version, minor_version, patch_version);


--
-- Name: snapshots snapshots_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.snapshots
    ADD CONSTRAINT snapshots_pkey PRIMARY KEY (source_uuid);


--
-- Name: stream_events stream_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stream_events
    ADD CONSTRAINT stream_events_pkey PRIMARY KEY (event_id, stream_id);


--
-- Name: streams streams_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.streams
    ADD CONSTRAINT streams_pkey PRIMARY KEY (stream_id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (subscription_id);


--
-- Name: ix_stream_events; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_stream_events ON public.stream_events USING btree (stream_id, stream_version);


--
-- Name: ix_streams_stream_uuid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_streams_stream_uuid ON public.streams USING btree (stream_uuid);


--
-- Name: ix_subscriptions_stream_uuid_subscription_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_subscriptions_stream_uuid_subscription_name ON public.subscriptions USING btree (stream_uuid, subscription_name);


--
-- Name: streams event_notification; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER event_notification AFTER INSERT OR UPDATE ON public.streams FOR EACH ROW EXECUTE FUNCTION public.notify_events();


--
-- Name: events no_delete_events; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER no_delete_events BEFORE DELETE ON public.events FOR EACH STATEMENT EXECUTE FUNCTION public.event_store_delete('Cannot delete events');


--
-- Name: stream_events no_delete_stream_events; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER no_delete_stream_events BEFORE DELETE ON public.stream_events FOR EACH STATEMENT EXECUTE FUNCTION public.event_store_delete('Cannot delete stream events');


--
-- Name: streams no_delete_streams; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER no_delete_streams BEFORE DELETE ON public.streams FOR EACH STATEMENT EXECUTE FUNCTION public.event_store_delete('Cannot delete streams');


--
-- Name: events no_update_events; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER no_update_events BEFORE UPDATE ON public.events FOR EACH STATEMENT EXECUTE FUNCTION public.event_store_exception('Cannot update events');


--
-- Name: stream_events no_update_stream_events; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER no_update_stream_events BEFORE UPDATE ON public.stream_events FOR EACH STATEMENT EXECUTE FUNCTION public.event_store_exception('Cannot update stream events');


--
-- Name: stream_events stream_events_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stream_events
    ADD CONSTRAINT stream_events_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(event_id);


--
-- Name: stream_events stream_events_original_stream_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stream_events
    ADD CONSTRAINT stream_events_original_stream_id_fkey FOREIGN KEY (original_stream_id) REFERENCES public.streams(stream_id);


--
-- Name: stream_events stream_events_stream_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stream_events
    ADD CONSTRAINT stream_events_stream_id_fkey FOREIGN KEY (stream_id) REFERENCES public.streams(stream_id);


--
-- PostgreSQL database dump complete
--

