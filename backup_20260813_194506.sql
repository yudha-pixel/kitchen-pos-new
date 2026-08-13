--
-- PostgreSQL database dump
--

\restrict zj33ZpzYO5oVwTcK4eKPG8BMooEbbtBBXirzymVDFM2URNnJSujIP547asgo4y6

-- Dumped from database version 16.14 (Ubuntu 16.14-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.14 (Ubuntu 16.14-0ubuntu0.24.04.1)

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
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: app_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.app_settings (
    id uuid NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    card_style text DEFAULT 'rounded'::text NOT NULL,
    primary_color text DEFAULT 'blue'::text NOT NULL,
    theme_mode text DEFAULT 'light'::text NOT NULL,
    card_view text DEFAULT 'grid'::text NOT NULL,
    cart_position text DEFAULT 'right-sidebar'::text NOT NULL,
    layout_density text DEFAULT 'spacious'::text NOT NULL,
    auto_refresh boolean DEFAULT true NOT NULL,
    auto_report boolean DEFAULT true NOT NULL,
    backup_frequency text DEFAULT 'daily'::text NOT NULL,
    beverage_route text DEFAULT 'Bar Station'::text NOT NULL,
    currency text DEFAULT 'IDR'::text NOT NULL,
    default_cash_float double precision DEFAULT 500000 NOT NULL,
    dessert_route text DEFAULT 'KDS Display 1'::text NOT NULL,
    email_manager boolean DEFAULT true NOT NULL,
    main_course_route text DEFAULT 'KDS Display 1'::text NOT NULL,
    manager_pin text DEFAULT '1234'::text NOT NULL,
    min_stock_ingredient integer DEFAULT 10 NOT NULL,
    min_stock_menu integer DEFAULT 5 NOT NULL,
    notify_low_stock boolean DEFAULT true NOT NULL,
    paper_width text DEFAULT '80'::text NOT NULL,
    printer_type text DEFAULT 'bluetooth'::text NOT NULL,
    receipt_footer text DEFAULT 'Silakan datang kembali'::text NOT NULL,
    receipt_header text DEFAULT 'TERIMA KASIH'::text NOT NULL,
    require_cash_float text DEFAULT 'yes'::text NOT NULL,
    require_pin_delete boolean DEFAULT true NOT NULL,
    require_pin_discount boolean DEFAULT true NOT NULL,
    require_pin_refund boolean DEFAULT true NOT NULL,
    require_pin_void boolean DEFAULT true NOT NULL,
    require_reconciliation boolean DEFAULT true NOT NULL,
    service_charge double precision DEFAULT 0 NOT NULL,
    show_cash_comparison boolean DEFAULT true NOT NULL,
    show_cashier_name boolean DEFAULT true NOT NULL,
    show_estimation boolean DEFAULT true NOT NULL,
    show_logo boolean DEFAULT true NOT NULL,
    show_pos_warning boolean DEFAULT true NOT NULL,
    show_table_number boolean DEFAULT true NOT NULL,
    sound_notification boolean DEFAULT true NOT NULL,
    store_address text DEFAULT 'Jl. Contoh No. 123, Jakarta Selatan'::text NOT NULL,
    store_email text DEFAULT 'info@kitchenpos.com'::text NOT NULL,
    store_name text DEFAULT 'Kitchen POS Restaurant'::text NOT NULL,
    store_phone text DEFAULT '+62 21 1234 5678'::text NOT NULL,
    tax_rate double precision DEFAULT 10 NOT NULL,
    timezone text DEFAULT 'Asia/Jakarta'::text NOT NULL,
    web_base_url text DEFAULT 'http://localhost:3000'::text,
    admin_count integer DEFAULT 1 NOT NULL,
    cashier_count integer DEFAULT 2 NOT NULL,
    indoor_count integer DEFAULT 10 NOT NULL,
    outdoor_count integer DEFAULT 8 NOT NULL,
    qr_auto_generate boolean DEFAULT true NOT NULL,
    require_2fa boolean DEFAULT false NOT NULL,
    vip_count integer DEFAULT 4 NOT NULL,
    waiter_count integer DEFAULT 3 NOT NULL,
    areas jsonb DEFAULT '[{"id": "1", "name": "Indoor", "count": 10, "description": "Area dalam restoran"}, {"id": "2", "name": "Outdoor", "count": 8, "description": "Area luar restoran"}, {"id": "3", "name": "VIP", "count": 4, "description": "Area VIP khusus"}]'::jsonb,
    selforder_payment_methods jsonb DEFAULT '["cashier"]'::jsonb,
    selforder_routing text DEFAULT 'review'::text NOT NULL,
    default_login_redirect text DEFAULT '/apps'::text NOT NULL,
    selforder_payment_instructions jsonb DEFAULT '{}'::jsonb,
    auto_restock_enabled boolean DEFAULT false NOT NULL,
    launcher_background_mime_type text,
    launcher_background_path text
);


ALTER TABLE public.app_settings OWNER TO postgres;

--
-- Name: approval_workflows; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.approval_workflows (
    id uuid NOT NULL,
    name text NOT NULL,
    level integer NOT NULL,
    role_id uuid NOT NULL,
    role_name text NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.approval_workflows OWNER TO postgres;

--
-- Name: attendances; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attendances (
    id uuid NOT NULL,
    employee_id uuid NOT NULL,
    check_in_time timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    check_out_time timestamp(3) without time zone,
    photo_url text,
    location_lat double precision,
    location_lng double precision,
    location_address text,
    shift_type text,
    notes text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.attendances OWNER TO postgres;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id uuid NOT NULL,
    user_id uuid,
    action text NOT NULL,
    entity_type text NOT NULL,
    entity_id text,
    old_value jsonb,
    new_value jsonb,
    ip_address text,
    user_agent text,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id uuid NOT NULL,
    name text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    color text
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: category_printers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.category_printers (
    id uuid NOT NULL,
    category_id uuid NOT NULL,
    printer_id uuid NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.category_printers OWNER TO postgres;

--
-- Name: companies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.companies (
    id uuid NOT NULL,
    name text NOT NULL,
    logo_path text,
    logo_mime_type text,
    phone text,
    email text,
    website text,
    address text,
    tax_id text,
    company_registry text,
    timezone text DEFAULT 'Asia/Jakarta'::text NOT NULL,
    currency text DEFAULT 'IDR'::text NOT NULL,
    tax_rate double precision DEFAULT 10 NOT NULL,
    service_charge double precision DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.companies OWNER TO postgres;

--
-- Name: customer_order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_order_items (
    id uuid NOT NULL,
    order_id uuid NOT NULL,
    product_id uuid NOT NULL,
    quantity integer NOT NULL,
    price_at_time double precision NOT NULL,
    modifiers_applied jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.customer_order_items OWNER TO postgres;

--
-- Name: customer_orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_orders (
    id uuid NOT NULL,
    table_id uuid NOT NULL,
    customer_name text,
    total_amount double precision NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    payment_method text,
    payment_status text DEFAULT 'unpaid'::text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    payment_reference text,
    payment_verified_at timestamp(6) with time zone,
    payment_verified_by uuid
);


ALTER TABLE public.customer_orders OWNER TO postgres;

--
-- Name: customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customers (
    id uuid NOT NULL,
    name text NOT NULL,
    phone text NOT NULL,
    email text,
    tier text DEFAULT 'bronze'::text NOT NULL,
    points integer DEFAULT 0 NOT NULL,
    total_spent double precision DEFAULT 0 NOT NULL,
    discount_percentage double precision DEFAULT 5 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.customers OWNER TO postgres;

--
-- Name: database_backups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.database_backups (
    id uuid NOT NULL,
    filename text NOT NULL,
    file_path text NOT NULL,
    file_size bigint NOT NULL,
    backup_type text NOT NULL,
    status text DEFAULT 'completed'::text NOT NULL,
    created_by uuid,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    notes text
);


ALTER TABLE public.database_backups OWNER TO postgres;

--
-- Name: employees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employees (
    id uuid NOT NULL,
    name text NOT NULL,
    phone text NOT NULL,
    email text,
    "position" text NOT NULL,
    employment_type text DEFAULT 'permanent'::text NOT NULL,
    base_salary double precision DEFAULT 0 NOT NULL,
    hourly_rate double precision DEFAULT 0 NOT NULL,
    join_date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.employees OWNER TO postgres;

--
-- Name: goods_received_notes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.goods_received_notes (
    id uuid NOT NULL,
    grn_number text NOT NULL,
    purchase_order_id uuid NOT NULL,
    supplier_id uuid NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    received_date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    received_by uuid NOT NULL,
    received_by_name text NOT NULL,
    delivery_note text,
    quality_checked_by uuid,
    quality_checked_at timestamp(3) without time zone,
    quality_notes text
);


ALTER TABLE public.goods_received_notes OWNER TO postgres;

--
-- Name: grn_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.grn_items (
    id uuid NOT NULL,
    grn_id uuid NOT NULL,
    ingredient_id uuid NOT NULL,
    ingredient_name text NOT NULL,
    ordered_qty double precision NOT NULL,
    received_qty double precision NOT NULL,
    unit text NOT NULL,
    quality_status text DEFAULT 'pending'::text NOT NULL,
    rejection_reason text,
    batch_number text,
    expiry_date timestamp(3) without time zone,
    stock_updated boolean DEFAULT false NOT NULL
);


ALTER TABLE public.grn_items OWNER TO postgres;

--
-- Name: ingredient_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ingredient_categories (
    id uuid NOT NULL,
    name text NOT NULL,
    color text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.ingredient_categories OWNER TO postgres;

--
-- Name: ingredients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ingredients (
    id uuid NOT NULL,
    name text NOT NULL,
    current_stock double precision DEFAULT 0 NOT NULL,
    unit text NOT NULL,
    min_stock double precision DEFAULT 0 NOT NULL,
    unit_price double precision DEFAULT 0 NOT NULL,
    supplier_id uuid,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    warehouse_id uuid,
    restock_quantity double precision DEFAULT 0 NOT NULL,
    ad_hoc_price double precision DEFAULT 0,
    ad_hoc_supplier text,
    category_id uuid,
    barcode text,
    sku text,
    base_unit text,
    conversion_factor double precision DEFAULT 1,
    secondary_conversion_factor double precision DEFAULT 1,
    secondary_unit text
);


ALTER TABLE public.ingredients OWNER TO postgres;

--
-- Name: invoices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoices (
    id uuid NOT NULL,
    invoice_number text NOT NULL,
    grn_id uuid NOT NULL,
    supplier_id uuid NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    invoice_date timestamp(3) without time zone NOT NULL,
    due_date timestamp(3) without time zone NOT NULL,
    subtotal double precision NOT NULL,
    tax double precision DEFAULT 0 NOT NULL,
    total double precision NOT NULL,
    payment_terms text,
    notes text,
    verified_by uuid,
    verified_at timestamp(3) without time zone
);


ALTER TABLE public.invoices OWNER TO postgres;

--
-- Name: kitchen_station_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.kitchen_station_categories (
    id uuid NOT NULL,
    kitchen_station_id uuid NOT NULL,
    category_id uuid NOT NULL
);


ALTER TABLE public.kitchen_station_categories OWNER TO postgres;

--
-- Name: kitchen_stations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.kitchen_stations (
    id uuid NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    outlet_id uuid,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.kitchen_stations OWNER TO postgres;

--
-- Name: modifier_groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.modifier_groups (
    id uuid NOT NULL,
    name text NOT NULL,
    is_required boolean DEFAULT false NOT NULL,
    max_selections integer DEFAULT 1 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.modifier_groups OWNER TO postgres;

--
-- Name: modifiers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.modifiers (
    id uuid NOT NULL,
    name text NOT NULL,
    price_extra double precision DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    modifier_group_id uuid NOT NULL
);


ALTER TABLE public.modifiers OWNER TO postgres;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    data jsonb,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    entity_id text,
    entity_type text
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: ocr_scans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ocr_scans (
    id uuid NOT NULL,
    scan_type text NOT NULL,
    image_url text NOT NULL,
    extracted_text jsonb,
    extracted_data jsonb,
    status text DEFAULT 'pending'::text NOT NULL,
    error_message text,
    user_id uuid,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.ocr_scans OWNER TO postgres;

--
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    id uuid NOT NULL,
    order_id uuid NOT NULL,
    product_id uuid,
    quantity integer NOT NULL,
    price_at_time double precision NOT NULL,
    modifiers_applied jsonb,
    discount_item double precision DEFAULT 0 NOT NULL,
    split_group_id text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- Name: order_void_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_void_logs (
    id uuid NOT NULL,
    order_id uuid NOT NULL,
    product_id uuid,
    quantity integer NOT NULL,
    reason text NOT NULL,
    cashier_id uuid,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.order_void_logs OWNER TO postgres;

--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id uuid NOT NULL,
    cashier_id uuid,
    total_amount double precision NOT NULL,
    payment_method text,
    status text DEFAULT 'pending'::text NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    table_number text,
    discount_amount double precision DEFAULT 0 NOT NULL,
    rounding_amount double precision DEFAULT 0 NOT NULL,
    notes text,
    customer_order_id uuid,
    outlet_id uuid,
    payment_transaction_id uuid,
    customer_id uuid
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: outlets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.outlets (
    id uuid NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    address text,
    phone text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    delivery_fee double precision DEFAULT 15000 NOT NULL,
    company_id uuid NOT NULL
);


ALTER TABLE public.outlets OWNER TO postgres;

--
-- Name: payment_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_transactions (
    id uuid NOT NULL,
    order_id uuid NOT NULL,
    gateway text NOT NULL,
    gateway_tx_id text,
    amount double precision NOT NULL,
    payment_method text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    qr_code text,
    qr_expiry timestamp(3) without time zone,
    paid_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    void_reason text,
    voided_at timestamp(3) without time zone,
    voided_by uuid
);


ALTER TABLE public.payment_transactions OWNER TO postgres;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id uuid NOT NULL,
    invoice_id uuid NOT NULL,
    supplier_id uuid NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    payment_date timestamp(3) without time zone NOT NULL,
    amount double precision NOT NULL,
    payment_method text NOT NULL,
    reference_number text,
    notes text,
    processed_by uuid,
    processed_at timestamp(3) without time zone
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: payrolls; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payrolls (
    id uuid NOT NULL,
    employee_id uuid NOT NULL,
    period_start timestamp(3) without time zone NOT NULL,
    period_end timestamp(3) without time zone NOT NULL,
    base_salary double precision DEFAULT 0 NOT NULL,
    overtime_hours double precision DEFAULT 0 NOT NULL,
    overtime_pay double precision DEFAULT 0 NOT NULL,
    bonus double precision DEFAULT 0 NOT NULL,
    deduction double precision DEFAULT 0 NOT NULL,
    total_pay double precision DEFAULT 0 NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.payrolls OWNER TO postgres;

--
-- Name: permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permissions (
    id uuid NOT NULL,
    name text NOT NULL,
    description text,
    module text NOT NULL,
    action text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.permissions OWNER TO postgres;

--
-- Name: petty_cash; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.petty_cash (
    id uuid NOT NULL,
    amount double precision NOT NULL,
    description text NOT NULL,
    category text,
    receipt_url text,
    expense_date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by uuid,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    ingredient_id uuid,
    shift_id uuid
);


ALTER TABLE public.petty_cash OWNER TO postgres;

--
-- Name: printers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.printers (
    id uuid NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    ip_address text,
    port integer,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.printers OWNER TO postgres;

--
-- Name: product_modifier_groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_modifier_groups (
    id uuid NOT NULL,
    product_id uuid NOT NULL,
    modifier_group_id uuid NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.product_modifier_groups OWNER TO postgres;

--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id uuid NOT NULL,
    category_id uuid,
    name text NOT NULL,
    price double precision NOT NULL,
    stock_quantity integer DEFAULT 0 NOT NULL,
    image_url text,
    sku text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    outlet_id uuid,
    hpp double precision DEFAULT 0 NOT NULL
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    username text NOT NULL,
    password_hash text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    outlet_id uuid,
    email text,
    full_name text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    phone text,
    role_id uuid NOT NULL,
    preferences jsonb DEFAULT '{}'::jsonb
);


ALTER TABLE public.profiles OWNER TO postgres;

--
-- Name: purchase_order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchase_order_items (
    id uuid NOT NULL,
    purchase_order_id uuid NOT NULL,
    ingredient_id uuid NOT NULL,
    ingredient_name text NOT NULL,
    quantity double precision NOT NULL,
    unit text NOT NULL,
    unit_price double precision NOT NULL,
    total_price double precision NOT NULL
);


ALTER TABLE public.purchase_order_items OWNER TO postgres;

--
-- Name: purchase_orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchase_orders (
    id uuid NOT NULL,
    supplier_id uuid NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    order_date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    notes text,
    acknowledged_at timestamp(3) without time zone,
    expected_delivery timestamp(3) without time zone,
    payment_terms text,
    po_number text NOT NULL,
    quotation_id uuid,
    reviewed_at timestamp(3) without time zone,
    reviewed_by uuid,
    sent_at timestamp(3) without time zone,
    subtotal double precision NOT NULL,
    tax double precision DEFAULT 0 NOT NULL,
    total double precision NOT NULL
);


ALTER TABLE public.purchase_orders OWNER TO postgres;

--
-- Name: purchase_requisition_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchase_requisition_items (
    id uuid NOT NULL,
    purchase_requisition_id uuid NOT NULL,
    ingredient_id uuid NOT NULL,
    ingredient_name text NOT NULL,
    quantity double precision NOT NULL,
    unit text NOT NULL,
    estimated_price double precision NOT NULL,
    supplier_id uuid
);


ALTER TABLE public.purchase_requisition_items OWNER TO postgres;

--
-- Name: purchase_requisitions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchase_requisitions (
    id uuid NOT NULL,
    pr_number text NOT NULL,
    status text DEFAULT 'Pending Approval'::text NOT NULL,
    requested_by text NOT NULL,
    total_estimated double precision NOT NULL,
    notes text,
    approved_at timestamp(3) without time zone,
    approved_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.purchase_requisitions OWNER TO postgres;

--
-- Name: quotation_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quotation_requests (
    id uuid NOT NULL,
    stock_request_id uuid NOT NULL,
    status text DEFAULT 'open'::text NOT NULL,
    sent_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    closed_at timestamp(3) without time zone,
    notes text
);


ALTER TABLE public.quotation_requests OWNER TO postgres;

--
-- Name: quotations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quotations (
    id uuid NOT NULL,
    quotation_request_id uuid NOT NULL,
    supplier_id uuid NOT NULL,
    status text DEFAULT 'received'::text NOT NULL,
    quoted_price double precision NOT NULL,
    quoted_unit text NOT NULL,
    delivery_date timestamp(3) without time zone,
    payment_terms text,
    valid_until timestamp(3) without time zone,
    notes text,
    received_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    selected_at timestamp(3) without time zone,
    selected_by uuid,
    selected_by_name text
);


ALTER TABLE public.quotations OWNER TO postgres;

--
-- Name: recipes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.recipes (
    id uuid NOT NULL,
    menu_item_id uuid NOT NULL,
    ingredient_id uuid NOT NULL,
    quantity_required double precision NOT NULL,
    unit text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.recipes OWNER TO postgres;

--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_permissions (
    id uuid NOT NULL,
    role_id uuid NOT NULL,
    permission_id uuid NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.role_permissions OWNER TO postgres;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id uuid NOT NULL,
    name text NOT NULL,
    description text,
    is_system boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: stock_adjustment_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_adjustment_logs (
    id uuid NOT NULL,
    ingredient_id uuid NOT NULL,
    previous_stock double precision NOT NULL,
    new_stock double precision NOT NULL,
    adjustment_type text NOT NULL,
    reason text,
    user_id uuid,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.stock_adjustment_logs OWNER TO postgres;

--
-- Name: stock_approval_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_approval_requests (
    id uuid NOT NULL,
    request_number text NOT NULL,
    type text NOT NULL,
    requester_name text NOT NULL,
    item_name text NOT NULL,
    quantity double precision NOT NULL,
    unit text NOT NULL,
    status text DEFAULT 'Pending'::text NOT NULL,
    manager_notes text,
    processed_at timestamp(3) without time zone,
    processed_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    evidence_image text
);


ALTER TABLE public.stock_approval_requests OWNER TO postgres;

--
-- Name: stock_batches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_batches (
    id uuid NOT NULL,
    ingredient_id uuid NOT NULL,
    batch_code text NOT NULL,
    quantity double precision DEFAULT 0 NOT NULL,
    cost_price double precision DEFAULT 0 NOT NULL,
    expiry_date timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.stock_batches OWNER TO postgres;

--
-- Name: stock_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_logs (
    id uuid NOT NULL,
    ingredient_id uuid NOT NULL,
    quantity double precision NOT NULL,
    type text NOT NULL,
    reference_id text,
    reference_type text,
    notes text,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.stock_logs OWNER TO postgres;

--
-- Name: stock_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_requests (
    id uuid NOT NULL,
    ingredient_id uuid NOT NULL,
    ingredient_name text NOT NULL,
    quantity_requested double precision NOT NULL,
    unit text NOT NULL,
    notes text,
    proof_file text,
    proof_file_name text,
    status text DEFAULT 'pending_supervisor'::text NOT NULL,
    requested_by uuid NOT NULL,
    requested_by_name text NOT NULL,
    rejected_by uuid,
    rejected_by_name text,
    rejection_reason text,
    requested_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    rejected_at timestamp(3) without time zone,
    approval_level integer DEFAULT 1 NOT NULL,
    finance_approved_at timestamp(3) without time zone,
    finance_id uuid,
    finance_name text,
    finance_notes text,
    manager_approved_at timestamp(3) without time zone,
    manager_id uuid,
    manager_name text,
    manager_notes text,
    rejection_level integer,
    supervisor_approved_at timestamp(3) without time zone,
    supervisor_id uuid,
    supervisor_name text,
    supervisor_notes text,
    supplier_id uuid
);


ALTER TABLE public.stock_requests OWNER TO postgres;

--
-- Name: stock_transfer_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_transfer_items (
    id uuid NOT NULL,
    transfer_id uuid NOT NULL,
    ingredient_id uuid NOT NULL,
    quantity double precision NOT NULL,
    unit text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.stock_transfer_items OWNER TO postgres;

--
-- Name: stock_transfers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_transfers (
    id uuid NOT NULL,
    transfer_number text NOT NULL,
    from_warehouse_id uuid NOT NULL,
    to_warehouse_id uuid NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    requested_by uuid NOT NULL,
    approved_by text,
    approved_at timestamp(3) without time zone,
    notes text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.stock_transfers OWNER TO postgres;

--
-- Name: stock_write_offs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_write_offs (
    id uuid NOT NULL,
    ingredient_id uuid NOT NULL,
    ingredient_name text NOT NULL,
    quantity_written_off double precision NOT NULL,
    unit text NOT NULL,
    reason text NOT NULL,
    notes text,
    proof_file text NOT NULL,
    proof_file_name text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    requested_by uuid NOT NULL,
    requested_by_name text NOT NULL,
    approved_by uuid,
    approved_by_name text,
    rejected_by uuid,
    rejected_by_name text,
    rejection_reason text,
    requested_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    approved_at timestamp(3) without time zone,
    rejected_at timestamp(3) without time zone
);


ALTER TABLE public.stock_write_offs OWNER TO postgres;

--
-- Name: suppliers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.suppliers (
    id uuid NOT NULL,
    name text NOT NULL,
    phone text NOT NULL,
    email text,
    address text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    payment_terms text DEFAULT 'net 30'::text,
    tax_id text,
    category text,
    pic_mobile text,
    pic_name text,
    moq_amount numeric(15,2),
    moq_unit text,
    performance_notes text
);


ALTER TABLE public.suppliers OWNER TO postgres;

--
-- Name: tables; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tables (
    id uuid NOT NULL,
    table_number text NOT NULL,
    qr_code text,
    is_active boolean DEFAULT true NOT NULL,
    outlet_id uuid,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    status text DEFAULT 'available'::text NOT NULL
);


ALTER TABLE public.tables OWNER TO postgres;

--
-- Name: vouchers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vouchers (
    id uuid NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    discount_type text NOT NULL,
    discount_value double precision NOT NULL,
    minimum_purchase double precision DEFAULT 0 NOT NULL,
    max_discount double precision,
    quota integer DEFAULT 100 NOT NULL,
    used_count integer DEFAULT 0 NOT NULL,
    valid_from timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    valid_until timestamp(3) without time zone NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.vouchers OWNER TO postgres;

--
-- Name: warehouses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.warehouses (
    id uuid NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    outlet_id uuid NOT NULL,
    address text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.warehouses OWNER TO postgres;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
17bf1090-df0a-496d-9a6d-9650df50cc90	7e1a334badbb93c417efdeb768c322c800981d3174b5e5245899e966675318a9	2026-08-13 16:24:57.859686+07	20260810134615_add_selforder_routing	\N	\N	2026-08-13 16:24:57.852209+07	1
d845535b-fbc8-4960-bf88-87dac752ae2e	f46e9f5f2a99697314aa105dac1b2469596146952e2f866f70c59276ffd4f3cf	2026-08-13 16:24:56.812396+07	20260714115721_kitchen_pos	\N	\N	2026-08-13 16:24:56.659821+07	1
98c5ab45-9395-446a-bd07-ca005969a173	3c8af07cde21e13aa0fcfdbe5f3b476d680c4743ffd694cf363573db3b5c8fd3	2026-08-13 16:24:57.401868+07	20260808122216_add_crm_voucher_hr_attendance_settings	\N	\N	2026-08-13 16:24:57.226544+07	1
52ce37ba-3f3d-48c7-96fc-bfbc5e0fde82	4b441a9dd4ff4ca83f05f19d823a36f3b6d967ce2849fba7847854a77f11e7d1	2026-08-13 16:24:56.854454+07	20260714124635_add_modifier_groups	\N	\N	2026-08-13 16:24:56.8176+07	1
6f358e39-335e-4229-9192-150dad39a9b6	b1b5650ad73c9b2f6a84c9534527780e499d11f57df32ded6ca1c70c355f1d99	2026-08-13 16:24:56.862849+07	20260714140440_npm_run_db_migrate	\N	\N	2026-08-13 16:24:56.855904+07	1
d496aa2f-bc61-4c63-940a-3a853fc65961	f2039d3263683bc4e380789ab366453343e8bbd4ec4d0cc0294401c3c998a146	2026-08-13 16:24:57.788327+07	20260810002525_add_stock_requests	\N	\N	2026-08-13 16:24:57.764575+07	1
7adb5412-d69e-40d3-9900-a0da71e0d563	32e2581c7d68ba624670c53b0698e5a9a44cfc632d5ebcac58f410be32d0a7cf	2026-08-13 16:24:56.901222+07	20260714163514_npm_run_db_migrate	\N	\N	2026-08-13 16:24:56.866443+07	1
bf0dc51f-2e3b-4583-ae1a-34f128719807	bd54ef179cd6e14adf8f9eff7b5067e49a7293144d98c45cf98cf1f78f7ec484	2026-08-13 16:24:57.425275+07	20260808140119_add_table_status	\N	\N	2026-08-13 16:24:57.403317+07	1
0807e9eb-c49e-430a-b6df-85b310b90710	b35ce5da016c2cc65da803c2bc4f4e1978d517ff7b149ce13f6705548a3c5a87	2026-08-13 16:24:56.918204+07	20260714195655_phase0_foundation	\N	\N	2026-08-13 16:24:56.905765+07	1
c17dae45-3300-4072-b09b-2d17244e26a6	4a72c27a89a4287c79d15e2f351ec1ebac4c1474d9588dc08c22ed3d73c513d1	2026-08-13 16:24:57.060639+07	20260807054257_add_multi_outlet_self_order_payment	\N	\N	2026-08-13 16:24:56.920268+07	1
bad1653d-a5b4-4962-b0d5-498fb986ad88	241c2b65ad0be81cd882b10065d898e8a3ac635ccb683c8f63e7e7a643400eaf	2026-08-13 16:24:57.072032+07	20260807073746_add_order_item_status	\N	\N	2026-08-13 16:24:57.063764+07	1
25a1664c-c8c4-47d7-9f5b-09f14d6b51d5	60b109c2ee0e08d36365491a9a7326f8f3cbd540c902f20f194661392601b281	2026-08-13 16:24:57.606576+07	20260808143347_phase3_rbac_multiwarehouse_notifications	\N	\N	2026-08-13 16:24:57.429929+07	1
61e79f92-9368-4419-9e7d-6ca41ca7f94a	2ebc330fceb10ead62aed2641f8c0da22bef0dc01cf4af17ae4d0ac1db621ac8	2026-08-13 16:24:57.085086+07	20260807122825_add_app_settings	\N	\N	2026-08-13 16:24:57.073549+07	1
84836889-987a-477e-8c9d-68f51b0ff1e0	b69a8553dcb6803221bee712d4ef0bdc483abefd58108fbb7480c33627b51b78	2026-08-13 16:24:57.099001+07	20260807124723_update_app_settings_to_style	\N	\N	2026-08-13 16:24:57.087236+07	1
cb098dce-f20c-418b-b43d-c9c049aeec59	f455d874dfcea7763bb7a83283a2d91b2c743f4dd0f5697d897d75181e594111	2026-08-13 16:24:57.108153+07	20260807131216_add_design_options	\N	\N	2026-08-13 16:24:57.101694+07	1
ad74ee7c-06e2-4639-a726-66a9f0cc0ff3	2cc75308d8348089327eef9ce0824f0a8a635869f21f56bc045a19ec58c00489	2026-08-13 16:24:57.707633+07	20260808153920_phase4_advanced_features	\N	\N	2026-08-13 16:24:57.609766+07	1
082b4581-e71c-4d96-83b8-667ac17d0b7c	3bba06b9ab83ce011df7f48654f096f65a39670e2595c1f940b5558f8ec32c77	2026-08-13 16:24:57.158764+07	20260807152016_add_ingredients_recipes_suppliers	\N	\N	2026-08-13 16:24:57.109972+07	1
0a2b5548-2fb4-4b95-92f4-7e335941dace	54c677fabdcff4384a05b8357affd0dd0b29080064c8dbe15f00869747dab46c	2026-08-13 16:24:57.183976+07	20260808110618_add_stock_adjustment_log	\N	\N	2026-08-13 16:24:57.160375+07	1
3f177154-9659-4eea-a035-17b389eb261c	3df3b5ba01e6bcbbc88d4bb5c62dc43bbf5bddb652ce1b0ee191872e58e11dc0	2026-08-13 16:24:57.813324+07	20260810012639_add_stock_write_offs	\N	\N	2026-08-13 16:24:57.790112+07	1
a8a6e66a-9e77-42c3-abb0-fe587f44d1ff	2ffeed76f68d94e7df07554922d44c14811285fee8b59fd21060802d00422055	2026-08-13 16:24:57.223016+07	20260808113540_add_purchase_order	\N	\N	2026-08-13 16:24:57.185527+07	1
962f3cee-0e59-490d-bbe9-5967625e4ca8	ace19241fd878b06d86e6bf1298ebe0e31352b6d7b760dfe0cfe193436e43a09	2026-08-13 16:24:57.723821+07	20260809080918_make_payment_method_nullable	\N	\N	2026-08-13 16:24:57.710774+07	1
2197efda-efbb-4409-a468-2947f6cad115	9313afa572b75c5c83d5e5b6567965722ae0068973ed9a6d3c6a1783008f0d6d	2026-08-13 16:24:57.733671+07	20260809095025_add_delivery_fee_to_outlets	\N	\N	2026-08-13 16:24:57.726142+07	1
b885f90e-f724-49ef-a796-56be8cf9b966	caaab2ad5bc2ada750ea00102a89ba9e3d28ed1b0b708b2bb2026cc3872511fb	2026-08-13 16:24:58.185644+07	20260812122951_add_purchase_requisition	\N	\N	2026-08-13 16:24:58.147582+07	1
b5a417e4-a715-4e1e-bbc0-defe773d7dad	86c703a075d40334230a8dd26d4da0df50b8b71582604f18c03caf7c5c36a89b	2026-08-13 16:24:57.74992+07	20260809111515_add_payment_void_fields	\N	\N	2026-08-13 16:24:57.736955+07	1
9b37c805-4be3-4066-b820-991e80c7b77e	3479b37ad7da1716c65b4d78ba9e4b90f733199d17056ad391152ddac29c2fd4	2026-08-13 16:24:57.826293+07	20260810094354_add_table_user_settings	\N	\N	2026-08-13 16:24:57.815379+07	1
dbb7388d-489a-4795-b19f-8d4390deff27	e216d9f5b712ee5e1ed70256b25fbb442de03572427ff1457c5fbf656e932f59	2026-08-13 16:24:57.761295+07	20260809164435_add_web_base_url	\N	\N	2026-08-13 16:24:57.751743+07	1
ccbc0013-7c1a-483f-84d1-81a225cdf024	1be72a393f6e2a2a95457b4ded96960ec9a29539291272ee1ab08ee585c5fc20	2026-08-13 16:24:58.059195+07	20260810182200_procurement_enhancement	\N	\N	2026-08-13 16:24:57.865414+07	1
2c611de9-5f64-4101-8585-0d86945889a2	6e9be05767d999764d8ab1a3b68ee2c317e54cfc63a01437b8855ac5cdfbf4be	2026-08-13 16:24:57.838626+07	20260810095113_add_areas_json_field	\N	\N	2026-08-13 16:24:57.828256+07	1
b4d5cc0a-4f30-426d-b127-3fb73a6ce5fd	f3c3b47b8add85284174853b93b4281e896758d310365ca3c3f01986552bb9b6	2026-08-13 16:24:57.846868+07	20260810131524_add_selforder_payment_methods	\N	\N	2026-08-13 16:24:57.840877+07	1
361b4dcd-a47d-4f79-ab28-2ea3e7011d4a	6f69ac12d4c4b8d020a38646c17fce12530f06ac93a5e0238060abb45dd9526b	2026-08-13 16:24:58.103311+07	20260812012000_configurable_payment_safe_self_order	\N	\N	2026-08-13 16:24:58.088568+07	1
8ae62d99-d61c-4869-bd11-b026d07072d9	dc3f678df1dd3ad33d39f1c7db0a04180af2255c17864f556017a1bfb1fdc8e6	2026-08-13 16:24:58.078491+07	20260810195316_add_default_login_redirect	\N	\N	2026-08-13 16:24:58.061731+07	1
994aa127-26a6-45e7-a49e-e0c968c503cb	c8e9021062215f966008df219bde89261139da1389c0cc24f3367d364926e4d3	2026-08-13 16:24:58.145312+07	20260812121410_add_evidence_image_to_stock_approval_requests	\N	\N	2026-08-13 16:24:58.137731+07	1
3d31ef43-960f-4996-91df-d2be82bc88fb	d53bf432c1738247cc318138eda5443ecd55db29ba5abb0d663f360f46b36e8e	2026-08-13 16:24:58.087022+07	20260810200601_add_user_preferences	\N	\N	2026-08-13 16:24:58.080928+07	1
7aa7888d-f605-4acd-a544-dc63bbd2a178	b2de51b1394091062e24243daaf043249a30b120baf037154669f727b4474e45	2026-08-13 16:24:58.127661+07	20260812111442_add_stock_approval_requests	\N	\N	2026-08-13 16:24:58.107349+07	1
18a4bce9-34ed-4cca-b6b5-fc8e79208952	b8611bbc902e057df0ebe2a832f2d4f70fbf27ce943e6752b4349ee9c0ac4e46	2026-08-13 16:24:58.199986+07	20260812123435_add_hpp_to_product	\N	\N	2026-08-13 16:24:58.189367+07	1
316e5262-ad53-42bf-bf93-5658d5cd0413	1f944a72bd8554ab62b67f9e911f5292171f2da7a610b7edd5e36120e081171e	2026-08-13 16:24:58.2095+07	20260812133916_add_restock_fields	\N	\N	2026-08-13 16:24:58.20142+07	1
2055cd90-b23a-4198-a6b4-e8acd0c6a7b0	1afedc5a0a63c8f7406d7eaad8ded45e35ba1d226982c8ef7403512fc5cb2857	2026-08-13 16:24:58.223286+07	20260812141746_add_supplier_to_pr_items	\N	\N	2026-08-13 16:24:58.212498+07	1
ededa34b-5b73-4a4e-8b6a-d0e5ee9e2b3f	95270c46c0889fc5cb6b807ee651e6ce9ac2b97dcf72767cc94eedd58e01d2e7	2026-08-13 16:24:58.237662+07	20260812143236_add_ad_hoc_purchase_fields	\N	\N	2026-08-13 16:24:58.228589+07	1
cdd7dad4-ffb8-4fa1-b319-7a45350b5847	6c145507281e8c11812dd82260acf536397b1d25570e14080102b9632743d682	2026-08-13 16:24:58.24975+07	20260812144951_add_launcher_background	\N	\N	2026-08-13 16:24:58.240152+07	1
b87f2de1-9809-4383-a657-c7be9e163d34	c035688e21d6a57b5e06ee47cd9bc3211f99414ced93a8c11573d87afc6ff98e	2026-08-13 16:24:58.291307+07	20260812152231_add_petty_cash_model	\N	\N	2026-08-13 16:24:58.2529+07	1
823628ac-294a-40cc-adec-cb2e067e5860	83c8a34c7bae4fb3e2418bee589ac050ec1dcbbea2e128c75e94a2660ee63098	2026-08-13 16:24:58.309568+07	20260812154019_add_supplier_pic_and_category	\N	\N	2026-08-13 16:24:58.293068+07	1
e10916e2-80c5-43d9-b681-800bf8e8f3f5	062d8dcedbc23512eb3916b16bc09f2ae0ab01a940b00a01a247b4863ea2cd1d	2026-08-13 16:24:58.322774+07	20260812154643_add_supplier_moq	\N	\N	2026-08-13 16:24:58.313795+07	1
bc57622b-394b-41db-94ab-47c7c9a05f7e	1056b15b4cda250fada5b07f180a9217c479605013f264050367e79feb6ff5d7	2026-08-13 16:24:58.341327+07	20260812155109_add_supplier_performance_notes	\N	\N	2026-08-13 16:24:58.327773+07	1
9fc1b3bf-f7bb-445a-9b27-fe2f183b5e0d	721c68bf9775fd07a2c16ef826bf248df1785c503dbbd488433f7d34667ec7a3	2026-08-13 16:24:58.375694+07	20260812190000_add_single_company	\N	\N	2026-08-13 16:24:58.343965+07	1
e88ae569-e2cd-418b-97b7-560a5314da90	ec8e18afa0bc20004bcec75bb12b82e729811a71774a0d4380ebb829c95e64bd	2026-08-13 16:24:58.41471+07	20260813000000_add_ingredient_categories	\N	\N	2026-08-13 16:24:58.379901+07	1
75100abc-33be-4233-b15f-2dad67e0e7ac	b5d7e5a7752506f912a6d966a4ae3527fd05b90b7d1c77209bdb8b1b460dcac6	2026-08-13 16:25:11.276054+07	20260813092511_new	\N	\N	2026-08-13 16:25:11.272968+07	1
76fe27aa-8521-4928-a4bd-ed8088c8e884	571829717cafd103804c9190040648a40c90a9be30c1c5efa31292e9a780712b	2026-08-13 17:02:49.217834+07	20260813100249_inventory	\N	\N	2026-08-13 17:02:49.189086+07	1
80148143-57a2-43b1-bf4c-ae7ed6d7debb	5c7eb4cddf912c11270b28f4d163eacd87477e701c810cac3fa8cb2b6230bbe9	2026-08-13 17:14:42.821466+07	20260813101442_inventory	\N	\N	2026-08-13 17:14:42.813484+07	1
c4c69b62-72ed-4717-b728-d9658c16dfcf	92d651ca3902b08548189cef8153286554f61c9d56c852ae4f281a9c52ec003d	2026-08-13 18:33:01.487159+07	20260813113301_add_multi_unit_conversion_fields	\N	\N	2026-08-13 18:33:01.482777+07	1
\.


--
-- Data for Name: app_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.app_settings (id, created_at, updated_at, card_style, primary_color, theme_mode, card_view, cart_position, layout_density, auto_refresh, auto_report, backup_frequency, beverage_route, currency, default_cash_float, dessert_route, email_manager, main_course_route, manager_pin, min_stock_ingredient, min_stock_menu, notify_low_stock, paper_width, printer_type, receipt_footer, receipt_header, require_cash_float, require_pin_delete, require_pin_discount, require_pin_refund, require_pin_void, require_reconciliation, service_charge, show_cash_comparison, show_cashier_name, show_estimation, show_logo, show_pos_warning, show_table_number, sound_notification, store_address, store_email, store_name, store_phone, tax_rate, timezone, web_base_url, admin_count, cashier_count, indoor_count, outdoor_count, qr_auto_generate, require_2fa, vip_count, waiter_count, areas, selforder_payment_methods, selforder_routing, default_login_redirect, selforder_payment_instructions, auto_restock_enabled, launcher_background_mime_type, launcher_background_path) FROM stdin;
ad467753-c1d9-4a35-8fa4-6a8354cd1e85	2026-08-13 09:42:16.656	2026-08-13 09:42:16.656	rounded	blue	light	grid	right-sidebar	spacious	t	t	daily	Bar Station	IDR	500000	KDS Display 1	t	KDS Display 1	1234	10	5	t	80	bluetooth	Silakan datang kembali	TERIMA KASIH	yes	t	t	t	t	t	0	t	t	t	t	t	t	t	Jl. Contoh No. 123, Jakarta Selatan	info@kitchenpos.com	Kitchen POS Restaurant	+62 21 1234 5678	10	Asia/Jakarta	http://localhost:3000	1	2	10	8	t	f	4	3	[{"id": "1", "name": "Indoor", "count": 10, "description": "Area dalam restoran"}, {"id": "2", "name": "Outdoor", "count": 8, "description": "Area luar restoran"}, {"id": "3", "name": "VIP", "count": 4, "description": "Area VIP khusus"}]	["cashier"]	review	/apps	{}	f	\N	\N
\.


--
-- Data for Name: approval_workflows; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.approval_workflows (id, name, level, role_id, role_name, is_active) FROM stdin;
\.


--
-- Data for Name: attendances; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.attendances (id, employee_id, check_in_time, check_out_time, photo_url, location_lat, location_lng, location_address, shift_type, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, user_id, action, entity_type, entity_id, old_value, new_value, ip_address, user_agent, description, created_at) FROM stdin;
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name, created_at, updated_at, color) FROM stdin;
99e3bbcf-dd1f-49ad-8300-338db9621d18	Makanan Utama	2026-08-13 09:25:16.789	2026-08-13 09:25:16.789	orange
3512a374-6a53-44fc-b3c6-a68582329403	Minuman	2026-08-13 09:25:16.792	2026-08-13 09:25:16.792	blue
bc77c788-2749-4f33-98c2-f81f8a7ea2c5	Dessert	2026-08-13 09:25:16.793	2026-08-13 09:25:16.793	pink
65a3251a-9992-47ba-8af3-ebf2005d083b	Kopi	2026-08-13 09:25:16.795	2026-08-13 09:25:16.795	brown
51c962ca-d397-4362-a367-9e6300a07716	Teh	2026-08-13 09:25:16.797	2026-08-13 09:25:16.797	green
07099284-bd12-4ee3-bd8c-40fa13c4f149	Bakery	2026-08-13 09:25:16.799	2026-08-13 09:25:16.799	yellow
\.


--
-- Data for Name: category_printers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.category_printers (id, category_id, printer_id, created_at) FROM stdin;
\.


--
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.companies (id, name, logo_path, logo_mime_type, phone, email, website, address, tax_id, company_registry, timezone, currency, tax_rate, service_charge, created_at, updated_at) FROM stdin;
59312d31-190e-4b3d-8acc-6681b14357a7	Kitchen POS	\N	\N	\N	\N	\N	\N	\N	\N	Asia/Jakarta	IDR	10	0	2026-08-13 16:24:58.351	2026-08-13 16:24:58.351
00000000-0000-4000-8000-000000000001	Kitchen POS	\N	\N	0812-3456-7890	support@kitchenpos.id	https://kitchenpos.id	Jl. Jendral Sudirman No. 123, Jakarta Selatan, DKI Jakarta 12190	01.234.567.8-012.000	AHU-0012345.AH.01.01.TAHUN.2024	Asia/Jakarta	IDR	10	5	2026-08-13 09:25:16.355	2026-08-13 09:25:16.355
\.


--
-- Data for Name: customer_order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer_order_items (id, order_id, product_id, quantity, price_at_time, modifiers_applied, created_at) FROM stdin;
\.


--
-- Data for Name: customer_orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer_orders (id, table_id, customer_name, total_amount, status, payment_method, payment_status, created_at, updated_at, payment_reference, payment_verified_at, payment_verified_by) FROM stdin;
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customers (id, name, phone, email, tier, points, total_spent, discount_percentage, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: database_backups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.database_backups (id, filename, file_path, file_size, backup_type, status, created_by, created_at, notes) FROM stdin;
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employees (id, name, phone, email, "position", employment_type, base_salary, hourly_rate, join_date, is_active, created_at, updated_at) FROM stdin;
7dfc8a49-e15d-46ca-a141-3cf6515b822f	Budi Santoso	081234567890	budi.santoso@kitchenpos.com	manager	permanent	8000000	75000	2026-08-13 09:25:16.952	t	2026-08-13 09:25:16.952	2026-08-13 09:25:16.952
51333090-037d-4f04-aaca-179198d057cb	Siti Rahayu	081234567891	siti.rahayu@kitchenpos.com	manager	permanent	7500000	70000	2026-08-13 09:25:16.952	t	2026-08-13 09:25:16.952	2026-08-13 09:25:16.952
9851d5da-398c-45f2-88bc-364a7d9c0f78	Andi Wijaya	081234567892	andi.wijaya@kitchenpos.com	cashier	permanent	4500000	35000	2026-08-13 09:25:16.952	t	2026-08-13 09:25:16.952	2026-08-13 09:25:16.952
3a9cdc83-8886-43ca-8c3d-dd9b99b9686c	Dewi Lestari	081234567893	dewi.lestari@kitchenpos.com	cashier	freelance	4000000	30000	2026-08-13 09:25:16.952	t	2026-08-13 09:25:16.952	2026-08-13 09:25:16.952
9cfb2c32-74c0-44b8-b1e4-4e8b5e820b07	Eko Prasetyo	081234567894	eko.prasetyo@kitchenpos.com	cashier	freelance	0	35000	2026-08-13 09:25:16.952	t	2026-08-13 09:25:16.952	2026-08-13 09:25:16.952
1fc86c49-b571-4622-ae22-09325dcafc0a	Fajar Nugraha	081234567895	fajar.nugraha@kitchenpos.com	chef	permanent	6000000	50000	2026-08-13 09:25:16.952	t	2026-08-13 09:25:16.952	2026-08-13 09:25:16.952
cc6ac485-10f6-40e2-b7c4-cae8c744eb8c	Gita Permata	081234567896	gita.permata@kitchenpos.com	chef	permanent	5500000	45000	2026-08-13 09:25:16.952	t	2026-08-13 09:25:16.952	2026-08-13 09:25:16.952
7ca9ca98-d3e6-403e-b992-473331848e32	Hadi Kusuma	081234567897	hadi.kusuma@kitchenpos.com	chef	freelance	0	45000	2026-08-13 09:25:16.952	t	2026-08-13 09:25:16.952	2026-08-13 09:25:16.952
187daedc-9e28-408b-b2b1-7c07ec2f8e1e	Indah Sari	081234567898	indah.sari@kitchenpos.com	waiter	permanent	3500000	30000	2026-08-13 09:25:16.952	t	2026-08-13 09:25:16.952	2026-08-13 09:25:16.952
e0b24bf7-d7fe-4e6c-994f-79ca2824d9f0	Joko Anwar	081234567899	joko.anwar@kitchenpos.com	waiter	freelance	0	28000	2026-08-13 09:25:16.952	t	2026-08-13 09:25:16.952	2026-08-13 09:25:16.952
4ad1e88d-e63d-4efe-9fa6-a95db1b8da54	Kartika Sari	081234567900	kartika.sari@kitchenpos.com	barista	permanent	5000000	40000	2026-08-13 09:25:16.952	t	2026-08-13 09:25:16.952	2026-08-13 09:25:16.952
4fd8096d-7111-4cde-a70f-37404ac2a45e	Lukman Hakim	081234567901	lukman.hakim@kitchenpos.com	barista	freelance	0	38000	2026-08-13 09:25:16.952	t	2026-08-13 09:25:16.952	2026-08-13 09:25:16.952
\.


--
-- Data for Name: goods_received_notes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.goods_received_notes (id, grn_number, purchase_order_id, supplier_id, status, received_date, received_by, received_by_name, delivery_note, quality_checked_by, quality_checked_at, quality_notes) FROM stdin;
\.


--
-- Data for Name: grn_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.grn_items (id, grn_id, ingredient_id, ingredient_name, ordered_qty, received_qty, unit, quality_status, rejection_reason, batch_number, expiry_date, stock_updated) FROM stdin;
\.


--
-- Data for Name: ingredient_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ingredient_categories (id, name, color, created_at, updated_at) FROM stdin;
49c66c19-fbde-4e16-b8fe-c4d229d22118	Beverage	\N	2026-08-13 10:42:45.589	2026-08-13 10:42:45.589
69ebed03-f5a3-42ec-9a17-7dd6dcb79eda	Produce	\N	2026-08-13 10:42:45.619	2026-08-13 10:42:45.619
4996a9d3-c517-4679-8b54-ea1265cce9e2	Dairy	\N	2026-08-13 10:42:45.656	2026-08-13 10:42:45.656
9c40d203-33ed-4b15-b61c-c29d1141e993	Protein	\N	2026-08-13 10:42:45.693	2026-08-13 10:42:45.693
e27eb412-d61e-495a-a72e-6bf7176d5cd2	Bakery	\N	2026-08-13 10:42:45.755	2026-08-13 10:42:45.755
add862d0-1dff-4c50-a469-4951f06dc823	Dry Goods	\N	2026-08-13 10:42:45.761	2026-08-13 10:42:45.761
a3596cee-7bbe-4e2c-acfb-0b0bb2b63693	Sauces	\N	2026-08-13 10:42:45.846	2026-08-13 10:42:45.846
54bbb571-99d1-4449-b96f-1c6358171ffe	Frozen	\N	2026-08-13 10:42:45.854	2026-08-13 10:42:45.854
\.


--
-- Data for Name: ingredients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ingredients (id, name, current_stock, unit, min_stock, unit_price, supplier_id, created_at, updated_at, warehouse_id, restock_quantity, ad_hoc_price, ad_hoc_supplier, category_id, barcode, sku, base_unit, conversion_factor, secondary_conversion_factor, secondary_unit) FROM stdin;
f027917b-1fa5-455e-bff3-70c9db53499a	Tepung Terigu	50	kg	10	15000	\N	2026-08-13 09:25:20.324	2026-08-13 10:51:35.885	\N	20	0	\N	add862d0-1dff-4c50-a469-4951f06dc823	\N	\N	\N	1	1	\N
d33b5646-418a-44ce-af22-d7f5ed047c5a	Gula Pasir	30	kg	5	18000	\N	2026-08-13 09:25:20.329	2026-08-13 10:51:35.894	\N	10	0	\N	add862d0-1dff-4c50-a469-4951f06dc823	\N	\N	\N	1	1	\N
cea77dc3-c9c2-4b61-b0d7-5437dadb0430	Minyak Goreng	40	liter	10	25000	\N	2026-08-13 09:25:20.331	2026-08-13 10:51:35.897	\N	20	0	\N	add862d0-1dff-4c50-a469-4951f06dc823	\N	\N	\N	1	1	\N
a8aa6b4e-88c4-4e04-8d63-a0a25bbaa081	Telur Ayam	25	kg	5	32000	\N	2026-08-13 09:25:20.333	2026-08-13 10:51:35.9	\N	10	0	\N	9c40d203-33ed-4b15-b61c-c29d1141e993	\N	\N	\N	1	1	\N
0666228a-dbc2-4194-9858-7a3a0f3318b1	Susu UHT	20	liter	5	22000	\N	2026-08-13 09:25:20.335	2026-08-13 10:51:35.903	\N	10	0	\N	4996a9d3-c517-4679-8b54-ea1265cce9e2	\N	\N	\N	1	1	\N
81f1f09f-db38-4239-b9f8-7c6752a15749	Keju Cheddar	15	kg	3	85000	\N	2026-08-13 09:25:20.338	2026-08-13 10:51:35.905	\N	6	0	\N	4996a9d3-c517-4679-8b54-ea1265cce9e2	\N	\N	\N	1	1	\N
df13e8ef-df5c-4894-b79a-01bcaf5ccca1	Daging Sapi	20	kg	5	120000	\N	2026-08-13 09:25:20.34	2026-08-13 10:51:35.909	\N	10	0	\N	9c40d203-33ed-4b15-b61c-c29d1141e993	\N	\N	\N	1	1	\N
6afcb439-bf35-46bc-95ef-f0ea936aa764	Ayam Potong	30	kg	8	45000	\N	2026-08-13 09:25:20.342	2026-08-13 10:51:35.911	\N	16	0	\N	9c40d203-33ed-4b15-b61c-c29d1141e993	\N	\N	\N	1	1	\N
bc7ccadb-6a8e-48a6-8980-3a350020aad5	Sayur Bayam	10	kg	3	12000	\N	2026-08-13 09:25:20.345	2026-08-13 10:51:35.914	\N	6	0	\N	69ebed03-f5a3-42ec-9a17-7dd6dcb79eda	\N	\N	\N	1	1	\N
488f816b-b305-47b2-8e98-003f1366166c	Tomat	12	kg	3	15000	\N	2026-08-13 09:25:20.347	2026-08-13 10:51:35.916	\N	6	0	\N	69ebed03-f5a3-42ec-9a17-7dd6dcb79eda	\N	\N	\N	1	1	\N
6f38efdf-87e4-4bcc-abe3-edd96e35463b	Bawang Merah	8	kg	2	35000	\N	2026-08-13 09:25:20.348	2026-08-13 10:51:35.918	\N	4	0	\N	69ebed03-f5a3-42ec-9a17-7dd6dcb79eda	\N	\N	\N	1	1	\N
464f026e-362e-42ae-ac8f-3fcf1ae46a1f	Bawang Putih	6	kg	2	40000	\N	2026-08-13 09:25:20.351	2026-08-13 10:51:35.921	\N	4	0	\N	69ebed03-f5a3-42ec-9a17-7dd6dcb79eda	\N	\N	\N	1	1	\N
69d86a0c-44f6-48dc-a831-c61f5006d58c	Kopi Bubuk	25	kg	5	95000	\N	2026-08-13 09:25:20.352	2026-08-13 10:51:35.923	\N	10	0	\N	49c66c19-fbde-4e16-b8fe-c4d229d22118	\N	\N	\N	1	1	\N
f21c9755-be32-4a7f-8727-f5e5ef22ad6b	Susu Segar	15	liter	4	18000	\N	2026-08-13 09:25:20.354	2026-08-13 10:51:35.926	\N	8	0	\N	4996a9d3-c517-4679-8b54-ea1265cce9e2	\N	\N	\N	1	1	\N
165af566-b35b-4848-927f-bee9e54081ad	Coklat Bubuk	10	kg	2	75000	\N	2026-08-13 09:25:20.356	2026-08-13 10:51:35.929	\N	4	0	\N	add862d0-1dff-4c50-a469-4951f06dc823	\N	\N	\N	1	1	\N
927efcd5-ec5f-43f5-be4a-54bfc0afddf1	Sirup Karamel	0	liter	3	85000	\N	2026-08-13 10:42:45.652	2026-08-13 11:14:20.787	\N	0	0	\N	49c66c19-fbde-4e16-b8fe-c4d229d22118	\N	SRP-001	\N	1	1	\N
e97b2f31-58d3-4781-ad73-b4c8785464d3	Susu Evaporasi	0	liter	5	25000	\N	2026-08-13 10:42:45.66	2026-08-13 11:14:20.79	\N	0	0	\N	4996a9d3-c517-4679-8b54-ea1265cce9e2	\N	SE-001	\N	1	1	\N
9e82dd6d-9d74-4887-b61a-35d3b849dedb	Susu Kental Manis	0	kaleng	5	18000	\N	2026-08-13 10:42:45.665	2026-08-13 11:14:20.793	\N	0	0	\N	4996a9d3-c517-4679-8b54-ea1265cce9e2	\N	SKM-001	\N	1	1	\N
8ec5d131-b85f-460f-aa5f-276f40756b14	Teh Earl Grey	0	kg	3	25000	\N	2026-08-13 10:42:45.679	2026-08-13 11:14:20.795	\N	0	0	\N	49c66c19-fbde-4e16-b8fe-c4d229d22118	\N	TEG-001	\N	1	1	\N
208aece4-a60d-4b5b-b34b-c94d17317185	Teh Thailand	0	liter	3	35000	\N	2026-08-13 10:42:45.683	2026-08-13 11:14:20.798	\N	0	0	\N	49c66c19-fbde-4e16-b8fe-c4d229d22118	\N	TT-001	\N	1	1	\N
ecc37f66-df46-423e-aaf4-28bf87f461e4	Whipped Cream	0	liter	3	65000	\N	2026-08-13 10:42:45.689	2026-08-13 11:14:20.801	\N	0	0	\N	4996a9d3-c517-4679-8b54-ea1265cce9e2	\N	WC-001	\N	1	1	\N
6df81fa3-2b99-4870-941c-5d091dc251bb	Dada Ayam	0	kg	10	55000	\N	2026-08-13 10:42:45.696	2026-08-13 11:14:20.803	\N	0	0	\N	9c40d203-33ed-4b15-b61c-c29d1141e993	\N	DA-001	\N	1	1	\N
68162715-4a53-48cc-8910-2077cc7a1221	Fillet Ikan Dori	0	kg	5	55000	\N	2026-08-13 10:42:45.706	2026-08-13 11:14:20.807	\N	0	0	\N	9c40d203-33ed-4b15-b61c-c29d1141e993	\N	FID-001	\N	1	1	\N
faa01933-f0e3-40f2-8f3e-8bc10f676542	Telur	0	butir	10	2000	\N	2026-08-13 10:42:45.71	2026-08-13 11:14:20.81	\N	0	0	\N	9c40d203-33ed-4b15-b61c-c29d1141e993	\N	TLR-001	\N	1	1	\N
5687cf78-f754-4275-bab8-16ee5481c71e	Blueberry	0	kg	3	35000	\N	2026-08-13 10:42:45.725	2026-08-13 11:14:20.813	\N	0	0	\N	69ebed03-f5a3-42ec-9a17-7dd6dcb79eda	\N	BLB-001	\N	1	1	\N
4fa33d8f-029a-4697-b9ee-a2c42af342b1	Cabai	0	kg	3	45000	\N	2026-08-13 10:42:45.73	2026-08-13 11:14:20.816	\N	0	0	\N	69ebed03-f5a3-42ec-9a17-7dd6dcb79eda	\N	CB-002	\N	1	1	\N
10cf222b-8e27-465e-8faf-2c3a9d4a2a40	Air Kelapa Murni	0	liter	5	15000	\N	2026-08-13 10:42:45.593	2026-08-13 11:14:20.819	\N	0	0	\N	49c66c19-fbde-4e16-b8fe-c4d229d22118	\N	AK-001	\N	1	1	\N
1600c671-f06d-4ad0-b1b2-93fabf152a7d	Air Mineral	0	botol	10	5000	\N	2026-08-13 10:42:45.601	2026-08-13 11:14:20.822	\N	0	0	\N	49c66c19-fbde-4e16-b8fe-c4d229d22118	\N	AM-001	\N	1	1	\N
9d9655f7-f102-4c28-a27f-8c24df868916	Air Tonic	0	liter	10	12000	\N	2026-08-13 10:42:45.606	2026-08-13 11:14:20.824	\N	0	0	\N	49c66c19-fbde-4e16-b8fe-c4d229d22118	\N	AT-001	\N	1	1	\N
3eba3202-5bb7-4cda-91f0-14c7d4412b60	Bubuk Chai	0	kg	3	120000	\N	2026-08-13 10:42:45.611	2026-08-13 11:14:20.827	\N	0	0	\N	49c66c19-fbde-4e16-b8fe-c4d229d22118	\N	BC-001	\N	1	1	\N
8eb26642-1676-4860-96aa-9f9901080e1d	Bubuk Matcha	0	kg	3	150000	\N	2026-08-13 10:42:45.615	2026-08-13 11:14:20.829	\N	0	0	\N	49c66c19-fbde-4e16-b8fe-c4d229d22118	\N	BM-001	\N	1	1	\N
26146f8d-e7d4-4551-a7b5-111b2af909f0	Buah Jeruk Segar	0	kg	5	20000	\N	2026-08-13 10:42:45.621	2026-08-13 11:14:20.832	\N	0	0	\N	69ebed03-f5a3-42ec-9a17-7dd6dcb79eda	\N	BJS-001	\N	1	1	\N
4aed869d-e995-4097-9083-4edf92aaa62a	Daun Teh Melati	0	kg	5	15000	\N	2026-08-13 10:42:45.627	2026-08-13 11:14:20.834	\N	0	0	\N	49c66c19-fbde-4e16-b8fe-c4d229d22118	\N	DT-001	\N	1	1	\N
18358ddf-0e74-48ae-b766-b3263ef793c8	Es Batu	0	kg	10	5000	\N	2026-08-13 10:42:45.631	2026-08-13 11:14:20.836	\N	0	0	\N	49c66c19-fbde-4e16-b8fe-c4d229d22118	\N	EB-001	\N	1	1	\N
8660305b-58c0-4668-9f0c-894c4ed0e73d	Gas Nitrogen	0	tabung	1	150000	\N	2026-08-13 10:42:45.637	2026-08-13 11:14:20.839	\N	0	0	\N	49c66c19-fbde-4e16-b8fe-c4d229d22118	\N	GN-001	\N	1	1	\N
56248000-ee6c-4d61-aec6-04efdb11b738	Kol / Sayuran	0	kg	5	12000	\N	2026-08-13 10:42:45.735	2026-08-13 11:14:20.841	\N	0	0	\N	69ebed03-f5a3-42ec-9a17-7dd6dcb79eda	\N	KS-001	\N	1	1	\N
cba90769-31ac-43d0-9a09-d8525cdd5b88	Pisang	0	sisir	3	15000	\N	2026-08-13 10:42:45.739	2026-08-13 11:14:20.843	\N	0	0	\N	69ebed03-f5a3-42ec-9a17-7dd6dcb79eda	\N	PSG-001	\N	1	1	\N
f9da65d6-61e4-4f61-a1bc-28c7adb80a8c	Selada Romaine	0	kg	3	25000	\N	2026-08-13 10:42:45.744	2026-08-13 11:14:20.845	\N	0	0	\N	69ebed03-f5a3-42ec-9a17-7dd6dcb79eda	\N	SLD-001	\N	1	1	\N
582c651b-6f49-4746-b27f-7dc522decd06	Wortel	0	kg	5	14000	\N	2026-08-13 10:42:45.752	2026-08-13 11:14:20.848	\N	0	0	\N	69ebed03-f5a3-42ec-9a17-7dd6dcb79eda	\N	WRT-001	\N	1	1	\N
04e3db48-f226-4604-8ae0-5d975fd8f61d	Adonan Croissant	0	kg	5	45000	\N	2026-08-13 10:42:45.758	2026-08-13 11:14:20.85	\N	0	0	\N	e27eb412-d61e-495a-a72e-6bf7176d5cd2	\N	AC-001	\N	1	1	\N
933db0b3-0644-45ec-950d-e4a8f45684b6	Biskuit Regal	0	pack	5	18000	\N	2026-08-13 10:42:45.764	2026-08-13 11:14:20.851	\N	0	0	\N	add862d0-1dff-4c50-a469-4951f06dc823	\N	BR-001	\N	1	1	\N
00ff959f-d32f-462a-a8a8-efafb19f0531	Cokelat Bubuk	0	kg	3	75000	\N	2026-08-13 10:42:45.769	2026-08-13 11:14:20.853	\N	0	0	\N	add862d0-1dff-4c50-a469-4951f06dc823	\N	CB-003	\N	1	1	\N
a795718b-1423-4c00-8414-39ff3ddbe973	Cream Cheese	0	kg	3	90000	\N	2026-08-13 10:42:45.773	2026-08-13 11:14:20.856	\N	0	0	\N	4996a9d3-c517-4679-8b54-ea1265cce9e2	\N	CC-001	\N	1	1	\N
ff2ea0ab-11e3-433b-9086-1d9ac0522dac	Keju Mozzarella	0	kg	3	120000	\N	2026-08-13 10:42:45.782	2026-08-13 11:14:20.858	\N	0	0	\N	4996a9d3-c517-4679-8b54-ea1265cce9e2	\N	KM-001	\N	1	1	\N
8ec96dad-9a8e-4274-bb7c-a8269792d0dd	Keju Parmesan	0	kg	2	150000	\N	2026-08-13 10:42:45.786	2026-08-13 11:14:20.86	\N	0	0	\N	4996a9d3-c517-4679-8b54-ea1265cce9e2	\N	KP-001	\N	1	1	\N
bbc95ea7-cc30-49ab-a22b-41ebba8ce3ce	Perasan Lemon	0	liter	3	30000	\N	2026-08-13 10:42:45.647	2026-08-13 11:14:20.782	\N	0	0	\N	49c66c19-fbde-4e16-b8fe-c4d229d22118	\N	PL-001	\N	1	1	\N
d8bca5b1-a59f-441b-809d-e2b83f746df1	Kacang Almond	0	kg	2	140000	\N	2026-08-13 10:42:45.796	2026-08-13 11:14:20.862	\N	0	0	\N	add862d0-1dff-4c50-a469-4951f06dc823	\N	KA-001	\N	1	1	\N
46342b92-fe84-47ba-a6fc-e6f33696fcde	Kacang Tanah	0	kg	5	30000	\N	2026-08-13 10:42:45.8	2026-08-13 11:14:20.863	\N	0	0	\N	add862d0-1dff-4c50-a469-4951f06dc823	\N	KT-001	\N	1	1	\N
e77967a9-26a2-40f1-ade4-e72961875f52	Kayu Manis Bubuk	0	kg	2	15000	\N	2026-08-13 10:42:45.804	2026-08-13 11:14:20.866	\N	0	0	\N	add862d0-1dff-4c50-a469-4951f06dc823	\N	KMB-001	\N	1	1	\N
46ca622f-e30a-40f7-869a-1dd780140e1d	Kecap Manis	0	liter	5	20000	\N	2026-08-13 10:42:45.809	2026-08-13 11:14:20.868	\N	0	0	\N	add862d0-1dff-4c50-a469-4951f06dc823	\N	KM-002	\N	1	1	\N
91f1f579-a3b6-4d20-8893-762eb2b0fe2b	Mentega Butter	0	kg	5	60000	\N	2026-08-13 10:42:45.813	2026-08-13 11:14:20.87	\N	0	0	\N	4996a9d3-c517-4679-8b54-ea1265cce9e2	\N	MT-001	\N	1	1	\N
54337855-e516-4545-8634-8e8301ce40a4	Pasta Spaghetti	0	kg	5	28000	\N	2026-08-13 10:42:45.823	2026-08-13 11:14:20.872	\N	0	0	\N	add862d0-1dff-4c50-a469-4951f06dc823	\N	PST-001	\N	1	1	\N
7c35ba89-54b7-4787-b8f8-d9f5888bb2c9	Pewarna Makanan Merah	0	liter	2	10000	\N	2026-08-13 10:42:45.827	2026-08-13 11:14:20.874	\N	0	0	\N	add862d0-1dff-4c50-a469-4951f06dc823	\N	PM-001	\N	1	1	\N
4649145b-72c6-4a9b-9aa9-fba94549ded2	Ragi	0	kg	3	20000	\N	2026-08-13 10:42:45.832	2026-08-13 11:14:20.876	\N	0	0	\N	add862d0-1dff-4c50-a469-4951f06dc823	\N	RG-001	\N	1	1	\N
f32c1122-defd-4ead-b1ae-64c750dbad42	Roti Tawar	0	pack	5	15000	\N	2026-08-13 10:42:45.836	2026-08-13 11:14:20.878	\N	0	0	\N	e27eb412-d61e-495a-a72e-6bf7176d5cd2	\N	RT-001	\N	1	1	\N
db96d053-6856-4187-b7df-a67eae42bd34	Dressing Caesar	0	liter	3	45000	\N	2026-08-13 10:42:45.85	2026-08-13 11:14:20.88	\N	0	0	\N	a3596cee-7bbe-4e2c-acfb-0b0bb2b63693	\N	DC-001	\N	1	1	\N
28b6904a-8b2c-416d-b002-3ab401c201c0	Kentang Beku	0	kg	10	32000	\N	2026-08-13 10:42:45.858	2026-08-13 11:14:20.882	\N	0	0	\N	54bbb571-99d1-4449-b96f-1c6358171ffe	\N	KF-001	\N	1	1	\N
280b0e3a-42f2-423c-a415-f96ffc631c93	Vanilla Ice Cream	0	liter	4	40000	\N	2026-08-13 10:42:45.863	2026-08-13 11:14:20.884	\N	0	0	\N	54bbb571-99d1-4449-b96f-1c6358171ffe	\N	VIC-001	\N	1	1	\N
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoices (id, invoice_number, grn_id, supplier_id, status, invoice_date, due_date, subtotal, tax, total, payment_terms, notes, verified_by, verified_at) FROM stdin;
\.


--
-- Data for Name: kitchen_station_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.kitchen_station_categories (id, kitchen_station_id, category_id) FROM stdin;
\.


--
-- Data for Name: kitchen_stations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.kitchen_stations (id, name, code, description, is_active, outlet_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: modifier_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.modifier_groups (id, name, is_required, max_selections, created_at, updated_at) FROM stdin;
e7cb72de-5473-4fec-8ab7-23dbd44cd7f8	Suhu Minuman	t	1	2026-08-13 09:25:16.8	2026-08-13 09:25:16.8
0ee4c6e0-8c4c-4439-a703-3a566fe7e39c	Tingkat Gula	t	1	2026-08-13 09:25:16.803	2026-08-13 09:25:16.803
48ac660b-c9d0-4b15-928e-046f7e21ec24	Tambahan Kopi	f	2	2026-08-13 09:25:16.804	2026-08-13 09:25:16.804
9b81bc13-587f-4e72-9171-1672c3cb5af5	Level Pedas	f	1	2026-08-13 09:25:16.806	2026-08-13 09:25:16.806
7ac020cf-13af-4cb1-87dd-77b664ba4357	Topping Makanan	f	4	2026-08-13 09:25:16.808	2026-08-13 09:25:16.808
4adbfad8-a676-493e-9df0-beeb9e9ef4f8	Level Gula	f	1	2026-08-13 09:25:16.809	2026-08-13 09:25:16.809
065cebb3-c883-4f2c-be29-27db41a29c9b	Es Batu	f	1	2026-08-13 09:25:16.811	2026-08-13 09:25:16.811
f6bc6665-6904-4539-886e-ce33781df48a	Topping Minuman	f	4	2026-08-13 09:25:16.813	2026-08-13 09:25:16.813
8dfb843a-56ab-47ed-8dd8-74c1f3d54f87	Topping Snack	f	3	2026-08-13 09:25:16.814	2026-08-13 09:25:16.814
\.


--
-- Data for Name: modifiers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.modifiers (id, name, price_extra, created_at, updated_at, modifier_group_id) FROM stdin;
202937f2-b08f-4b43-b8eb-be3fc8050ee0	Hot	0	2026-08-13 09:25:16.816	2026-08-13 09:25:16.816	e7cb72de-5473-4fec-8ab7-23dbd44cd7f8
1c8a647c-3f09-464a-963b-dfd74f529aa8	Iced	3000	2026-08-13 09:25:16.816	2026-08-13 09:25:16.816	e7cb72de-5473-4fec-8ab7-23dbd44cd7f8
2f417f5f-0a45-4fd6-8459-cd15ee48872d	Normal Sugar	0	2026-08-13 09:25:16.819	2026-08-13 09:25:16.819	0ee4c6e0-8c4c-4439-a703-3a566fe7e39c
f73f1891-782f-4156-bd92-ac696d8626d5	Less Sugar	0	2026-08-13 09:25:16.819	2026-08-13 09:25:16.819	0ee4c6e0-8c4c-4439-a703-3a566fe7e39c
9e15fa3b-4d7c-45b3-b68e-45937ce3ee3b	No Sugar	0	2026-08-13 09:25:16.819	2026-08-13 09:25:16.819	0ee4c6e0-8c4c-4439-a703-3a566fe7e39c
dee3449d-6319-4ef9-94d9-e51094708fee	Extra Espresso Shot	5000	2026-08-13 09:25:16.822	2026-08-13 09:25:16.822	48ac660b-c9d0-4b15-928e-046f7e21ec24
3d6a978a-c390-4560-afa0-ada2fb803daa	Oat Milk Upgrade	8000	2026-08-13 09:25:16.822	2026-08-13 09:25:16.822	48ac660b-c9d0-4b15-928e-046f7e21ec24
7759e808-7696-4413-82a4-76690929164f	Tidak Pedas	0	2026-08-13 09:25:16.825	2026-08-13 09:25:16.825	9b81bc13-587f-4e72-9171-1672c3cb5af5
019a67c0-12f3-45ee-9edc-66cbd55772c2	Sedikit Pedas	0	2026-08-13 09:25:16.825	2026-08-13 09:25:16.825	9b81bc13-587f-4e72-9171-1672c3cb5af5
b2f6797b-7e0c-4dc8-ad12-8c96307e2775	Pedas	0	2026-08-13 09:25:16.825	2026-08-13 09:25:16.825	9b81bc13-587f-4e72-9171-1672c3cb5af5
e372b721-33a3-4c10-a594-d909998f2f21	Sangat Pedas	0	2026-08-13 09:25:16.825	2026-08-13 09:25:16.825	9b81bc13-587f-4e72-9171-1672c3cb5af5
d9d1031e-db55-4abd-8771-ad77f0ab14ff	Extra Nasi	5000	2026-08-13 09:25:16.827	2026-08-13 09:25:16.827	7ac020cf-13af-4cb1-87dd-77b664ba4357
48ce4db8-c4d8-471f-8c96-4f723dc2b014	Extra Telur	3000	2026-08-13 09:25:16.827	2026-08-13 09:25:16.827	7ac020cf-13af-4cb1-87dd-77b664ba4357
bb94fb11-264a-4e61-8c8e-d26d04ec1753	Extra Ayam	8000	2026-08-13 09:25:16.827	2026-08-13 09:25:16.827	7ac020cf-13af-4cb1-87dd-77b664ba4357
56917e81-84ba-45c6-add7-82bdb163b8a3	Kerupuk	2000	2026-08-13 09:25:16.827	2026-08-13 09:25:16.827	7ac020cf-13af-4cb1-87dd-77b664ba4357
1568705f-32ca-4f29-b07e-0a8d9ba5c888	Tanpa Gula	0	2026-08-13 09:25:16.831	2026-08-13 09:25:16.831	4adbfad8-a676-493e-9df0-beeb9e9ef4f8
ab06acdf-10fd-42c3-a5ef-0ea85d466ac7	Sedikit Gula	0	2026-08-13 09:25:16.831	2026-08-13 09:25:16.831	4adbfad8-a676-493e-9df0-beeb9e9ef4f8
d7adf7fa-9201-4e17-96fb-aebfb3902562	Normal	0	2026-08-13 09:25:16.831	2026-08-13 09:25:16.831	4adbfad8-a676-493e-9df0-beeb9e9ef4f8
20432a4d-3035-47e7-8469-ee624a222ca5	Extra Gula	0	2026-08-13 09:25:16.831	2026-08-13 09:25:16.831	4adbfad8-a676-493e-9df0-beeb9e9ef4f8
722c4ce6-320d-445a-a365-136c1ac72ea0	Tanpa Es	0	2026-08-13 09:25:16.833	2026-08-13 09:25:16.833	065cebb3-c883-4f2c-be29-27db41a29c9b
498828cb-e26d-4b56-aaf2-bddc9415cd59	Sedikit Es	0	2026-08-13 09:25:16.833	2026-08-13 09:25:16.833	065cebb3-c883-4f2c-be29-27db41a29c9b
1444b77c-f2e8-4d29-b8c7-87b8456fd74e	Normal	0	2026-08-13 09:25:16.833	2026-08-13 09:25:16.833	065cebb3-c883-4f2c-be29-27db41a29c9b
013109ff-d5d2-44d0-9284-ec4b12c2b87a	Extra Es	0	2026-08-13 09:25:16.833	2026-08-13 09:25:16.833	065cebb3-c883-4f2c-be29-27db41a29c9b
8064bc4f-02c3-429d-adb3-b02a29ae2337	Jelly	3000	2026-08-13 09:25:16.836	2026-08-13 09:25:16.836	f6bc6665-6904-4539-886e-ce33781df48a
60748ffb-6a07-4cc1-8b1b-eaeaf19105af	Puding	3000	2026-08-13 09:25:16.836	2026-08-13 09:25:16.836	f6bc6665-6904-4539-886e-ce33781df48a
1d521a32-c202-4f99-85a1-2bebff6d09b6	Nata de Coco	3000	2026-08-13 09:25:16.836	2026-08-13 09:25:16.836	f6bc6665-6904-4539-886e-ce33781df48a
792ea277-2795-462f-a4b7-dec1c0ab1a63	Susu Kental Manis	2000	2026-08-13 09:25:16.836	2026-08-13 09:25:16.836	f6bc6665-6904-4539-886e-ce33781df48a
751f7ef8-d55e-4490-8a7e-d972eaa54dca	Saus	2000	2026-08-13 09:25:16.839	2026-08-13 09:25:16.839	8dfb843a-56ab-47ed-8dd8-74c1f3d54f87
c3f23185-8b12-422a-800f-f3104c09d273	Mayones	2000	2026-08-13 09:25:16.839	2026-08-13 09:25:16.839	8dfb843a-56ab-47ed-8dd8-74c1f3d54f87
8e99c4e1-5a4e-4f54-b884-125146e384ba	Keju Parut	3000	2026-08-13 09:25:16.839	2026-08-13 09:25:16.839	8dfb843a-56ab-47ed-8dd8-74c1f3d54f87
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, type, title, message, data, is_read, created_at, entity_id, entity_type) FROM stdin;
3e6baea3-b903-4640-95ce-bfd7b5671280	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Adonan Croissant requires supervisor approval	\N	f	2026-08-13 12:21:36.132	838ab910-4474-470c-bad0-3f7d6f0a039b	stock_request
c1fccd78-3eae-4829-9503-a777ff81b9e4	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Air Kelapa Murni requires supervisor approval	\N	f	2026-08-13 12:21:36.161	ab9ab9c5-0a4a-4392-aa29-530122ea0bdf	stock_request
ababc1fe-7380-413b-bf52-8afc67f10450	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Air Mineral requires supervisor approval	\N	f	2026-08-13 12:21:36.174	1772bc0c-c91f-4e87-b86f-2e8e71c72c42	stock_request
3e5c3a19-84af-41cd-b716-3a2812146005	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Air Tonic requires supervisor approval	\N	f	2026-08-13 12:21:36.187	55475322-6b9a-42c1-92d8-afcd845f1c65	stock_request
15a6f8ad-b992-4d68-9c6a-588913b85b6f	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Biskuit Regal requires supervisor approval	\N	f	2026-08-13 12:21:36.199	865238e3-2cf0-4c52-9349-f915fbdec98c	stock_request
3a7c5999-5a4d-42dc-8c48-835ef167b713	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Blueberry requires supervisor approval	\N	f	2026-08-13 12:21:36.212	f2b0d872-6b28-43d3-a3ff-25310fdb70f1	stock_request
e7f7792b-8971-488b-aec5-c5859a082050	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Buah Jeruk Segar requires supervisor approval	\N	f	2026-08-13 12:21:36.224	df307ee0-e28d-4a68-8f25-5c820730f6c0	stock_request
52db12d7-b45b-4f78-8098-a63ce3ea523f	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Bubuk Chai requires supervisor approval	\N	f	2026-08-13 12:21:36.237	d6011cf8-371f-474d-b4bb-da1afbde2a27	stock_request
e4b4fed2-5fcb-4ed4-b2fd-f90d7f31e32d	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Bubuk Matcha requires supervisor approval	\N	f	2026-08-13 12:21:36.249	8dc77f34-31dc-45ed-9a58-cb5122ced5b1	stock_request
cf341f7d-e23a-4627-853d-f61fe84023e8	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Cabai requires supervisor approval	\N	f	2026-08-13 12:21:36.264	1668a3df-6807-42cb-aa62-f798f4cacf52	stock_request
33a708cd-a272-4537-bee2-522608749f1e	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Cokelat Bubuk requires supervisor approval	\N	f	2026-08-13 12:21:36.276	dd2057e9-7920-4a2c-a8b5-8549da5db0ea	stock_request
b287b3e0-9666-4de7-bd1a-2bbf23b5e137	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Cream Cheese requires supervisor approval	\N	f	2026-08-13 12:21:36.288	ca329f54-c338-46e9-a65b-ad0fdf0f78e6	stock_request
ee7bdbc9-b607-4ca2-ad86-85295be18edb	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Dada Ayam requires supervisor approval	\N	f	2026-08-13 12:21:36.301	cfe9e3ef-5540-41ce-a89a-f57f96d3643f	stock_request
809a35a9-af20-4159-bee6-1a409972d57e	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Daun Teh Melati requires supervisor approval	\N	f	2026-08-13 12:21:36.313	14162edf-5889-4767-b2b3-4680c16c3207	stock_request
93628c95-4f6f-46e0-a919-be5a28522788	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Dressing Caesar requires supervisor approval	\N	f	2026-08-13 12:21:36.326	89b6db83-46a8-4e7e-aaf8-a4f80134c144	stock_request
403c27d0-98ba-4e5d-b2dd-661b5a44d2e0	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Es Batu requires supervisor approval	\N	f	2026-08-13 12:21:36.339	6c384f05-6ff2-4560-83f7-135f66d5fb94	stock_request
41c5f164-a083-42fe-8cad-b1ec6c637682	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Fillet Ikan Dori requires supervisor approval	\N	f	2026-08-13 12:21:36.352	d9989ef7-9efa-4db8-9f28-daaeffe350f8	stock_request
82d985b0-d9af-475b-810d-1dfba82a946d	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Gas Nitrogen requires supervisor approval	\N	f	2026-08-13 12:21:36.366	989517a9-a53e-495f-89f8-57e5c82d89e3	stock_request
fa023088-4429-47b3-a0ff-25910cfa81c7	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Kacang Almond requires supervisor approval	\N	f	2026-08-13 12:21:36.381	a6e1ae71-f806-4d8c-93c3-a1ab01d41b37	stock_request
92676337-ef25-41a6-8a3b-7a61d8c2c367	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Kacang Tanah requires supervisor approval	\N	f	2026-08-13 12:21:36.393	40d616a6-0c62-40ee-b239-cb7e5c53bf00	stock_request
329ffaa6-f4c0-4a9f-8631-be5dfecb0dcc	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Kayu Manis Bubuk requires supervisor approval	\N	f	2026-08-13 12:21:36.405	3bb152da-e134-42ba-87d2-09529c0f8d0a	stock_request
de1e1d33-2d6c-4112-85ea-2ae76cfeb614	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Kecap Manis requires supervisor approval	\N	f	2026-08-13 12:21:36.417	a2c83016-c167-4c3d-807b-d312dd09ae69	stock_request
1b59ec65-bec1-4e7a-aca4-97dc98173593	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Keju Mozzarella requires supervisor approval	\N	f	2026-08-13 12:21:36.43	05b8e526-05dc-4297-bba0-4747ca9591a4	stock_request
af1bf8b4-f617-49c6-8508-4f4f8376be1d	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Keju Parmesan requires supervisor approval	\N	f	2026-08-13 12:21:36.443	071d651e-b76f-447f-a525-162fbb851c91	stock_request
4e78732c-6f03-4819-bf99-e338208ae871	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Kentang Beku requires supervisor approval	\N	f	2026-08-13 12:21:36.455	1966de95-0938-46a5-8b7c-43275a60b532	stock_request
f05e4fb7-dd07-4eab-acd9-01ae796d139e	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Kol / Sayuran requires supervisor approval	\N	f	2026-08-13 12:21:36.468	5bd5d234-3ab4-4549-9c45-7a6db08684de	stock_request
bc927fef-cff5-4903-ac2e-2df252cbfd60	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Mentega Butter requires supervisor approval	\N	f	2026-08-13 12:21:36.481	a04c5351-56d1-4a25-b0c2-24da97604be7	stock_request
3171e8d6-11b8-40fa-ae68-a81c16918046	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Pasta Spaghetti requires supervisor approval	\N	f	2026-08-13 12:21:36.493	7f25cf29-faa1-4674-998e-e7e3951fc52c	stock_request
0656556b-f00e-4db7-b086-d97a23b1360d	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Perasan Lemon requires supervisor approval	\N	f	2026-08-13 12:21:36.506	5d75bd0a-48d5-4049-b805-5d507dc393d7	stock_request
ff5f5786-46ad-4998-9375-58ca21a863c4	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Pewarna Makanan Merah requires supervisor approval	\N	f	2026-08-13 12:21:36.518	048d3cdc-da10-47f7-94e5-6124aebe749f	stock_request
848187ec-31de-44f0-a966-cf1d7236ee62	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Pisang requires supervisor approval	\N	f	2026-08-13 12:21:36.531	260cd723-ec23-453a-b334-c35cc54e2976	stock_request
cf0a57e9-8047-4468-a0d3-68105ebb6503	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Ragi requires supervisor approval	\N	f	2026-08-13 12:21:36.544	9b7c1d9a-3609-417e-92df-0df5f1b973a5	stock_request
839949b7-c0e3-45ea-ad6b-d0c07e39a72c	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Roti Tawar requires supervisor approval	\N	f	2026-08-13 12:21:36.557	d34fe5ea-21c8-4afc-bbf7-6d074e005983	stock_request
277a59bc-3152-40c4-bcda-ea55f532f3e7	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Selada Romaine requires supervisor approval	\N	f	2026-08-13 12:21:36.57	abc59d21-1f6e-4912-bf35-2189ba2d77ba	stock_request
960b71f4-9ce7-4923-b174-b2894df1bf00	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Sirup Karamel requires supervisor approval	\N	f	2026-08-13 12:21:36.585	a9290d89-ffeb-4219-bfce-8e78ce2a3065	stock_request
a2545a35-f552-46ec-9966-977ff9462455	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Susu Evaporasi requires supervisor approval	\N	f	2026-08-13 12:21:36.598	c1bce4b1-b7fc-4ae4-a61b-f666cf503de9	stock_request
82de241f-08e6-4b8e-8152-047012c8478b	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Susu Kental Manis requires supervisor approval	\N	f	2026-08-13 12:21:36.612	8e2ae18d-8d53-4152-8685-1afc2a9c2048	stock_request
ede0e736-6a00-45aa-9230-948ad8553915	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Teh Earl Grey requires supervisor approval	\N	f	2026-08-13 12:21:36.627	06b0f7ed-d804-4ea3-934c-1b5a7b293a74	stock_request
3ffc11fd-1a9d-4052-b080-f5d4389a5949	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Teh Thailand requires supervisor approval	\N	f	2026-08-13 12:21:36.639	20569de2-d533-448e-bcfc-e46e8ccc2cb9	stock_request
0aa89fd2-d495-405a-ae39-d6d433d56441	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Telur requires supervisor approval	\N	f	2026-08-13 12:21:36.651	91b9a8ef-236b-4570-b5cf-02bb65f73899	stock_request
044ade57-5c49-4f85-ad1e-f4fc3474f510	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Vanilla Ice Cream requires supervisor approval	\N	f	2026-08-13 12:21:36.664	9a882a50-8359-425c-9e51-6d43d0c7fd12	stock_request
6c64f853-ce87-40a1-b00f-57a8496df301	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Whipped Cream requires supervisor approval	\N	f	2026-08-13 12:21:36.675	d60e12b1-d2c3-43f4-8a9f-c866b69f0ac5	stock_request
e07b1111-354f-438c-be62-cd1178eb63cb	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Wortel requires supervisor approval	\N	f	2026-08-13 12:21:36.686	912d0105-18ba-4ecd-a1d0-b6ecdc71f9cd	stock_request
8348db60-10b0-46b3-b3a5-3c2c70170466	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Adonan Croissant requires supervisor approval	\N	f	2026-08-13 12:30:00.591	ca035808-c7a3-4454-8172-4b166ef6cc6f	stock_request
4b1dfe05-4e9c-4514-a0a7-8a79f028b1a9	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Air Kelapa Murni requires supervisor approval	\N	f	2026-08-13 12:30:00.632	e15b7984-5f12-4d8f-8bc8-f1a101fa9dfd	stock_request
bf9c4f64-d7c5-48fb-ba74-ca2f450e0f6a	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Air Mineral requires supervisor approval	\N	f	2026-08-13 12:30:00.65	9ce4fcc4-9a79-4511-a695-ea643d6ea244	stock_request
52767f0b-333b-4618-aa59-dd32f47db11d	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Air Tonic requires supervisor approval	\N	f	2026-08-13 12:30:00.666	74d73f6b-e9b3-402c-88f0-b9c8ebffb48d	stock_request
489fac0b-be15-4523-86d9-053186c616ef	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Biskuit Regal requires supervisor approval	\N	f	2026-08-13 12:30:00.678	0db999c4-982f-46f6-be92-cc2cad9982ea	stock_request
27dab54f-aa94-422b-baaf-688831aa9529	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Blueberry requires supervisor approval	\N	f	2026-08-13 12:30:00.69	42925ded-6044-4d1b-b82e-2bf3b1cbbc31	stock_request
ecbe3db4-24cf-49c6-b93e-46286330c2d0	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Buah Jeruk Segar requires supervisor approval	\N	f	2026-08-13 12:30:00.703	6ada6fc6-e037-45fd-ac16-1d080410247c	stock_request
48d0bc93-b659-4c89-9b2e-65c582fafebb	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Bubuk Chai requires supervisor approval	\N	f	2026-08-13 12:30:00.716	a72cc3b4-fbaf-42d4-be0a-a5e1278c814b	stock_request
4ce19d8d-d009-4776-8bdf-c7e62d5f91c0	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Bubuk Matcha requires supervisor approval	\N	f	2026-08-13 12:30:00.728	70862d85-d7ec-45ce-9039-34542b88957a	stock_request
5e33966d-1e27-49d4-a3c0-86e6b5806b82	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Cabai requires supervisor approval	\N	f	2026-08-13 12:30:00.74	df6ae602-4fb5-49f0-bb19-7e16b9e97866	stock_request
7fd46175-a7a7-4dbe-954e-666f9037b1ec	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Cokelat Bubuk requires supervisor approval	\N	f	2026-08-13 12:30:00.752	9aba0aa8-0615-4a6a-b88d-2dab4c595445	stock_request
df8dd8d6-9363-41db-a3b2-036df66e88ae	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Cream Cheese requires supervisor approval	\N	f	2026-08-13 12:30:00.765	d1f2d3ca-a09a-4df7-a763-8489ee9a971e	stock_request
b681fa5a-0354-4bf4-a948-bdb274e89ef7	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Dada Ayam requires supervisor approval	\N	f	2026-08-13 12:30:00.776	2fc15ddb-27b9-4cbe-bee6-961aa9dd0a79	stock_request
7ae34a36-cf47-448d-9387-9b2bc223c6fa	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Daun Teh Melati requires supervisor approval	\N	f	2026-08-13 12:30:00.787	a95f0c76-8901-4e11-b0a6-cd3451e45ff5	stock_request
1367e150-bdeb-4282-9ee5-ec88c3289afd	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Dressing Caesar requires supervisor approval	\N	f	2026-08-13 12:30:00.798	17029e99-270a-4f0f-aab4-2a49f339a2cd	stock_request
79bacb1f-937a-4933-88c0-3d9926e69cba	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Es Batu requires supervisor approval	\N	f	2026-08-13 12:30:00.81	dd07d01e-2f0b-4bf4-bf1c-9234d752c0d8	stock_request
f5855a2b-d192-4140-9449-f303ed1b4c59	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Fillet Ikan Dori requires supervisor approval	\N	f	2026-08-13 12:30:00.822	e847e8fc-2cfe-4ecc-ba57-44acf953c0f6	stock_request
b4c9d462-b0df-4e74-906d-30022f7af48c	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Gas Nitrogen requires supervisor approval	\N	f	2026-08-13 12:30:00.833	e5ae2b6e-de9d-4a8b-ae13-45017af7232a	stock_request
bb5d5b78-735e-4e6b-bab1-0044eec14e74	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Kacang Almond requires supervisor approval	\N	f	2026-08-13 12:30:00.845	337e6f45-1d32-4556-a136-d1ff2775af28	stock_request
aacd7f81-843d-4547-8aa3-f5441c180558	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Kacang Tanah requires supervisor approval	\N	f	2026-08-13 12:30:00.855	f6c8c5c4-4ede-4e17-bc0c-85e40bdf84aa	stock_request
5795ba3e-88dc-4f9e-a1f0-fc9fb4c57fd1	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Kayu Manis Bubuk requires supervisor approval	\N	f	2026-08-13 12:30:00.867	cb70044d-cd14-4e64-b19a-e03738339e0e	stock_request
b9f23046-e185-4e3c-a370-e30be82dd48d	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Kecap Manis requires supervisor approval	\N	f	2026-08-13 12:30:00.877	1305e664-73ba-45a4-ad79-115450c9ace9	stock_request
f765a943-219a-4ea1-9e74-efe10e50e428	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Keju Mozzarella requires supervisor approval	\N	f	2026-08-13 12:30:00.889	8154cd67-32b4-4aa2-91b7-340d3c18fe6a	stock_request
83faa676-241c-4132-9473-7a096b786750	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Keju Parmesan requires supervisor approval	\N	f	2026-08-13 12:30:00.901	cb039adf-0a1a-4742-adee-e1e80ac2f217	stock_request
506795b6-5582-4385-a078-66c0b9d39c42	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Kentang Beku requires supervisor approval	\N	f	2026-08-13 12:30:00.912	555ac9d6-fbec-49d5-acea-c773174382f6	stock_request
274d6474-f649-42fb-8a1b-2974d20ac441	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Kol / Sayuran requires supervisor approval	\N	f	2026-08-13 12:30:00.924	13efe010-879b-42cb-94ce-a799dc14a3ab	stock_request
5dfed6ed-9f9d-4fe9-a1b6-a6b38b5c8fac	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Mentega Butter requires supervisor approval	\N	f	2026-08-13 12:30:00.935	079ac61a-d885-43dd-bca4-050069768604	stock_request
d13778d8-a3fa-4dbb-a8f1-baae438b3d4b	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Pasta Spaghetti requires supervisor approval	\N	f	2026-08-13 12:30:00.947	42eed53d-e97e-4b7a-b3e1-2dd37410e5bd	stock_request
c9c6e4b8-19b4-4fb5-b368-59dbd5fa08ee	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Perasan Lemon requires supervisor approval	\N	f	2026-08-13 12:30:00.959	21e5dc2d-d14f-41d1-a953-17bf3fb05352	stock_request
730d2d80-de7e-4c43-b399-04e70455afa1	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Pewarna Makanan Merah requires supervisor approval	\N	f	2026-08-13 12:30:00.969	72da4b09-0112-4b1d-bc32-6d823e8d2571	stock_request
3923ea14-bebd-4e3e-a182-af8da247c169	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Pisang requires supervisor approval	\N	f	2026-08-13 12:30:00.982	df8fae02-b328-4bc7-888f-5db4b48cc8b7	stock_request
dbff8c42-1b49-4d07-bdc5-638e7ec1fddf	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Ragi requires supervisor approval	\N	f	2026-08-13 12:30:00.994	d3b24f69-20f4-4306-9412-36a4592a0e12	stock_request
16c2bfb0-45ad-4011-bc25-56c493e211ab	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Roti Tawar requires supervisor approval	\N	f	2026-08-13 12:30:01.006	5cf39697-a5e3-4576-ba9b-c1d5ff2f1df7	stock_request
01018908-0947-4c7c-b8d9-f030e3f254e7	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Selada Romaine requires supervisor approval	\N	f	2026-08-13 12:30:01.018	730b7f52-83a8-4447-9020-2a870cd2465d	stock_request
cf92c48e-3db5-4093-8f89-15ab294a7081	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Sirup Karamel requires supervisor approval	\N	f	2026-08-13 12:30:01.031	5dae0238-54ab-4d64-a438-02babf6aaeae	stock_request
e3933eb5-e3c7-46e5-bedf-cb06fa5e2455	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Susu Evaporasi requires supervisor approval	\N	f	2026-08-13 12:30:01.045	3b3c52cf-3794-4211-a7a2-118be93d60a4	stock_request
d4a4be0d-1319-457e-a20e-3c74a4ecce33	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Susu Kental Manis requires supervisor approval	\N	f	2026-08-13 12:30:01.057	8f3837ba-ff99-48a6-ade0-3b978178ba2a	stock_request
160d7d38-f892-43e0-a8eb-7cacf2866fc2	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Teh Earl Grey requires supervisor approval	\N	f	2026-08-13 12:30:01.068	da451d4b-2034-4ec3-9c61-135ebf857430	stock_request
70224316-f1ad-4794-a19f-c23a457f7489	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Teh Thailand requires supervisor approval	\N	f	2026-08-13 12:30:01.08	a1fd7071-91e0-48d9-8a45-002009306856	stock_request
0b09f94c-82ca-4b26-b336-098d1919a154	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Telur requires supervisor approval	\N	f	2026-08-13 12:30:01.091	07b00e6c-fa11-4d77-9a54-64129840fc20	stock_request
538f780a-8f83-4044-86d6-aa6e70c88da4	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Vanilla Ice Cream requires supervisor approval	\N	f	2026-08-13 12:30:01.103	c7ba7bdd-cfc3-4e05-a4e8-a65afdfa4e7c	stock_request
2f7deb3b-8b56-425a-b131-f21ad6c31a2b	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Whipped Cream requires supervisor approval	\N	f	2026-08-13 12:30:01.114	ff3a51e5-5215-4319-8d9e-ff48efdb9c18	stock_request
7e10b8eb-5d8a-49fa-9828-1dbb9654bbec	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	stock_request_approval	New Stock Request	Stock request for Wortel requires supervisor approval	\N	f	2026-08-13 12:30:01.132	6b067b12-8430-42a3-b639-2a147bc4c810	stock_request
\.


--
-- Data for Name: ocr_scans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ocr_scans (id, scan_type, image_url, extracted_text, extracted_data, status, error_message, user_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items (id, order_id, product_id, quantity, price_at_time, modifiers_applied, discount_item, split_group_id, created_at, status) FROM stdin;
79e2076f-ef1b-46c3-8a9d-5db9ef07335f	07da7c18-bbf8-4724-a1a8-6739d9fc5a92	ce6673bb-c51b-4a4f-ab3d-810e44601734	4	28000	\N	0	\N	2026-08-13 09:25:16.965	completed
f622168e-f376-484b-b816-d2e9e1f1cadf	07da7c18-bbf8-4724-a1a8-6739d9fc5a92	d52c0006-3bcd-48c7-ab83-082061dc6764	4	42000	\N	0	\N	2026-08-13 09:25:16.965	completed
7b8ac9f8-8a1d-4dd8-8fe7-01cec068d945	07da7c18-bbf8-4724-a1a8-6739d9fc5a92	d9f1fb87-e737-4210-a5bf-1bc0ba885771	4	42000	\N	0	\N	2026-08-13 09:25:16.965	completed
d1200b6b-16aa-4b8d-a1b8-edfb60b2f4d3	02548a7e-407a-465f-b749-4358cbbaeff6	f731a039-1a1f-413d-826c-0955bb9eea80	2	55000	\N	0	\N	2026-08-13 09:25:16.974	completed
68f440a5-87d1-432d-9347-5a2b4a3c80cf	02548a7e-407a-465f-b749-4358cbbaeff6	96531f07-be37-454a-aa0c-4a0eaab99930	3	55000	\N	0	\N	2026-08-13 09:25:16.974	completed
6667db53-d036-4146-bc36-8aaf1db35a10	02548a7e-407a-465f-b749-4358cbbaeff6	d849f917-4afe-4a94-8866-03848a938c79	2	35000	\N	0	\N	2026-08-13 09:25:16.974	completed
172df60d-8b08-4b4f-9930-37f5ef38612b	02548a7e-407a-465f-b749-4358cbbaeff6	30ef5deb-6b46-47d1-a98c-8bc060d62b44	1	45000	\N	0	\N	2026-08-13 09:25:16.974	completed
f6918cd3-1a3b-4eaa-be5c-c27eacb10f22	02548a7e-407a-465f-b749-4358cbbaeff6	51c45fec-e0e7-489e-8339-02a536d2e857	1	45000	\N	0	\N	2026-08-13 09:25:16.974	completed
eb1bf27a-1a1e-48a5-84ba-3d12f13b9c92	02548a7e-407a-465f-b749-4358cbbaeff6	d809adca-e256-41bc-b7b0-75df0d3f5dcb	1	35000	\N	0	\N	2026-08-13 09:25:16.974	completed
d0beaa3c-0b10-41bd-ba1f-fefc93b83621	86a62d02-7b80-4b85-93f6-554c61a070ea	6798927c-bcba-49fd-a7ad-78291c69ac33	1	52000	\N	0	\N	2026-08-13 09:25:16.987	completed
8ea0f0ef-0c1d-403f-a6e2-532b5741f9fd	86a62d02-7b80-4b85-93f6-554c61a070ea	35fbf376-436a-45ea-89a5-41560d3be32b	2	35000	\N	0	\N	2026-08-13 09:25:16.987	completed
530b0fd1-a931-43f8-8303-7d7c79135a07	86a62d02-7b80-4b85-93f6-554c61a070ea	83ceb824-bbdc-4b06-a867-037ded0aef0e	4	50000	\N	0	\N	2026-08-13 09:25:16.987	completed
3058c353-9a49-428e-b420-85e1a579b6bb	efc2b62f-bab3-4d67-a626-94c1e7453d92	ceed2a39-e4e2-486c-b228-a909a81d8487	4	20000	\N	0	\N	2026-08-13 09:25:16.993	completed
2a9b54f1-48fb-47fb-a22d-2023674e936f	efc2b62f-bab3-4d67-a626-94c1e7453d92	884570a1-2822-4840-a08f-fc4a4a3b5fad	3	48000	\N	0	\N	2026-08-13 09:25:16.993	completed
a1e2d9db-11da-44f2-b95c-28f0272d1317	efc2b62f-bab3-4d67-a626-94c1e7453d92	efc81916-6661-422b-826f-c68049339458	2	28000	\N	0	\N	2026-08-13 09:25:16.993	completed
27f7b5b2-61cb-4e35-82a4-d8268af8545a	18a5b5ee-edcf-4986-8a16-c54a8196c803	308d182c-58a9-47d9-a56a-bba4a473ae24	3	42000	\N	0	\N	2026-08-13 09:25:16.997	completed
eb3ff974-fb4c-479f-b285-6efa72a3db3a	18a5b5ee-edcf-4986-8a16-c54a8196c803	acb42a52-c717-441a-824b-8a18079ee46c	4	50000	\N	0	\N	2026-08-13 09:25:16.997	completed
b2fb03d7-ab3b-484d-9b47-100cfb6b31eb	18a5b5ee-edcf-4986-8a16-c54a8196c803	00acd18c-4b3a-4737-a36c-530f2c16d3b6	4	38000	\N	0	\N	2026-08-13 09:25:16.997	completed
c569fd71-21d7-40c5-ba2d-5f0af8bbfd23	18a5b5ee-edcf-4986-8a16-c54a8196c803	2ce5c559-70e1-4bdd-8cf0-fcdf2a843273	4	46000	\N	0	\N	2026-08-13 09:25:16.997	completed
512612a3-fda2-4a69-9751-675eb86385e9	18a5b5ee-edcf-4986-8a16-c54a8196c803	6798927c-bcba-49fd-a7ad-78291c69ac33	4	52000	\N	0	\N	2026-08-13 09:25:16.997	completed
1a665584-705c-4b2e-972e-dc55ddf28121	18a5b5ee-edcf-4986-8a16-c54a8196c803	00acd18c-4b3a-4737-a36c-530f2c16d3b6	2	38000	\N	0	\N	2026-08-13 09:25:16.997	completed
7ef1c4cf-844e-4bc5-b612-e9e8ee477a55	18a5b5ee-edcf-4986-8a16-c54a8196c803	d21a6806-fffa-4462-b33f-2c91a1c6b013	3	50000	\N	0	\N	2026-08-13 09:25:16.997	completed
06e4df54-3b47-4182-add5-cf00e4157803	18a5b5ee-edcf-4986-8a16-c54a8196c803	96531f07-be37-454a-aa0c-4a0eaab99930	3	55000	\N	0	\N	2026-08-13 09:25:16.997	completed
e52db602-155f-4301-8d23-69f41765331c	8dc30fb6-f901-4897-bb52-545a4aac790e	ceed2a39-e4e2-486c-b228-a909a81d8487	4	20000	\N	0	\N	2026-08-13 09:25:17.007	completed
6cde553c-6f10-4731-8b00-17e4e3f560b5	8dc30fb6-f901-4897-bb52-545a4aac790e	c24edbc4-7c7a-4228-9b3c-1b95c2be051c	1	48000	\N	0	\N	2026-08-13 09:25:17.007	completed
4aa72a78-cad9-4477-918b-ca45a0b57eb1	8dc30fb6-f901-4897-bb52-545a4aac790e	c24edbc4-7c7a-4228-9b3c-1b95c2be051c	1	48000	\N	0	\N	2026-08-13 09:25:17.007	completed
123a70b8-6467-471f-8009-d1cc768aa87d	8dc30fb6-f901-4897-bb52-545a4aac790e	daa4bd17-296f-4da1-8d21-15534fa8e045	4	25000	\N	0	\N	2026-08-13 09:25:17.007	completed
7c94ec83-c5b7-4321-b924-3fa802220fd2	8dc30fb6-f901-4897-bb52-545a4aac790e	30ef5deb-6b46-47d1-a98c-8bc060d62b44	3	45000	\N	0	\N	2026-08-13 09:25:17.007	completed
69697a23-50e1-4bfd-a43c-1dc2ed124919	8dc30fb6-f901-4897-bb52-545a4aac790e	86643a05-ac82-4216-bdf8-87fcd64da8ec	3	48000	\N	0	\N	2026-08-13 09:25:17.007	completed
e2ffda6b-c017-4e4d-aa92-0ea0355e89f1	1853031b-c967-435d-8b80-3b7989db5c9b	5ba65aef-1f61-4c68-b8c1-d847553c8aef	3	52000	\N	0	\N	2026-08-13 09:25:17.012	completed
edba5e44-18bc-4f9d-88b4-9ad067000b04	1853031b-c967-435d-8b80-3b7989db5c9b	c9ed90c7-689a-46ab-9fd2-84d017c264af	3	32000	\N	0	\N	2026-08-13 09:25:17.012	completed
e88b6c49-cf13-4f5f-a2b2-3afc521158d7	1853031b-c967-435d-8b80-3b7989db5c9b	01d338fc-cbda-492d-b496-2a55e100d813	2	45000	\N	0	\N	2026-08-13 09:25:17.012	completed
1a4f7308-b6c6-4d8d-ba02-60bba557721c	1853031b-c967-435d-8b80-3b7989db5c9b	35fbf376-436a-45ea-89a5-41560d3be32b	3	35000	\N	0	\N	2026-08-13 09:25:17.012	completed
e91a2a13-0dbe-4e1d-a5e6-940a30abe5d0	1853031b-c967-435d-8b80-3b7989db5c9b	bcff5008-981c-428b-b652-31d8c1378d9f	2	28000	\N	0	\N	2026-08-13 09:25:17.012	completed
4cee825f-f3af-4af3-a3c6-fc9a8412a9db	1853031b-c967-435d-8b80-3b7989db5c9b	f731a039-1a1f-413d-826c-0955bb9eea80	3	55000	\N	0	\N	2026-08-13 09:25:17.012	completed
182418f9-3754-4b68-9b1e-a7cdc2617fa0	f5fdeeee-5cbd-43ab-bf32-5f47b2c4450a	eb1dae05-cb14-4000-ba10-260f9cd79124	2	45000	\N	0	\N	2026-08-13 09:25:17.016	completed
adfef726-c4c9-4ed5-9e37-042429e22c7c	f5fdeeee-5cbd-43ab-bf32-5f47b2c4450a	81d6f3b5-b26a-4dd0-bfca-fea91a42a296	1	35000	\N	0	\N	2026-08-13 09:25:17.016	completed
c120bfdb-83a3-4104-badb-4cd48ca0594f	f5fdeeee-5cbd-43ab-bf32-5f47b2c4450a	12b460b3-749d-4ab1-80de-d8f51d5188cc	1	40000	\N	0	\N	2026-08-13 09:25:17.016	completed
236005aa-30e4-49c7-af97-915e893c355a	f5fdeeee-5cbd-43ab-bf32-5f47b2c4450a	eaa3fac9-f60f-4db1-b33a-a4bd46e8ea71	1	45000	\N	0	\N	2026-08-13 09:25:17.016	completed
b49ba012-fe10-45da-b2ec-7e0f021d92a1	f5fdeeee-5cbd-43ab-bf32-5f47b2c4450a	0b97d8bc-ffce-4904-8c46-87752b930f5e	2	45000	\N	0	\N	2026-08-13 09:25:17.016	completed
ccd2f735-acd8-436e-a994-8e13d7dee26a	f5fdeeee-5cbd-43ab-bf32-5f47b2c4450a	96531f07-be37-454a-aa0c-4a0eaab99930	2	55000	\N	0	\N	2026-08-13 09:25:17.016	completed
a65eb8bc-6fb6-4a53-9162-12b4d0f4b46f	f5fdeeee-5cbd-43ab-bf32-5f47b2c4450a	83ceb824-bbdc-4b06-a867-037ded0aef0e	1	50000	\N	0	\N	2026-08-13 09:25:17.016	completed
6bfc73b8-3942-41eb-a712-e7d700aaeb5d	a734967b-b800-48ce-a152-84c86ea6e531	c0917f04-365b-4cdc-9b75-e49a7c492727	4	48000	\N	0	\N	2026-08-13 09:25:17.025	completed
44f0555c-59d7-4f2e-be26-327da027bcc9	a734967b-b800-48ce-a152-84c86ea6e531	b6a4c689-bce0-4d87-883b-b0de919eba27	2	58000	\N	0	\N	2026-08-13 09:25:17.025	completed
8395c666-5614-4cd9-a680-daf9d54b4e51	a734967b-b800-48ce-a152-84c86ea6e531	8f09b4ea-702e-4845-b2c0-59b3bf810d9d	3	38000	\N	0	\N	2026-08-13 09:25:17.025	completed
1ffc9464-3435-45a5-b8b7-56208a3607c5	2aafef5e-9b9b-4da2-9c66-96cb0aa617ed	3aac02bc-fcc6-4532-9a50-fa50790dd4cb	4	32000	\N	0	\N	2026-08-13 09:25:17.028	completed
0c1e24f4-ecdd-4a2d-9c63-a8dcb1b99853	2aafef5e-9b9b-4da2-9c66-96cb0aa617ed	51c45fec-e0e7-489e-8339-02a536d2e857	3	45000	\N	0	\N	2026-08-13 09:25:17.028	completed
4d0587e0-9464-48c4-b203-eb1726c48290	2aafef5e-9b9b-4da2-9c66-96cb0aa617ed	3a6ff9b1-cc6c-45ae-9635-ab2b2d03c232	3	38000	\N	0	\N	2026-08-13 09:25:17.028	completed
b48364c0-6d02-499d-a8e9-839c2e7eeb57	2aafef5e-9b9b-4da2-9c66-96cb0aa617ed	308d182c-58a9-47d9-a56a-bba4a473ae24	4	42000	\N	0	\N	2026-08-13 09:25:17.028	completed
4a4271c4-418d-4cb9-81db-4c23940fc2ff	f1b24ce5-9746-40ab-830b-471cf2524501	30ef5deb-6b46-47d1-a98c-8bc060d62b44	1	45000	\N	0	\N	2026-08-13 09:25:17.037	completed
3c14f438-5398-48ca-905b-47b0cdbc32e0	f1b24ce5-9746-40ab-830b-471cf2524501	12b460b3-749d-4ab1-80de-d8f51d5188cc	3	40000	\N	0	\N	2026-08-13 09:25:17.037	completed
d0f20dda-375a-436e-b151-9d698f011e04	f1b24ce5-9746-40ab-830b-471cf2524501	5ba65aef-1f61-4c68-b8c1-d847553c8aef	4	52000	\N	0	\N	2026-08-13 09:25:17.037	completed
77fb316f-121d-460c-be1d-b95d8ff4c63a	f1b24ce5-9746-40ab-830b-471cf2524501	faead849-9d7b-4831-b60e-20222fee6c1f	2	48000	\N	0	\N	2026-08-13 09:25:17.037	completed
f48334e4-140b-4ca2-a1ec-3f963bf0ec12	f1b24ce5-9746-40ab-830b-471cf2524501	35fbf376-436a-45ea-89a5-41560d3be32b	4	35000	\N	0	\N	2026-08-13 09:25:17.037	completed
7ee65f0d-9452-4f2c-8b71-9cefcc1cd23e	a11c35d7-4bf7-4904-96e7-c004b0b44a0f	acb42a52-c717-441a-824b-8a18079ee46c	1	50000	\N	0	\N	2026-08-13 09:25:17.046	completed
f79f7cd6-e76c-49df-b588-f955a022130b	a11c35d7-4bf7-4904-96e7-c004b0b44a0f	96531f07-be37-454a-aa0c-4a0eaab99930	1	55000	\N	0	\N	2026-08-13 09:25:17.046	completed
3dbce570-6141-4467-ac02-f7ead2aea5b0	a11c35d7-4bf7-4904-96e7-c004b0b44a0f	7484d38a-54a0-49c7-baa2-a93fdce6d347	3	55000	\N	0	\N	2026-08-13 09:25:17.046	completed
8210b5f5-0e4a-4d5c-b5cc-f01647e03dc7	1cc47a13-c4b7-4031-8f04-d4b39ad01d5b	e24a6cc9-1b6e-4ba7-94a5-514f6aa8fe31	1	45000	\N	0	\N	2026-08-13 09:25:17.054	completed
8bfb1fb8-8cb1-46f5-96d1-d5005d697a39	1cc47a13-c4b7-4031-8f04-d4b39ad01d5b	d809adca-e256-41bc-b7b0-75df0d3f5dcb	4	35000	\N	0	\N	2026-08-13 09:25:17.054	completed
7ca4de95-f693-4dac-a93d-7b59e4fda870	1cc47a13-c4b7-4031-8f04-d4b39ad01d5b	eaa3fac9-f60f-4db1-b33a-a4bd46e8ea71	3	45000	\N	0	\N	2026-08-13 09:25:17.054	completed
5d99b2de-622d-46b3-aebb-08637c084bfa	1cc47a13-c4b7-4031-8f04-d4b39ad01d5b	884570a1-2822-4840-a08f-fc4a4a3b5fad	1	48000	\N	0	\N	2026-08-13 09:25:17.054	completed
c9996fa4-edb6-41e6-95f8-5cd3953d9a56	1cc47a13-c4b7-4031-8f04-d4b39ad01d5b	b6a4c689-bce0-4d87-883b-b0de919eba27	2	58000	\N	0	\N	2026-08-13 09:25:17.054	completed
9223ea49-c29d-4660-8f68-19058fc268b5	34dcb5a8-914d-408d-9543-04fe54587244	b1ee3afc-db38-468c-a4bf-38b51b772024	4	20000	\N	0	\N	2026-08-13 09:25:17.06	completed
5b848f52-a88f-4f98-99b8-8bb46ce17d5a	34dcb5a8-914d-408d-9543-04fe54587244	35fbf376-436a-45ea-89a5-41560d3be32b	3	35000	\N	0	\N	2026-08-13 09:25:17.06	completed
052cc1e3-a728-419d-879d-e1ea224134a4	34dcb5a8-914d-408d-9543-04fe54587244	ceed2a39-e4e2-486c-b228-a909a81d8487	3	20000	\N	0	\N	2026-08-13 09:25:17.06	completed
eb7837c2-45dc-4d09-92b7-4b6f9791fda5	34dcb5a8-914d-408d-9543-04fe54587244	27af0495-2d91-4cb0-af88-4752edf671dc	1	10000	\N	0	\N	2026-08-13 09:25:17.06	completed
30d0b8d0-ccb2-4954-88cc-a079903663ba	34dcb5a8-914d-408d-9543-04fe54587244	12b460b3-749d-4ab1-80de-d8f51d5188cc	2	40000	\N	0	\N	2026-08-13 09:25:17.06	completed
c881cd91-ee63-41d0-9c06-8fe51ab1c40f	4f1b7364-a31f-4ec7-9d33-ef273246ea21	30ef5deb-6b46-47d1-a98c-8bc060d62b44	1	45000	\N	0	\N	2026-08-13 09:25:17.069	completed
33b86c9d-d1fa-4596-aff0-7984dc37a878	4f1b7364-a31f-4ec7-9d33-ef273246ea21	12b460b3-749d-4ab1-80de-d8f51d5188cc	1	40000	\N	0	\N	2026-08-13 09:25:17.069	completed
11fdfdd4-9075-42ed-bdcd-664770db8145	4f1b7364-a31f-4ec7-9d33-ef273246ea21	12b460b3-749d-4ab1-80de-d8f51d5188cc	4	40000	\N	0	\N	2026-08-13 09:25:17.069	completed
c55bca0d-d7d2-425a-aa06-502e71ef9972	4f1b7364-a31f-4ec7-9d33-ef273246ea21	d52c0006-3bcd-48c7-ab83-082061dc6764	2	42000	\N	0	\N	2026-08-13 09:25:17.069	completed
4034f931-bc4c-4124-8373-f582c25510b1	e32733de-a842-4193-b8d8-9a26c2e36eef	30ef5deb-6b46-47d1-a98c-8bc060d62b44	3	45000	\N	0	\N	2026-08-13 09:25:17.074	completed
d0325996-5470-4cc2-afef-52ebdd19d18a	e32733de-a842-4193-b8d8-9a26c2e36eef	efc81916-6661-422b-826f-c68049339458	4	28000	\N	0	\N	2026-08-13 09:25:17.074	completed
f39821b3-e546-4827-bafe-e10298bfe3f1	e32733de-a842-4193-b8d8-9a26c2e36eef	6798927c-bcba-49fd-a7ad-78291c69ac33	3	52000	\N	0	\N	2026-08-13 09:25:17.074	completed
b79c0778-9f73-4324-8c3c-c5366fa657f7	e32733de-a842-4193-b8d8-9a26c2e36eef	d849f917-4afe-4a94-8866-03848a938c79	4	35000	\N	0	\N	2026-08-13 09:25:17.074	completed
2956e4cc-6f15-4437-9ebf-b4fa7dfb1849	e32733de-a842-4193-b8d8-9a26c2e36eef	d849f917-4afe-4a94-8866-03848a938c79	4	35000	\N	0	\N	2026-08-13 09:25:17.074	completed
095d590d-03cf-4c13-ba38-3a0ba9a00faa	70bcff8e-1c94-41c0-9a41-d8459ab93056	2ce5c559-70e1-4bdd-8cf0-fcdf2a843273	2	46000	\N	0	\N	2026-08-13 09:25:17.078	completed
36c5cb81-83e3-4e6b-aa71-0c8668875c1d	70bcff8e-1c94-41c0-9a41-d8459ab93056	884570a1-2822-4840-a08f-fc4a4a3b5fad	1	48000	\N	0	\N	2026-08-13 09:25:17.078	completed
23f3092e-18c0-42c2-b05c-658461714157	70bcff8e-1c94-41c0-9a41-d8459ab93056	803bcdee-17d3-41fc-a249-4e8d16b49575	4	48000	\N	0	\N	2026-08-13 09:25:17.078	completed
8c2f3674-8b26-45c8-a432-a7789cc4fd01	70bcff8e-1c94-41c0-9a41-d8459ab93056	27af0495-2d91-4cb0-af88-4752edf671dc	1	10000	\N	0	\N	2026-08-13 09:25:17.078	completed
3084f8c2-41fe-45ec-9a2c-d24196eb1b32	d8d661de-c972-43b0-9421-397946aa9bba	83ff8a95-3eb4-4b98-9978-63aa6d1b8323	2	55000	\N	0	\N	2026-08-13 09:25:17.083	completed
cef34c74-6c43-4e1e-8cdf-519dbb9c57cf	d8d661de-c972-43b0-9421-397946aa9bba	5ba65aef-1f61-4c68-b8c1-d847553c8aef	4	52000	\N	0	\N	2026-08-13 09:25:17.083	completed
0971b70f-a682-482f-a824-e84368781ab0	d8d661de-c972-43b0-9421-397946aa9bba	803bcdee-17d3-41fc-a249-4e8d16b49575	1	48000	\N	0	\N	2026-08-13 09:25:17.083	completed
0c7f6bf0-48fa-475e-aa3a-b55a7d2a3dfd	2d4b5eb4-c9a0-4f34-af8b-32f75336c4a4	acb42a52-c717-441a-824b-8a18079ee46c	3	50000	\N	0	\N	2026-08-13 09:25:17.087	completed
f802077f-ca51-4ea6-8f0b-77d9f8b77d00	2d4b5eb4-c9a0-4f34-af8b-32f75336c4a4	efc81916-6661-422b-826f-c68049339458	4	28000	\N	0	\N	2026-08-13 09:25:17.087	completed
575ab5dd-8a53-48b5-a88f-a248f9bc6ba6	2d4b5eb4-c9a0-4f34-af8b-32f75336c4a4	b1ee3afc-db38-468c-a4bf-38b51b772024	3	20000	\N	0	\N	2026-08-13 09:25:17.087	completed
5096cbeb-58b7-415c-9c4d-d151a841d66a	2d4b5eb4-c9a0-4f34-af8b-32f75336c4a4	5bc34fc9-24c2-4108-af83-5992af2291d6	1	40000	\N	0	\N	2026-08-13 09:25:17.087	completed
bb20db37-8108-437a-9ede-a90d01ffd404	2d4b5eb4-c9a0-4f34-af8b-32f75336c4a4	eaa3fac9-f60f-4db1-b33a-a4bd46e8ea71	3	45000	\N	0	\N	2026-08-13 09:25:17.087	completed
5a460465-fbb5-4033-92f0-951e2ab6061a	2d4b5eb4-c9a0-4f34-af8b-32f75336c4a4	6798927c-bcba-49fd-a7ad-78291c69ac33	3	52000	\N	0	\N	2026-08-13 09:25:17.087	completed
a83f6fb8-b780-430b-aa32-235775c1133e	2d4b5eb4-c9a0-4f34-af8b-32f75336c4a4	bcff5008-981c-428b-b652-31d8c1378d9f	2	28000	\N	0	\N	2026-08-13 09:25:17.087	completed
64145e4e-c96f-4a15-8f4e-0815fa4bd85b	e0aaad70-7b94-4021-9135-ffb1a781f65b	81d6f3b5-b26a-4dd0-bfca-fea91a42a296	2	35000	\N	0	\N	2026-08-13 09:25:17.096	completed
16be4d65-9b41-4219-8be0-859b588acc78	e0aaad70-7b94-4021-9135-ffb1a781f65b	e9bd0cdf-4357-4313-8b02-7f8260f6992f	4	52000	\N	0	\N	2026-08-13 09:25:17.096	completed
c9bbdcae-ce9f-4ea1-b2e9-7fe5390df501	e0aaad70-7b94-4021-9135-ffb1a781f65b	7804beb7-b72c-43db-a27a-82b955e5e31c	3	25000	\N	0	\N	2026-08-13 09:25:17.096	completed
a3bbd77e-e261-4bfa-bf76-e1fc5c355cde	e0aaad70-7b94-4021-9135-ffb1a781f65b	0b97d8bc-ffce-4904-8c46-87752b930f5e	3	45000	\N	0	\N	2026-08-13 09:25:17.096	completed
4f5df3f3-4122-4487-9e2b-c7e987bd4c88	e0aaad70-7b94-4021-9135-ffb1a781f65b	c24edbc4-7c7a-4228-9b3c-1b95c2be051c	4	48000	\N	0	\N	2026-08-13 09:25:17.096	completed
b1a05137-f510-46e1-bc4a-d6f6554140ac	e0aaad70-7b94-4021-9135-ffb1a781f65b	e9bd0cdf-4357-4313-8b02-7f8260f6992f	4	52000	\N	0	\N	2026-08-13 09:25:17.096	completed
c09a25b4-cbdc-4291-8237-646d3f0d486e	e0aaad70-7b94-4021-9135-ffb1a781f65b	219c20d2-6247-4e8b-a734-53cfbd90ba88	1	52000	\N	0	\N	2026-08-13 09:25:17.096	completed
e66461e4-f421-4ae1-95f3-3464b9eb980c	e0aaad70-7b94-4021-9135-ffb1a781f65b	b6a4c689-bce0-4d87-883b-b0de919eba27	4	58000	\N	0	\N	2026-08-13 09:25:17.096	completed
a6e48635-de1a-4e64-a522-218d6a052c79	24c5f39b-df39-4af3-acc6-e60f362b1535	d52c0006-3bcd-48c7-ab83-082061dc6764	3	42000	\N	0	\N	2026-08-13 09:25:17.109	completed
6bce1331-3211-4ec0-887f-35559f9cdbec	24c5f39b-df39-4af3-acc6-e60f362b1535	b429cd3c-c501-4b4a-b028-9ab5feedc41e	3	52000	\N	0	\N	2026-08-13 09:25:17.109	completed
d6e888bc-fb0e-493a-b09b-68e8bc0b5ef4	24c5f39b-df39-4af3-acc6-e60f362b1535	83ceb824-bbdc-4b06-a867-037ded0aef0e	1	50000	\N	0	\N	2026-08-13 09:25:17.109	completed
afdf8b9b-30b0-47be-94e1-e0822d42d572	24c5f39b-df39-4af3-acc6-e60f362b1535	83ff8a95-3eb4-4b98-9978-63aa6d1b8323	3	55000	\N	0	\N	2026-08-13 09:25:17.109	completed
f4e7a720-b02a-45e6-8cda-487098f0f87e	24c5f39b-df39-4af3-acc6-e60f362b1535	c0917f04-365b-4cdc-9b75-e49a7c492727	2	48000	\N	0	\N	2026-08-13 09:25:17.109	completed
372cb2fc-d449-4d6d-a614-7ac9cb13405e	24c5f39b-df39-4af3-acc6-e60f362b1535	6798927c-bcba-49fd-a7ad-78291c69ac33	3	52000	\N	0	\N	2026-08-13 09:25:17.109	completed
f8fadd0e-72e5-4418-95d4-684120131248	24c5f39b-df39-4af3-acc6-e60f362b1535	f731a039-1a1f-413d-826c-0955bb9eea80	3	55000	\N	0	\N	2026-08-13 09:25:17.109	completed
adc55148-da18-46b5-80fc-275dab75f958	75496fc9-3394-4bf7-a2fd-9143c7c3d0ce	e9bd0cdf-4357-4313-8b02-7f8260f6992f	1	52000	\N	0	\N	2026-08-13 09:25:17.121	completed
df23e39e-e3e0-4b62-8595-4229a7ac5519	75496fc9-3394-4bf7-a2fd-9143c7c3d0ce	e24a6cc9-1b6e-4ba7-94a5-514f6aa8fe31	2	45000	\N	0	\N	2026-08-13 09:25:17.121	completed
b3c8cc52-78fe-4a60-8bf5-21fc62336a1d	75496fc9-3394-4bf7-a2fd-9143c7c3d0ce	00acd18c-4b3a-4737-a36c-530f2c16d3b6	3	38000	\N	0	\N	2026-08-13 09:25:17.121	completed
0fa94b08-f8d5-4fdf-9008-bd89ac1bcab6	75496fc9-3394-4bf7-a2fd-9143c7c3d0ce	e24a6cc9-1b6e-4ba7-94a5-514f6aa8fe31	4	45000	\N	0	\N	2026-08-13 09:25:17.121	completed
31083b63-e452-42d8-b56c-01c0386e549c	5f436b83-5736-49ff-a583-b01d0b3d4844	b429cd3c-c501-4b4a-b028-9ab5feedc41e	2	52000	\N	0	\N	2026-08-13 09:25:17.135	completed
4dadb871-9ed0-4c8a-b231-3d098003cad9	5f436b83-5736-49ff-a583-b01d0b3d4844	81d6f3b5-b26a-4dd0-bfca-fea91a42a296	3	35000	\N	0	\N	2026-08-13 09:25:17.135	completed
56a39896-5a02-4126-8521-2c67117bc7db	5f436b83-5736-49ff-a583-b01d0b3d4844	d9f1fb87-e737-4210-a5bf-1bc0ba885771	2	42000	\N	0	\N	2026-08-13 09:25:17.135	completed
108fa7e1-b9c5-4be6-84ed-2edb67b36b97	304bd31e-68d4-495e-b14f-41b0b18f6a5c	e718f02b-b657-444d-89ae-fb910537eb6c	3	42000	\N	0	\N	2026-08-13 09:25:17.147	completed
5a542e8b-11b6-4544-93c9-ab202837b892	304bd31e-68d4-495e-b14f-41b0b18f6a5c	96531f07-be37-454a-aa0c-4a0eaab99930	3	55000	\N	0	\N	2026-08-13 09:25:17.147	completed
418c96d7-e89d-4edd-9798-ffde91d9de11	304bd31e-68d4-495e-b14f-41b0b18f6a5c	10b0cc63-2c10-44ef-bf34-8d19b7fda2bb	1	55000	\N	0	\N	2026-08-13 09:25:17.147	completed
1696df91-43a2-4e39-9477-2c6e6cc82a26	304bd31e-68d4-495e-b14f-41b0b18f6a5c	5bc34fc9-24c2-4108-af83-5992af2291d6	1	40000	\N	0	\N	2026-08-13 09:25:17.147	completed
e02ff792-9f55-4bc4-82a1-8bdecfdbfc6c	304bd31e-68d4-495e-b14f-41b0b18f6a5c	51c45fec-e0e7-489e-8339-02a536d2e857	1	45000	\N	0	\N	2026-08-13 09:25:17.147	completed
31b0db86-8c44-4b47-945e-367cad84fd28	304bd31e-68d4-495e-b14f-41b0b18f6a5c	228cd2ca-0ce1-44ff-92d8-05b7c9480e55	1	42000	\N	0	\N	2026-08-13 09:25:17.147	completed
542a6456-3bc2-431c-8b0e-df1435c55961	304bd31e-68d4-495e-b14f-41b0b18f6a5c	308d182c-58a9-47d9-a56a-bba4a473ae24	1	42000	\N	0	\N	2026-08-13 09:25:17.147	completed
6d69800c-21b0-46d2-a16f-b1fc992264e2	20eeab6a-15d9-43f5-ace1-1d00ed56b77e	83ff8a95-3eb4-4b98-9978-63aa6d1b8323	4	55000	\N	0	\N	2026-08-13 09:25:17.158	completed
3a72b535-8b32-4777-8b4c-d8e62e63fa5a	20eeab6a-15d9-43f5-ace1-1d00ed56b77e	3a6ff9b1-cc6c-45ae-9635-ab2b2d03c232	3	38000	\N	0	\N	2026-08-13 09:25:17.158	completed
8a1aa157-69df-41fb-b716-da2e23f1d350	20eeab6a-15d9-43f5-ace1-1d00ed56b77e	d849f917-4afe-4a94-8866-03848a938c79	4	35000	\N	0	\N	2026-08-13 09:25:17.158	completed
daae31bd-9031-4ebb-a4d4-b275ff503f5d	46d66cca-506e-485d-9469-60af978690de	12b460b3-749d-4ab1-80de-d8f51d5188cc	1	40000	\N	0	\N	2026-08-13 09:25:17.176	completed
2c7dc3ef-8508-44ad-9950-5f007912f700	46d66cca-506e-485d-9469-60af978690de	7484d38a-54a0-49c7-baa2-a93fdce6d347	2	55000	\N	0	\N	2026-08-13 09:25:17.176	completed
c0276b0c-6204-49d9-be7a-6f88ad5e85da	46d66cca-506e-485d-9469-60af978690de	f731a039-1a1f-413d-826c-0955bb9eea80	4	55000	\N	0	\N	2026-08-13 09:25:17.176	completed
3e5bd4a9-a057-46a0-aa2b-7441c7fa2171	46d66cca-506e-485d-9469-60af978690de	7804beb7-b72c-43db-a27a-82b955e5e31c	1	25000	\N	0	\N	2026-08-13 09:25:17.176	completed
74d7ab2c-188d-49a8-b33b-46440aff5774	03c44a98-cc3d-4dcd-8bb3-bf88cce2dfbb	7804beb7-b72c-43db-a27a-82b955e5e31c	4	25000	\N	0	\N	2026-08-13 09:25:17.186	completed
96ff5b50-3270-4d4b-9685-ef9f4d7eb9b5	03c44a98-cc3d-4dcd-8bb3-bf88cce2dfbb	10b0cc63-2c10-44ef-bf34-8d19b7fda2bb	4	55000	\N	0	\N	2026-08-13 09:25:17.186	completed
08c7b359-8d08-4d38-bfbf-3d57d7e47a71	03c44a98-cc3d-4dcd-8bb3-bf88cce2dfbb	8f09b4ea-702e-4845-b2c0-59b3bf810d9d	3	38000	\N	0	\N	2026-08-13 09:25:17.186	completed
b00b6666-3580-4204-b496-62efc80ca036	03c44a98-cc3d-4dcd-8bb3-bf88cce2dfbb	c9ed90c7-689a-46ab-9fd2-84d017c264af	4	32000	\N	0	\N	2026-08-13 09:25:17.186	completed
a504a5ea-0724-4ef1-b833-9e62902ce104	b80ec5c6-2ba1-4261-8e2f-50a9186dc1a8	5ba65aef-1f61-4c68-b8c1-d847553c8aef	3	52000	\N	0	\N	2026-08-13 09:25:17.194	completed
2ab56b2d-9edc-49b1-bc30-bac0d3e42167	b80ec5c6-2ba1-4261-8e2f-50a9186dc1a8	83ceb824-bbdc-4b06-a867-037ded0aef0e	2	50000	\N	0	\N	2026-08-13 09:25:17.194	completed
9d642e32-b4c2-4da5-aa9c-5f85948bf8be	b80ec5c6-2ba1-4261-8e2f-50a9186dc1a8	daa4bd17-296f-4da1-8d21-15534fa8e045	1	25000	\N	0	\N	2026-08-13 09:25:17.194	completed
4bf65d93-d50c-4ba6-b9f1-f962d325b8d0	b80ec5c6-2ba1-4261-8e2f-50a9186dc1a8	0b97d8bc-ffce-4904-8c46-87752b930f5e	4	45000	\N	0	\N	2026-08-13 09:25:17.194	completed
3a4aa81b-c10f-4fed-a9b5-56f51cd7b406	b80ec5c6-2ba1-4261-8e2f-50a9186dc1a8	cbc78f47-cb0d-4d34-80e1-841ec7b0e5de	2	48000	\N	0	\N	2026-08-13 09:25:17.194	completed
fa0370ca-2eef-43b8-b96f-8d5d46cba60c	b80ec5c6-2ba1-4261-8e2f-50a9186dc1a8	e718f02b-b657-444d-89ae-fb910537eb6c	2	42000	\N	0	\N	2026-08-13 09:25:17.194	completed
5201488f-55d4-459e-a615-651b22d206ab	b80ec5c6-2ba1-4261-8e2f-50a9186dc1a8	e9bd0cdf-4357-4313-8b02-7f8260f6992f	3	52000	\N	0	\N	2026-08-13 09:25:17.194	completed
4e3d82fc-c966-49ea-9479-9db5d9b4a6ee	71839682-0231-44da-9405-d06a4c9be926	803bcdee-17d3-41fc-a249-4e8d16b49575	4	48000	\N	0	\N	2026-08-13 09:25:17.214	completed
ab4500aa-1d6c-47c3-91da-2c68d51779b1	71839682-0231-44da-9405-d06a4c9be926	12b460b3-749d-4ab1-80de-d8f51d5188cc	3	40000	\N	0	\N	2026-08-13 09:25:17.214	completed
19bed052-aef5-48e6-9b02-d9bdbdbfacee	71839682-0231-44da-9405-d06a4c9be926	30ef5deb-6b46-47d1-a98c-8bc060d62b44	4	45000	\N	0	\N	2026-08-13 09:25:17.214	completed
c7655cdc-0b45-4066-9e3a-123c44925c99	71839682-0231-44da-9405-d06a4c9be926	acb42a52-c717-441a-824b-8a18079ee46c	4	50000	\N	0	\N	2026-08-13 09:25:17.214	completed
189e1e8e-41b8-47d8-b578-1cc129533eb9	71839682-0231-44da-9405-d06a4c9be926	8f09b4ea-702e-4845-b2c0-59b3bf810d9d	2	38000	\N	0	\N	2026-08-13 09:25:17.214	completed
ccda8986-750d-4465-a1e0-c431e45bd414	71839682-0231-44da-9405-d06a4c9be926	884570a1-2822-4840-a08f-fc4a4a3b5fad	2	48000	\N	0	\N	2026-08-13 09:25:17.214	completed
8d8fdb78-fe39-4c04-a969-032e0828d8c1	d8e24537-d845-4961-ac9e-051c655e6775	cb1888fc-f827-4522-b136-a22bf86816c2	2	35000	\N	0	\N	2026-08-13 09:25:17.234	completed
2b90ac54-d8ca-4e4e-aaad-fa39b4bdbf18	d8e24537-d845-4961-ac9e-051c655e6775	2ce5c559-70e1-4bdd-8cf0-fcdf2a843273	4	46000	\N	0	\N	2026-08-13 09:25:17.234	completed
e70fa8c6-ef63-40f1-aca6-1e2f55a2a9e5	d8e24537-d845-4961-ac9e-051c655e6775	27af0495-2d91-4cb0-af88-4752edf671dc	3	10000	\N	0	\N	2026-08-13 09:25:17.234	completed
3e11db3e-4397-4be9-8018-b66b95ab7164	d8e24537-d845-4961-ac9e-051c655e6775	308d182c-58a9-47d9-a56a-bba4a473ae24	3	42000	\N	0	\N	2026-08-13 09:25:17.234	completed
2d34eaee-1cb4-484e-9071-9127550f04a5	d8e24537-d845-4961-ac9e-051c655e6775	00acd18c-4b3a-4737-a36c-530f2c16d3b6	1	38000	\N	0	\N	2026-08-13 09:25:17.234	completed
fcb266fd-d8aa-43d9-bef3-1cb8f877e6ca	d8e24537-d845-4961-ac9e-051c655e6775	cbc78f47-cb0d-4d34-80e1-841ec7b0e5de	4	48000	\N	0	\N	2026-08-13 09:25:17.234	completed
9d506806-5c4b-486d-bd27-422c3b0f81a4	d8e24537-d845-4961-ac9e-051c655e6775	5bc34fc9-24c2-4108-af83-5992af2291d6	1	40000	\N	0	\N	2026-08-13 09:25:17.234	completed
13ff2141-c8e5-4f7d-bedb-b4faf8c4928d	d8e24537-d845-4961-ac9e-051c655e6775	efc81916-6661-422b-826f-c68049339458	2	28000	\N	0	\N	2026-08-13 09:25:17.234	completed
e22a1518-b0c1-4875-9aee-a5cf6ce5715b	24a2e2c3-e380-4bee-9239-7570f8b5c936	f731a039-1a1f-413d-826c-0955bb9eea80	4	55000	\N	0	\N	2026-08-13 09:25:17.239	completed
42af44e4-47eb-4797-8e8d-fffa16a21367	24a2e2c3-e380-4bee-9239-7570f8b5c936	625d086d-e1db-42f3-9cd5-84006fb429c1	4	48000	\N	0	\N	2026-08-13 09:25:17.239	completed
6a26f57a-5e99-4857-bb0d-a0f606084db3	24a2e2c3-e380-4bee-9239-7570f8b5c936	c0917f04-365b-4cdc-9b75-e49a7c492727	3	48000	\N	0	\N	2026-08-13 09:25:17.239	completed
d07f2afd-6f18-4456-8706-9c38b60cc5f5	24a2e2c3-e380-4bee-9239-7570f8b5c936	228cd2ca-0ce1-44ff-92d8-05b7c9480e55	3	42000	\N	0	\N	2026-08-13 09:25:17.239	completed
8169cbd6-5cd1-454a-8f16-b79330d64125	413d274f-51c1-424c-b1d0-bc552fc3dbcd	83ceb824-bbdc-4b06-a867-037ded0aef0e	2	50000	\N	0	\N	2026-08-13 09:25:17.246	completed
85336c87-cb99-44d6-9e8c-b3360bfba0ae	413d274f-51c1-424c-b1d0-bc552fc3dbcd	35fbf376-436a-45ea-89a5-41560d3be32b	3	35000	\N	0	\N	2026-08-13 09:25:17.246	completed
09cf491f-835d-4b2d-b5f6-a26558686ee2	413d274f-51c1-424c-b1d0-bc552fc3dbcd	5ba65aef-1f61-4c68-b8c1-d847553c8aef	4	52000	\N	0	\N	2026-08-13 09:25:17.246	completed
f47ed901-eacd-47f7-ab54-69e44aa31e08	7e5a7e7a-2718-44ca-8d9a-9b64c2141474	d809adca-e256-41bc-b7b0-75df0d3f5dcb	2	35000	\N	0	\N	2026-08-13 09:25:17.257	completed
899c63fd-dead-440d-8408-038907440408	7e5a7e7a-2718-44ca-8d9a-9b64c2141474	625d086d-e1db-42f3-9cd5-84006fb429c1	1	48000	\N	0	\N	2026-08-13 09:25:17.257	completed
53979f97-b8f0-45b4-812c-1f3e10679296	7e5a7e7a-2718-44ca-8d9a-9b64c2141474	35fbf376-436a-45ea-89a5-41560d3be32b	4	35000	\N	0	\N	2026-08-13 09:25:17.257	completed
c4190025-f9c6-46e5-a5d6-afe5b7e40c5a	e7f6632b-7f8a-414d-827a-f378d921836b	7804beb7-b72c-43db-a27a-82b955e5e31c	3	25000	\N	0	\N	2026-08-13 09:25:17.263	completed
5bc993ae-16c8-41d1-bf9e-2170729bec81	e7f6632b-7f8a-414d-827a-f378d921836b	00acd18c-4b3a-4737-a36c-530f2c16d3b6	4	38000	\N	0	\N	2026-08-13 09:25:17.263	completed
9b21b605-2594-43f8-871d-5760d8f80f51	e7f6632b-7f8a-414d-827a-f378d921836b	ceed2a39-e4e2-486c-b228-a909a81d8487	1	20000	\N	0	\N	2026-08-13 09:25:17.263	completed
b5c44482-bd7d-4822-a4bf-86cc833a1c9e	e7f6632b-7f8a-414d-827a-f378d921836b	b6a4c689-bce0-4d87-883b-b0de919eba27	3	58000	\N	0	\N	2026-08-13 09:25:17.263	completed
e293c083-1927-449b-8413-e968bab69fc8	2a81c573-7b5b-457f-b97b-d4942f7908df	d849f917-4afe-4a94-8866-03848a938c79	1	35000	\N	0	\N	2026-08-13 09:25:17.278	completed
ec5925ab-f01d-4f17-bed8-0b9ffcec375c	2a81c573-7b5b-457f-b97b-d4942f7908df	7484d38a-54a0-49c7-baa2-a93fdce6d347	2	55000	\N	0	\N	2026-08-13 09:25:17.278	completed
49857862-2c12-41eb-8ca1-ba150d8722c2	2a81c573-7b5b-457f-b97b-d4942f7908df	228cd2ca-0ce1-44ff-92d8-05b7c9480e55	4	42000	\N	0	\N	2026-08-13 09:25:17.278	completed
207c9d4a-9980-4cf3-9eb3-1da99d4511cf	2a81c573-7b5b-457f-b97b-d4942f7908df	d9f1fb87-e737-4210-a5bf-1bc0ba885771	1	42000	\N	0	\N	2026-08-13 09:25:17.278	completed
74727361-7867-42a5-80ac-03537f9fd6a7	3bd58b58-4b26-4c27-89ff-ce4cb4ea8e28	e718f02b-b657-444d-89ae-fb910537eb6c	1	42000	\N	0	\N	2026-08-13 09:25:17.282	completed
8ddab3d4-3adc-43e1-9fb2-a758d5527de8	3bd58b58-4b26-4c27-89ff-ce4cb4ea8e28	3a6ff9b1-cc6c-45ae-9635-ab2b2d03c232	2	38000	\N	0	\N	2026-08-13 09:25:17.282	completed
d4edf928-9011-405c-a790-e428cfde8136	3bd58b58-4b26-4c27-89ff-ce4cb4ea8e28	3a6ff9b1-cc6c-45ae-9635-ab2b2d03c232	4	38000	\N	0	\N	2026-08-13 09:25:17.282	completed
e139fd07-7d11-47d0-8d74-fa4b06e537e4	3bd58b58-4b26-4c27-89ff-ce4cb4ea8e28	27af0495-2d91-4cb0-af88-4752edf671dc	4	10000	\N	0	\N	2026-08-13 09:25:17.282	completed
4cd5bda8-c4d4-4cdd-9795-5db86f3592fa	a931272e-461e-4818-960b-ac5d84718f97	eb1dae05-cb14-4000-ba10-260f9cd79124	2	45000	\N	0	\N	2026-08-13 09:25:17.291	completed
78ecffbd-f081-4766-859d-88c0934030a1	a931272e-461e-4818-960b-ac5d84718f97	83ceb824-bbdc-4b06-a867-037ded0aef0e	1	50000	\N	0	\N	2026-08-13 09:25:17.291	completed
e0b05944-07aa-420d-8517-7ee1aaabb278	a931272e-461e-4818-960b-ac5d84718f97	a02247ba-a10e-4387-967d-e69a05c8193a	2	32000	\N	0	\N	2026-08-13 09:25:17.291	completed
3616309d-3c6f-4702-9714-425b5f1e7214	a931272e-461e-4818-960b-ac5d84718f97	3aac02bc-fcc6-4532-9a50-fa50790dd4cb	2	32000	\N	0	\N	2026-08-13 09:25:17.291	completed
755c54e5-1b9a-49f3-9283-b28943db3ece	a931272e-461e-4818-960b-ac5d84718f97	5bc34fc9-24c2-4108-af83-5992af2291d6	1	40000	\N	0	\N	2026-08-13 09:25:17.291	completed
a9ac82b0-41b0-4ac6-90fc-8e791137345d	a931272e-461e-4818-960b-ac5d84718f97	308d182c-58a9-47d9-a56a-bba4a473ae24	3	42000	\N	0	\N	2026-08-13 09:25:17.291	completed
70ce5af7-ae1b-41b1-8ee5-e9d018afaa56	a931272e-461e-4818-960b-ac5d84718f97	86643a05-ac82-4216-bdf8-87fcd64da8ec	3	48000	\N	0	\N	2026-08-13 09:25:17.291	completed
11f5aefa-50a9-4249-abff-1870b1e6d55f	a931272e-461e-4818-960b-ac5d84718f97	e9bd0cdf-4357-4313-8b02-7f8260f6992f	2	52000	\N	0	\N	2026-08-13 09:25:17.291	completed
b9ffce80-4bee-4abc-bf61-fd7fd3bcc344	bde35d01-6efb-4409-bc59-0a227efcf441	3aac02bc-fcc6-4532-9a50-fa50790dd4cb	4	32000	\N	0	\N	2026-08-13 09:25:17.3	completed
08d921fb-ebf4-416d-8fe6-c8c72ab2522b	bde35d01-6efb-4409-bc59-0a227efcf441	7484d38a-54a0-49c7-baa2-a93fdce6d347	1	55000	\N	0	\N	2026-08-13 09:25:17.3	completed
e2f037b0-2b68-4cb9-bd63-c4daacff10c2	bde35d01-6efb-4409-bc59-0a227efcf441	c24edbc4-7c7a-4228-9b3c-1b95c2be051c	3	48000	\N	0	\N	2026-08-13 09:25:17.3	completed
fd473a23-5cad-4d17-9c51-d67af90436df	bde35d01-6efb-4409-bc59-0a227efcf441	a02247ba-a10e-4387-967d-e69a05c8193a	4	32000	\N	0	\N	2026-08-13 09:25:17.3	completed
b78b4811-6015-42a0-abe5-b4c01e78d78a	bde35d01-6efb-4409-bc59-0a227efcf441	ce6673bb-c51b-4a4f-ab3d-810e44601734	3	28000	\N	0	\N	2026-08-13 09:25:17.3	completed
f72ccbe4-fa4a-42ed-b7fa-ced0e48ec3a5	bde35d01-6efb-4409-bc59-0a227efcf441	cb1888fc-f827-4522-b136-a22bf86816c2	3	35000	\N	0	\N	2026-08-13 09:25:17.3	completed
f11f8ad9-f2dc-4028-9472-f990f8eb651a	bde35d01-6efb-4409-bc59-0a227efcf441	86643a05-ac82-4216-bdf8-87fcd64da8ec	3	48000	\N	0	\N	2026-08-13 09:25:17.3	completed
aeda12dd-0461-42a7-86af-c4a36982bd66	27d11210-9573-476a-aa6f-f8c2ec6db42d	ce6673bb-c51b-4a4f-ab3d-810e44601734	1	28000	\N	0	\N	2026-08-13 09:25:17.309	completed
2c0ae9bb-3cc0-4d1e-b160-bdf18f87ab62	27d11210-9573-476a-aa6f-f8c2ec6db42d	2ce5c559-70e1-4bdd-8cf0-fcdf2a843273	4	46000	\N	0	\N	2026-08-13 09:25:17.309	completed
eb9f4018-25d7-4e28-b813-b28f9893b374	27d11210-9573-476a-aa6f-f8c2ec6db42d	c0917f04-365b-4cdc-9b75-e49a7c492727	1	48000	\N	0	\N	2026-08-13 09:25:17.309	completed
e2fc7f8c-0ce2-405c-9283-8778603d320f	27d11210-9573-476a-aa6f-f8c2ec6db42d	884570a1-2822-4840-a08f-fc4a4a3b5fad	2	48000	\N	0	\N	2026-08-13 09:25:17.309	completed
f037a919-c787-4572-93de-db8360108a48	000f7ba5-06f8-4a65-a0e6-e2bfbbd64981	e9bd0cdf-4357-4313-8b02-7f8260f6992f	1	52000	\N	0	\N	2026-08-13 09:25:17.317	completed
f6aa943a-1bde-4427-90a7-fe91ee9d8bf9	000f7ba5-06f8-4a65-a0e6-e2bfbbd64981	d9f1fb87-e737-4210-a5bf-1bc0ba885771	2	42000	\N	0	\N	2026-08-13 09:25:17.317	completed
194a1d16-5b0d-4655-ae04-cf13f540f324	000f7ba5-06f8-4a65-a0e6-e2bfbbd64981	b1ee3afc-db38-468c-a4bf-38b51b772024	4	20000	\N	0	\N	2026-08-13 09:25:17.317	completed
0d371f6d-f404-43ea-81fd-9a9ae8e7a9b5	000f7ba5-06f8-4a65-a0e6-e2bfbbd64981	7804beb7-b72c-43db-a27a-82b955e5e31c	3	25000	\N	0	\N	2026-08-13 09:25:17.317	completed
b24eeb4d-a8e3-412e-8179-95a6e47c60f1	000f7ba5-06f8-4a65-a0e6-e2bfbbd64981	f731a039-1a1f-413d-826c-0955bb9eea80	1	55000	\N	0	\N	2026-08-13 09:25:17.317	completed
2831432a-26ef-4438-bf80-6808b7dcfe3e	000f7ba5-06f8-4a65-a0e6-e2bfbbd64981	6798927c-bcba-49fd-a7ad-78291c69ac33	3	52000	\N	0	\N	2026-08-13 09:25:17.317	completed
cb97f22a-afe2-4773-873e-f279d5e9f215	000f7ba5-06f8-4a65-a0e6-e2bfbbd64981	51c45fec-e0e7-489e-8339-02a536d2e857	2	45000	\N	0	\N	2026-08-13 09:25:17.317	completed
a11062bf-947c-42f3-ba16-db70fd8da28d	000f7ba5-06f8-4a65-a0e6-e2bfbbd64981	10b0cc63-2c10-44ef-bf34-8d19b7fda2bb	2	55000	\N	0	\N	2026-08-13 09:25:17.317	completed
34c7ad21-4a22-438c-ad0e-e53da501fc6a	b7f52d2c-6f6e-44d1-afe2-c97c5ff4cfcc	7484d38a-54a0-49c7-baa2-a93fdce6d347	1	55000	\N	0	\N	2026-08-13 09:25:17.325	completed
4aa9de12-16b5-4909-bb48-5b4f6f3bd2c7	b7f52d2c-6f6e-44d1-afe2-c97c5ff4cfcc	27af0495-2d91-4cb0-af88-4752edf671dc	2	10000	\N	0	\N	2026-08-13 09:25:17.325	completed
ba8b9b72-9729-4f3b-bba1-07f02de0a775	b7f52d2c-6f6e-44d1-afe2-c97c5ff4cfcc	d849f917-4afe-4a94-8866-03848a938c79	1	35000	\N	0	\N	2026-08-13 09:25:17.325	completed
3668f2a0-5b42-4593-acad-89ab5d53f08f	b7f52d2c-6f6e-44d1-afe2-c97c5ff4cfcc	7484d38a-54a0-49c7-baa2-a93fdce6d347	3	55000	\N	0	\N	2026-08-13 09:25:17.325	completed
daee6121-c282-49af-984a-c645f1e62757	b7f52d2c-6f6e-44d1-afe2-c97c5ff4cfcc	96531f07-be37-454a-aa0c-4a0eaab99930	2	55000	\N	0	\N	2026-08-13 09:25:17.325	completed
3122cab4-f97d-45f3-a476-c4258a8eaf35	b7f52d2c-6f6e-44d1-afe2-c97c5ff4cfcc	25a8343a-39c3-457e-9c1d-13689bd6469b	4	45000	\N	0	\N	2026-08-13 09:25:17.325	completed
9eed7906-97e9-4b0a-b27d-24a3a8a99337	b7f52d2c-6f6e-44d1-afe2-c97c5ff4cfcc	25a8343a-39c3-457e-9c1d-13689bd6469b	3	45000	\N	0	\N	2026-08-13 09:25:17.325	completed
e25462b8-c4c8-4032-b5cf-15bdaa46f9fa	b7f52d2c-6f6e-44d1-afe2-c97c5ff4cfcc	b429cd3c-c501-4b4a-b028-9ab5feedc41e	3	52000	\N	0	\N	2026-08-13 09:25:17.325	completed
7e16cec3-959f-4158-82d8-a0a06d93ef17	882aefea-c7ab-4d93-8270-c4a73d3610de	acb42a52-c717-441a-824b-8a18079ee46c	2	50000	\N	0	\N	2026-08-13 09:25:17.335	completed
c6ca19ed-4a69-4fea-9178-ce9cfcf9c74e	882aefea-c7ab-4d93-8270-c4a73d3610de	e24a6cc9-1b6e-4ba7-94a5-514f6aa8fe31	3	45000	\N	0	\N	2026-08-13 09:25:17.335	completed
d5c277b5-c7a5-4217-9ecd-0b67b570096b	882aefea-c7ab-4d93-8270-c4a73d3610de	0b97d8bc-ffce-4904-8c46-87752b930f5e	2	45000	\N	0	\N	2026-08-13 09:25:17.335	completed
ef097b13-2569-4305-b5d0-1aaaf059f42f	882aefea-c7ab-4d93-8270-c4a73d3610de	2ce5c559-70e1-4bdd-8cf0-fcdf2a843273	1	46000	\N	0	\N	2026-08-13 09:25:17.335	completed
d766bbd4-c0ff-4c5c-9ee8-e111b25100d2	882aefea-c7ab-4d93-8270-c4a73d3610de	daa4bd17-296f-4da1-8d21-15534fa8e045	2	25000	\N	0	\N	2026-08-13 09:25:17.335	completed
75addd41-38c9-4fa1-a787-5b946ef3d48d	882aefea-c7ab-4d93-8270-c4a73d3610de	01d338fc-cbda-492d-b496-2a55e100d813	2	45000	\N	0	\N	2026-08-13 09:25:17.335	completed
06c20d9d-0620-4910-92ed-8e97f49c9c55	bd6323a1-d006-497e-89af-dd18ee4fdebe	e9bd0cdf-4357-4313-8b02-7f8260f6992f	4	52000	\N	0	\N	2026-08-13 09:25:17.343	completed
2d175ce9-00a1-4ef5-9134-3baf37181de8	bd6323a1-d006-497e-89af-dd18ee4fdebe	b1ee3afc-db38-468c-a4bf-38b51b772024	3	20000	\N	0	\N	2026-08-13 09:25:17.343	completed
32cd2cd6-6bc0-4f7a-a595-7c0be09e76bd	bd6323a1-d006-497e-89af-dd18ee4fdebe	228cd2ca-0ce1-44ff-92d8-05b7c9480e55	3	42000	\N	0	\N	2026-08-13 09:25:17.343	completed
fa6ebc2e-4655-4e40-b906-d30f04752f28	373276b1-3e6e-4c28-b572-014fe25a6c48	27af0495-2d91-4cb0-af88-4752edf671dc	1	10000	\N	0	\N	2026-08-13 09:25:17.352	completed
1d685b63-ff1d-43e2-82ee-79e7405e172e	373276b1-3e6e-4c28-b572-014fe25a6c48	81d6f3b5-b26a-4dd0-bfca-fea91a42a296	1	35000	\N	0	\N	2026-08-13 09:25:17.352	completed
28fde3c0-8799-4f7a-86d4-70c5d358f742	373276b1-3e6e-4c28-b572-014fe25a6c48	308d182c-58a9-47d9-a56a-bba4a473ae24	4	42000	\N	0	\N	2026-08-13 09:25:17.352	completed
51e67eee-e77d-4d4b-a0a5-73ec700e44ac	373276b1-3e6e-4c28-b572-014fe25a6c48	a02247ba-a10e-4387-967d-e69a05c8193a	2	32000	\N	0	\N	2026-08-13 09:25:17.352	completed
e4dd2f0f-5fd1-4270-9667-928494d2bdeb	50ad577b-590b-438a-8fd1-06b17971b12b	2ce5c559-70e1-4bdd-8cf0-fcdf2a843273	3	46000	\N	0	\N	2026-08-13 09:25:17.356	completed
c0f00115-7945-4c1b-991d-81e2f839ce29	50ad577b-590b-438a-8fd1-06b17971b12b	35fbf376-436a-45ea-89a5-41560d3be32b	4	35000	\N	0	\N	2026-08-13 09:25:17.356	completed
234d02f9-c307-48a9-970a-ea39a1298f68	50ad577b-590b-438a-8fd1-06b17971b12b	35fbf376-436a-45ea-89a5-41560d3be32b	4	35000	\N	0	\N	2026-08-13 09:25:17.356	completed
ac59bcbe-2166-424c-8bf7-43501dccc08a	7e7669bc-4023-4901-aa41-7db516a0fd1c	efc81916-6661-422b-826f-c68049339458	1	28000	\N	0	\N	2026-08-13 09:25:17.364	completed
531b3981-16cc-44b1-94c6-5ffb85b18a13	7e7669bc-4023-4901-aa41-7db516a0fd1c	b1ee3afc-db38-468c-a4bf-38b51b772024	1	20000	\N	0	\N	2026-08-13 09:25:17.364	completed
c69f3b8f-ee4a-4da4-860d-467a9951705a	7e7669bc-4023-4901-aa41-7db516a0fd1c	eb1dae05-cb14-4000-ba10-260f9cd79124	1	45000	\N	0	\N	2026-08-13 09:25:17.364	completed
e250f1b8-8794-4848-9824-9d6405ce24ba	7e7669bc-4023-4901-aa41-7db516a0fd1c	c0917f04-365b-4cdc-9b75-e49a7c492727	4	48000	\N	0	\N	2026-08-13 09:25:17.364	completed
7b6bb7f2-f797-485e-b7cc-8ada005d9a30	7e7669bc-4023-4901-aa41-7db516a0fd1c	e9bd0cdf-4357-4313-8b02-7f8260f6992f	4	52000	\N	0	\N	2026-08-13 09:25:17.364	completed
025f0719-923c-439f-a7ef-7b3f5164377c	7e7669bc-4023-4901-aa41-7db516a0fd1c	7804beb7-b72c-43db-a27a-82b955e5e31c	1	25000	\N	0	\N	2026-08-13 09:25:17.364	completed
0c52bab5-6dc5-411c-824e-b9d3fd78e2d4	7e7669bc-4023-4901-aa41-7db516a0fd1c	7804beb7-b72c-43db-a27a-82b955e5e31c	4	25000	\N	0	\N	2026-08-13 09:25:17.364	completed
4cfcdae4-9d2e-4284-a681-92b907a71b26	7e7669bc-4023-4901-aa41-7db516a0fd1c	12b460b3-749d-4ab1-80de-d8f51d5188cc	4	40000	\N	0	\N	2026-08-13 09:25:17.364	completed
ff9f2d08-4ccf-4f06-8013-30814f246fd0	81665cd4-6de4-47c7-8d3a-99477b09bdcf	3a6ff9b1-cc6c-45ae-9635-ab2b2d03c232	1	38000	\N	0	\N	2026-08-13 09:25:17.374	completed
8c244c3c-fb78-49b3-a435-771bc45f1b92	81665cd4-6de4-47c7-8d3a-99477b09bdcf	c24edbc4-7c7a-4228-9b3c-1b95c2be051c	2	48000	\N	0	\N	2026-08-13 09:25:17.374	completed
2bb5fb88-7654-4d90-a157-0a707888ae4b	81665cd4-6de4-47c7-8d3a-99477b09bdcf	efc81916-6661-422b-826f-c68049339458	2	28000	\N	0	\N	2026-08-13 09:25:17.374	completed
e7e71780-f9b4-49b3-9b6e-87d9ff4a59f7	81665cd4-6de4-47c7-8d3a-99477b09bdcf	e24a6cc9-1b6e-4ba7-94a5-514f6aa8fe31	4	45000	\N	0	\N	2026-08-13 09:25:17.374	completed
751f08b9-70a9-4e98-946c-1e9c6dbfa85b	81665cd4-6de4-47c7-8d3a-99477b09bdcf	25a8343a-39c3-457e-9c1d-13689bd6469b	1	45000	\N	0	\N	2026-08-13 09:25:17.374	completed
af0eddc2-6dfc-4320-aefb-fca1b213aee8	2f3ac4e0-723d-4c8a-bde8-e9b27fd96933	c0917f04-365b-4cdc-9b75-e49a7c492727	3	48000	\N	0	\N	2026-08-13 09:25:17.383	completed
8e532e2c-26c2-4976-b48c-0af7cf862c25	2f3ac4e0-723d-4c8a-bde8-e9b27fd96933	884570a1-2822-4840-a08f-fc4a4a3b5fad	3	48000	\N	0	\N	2026-08-13 09:25:17.383	completed
99907972-7acb-47f0-9664-d1671cecc659	2f3ac4e0-723d-4c8a-bde8-e9b27fd96933	daa4bd17-296f-4da1-8d21-15534fa8e045	4	25000	\N	0	\N	2026-08-13 09:25:17.383	completed
c9b4bc07-a4eb-4b92-9068-cd184fbc4c84	2f3ac4e0-723d-4c8a-bde8-e9b27fd96933	8f09b4ea-702e-4845-b2c0-59b3bf810d9d	3	38000	\N	0	\N	2026-08-13 09:25:17.383	completed
95f96529-9139-4f2d-aca0-9440ef0252f2	2f3ac4e0-723d-4c8a-bde8-e9b27fd96933	10b0cc63-2c10-44ef-bf34-8d19b7fda2bb	3	55000	\N	0	\N	2026-08-13 09:25:17.383	completed
18eec6ec-2caf-4c11-8600-eeaf5e4ba6af	c13dba7c-f84c-4ba7-9d26-20e7011b0d6f	10b0cc63-2c10-44ef-bf34-8d19b7fda2bb	3	55000	\N	0	\N	2026-08-13 09:25:17.392	completed
e703a324-fe13-4a6c-9283-37e382782a46	c13dba7c-f84c-4ba7-9d26-20e7011b0d6f	30ef5deb-6b46-47d1-a98c-8bc060d62b44	1	45000	\N	0	\N	2026-08-13 09:25:17.392	completed
d55f4a71-93e8-4c91-bfef-1cb1dbf2d156	c13dba7c-f84c-4ba7-9d26-20e7011b0d6f	d52c0006-3bcd-48c7-ab83-082061dc6764	4	42000	\N	0	\N	2026-08-13 09:25:17.392	completed
05fd0089-a581-422e-9c24-0d7b09e04c03	c13dba7c-f84c-4ba7-9d26-20e7011b0d6f	d52c0006-3bcd-48c7-ab83-082061dc6764	4	42000	\N	0	\N	2026-08-13 09:25:17.392	completed
96346e9e-8649-4122-a446-4f3b668e190a	c13dba7c-f84c-4ba7-9d26-20e7011b0d6f	83ff8a95-3eb4-4b98-9978-63aa6d1b8323	4	55000	\N	0	\N	2026-08-13 09:25:17.392	completed
05f468bf-5be3-455d-845a-c8533110a655	c13dba7c-f84c-4ba7-9d26-20e7011b0d6f	bcff5008-981c-428b-b652-31d8c1378d9f	2	28000	\N	0	\N	2026-08-13 09:25:17.392	completed
ff0d4b60-f4f1-48de-b89d-5b42bb0dd02c	d7179d6a-d2dc-4c31-a44e-c1270b24ac70	5bc34fc9-24c2-4108-af83-5992af2291d6	4	40000	\N	0	\N	2026-08-13 09:25:17.401	completed
674e45b1-d4ca-4ea1-81cc-48a3a6e44c53	d7179d6a-d2dc-4c31-a44e-c1270b24ac70	c24edbc4-7c7a-4228-9b3c-1b95c2be051c	4	48000	\N	0	\N	2026-08-13 09:25:17.401	completed
f1eed7d1-4a50-4600-a01d-ac26bb6a457f	d7179d6a-d2dc-4c31-a44e-c1270b24ac70	c0917f04-365b-4cdc-9b75-e49a7c492727	2	48000	\N	0	\N	2026-08-13 09:25:17.401	completed
a1094918-875e-4de9-a0eb-2a9370778e51	739fd426-b4ef-4312-bbab-67ce76acd733	efc81916-6661-422b-826f-c68049339458	3	28000	\N	0	\N	2026-08-13 09:25:17.409	completed
97ab2c00-7a57-4c37-820d-185fa1007b79	739fd426-b4ef-4312-bbab-67ce76acd733	625d086d-e1db-42f3-9cd5-84006fb429c1	3	48000	\N	0	\N	2026-08-13 09:25:17.409	completed
53088396-c540-4ae9-86e1-41d4ad6b650e	739fd426-b4ef-4312-bbab-67ce76acd733	d9f1fb87-e737-4210-a5bf-1bc0ba885771	3	42000	\N	0	\N	2026-08-13 09:25:17.409	completed
2da3b62a-c74f-435c-b848-751b7c716e24	739fd426-b4ef-4312-bbab-67ce76acd733	5bc34fc9-24c2-4108-af83-5992af2291d6	3	40000	\N	0	\N	2026-08-13 09:25:17.409	completed
840af94b-1cdc-4ba0-aeb7-761e4df32364	739fd426-b4ef-4312-bbab-67ce76acd733	c24edbc4-7c7a-4228-9b3c-1b95c2be051c	2	48000	\N	0	\N	2026-08-13 09:25:17.409	completed
2b322a26-a3c6-456b-8c71-f41d6fda7aa1	739fd426-b4ef-4312-bbab-67ce76acd733	7484d38a-54a0-49c7-baa2-a93fdce6d347	4	55000	\N	0	\N	2026-08-13 09:25:17.409	completed
ba4352ce-3bd4-4f2c-a42b-abbf2230fa50	28fae993-6ab8-4521-8170-419f97320813	faead849-9d7b-4831-b60e-20222fee6c1f	1	48000	\N	0	\N	2026-08-13 09:25:17.413	completed
ba4e0f87-d136-40ec-8b78-251c1cf70b30	28fae993-6ab8-4521-8170-419f97320813	e9bd0cdf-4357-4313-8b02-7f8260f6992f	4	52000	\N	0	\N	2026-08-13 09:25:17.413	completed
16ead095-398b-4365-9744-3d921155d2ad	28fae993-6ab8-4521-8170-419f97320813	ceed2a39-e4e2-486c-b228-a909a81d8487	2	20000	\N	0	\N	2026-08-13 09:25:17.413	completed
a9f65397-2a8a-4bdb-b664-16f1b23d7cdb	5cee9486-df96-4668-a3a4-80c875d37cae	5ba65aef-1f61-4c68-b8c1-d847553c8aef	4	52000	\N	0	\N	2026-08-13 09:25:17.422	completed
1da95e23-30c3-48db-a93b-1f3af6c4f0f4	5cee9486-df96-4668-a3a4-80c875d37cae	7484d38a-54a0-49c7-baa2-a93fdce6d347	4	55000	\N	0	\N	2026-08-13 09:25:17.422	completed
09339793-3ed3-46c3-9908-71494e5d5f5a	5cee9486-df96-4668-a3a4-80c875d37cae	35fbf376-436a-45ea-89a5-41560d3be32b	3	35000	\N	0	\N	2026-08-13 09:25:17.422	completed
3bc72486-f536-4244-a606-711af625c596	5cee9486-df96-4668-a3a4-80c875d37cae	83ceb824-bbdc-4b06-a867-037ded0aef0e	1	50000	\N	0	\N	2026-08-13 09:25:17.422	completed
f3fd9168-df03-4022-9246-c9b64bcf4499	5cee9486-df96-4668-a3a4-80c875d37cae	81d6f3b5-b26a-4dd0-bfca-fea91a42a296	1	35000	\N	0	\N	2026-08-13 09:25:17.422	completed
85f305fe-a0f9-43bd-9182-17f0fede2221	5cee9486-df96-4668-a3a4-80c875d37cae	cb1888fc-f827-4522-b136-a22bf86816c2	4	35000	\N	0	\N	2026-08-13 09:25:17.422	completed
cf328eb7-1ffc-4ebd-bd90-674a1eda8fc2	db9602cf-163a-48f0-9c49-bff1c428a7b3	d849f917-4afe-4a94-8866-03848a938c79	1	35000	\N	0	\N	2026-08-13 09:25:17.43	completed
a0938e0f-8693-4249-8ad2-1abc4945d7fc	db9602cf-163a-48f0-9c49-bff1c428a7b3	83ff8a95-3eb4-4b98-9978-63aa6d1b8323	3	55000	\N	0	\N	2026-08-13 09:25:17.43	completed
84989461-da98-4381-bb35-b2853cd1470c	db9602cf-163a-48f0-9c49-bff1c428a7b3	884570a1-2822-4840-a08f-fc4a4a3b5fad	3	48000	\N	0	\N	2026-08-13 09:25:17.43	completed
b68f3a80-9f32-4c21-8161-4f81362f6ebf	db9602cf-163a-48f0-9c49-bff1c428a7b3	01d338fc-cbda-492d-b496-2a55e100d813	3	45000	\N	0	\N	2026-08-13 09:25:17.43	completed
aaaa754f-0441-4395-9f11-d07bebe0aae7	db9602cf-163a-48f0-9c49-bff1c428a7b3	daa4bd17-296f-4da1-8d21-15534fa8e045	1	25000	\N	0	\N	2026-08-13 09:25:17.43	completed
4fe1ac49-0fae-46aa-b2fa-8e57d356babf	db9602cf-163a-48f0-9c49-bff1c428a7b3	b429cd3c-c501-4b4a-b028-9ab5feedc41e	2	52000	\N	0	\N	2026-08-13 09:25:17.43	completed
3bda1986-bc62-4b5b-a2cf-d54ee995f949	db9602cf-163a-48f0-9c49-bff1c428a7b3	308d182c-58a9-47d9-a56a-bba4a473ae24	1	42000	\N	0	\N	2026-08-13 09:25:17.43	completed
f95fcf27-3b3a-41dd-aaab-fed8c67ca2c5	db9602cf-163a-48f0-9c49-bff1c428a7b3	35fbf376-436a-45ea-89a5-41560d3be32b	2	35000	\N	0	\N	2026-08-13 09:25:17.43	completed
f667ff85-4386-4395-b539-a83a24dd174b	5529c415-66b5-4086-a1c6-a793eb85f4ec	ce6673bb-c51b-4a4f-ab3d-810e44601734	1	28000	\N	0	\N	2026-08-13 09:25:17.439	completed
24fba31a-1a76-4322-9fed-489a630994f5	5529c415-66b5-4086-a1c6-a793eb85f4ec	3aac02bc-fcc6-4532-9a50-fa50790dd4cb	1	32000	\N	0	\N	2026-08-13 09:25:17.439	completed
2c59b491-9258-482b-976d-d4b7db6fe6c6	5529c415-66b5-4086-a1c6-a793eb85f4ec	86643a05-ac82-4216-bdf8-87fcd64da8ec	1	48000	\N	0	\N	2026-08-13 09:25:17.439	completed
ee734763-b0a0-4744-b99a-e5cdb5ab9055	2c8572a8-6001-4d5f-abab-9e43023121fe	3aac02bc-fcc6-4532-9a50-fa50790dd4cb	2	32000	\N	0	\N	2026-08-13 09:25:17.448	completed
509ce1bb-e0f3-42d4-88b2-c4b6471166be	2c8572a8-6001-4d5f-abab-9e43023121fe	d52c0006-3bcd-48c7-ab83-082061dc6764	4	42000	\N	0	\N	2026-08-13 09:25:17.448	completed
921df5fa-062f-4c21-8110-7f33ef37fc61	2c8572a8-6001-4d5f-abab-9e43023121fe	d52c0006-3bcd-48c7-ab83-082061dc6764	4	42000	\N	0	\N	2026-08-13 09:25:17.448	completed
6b5990e4-d6fc-49b2-b3ae-f55a5ca75953	2c8572a8-6001-4d5f-abab-9e43023121fe	30ef5deb-6b46-47d1-a98c-8bc060d62b44	2	45000	\N	0	\N	2026-08-13 09:25:17.448	completed
e36aa48d-6d51-45b7-922b-5a14c85470d4	2c8572a8-6001-4d5f-abab-9e43023121fe	bcff5008-981c-428b-b652-31d8c1378d9f	1	28000	\N	0	\N	2026-08-13 09:25:17.448	completed
619970e9-b51b-4b8f-8b31-fb692fc6f428	2c8572a8-6001-4d5f-abab-9e43023121fe	cb1888fc-f827-4522-b136-a22bf86816c2	2	35000	\N	0	\N	2026-08-13 09:25:17.448	completed
f056072b-f87c-4db7-b888-91dac3de2827	2c8572a8-6001-4d5f-abab-9e43023121fe	10b0cc63-2c10-44ef-bf34-8d19b7fda2bb	2	55000	\N	0	\N	2026-08-13 09:25:17.448	completed
7db0b7f0-1e04-420f-adfc-75be165c39f2	2c8572a8-6001-4d5f-abab-9e43023121fe	219c20d2-6247-4e8b-a734-53cfbd90ba88	3	52000	\N	0	\N	2026-08-13 09:25:17.448	completed
bf2d244d-e177-42d5-bd1b-0fa6c0f7abbc	187631c0-5a42-4af7-bad6-893847572d0f	c0917f04-365b-4cdc-9b75-e49a7c492727	4	48000	\N	0	\N	2026-08-13 09:25:17.457	completed
f967258c-a818-4cfa-9d58-d30414041a91	187631c0-5a42-4af7-bad6-893847572d0f	0b97d8bc-ffce-4904-8c46-87752b930f5e	2	45000	\N	0	\N	2026-08-13 09:25:17.457	completed
43b4ff68-8c45-4c8b-98a1-d2e183c12a35	187631c0-5a42-4af7-bad6-893847572d0f	7804beb7-b72c-43db-a27a-82b955e5e31c	1	25000	\N	0	\N	2026-08-13 09:25:17.457	completed
e77b1ed1-cb6c-4714-b0e8-c514ea14be45	187631c0-5a42-4af7-bad6-893847572d0f	c24edbc4-7c7a-4228-9b3c-1b95c2be051c	4	48000	\N	0	\N	2026-08-13 09:25:17.457	completed
4eee1aea-4a7f-43fb-aa1d-eff9f80a6045	187631c0-5a42-4af7-bad6-893847572d0f	d809adca-e256-41bc-b7b0-75df0d3f5dcb	1	35000	\N	0	\N	2026-08-13 09:25:17.457	completed
3d843b00-9697-42d0-9d88-650cb66ec29b	187631c0-5a42-4af7-bad6-893847572d0f	25a8343a-39c3-457e-9c1d-13689bd6469b	1	45000	\N	0	\N	2026-08-13 09:25:17.457	completed
2cad27e8-7e0e-46bd-84f5-13347713462e	187631c0-5a42-4af7-bad6-893847572d0f	803bcdee-17d3-41fc-a249-4e8d16b49575	2	48000	\N	0	\N	2026-08-13 09:25:17.457	completed
9430017d-3c91-4a67-8d4f-3f9f1df68243	187631c0-5a42-4af7-bad6-893847572d0f	884570a1-2822-4840-a08f-fc4a4a3b5fad	3	48000	\N	0	\N	2026-08-13 09:25:17.457	completed
c524f9de-a63a-4d46-884c-11e96f41ec65	0232c90a-be47-405b-964a-60b938d9143a	803bcdee-17d3-41fc-a249-4e8d16b49575	1	48000	\N	0	\N	2026-08-13 09:25:17.468	completed
d5378efd-7dc3-4f9b-af36-0e9bf0ef6b7a	0232c90a-be47-405b-964a-60b938d9143a	acb42a52-c717-441a-824b-8a18079ee46c	3	50000	\N	0	\N	2026-08-13 09:25:17.468	completed
e40682ee-fb59-4e0f-bd67-00e2f73cbfee	0232c90a-be47-405b-964a-60b938d9143a	eb1dae05-cb14-4000-ba10-260f9cd79124	4	45000	\N	0	\N	2026-08-13 09:25:17.468	completed
bfccae68-9fcd-4205-b96e-fdf2b54d0f7a	0232c90a-be47-405b-964a-60b938d9143a	d21a6806-fffa-4462-b33f-2c91a1c6b013	2	50000	\N	0	\N	2026-08-13 09:25:17.468	completed
7afcabf3-1f46-4a8c-83de-423d53fcf0f4	0232c90a-be47-405b-964a-60b938d9143a	35fbf376-436a-45ea-89a5-41560d3be32b	2	35000	\N	0	\N	2026-08-13 09:25:17.468	completed
4facacb4-7103-43b1-8372-f3b07937fd6f	0232c90a-be47-405b-964a-60b938d9143a	b6a4c689-bce0-4d87-883b-b0de919eba27	1	58000	\N	0	\N	2026-08-13 09:25:17.468	completed
bc5675fd-a0b0-47d6-8b41-6dd4633ef140	0232c90a-be47-405b-964a-60b938d9143a	2ce5c559-70e1-4bdd-8cf0-fcdf2a843273	2	46000	\N	0	\N	2026-08-13 09:25:17.468	completed
dde3ef9c-d3af-4f0f-96dc-52e3b469738a	0232c90a-be47-405b-964a-60b938d9143a	bcff5008-981c-428b-b652-31d8c1378d9f	2	28000	\N	0	\N	2026-08-13 09:25:17.468	completed
39110fbb-3d07-46d9-9fcd-9587d88b0769	1070f283-7ea0-4b67-a629-ceec25defe19	d52c0006-3bcd-48c7-ab83-082061dc6764	1	42000	\N	0	\N	2026-08-13 09:25:17.479	completed
efc45307-6fc8-47cc-8543-33d9aa70d862	1070f283-7ea0-4b67-a629-ceec25defe19	e718f02b-b657-444d-89ae-fb910537eb6c	4	42000	\N	0	\N	2026-08-13 09:25:17.479	completed
d93ba0bf-b555-42e7-9296-98fb196bb33b	1070f283-7ea0-4b67-a629-ceec25defe19	c0917f04-365b-4cdc-9b75-e49a7c492727	4	48000	\N	0	\N	2026-08-13 09:25:17.479	completed
58ea24de-a342-4ecf-bef7-499147556263	1070f283-7ea0-4b67-a629-ceec25defe19	625d086d-e1db-42f3-9cd5-84006fb429c1	4	48000	\N	0	\N	2026-08-13 09:25:17.479	completed
27dd41b2-5cdb-4376-87a5-be2655607b87	1070f283-7ea0-4b67-a629-ceec25defe19	83ceb824-bbdc-4b06-a867-037ded0aef0e	4	50000	\N	0	\N	2026-08-13 09:25:17.479	completed
ead682bd-df8a-40fb-bbf4-b710a75988dc	0603d225-e5dc-4f87-949e-19496497203e	83ff8a95-3eb4-4b98-9978-63aa6d1b8323	1	55000	\N	0	\N	2026-08-13 09:25:17.488	completed
20f53c84-8895-4d39-b033-3dff792fb952	0603d225-e5dc-4f87-949e-19496497203e	884570a1-2822-4840-a08f-fc4a4a3b5fad	3	48000	\N	0	\N	2026-08-13 09:25:17.488	completed
afeb46e0-5f29-4643-bbc7-f8a84fd9c24a	0603d225-e5dc-4f87-949e-19496497203e	bcff5008-981c-428b-b652-31d8c1378d9f	2	28000	\N	0	\N	2026-08-13 09:25:17.488	completed
9e907502-83e9-405d-b76a-0fe3b40b1133	0603d225-e5dc-4f87-949e-19496497203e	f731a039-1a1f-413d-826c-0955bb9eea80	4	55000	\N	0	\N	2026-08-13 09:25:17.488	completed
cc51b237-f2fe-427a-a133-3eeb0bf1fcef	0b74b501-6175-4347-aeb9-5f26663470a9	e9bd0cdf-4357-4313-8b02-7f8260f6992f	4	52000	\N	0	\N	2026-08-13 09:25:17.497	completed
874fd343-78d2-4bb2-9099-a72684007107	0b74b501-6175-4347-aeb9-5f26663470a9	e9bd0cdf-4357-4313-8b02-7f8260f6992f	2	52000	\N	0	\N	2026-08-13 09:25:17.497	completed
24ff84f3-ed45-4c21-82ee-44c85cddda8d	0b74b501-6175-4347-aeb9-5f26663470a9	12b460b3-749d-4ab1-80de-d8f51d5188cc	2	40000	\N	0	\N	2026-08-13 09:25:17.497	completed
c0c92fea-31cc-4c4b-9afd-0ff4a4edca14	0b74b501-6175-4347-aeb9-5f26663470a9	5ba65aef-1f61-4c68-b8c1-d847553c8aef	4	52000	\N	0	\N	2026-08-13 09:25:17.497	completed
2c1dd119-0e8b-422e-9d6a-4cf555b35560	0b74b501-6175-4347-aeb9-5f26663470a9	cb1888fc-f827-4522-b136-a22bf86816c2	1	35000	\N	0	\N	2026-08-13 09:25:17.497	completed
a0548392-693b-440a-a54b-4ad12073eae1	0b74b501-6175-4347-aeb9-5f26663470a9	83ceb824-bbdc-4b06-a867-037ded0aef0e	2	50000	\N	0	\N	2026-08-13 09:25:17.497	completed
cadff044-f71e-4695-be35-9bee053cfb76	0b74b501-6175-4347-aeb9-5f26663470a9	7484d38a-54a0-49c7-baa2-a93fdce6d347	2	55000	\N	0	\N	2026-08-13 09:25:17.497	completed
9454a9fa-6bac-4d1c-a25b-5de0fc0488f2	0b74b501-6175-4347-aeb9-5f26663470a9	30ef5deb-6b46-47d1-a98c-8bc060d62b44	4	45000	\N	0	\N	2026-08-13 09:25:17.497	completed
6767d4bb-5df6-4909-b5aa-efa4f575c9ee	8c1feb2c-0d89-4a9f-a307-0579817f8eab	12b460b3-749d-4ab1-80de-d8f51d5188cc	3	40000	\N	0	\N	2026-08-13 09:25:17.506	completed
2f75d771-212f-4653-b7e0-74641b505bfb	8c1feb2c-0d89-4a9f-a307-0579817f8eab	01d338fc-cbda-492d-b496-2a55e100d813	4	45000	\N	0	\N	2026-08-13 09:25:17.506	completed
a3d8fd76-4ef2-4ebc-9ea8-eb90a91c6e87	8c1feb2c-0d89-4a9f-a307-0579817f8eab	81d6f3b5-b26a-4dd0-bfca-fea91a42a296	2	35000	\N	0	\N	2026-08-13 09:25:17.506	completed
31a19ebb-9e27-4a56-a838-71b45ef49ffd	8c1feb2c-0d89-4a9f-a307-0579817f8eab	f731a039-1a1f-413d-826c-0955bb9eea80	3	55000	\N	0	\N	2026-08-13 09:25:17.506	completed
40cbebff-f573-4f60-bf31-2822ce5030b9	84ebfad7-b488-4282-8eec-86946c235032	daa4bd17-296f-4da1-8d21-15534fa8e045	4	25000	\N	0	\N	2026-08-13 09:25:17.515	completed
afbc3ad9-766f-4200-bafa-4fb91bfbab89	84ebfad7-b488-4282-8eec-86946c235032	8f09b4ea-702e-4845-b2c0-59b3bf810d9d	3	38000	\N	0	\N	2026-08-13 09:25:17.515	completed
b4c2a0d7-ac5a-4ec9-ad91-ce7e48c4e094	84ebfad7-b488-4282-8eec-86946c235032	d809adca-e256-41bc-b7b0-75df0d3f5dcb	2	35000	\N	0	\N	2026-08-13 09:25:17.515	completed
e6cf03a6-81ec-4b1e-8083-931df32821d3	84ebfad7-b488-4282-8eec-86946c235032	81d6f3b5-b26a-4dd0-bfca-fea91a42a296	3	35000	\N	0	\N	2026-08-13 09:25:17.515	completed
a0c3a317-fcd3-413f-9f86-680864b69155	84ebfad7-b488-4282-8eec-86946c235032	daa4bd17-296f-4da1-8d21-15534fa8e045	3	25000	\N	0	\N	2026-08-13 09:25:17.515	completed
fb371a13-fbaf-45cb-8600-68550df1db06	84ebfad7-b488-4282-8eec-86946c235032	eb1dae05-cb14-4000-ba10-260f9cd79124	1	45000	\N	0	\N	2026-08-13 09:25:17.515	completed
4466e9b9-59de-46a1-9285-fa5678f8bb25	84ebfad7-b488-4282-8eec-86946c235032	cbc78f47-cb0d-4d34-80e1-841ec7b0e5de	2	48000	\N	0	\N	2026-08-13 09:25:17.515	completed
411e7007-2ea0-41dc-be93-9a8513d71588	69e326b5-bc18-481d-b0d3-3dab60b8a13f	7804beb7-b72c-43db-a27a-82b955e5e31c	2	25000	\N	0	\N	2026-08-13 09:25:17.525	completed
8ccae777-b1d0-4472-bd14-75f77df03839	69e326b5-bc18-481d-b0d3-3dab60b8a13f	acb42a52-c717-441a-824b-8a18079ee46c	1	50000	\N	0	\N	2026-08-13 09:25:17.525	completed
99680c54-c9ef-4c55-8dd2-e533080e262b	69e326b5-bc18-481d-b0d3-3dab60b8a13f	5bc34fc9-24c2-4108-af83-5992af2291d6	3	40000	\N	0	\N	2026-08-13 09:25:17.525	completed
8a38a728-fe71-4402-8ff5-c67c2778d6dc	69e326b5-bc18-481d-b0d3-3dab60b8a13f	e718f02b-b657-444d-89ae-fb910537eb6c	3	42000	\N	0	\N	2026-08-13 09:25:17.525	completed
5a271ba5-fdb4-4240-9ae1-c43520a9cede	69e326b5-bc18-481d-b0d3-3dab60b8a13f	27af0495-2d91-4cb0-af88-4752edf671dc	1	10000	\N	0	\N	2026-08-13 09:25:17.525	completed
275bc847-98d7-4fad-b098-ce3ff666bddb	0d462aa1-2d29-4cef-b880-32803c3877fd	e9bd0cdf-4357-4313-8b02-7f8260f6992f	4	52000	\N	0	\N	2026-08-13 09:25:17.535	completed
73238937-68a5-4c09-bc81-3e5f3e030d7e	0d462aa1-2d29-4cef-b880-32803c3877fd	e9bd0cdf-4357-4313-8b02-7f8260f6992f	3	52000	\N	0	\N	2026-08-13 09:25:17.535	completed
36bf60cb-3323-48a8-89ce-3914e19affaa	0d462aa1-2d29-4cef-b880-32803c3877fd	35fbf376-436a-45ea-89a5-41560d3be32b	1	35000	\N	0	\N	2026-08-13 09:25:17.535	completed
ba066216-3fd3-417d-ad61-b4fecc9267cc	0d462aa1-2d29-4cef-b880-32803c3877fd	faead849-9d7b-4831-b60e-20222fee6c1f	2	48000	\N	0	\N	2026-08-13 09:25:17.535	completed
9b547b1d-79ba-41e6-a62f-79c10473137b	0d462aa1-2d29-4cef-b880-32803c3877fd	86643a05-ac82-4216-bdf8-87fcd64da8ec	4	48000	\N	0	\N	2026-08-13 09:25:17.535	completed
73f2c39c-0f5a-453c-af3a-e92cb2311eac	0d462aa1-2d29-4cef-b880-32803c3877fd	ce6673bb-c51b-4a4f-ab3d-810e44601734	3	28000	\N	0	\N	2026-08-13 09:25:17.535	completed
c3804cab-1431-408e-9689-8c8da53b8a56	76e799f2-0bab-4273-8d3a-0a26fe065249	884570a1-2822-4840-a08f-fc4a4a3b5fad	3	48000	\N	0	\N	2026-08-13 09:25:17.544	completed
fd413aad-1dbf-4530-be22-67e8a821b8f6	76e799f2-0bab-4273-8d3a-0a26fe065249	83ff8a95-3eb4-4b98-9978-63aa6d1b8323	1	55000	\N	0	\N	2026-08-13 09:25:17.544	completed
b06d3303-306d-4f10-b328-523ba00f1a91	76e799f2-0bab-4273-8d3a-0a26fe065249	eb1dae05-cb14-4000-ba10-260f9cd79124	3	45000	\N	0	\N	2026-08-13 09:25:17.544	completed
292bceab-6564-490e-84c7-975b9a6c3927	e036fd4a-78fc-4d94-a126-c69397c62443	884570a1-2822-4840-a08f-fc4a4a3b5fad	2	48000	\N	0	\N	2026-08-13 09:25:17.553	completed
854de420-5cef-4da5-8724-d160bef07986	e036fd4a-78fc-4d94-a126-c69397c62443	c24edbc4-7c7a-4228-9b3c-1b95c2be051c	1	48000	\N	0	\N	2026-08-13 09:25:17.553	completed
a6126860-7d71-4886-8a64-6c685a0d8a32	e036fd4a-78fc-4d94-a126-c69397c62443	e24a6cc9-1b6e-4ba7-94a5-514f6aa8fe31	3	45000	\N	0	\N	2026-08-13 09:25:17.553	completed
8b68be66-3941-4f62-aed0-c7c7289b9ef1	e036fd4a-78fc-4d94-a126-c69397c62443	30ef5deb-6b46-47d1-a98c-8bc060d62b44	3	45000	\N	0	\N	2026-08-13 09:25:17.553	completed
0b04ac33-6863-4b6a-b736-c106f752f9c0	e036fd4a-78fc-4d94-a126-c69397c62443	c9ed90c7-689a-46ab-9fd2-84d017c264af	2	32000	\N	0	\N	2026-08-13 09:25:17.553	completed
92f7d2e9-0d6e-4c3d-8d66-14ec190dc67e	e036fd4a-78fc-4d94-a126-c69397c62443	308d182c-58a9-47d9-a56a-bba4a473ae24	2	42000	\N	0	\N	2026-08-13 09:25:17.553	completed
1bd4c4f1-453a-4d8a-aef2-9e65b664f9e4	ba382715-f9ba-4c4e-b1ce-cd9db642805c	12b460b3-749d-4ab1-80de-d8f51d5188cc	2	40000	\N	0	\N	2026-08-13 09:25:17.562	completed
f26ab8e4-ce9b-4970-ad47-7de1ff8e40a9	ba382715-f9ba-4c4e-b1ce-cd9db642805c	d9f1fb87-e737-4210-a5bf-1bc0ba885771	4	42000	\N	0	\N	2026-08-13 09:25:17.562	completed
4524c342-daca-47d4-ab33-8f1be653cb5b	ba382715-f9ba-4c4e-b1ce-cd9db642805c	d809adca-e256-41bc-b7b0-75df0d3f5dcb	4	35000	\N	0	\N	2026-08-13 09:25:17.562	completed
fbc6be5a-c5d7-4522-94b2-8dd79ae34c25	ba382715-f9ba-4c4e-b1ce-cd9db642805c	a02247ba-a10e-4387-967d-e69a05c8193a	2	32000	\N	0	\N	2026-08-13 09:25:17.562	completed
0bf134b0-3b67-4fee-8e75-48b99c5753f4	ba382715-f9ba-4c4e-b1ce-cd9db642805c	01d338fc-cbda-492d-b496-2a55e100d813	1	45000	\N	0	\N	2026-08-13 09:25:17.562	completed
33d0115e-cdd6-4384-a509-a71d10fb434b	ba382715-f9ba-4c4e-b1ce-cd9db642805c	10b0cc63-2c10-44ef-bf34-8d19b7fda2bb	4	55000	\N	0	\N	2026-08-13 09:25:17.562	completed
3ce10424-4b4a-4c18-88c3-a5f845a30e73	ba382715-f9ba-4c4e-b1ce-cd9db642805c	e9bd0cdf-4357-4313-8b02-7f8260f6992f	4	52000	\N	0	\N	2026-08-13 09:25:17.562	completed
002f1a3e-425c-4766-8235-df99d91ca848	ba382715-f9ba-4c4e-b1ce-cd9db642805c	01d338fc-cbda-492d-b496-2a55e100d813	1	45000	\N	0	\N	2026-08-13 09:25:17.562	completed
52b805c6-3159-4981-abaf-ef2a479fd46c	1a2c22e7-5ecb-4196-ba55-62e3b173cd14	acb42a52-c717-441a-824b-8a18079ee46c	3	50000	\N	0	\N	2026-08-13 09:25:17.57	completed
82865b79-1cbf-4432-b156-2153e8ed2ab6	1a2c22e7-5ecb-4196-ba55-62e3b173cd14	7484d38a-54a0-49c7-baa2-a93fdce6d347	1	55000	\N	0	\N	2026-08-13 09:25:17.57	completed
4ff37964-1557-431b-a087-2bb0c1a2d68e	1a2c22e7-5ecb-4196-ba55-62e3b173cd14	228cd2ca-0ce1-44ff-92d8-05b7c9480e55	3	42000	\N	0	\N	2026-08-13 09:25:17.57	completed
aeef7807-cea0-40e0-afc7-7b78561fed80	1a2c22e7-5ecb-4196-ba55-62e3b173cd14	25a8343a-39c3-457e-9c1d-13689bd6469b	3	45000	\N	0	\N	2026-08-13 09:25:17.57	completed
a11e3c31-1f04-48fd-8b10-a84f5fe37b5e	1a2c22e7-5ecb-4196-ba55-62e3b173cd14	b429cd3c-c501-4b4a-b028-9ab5feedc41e	4	52000	\N	0	\N	2026-08-13 09:25:17.57	completed
b0400c4a-0f76-44d4-ab96-98a0a1f5e805	1a2c22e7-5ecb-4196-ba55-62e3b173cd14	ce6673bb-c51b-4a4f-ab3d-810e44601734	2	28000	\N	0	\N	2026-08-13 09:25:17.57	completed
ac74eb1a-3c5a-462b-9dc2-05648fa67915	1a2c22e7-5ecb-4196-ba55-62e3b173cd14	10b0cc63-2c10-44ef-bf34-8d19b7fda2bb	2	55000	\N	0	\N	2026-08-13 09:25:17.57	completed
554f72d3-9196-4076-b5a1-a90a45d90a1d	b4e8a020-623c-44ea-895e-ce6442808745	10b0cc63-2c10-44ef-bf34-8d19b7fda2bb	2	55000	\N	0	\N	2026-08-13 09:25:17.58	completed
ceb6da6d-483b-4c05-8b85-c77fd158d3f1	b4e8a020-623c-44ea-895e-ce6442808745	01d338fc-cbda-492d-b496-2a55e100d813	2	45000	\N	0	\N	2026-08-13 09:25:17.58	completed
4202d0a0-a267-47e5-9ac9-0bf4a1e2e4b1	b4e8a020-623c-44ea-895e-ce6442808745	a02247ba-a10e-4387-967d-e69a05c8193a	1	32000	\N	0	\N	2026-08-13 09:25:17.58	completed
3970c9df-2a30-42ce-a728-4d45319347e9	b4e8a020-623c-44ea-895e-ce6442808745	cbc78f47-cb0d-4d34-80e1-841ec7b0e5de	4	48000	\N	0	\N	2026-08-13 09:25:17.58	completed
cb6924f2-9265-40e1-bc59-b42bef12b2cb	b4e8a020-623c-44ea-895e-ce6442808745	cbc78f47-cb0d-4d34-80e1-841ec7b0e5de	3	48000	\N	0	\N	2026-08-13 09:25:17.58	completed
24a63480-1b5a-4f24-8062-e40855baf491	b4e8a020-623c-44ea-895e-ce6442808745	803bcdee-17d3-41fc-a249-4e8d16b49575	4	48000	\N	0	\N	2026-08-13 09:25:17.58	completed
c951f98e-d0f0-4003-8699-e064a2ea0a71	ed5ccf0e-dede-4964-a382-e44012ead7df	228cd2ca-0ce1-44ff-92d8-05b7c9480e55	3	42000	\N	0	\N	2026-08-13 09:25:17.588	completed
c9a21893-cfb4-4f06-8647-5f527a580417	ed5ccf0e-dede-4964-a382-e44012ead7df	d21a6806-fffa-4462-b33f-2c91a1c6b013	3	50000	\N	0	\N	2026-08-13 09:25:17.588	completed
aeca1b1c-eac6-4fce-b53d-d73fddb51aa3	ed5ccf0e-dede-4964-a382-e44012ead7df	bcff5008-981c-428b-b652-31d8c1378d9f	2	28000	\N	0	\N	2026-08-13 09:25:17.588	completed
e2afe98f-0001-4abb-af48-c8df4a78993f	752a9b8b-3575-41fa-bf4f-ac7a1b989cef	c9ed90c7-689a-46ab-9fd2-84d017c264af	1	32000	\N	0	\N	2026-08-13 09:25:17.597	completed
11017f70-0abb-468e-a122-b545af62f3a7	752a9b8b-3575-41fa-bf4f-ac7a1b989cef	d809adca-e256-41bc-b7b0-75df0d3f5dcb	4	35000	\N	0	\N	2026-08-13 09:25:17.597	completed
39600cde-8b9a-41e8-b762-a25579c4f82e	752a9b8b-3575-41fa-bf4f-ac7a1b989cef	51c45fec-e0e7-489e-8339-02a536d2e857	1	45000	\N	0	\N	2026-08-13 09:25:17.597	completed
ee5dced4-9890-426d-86e1-9b831b8eb18e	752a9b8b-3575-41fa-bf4f-ac7a1b989cef	35fbf376-436a-45ea-89a5-41560d3be32b	3	35000	\N	0	\N	2026-08-13 09:25:17.597	completed
24e5ba0f-2af9-47bb-84f8-882e5cdedf4b	752a9b8b-3575-41fa-bf4f-ac7a1b989cef	228cd2ca-0ce1-44ff-92d8-05b7c9480e55	4	42000	\N	0	\N	2026-08-13 09:25:17.597	completed
919a18f5-fc79-4076-82bd-f71553d6dc86	752a9b8b-3575-41fa-bf4f-ac7a1b989cef	81d6f3b5-b26a-4dd0-bfca-fea91a42a296	3	35000	\N	0	\N	2026-08-13 09:25:17.597	completed
c8ae8fe6-07d2-4c86-846d-62be1819bc7b	752a9b8b-3575-41fa-bf4f-ac7a1b989cef	c24edbc4-7c7a-4228-9b3c-1b95c2be051c	3	48000	\N	0	\N	2026-08-13 09:25:17.597	completed
06034e22-b860-4ce3-959e-d2e0af59b877	752a9b8b-3575-41fa-bf4f-ac7a1b989cef	6798927c-bcba-49fd-a7ad-78291c69ac33	4	52000	\N	0	\N	2026-08-13 09:25:17.597	completed
c78e2484-e9bc-47ed-a631-64724bf080c7	81183027-9e54-482c-8799-eab3695c55fd	6798927c-bcba-49fd-a7ad-78291c69ac33	2	52000	\N	0	\N	2026-08-13 09:25:17.602	completed
923ef03b-5aea-434f-b5fb-b6ecdde9e57f	81183027-9e54-482c-8799-eab3695c55fd	ceed2a39-e4e2-486c-b228-a909a81d8487	3	20000	\N	0	\N	2026-08-13 09:25:17.602	completed
711a9c9b-df66-44a2-bb75-60ca039a6363	81183027-9e54-482c-8799-eab3695c55fd	12b460b3-749d-4ab1-80de-d8f51d5188cc	2	40000	\N	0	\N	2026-08-13 09:25:17.602	completed
3267092b-1e21-408f-b613-e10193f93a97	81183027-9e54-482c-8799-eab3695c55fd	2ce5c559-70e1-4bdd-8cf0-fcdf2a843273	2	46000	\N	0	\N	2026-08-13 09:25:17.602	completed
297d4920-285c-4f03-b3de-6a07fca3e750	81183027-9e54-482c-8799-eab3695c55fd	7484d38a-54a0-49c7-baa2-a93fdce6d347	4	55000	\N	0	\N	2026-08-13 09:25:17.602	completed
8f5821b1-548d-4e1b-a020-071ab57a8f3d	81183027-9e54-482c-8799-eab3695c55fd	d9f1fb87-e737-4210-a5bf-1bc0ba885771	4	42000	\N	0	\N	2026-08-13 09:25:17.602	completed
d1337e9b-143a-4c70-b74c-e48e6195d534	badc7ff7-f8a3-43a7-a49f-f8d57c4dc88c	d9f1fb87-e737-4210-a5bf-1bc0ba885771	4	42000	\N	0	\N	2026-08-13 09:25:17.611	completed
56996f66-5776-4d9e-9fd8-8b48e81d7343	badc7ff7-f8a3-43a7-a49f-f8d57c4dc88c	d809adca-e256-41bc-b7b0-75df0d3f5dcb	4	35000	\N	0	\N	2026-08-13 09:25:17.611	completed
35020a0f-c4dd-4523-96e6-00c61c4bfbc5	badc7ff7-f8a3-43a7-a49f-f8d57c4dc88c	625d086d-e1db-42f3-9cd5-84006fb429c1	4	48000	\N	0	\N	2026-08-13 09:25:17.611	completed
f6e23e1a-ba1b-45a8-9585-c1fcae0505cc	badc7ff7-f8a3-43a7-a49f-f8d57c4dc88c	35fbf376-436a-45ea-89a5-41560d3be32b	1	35000	\N	0	\N	2026-08-13 09:25:17.611	completed
be4fcaf9-34b8-4ce7-9a1c-769c1fdf9781	bc10d31f-fdaf-45d9-9803-a0d0c2f84fcb	803bcdee-17d3-41fc-a249-4e8d16b49575	2	48000	\N	0	\N	2026-08-13 09:25:17.618	completed
38d7fd4f-60a2-4e33-9d5e-229d45ab352b	bc10d31f-fdaf-45d9-9803-a0d0c2f84fcb	01d338fc-cbda-492d-b496-2a55e100d813	4	45000	\N	0	\N	2026-08-13 09:25:17.618	completed
d653cab4-4493-4dee-8172-c8e369aa43e2	bc10d31f-fdaf-45d9-9803-a0d0c2f84fcb	83ceb824-bbdc-4b06-a867-037ded0aef0e	4	50000	\N	0	\N	2026-08-13 09:25:17.618	completed
582206ed-17e0-432b-9838-3e334c5b67d7	bc10d31f-fdaf-45d9-9803-a0d0c2f84fcb	884570a1-2822-4840-a08f-fc4a4a3b5fad	2	48000	\N	0	\N	2026-08-13 09:25:17.618	completed
bdfa8964-6adb-4a8e-9203-bbf5241f8f84	bc10d31f-fdaf-45d9-9803-a0d0c2f84fcb	b6a4c689-bce0-4d87-883b-b0de919eba27	1	58000	\N	0	\N	2026-08-13 09:25:17.618	completed
25e99dce-cb83-4fbc-81d7-783d158720aa	bc10d31f-fdaf-45d9-9803-a0d0c2f84fcb	6798927c-bcba-49fd-a7ad-78291c69ac33	3	52000	\N	0	\N	2026-08-13 09:25:17.618	completed
0f534f40-3ab3-4895-8970-21a8bcf84f75	4ddd27fa-9d11-4117-8f2d-abe83ab27665	27af0495-2d91-4cb0-af88-4752edf671dc	2	10000	\N	0	\N	2026-08-13 09:25:17.623	completed
8946a598-0325-4246-b29d-5c8eddce1af0	4ddd27fa-9d11-4117-8f2d-abe83ab27665	228cd2ca-0ce1-44ff-92d8-05b7c9480e55	3	42000	\N	0	\N	2026-08-13 09:25:17.623	completed
44dfa960-ea83-4d7b-97f2-c359c1870afe	4ddd27fa-9d11-4117-8f2d-abe83ab27665	eaa3fac9-f60f-4db1-b33a-a4bd46e8ea71	1	45000	\N	0	\N	2026-08-13 09:25:17.623	completed
9193407c-996d-4a06-885a-766a9ea23588	4ddd27fa-9d11-4117-8f2d-abe83ab27665	81d6f3b5-b26a-4dd0-bfca-fea91a42a296	4	35000	\N	0	\N	2026-08-13 09:25:17.623	completed
a81fbf20-9d2e-402a-adf8-769d8a2624ce	6148510a-c241-4918-958c-a77a8e632abc	a02247ba-a10e-4387-967d-e69a05c8193a	3	32000	\N	0	\N	2026-08-13 09:25:17.631	completed
c8cffe7b-fad0-4aaf-a22e-ef4100739a99	6148510a-c241-4918-958c-a77a8e632abc	d809adca-e256-41bc-b7b0-75df0d3f5dcb	4	35000	\N	0	\N	2026-08-13 09:25:17.631	completed
62dfcc62-3ef3-4134-88ca-8e328d241b25	6148510a-c241-4918-958c-a77a8e632abc	e24a6cc9-1b6e-4ba7-94a5-514f6aa8fe31	1	45000	\N	0	\N	2026-08-13 09:25:17.631	completed
19ef77f2-7914-47e3-8076-b0155e652363	6148510a-c241-4918-958c-a77a8e632abc	308d182c-58a9-47d9-a56a-bba4a473ae24	3	42000	\N	0	\N	2026-08-13 09:25:17.631	completed
f504b0be-c856-4313-a97f-f966ebf877f3	6148510a-c241-4918-958c-a77a8e632abc	83ceb824-bbdc-4b06-a867-037ded0aef0e	2	50000	\N	0	\N	2026-08-13 09:25:17.631	completed
27bff6c1-cd53-4f7d-8b60-0f537d7c443e	6148510a-c241-4918-958c-a77a8e632abc	308d182c-58a9-47d9-a56a-bba4a473ae24	1	42000	\N	0	\N	2026-08-13 09:25:17.631	completed
e6b84a9c-234a-4fdc-b88c-78a32633b507	6148510a-c241-4918-958c-a77a8e632abc	96531f07-be37-454a-aa0c-4a0eaab99930	4	55000	\N	0	\N	2026-08-13 09:25:17.631	completed
6f49bbde-40d7-4650-b977-e43d92981c18	6148510a-c241-4918-958c-a77a8e632abc	ceed2a39-e4e2-486c-b228-a909a81d8487	3	20000	\N	0	\N	2026-08-13 09:25:17.631	completed
2adceeaa-02be-4ffc-95ea-d5375866544f	0db3bf26-15bd-4afa-a852-32555a122ce9	3a6ff9b1-cc6c-45ae-9635-ab2b2d03c232	1	38000	\N	0	\N	2026-08-13 09:25:17.635	completed
9742e059-7df4-4bf7-86a8-efdefe15e8b5	0db3bf26-15bd-4afa-a852-32555a122ce9	d849f917-4afe-4a94-8866-03848a938c79	1	35000	\N	0	\N	2026-08-13 09:25:17.635	completed
1caa7a99-0454-4492-808b-fd48245823e8	0db3bf26-15bd-4afa-a852-32555a122ce9	884570a1-2822-4840-a08f-fc4a4a3b5fad	1	48000	\N	0	\N	2026-08-13 09:25:17.635	completed
50c687b7-3101-4fd3-8ea6-df6da26ce6f9	0db3bf26-15bd-4afa-a852-32555a122ce9	81d6f3b5-b26a-4dd0-bfca-fea91a42a296	3	35000	\N	0	\N	2026-08-13 09:25:17.635	completed
2bc478cd-3f3a-404d-aee8-73710ae2cb97	188145f3-83dc-48f4-b082-d7331dd5a6ba	35fbf376-436a-45ea-89a5-41560d3be32b	2	35000	\N	0	\N	2026-08-13 09:25:17.643	completed
60bc398a-252a-476a-a50d-1cc80e09d627	188145f3-83dc-48f4-b082-d7331dd5a6ba	3a6ff9b1-cc6c-45ae-9635-ab2b2d03c232	4	38000	\N	0	\N	2026-08-13 09:25:17.643	completed
0919fc86-ecac-4d42-a346-d5177fa42f10	188145f3-83dc-48f4-b082-d7331dd5a6ba	27af0495-2d91-4cb0-af88-4752edf671dc	4	10000	\N	0	\N	2026-08-13 09:25:17.643	completed
2a280b26-2325-417d-b7de-d8cec97fdff9	188145f3-83dc-48f4-b082-d7331dd5a6ba	c24edbc4-7c7a-4228-9b3c-1b95c2be051c	3	48000	\N	0	\N	2026-08-13 09:25:17.643	completed
816aae5a-233a-4028-9677-b75475d2ec83	fc756c61-991e-4649-8fec-9c53a844194f	5bc34fc9-24c2-4108-af83-5992af2291d6	4	40000	\N	0	\N	2026-08-13 09:25:17.652	completed
15fe85cf-6161-40b8-8c1b-d28a52be0f51	fc756c61-991e-4649-8fec-9c53a844194f	d809adca-e256-41bc-b7b0-75df0d3f5dcb	3	35000	\N	0	\N	2026-08-13 09:25:17.652	completed
0b32241a-abe6-4ade-b1c3-5baaa565001a	fc756c61-991e-4649-8fec-9c53a844194f	ce6673bb-c51b-4a4f-ab3d-810e44601734	4	28000	\N	0	\N	2026-08-13 09:25:17.652	completed
b1cbda27-91f4-4a75-9f28-0d5d7fbff2dc	fc756c61-991e-4649-8fec-9c53a844194f	f731a039-1a1f-413d-826c-0955bb9eea80	1	55000	\N	0	\N	2026-08-13 09:25:17.652	completed
d1e535c4-5368-4b54-835d-8676f68badf9	fc756c61-991e-4649-8fec-9c53a844194f	d52c0006-3bcd-48c7-ab83-082061dc6764	1	42000	\N	0	\N	2026-08-13 09:25:17.652	completed
dd2ce5ce-c566-4da2-92f0-53305c5d3025	fc756c61-991e-4649-8fec-9c53a844194f	27af0495-2d91-4cb0-af88-4752edf671dc	4	10000	\N	0	\N	2026-08-13 09:25:17.652	completed
6ecdf22b-f5c9-45e0-a0e7-3548ef2545e4	578f426a-4de6-4ce9-a15b-6c34260bc6e8	219c20d2-6247-4e8b-a734-53cfbd90ba88	4	52000	\N	0	\N	2026-08-13 09:25:17.657	completed
9f1a33ba-b4a9-4230-bff5-6f7da7b75f63	578f426a-4de6-4ce9-a15b-6c34260bc6e8	5bc34fc9-24c2-4108-af83-5992af2291d6	4	40000	\N	0	\N	2026-08-13 09:25:17.657	completed
354d2d5e-e916-40fe-bace-a8749472a920	578f426a-4de6-4ce9-a15b-6c34260bc6e8	daa4bd17-296f-4da1-8d21-15534fa8e045	4	25000	\N	0	\N	2026-08-13 09:25:17.657	completed
6e77288b-15ec-4631-854c-da306d92f567	578f426a-4de6-4ce9-a15b-6c34260bc6e8	eaa3fac9-f60f-4db1-b33a-a4bd46e8ea71	1	45000	\N	0	\N	2026-08-13 09:25:17.657	completed
f437c3b1-b87a-4e7c-b6fb-2b7c80d86a1b	578f426a-4de6-4ce9-a15b-6c34260bc6e8	96531f07-be37-454a-aa0c-4a0eaab99930	1	55000	\N	0	\N	2026-08-13 09:25:17.657	completed
7f2524b3-7626-4683-9df5-52a6b99f55d0	00a09915-b569-4c13-aed5-232b09847fa7	3a6ff9b1-cc6c-45ae-9635-ab2b2d03c232	2	38000	\N	0	\N	2026-08-13 09:25:17.666	completed
da809055-0d52-406c-8593-52d9142cf51f	00a09915-b569-4c13-aed5-232b09847fa7	c0917f04-365b-4cdc-9b75-e49a7c492727	1	48000	\N	0	\N	2026-08-13 09:25:17.666	completed
27d7bfd0-ea29-4b44-a03c-e845e58c863e	00a09915-b569-4c13-aed5-232b09847fa7	83ff8a95-3eb4-4b98-9978-63aa6d1b8323	3	55000	\N	0	\N	2026-08-13 09:25:17.666	completed
f33d515d-0ef3-46cb-9583-175e04d305cc	a0e1609e-f2f7-41b4-a9be-580cc481ce68	ce6673bb-c51b-4a4f-ab3d-810e44601734	2	28000	\N	0	\N	2026-08-13 09:25:17.671	completed
26a6e152-fe29-40ca-b461-d2b87c673878	a0e1609e-f2f7-41b4-a9be-580cc481ce68	efc81916-6661-422b-826f-c68049339458	3	28000	\N	0	\N	2026-08-13 09:25:17.671	completed
65cd4b8e-a65b-4b37-878f-ff8a22469d9a	a0e1609e-f2f7-41b4-a9be-580cc481ce68	cbc78f47-cb0d-4d34-80e1-841ec7b0e5de	1	48000	\N	0	\N	2026-08-13 09:25:17.671	completed
99fc8ea8-812d-4a57-b2b1-8f842911d179	a0e1609e-f2f7-41b4-a9be-580cc481ce68	25a8343a-39c3-457e-9c1d-13689bd6469b	2	45000	\N	0	\N	2026-08-13 09:25:17.671	completed
bcf48ae8-2bf1-4336-bad4-792afbb3cab7	af30e6a1-2557-498d-8b75-3f8917acfdd5	f731a039-1a1f-413d-826c-0955bb9eea80	3	55000	\N	0	\N	2026-08-13 09:25:17.68	completed
bf08ffe5-b6c3-4c26-8a83-09a52b20e082	af30e6a1-2557-498d-8b75-3f8917acfdd5	625d086d-e1db-42f3-9cd5-84006fb429c1	2	48000	\N	0	\N	2026-08-13 09:25:17.68	completed
89cd9435-cda1-47c4-a4f9-a8ccc532406a	af30e6a1-2557-498d-8b75-3f8917acfdd5	35fbf376-436a-45ea-89a5-41560d3be32b	2	35000	\N	0	\N	2026-08-13 09:25:17.68	completed
a2afdae9-826c-463e-bbf7-109993f66008	af30e6a1-2557-498d-8b75-3f8917acfdd5	219c20d2-6247-4e8b-a734-53cfbd90ba88	2	52000	\N	0	\N	2026-08-13 09:25:17.68	completed
b4b0bdbf-b24e-49bb-9223-1af760c8e1fe	af30e6a1-2557-498d-8b75-3f8917acfdd5	d21a6806-fffa-4462-b33f-2c91a1c6b013	4	50000	\N	0	\N	2026-08-13 09:25:17.68	completed
4165cf85-240c-4e0a-87e7-b9ffdbec41d4	3137aa5d-28d5-4f9c-9245-1e86c092a1e4	27af0495-2d91-4cb0-af88-4752edf671dc	1	10000	\N	0	\N	2026-08-13 09:25:17.688	completed
21c87574-4c22-45eb-a449-2fddf60ebaa5	3137aa5d-28d5-4f9c-9245-1e86c092a1e4	b1ee3afc-db38-468c-a4bf-38b51b772024	1	20000	\N	0	\N	2026-08-13 09:25:17.688	completed
83ab51ee-2f3c-45f1-8fc3-b2d127f0cf4f	3137aa5d-28d5-4f9c-9245-1e86c092a1e4	c0917f04-365b-4cdc-9b75-e49a7c492727	1	48000	\N	0	\N	2026-08-13 09:25:17.688	completed
d3b32b27-9ce3-45e1-9a38-a501f5a9b05f	3137aa5d-28d5-4f9c-9245-1e86c092a1e4	daa4bd17-296f-4da1-8d21-15534fa8e045	4	25000	\N	0	\N	2026-08-13 09:25:17.688	completed
be0fa1e2-f2c4-43cb-a5bb-4ec48e49b70d	3137aa5d-28d5-4f9c-9245-1e86c092a1e4	ceed2a39-e4e2-486c-b228-a909a81d8487	3	20000	\N	0	\N	2026-08-13 09:25:17.688	completed
34316b67-e9cf-4a41-ae7c-5dafc762d014	3137aa5d-28d5-4f9c-9245-1e86c092a1e4	bcff5008-981c-428b-b652-31d8c1378d9f	3	28000	\N	0	\N	2026-08-13 09:25:17.688	completed
cd77f4cf-1b86-4665-bb03-32c722905768	3137aa5d-28d5-4f9c-9245-1e86c092a1e4	3aac02bc-fcc6-4532-9a50-fa50790dd4cb	4	32000	\N	0	\N	2026-08-13 09:25:17.688	completed
c63428da-90a8-490b-a8c4-30d2945aae41	3137aa5d-28d5-4f9c-9245-1e86c092a1e4	308d182c-58a9-47d9-a56a-bba4a473ae24	3	42000	\N	0	\N	2026-08-13 09:25:17.688	completed
a2933510-adfa-4b79-b266-a350ce5e8598	6a526dbf-7231-4050-86d8-5a98cc4c82c1	d9f1fb87-e737-4210-a5bf-1bc0ba885771	4	42000	\N	0	\N	2026-08-13 09:25:17.693	completed
936a0d00-ef29-4c3f-8a0c-26ef85db7eb9	6a526dbf-7231-4050-86d8-5a98cc4c82c1	eaa3fac9-f60f-4db1-b33a-a4bd46e8ea71	1	45000	\N	0	\N	2026-08-13 09:25:17.693	completed
a0e8ccfe-bc9d-4d5a-9fda-bbb7efea005c	6a526dbf-7231-4050-86d8-5a98cc4c82c1	faead849-9d7b-4831-b60e-20222fee6c1f	2	48000	\N	0	\N	2026-08-13 09:25:17.693	completed
dbb807aa-58fe-4317-b9dc-44f3d5085b89	6a526dbf-7231-4050-86d8-5a98cc4c82c1	d849f917-4afe-4a94-8866-03848a938c79	2	35000	\N	0	\N	2026-08-13 09:25:17.693	completed
433f7aec-ebcb-468c-afde-917120d337e0	6a526dbf-7231-4050-86d8-5a98cc4c82c1	3a6ff9b1-cc6c-45ae-9635-ab2b2d03c232	1	38000	\N	0	\N	2026-08-13 09:25:17.693	completed
551f9267-4eee-4640-845e-834dc5983650	6a526dbf-7231-4050-86d8-5a98cc4c82c1	5bc34fc9-24c2-4108-af83-5992af2291d6	1	40000	\N	0	\N	2026-08-13 09:25:17.693	completed
777ea52e-ce87-4d6e-90d6-ab85b5be52f4	d842d6e5-c180-4ed3-b2d3-1813fd6def98	e718f02b-b657-444d-89ae-fb910537eb6c	4	42000	\N	0	\N	2026-08-13 09:25:17.703	completed
ce3c2a3b-e3d2-44dc-acb6-b6782b69f790	d842d6e5-c180-4ed3-b2d3-1813fd6def98	81d6f3b5-b26a-4dd0-bfca-fea91a42a296	3	35000	\N	0	\N	2026-08-13 09:25:17.703	completed
f3331733-cb48-471d-8209-143c1ba64562	d842d6e5-c180-4ed3-b2d3-1813fd6def98	81d6f3b5-b26a-4dd0-bfca-fea91a42a296	1	35000	\N	0	\N	2026-08-13 09:25:17.703	completed
e85b7881-697f-4107-b919-e6b1aaae17e4	d842d6e5-c180-4ed3-b2d3-1813fd6def98	228cd2ca-0ce1-44ff-92d8-05b7c9480e55	2	42000	\N	0	\N	2026-08-13 09:25:17.703	completed
46efd6e3-78f7-459d-92b2-64e469b84d16	d842d6e5-c180-4ed3-b2d3-1813fd6def98	cb1888fc-f827-4522-b136-a22bf86816c2	4	35000	\N	0	\N	2026-08-13 09:25:17.703	completed
9072a8aa-d482-4bed-8a8e-03bfbd7a5579	d842d6e5-c180-4ed3-b2d3-1813fd6def98	ceed2a39-e4e2-486c-b228-a909a81d8487	1	20000	\N	0	\N	2026-08-13 09:25:17.703	completed
7ace8c86-dd25-4993-ad25-404de53b1ebf	20a0bffb-56a5-4f89-a54c-704a299b247d	eb1dae05-cb14-4000-ba10-260f9cd79124	4	45000	\N	0	\N	2026-08-13 09:25:17.713	completed
33e2aee1-6d11-4540-86f1-9fea88aac885	20a0bffb-56a5-4f89-a54c-704a299b247d	2ce5c559-70e1-4bdd-8cf0-fcdf2a843273	3	46000	\N	0	\N	2026-08-13 09:25:17.713	completed
f41abceb-2252-4302-b5cd-cc58c545f28f	20a0bffb-56a5-4f89-a54c-704a299b247d	81d6f3b5-b26a-4dd0-bfca-fea91a42a296	4	35000	\N	0	\N	2026-08-13 09:25:17.713	completed
2384d1c6-e2af-44ce-beb5-bec8ef977545	20a0bffb-56a5-4f89-a54c-704a299b247d	83ceb824-bbdc-4b06-a867-037ded0aef0e	3	50000	\N	0	\N	2026-08-13 09:25:17.713	completed
66b8e4ff-66c5-4ace-9da7-3256eff27cf8	de8d544c-dd7f-4bc2-b3db-11fa0f53b605	eaa3fac9-f60f-4db1-b33a-a4bd46e8ea71	2	45000	\N	0	\N	2026-08-13 09:25:17.717	completed
ddbd24e4-8ddc-41ae-be2a-1c8e7193ff67	de8d544c-dd7f-4bc2-b3db-11fa0f53b605	ceed2a39-e4e2-486c-b228-a909a81d8487	3	20000	\N	0	\N	2026-08-13 09:25:17.717	completed
638fdd98-8091-4bf1-8478-55d6f91d68d8	de8d544c-dd7f-4bc2-b3db-11fa0f53b605	b6a4c689-bce0-4d87-883b-b0de919eba27	3	58000	\N	0	\N	2026-08-13 09:25:17.717	completed
d9599ed9-1c5b-4056-8f74-030c37da808a	de8d544c-dd7f-4bc2-b3db-11fa0f53b605	3a6ff9b1-cc6c-45ae-9635-ab2b2d03c232	1	38000	\N	0	\N	2026-08-13 09:25:17.717	completed
7f311585-02c4-4bdd-92c9-3ab352c56c28	de8d544c-dd7f-4bc2-b3db-11fa0f53b605	d52c0006-3bcd-48c7-ab83-082061dc6764	1	42000	\N	0	\N	2026-08-13 09:25:17.717	completed
d9269fbd-8d3b-4425-8f39-700d1512807b	de8d544c-dd7f-4bc2-b3db-11fa0f53b605	81d6f3b5-b26a-4dd0-bfca-fea91a42a296	4	35000	\N	0	\N	2026-08-13 09:25:17.717	completed
fa814029-a4dc-4dc7-ac83-50b692631b4e	de8d544c-dd7f-4bc2-b3db-11fa0f53b605	12b460b3-749d-4ab1-80de-d8f51d5188cc	3	40000	\N	0	\N	2026-08-13 09:25:17.717	completed
68ad9f42-fed3-47b0-be27-5f54746326d5	de8d544c-dd7f-4bc2-b3db-11fa0f53b605	6798927c-bcba-49fd-a7ad-78291c69ac33	1	52000	\N	0	\N	2026-08-13 09:25:17.717	completed
dc233fc3-6f58-4a1f-8243-2e8c3b1baa14	427ae7a6-82ac-40df-adad-f91c3e265c36	c9ed90c7-689a-46ab-9fd2-84d017c264af	3	32000	\N	0	\N	2026-08-13 09:25:17.726	completed
5686a814-9461-4239-819d-7a0e0255acd8	427ae7a6-82ac-40df-adad-f91c3e265c36	f731a039-1a1f-413d-826c-0955bb9eea80	4	55000	\N	0	\N	2026-08-13 09:25:17.726	completed
5665bd33-998f-4a2b-884a-1a8e06239a49	427ae7a6-82ac-40df-adad-f91c3e265c36	d849f917-4afe-4a94-8866-03848a938c79	1	35000	\N	0	\N	2026-08-13 09:25:17.726	completed
9b9a2391-faf4-49ab-a048-51f4e1b42f1f	427ae7a6-82ac-40df-adad-f91c3e265c36	83ff8a95-3eb4-4b98-9978-63aa6d1b8323	4	55000	\N	0	\N	2026-08-13 09:25:17.726	completed
79bb23e8-7f11-4b3c-9044-f32c26e8f4cf	427ae7a6-82ac-40df-adad-f91c3e265c36	25a8343a-39c3-457e-9c1d-13689bd6469b	1	45000	\N	0	\N	2026-08-13 09:25:17.726	completed
b1ed2626-168e-4b0d-8f6f-296519785212	427ae7a6-82ac-40df-adad-f91c3e265c36	0b97d8bc-ffce-4904-8c46-87752b930f5e	3	45000	\N	0	\N	2026-08-13 09:25:17.726	completed
55b83343-4512-4629-98f2-38f3202f1e77	7e5ad3c2-bcf9-4294-ab76-ff5a6bcec093	2ce5c559-70e1-4bdd-8cf0-fcdf2a843273	4	46000	\N	0	\N	2026-08-13 09:25:17.735	completed
df055e80-10dc-49dd-aa0b-d095458ab5bf	7e5ad3c2-bcf9-4294-ab76-ff5a6bcec093	b1ee3afc-db38-468c-a4bf-38b51b772024	2	20000	\N	0	\N	2026-08-13 09:25:17.735	completed
fda5cd19-a455-4778-b1d8-eccaabef64f5	7e5ad3c2-bcf9-4294-ab76-ff5a6bcec093	7804beb7-b72c-43db-a27a-82b955e5e31c	4	25000	\N	0	\N	2026-08-13 09:25:17.735	completed
3486f1ca-adda-479e-8e43-2c03f9b1211c	7e5ad3c2-bcf9-4294-ab76-ff5a6bcec093	b429cd3c-c501-4b4a-b028-9ab5feedc41e	4	52000	\N	0	\N	2026-08-13 09:25:17.735	completed
1ceac7c4-1d13-457e-8920-2810423dbf64	7e5ad3c2-bcf9-4294-ab76-ff5a6bcec093	eaa3fac9-f60f-4db1-b33a-a4bd46e8ea71	2	45000	\N	0	\N	2026-08-13 09:25:17.735	completed
045d6822-763c-4c30-a369-691750153762	7e5ad3c2-bcf9-4294-ab76-ff5a6bcec093	12b460b3-749d-4ab1-80de-d8f51d5188cc	2	40000	\N	0	\N	2026-08-13 09:25:17.735	completed
2c5573f3-5b89-4be5-829c-d3279788510d	7e5ad3c2-bcf9-4294-ab76-ff5a6bcec093	e24a6cc9-1b6e-4ba7-94a5-514f6aa8fe31	3	45000	\N	0	\N	2026-08-13 09:25:17.735	completed
838463f9-0f36-4fe7-8f9f-9522709421a8	074a6a5c-3874-429a-afbd-ff70866b036a	d849f917-4afe-4a94-8866-03848a938c79	2	35000	\N	0	\N	2026-08-13 09:25:17.743	completed
f4ec30cd-23dc-474e-9450-f0bc3ce4de77	074a6a5c-3874-429a-afbd-ff70866b036a	8f09b4ea-702e-4845-b2c0-59b3bf810d9d	4	38000	\N	0	\N	2026-08-13 09:25:17.743	completed
291b46d0-9ac4-46a4-a049-8f200b645a54	074a6a5c-3874-429a-afbd-ff70866b036a	b6a4c689-bce0-4d87-883b-b0de919eba27	1	58000	\N	0	\N	2026-08-13 09:25:17.743	completed
679f0caf-938c-48a3-851c-80d7aa8adee3	074a6a5c-3874-429a-afbd-ff70866b036a	f731a039-1a1f-413d-826c-0955bb9eea80	3	55000	\N	0	\N	2026-08-13 09:25:17.743	completed
09fc2e51-c592-4c8c-89c4-1c42b3412ba9	074a6a5c-3874-429a-afbd-ff70866b036a	c9ed90c7-689a-46ab-9fd2-84d017c264af	2	32000	\N	0	\N	2026-08-13 09:25:17.743	completed
1de979b5-43b8-41d2-b1e8-49be1a9b429b	074a6a5c-3874-429a-afbd-ff70866b036a	27af0495-2d91-4cb0-af88-4752edf671dc	2	10000	\N	0	\N	2026-08-13 09:25:17.743	completed
b68dcdb2-d437-4aa5-a324-ce2b597deb51	074a6a5c-3874-429a-afbd-ff70866b036a	884570a1-2822-4840-a08f-fc4a4a3b5fad	3	48000	\N	0	\N	2026-08-13 09:25:17.743	completed
db6f8ab9-fc52-4e08-a7a6-f77a817416af	d1f8d593-6b02-4ffb-8542-8e35ddc6e5db	35fbf376-436a-45ea-89a5-41560d3be32b	4	35000	\N	0	\N	2026-08-13 09:25:17.747	completed
8240d4eb-ad9d-4c64-9144-d6c4c8147046	d1f8d593-6b02-4ffb-8542-8e35ddc6e5db	83ceb824-bbdc-4b06-a867-037ded0aef0e	3	50000	\N	0	\N	2026-08-13 09:25:17.747	completed
c085904f-1a7c-4448-ba02-657e1844cb8c	d1f8d593-6b02-4ffb-8542-8e35ddc6e5db	5bc34fc9-24c2-4108-af83-5992af2291d6	3	40000	\N	0	\N	2026-08-13 09:25:17.747	completed
b1e83000-267a-4b6f-a046-87ccc894c179	d1f8d593-6b02-4ffb-8542-8e35ddc6e5db	daa4bd17-296f-4da1-8d21-15534fa8e045	2	25000	\N	0	\N	2026-08-13 09:25:17.747	completed
f6f39730-e901-4633-85eb-6faed6994e30	4b816e7e-3c43-4300-893c-d134a834e476	b429cd3c-c501-4b4a-b028-9ab5feedc41e	1	52000	\N	0	\N	2026-08-13 09:25:17.755	completed
41cd539c-915a-4c20-a824-713b7b5117e5	4b816e7e-3c43-4300-893c-d134a834e476	803bcdee-17d3-41fc-a249-4e8d16b49575	1	48000	\N	0	\N	2026-08-13 09:25:17.755	completed
819f0705-b559-4a67-a09a-80b5b92be9d6	4b816e7e-3c43-4300-893c-d134a834e476	81d6f3b5-b26a-4dd0-bfca-fea91a42a296	1	35000	\N	0	\N	2026-08-13 09:25:17.755	completed
ec82a555-5207-4ed1-bf64-99e8947f1a06	4b816e7e-3c43-4300-893c-d134a834e476	b6a4c689-bce0-4d87-883b-b0de919eba27	1	58000	\N	0	\N	2026-08-13 09:25:17.755	completed
5f13ccb8-6b2a-47fc-8dff-07b8307d93b7	424ba2e1-5897-4eda-b913-eedb7a6a27ef	01d338fc-cbda-492d-b496-2a55e100d813	2	45000	\N	0	\N	2026-08-13 09:25:17.764	completed
0bcee51b-370a-44dc-9e11-e1c5173e61d6	424ba2e1-5897-4eda-b913-eedb7a6a27ef	e9bd0cdf-4357-4313-8b02-7f8260f6992f	4	52000	\N	0	\N	2026-08-13 09:25:17.764	completed
e785e042-bb89-4409-87cc-228888f1b434	424ba2e1-5897-4eda-b913-eedb7a6a27ef	faead849-9d7b-4831-b60e-20222fee6c1f	4	48000	\N	0	\N	2026-08-13 09:25:17.764	completed
3b2e9112-2ea0-4600-b1ed-fbe4cac77412	424ba2e1-5897-4eda-b913-eedb7a6a27ef	219c20d2-6247-4e8b-a734-53cfbd90ba88	4	52000	\N	0	\N	2026-08-13 09:25:17.764	completed
dc224b22-0f53-4057-ba54-9db881eaadb7	424ba2e1-5897-4eda-b913-eedb7a6a27ef	eaa3fac9-f60f-4db1-b33a-a4bd46e8ea71	1	45000	\N	0	\N	2026-08-13 09:25:17.764	completed
4102ba3e-fe43-49c0-9daf-fd25bbca5587	625f74db-3591-4450-8218-5a97f61f51db	2ce5c559-70e1-4bdd-8cf0-fcdf2a843273	4	46000	\N	0	\N	2026-08-13 09:25:17.769	completed
30b335f1-794f-439d-8535-a641b6607b0a	625f74db-3591-4450-8218-5a97f61f51db	83ceb824-bbdc-4b06-a867-037ded0aef0e	3	50000	\N	0	\N	2026-08-13 09:25:17.769	completed
b65bce88-3f51-4d7e-a426-13f497a61f30	625f74db-3591-4450-8218-5a97f61f51db	eaa3fac9-f60f-4db1-b33a-a4bd46e8ea71	2	45000	\N	0	\N	2026-08-13 09:25:17.769	completed
33f2d8b4-108f-4d84-bd3a-0f2e6099cded	625f74db-3591-4450-8218-5a97f61f51db	86643a05-ac82-4216-bdf8-87fcd64da8ec	1	48000	\N	0	\N	2026-08-13 09:25:17.769	completed
d811301b-879d-4a50-81bf-9ce7dc941799	48bc05eb-c7d7-4f26-98f4-481b5e213502	bcff5008-981c-428b-b652-31d8c1378d9f	4	28000	\N	0	\N	2026-08-13 09:25:17.774	completed
7df8357d-8df3-4d1f-983b-b4c091439097	48bc05eb-c7d7-4f26-98f4-481b5e213502	3aac02bc-fcc6-4532-9a50-fa50790dd4cb	4	32000	\N	0	\N	2026-08-13 09:25:17.774	completed
0fea26aa-383c-4267-933b-db9f4a17328d	48bc05eb-c7d7-4f26-98f4-481b5e213502	308d182c-58a9-47d9-a56a-bba4a473ae24	1	42000	\N	0	\N	2026-08-13 09:25:17.774	completed
22d656ff-b21b-4e45-8b1a-72448af80cda	48bc05eb-c7d7-4f26-98f4-481b5e213502	d849f917-4afe-4a94-8866-03848a938c79	1	35000	\N	0	\N	2026-08-13 09:25:17.774	completed
d517c5d7-6045-45d4-80ce-90f3eb26e31e	48bc05eb-c7d7-4f26-98f4-481b5e213502	01d338fc-cbda-492d-b496-2a55e100d813	3	45000	\N	0	\N	2026-08-13 09:25:17.774	completed
b6c6c593-c0c5-4123-96b9-3f43354c95db	48bc05eb-c7d7-4f26-98f4-481b5e213502	83ceb824-bbdc-4b06-a867-037ded0aef0e	2	50000	\N	0	\N	2026-08-13 09:25:17.774	completed
bf134f3a-4011-48a0-9825-7a226189f679	48bc05eb-c7d7-4f26-98f4-481b5e213502	cbc78f47-cb0d-4d34-80e1-841ec7b0e5de	2	48000	\N	0	\N	2026-08-13 09:25:17.774	completed
38b9893d-f569-4b8e-a327-0b7fa5aca583	67d58101-b660-43f0-b0af-e1815ad53349	12b460b3-749d-4ab1-80de-d8f51d5188cc	2	40000	\N	0	\N	2026-08-13 09:25:17.778	completed
e31b3716-4b51-4b9e-a7bc-c54a95ca2846	67d58101-b660-43f0-b0af-e1815ad53349	308d182c-58a9-47d9-a56a-bba4a473ae24	2	42000	\N	0	\N	2026-08-13 09:25:17.778	completed
75bf1110-43e0-4599-9c0a-b53ca32680c9	67d58101-b660-43f0-b0af-e1815ad53349	d52c0006-3bcd-48c7-ab83-082061dc6764	3	42000	\N	0	\N	2026-08-13 09:25:17.778	completed
372ccf11-4f18-4195-845e-8e291fade3d3	67d58101-b660-43f0-b0af-e1815ad53349	25a8343a-39c3-457e-9c1d-13689bd6469b	4	45000	\N	0	\N	2026-08-13 09:25:17.778	completed
8b10c3ac-f1ff-4fa6-8517-dfb5fe6efea3	67d58101-b660-43f0-b0af-e1815ad53349	eb1dae05-cb14-4000-ba10-260f9cd79124	1	45000	\N	0	\N	2026-08-13 09:25:17.778	completed
b6b349f3-9a6c-4a2d-a431-b12a28e2973e	2bd47d9e-e01a-448d-bd2d-d2c9c97b283c	30ef5deb-6b46-47d1-a98c-8bc060d62b44	2	45000	\N	0	\N	2026-08-13 09:25:17.787	completed
f03de661-4bdc-4368-987c-81d3026757fb	2bd47d9e-e01a-448d-bd2d-d2c9c97b283c	e9bd0cdf-4357-4313-8b02-7f8260f6992f	3	52000	\N	0	\N	2026-08-13 09:25:17.787	completed
9a0a48ac-3087-4d84-8c65-3262f6b29916	2bd47d9e-e01a-448d-bd2d-d2c9c97b283c	10b0cc63-2c10-44ef-bf34-8d19b7fda2bb	1	55000	\N	0	\N	2026-08-13 09:25:17.787	completed
65c579ac-99f6-4972-a789-99b2f4624799	2bd47d9e-e01a-448d-bd2d-d2c9c97b283c	cbc78f47-cb0d-4d34-80e1-841ec7b0e5de	1	48000	\N	0	\N	2026-08-13 09:25:17.787	completed
10c9e9ae-e090-4559-bbcf-cac9a3b88d77	2bd47d9e-e01a-448d-bd2d-d2c9c97b283c	2ce5c559-70e1-4bdd-8cf0-fcdf2a843273	2	46000	\N	0	\N	2026-08-13 09:25:17.787	completed
c92e37c5-b38e-4c18-b7fd-76b0b357f331	2bd47d9e-e01a-448d-bd2d-d2c9c97b283c	e718f02b-b657-444d-89ae-fb910537eb6c	3	42000	\N	0	\N	2026-08-13 09:25:17.787	completed
b764b8ba-239a-4343-8cf4-d7c3363a1377	2bd47d9e-e01a-448d-bd2d-d2c9c97b283c	eb1dae05-cb14-4000-ba10-260f9cd79124	1	45000	\N	0	\N	2026-08-13 09:25:17.787	completed
c40155e7-e985-400e-a905-dde9d46d368b	2bd47d9e-e01a-448d-bd2d-d2c9c97b283c	6798927c-bcba-49fd-a7ad-78291c69ac33	4	52000	\N	0	\N	2026-08-13 09:25:17.787	completed
3249455b-f2aa-4a92-9717-8a0306b966ac	39daa26b-d7be-4523-b6fd-81a1f8cb42e4	6798927c-bcba-49fd-a7ad-78291c69ac33	2	52000	\N	0	\N	2026-08-13 09:25:17.796	completed
b431cf71-c5cd-4b68-925b-391990ee3367	39daa26b-d7be-4523-b6fd-81a1f8cb42e4	6798927c-bcba-49fd-a7ad-78291c69ac33	4	52000	\N	0	\N	2026-08-13 09:25:17.796	completed
3190c4d1-b21d-4d3a-8fd1-42259ca1b6d7	39daa26b-d7be-4523-b6fd-81a1f8cb42e4	00acd18c-4b3a-4737-a36c-530f2c16d3b6	1	38000	\N	0	\N	2026-08-13 09:25:17.796	completed
0226c79c-0844-4998-9a95-6ebae086dae0	39daa26b-d7be-4523-b6fd-81a1f8cb42e4	d849f917-4afe-4a94-8866-03848a938c79	4	35000	\N	0	\N	2026-08-13 09:25:17.796	completed
9121fb48-78cc-4363-a0db-170030ff5559	5ba398fb-01aa-4a38-a6ad-2094a2faf4d9	884570a1-2822-4840-a08f-fc4a4a3b5fad	3	48000	\N	0	\N	2026-08-13 09:25:17.805	completed
76a6a319-1495-4929-ba4e-5b2e9bdd0736	5ba398fb-01aa-4a38-a6ad-2094a2faf4d9	3a6ff9b1-cc6c-45ae-9635-ab2b2d03c232	3	38000	\N	0	\N	2026-08-13 09:25:17.805	completed
160cfa09-8968-426b-97a3-6d045209ff63	5ba398fb-01aa-4a38-a6ad-2094a2faf4d9	83ceb824-bbdc-4b06-a867-037ded0aef0e	1	50000	\N	0	\N	2026-08-13 09:25:17.805	completed
f8aaf3d4-a973-4e6a-bad7-ad2d3ee90a8f	5ba398fb-01aa-4a38-a6ad-2094a2faf4d9	01d338fc-cbda-492d-b496-2a55e100d813	4	45000	\N	0	\N	2026-08-13 09:25:17.805	completed
9d5e4ae6-4268-4277-bdd0-f0e4f81c2964	5ba398fb-01aa-4a38-a6ad-2094a2faf4d9	efc81916-6661-422b-826f-c68049339458	2	28000	\N	0	\N	2026-08-13 09:25:17.805	completed
f5b6cdad-8fce-45c5-9e40-908baa7d17f3	5ba398fb-01aa-4a38-a6ad-2094a2faf4d9	25a8343a-39c3-457e-9c1d-13689bd6469b	3	45000	\N	0	\N	2026-08-13 09:25:17.805	completed
dd3662b5-433d-447c-a379-d9f8dd64e630	5ba398fb-01aa-4a38-a6ad-2094a2faf4d9	efc81916-6661-422b-826f-c68049339458	3	28000	\N	0	\N	2026-08-13 09:25:17.805	completed
48775d73-0ce0-4516-8464-fe9dcc395b01	fc73591f-67de-4b74-8feb-c9bb1a2188f6	e718f02b-b657-444d-89ae-fb910537eb6c	3	42000	\N	0	\N	2026-08-13 09:25:17.815	completed
de7d6868-6d2c-4a9c-b7d3-49aadcf7ecb4	fc73591f-67de-4b74-8feb-c9bb1a2188f6	3aac02bc-fcc6-4532-9a50-fa50790dd4cb	4	32000	\N	0	\N	2026-08-13 09:25:17.815	completed
9692d05b-978e-446b-981d-44c965db695b	fc73591f-67de-4b74-8feb-c9bb1a2188f6	219c20d2-6247-4e8b-a734-53cfbd90ba88	2	52000	\N	0	\N	2026-08-13 09:25:17.815	completed
566854a5-347a-49cf-8ef7-977dcefdda72	fc73591f-67de-4b74-8feb-c9bb1a2188f6	daa4bd17-296f-4da1-8d21-15534fa8e045	3	25000	\N	0	\N	2026-08-13 09:25:17.815	completed
75f2b9a0-3a8e-4767-8361-880029dc842e	fc73591f-67de-4b74-8feb-c9bb1a2188f6	d52c0006-3bcd-48c7-ab83-082061dc6764	4	42000	\N	0	\N	2026-08-13 09:25:17.815	completed
e780e7fd-8563-4c79-b908-b85571a956a4	fc73591f-67de-4b74-8feb-c9bb1a2188f6	5bc34fc9-24c2-4108-af83-5992af2291d6	2	40000	\N	0	\N	2026-08-13 09:25:17.815	completed
92ad24c3-cc01-4882-89b0-9369fe487e2f	f93744eb-6eec-4b53-8ad9-003a11d3150b	cb1888fc-f827-4522-b136-a22bf86816c2	4	35000	\N	0	\N	2026-08-13 09:25:17.82	completed
e0408105-78fd-4d1c-83ab-40b93d5ce0f7	f93744eb-6eec-4b53-8ad9-003a11d3150b	b1ee3afc-db38-468c-a4bf-38b51b772024	4	20000	\N	0	\N	2026-08-13 09:25:17.82	completed
9381657b-fe04-46a7-9add-b5c797acf284	f93744eb-6eec-4b53-8ad9-003a11d3150b	228cd2ca-0ce1-44ff-92d8-05b7c9480e55	2	42000	\N	0	\N	2026-08-13 09:25:17.82	completed
f06c3016-4a43-4532-b462-fc364ded2a6b	f93744eb-6eec-4b53-8ad9-003a11d3150b	b1ee3afc-db38-468c-a4bf-38b51b772024	4	20000	\N	0	\N	2026-08-13 09:25:17.82	completed
00d2cbd0-0c54-415b-914d-b7450710d28e	f93744eb-6eec-4b53-8ad9-003a11d3150b	8f09b4ea-702e-4845-b2c0-59b3bf810d9d	4	38000	\N	0	\N	2026-08-13 09:25:17.82	completed
fcad4964-4b42-4383-aa07-367c0dc9fcb8	f93744eb-6eec-4b53-8ad9-003a11d3150b	d52c0006-3bcd-48c7-ab83-082061dc6764	3	42000	\N	0	\N	2026-08-13 09:25:17.82	completed
97f0e739-b08f-4cf2-8944-851682100b66	f93744eb-6eec-4b53-8ad9-003a11d3150b	86643a05-ac82-4216-bdf8-87fcd64da8ec	2	48000	\N	0	\N	2026-08-13 09:25:17.82	completed
81e470b3-07c1-49a1-b2d8-cbb49f4ddabe	f93744eb-6eec-4b53-8ad9-003a11d3150b	e24a6cc9-1b6e-4ba7-94a5-514f6aa8fe31	3	45000	\N	0	\N	2026-08-13 09:25:17.82	completed
fcd8f7d2-073b-4039-abc1-ad25b73918a6	0a994637-102f-4e08-b6ea-38fa237fbc98	daa4bd17-296f-4da1-8d21-15534fa8e045	1	25000	\N	0	\N	2026-08-13 09:25:17.831	completed
47af272a-dcdc-4f6d-965d-8b0a318eff7d	0a994637-102f-4e08-b6ea-38fa237fbc98	d52c0006-3bcd-48c7-ab83-082061dc6764	1	42000	\N	0	\N	2026-08-13 09:25:17.831	completed
7c637eab-8751-44ec-a9b4-268e2791219f	0a994637-102f-4e08-b6ea-38fa237fbc98	5bc34fc9-24c2-4108-af83-5992af2291d6	2	40000	\N	0	\N	2026-08-13 09:25:17.831	completed
e7b926f6-a413-4f0d-9c91-c93b1dc9c124	0a994637-102f-4e08-b6ea-38fa237fbc98	eaa3fac9-f60f-4db1-b33a-a4bd46e8ea71	3	45000	\N	0	\N	2026-08-13 09:25:17.831	completed
6d3a2022-c135-4cf0-9c33-0f6957712a77	0a994637-102f-4e08-b6ea-38fa237fbc98	35fbf376-436a-45ea-89a5-41560d3be32b	1	35000	\N	0	\N	2026-08-13 09:25:17.831	completed
44d0e603-f7db-4f42-baaa-2cadadd7d721	936b3165-834f-412a-a61c-a6209490a62a	0b97d8bc-ffce-4904-8c46-87752b930f5e	1	45000	\N	0	\N	2026-08-13 09:25:17.839	completed
059dada4-7cef-46a4-b961-bae42459e916	936b3165-834f-412a-a61c-a6209490a62a	7484d38a-54a0-49c7-baa2-a93fdce6d347	4	55000	\N	0	\N	2026-08-13 09:25:17.839	completed
f73cfdfd-9e9d-4b6b-b1c1-c9a63c6ecc5b	936b3165-834f-412a-a61c-a6209490a62a	c24edbc4-7c7a-4228-9b3c-1b95c2be051c	1	48000	\N	0	\N	2026-08-13 09:25:17.839	completed
98cb788f-e47b-4c4f-a906-6db79cb4eee9	936b3165-834f-412a-a61c-a6209490a62a	d9f1fb87-e737-4210-a5bf-1bc0ba885771	2	42000	\N	0	\N	2026-08-13 09:25:17.839	completed
f6d1f08d-dc89-40dd-bb40-f22203a0df86	936b3165-834f-412a-a61c-a6209490a62a	b6a4c689-bce0-4d87-883b-b0de919eba27	1	58000	\N	0	\N	2026-08-13 09:25:17.839	completed
26219b05-2af4-4522-9efe-6dba9da73d5b	936b3165-834f-412a-a61c-a6209490a62a	86643a05-ac82-4216-bdf8-87fcd64da8ec	3	48000	\N	0	\N	2026-08-13 09:25:17.839	completed
773a88a7-b7e3-411b-aa2a-bfc97182f456	936b3165-834f-412a-a61c-a6209490a62a	308d182c-58a9-47d9-a56a-bba4a473ae24	4	42000	\N	0	\N	2026-08-13 09:25:17.839	completed
b175f127-aa92-411a-a8f7-61d030541d6e	936b3165-834f-412a-a61c-a6209490a62a	7804beb7-b72c-43db-a27a-82b955e5e31c	2	25000	\N	0	\N	2026-08-13 09:25:17.839	completed
f8641ddb-b749-4510-9dcb-110a9b48f63c	5723287d-0c1e-42c9-bdcd-431e8a5daec7	cbc78f47-cb0d-4d34-80e1-841ec7b0e5de	1	48000	\N	0	\N	2026-08-13 09:25:17.848	completed
f0861f09-b184-47b1-a56e-c0bee24f3152	5723287d-0c1e-42c9-bdcd-431e8a5daec7	d52c0006-3bcd-48c7-ab83-082061dc6764	4	42000	\N	0	\N	2026-08-13 09:25:17.848	completed
f11bc6b1-055e-4901-9cfe-9977bc516ad9	5723287d-0c1e-42c9-bdcd-431e8a5daec7	d21a6806-fffa-4462-b33f-2c91a1c6b013	4	50000	\N	0	\N	2026-08-13 09:25:17.848	completed
832350f3-870d-4931-b494-0597b3e66a85	f56f0412-4e64-48db-923b-f6425a7a788e	83ff8a95-3eb4-4b98-9978-63aa6d1b8323	1	55000	\N	0	\N	2026-08-13 09:25:17.856	completed
f397ecd1-f845-433e-bc9c-88fe3989cd26	f56f0412-4e64-48db-923b-f6425a7a788e	eaa3fac9-f60f-4db1-b33a-a4bd46e8ea71	3	45000	\N	0	\N	2026-08-13 09:25:17.856	completed
5e3da005-0f43-4c0b-88e0-6b9ef087b313	f56f0412-4e64-48db-923b-f6425a7a788e	25a8343a-39c3-457e-9c1d-13689bd6469b	4	45000	\N	0	\N	2026-08-13 09:25:17.856	completed
1b4ee911-e237-4592-a01d-1547a0101e6d	f56f0412-4e64-48db-923b-f6425a7a788e	5bc34fc9-24c2-4108-af83-5992af2291d6	1	40000	\N	0	\N	2026-08-13 09:25:17.856	completed
35bd9b6e-68cc-4af9-ac7f-2f6f5046e158	f566af81-b20b-4dc7-8f56-2e815899b666	5ba65aef-1f61-4c68-b8c1-d847553c8aef	3	52000	\N	0	\N	2026-08-13 09:25:17.86	completed
ce8bc48a-dfed-457d-a0d7-f73af02d448f	f566af81-b20b-4dc7-8f56-2e815899b666	00acd18c-4b3a-4737-a36c-530f2c16d3b6	1	38000	\N	0	\N	2026-08-13 09:25:17.86	completed
57648a9e-8a49-4e45-ab47-ceb53222f77a	f566af81-b20b-4dc7-8f56-2e815899b666	308d182c-58a9-47d9-a56a-bba4a473ae24	4	42000	\N	0	\N	2026-08-13 09:25:17.86	completed
1e2b73e3-7228-4e9c-8455-6f7718328852	f566af81-b20b-4dc7-8f56-2e815899b666	86643a05-ac82-4216-bdf8-87fcd64da8ec	2	48000	\N	0	\N	2026-08-13 09:25:17.86	completed
3b95f9a4-285a-4805-915b-0c575463b8b0	f566af81-b20b-4dc7-8f56-2e815899b666	c24edbc4-7c7a-4228-9b3c-1b95c2be051c	1	48000	\N	0	\N	2026-08-13 09:25:17.86	completed
f7f5a7f1-085d-4e75-9330-376f087cb7c5	f566af81-b20b-4dc7-8f56-2e815899b666	86643a05-ac82-4216-bdf8-87fcd64da8ec	2	48000	\N	0	\N	2026-08-13 09:25:17.86	completed
b9f576a9-2cfe-43ea-a785-181cc653d43e	f566af81-b20b-4dc7-8f56-2e815899b666	308d182c-58a9-47d9-a56a-bba4a473ae24	1	42000	\N	0	\N	2026-08-13 09:25:17.86	completed
028a2bab-582b-4ebf-8e68-9e88e7ba3a8f	f566af81-b20b-4dc7-8f56-2e815899b666	01d338fc-cbda-492d-b496-2a55e100d813	4	45000	\N	0	\N	2026-08-13 09:25:17.86	completed
a3cce351-1e52-4cc4-ad3a-3934eccfce84	0150c23a-6abe-4a3a-8ebe-85220146ebc9	7804beb7-b72c-43db-a27a-82b955e5e31c	3	25000	\N	0	\N	2026-08-13 09:25:17.869	completed
3fb74ee8-32ca-4f83-b6ae-cae378759a2b	0150c23a-6abe-4a3a-8ebe-85220146ebc9	83ceb824-bbdc-4b06-a867-037ded0aef0e	3	50000	\N	0	\N	2026-08-13 09:25:17.869	completed
101707ad-9e87-4648-b6c0-52be761139be	0150c23a-6abe-4a3a-8ebe-85220146ebc9	5ba65aef-1f61-4c68-b8c1-d847553c8aef	1	52000	\N	0	\N	2026-08-13 09:25:17.869	completed
26719036-c650-46ed-b71c-eb2084317752	0150c23a-6abe-4a3a-8ebe-85220146ebc9	d52c0006-3bcd-48c7-ab83-082061dc6764	2	42000	\N	0	\N	2026-08-13 09:25:17.869	completed
e72ad757-72a7-4854-be2a-e968bb0399fc	0150c23a-6abe-4a3a-8ebe-85220146ebc9	d849f917-4afe-4a94-8866-03848a938c79	4	35000	\N	0	\N	2026-08-13 09:25:17.869	completed
928aa0aa-65bd-4a79-8a78-34fc1d713a50	0150c23a-6abe-4a3a-8ebe-85220146ebc9	10b0cc63-2c10-44ef-bf34-8d19b7fda2bb	4	55000	\N	0	\N	2026-08-13 09:25:17.869	completed
e0f4b45d-038c-4828-ba8c-8070dbe18aac	0150c23a-6abe-4a3a-8ebe-85220146ebc9	b429cd3c-c501-4b4a-b028-9ab5feedc41e	3	52000	\N	0	\N	2026-08-13 09:25:17.869	completed
8e8b7796-4ede-46bd-96f8-b87ac5ff3881	66b1c6e4-162b-4c9a-99ae-ed8855ced12a	308d182c-58a9-47d9-a56a-bba4a473ae24	1	42000	\N	0	\N	2026-08-13 09:25:17.879	completed
7c3775c9-fdc5-49d6-9f31-bdf1d3b303fe	66b1c6e4-162b-4c9a-99ae-ed8855ced12a	d52c0006-3bcd-48c7-ab83-082061dc6764	1	42000	\N	0	\N	2026-08-13 09:25:17.879	completed
b47f8cb4-b839-4224-8add-d964850af0d4	66b1c6e4-162b-4c9a-99ae-ed8855ced12a	daa4bd17-296f-4da1-8d21-15534fa8e045	2	25000	\N	0	\N	2026-08-13 09:25:17.879	completed
2bcfa563-f145-4841-bba6-f81f281d76d5	66b1c6e4-162b-4c9a-99ae-ed8855ced12a	228cd2ca-0ce1-44ff-92d8-05b7c9480e55	2	42000	\N	0	\N	2026-08-13 09:25:17.879	completed
06cae96e-8be3-4aee-8a25-700772a191f9	66b1c6e4-162b-4c9a-99ae-ed8855ced12a	7484d38a-54a0-49c7-baa2-a93fdce6d347	3	55000	\N	0	\N	2026-08-13 09:25:17.879	completed
e9228f10-60c4-4117-9e71-6e9b07a309df	66b1c6e4-162b-4c9a-99ae-ed8855ced12a	10b0cc63-2c10-44ef-bf34-8d19b7fda2bb	1	55000	\N	0	\N	2026-08-13 09:25:17.879	completed
9c20c9d6-0532-4772-8921-ca1123719a4f	ef7a0454-86fe-4a73-987c-5f33c8ef3486	e718f02b-b657-444d-89ae-fb910537eb6c	4	42000	\N	0	\N	2026-08-13 09:25:17.883	completed
f6144712-acc8-40ab-b548-afe9ddb19cb7	ef7a0454-86fe-4a73-987c-5f33c8ef3486	625d086d-e1db-42f3-9cd5-84006fb429c1	3	48000	\N	0	\N	2026-08-13 09:25:17.883	completed
fa4ec1fa-3eea-4b74-a908-a9b37faebfac	ef7a0454-86fe-4a73-987c-5f33c8ef3486	d9f1fb87-e737-4210-a5bf-1bc0ba885771	3	42000	\N	0	\N	2026-08-13 09:25:17.883	completed
69982922-5c0b-4f1c-88b8-d7a9040c1e5b	ef7a0454-86fe-4a73-987c-5f33c8ef3486	efc81916-6661-422b-826f-c68049339458	2	28000	\N	0	\N	2026-08-13 09:25:17.883	completed
3f6bc36f-fddc-4c7e-b632-3a803393a5c2	ef7a0454-86fe-4a73-987c-5f33c8ef3486	83ff8a95-3eb4-4b98-9978-63aa6d1b8323	4	55000	\N	0	\N	2026-08-13 09:25:17.883	completed
51341381-3d97-4165-8559-bdb59ec3ecb7	ef7a0454-86fe-4a73-987c-5f33c8ef3486	3aac02bc-fcc6-4532-9a50-fa50790dd4cb	2	32000	\N	0	\N	2026-08-13 09:25:17.883	completed
0f6fc994-1069-4f97-8161-df031fdea6e7	ef7a0454-86fe-4a73-987c-5f33c8ef3486	daa4bd17-296f-4da1-8d21-15534fa8e045	2	25000	\N	0	\N	2026-08-13 09:25:17.883	completed
e6253439-dd73-4f11-98b4-6add246544ea	e3a2849e-41ae-47b7-ba7c-ba8eff8cd0c5	7804beb7-b72c-43db-a27a-82b955e5e31c	4	25000	\N	0	\N	2026-08-13 09:25:17.891	completed
cd6048d1-53e1-452e-a699-10ee32dd7c31	e3a2849e-41ae-47b7-ba7c-ba8eff8cd0c5	884570a1-2822-4840-a08f-fc4a4a3b5fad	1	48000	\N	0	\N	2026-08-13 09:25:17.891	completed
31dfed18-b017-4c4f-9e44-0a15459575cb	e3a2849e-41ae-47b7-ba7c-ba8eff8cd0c5	3aac02bc-fcc6-4532-9a50-fa50790dd4cb	4	32000	\N	0	\N	2026-08-13 09:25:17.891	completed
e973a07d-1237-4b52-8009-b404ee078f73	e3a2849e-41ae-47b7-ba7c-ba8eff8cd0c5	884570a1-2822-4840-a08f-fc4a4a3b5fad	4	48000	\N	0	\N	2026-08-13 09:25:17.891	completed
7ec105a2-dbff-40fa-ac99-7d40385d9d1d	e3a2849e-41ae-47b7-ba7c-ba8eff8cd0c5	27af0495-2d91-4cb0-af88-4752edf671dc	4	10000	\N	0	\N	2026-08-13 09:25:17.891	completed
2159c999-b64f-4435-8aa9-885d66c07643	e3a2849e-41ae-47b7-ba7c-ba8eff8cd0c5	803bcdee-17d3-41fc-a249-4e8d16b49575	1	48000	\N	0	\N	2026-08-13 09:25:17.891	completed
7e3c6c55-28dc-4f90-97bd-d4c826c9dc3e	dbe0d3fa-ff58-4d82-bc8e-6db9002e75c2	e9bd0cdf-4357-4313-8b02-7f8260f6992f	2	52000	\N	0	\N	2026-08-13 09:25:17.9	completed
59ee5af8-89de-47d9-bffc-5364a58337b4	dbe0d3fa-ff58-4d82-bc8e-6db9002e75c2	27af0495-2d91-4cb0-af88-4752edf671dc	4	10000	\N	0	\N	2026-08-13 09:25:17.9	completed
aead755a-878a-47fc-9f90-dd09fdeea2c5	dbe0d3fa-ff58-4d82-bc8e-6db9002e75c2	625d086d-e1db-42f3-9cd5-84006fb429c1	1	48000	\N	0	\N	2026-08-13 09:25:17.9	completed
2add035a-88ed-4c80-abb4-457771eb4fd0	dbe0d3fa-ff58-4d82-bc8e-6db9002e75c2	51c45fec-e0e7-489e-8339-02a536d2e857	1	45000	\N	0	\N	2026-08-13 09:25:17.9	completed
5fe8a52c-8d65-4072-b4b6-cc08f2333665	dbe0d3fa-ff58-4d82-bc8e-6db9002e75c2	a02247ba-a10e-4387-967d-e69a05c8193a	1	32000	\N	0	\N	2026-08-13 09:25:17.9	completed
7e94566c-e4d7-4272-acde-5a0839c953a0	e0844488-4097-419b-b80b-825c3e93681e	51c45fec-e0e7-489e-8339-02a536d2e857	4	45000	\N	0	\N	2026-08-13 09:25:17.909	completed
a7f7a6b6-ff19-4ef7-9519-44a79220c556	e0844488-4097-419b-b80b-825c3e93681e	308d182c-58a9-47d9-a56a-bba4a473ae24	4	42000	\N	0	\N	2026-08-13 09:25:17.909	completed
4e04afda-4c00-4d64-b551-66bf523f4608	e0844488-4097-419b-b80b-825c3e93681e	8f09b4ea-702e-4845-b2c0-59b3bf810d9d	4	38000	\N	0	\N	2026-08-13 09:25:17.909	completed
ca8fdcdd-babb-459d-a761-815fd5ae39ee	e0844488-4097-419b-b80b-825c3e93681e	e9bd0cdf-4357-4313-8b02-7f8260f6992f	2	52000	\N	0	\N	2026-08-13 09:25:17.909	completed
1504f49d-725b-4c9a-bb41-331412787fd8	885db444-6630-4404-9fc2-3eaab11a542b	b429cd3c-c501-4b4a-b028-9ab5feedc41e	4	52000	\N	0	\N	2026-08-13 09:25:17.913	completed
e1ee0a0c-879f-4e8e-a1ca-96ef3a8f7d72	885db444-6630-4404-9fc2-3eaab11a542b	e9bd0cdf-4357-4313-8b02-7f8260f6992f	3	52000	\N	0	\N	2026-08-13 09:25:17.913	completed
44556e92-740e-4eec-a713-89efc96489d2	885db444-6630-4404-9fc2-3eaab11a542b	d52c0006-3bcd-48c7-ab83-082061dc6764	2	42000	\N	0	\N	2026-08-13 09:25:17.913	completed
8bfa2b0b-af6d-44fb-b8dd-2cfbb172d55d	885db444-6630-4404-9fc2-3eaab11a542b	d9f1fb87-e737-4210-a5bf-1bc0ba885771	2	42000	\N	0	\N	2026-08-13 09:25:17.913	completed
dda83828-771a-4858-8fb3-4ef29ba1d544	885db444-6630-4404-9fc2-3eaab11a542b	e24a6cc9-1b6e-4ba7-94a5-514f6aa8fe31	3	45000	\N	0	\N	2026-08-13 09:25:17.913	completed
840c4ef8-b2d2-401e-952c-8a06b8d8287b	885db444-6630-4404-9fc2-3eaab11a542b	86643a05-ac82-4216-bdf8-87fcd64da8ec	2	48000	\N	0	\N	2026-08-13 09:25:17.913	completed
c27b9256-cc1f-4b45-bc2f-177a6249f5af	885db444-6630-4404-9fc2-3eaab11a542b	01d338fc-cbda-492d-b496-2a55e100d813	3	45000	\N	0	\N	2026-08-13 09:25:17.913	completed
a2c0dfb1-bdba-4361-b074-2f8ad9bcd69b	885db444-6630-4404-9fc2-3eaab11a542b	d9f1fb87-e737-4210-a5bf-1bc0ba885771	2	42000	\N	0	\N	2026-08-13 09:25:17.913	completed
1687289f-4dbc-4e6f-9aab-126791116045	e665c630-1746-4ced-84c5-0d30fe3cf4dd	3a6ff9b1-cc6c-45ae-9635-ab2b2d03c232	1	38000	\N	0	\N	2026-08-13 09:25:17.921	completed
60a4406f-fb00-493d-abbb-01ffead51fb7	e665c630-1746-4ced-84c5-0d30fe3cf4dd	d9f1fb87-e737-4210-a5bf-1bc0ba885771	3	42000	\N	0	\N	2026-08-13 09:25:17.921	completed
9002d638-26d5-4854-a8b8-6197e8ecb6a6	e665c630-1746-4ced-84c5-0d30fe3cf4dd	d9f1fb87-e737-4210-a5bf-1bc0ba885771	4	42000	\N	0	\N	2026-08-13 09:25:17.921	completed
a8d47563-c21b-43e4-a111-0ff11dd86a6a	2cc2c3fa-2a0c-4782-8531-bc48632c1a30	d809adca-e256-41bc-b7b0-75df0d3f5dcb	4	35000	\N	0	\N	2026-08-13 09:25:17.929	completed
69fdb0cb-cc01-4fbe-b9eb-34b45933c4c2	2cc2c3fa-2a0c-4782-8531-bc48632c1a30	d809adca-e256-41bc-b7b0-75df0d3f5dcb	3	35000	\N	0	\N	2026-08-13 09:25:17.929	completed
d37d17fc-62eb-4735-a78b-6a6398b6d1a2	2cc2c3fa-2a0c-4782-8531-bc48632c1a30	daa4bd17-296f-4da1-8d21-15534fa8e045	3	25000	\N	0	\N	2026-08-13 09:25:17.929	completed
0b63d20f-3fab-4e1d-9eac-ea4bd1e63699	2cc2c3fa-2a0c-4782-8531-bc48632c1a30	daa4bd17-296f-4da1-8d21-15534fa8e045	2	25000	\N	0	\N	2026-08-13 09:25:17.929	completed
712ecaf5-9a2a-4a45-94d4-194312f9d46f	2cc2c3fa-2a0c-4782-8531-bc48632c1a30	a02247ba-a10e-4387-967d-e69a05c8193a	3	32000	\N	0	\N	2026-08-13 09:25:17.929	completed
a3079f75-2199-447c-b8ec-1e396b236495	2cc2c3fa-2a0c-4782-8531-bc48632c1a30	6798927c-bcba-49fd-a7ad-78291c69ac33	1	52000	\N	0	\N	2026-08-13 09:25:17.929	completed
f15856df-9682-4dad-a87d-61b6ea7148f1	2cc2c3fa-2a0c-4782-8531-bc48632c1a30	2ce5c559-70e1-4bdd-8cf0-fcdf2a843273	1	46000	\N	0	\N	2026-08-13 09:25:17.929	completed
c1c9c571-80e3-4ff3-bd2c-a977c8442493	4af69d26-46c5-4845-b397-138c9f73ca23	d52c0006-3bcd-48c7-ab83-082061dc6764	3	42000	\N	0	\N	2026-08-13 09:25:17.938	completed
6baedd12-22a7-4faa-b881-2481e5821552	4af69d26-46c5-4845-b397-138c9f73ca23	eb1dae05-cb14-4000-ba10-260f9cd79124	4	45000	\N	0	\N	2026-08-13 09:25:17.938	completed
6c9f0c71-0fcb-475e-98a4-7f7ad35f3a4e	4af69d26-46c5-4845-b397-138c9f73ca23	308d182c-58a9-47d9-a56a-bba4a473ae24	1	42000	\N	0	\N	2026-08-13 09:25:17.938	completed
657b15ca-7190-405a-b45f-4705fdf008a6	4af69d26-46c5-4845-b397-138c9f73ca23	ceed2a39-e4e2-486c-b228-a909a81d8487	2	20000	\N	0	\N	2026-08-13 09:25:17.938	completed
0c8a8640-1612-4729-9f3e-e6337b16bb5d	4af69d26-46c5-4845-b397-138c9f73ca23	a02247ba-a10e-4387-967d-e69a05c8193a	4	32000	\N	0	\N	2026-08-13 09:25:17.938	completed
15221f17-0ca3-4ca0-95f4-d604a5cfd24e	4af69d26-46c5-4845-b397-138c9f73ca23	efc81916-6661-422b-826f-c68049339458	2	28000	\N	0	\N	2026-08-13 09:25:17.938	completed
791b8e9b-368c-431a-a729-dc45fbba9a05	4af69d26-46c5-4845-b397-138c9f73ca23	3a6ff9b1-cc6c-45ae-9635-ab2b2d03c232	2	38000	\N	0	\N	2026-08-13 09:25:17.938	completed
2e3ce333-5771-4287-97bc-8639b4da34f1	da9d8602-edff-42bd-bab5-5cad41436220	228cd2ca-0ce1-44ff-92d8-05b7c9480e55	4	42000	\N	0	\N	2026-08-13 09:25:17.942	completed
0c73b5a4-eda7-4636-81b2-8239d4ece6ae	da9d8602-edff-42bd-bab5-5cad41436220	ce6673bb-c51b-4a4f-ab3d-810e44601734	3	28000	\N	0	\N	2026-08-13 09:25:17.942	completed
27ea26b3-7a0c-4920-ac97-b3a0f9fdb278	da9d8602-edff-42bd-bab5-5cad41436220	51c45fec-e0e7-489e-8339-02a536d2e857	4	45000	\N	0	\N	2026-08-13 09:25:17.942	completed
05936660-4a7d-48e6-8d70-946bb22bc420	da9d8602-edff-42bd-bab5-5cad41436220	00acd18c-4b3a-4737-a36c-530f2c16d3b6	1	38000	\N	0	\N	2026-08-13 09:25:17.942	completed
736ddb5c-b1ee-4094-8e58-54a0c19cc511	da9d8602-edff-42bd-bab5-5cad41436220	c24edbc4-7c7a-4228-9b3c-1b95c2be051c	3	48000	\N	0	\N	2026-08-13 09:25:17.942	completed
ccedc77d-4b37-4c81-af21-6e718cbafd0a	da9d8602-edff-42bd-bab5-5cad41436220	efc81916-6661-422b-826f-c68049339458	4	28000	\N	0	\N	2026-08-13 09:25:17.942	completed
6c8d9f7e-0c41-4508-aa48-7a3ce8c9ef9a	af0b105e-39f2-402e-a642-d57915ff202e	27af0495-2d91-4cb0-af88-4752edf671dc	3	10000	\N	0	\N	2026-08-13 09:25:17.947	completed
9932bf7d-0a51-434d-86d9-b45cc8ecb52b	af0b105e-39f2-402e-a642-d57915ff202e	cb1888fc-f827-4522-b136-a22bf86816c2	4	35000	\N	0	\N	2026-08-13 09:25:17.947	completed
2e8edbec-7fb0-410e-8bc7-2c81bc1c22dc	af0b105e-39f2-402e-a642-d57915ff202e	b429cd3c-c501-4b4a-b028-9ab5feedc41e	3	52000	\N	0	\N	2026-08-13 09:25:17.947	completed
1fd375bb-bdac-47a4-bbf4-6c2293abc9cc	1728e5a3-98c6-4991-85a3-65c045698049	30ef5deb-6b46-47d1-a98c-8bc060d62b44	3	45000	\N	0	\N	2026-08-13 09:25:17.955	completed
846af801-36c7-44e3-893c-6c72e7b20845	1728e5a3-98c6-4991-85a3-65c045698049	0b97d8bc-ffce-4904-8c46-87752b930f5e	1	45000	\N	0	\N	2026-08-13 09:25:17.955	completed
52cf0077-5710-4dc8-9968-f0e35d18c473	1728e5a3-98c6-4991-85a3-65c045698049	3a6ff9b1-cc6c-45ae-9635-ab2b2d03c232	1	38000	\N	0	\N	2026-08-13 09:25:17.955	completed
389c53b1-74b3-4851-b84e-a57fc02ef7f4	1728e5a3-98c6-4991-85a3-65c045698049	81d6f3b5-b26a-4dd0-bfca-fea91a42a296	2	35000	\N	0	\N	2026-08-13 09:25:17.955	completed
6e46431b-511c-4ccc-9403-0121e2deccbd	1728e5a3-98c6-4991-85a3-65c045698049	308d182c-58a9-47d9-a56a-bba4a473ae24	4	42000	\N	0	\N	2026-08-13 09:25:17.955	completed
17b478b8-92a3-4b60-b7bc-16b3551db494	1728e5a3-98c6-4991-85a3-65c045698049	96531f07-be37-454a-aa0c-4a0eaab99930	2	55000	\N	0	\N	2026-08-13 09:25:17.955	completed
67be9742-1505-4949-a2ef-c2f22d49fc01	a20a451d-ba0c-448b-a44c-2909c0722d0a	5bc34fc9-24c2-4108-af83-5992af2291d6	3	40000	\N	0	\N	2026-08-13 09:25:17.959	completed
129ae4e6-c3cb-4637-ae49-470d18f40552	a20a451d-ba0c-448b-a44c-2909c0722d0a	cb1888fc-f827-4522-b136-a22bf86816c2	2	35000	\N	0	\N	2026-08-13 09:25:17.959	completed
ee5cd314-f224-4d05-9d1f-2f42a69fd015	a20a451d-ba0c-448b-a44c-2909c0722d0a	d809adca-e256-41bc-b7b0-75df0d3f5dcb	4	35000	\N	0	\N	2026-08-13 09:25:17.959	completed
231ac340-72c5-4b79-b203-db8dad9ed39e	a20a451d-ba0c-448b-a44c-2909c0722d0a	a02247ba-a10e-4387-967d-e69a05c8193a	3	32000	\N	0	\N	2026-08-13 09:25:17.959	completed
8c201e95-6ebf-4d27-b82c-8871ed3a6c01	a20a451d-ba0c-448b-a44c-2909c0722d0a	5bc34fc9-24c2-4108-af83-5992af2291d6	3	40000	\N	0	\N	2026-08-13 09:25:17.959	completed
5ca848db-16b2-42cb-b75b-f5f939ab2833	a20a451d-ba0c-448b-a44c-2909c0722d0a	83ff8a95-3eb4-4b98-9978-63aa6d1b8323	4	55000	\N	0	\N	2026-08-13 09:25:17.959	completed
2c52199a-7f06-4c36-9f8f-d53457cdbc10	a20a451d-ba0c-448b-a44c-2909c0722d0a	01d338fc-cbda-492d-b496-2a55e100d813	3	45000	\N	0	\N	2026-08-13 09:25:17.959	completed
c0ba3f89-ba58-44b5-a70a-2efb113c1b63	a20a451d-ba0c-448b-a44c-2909c0722d0a	acb42a52-c717-441a-824b-8a18079ee46c	4	50000	\N	0	\N	2026-08-13 09:25:17.959	completed
40bec883-969c-4f62-bf7e-0299d2a5869d	5757131f-d08b-4266-8a62-e2824bd4a95e	5bc34fc9-24c2-4108-af83-5992af2291d6	3	40000	\N	0	\N	2026-08-13 09:25:17.964	completed
8a11e1a1-ed21-4129-9b6b-2d519823460c	5757131f-d08b-4266-8a62-e2824bd4a95e	81d6f3b5-b26a-4dd0-bfca-fea91a42a296	1	35000	\N	0	\N	2026-08-13 09:25:17.964	completed
74d2707f-20ed-4470-9d8d-e24ae2ac100b	5757131f-d08b-4266-8a62-e2824bd4a95e	e24a6cc9-1b6e-4ba7-94a5-514f6aa8fe31	3	45000	\N	0	\N	2026-08-13 09:25:17.964	completed
d22c1230-5f85-4375-8acc-12c3deece336	5757131f-d08b-4266-8a62-e2824bd4a95e	b1ee3afc-db38-468c-a4bf-38b51b772024	1	20000	\N	0	\N	2026-08-13 09:25:17.964	completed
664f6595-b269-4c10-be15-6d1c06719da8	5757131f-d08b-4266-8a62-e2824bd4a95e	efc81916-6661-422b-826f-c68049339458	4	28000	\N	0	\N	2026-08-13 09:25:17.964	completed
82b2897e-c6ea-4a53-92c6-acd3e030b7d1	953fa126-2546-4708-9a31-d71cde15962f	b1ee3afc-db38-468c-a4bf-38b51b772024	1	20000	\N	0	\N	2026-08-13 09:25:17.973	completed
f076ef89-8ec5-4625-9265-7724980de30f	953fa126-2546-4708-9a31-d71cde15962f	803bcdee-17d3-41fc-a249-4e8d16b49575	3	48000	\N	0	\N	2026-08-13 09:25:17.973	completed
90c20ad4-effa-4a3b-9732-991ffb8df140	953fa126-2546-4708-9a31-d71cde15962f	daa4bd17-296f-4da1-8d21-15534fa8e045	3	25000	\N	0	\N	2026-08-13 09:25:17.973	completed
39dc00d8-5589-47ab-8db1-44bb0aa653e5	953fa126-2546-4708-9a31-d71cde15962f	51c45fec-e0e7-489e-8339-02a536d2e857	1	45000	\N	0	\N	2026-08-13 09:25:17.973	completed
b922fcc4-f6c4-4ea4-b4bd-bede3327262b	953fa126-2546-4708-9a31-d71cde15962f	c0917f04-365b-4cdc-9b75-e49a7c492727	2	48000	\N	0	\N	2026-08-13 09:25:17.973	completed
c7f4518f-fa88-4fa8-a477-52ade8fd3ed4	953fa126-2546-4708-9a31-d71cde15962f	e9bd0cdf-4357-4313-8b02-7f8260f6992f	1	52000	\N	0	\N	2026-08-13 09:25:17.973	completed
9abee019-c65c-430d-a839-1897fa3b2a38	953fa126-2546-4708-9a31-d71cde15962f	e9bd0cdf-4357-4313-8b02-7f8260f6992f	1	52000	\N	0	\N	2026-08-13 09:25:17.973	completed
c92497c3-b52b-4c45-9af4-e31c3c9d99f1	46fc0b0e-2576-430c-9d3f-649d9aa4676d	d9f1fb87-e737-4210-a5bf-1bc0ba885771	4	42000	\N	0	\N	2026-08-13 09:25:17.983	completed
085fdf72-82c4-4d83-90fb-045cc029f0f9	46fc0b0e-2576-430c-9d3f-649d9aa4676d	884570a1-2822-4840-a08f-fc4a4a3b5fad	1	48000	\N	0	\N	2026-08-13 09:25:17.983	completed
6165c0a3-2dde-4dcf-ba41-6e83fab555ce	46fc0b0e-2576-430c-9d3f-649d9aa4676d	d21a6806-fffa-4462-b33f-2c91a1c6b013	3	50000	\N	0	\N	2026-08-13 09:25:17.983	completed
084b4332-512f-4443-888a-433320832a69	46fc0b0e-2576-430c-9d3f-649d9aa4676d	e9bd0cdf-4357-4313-8b02-7f8260f6992f	3	52000	\N	0	\N	2026-08-13 09:25:17.983	completed
b23373fb-b1e2-4eb2-8fc5-929d105ae1cd	f5fc7467-2e2c-4d61-ae6a-89e5c613e887	7804beb7-b72c-43db-a27a-82b955e5e31c	1	25000	\N	0	\N	2026-08-13 09:25:17.991	completed
6570e58e-7b3a-4786-9105-a7814f7ea10d	f5fc7467-2e2c-4d61-ae6a-89e5c613e887	faead849-9d7b-4831-b60e-20222fee6c1f	4	48000	\N	0	\N	2026-08-13 09:25:17.991	completed
e9677dd3-96bc-44aa-932c-3335a40822be	f5fc7467-2e2c-4d61-ae6a-89e5c613e887	a02247ba-a10e-4387-967d-e69a05c8193a	2	32000	\N	0	\N	2026-08-13 09:25:17.991	completed
9adfb6f3-5812-431c-9b94-da3cfc7474d1	7be02ac1-49b3-4802-bef0-a9f014aa5fa0	12b460b3-749d-4ab1-80de-d8f51d5188cc	4	40000	\N	0	\N	2026-08-13 09:25:17.999	completed
a9f21ef6-4e0c-4f86-b1d0-94925c943aad	7be02ac1-49b3-4802-bef0-a9f014aa5fa0	3a6ff9b1-cc6c-45ae-9635-ab2b2d03c232	4	38000	\N	0	\N	2026-08-13 09:25:17.999	completed
01262f73-f4c7-4c2e-89ce-370e17bcf6f1	7be02ac1-49b3-4802-bef0-a9f014aa5fa0	b429cd3c-c501-4b4a-b028-9ab5feedc41e	1	52000	\N	0	\N	2026-08-13 09:25:17.999	completed
cec029cd-5bfb-488b-ba85-8207456f42d7	7be02ac1-49b3-4802-bef0-a9f014aa5fa0	e24a6cc9-1b6e-4ba7-94a5-514f6aa8fe31	1	45000	\N	0	\N	2026-08-13 09:25:17.999	completed
58679f94-8eeb-481e-bcef-69e1649cee6e	e55a39d6-6dd2-4a10-b058-1afc89ebdc2c	d9f1fb87-e737-4210-a5bf-1bc0ba885771	4	42000	\N	0	\N	2026-08-13 09:25:18.007	completed
56444a7c-d962-4f3f-83eb-097126811ce9	e55a39d6-6dd2-4a10-b058-1afc89ebdc2c	ce6673bb-c51b-4a4f-ab3d-810e44601734	4	28000	\N	0	\N	2026-08-13 09:25:18.007	completed
2d602baa-1d77-4ad1-9df1-422cad5e8a52	e55a39d6-6dd2-4a10-b058-1afc89ebdc2c	c9ed90c7-689a-46ab-9fd2-84d017c264af	1	32000	\N	0	\N	2026-08-13 09:25:18.007	completed
50757430-4d36-4a53-9553-68b492bc7e83	daeac7d9-8d56-47b0-83db-08432c705ec4	803bcdee-17d3-41fc-a249-4e8d16b49575	1	48000	\N	0	\N	2026-08-13 09:25:18.012	completed
16859652-b8fa-47b6-82fe-62ea9873d588	daeac7d9-8d56-47b0-83db-08432c705ec4	eaa3fac9-f60f-4db1-b33a-a4bd46e8ea71	3	45000	\N	0	\N	2026-08-13 09:25:18.012	completed
953890b4-0415-461b-9e1d-7da0326446fa	daeac7d9-8d56-47b0-83db-08432c705ec4	eb1dae05-cb14-4000-ba10-260f9cd79124	1	45000	\N	0	\N	2026-08-13 09:25:18.012	completed
a930d2fc-7636-475e-9c78-b3006d62b9eb	daeac7d9-8d56-47b0-83db-08432c705ec4	ce6673bb-c51b-4a4f-ab3d-810e44601734	3	28000	\N	0	\N	2026-08-13 09:25:18.012	completed
0e3654c5-0b80-4d14-b17e-19927fb97cef	daeac7d9-8d56-47b0-83db-08432c705ec4	ce6673bb-c51b-4a4f-ab3d-810e44601734	4	28000	\N	0	\N	2026-08-13 09:25:18.012	completed
143a5f07-0d8b-46b7-bba2-0c3efa6415bf	daeac7d9-8d56-47b0-83db-08432c705ec4	a02247ba-a10e-4387-967d-e69a05c8193a	2	32000	\N	0	\N	2026-08-13 09:25:18.012	completed
72b66ecf-d8d1-4e39-aa16-15b6999ba9b6	daeac7d9-8d56-47b0-83db-08432c705ec4	228cd2ca-0ce1-44ff-92d8-05b7c9480e55	1	42000	\N	0	\N	2026-08-13 09:25:18.012	completed
a3c06461-268b-4794-b4a9-99d84167c0d2	daeac7d9-8d56-47b0-83db-08432c705ec4	faead849-9d7b-4831-b60e-20222fee6c1f	4	48000	\N	0	\N	2026-08-13 09:25:18.012	completed
fe765af1-cfd0-40d4-a73f-0bb288732b54	5bb88122-676a-4c37-af00-c49a3302bfd7	d809adca-e256-41bc-b7b0-75df0d3f5dcb	2	35000	\N	0	\N	2026-08-13 09:25:18.02	completed
1f000683-22fd-4671-a264-0615319f7132	5bb88122-676a-4c37-af00-c49a3302bfd7	5bc34fc9-24c2-4108-af83-5992af2291d6	4	40000	\N	0	\N	2026-08-13 09:25:18.02	completed
0351953f-a8a2-4579-bcbf-920b6664b4ac	5bb88122-676a-4c37-af00-c49a3302bfd7	27af0495-2d91-4cb0-af88-4752edf671dc	3	10000	\N	0	\N	2026-08-13 09:25:18.02	completed
259655a0-368a-40d9-b4e0-8122bcca7058	767adbfd-9a4a-4c82-b182-edfae9115b86	10b0cc63-2c10-44ef-bf34-8d19b7fda2bb	1	55000	\N	0	\N	2026-08-13 09:25:18.024	completed
c7bb09ff-c81f-4fbb-a9b3-4f0b065f15a2	767adbfd-9a4a-4c82-b182-edfae9115b86	efc81916-6661-422b-826f-c68049339458	1	28000	\N	0	\N	2026-08-13 09:25:18.024	completed
94a819ba-5089-41ca-8ded-80ad3054a14d	767adbfd-9a4a-4c82-b182-edfae9115b86	faead849-9d7b-4831-b60e-20222fee6c1f	1	48000	\N	0	\N	2026-08-13 09:25:18.024	completed
1a457be4-5e85-48e6-9042-a2e44ae5d67b	767adbfd-9a4a-4c82-b182-edfae9115b86	daa4bd17-296f-4da1-8d21-15534fa8e045	4	25000	\N	0	\N	2026-08-13 09:25:18.024	completed
1ef38321-85bd-453b-aa9a-b896bf5f0737	767adbfd-9a4a-4c82-b182-edfae9115b86	b1ee3afc-db38-468c-a4bf-38b51b772024	1	20000	\N	0	\N	2026-08-13 09:25:18.024	completed
0813de21-983c-48b2-b6e9-8d6259e0148a	767adbfd-9a4a-4c82-b182-edfae9115b86	b429cd3c-c501-4b4a-b028-9ab5feedc41e	2	52000	\N	0	\N	2026-08-13 09:25:18.024	completed
ec31b759-bbb7-4154-8770-57892f6993f7	767adbfd-9a4a-4c82-b182-edfae9115b86	8f09b4ea-702e-4845-b2c0-59b3bf810d9d	3	38000	\N	0	\N	2026-08-13 09:25:18.024	completed
a9118e50-e5f9-4104-93f9-e12c59613687	6b2f5e28-60db-454a-b1f4-26542db5964d	83ceb824-bbdc-4b06-a867-037ded0aef0e	2	50000	\N	0	\N	2026-08-13 09:25:18.029	completed
9b5744ba-e449-463a-bf05-ea19ed6a3b4f	6b2f5e28-60db-454a-b1f4-26542db5964d	308d182c-58a9-47d9-a56a-bba4a473ae24	1	42000	\N	0	\N	2026-08-13 09:25:18.029	completed
070cda91-33e4-4bf6-8e63-37dfc0e4e47f	6b2f5e28-60db-454a-b1f4-26542db5964d	c0917f04-365b-4cdc-9b75-e49a7c492727	4	48000	\N	0	\N	2026-08-13 09:25:18.029	completed
56cbd7fa-b5cb-4cdb-85fb-725930b01163	6b2f5e28-60db-454a-b1f4-26542db5964d	d21a6806-fffa-4462-b33f-2c91a1c6b013	2	50000	\N	0	\N	2026-08-13 09:25:18.029	completed
9371f5c9-cb9d-4a96-891c-d0881037b3cf	f02eebb8-7500-41e4-b376-24dd70569e87	efc81916-6661-422b-826f-c68049339458	3	28000	\N	0	\N	2026-08-13 09:25:18.037	completed
c320caff-c53f-4036-beac-b50530493dae	f02eebb8-7500-41e4-b376-24dd70569e87	eaa3fac9-f60f-4db1-b33a-a4bd46e8ea71	2	45000	\N	0	\N	2026-08-13 09:25:18.037	completed
9d11d595-ee42-4b24-b1e4-87e803dbbd96	f02eebb8-7500-41e4-b376-24dd70569e87	0b97d8bc-ffce-4904-8c46-87752b930f5e	4	45000	\N	0	\N	2026-08-13 09:25:18.037	completed
9aa29c74-dacb-4318-89f6-3ce04deaaca6	f02eebb8-7500-41e4-b376-24dd70569e87	efc81916-6661-422b-826f-c68049339458	2	28000	\N	0	\N	2026-08-13 09:25:18.037	completed
0163fa3a-ca3a-404a-b1c0-b85159b24881	f02eebb8-7500-41e4-b376-24dd70569e87	b1ee3afc-db38-468c-a4bf-38b51b772024	1	20000	\N	0	\N	2026-08-13 09:25:18.037	completed
25bceb27-8eba-4318-84b9-bccb33fda85a	f02eebb8-7500-41e4-b376-24dd70569e87	eaa3fac9-f60f-4db1-b33a-a4bd46e8ea71	1	45000	\N	0	\N	2026-08-13 09:25:18.037	completed
4239f660-e74d-45ee-8534-26bfbcb3bca0	a03f90c5-9ed9-409f-b06f-0dec4259138c	3aac02bc-fcc6-4532-9a50-fa50790dd4cb	4	32000	\N	0	\N	2026-08-13 09:25:18.045	completed
f718b51e-411c-49d5-a7cb-59138283b5c7	a03f90c5-9ed9-409f-b06f-0dec4259138c	faead849-9d7b-4831-b60e-20222fee6c1f	2	48000	\N	0	\N	2026-08-13 09:25:18.045	completed
3ec89739-d593-40c0-8026-67144984b7ec	a03f90c5-9ed9-409f-b06f-0dec4259138c	00acd18c-4b3a-4737-a36c-530f2c16d3b6	4	38000	\N	0	\N	2026-08-13 09:25:18.045	completed
a2b17c4e-acea-40ac-9021-a46835bc5619	4beb4f0c-4218-4fe1-88a8-74b5f7078dda	83ff8a95-3eb4-4b98-9978-63aa6d1b8323	1	55000	\N	0	\N	2026-08-13 09:25:18.054	completed
7705250a-b0a9-4296-87e6-16b22acfbb8f	4beb4f0c-4218-4fe1-88a8-74b5f7078dda	c0917f04-365b-4cdc-9b75-e49a7c492727	1	48000	\N	0	\N	2026-08-13 09:25:18.054	completed
cc8ebaac-82d1-44b5-af1d-afeed077ebe2	4beb4f0c-4218-4fe1-88a8-74b5f7078dda	35fbf376-436a-45ea-89a5-41560d3be32b	4	35000	\N	0	\N	2026-08-13 09:25:18.054	completed
75615810-c4fe-4a9a-8857-eccb9bea0ca7	4beb4f0c-4218-4fe1-88a8-74b5f7078dda	308d182c-58a9-47d9-a56a-bba4a473ae24	1	42000	\N	0	\N	2026-08-13 09:25:18.054	completed
5ca4429d-622b-4e0f-adca-95a6a6476d8a	a8e76674-9c0b-4c4c-b76e-6502ecc26694	b429cd3c-c501-4b4a-b028-9ab5feedc41e	4	52000	\N	0	\N	2026-08-13 09:25:18.064	completed
ea5fe602-e977-4f7a-bf22-209e5d9a412d	a8e76674-9c0b-4c4c-b76e-6502ecc26694	81d6f3b5-b26a-4dd0-bfca-fea91a42a296	3	35000	\N	0	\N	2026-08-13 09:25:18.064	completed
f8b74e6d-155d-42ca-b907-eefa07c692b9	a8e76674-9c0b-4c4c-b76e-6502ecc26694	219c20d2-6247-4e8b-a734-53cfbd90ba88	1	52000	\N	0	\N	2026-08-13 09:25:18.064	completed
297a89fe-7091-4cf5-b637-499fcf1fbf88	a8e76674-9c0b-4c4c-b76e-6502ecc26694	7804beb7-b72c-43db-a27a-82b955e5e31c	2	25000	\N	0	\N	2026-08-13 09:25:18.064	completed
221dd4b6-6d0f-416c-b581-ba1a1fc1a124	a8e76674-9c0b-4c4c-b76e-6502ecc26694	acb42a52-c717-441a-824b-8a18079ee46c	1	50000	\N	0	\N	2026-08-13 09:25:18.064	completed
9f01f608-242b-437e-8cf7-d51bd417c96f	af081543-959e-4e7a-98a1-a06499f7803c	b429cd3c-c501-4b4a-b028-9ab5feedc41e	1	52000	\N	0	\N	2026-08-13 09:25:18.073	completed
44304805-5ee7-407c-ba71-e60f821e5af6	af081543-959e-4e7a-98a1-a06499f7803c	3a6ff9b1-cc6c-45ae-9635-ab2b2d03c232	1	38000	\N	0	\N	2026-08-13 09:25:18.073	completed
debe76b5-145b-4d7f-809d-1f87ccfe8ee1	af081543-959e-4e7a-98a1-a06499f7803c	25a8343a-39c3-457e-9c1d-13689bd6469b	1	45000	\N	0	\N	2026-08-13 09:25:18.073	completed
c146dfbc-5921-4b22-a6a2-05ae99c788bd	260add6b-4fe1-4200-b277-7a6734cd9e16	eb1dae05-cb14-4000-ba10-260f9cd79124	2	45000	\N	0	\N	2026-08-13 09:25:18.081	completed
0790f142-bb51-4046-ba8f-e55da4ae1a52	260add6b-4fe1-4200-b277-7a6734cd9e16	b429cd3c-c501-4b4a-b028-9ab5feedc41e	4	52000	\N	0	\N	2026-08-13 09:25:18.081	completed
f1240e6d-4d76-4cb5-aa88-9fd87ca68ca7	260add6b-4fe1-4200-b277-7a6734cd9e16	30ef5deb-6b46-47d1-a98c-8bc060d62b44	4	45000	\N	0	\N	2026-08-13 09:25:18.081	completed
8b341e9e-5cbf-44a9-9d95-68f8faaf428e	260add6b-4fe1-4200-b277-7a6734cd9e16	7804beb7-b72c-43db-a27a-82b955e5e31c	3	25000	\N	0	\N	2026-08-13 09:25:18.081	completed
c612be6d-f229-4201-9070-604092b89fb3	f210cc82-048f-414f-91ec-179d662d4fad	7804beb7-b72c-43db-a27a-82b955e5e31c	4	25000	\N	0	\N	2026-08-13 09:25:18.088	completed
ff69fe74-7ee6-4f8f-967c-29b2b40da70d	f210cc82-048f-414f-91ec-179d662d4fad	cbc78f47-cb0d-4d34-80e1-841ec7b0e5de	3	48000	\N	0	\N	2026-08-13 09:25:18.088	completed
57bd8d67-8fb9-460d-a49b-5f76c787e258	f210cc82-048f-414f-91ec-179d662d4fad	c0917f04-365b-4cdc-9b75-e49a7c492727	3	48000	\N	0	\N	2026-08-13 09:25:18.088	completed
75c671bd-10e6-4299-ad46-dd43ae22cf21	1b7e4ed8-6df0-4c9a-91ae-6a19d728dd9d	308d182c-58a9-47d9-a56a-bba4a473ae24	3	42000	\N	0	\N	2026-08-13 09:25:18.092	completed
6efea646-fad3-4eb1-b759-a2a08dd2db85	1b7e4ed8-6df0-4c9a-91ae-6a19d728dd9d	35fbf376-436a-45ea-89a5-41560d3be32b	3	35000	\N	0	\N	2026-08-13 09:25:18.092	completed
2030065a-e38f-4404-912f-f76088cd6c5d	1b7e4ed8-6df0-4c9a-91ae-6a19d728dd9d	d21a6806-fffa-4462-b33f-2c91a1c6b013	4	50000	\N	0	\N	2026-08-13 09:25:18.092	completed
a42ecb9a-2b76-423e-bef2-4bb52c5b153f	a9a4e50f-b953-458d-a0dd-553310589811	27af0495-2d91-4cb0-af88-4752edf671dc	4	10000	\N	0	\N	2026-08-13 09:25:18.1	completed
5b253181-8d57-47d0-b231-1439e1955209	a9a4e50f-b953-458d-a0dd-553310589811	884570a1-2822-4840-a08f-fc4a4a3b5fad	3	48000	\N	0	\N	2026-08-13 09:25:18.1	completed
d3ec7289-1970-4ba9-b838-a91e8dcaf508	a9a4e50f-b953-458d-a0dd-553310589811	10b0cc63-2c10-44ef-bf34-8d19b7fda2bb	2	55000	\N	0	\N	2026-08-13 09:25:18.1	completed
48e73047-6bbc-4066-b4b9-ad19a8ccd687	a9a4e50f-b953-458d-a0dd-553310589811	d52c0006-3bcd-48c7-ab83-082061dc6764	1	42000	\N	0	\N	2026-08-13 09:25:18.1	completed
9655d32a-9d57-49ee-b523-e971ec8205b4	a9a4e50f-b953-458d-a0dd-553310589811	81d6f3b5-b26a-4dd0-bfca-fea91a42a296	2	35000	\N	0	\N	2026-08-13 09:25:18.1	completed
cde4cdc3-bd26-4a1d-b6ad-665ab75c65d6	a9a4e50f-b953-458d-a0dd-553310589811	5bc34fc9-24c2-4108-af83-5992af2291d6	1	40000	\N	0	\N	2026-08-13 09:25:18.1	completed
2af6ab11-784d-443d-b08d-67260f1647ce	a9a4e50f-b953-458d-a0dd-553310589811	7484d38a-54a0-49c7-baa2-a93fdce6d347	4	55000	\N	0	\N	2026-08-13 09:25:18.1	completed
483e7f0a-18da-4cfb-8ae2-59bb4aa260ce	a9a4e50f-b953-458d-a0dd-553310589811	5bc34fc9-24c2-4108-af83-5992af2291d6	1	40000	\N	0	\N	2026-08-13 09:25:18.1	completed
3b4498f1-a913-4da5-b623-9e2f078714f3	fa7e096e-1645-4ad2-a725-b2dff12a2fd2	30ef5deb-6b46-47d1-a98c-8bc060d62b44	2	45000	\N	0	\N	2026-08-13 09:25:18.104	completed
3d205635-147b-492a-bd3f-4160c0586dbb	fa7e096e-1645-4ad2-a725-b2dff12a2fd2	5ba65aef-1f61-4c68-b8c1-d847553c8aef	3	52000	\N	0	\N	2026-08-13 09:25:18.104	completed
f9470b50-3189-4a0f-b01b-c13dbb6101ca	fa7e096e-1645-4ad2-a725-b2dff12a2fd2	308d182c-58a9-47d9-a56a-bba4a473ae24	4	42000	\N	0	\N	2026-08-13 09:25:18.104	completed
76716dc8-cda3-480a-8df7-4b9ef5ede038	fa7e096e-1645-4ad2-a725-b2dff12a2fd2	ceed2a39-e4e2-486c-b228-a909a81d8487	3	20000	\N	0	\N	2026-08-13 09:25:18.104	completed
cbb1f216-ab98-4b24-bec6-d9eedd37d224	c65ef677-67f7-4214-9632-a6b3da6e17d3	00acd18c-4b3a-4737-a36c-530f2c16d3b6	3	38000	\N	0	\N	2026-08-13 09:25:18.113	completed
4ca33187-2996-4b06-a4ec-3694e7ff6e4e	c65ef677-67f7-4214-9632-a6b3da6e17d3	803bcdee-17d3-41fc-a249-4e8d16b49575	1	48000	\N	0	\N	2026-08-13 09:25:18.113	completed
8e892a7e-b3e6-4e17-b797-c8b9830a4103	c65ef677-67f7-4214-9632-a6b3da6e17d3	01d338fc-cbda-492d-b496-2a55e100d813	2	45000	\N	0	\N	2026-08-13 09:25:18.113	completed
81107d75-0330-4cdc-853f-133970b39938	c65ef677-67f7-4214-9632-a6b3da6e17d3	3a6ff9b1-cc6c-45ae-9635-ab2b2d03c232	1	38000	\N	0	\N	2026-08-13 09:25:18.113	completed
41f0f620-1d77-4c28-b536-6c86f9ad5c7b	2047e774-9c05-4b2a-a01c-e3472bb47e10	0b97d8bc-ffce-4904-8c46-87752b930f5e	4	45000	\N	0	\N	2026-08-13 09:25:18.122	completed
fe1023de-6c2b-4b3f-8ec7-0aa1aaa63c13	2047e774-9c05-4b2a-a01c-e3472bb47e10	35fbf376-436a-45ea-89a5-41560d3be32b	2	35000	\N	0	\N	2026-08-13 09:25:18.122	completed
5e45a4be-b8ad-450e-b743-77786d871bcd	2047e774-9c05-4b2a-a01c-e3472bb47e10	d9f1fb87-e737-4210-a5bf-1bc0ba885771	3	42000	\N	0	\N	2026-08-13 09:25:18.122	completed
fc21a6b0-c058-4c2c-a3ac-98de5132f8bb	2047e774-9c05-4b2a-a01c-e3472bb47e10	c24edbc4-7c7a-4228-9b3c-1b95c2be051c	1	48000	\N	0	\N	2026-08-13 09:25:18.122	completed
80424c98-3d5f-49ba-bef2-673c78ef0afc	2047e774-9c05-4b2a-a01c-e3472bb47e10	b6a4c689-bce0-4d87-883b-b0de919eba27	2	58000	\N	0	\N	2026-08-13 09:25:18.122	completed
8c5ed623-b955-4461-a6d6-1daf623e1063	9d27b0e6-be2e-469a-a141-2579200f35ea	5bc34fc9-24c2-4108-af83-5992af2291d6	3	40000	\N	0	\N	2026-08-13 09:25:18.127	completed
ee1caad3-5055-4b67-a851-1c94a19a04b7	9d27b0e6-be2e-469a-a141-2579200f35ea	ceed2a39-e4e2-486c-b228-a909a81d8487	3	20000	\N	0	\N	2026-08-13 09:25:18.127	completed
20456914-6a96-4965-bb3f-99728ff03fea	9d27b0e6-be2e-469a-a141-2579200f35ea	25a8343a-39c3-457e-9c1d-13689bd6469b	4	45000	\N	0	\N	2026-08-13 09:25:18.127	completed
a288e4fd-14c9-4581-8086-01077c949cff	9d27b0e6-be2e-469a-a141-2579200f35ea	3aac02bc-fcc6-4532-9a50-fa50790dd4cb	1	32000	\N	0	\N	2026-08-13 09:25:18.127	completed
b4b2023c-4d52-412d-aecc-000c00c10cb8	9d27b0e6-be2e-469a-a141-2579200f35ea	c9ed90c7-689a-46ab-9fd2-84d017c264af	2	32000	\N	0	\N	2026-08-13 09:25:18.127	completed
62c43cd4-d445-4c04-962a-05483a13355b	9d27b0e6-be2e-469a-a141-2579200f35ea	884570a1-2822-4840-a08f-fc4a4a3b5fad	4	48000	\N	0	\N	2026-08-13 09:25:18.127	completed
4711f201-7654-4068-8f2a-698da2437a18	9d27b0e6-be2e-469a-a141-2579200f35ea	35fbf376-436a-45ea-89a5-41560d3be32b	2	35000	\N	0	\N	2026-08-13 09:25:18.127	completed
26b63dc2-1cae-4dad-9831-0bfbb54b60eb	8c32c1b7-fff6-481a-b0cb-08f99dfc1815	cb1888fc-f827-4522-b136-a22bf86816c2	2	35000	\N	0	\N	2026-08-13 09:25:18.131	completed
819e4375-bb12-48e6-85d9-4ee93b592b49	8c32c1b7-fff6-481a-b0cb-08f99dfc1815	e718f02b-b657-444d-89ae-fb910537eb6c	3	42000	\N	0	\N	2026-08-13 09:25:18.131	completed
aadd4c85-c264-473c-87f3-a87a27c5d0bf	8c32c1b7-fff6-481a-b0cb-08f99dfc1815	96531f07-be37-454a-aa0c-4a0eaab99930	4	55000	\N	0	\N	2026-08-13 09:25:18.131	completed
82be5284-c1d9-4ea4-8f2f-17a5234309e3	8c32c1b7-fff6-481a-b0cb-08f99dfc1815	228cd2ca-0ce1-44ff-92d8-05b7c9480e55	4	42000	\N	0	\N	2026-08-13 09:25:18.131	completed
084795f5-6f05-4a8e-93d0-6a7becbc9907	a5741c29-3c63-4dc5-ba35-e819d7850576	eb1dae05-cb14-4000-ba10-260f9cd79124	1	45000	\N	0	\N	2026-08-13 09:25:18.14	completed
61772016-4b4c-48c4-bdb2-caf98b7d28ce	a5741c29-3c63-4dc5-ba35-e819d7850576	51c45fec-e0e7-489e-8339-02a536d2e857	1	45000	\N	0	\N	2026-08-13 09:25:18.14	completed
53c1950e-9984-4c7b-98ba-af148303b79a	a5741c29-3c63-4dc5-ba35-e819d7850576	f731a039-1a1f-413d-826c-0955bb9eea80	3	55000	\N	0	\N	2026-08-13 09:25:18.14	completed
08b88a38-067e-4e5a-9cfb-0e5021ed13f8	a5741c29-3c63-4dc5-ba35-e819d7850576	ceed2a39-e4e2-486c-b228-a909a81d8487	2	20000	\N	0	\N	2026-08-13 09:25:18.14	completed
e647952b-3a0d-47ad-8dab-c96e2bc82cfa	a5741c29-3c63-4dc5-ba35-e819d7850576	01d338fc-cbda-492d-b496-2a55e100d813	4	45000	\N	0	\N	2026-08-13 09:25:18.14	completed
5e28c71a-0b51-477e-90b9-9b239f4b1f5b	a5741c29-3c63-4dc5-ba35-e819d7850576	2ce5c559-70e1-4bdd-8cf0-fcdf2a843273	3	46000	\N	0	\N	2026-08-13 09:25:18.14	completed
7bea3d0a-77be-441f-b8fb-9df9ea35378b	a5741c29-3c63-4dc5-ba35-e819d7850576	a02247ba-a10e-4387-967d-e69a05c8193a	4	32000	\N	0	\N	2026-08-13 09:25:18.14	completed
1595e04f-4b18-4599-b409-b9e2374badc7	a5741c29-3c63-4dc5-ba35-e819d7850576	2ce5c559-70e1-4bdd-8cf0-fcdf2a843273	2	46000	\N	0	\N	2026-08-13 09:25:18.14	completed
045ed48c-a1e7-4304-8b29-8245caff0ddb	fbd8710c-6894-4dec-a6b3-57f24463774c	eb1dae05-cb14-4000-ba10-260f9cd79124	1	45000	\N	0	\N	2026-08-13 09:25:18.149	completed
6154c875-9a3d-475c-9172-bda018e3d30d	fbd8710c-6894-4dec-a6b3-57f24463774c	acb42a52-c717-441a-824b-8a18079ee46c	2	50000	\N	0	\N	2026-08-13 09:25:18.149	completed
76575381-0eed-485e-94bd-67d826806d1f	fbd8710c-6894-4dec-a6b3-57f24463774c	e9bd0cdf-4357-4313-8b02-7f8260f6992f	3	52000	\N	0	\N	2026-08-13 09:25:18.149	completed
05718ce1-569f-4dfb-98b4-926ab9a05a26	fbd8710c-6894-4dec-a6b3-57f24463774c	bcff5008-981c-428b-b652-31d8c1378d9f	1	28000	\N	0	\N	2026-08-13 09:25:18.149	completed
5183ae04-40c6-4c35-be18-5f24875082c4	fbd8710c-6894-4dec-a6b3-57f24463774c	8f09b4ea-702e-4845-b2c0-59b3bf810d9d	3	38000	\N	0	\N	2026-08-13 09:25:18.149	completed
441a3091-4735-46ad-9a71-42b356a49fa8	34a2b6fb-9151-4274-8c3a-99c63c100506	daa4bd17-296f-4da1-8d21-15534fa8e045	3	25000	\N	0	\N	2026-08-13 09:25:18.158	completed
5011656c-813a-4ce0-9493-96ebfabb14d5	34a2b6fb-9151-4274-8c3a-99c63c100506	b429cd3c-c501-4b4a-b028-9ab5feedc41e	2	52000	\N	0	\N	2026-08-13 09:25:18.158	completed
c7b7082a-99bb-4f6d-b1b9-2f7fc3f94635	34a2b6fb-9151-4274-8c3a-99c63c100506	b6a4c689-bce0-4d87-883b-b0de919eba27	3	58000	\N	0	\N	2026-08-13 09:25:18.158	completed
aa07e328-5e3c-4c4a-a2e2-283526c715df	34a2b6fb-9151-4274-8c3a-99c63c100506	884570a1-2822-4840-a08f-fc4a4a3b5fad	4	48000	\N	0	\N	2026-08-13 09:25:18.158	completed
5294eed9-9ee6-403e-9281-012aa485e820	34a2b6fb-9151-4274-8c3a-99c63c100506	803bcdee-17d3-41fc-a249-4e8d16b49575	1	48000	\N	0	\N	2026-08-13 09:25:18.158	completed
03b7d3c5-9341-46a8-bac4-99b6bf9f1d1d	34a2b6fb-9151-4274-8c3a-99c63c100506	faead849-9d7b-4831-b60e-20222fee6c1f	1	48000	\N	0	\N	2026-08-13 09:25:18.158	completed
7c6b3f2f-c693-4ead-9073-683b9afe6a90	34a2b6fb-9151-4274-8c3a-99c63c100506	faead849-9d7b-4831-b60e-20222fee6c1f	1	48000	\N	0	\N	2026-08-13 09:25:18.158	completed
691dae65-c27e-4a3a-a6d8-45c98dec4df5	6697750e-2c29-4f07-9e93-9e8e2f80f8e6	eaa3fac9-f60f-4db1-b33a-a4bd46e8ea71	3	45000	\N	0	\N	2026-08-13 09:25:18.167	completed
287d935c-198e-4e7f-a85a-f42752a07bc8	6697750e-2c29-4f07-9e93-9e8e2f80f8e6	ceed2a39-e4e2-486c-b228-a909a81d8487	1	20000	\N	0	\N	2026-08-13 09:25:18.167	completed
c473b743-c2f8-4c45-9251-843f188ca0a6	6697750e-2c29-4f07-9e93-9e8e2f80f8e6	01d338fc-cbda-492d-b496-2a55e100d813	2	45000	\N	0	\N	2026-08-13 09:25:18.167	completed
2e525f8d-8dd6-41ab-85bc-544594d34829	6697750e-2c29-4f07-9e93-9e8e2f80f8e6	a02247ba-a10e-4387-967d-e69a05c8193a	3	32000	\N	0	\N	2026-08-13 09:25:18.167	completed
a82f89c3-494d-4762-9b1a-fa50abfe5613	6697750e-2c29-4f07-9e93-9e8e2f80f8e6	b429cd3c-c501-4b4a-b028-9ab5feedc41e	3	52000	\N	0	\N	2026-08-13 09:25:18.167	completed
13e91d9d-68f0-413a-b47f-21cd19354ca8	6697750e-2c29-4f07-9e93-9e8e2f80f8e6	884570a1-2822-4840-a08f-fc4a4a3b5fad	4	48000	\N	0	\N	2026-08-13 09:25:18.167	completed
969407db-21cc-48ec-ac52-e88d60f0e57d	6697750e-2c29-4f07-9e93-9e8e2f80f8e6	219c20d2-6247-4e8b-a734-53cfbd90ba88	4	52000	\N	0	\N	2026-08-13 09:25:18.167	completed
ee7d32dd-6ecb-4160-b727-e412d4771723	f599b789-dc18-4560-9623-daa3741a8b11	01d338fc-cbda-492d-b496-2a55e100d813	1	45000	\N	0	\N	2026-08-13 09:25:18.175	completed
c75983b9-5172-4fb5-ad7a-97ac20f86148	f599b789-dc18-4560-9623-daa3741a8b11	ce6673bb-c51b-4a4f-ab3d-810e44601734	4	28000	\N	0	\N	2026-08-13 09:25:18.175	completed
805d7f32-40c0-44cd-8f14-9bd777b69e1d	f599b789-dc18-4560-9623-daa3741a8b11	ce6673bb-c51b-4a4f-ab3d-810e44601734	4	28000	\N	0	\N	2026-08-13 09:25:18.175	completed
9c2a7cbd-cc49-4f0f-9f92-b0421d8594dd	dad26f03-0bcd-435d-acd1-dda69a879396	3a6ff9b1-cc6c-45ae-9635-ab2b2d03c232	3	38000	\N	0	\N	2026-08-13 09:25:18.184	completed
df926bdf-eddb-4a42-99d6-f9211c33f49b	dad26f03-0bcd-435d-acd1-dda69a879396	35fbf376-436a-45ea-89a5-41560d3be32b	4	35000	\N	0	\N	2026-08-13 09:25:18.184	completed
11ce81c0-632c-4b84-a196-995985a0a9e8	dad26f03-0bcd-435d-acd1-dda69a879396	5bc34fc9-24c2-4108-af83-5992af2291d6	1	40000	\N	0	\N	2026-08-13 09:25:18.184	completed
45525517-883f-4723-be02-af6cc448478d	dad26f03-0bcd-435d-acd1-dda69a879396	e9bd0cdf-4357-4313-8b02-7f8260f6992f	1	52000	\N	0	\N	2026-08-13 09:25:18.184	completed
7bc34a39-0e2f-422d-98c7-7bf897905034	dad26f03-0bcd-435d-acd1-dda69a879396	25a8343a-39c3-457e-9c1d-13689bd6469b	1	45000	\N	0	\N	2026-08-13 09:25:18.184	completed
01bb20a5-bcc1-4935-a3dc-784aa070c178	c9c0f0b8-0b34-4d56-bd81-aaf9ac1069ae	e9bd0cdf-4357-4313-8b02-7f8260f6992f	2	52000	\N	0	\N	2026-08-13 09:25:18.193	completed
5ad2b687-9b05-46af-92aa-5053f49ada72	c9c0f0b8-0b34-4d56-bd81-aaf9ac1069ae	3aac02bc-fcc6-4532-9a50-fa50790dd4cb	3	32000	\N	0	\N	2026-08-13 09:25:18.193	completed
4404ab93-9371-4c2e-853c-9d8ec2aeb935	c9c0f0b8-0b34-4d56-bd81-aaf9ac1069ae	e9bd0cdf-4357-4313-8b02-7f8260f6992f	4	52000	\N	0	\N	2026-08-13 09:25:18.193	completed
b324c56f-8502-4979-bfe7-23a040be79c4	c9c0f0b8-0b34-4d56-bd81-aaf9ac1069ae	00acd18c-4b3a-4737-a36c-530f2c16d3b6	4	38000	\N	0	\N	2026-08-13 09:25:18.193	completed
425efb4a-e1c4-4b16-8db6-773bd9fc16cc	c9c0f0b8-0b34-4d56-bd81-aaf9ac1069ae	219c20d2-6247-4e8b-a734-53cfbd90ba88	1	52000	\N	0	\N	2026-08-13 09:25:18.193	completed
0fafec4c-b5be-460e-bc81-a7ef84040652	c9c0f0b8-0b34-4d56-bd81-aaf9ac1069ae	d849f917-4afe-4a94-8866-03848a938c79	2	35000	\N	0	\N	2026-08-13 09:25:18.193	completed
672326bd-7c10-40c8-8354-cde684a2cf44	c9c0f0b8-0b34-4d56-bd81-aaf9ac1069ae	86643a05-ac82-4216-bdf8-87fcd64da8ec	3	48000	\N	0	\N	2026-08-13 09:25:18.193	completed
8251ec3f-ba52-4fab-885b-dfecb84b26db	ab1cfcb1-2a4e-4664-af3a-c2e47dce7e40	c0917f04-365b-4cdc-9b75-e49a7c492727	1	48000	\N	0	\N	2026-08-13 09:25:18.202	completed
8edf4a20-3796-4535-bd35-ba515a59a9b0	ab1cfcb1-2a4e-4664-af3a-c2e47dce7e40	35fbf376-436a-45ea-89a5-41560d3be32b	1	35000	\N	0	\N	2026-08-13 09:25:18.202	completed
2641be45-8174-461b-a3f8-0eee93978da2	ab1cfcb1-2a4e-4664-af3a-c2e47dce7e40	10b0cc63-2c10-44ef-bf34-8d19b7fda2bb	4	55000	\N	0	\N	2026-08-13 09:25:18.202	completed
0a5899f5-f701-4d85-9362-2218b966bf02	ab1cfcb1-2a4e-4664-af3a-c2e47dce7e40	12b460b3-749d-4ab1-80de-d8f51d5188cc	2	40000	\N	0	\N	2026-08-13 09:25:18.202	completed
1049157a-d419-4954-91f2-53c936d63014	ab1cfcb1-2a4e-4664-af3a-c2e47dce7e40	30ef5deb-6b46-47d1-a98c-8bc060d62b44	4	45000	\N	0	\N	2026-08-13 09:25:18.202	completed
0a19db4b-6eee-4a7d-92d3-f1b707d0fb0f	ab1cfcb1-2a4e-4664-af3a-c2e47dce7e40	96531f07-be37-454a-aa0c-4a0eaab99930	1	55000	\N	0	\N	2026-08-13 09:25:18.202	completed
030795b9-6f3e-4f0f-8b6b-1ea0623c8d29	ab1cfcb1-2a4e-4664-af3a-c2e47dce7e40	3aac02bc-fcc6-4532-9a50-fa50790dd4cb	1	32000	\N	0	\N	2026-08-13 09:25:18.202	completed
d8f1baf9-189b-49f7-af73-ec293c0d11b6	88de6227-564c-4492-a07c-3950adf3cbbb	35fbf376-436a-45ea-89a5-41560d3be32b	3	35000	\N	0	\N	2026-08-13 09:25:18.211	completed
ac9e84a0-70b2-44f3-a3c2-6f27ebf9952d	88de6227-564c-4492-a07c-3950adf3cbbb	d52c0006-3bcd-48c7-ab83-082061dc6764	2	42000	\N	0	\N	2026-08-13 09:25:18.211	completed
6b4f0a1f-d218-4871-bd82-77b634471798	88de6227-564c-4492-a07c-3950adf3cbbb	acb42a52-c717-441a-824b-8a18079ee46c	1	50000	\N	0	\N	2026-08-13 09:25:18.211	completed
2db41a24-39da-45dc-adfa-05e8ee2bc3a6	88de6227-564c-4492-a07c-3950adf3cbbb	a02247ba-a10e-4387-967d-e69a05c8193a	2	32000	\N	0	\N	2026-08-13 09:25:18.211	completed
f5bb47a2-43d5-4584-8f9c-33162899dfe2	fbc51641-b459-4b18-9eff-006d3826922d	f731a039-1a1f-413d-826c-0955bb9eea80	1	55000	\N	0	\N	2026-08-13 09:25:18.219	completed
4c6c8932-704b-4e67-9061-fc7980fa428a	fbc51641-b459-4b18-9eff-006d3826922d	27af0495-2d91-4cb0-af88-4752edf671dc	1	10000	\N	0	\N	2026-08-13 09:25:18.219	completed
df4abc29-230b-488b-afad-ae4bf8babf4f	fbc51641-b459-4b18-9eff-006d3826922d	c9ed90c7-689a-46ab-9fd2-84d017c264af	3	32000	\N	0	\N	2026-08-13 09:25:18.219	completed
d8865b6e-beec-4a10-ba10-92a9010860cd	fbc51641-b459-4b18-9eff-006d3826922d	daa4bd17-296f-4da1-8d21-15534fa8e045	3	25000	\N	0	\N	2026-08-13 09:25:18.219	completed
5db6f2d7-5c93-45fb-8344-d7c6164944f2	fbc51641-b459-4b18-9eff-006d3826922d	5bc34fc9-24c2-4108-af83-5992af2291d6	1	40000	\N	0	\N	2026-08-13 09:25:18.219	completed
04fd9c23-0145-47f4-a892-9c428dcfbe9f	ad53a2ef-0bac-409f-8cc0-1c5501f70a30	ceed2a39-e4e2-486c-b228-a909a81d8487	3	20000	\N	0	\N	2026-08-13 09:25:18.224	completed
32fdc3c5-baa5-411e-bb16-7e9d9ed8518b	ad53a2ef-0bac-409f-8cc0-1c5501f70a30	83ff8a95-3eb4-4b98-9978-63aa6d1b8323	1	55000	\N	0	\N	2026-08-13 09:25:18.224	completed
3f70210d-eb3e-4dfc-ae85-9995eac6b6bd	ad53a2ef-0bac-409f-8cc0-1c5501f70a30	faead849-9d7b-4831-b60e-20222fee6c1f	1	48000	\N	0	\N	2026-08-13 09:25:18.224	completed
0b2dbb21-67ac-46ab-bc1c-0af38acce1c4	ad53a2ef-0bac-409f-8cc0-1c5501f70a30	10b0cc63-2c10-44ef-bf34-8d19b7fda2bb	2	55000	\N	0	\N	2026-08-13 09:25:18.224	completed
96093fe9-ea25-4d77-bd1d-f705b7f1baf0	ad53a2ef-0bac-409f-8cc0-1c5501f70a30	8f09b4ea-702e-4845-b2c0-59b3bf810d9d	3	38000	\N	0	\N	2026-08-13 09:25:18.224	completed
d8d930cf-d2bc-4f8b-9292-772db264ecff	ad53a2ef-0bac-409f-8cc0-1c5501f70a30	b429cd3c-c501-4b4a-b028-9ab5feedc41e	3	52000	\N	0	\N	2026-08-13 09:25:18.224	completed
f2d44666-d98c-4616-821e-aa7fb7e2d7e2	3002b89e-4185-4fa2-9d2c-779e503ab2d0	81d6f3b5-b26a-4dd0-bfca-fea91a42a296	2	35000	\N	0	\N	2026-08-13 09:25:18.23	completed
236cdf5f-7b7e-4a55-9f86-e2edb52b65c5	3002b89e-4185-4fa2-9d2c-779e503ab2d0	30ef5deb-6b46-47d1-a98c-8bc060d62b44	2	45000	\N	0	\N	2026-08-13 09:25:18.23	completed
826de800-bf29-4361-909b-e8b1bdd1ecab	3002b89e-4185-4fa2-9d2c-779e503ab2d0	86643a05-ac82-4216-bdf8-87fcd64da8ec	1	48000	\N	0	\N	2026-08-13 09:25:18.23	completed
70f6b5aa-6bed-427c-a1f2-e3ecbd088843	3002b89e-4185-4fa2-9d2c-779e503ab2d0	8f09b4ea-702e-4845-b2c0-59b3bf810d9d	1	38000	\N	0	\N	2026-08-13 09:25:18.23	completed
0d9802f3-791f-49d8-959b-9280898c03c8	3002b89e-4185-4fa2-9d2c-779e503ab2d0	51c45fec-e0e7-489e-8339-02a536d2e857	3	45000	\N	0	\N	2026-08-13 09:25:18.23	completed
7c70c1fa-3d66-4d91-b679-abd581bff329	3002b89e-4185-4fa2-9d2c-779e503ab2d0	8f09b4ea-702e-4845-b2c0-59b3bf810d9d	3	38000	\N	0	\N	2026-08-13 09:25:18.23	completed
667b37f0-c7ee-44ee-a139-9e65e78b75c2	3002b89e-4185-4fa2-9d2c-779e503ab2d0	b6a4c689-bce0-4d87-883b-b0de919eba27	3	58000	\N	0	\N	2026-08-13 09:25:18.23	completed
d1204773-ee6e-42e1-86e2-cc192a01e29e	3002b89e-4185-4fa2-9d2c-779e503ab2d0	b6a4c689-bce0-4d87-883b-b0de919eba27	4	58000	\N	0	\N	2026-08-13 09:25:18.23	completed
5b96e4d4-227e-4db3-ba39-62d5bc0fda46	72a5bc33-5f68-4dbd-9641-fa276e31ae99	eb1dae05-cb14-4000-ba10-260f9cd79124	2	45000	\N	0	\N	2026-08-13 09:25:18.234	completed
80dbba9f-a663-4608-9de0-84bae3d1dbcd	72a5bc33-5f68-4dbd-9641-fa276e31ae99	c9ed90c7-689a-46ab-9fd2-84d017c264af	2	32000	\N	0	\N	2026-08-13 09:25:18.234	completed
c4c8208b-fbe6-406b-9eb4-3dd49b1a2a6e	72a5bc33-5f68-4dbd-9641-fa276e31ae99	d21a6806-fffa-4462-b33f-2c91a1c6b013	2	50000	\N	0	\N	2026-08-13 09:25:18.234	completed
fde7fb94-6006-4410-b291-11d74ef32910	72a5bc33-5f68-4dbd-9641-fa276e31ae99	83ceb824-bbdc-4b06-a867-037ded0aef0e	3	50000	\N	0	\N	2026-08-13 09:25:18.234	completed
f6b2b2f2-062f-4ed4-aedb-f3349dad30aa	3f870f79-7bc0-4cb2-8f6c-1c033f2a162f	308d182c-58a9-47d9-a56a-bba4a473ae24	2	42000	\N	0	\N	2026-08-13 09:25:18.243	completed
77c8c0b1-2a65-4a8f-9563-886dcb3daf58	3f870f79-7bc0-4cb2-8f6c-1c033f2a162f	b6a4c689-bce0-4d87-883b-b0de919eba27	1	58000	\N	0	\N	2026-08-13 09:25:18.243	completed
321dc3b6-fb62-4987-85b0-3c71fe36be30	3f870f79-7bc0-4cb2-8f6c-1c033f2a162f	5bc34fc9-24c2-4108-af83-5992af2291d6	3	40000	\N	0	\N	2026-08-13 09:25:18.243	completed
533c33be-d774-409a-a28b-7133ed9c8f8b	3f870f79-7bc0-4cb2-8f6c-1c033f2a162f	d9f1fb87-e737-4210-a5bf-1bc0ba885771	3	42000	\N	0	\N	2026-08-13 09:25:18.243	completed
923d7b41-fb6e-4d70-97ae-aeda6937cce9	3f870f79-7bc0-4cb2-8f6c-1c033f2a162f	e718f02b-b657-444d-89ae-fb910537eb6c	2	42000	\N	0	\N	2026-08-13 09:25:18.243	completed
1a1d3de9-9b6a-45ee-971c-4b3335b0884c	3f870f79-7bc0-4cb2-8f6c-1c033f2a162f	83ff8a95-3eb4-4b98-9978-63aa6d1b8323	3	55000	\N	0	\N	2026-08-13 09:25:18.243	completed
aa85ac1f-2d80-40ed-ad70-8ae8fdc264eb	3f870f79-7bc0-4cb2-8f6c-1c033f2a162f	5bc34fc9-24c2-4108-af83-5992af2291d6	2	40000	\N	0	\N	2026-08-13 09:25:18.243	completed
041302f4-d476-4fea-a2f2-00b7e7057a95	3f870f79-7bc0-4cb2-8f6c-1c033f2a162f	b429cd3c-c501-4b4a-b028-9ab5feedc41e	2	52000	\N	0	\N	2026-08-13 09:25:18.243	completed
15e86027-8dd9-42d5-9fde-589e0267942d	d989cddc-b4a8-4263-81b6-d912a6b4572a	30ef5deb-6b46-47d1-a98c-8bc060d62b44	1	45000	\N	0	\N	2026-08-13 09:25:18.251	completed
fe606a63-d2d0-4d3c-8d57-83d0e19e97cd	d989cddc-b4a8-4263-81b6-d912a6b4572a	219c20d2-6247-4e8b-a734-53cfbd90ba88	4	52000	\N	0	\N	2026-08-13 09:25:18.251	completed
d4bfc778-da53-466a-8d27-4772ce8e6e24	d989cddc-b4a8-4263-81b6-d912a6b4572a	ce6673bb-c51b-4a4f-ab3d-810e44601734	4	28000	\N	0	\N	2026-08-13 09:25:18.251	completed
751f030a-de87-46ab-9a47-7c40875669e3	d989cddc-b4a8-4263-81b6-d912a6b4572a	e718f02b-b657-444d-89ae-fb910537eb6c	2	42000	\N	0	\N	2026-08-13 09:25:18.251	completed
59d41e8c-8ec1-4641-9e12-3e3a1b08c633	4bdd0200-04f8-47f7-93e5-1353d859d41c	0b97d8bc-ffce-4904-8c46-87752b930f5e	4	45000	\N	0	\N	2026-08-13 09:25:18.256	completed
4796eac8-c8db-4e52-bd1f-e7863d07e78a	4bdd0200-04f8-47f7-93e5-1353d859d41c	25a8343a-39c3-457e-9c1d-13689bd6469b	4	45000	\N	0	\N	2026-08-13 09:25:18.256	completed
a5eb6b7a-16d4-47a0-8657-61a4b081f6bb	4bdd0200-04f8-47f7-93e5-1353d859d41c	bcff5008-981c-428b-b652-31d8c1378d9f	4	28000	\N	0	\N	2026-08-13 09:25:18.256	completed
d0f91f6e-a0d4-4641-bcb5-396169e1c71e	22a13b93-4fa7-4112-a084-f2108580b6aa	e24a6cc9-1b6e-4ba7-94a5-514f6aa8fe31	2	45000	\N	0	\N	2026-08-13 09:25:18.265	completed
ae3b6866-c4d4-45cf-9290-71e895159408	22a13b93-4fa7-4112-a084-f2108580b6aa	d52c0006-3bcd-48c7-ab83-082061dc6764	2	42000	\N	0	\N	2026-08-13 09:25:18.265	completed
2dc7fae5-680c-4fda-9a2c-1c1e53181a11	22a13b93-4fa7-4112-a084-f2108580b6aa	228cd2ca-0ce1-44ff-92d8-05b7c9480e55	4	42000	\N	0	\N	2026-08-13 09:25:18.265	completed
2bdbba1d-8710-496a-92b8-81f239e010d1	22a13b93-4fa7-4112-a084-f2108580b6aa	2ce5c559-70e1-4bdd-8cf0-fcdf2a843273	1	46000	\N	0	\N	2026-08-13 09:25:18.265	completed
a884fdc8-e86f-469a-8ed6-89d80cf842cd	d9d8df3c-c2f3-4a81-ac4f-33f626e15eab	25a8343a-39c3-457e-9c1d-13689bd6469b	1	45000	\N	0	\N	2026-08-13 09:25:18.274	completed
0ae4bfba-22ea-43ed-b928-cdd36a8dcf1a	d9d8df3c-c2f3-4a81-ac4f-33f626e15eab	00acd18c-4b3a-4737-a36c-530f2c16d3b6	3	38000	\N	0	\N	2026-08-13 09:25:18.274	completed
0f7331f7-ff72-4fe4-bb19-a3979c4fe7ec	d9d8df3c-c2f3-4a81-ac4f-33f626e15eab	803bcdee-17d3-41fc-a249-4e8d16b49575	3	48000	\N	0	\N	2026-08-13 09:25:18.274	completed
46b7a1b3-a6d9-4069-9bab-74b798fd51b2	d9d8df3c-c2f3-4a81-ac4f-33f626e15eab	51c45fec-e0e7-489e-8339-02a536d2e857	3	45000	\N	0	\N	2026-08-13 09:25:18.274	completed
7445e9cf-442a-4b4b-8485-3d18889ed7cb	d9d8df3c-c2f3-4a81-ac4f-33f626e15eab	83ff8a95-3eb4-4b98-9978-63aa6d1b8323	2	55000	\N	0	\N	2026-08-13 09:25:18.274	completed
9d08c4f5-2109-4e7a-961f-877862e5ab23	93c44084-afbe-42c5-bfc5-7f08065d30ab	c9ed90c7-689a-46ab-9fd2-84d017c264af	1	32000	\N	0	\N	2026-08-13 09:25:18.283	completed
1df8a318-113a-425c-b7e8-4e412e24098b	93c44084-afbe-42c5-bfc5-7f08065d30ab	6798927c-bcba-49fd-a7ad-78291c69ac33	4	52000	\N	0	\N	2026-08-13 09:25:18.283	completed
b5793eef-6e91-4c42-abb7-a0a26e7a44e4	93c44084-afbe-42c5-bfc5-7f08065d30ab	ceed2a39-e4e2-486c-b228-a909a81d8487	4	20000	\N	0	\N	2026-08-13 09:25:18.283	completed
6398d029-941d-43cb-8e15-4d88d18647bb	93c44084-afbe-42c5-bfc5-7f08065d30ab	c0917f04-365b-4cdc-9b75-e49a7c492727	3	48000	\N	0	\N	2026-08-13 09:25:18.283	completed
0c06f2d4-ec81-4b0f-a3fd-3a96695dabb4	93c44084-afbe-42c5-bfc5-7f08065d30ab	8f09b4ea-702e-4845-b2c0-59b3bf810d9d	2	38000	\N	0	\N	2026-08-13 09:25:18.283	completed
4be7e364-686f-440a-a12b-6eb02e4a1e29	93c44084-afbe-42c5-bfc5-7f08065d30ab	01d338fc-cbda-492d-b496-2a55e100d813	1	45000	\N	0	\N	2026-08-13 09:25:18.283	completed
f4b3e45d-66ec-4e8d-859b-9b30a3f48121	93c44084-afbe-42c5-bfc5-7f08065d30ab	86643a05-ac82-4216-bdf8-87fcd64da8ec	3	48000	\N	0	\N	2026-08-13 09:25:18.283	completed
8cf6c812-4365-4722-b265-7ea64a5d53c6	93c44084-afbe-42c5-bfc5-7f08065d30ab	2ce5c559-70e1-4bdd-8cf0-fcdf2a843273	2	46000	\N	0	\N	2026-08-13 09:25:18.283	completed
71b05f0f-adf5-4ecf-b59d-dd5c29474d0c	a8b67061-d1cf-4446-b6f0-9bb44c63ec2f	b6a4c689-bce0-4d87-883b-b0de919eba27	1	58000	\N	0	\N	2026-08-13 09:25:18.291	completed
a0c45825-03f3-4af2-a939-f2b1487d21f4	a8b67061-d1cf-4446-b6f0-9bb44c63ec2f	a02247ba-a10e-4387-967d-e69a05c8193a	4	32000	\N	0	\N	2026-08-13 09:25:18.291	completed
d6224d2f-516d-49d1-b1ef-eda53cf7b170	a8b67061-d1cf-4446-b6f0-9bb44c63ec2f	86643a05-ac82-4216-bdf8-87fcd64da8ec	2	48000	\N	0	\N	2026-08-13 09:25:18.291	completed
44eb5393-fc43-4774-a7c6-6efeb5b94236	a8b67061-d1cf-4446-b6f0-9bb44c63ec2f	219c20d2-6247-4e8b-a734-53cfbd90ba88	2	52000	\N	0	\N	2026-08-13 09:25:18.291	completed
6758ebbd-f94b-4134-9217-bfc31ce98ed1	a8b67061-d1cf-4446-b6f0-9bb44c63ec2f	81d6f3b5-b26a-4dd0-bfca-fea91a42a296	2	35000	\N	0	\N	2026-08-13 09:25:18.291	completed
bcf1d6c2-0328-4414-a809-561ba7512af5	a8b67061-d1cf-4446-b6f0-9bb44c63ec2f	81d6f3b5-b26a-4dd0-bfca-fea91a42a296	1	35000	\N	0	\N	2026-08-13 09:25:18.291	completed
74875baf-2501-4966-bd8a-a19c0bb18cbe	a8b67061-d1cf-4446-b6f0-9bb44c63ec2f	e9bd0cdf-4357-4313-8b02-7f8260f6992f	3	52000	\N	0	\N	2026-08-13 09:25:18.291	completed
059eb041-0e49-4dc1-b5ee-58749f7ee1b7	a8b67061-d1cf-4446-b6f0-9bb44c63ec2f	27af0495-2d91-4cb0-af88-4752edf671dc	3	10000	\N	0	\N	2026-08-13 09:25:18.291	completed
b0d81764-b319-4273-8bcb-bc7750cb458d	e73ef591-f508-434c-9dd0-0108feda6e01	b6a4c689-bce0-4d87-883b-b0de919eba27	4	58000	\N	0	\N	2026-08-13 09:25:18.296	completed
34323b73-63b2-4306-a53c-e4ca6971764b	e73ef591-f508-434c-9dd0-0108feda6e01	6798927c-bcba-49fd-a7ad-78291c69ac33	2	52000	\N	0	\N	2026-08-13 09:25:18.296	completed
5c3e6c41-5fd6-4012-a89b-daff65c93503	e73ef591-f508-434c-9dd0-0108feda6e01	7804beb7-b72c-43db-a27a-82b955e5e31c	2	25000	\N	0	\N	2026-08-13 09:25:18.296	completed
a0f4d74a-eb3d-456e-9a46-3a5eabb65839	e73ef591-f508-434c-9dd0-0108feda6e01	30ef5deb-6b46-47d1-a98c-8bc060d62b44	3	45000	\N	0	\N	2026-08-13 09:25:18.296	completed
090b31c8-5552-43ef-b9d0-5860f555ad8e	e73ef591-f508-434c-9dd0-0108feda6e01	c0917f04-365b-4cdc-9b75-e49a7c492727	4	48000	\N	0	\N	2026-08-13 09:25:18.296	completed
730b8401-daca-45a7-9ea4-49602dcb8325	e73ef591-f508-434c-9dd0-0108feda6e01	81d6f3b5-b26a-4dd0-bfca-fea91a42a296	2	35000	\N	0	\N	2026-08-13 09:25:18.296	completed
3833fbde-29b9-4d34-bb31-93613a9b7d3a	e73ef591-f508-434c-9dd0-0108feda6e01	30ef5deb-6b46-47d1-a98c-8bc060d62b44	2	45000	\N	0	\N	2026-08-13 09:25:18.296	completed
103781e0-bcdd-4db7-b312-eabde76d5aaf	c42447fe-ec1e-4b8c-ad03-36459e8e989c	86643a05-ac82-4216-bdf8-87fcd64da8ec	3	48000	\N	0	\N	2026-08-13 09:25:18.304	completed
cf276b91-6677-43bb-9762-87b3f2abe617	c42447fe-ec1e-4b8c-ad03-36459e8e989c	e718f02b-b657-444d-89ae-fb910537eb6c	3	42000	\N	0	\N	2026-08-13 09:25:18.304	completed
c83e7038-9dbf-4388-8aa7-3dd1ef1db9b7	c42447fe-ec1e-4b8c-ad03-36459e8e989c	6798927c-bcba-49fd-a7ad-78291c69ac33	3	52000	\N	0	\N	2026-08-13 09:25:18.304	completed
a73dec2a-f2e1-4825-82a2-2182616ec92a	c42447fe-ec1e-4b8c-ad03-36459e8e989c	d21a6806-fffa-4462-b33f-2c91a1c6b013	3	50000	\N	0	\N	2026-08-13 09:25:18.304	completed
3311016c-41d4-4161-a9c4-6566f188c43e	daf10539-4564-4707-9394-b27c81433071	faead849-9d7b-4831-b60e-20222fee6c1f	2	48000	\N	0	\N	2026-08-13 09:25:18.313	completed
01cabd03-9765-46d9-9f92-fc8a4776e518	daf10539-4564-4707-9394-b27c81433071	c24edbc4-7c7a-4228-9b3c-1b95c2be051c	2	48000	\N	0	\N	2026-08-13 09:25:18.313	completed
9aee4db0-84a7-4ca1-8bd7-01c99723ec1f	daf10539-4564-4707-9394-b27c81433071	51c45fec-e0e7-489e-8339-02a536d2e857	1	45000	\N	0	\N	2026-08-13 09:25:18.313	completed
372216a0-854a-4702-8094-afb2739041aa	daf10539-4564-4707-9394-b27c81433071	3aac02bc-fcc6-4532-9a50-fa50790dd4cb	4	32000	\N	0	\N	2026-08-13 09:25:18.313	completed
69117532-3cfb-4690-a774-873afce144e6	daf10539-4564-4707-9394-b27c81433071	6798927c-bcba-49fd-a7ad-78291c69ac33	4	52000	\N	0	\N	2026-08-13 09:25:18.313	completed
0907a74a-7662-41f3-83ca-e514613dd0f2	daf10539-4564-4707-9394-b27c81433071	8f09b4ea-702e-4845-b2c0-59b3bf810d9d	4	38000	\N	0	\N	2026-08-13 09:25:18.313	completed
166ef5f9-805d-4e4e-bce0-47f4dbf3eae5	daf10539-4564-4707-9394-b27c81433071	d21a6806-fffa-4462-b33f-2c91a1c6b013	1	50000	\N	0	\N	2026-08-13 09:25:18.313	completed
656bb435-9793-4742-94a4-8fdc1841316b	63f43c48-0722-458c-9767-219f6056e1e5	ce6673bb-c51b-4a4f-ab3d-810e44601734	2	28000	\N	0	\N	2026-08-13 09:25:18.321	completed
eb0d7e28-ef4e-419e-b360-c87a78bc6c0b	63f43c48-0722-458c-9767-219f6056e1e5	30ef5deb-6b46-47d1-a98c-8bc060d62b44	3	45000	\N	0	\N	2026-08-13 09:25:18.321	completed
9524aac3-4221-4981-a9c8-a970906db72a	63f43c48-0722-458c-9767-219f6056e1e5	884570a1-2822-4840-a08f-fc4a4a3b5fad	3	48000	\N	0	\N	2026-08-13 09:25:18.321	completed
a5e73d49-4b49-487e-96e6-33b5791cb7d5	63f43c48-0722-458c-9767-219f6056e1e5	219c20d2-6247-4e8b-a734-53cfbd90ba88	4	52000	\N	0	\N	2026-08-13 09:25:18.321	completed
f7d77f3e-3f6a-4e8b-99b4-74cdf15e09d0	63f43c48-0722-458c-9767-219f6056e1e5	51c45fec-e0e7-489e-8339-02a536d2e857	1	45000	\N	0	\N	2026-08-13 09:25:18.321	completed
bdfda2a0-a0fa-44d9-bb40-8bb0fb94d3e0	6214bb49-fa8d-494a-9335-c979db6c7846	83ff8a95-3eb4-4b98-9978-63aa6d1b8323	1	55000	\N	0	\N	2026-08-13 09:25:18.33	completed
0cf710ae-9840-40ca-919f-92899f94ea28	6214bb49-fa8d-494a-9335-c979db6c7846	96531f07-be37-454a-aa0c-4a0eaab99930	1	55000	\N	0	\N	2026-08-13 09:25:18.33	completed
9eb1ec04-1ce4-453c-86c9-cab523cb0046	6214bb49-fa8d-494a-9335-c979db6c7846	daa4bd17-296f-4da1-8d21-15534fa8e045	3	25000	\N	0	\N	2026-08-13 09:25:18.33	completed
b0b6c8c9-73c7-4299-ada8-0fe52c252b98	6214bb49-fa8d-494a-9335-c979db6c7846	625d086d-e1db-42f3-9cd5-84006fb429c1	3	48000	\N	0	\N	2026-08-13 09:25:18.33	completed
cd61298e-2461-48cd-8d7a-966bb7e16596	6214bb49-fa8d-494a-9335-c979db6c7846	f731a039-1a1f-413d-826c-0955bb9eea80	3	55000	\N	0	\N	2026-08-13 09:25:18.33	completed
47f8836d-6117-4d99-87d8-8ff0ae0da4b2	6214bb49-fa8d-494a-9335-c979db6c7846	b429cd3c-c501-4b4a-b028-9ab5feedc41e	4	52000	\N	0	\N	2026-08-13 09:25:18.33	completed
167d9d32-3a5e-46d3-a847-4150b10b4744	8ab33dbb-82c7-4583-af7f-08053c287536	b1ee3afc-db38-468c-a4bf-38b51b772024	3	20000	\N	0	\N	2026-08-13 09:25:18.339	completed
96302a0f-5043-432d-854f-3347a81caaeb	8ab33dbb-82c7-4583-af7f-08053c287536	b6a4c689-bce0-4d87-883b-b0de919eba27	2	58000	\N	0	\N	2026-08-13 09:25:18.339	completed
4630c2ed-3391-411a-9913-2f826b0e13fd	8ab33dbb-82c7-4583-af7f-08053c287536	3a6ff9b1-cc6c-45ae-9635-ab2b2d03c232	3	38000	\N	0	\N	2026-08-13 09:25:18.339	completed
6494d7f7-e916-4367-b546-8dc8074e7eaa	8ab33dbb-82c7-4583-af7f-08053c287536	faead849-9d7b-4831-b60e-20222fee6c1f	4	48000	\N	0	\N	2026-08-13 09:25:18.339	completed
2851a921-cb51-41de-b982-7cf1ea739634	43f73b49-a103-4002-a359-ed2045204980	0b97d8bc-ffce-4904-8c46-87752b930f5e	2	45000	\N	0	\N	2026-08-13 09:25:18.348	completed
5eee8058-02d6-4903-96e6-5a6f290f477a	43f73b49-a103-4002-a359-ed2045204980	3aac02bc-fcc6-4532-9a50-fa50790dd4cb	4	32000	\N	0	\N	2026-08-13 09:25:18.348	completed
e929881a-d3c6-4ea3-b3a0-e4288543dd25	43f73b49-a103-4002-a359-ed2045204980	228cd2ca-0ce1-44ff-92d8-05b7c9480e55	4	42000	\N	0	\N	2026-08-13 09:25:18.348	completed
f651c339-f4eb-452f-9fd6-7b3854030fcf	43f73b49-a103-4002-a359-ed2045204980	eaa3fac9-f60f-4db1-b33a-a4bd46e8ea71	1	45000	\N	0	\N	2026-08-13 09:25:18.348	completed
253ef48c-50fd-42bf-9045-fbce19117ae9	43f73b49-a103-4002-a359-ed2045204980	51c45fec-e0e7-489e-8339-02a536d2e857	4	45000	\N	0	\N	2026-08-13 09:25:18.348	completed
a44c4633-4958-4b2f-ab9f-58aaf7fe1f36	43f73b49-a103-4002-a359-ed2045204980	7804beb7-b72c-43db-a27a-82b955e5e31c	3	25000	\N	0	\N	2026-08-13 09:25:18.348	completed
18a698da-3334-401a-9733-4de92f5ce0e7	43f73b49-a103-4002-a359-ed2045204980	81d6f3b5-b26a-4dd0-bfca-fea91a42a296	1	35000	\N	0	\N	2026-08-13 09:25:18.348	completed
d65092dc-111b-4509-812a-934d2d4c2c6f	43f73b49-a103-4002-a359-ed2045204980	3aac02bc-fcc6-4532-9a50-fa50790dd4cb	1	32000	\N	0	\N	2026-08-13 09:25:18.348	completed
e2294d66-fd68-40e6-922a-678254d20674	bb888987-331e-4e41-8f80-5a511d3e1084	5ba65aef-1f61-4c68-b8c1-d847553c8aef	1	52000	\N	0	\N	2026-08-13 09:25:18.358	completed
1c5267af-423d-4e44-974d-2a3a89848636	bb888987-331e-4e41-8f80-5a511d3e1084	12b460b3-749d-4ab1-80de-d8f51d5188cc	4	40000	\N	0	\N	2026-08-13 09:25:18.358	completed
17978a87-7f99-4ac3-a8f9-30fe22d6f7fc	bb888987-331e-4e41-8f80-5a511d3e1084	01d338fc-cbda-492d-b496-2a55e100d813	3	45000	\N	0	\N	2026-08-13 09:25:18.358	completed
1655409b-9548-4b02-bcd5-39517862c70f	bb888987-331e-4e41-8f80-5a511d3e1084	7804beb7-b72c-43db-a27a-82b955e5e31c	1	25000	\N	0	\N	2026-08-13 09:25:18.358	completed
0d33d164-bacb-4336-b410-24d66aa61993	bb888987-331e-4e41-8f80-5a511d3e1084	803bcdee-17d3-41fc-a249-4e8d16b49575	1	48000	\N	0	\N	2026-08-13 09:25:18.358	completed
b6085d7b-aa8f-428b-b0cb-f35d0e24e918	bb888987-331e-4e41-8f80-5a511d3e1084	d809adca-e256-41bc-b7b0-75df0d3f5dcb	3	35000	\N	0	\N	2026-08-13 09:25:18.358	completed
7d2379ec-266e-4fce-b6f8-4d12918935c6	bb888987-331e-4e41-8f80-5a511d3e1084	b1ee3afc-db38-468c-a4bf-38b51b772024	1	20000	\N	0	\N	2026-08-13 09:25:18.358	completed
95b6271e-e4c0-4f09-a072-1cd5651f4e70	1e5589d8-717b-4901-b961-06ed94b5a042	219c20d2-6247-4e8b-a734-53cfbd90ba88	4	52000	\N	0	\N	2026-08-13 09:25:18.368	completed
8f11a500-5d38-4c47-8241-0a740b43f05b	1e5589d8-717b-4901-b961-06ed94b5a042	faead849-9d7b-4831-b60e-20222fee6c1f	2	48000	\N	0	\N	2026-08-13 09:25:18.368	completed
358d0f17-5d12-47f0-af03-14f1758bc257	1e5589d8-717b-4901-b961-06ed94b5a042	83ff8a95-3eb4-4b98-9978-63aa6d1b8323	2	55000	\N	0	\N	2026-08-13 09:25:18.368	completed
ef8a8868-037e-49d4-a603-7ff6aa4b0ae8	36a105f0-a096-4eb7-89b1-331ab72fb9ce	3a6ff9b1-cc6c-45ae-9635-ab2b2d03c232	2	38000	\N	0	\N	2026-08-13 09:25:18.378	completed
f396091f-7d8a-47a3-a35d-1b8356988ec8	36a105f0-a096-4eb7-89b1-331ab72fb9ce	228cd2ca-0ce1-44ff-92d8-05b7c9480e55	2	42000	\N	0	\N	2026-08-13 09:25:18.378	completed
a3e7b0c6-11d1-4e58-9bca-489ef440fd64	36a105f0-a096-4eb7-89b1-331ab72fb9ce	27af0495-2d91-4cb0-af88-4752edf671dc	3	10000	\N	0	\N	2026-08-13 09:25:18.378	completed
bcde66ab-37c7-4593-9111-caffcc083d3a	36a105f0-a096-4eb7-89b1-331ab72fb9ce	f731a039-1a1f-413d-826c-0955bb9eea80	3	55000	\N	0	\N	2026-08-13 09:25:18.378	completed
9a098209-dee7-410e-92c5-987a3007ffb0	36a105f0-a096-4eb7-89b1-331ab72fb9ce	25a8343a-39c3-457e-9c1d-13689bd6469b	3	45000	\N	0	\N	2026-08-13 09:25:18.378	completed
cb85604a-1b41-489e-8cd5-46da1943d387	36a105f0-a096-4eb7-89b1-331ab72fb9ce	81d6f3b5-b26a-4dd0-bfca-fea91a42a296	2	35000	\N	0	\N	2026-08-13 09:25:18.378	completed
84a27aee-43f0-4ab5-85d0-87a72ac22050	7bd483f0-56e8-47db-a638-8f62ba831d4a	83ff8a95-3eb4-4b98-9978-63aa6d1b8323	4	55000	\N	0	\N	2026-08-13 09:25:18.388	completed
2ac03fc3-45bf-4a59-be5a-1bf94e8c70b1	7bd483f0-56e8-47db-a638-8f62ba831d4a	86643a05-ac82-4216-bdf8-87fcd64da8ec	4	48000	\N	0	\N	2026-08-13 09:25:18.388	completed
0e4aca49-fa8d-4a32-b612-519b03378b69	7bd483f0-56e8-47db-a638-8f62ba831d4a	ceed2a39-e4e2-486c-b228-a909a81d8487	4	20000	\N	0	\N	2026-08-13 09:25:18.388	completed
b91baa71-653c-48c3-a161-272b770e5c7e	7bd483f0-56e8-47db-a638-8f62ba831d4a	5ba65aef-1f61-4c68-b8c1-d847553c8aef	4	52000	\N	0	\N	2026-08-13 09:25:18.388	completed
f17c9492-ae87-446f-9fea-6a445af54143	7bd483f0-56e8-47db-a638-8f62ba831d4a	eaa3fac9-f60f-4db1-b33a-a4bd46e8ea71	4	45000	\N	0	\N	2026-08-13 09:25:18.388	completed
ddf51f64-9dad-49a9-b5e7-b477a26f0e33	7bd483f0-56e8-47db-a638-8f62ba831d4a	c24edbc4-7c7a-4228-9b3c-1b95c2be051c	2	48000	\N	0	\N	2026-08-13 09:25:18.388	completed
836117a3-24da-42f0-b46a-ab7c4efbb36f	d2c60024-a56e-46a7-a334-691e484ac256	27af0495-2d91-4cb0-af88-4752edf671dc	4	10000	\N	0	\N	2026-08-13 09:25:18.398	completed
1966118a-9543-41b3-8d05-26180fd4c535	d2c60024-a56e-46a7-a334-691e484ac256	7484d38a-54a0-49c7-baa2-a93fdce6d347	4	55000	\N	0	\N	2026-08-13 09:25:18.398	completed
872676a5-45ac-4335-ab08-fa84785e3e47	d2c60024-a56e-46a7-a334-691e484ac256	0b97d8bc-ffce-4904-8c46-87752b930f5e	1	45000	\N	0	\N	2026-08-13 09:25:18.398	completed
9643bc57-bd82-4b8b-8948-0f67d33461b3	d2c60024-a56e-46a7-a334-691e484ac256	d9f1fb87-e737-4210-a5bf-1bc0ba885771	2	42000	\N	0	\N	2026-08-13 09:25:18.398	completed
eb57a36f-ac11-4029-85c5-ed6e6084d44f	a5b4a3d7-8fd9-41b0-9afa-1f05c5c8ff45	c24edbc4-7c7a-4228-9b3c-1b95c2be051c	2	48000	\N	0	\N	2026-08-13 09:25:18.408	completed
f854b416-02ee-48d8-b95c-ad9d776339fc	a5b4a3d7-8fd9-41b0-9afa-1f05c5c8ff45	308d182c-58a9-47d9-a56a-bba4a473ae24	3	42000	\N	0	\N	2026-08-13 09:25:18.408	completed
0672f640-09ea-4da8-86ca-e66e83542c9f	a5b4a3d7-8fd9-41b0-9afa-1f05c5c8ff45	25a8343a-39c3-457e-9c1d-13689bd6469b	3	45000	\N	0	\N	2026-08-13 09:25:18.408	completed
5afc24ab-693e-4eb1-ad35-43e9e8dfcbcf	a5b4a3d7-8fd9-41b0-9afa-1f05c5c8ff45	cb1888fc-f827-4522-b136-a22bf86816c2	2	35000	\N	0	\N	2026-08-13 09:25:18.408	completed
a942ff0a-baff-4488-803c-39f3f38835cb	a5b4a3d7-8fd9-41b0-9afa-1f05c5c8ff45	d849f917-4afe-4a94-8866-03848a938c79	1	35000	\N	0	\N	2026-08-13 09:25:18.408	completed
f0fb2e21-c6e2-4a98-a9a1-ab12e867488f	a5b4a3d7-8fd9-41b0-9afa-1f05c5c8ff45	27af0495-2d91-4cb0-af88-4752edf671dc	4	10000	\N	0	\N	2026-08-13 09:25:18.408	completed
03f1f920-6009-4fad-aa64-80c1098f0c95	a5b4a3d7-8fd9-41b0-9afa-1f05c5c8ff45	6798927c-bcba-49fd-a7ad-78291c69ac33	3	52000	\N	0	\N	2026-08-13 09:25:18.408	completed
061d3a55-5bbd-45ba-8063-19701bf26daa	a5b4a3d7-8fd9-41b0-9afa-1f05c5c8ff45	27af0495-2d91-4cb0-af88-4752edf671dc	3	10000	\N	0	\N	2026-08-13 09:25:18.408	completed
161549ef-c987-42ca-9302-74a5a0429d5b	2b81c117-0a1d-427b-8a0a-7d5fcd639baf	96531f07-be37-454a-aa0c-4a0eaab99930	3	55000	\N	0	\N	2026-08-13 09:25:18.419	completed
021c5b6b-76c3-428d-aa37-ed256d731289	2b81c117-0a1d-427b-8a0a-7d5fcd639baf	83ceb824-bbdc-4b06-a867-037ded0aef0e	3	50000	\N	0	\N	2026-08-13 09:25:18.419	completed
1741c8a5-c907-4a50-8a10-fa9cd90034a2	2b81c117-0a1d-427b-8a0a-7d5fcd639baf	0b97d8bc-ffce-4904-8c46-87752b930f5e	3	45000	\N	0	\N	2026-08-13 09:25:18.419	completed
6ab298c3-a404-40be-8bce-83218b1df6ab	2b81c117-0a1d-427b-8a0a-7d5fcd639baf	d849f917-4afe-4a94-8866-03848a938c79	1	35000	\N	0	\N	2026-08-13 09:25:18.419	completed
51c4cee1-4cc6-4af7-8c00-702de331aba5	2b81c117-0a1d-427b-8a0a-7d5fcd639baf	d849f917-4afe-4a94-8866-03848a938c79	1	35000	\N	0	\N	2026-08-13 09:25:18.419	completed
162a7400-804b-4573-891a-bdad7d69e6d6	2b81c117-0a1d-427b-8a0a-7d5fcd639baf	10b0cc63-2c10-44ef-bf34-8d19b7fda2bb	4	55000	\N	0	\N	2026-08-13 09:25:18.419	completed
51c310dc-95ee-4164-89b4-4bc62b03da18	d6d4873a-528d-4806-944a-59aa910b0117	eb1dae05-cb14-4000-ba10-260f9cd79124	4	45000	\N	0	\N	2026-08-13 09:25:18.425	completed
911070bf-ffe9-4e48-9aae-007348f6b944	d6d4873a-528d-4806-944a-59aa910b0117	d52c0006-3bcd-48c7-ab83-082061dc6764	4	42000	\N	0	\N	2026-08-13 09:25:18.425	completed
fb5c18d9-33d2-4dc9-8a4d-bbb9bba7a27e	d6d4873a-528d-4806-944a-59aa910b0117	a02247ba-a10e-4387-967d-e69a05c8193a	4	32000	\N	0	\N	2026-08-13 09:25:18.425	completed
c054a3dc-9d34-4ffd-b20b-ebbb61661ca3	d6d4873a-528d-4806-944a-59aa910b0117	86643a05-ac82-4216-bdf8-87fcd64da8ec	2	48000	\N	0	\N	2026-08-13 09:25:18.425	completed
71864004-4220-416b-a9c4-6baf29b9ae10	d6d4873a-528d-4806-944a-59aa910b0117	884570a1-2822-4840-a08f-fc4a4a3b5fad	4	48000	\N	0	\N	2026-08-13 09:25:18.425	completed
a8421524-237e-4d45-8336-744af3e45833	d6d4873a-528d-4806-944a-59aa910b0117	3aac02bc-fcc6-4532-9a50-fa50790dd4cb	2	32000	\N	0	\N	2026-08-13 09:25:18.425	completed
bbc99db3-ca24-4666-b01f-31976589854e	cb3ee024-2498-43be-b9e1-4fcbd349c75c	c24edbc4-7c7a-4228-9b3c-1b95c2be051c	4	48000	\N	0	\N	2026-08-13 09:25:18.433	completed
ad2c0c5d-e08f-4033-998b-03b2589a0b61	cb3ee024-2498-43be-b9e1-4fcbd349c75c	c9ed90c7-689a-46ab-9fd2-84d017c264af	1	32000	\N	0	\N	2026-08-13 09:25:18.433	completed
c50d0646-2fe7-4f35-85a9-6e90e57493a6	cb3ee024-2498-43be-b9e1-4fcbd349c75c	ceed2a39-e4e2-486c-b228-a909a81d8487	2	20000	\N	0	\N	2026-08-13 09:25:18.433	completed
718dc495-1ba0-410b-9269-d9a1d213a72e	cb3ee024-2498-43be-b9e1-4fcbd349c75c	7804beb7-b72c-43db-a27a-82b955e5e31c	3	25000	\N	0	\N	2026-08-13 09:25:18.433	completed
32b8556c-9ccd-4a83-938a-bdf672bbf7bd	697416fa-e0fd-4b25-9503-b8e99c52f3b5	d849f917-4afe-4a94-8866-03848a938c79	1	35000	\N	0	\N	2026-08-13 09:25:18.442	completed
e6b2808f-6cee-4746-b66c-f7213d6ab55e	697416fa-e0fd-4b25-9503-b8e99c52f3b5	3aac02bc-fcc6-4532-9a50-fa50790dd4cb	1	32000	\N	0	\N	2026-08-13 09:25:18.442	completed
8ac64c87-045e-4cc1-8d4d-65b2c851177a	697416fa-e0fd-4b25-9503-b8e99c52f3b5	3aac02bc-fcc6-4532-9a50-fa50790dd4cb	4	32000	\N	0	\N	2026-08-13 09:25:18.442	completed
59d7ca21-db6a-4d71-aed5-5843b2227f52	697416fa-e0fd-4b25-9503-b8e99c52f3b5	e718f02b-b657-444d-89ae-fb910537eb6c	2	42000	\N	0	\N	2026-08-13 09:25:18.442	completed
00d9effd-e8c5-45d0-970d-75eb8d5a4ed0	697416fa-e0fd-4b25-9503-b8e99c52f3b5	e718f02b-b657-444d-89ae-fb910537eb6c	4	42000	\N	0	\N	2026-08-13 09:25:18.442	completed
00b8ce91-f09c-49c1-8869-e8f3f6273ee8	697416fa-e0fd-4b25-9503-b8e99c52f3b5	b429cd3c-c501-4b4a-b028-9ab5feedc41e	1	52000	\N	0	\N	2026-08-13 09:25:18.442	completed
659230d9-a418-4628-9a9c-f9db0eaa89db	d15b9dc9-737b-4b16-9c2d-344e15e55b1b	eb1dae05-cb14-4000-ba10-260f9cd79124	1	45000	\N	0	\N	2026-08-13 09:25:18.452	completed
6b5719a1-1d7f-44e6-86d1-adf198704e5d	d15b9dc9-737b-4b16-9c2d-344e15e55b1b	83ff8a95-3eb4-4b98-9978-63aa6d1b8323	2	55000	\N	0	\N	2026-08-13 09:25:18.452	completed
a07cd9df-4b1b-4750-9d1a-f627e03c0d68	d15b9dc9-737b-4b16-9c2d-344e15e55b1b	d52c0006-3bcd-48c7-ab83-082061dc6764	4	42000	\N	0	\N	2026-08-13 09:25:18.452	completed
0a5e5332-c3a0-4473-9df5-9661796a772c	d15b9dc9-737b-4b16-9c2d-344e15e55b1b	bcff5008-981c-428b-b652-31d8c1378d9f	3	28000	\N	0	\N	2026-08-13 09:25:18.452	completed
3a70caa5-a8fa-4add-b374-9eed24e47bab	6e8b7300-7710-4236-a9a7-59cb20a61752	3a6ff9b1-cc6c-45ae-9635-ab2b2d03c232	3	38000	\N	0	\N	2026-08-13 09:25:18.457	completed
34548867-d280-4480-bf35-5605d0f73df5	6e8b7300-7710-4236-a9a7-59cb20a61752	d52c0006-3bcd-48c7-ab83-082061dc6764	1	42000	\N	0	\N	2026-08-13 09:25:18.457	completed
2361694b-be40-4953-be1c-e9a2afeaa7ea	6e8b7300-7710-4236-a9a7-59cb20a61752	eaa3fac9-f60f-4db1-b33a-a4bd46e8ea71	2	45000	\N	0	\N	2026-08-13 09:25:18.457	completed
edb4687b-7479-42a4-95b4-b5094d9a4e29	6e8b7300-7710-4236-a9a7-59cb20a61752	2ce5c559-70e1-4bdd-8cf0-fcdf2a843273	1	46000	\N	0	\N	2026-08-13 09:25:18.457	completed
14c53992-21cc-425e-a3ea-641472187cc7	6e8b7300-7710-4236-a9a7-59cb20a61752	b429cd3c-c501-4b4a-b028-9ab5feedc41e	3	52000	\N	0	\N	2026-08-13 09:25:18.457	completed
973e82f2-b217-44e5-b4e2-a8195bc7a46a	6e8b7300-7710-4236-a9a7-59cb20a61752	803bcdee-17d3-41fc-a249-4e8d16b49575	3	48000	\N	0	\N	2026-08-13 09:25:18.457	completed
8b42dde1-0ad6-4db9-9298-4578a3e8e84b	6e8b7300-7710-4236-a9a7-59cb20a61752	228cd2ca-0ce1-44ff-92d8-05b7c9480e55	2	42000	\N	0	\N	2026-08-13 09:25:18.457	completed
e2d5f7e6-51d8-4a25-a8d1-f248832c2cd3	877dcaa6-6e0d-4520-ae74-c1145f230329	308d182c-58a9-47d9-a56a-bba4a473ae24	3	42000	\N	0	\N	2026-08-13 09:25:18.463	completed
a9249d52-980f-4e98-80e5-030b2dd7d536	877dcaa6-6e0d-4520-ae74-c1145f230329	35fbf376-436a-45ea-89a5-41560d3be32b	4	35000	\N	0	\N	2026-08-13 09:25:18.463	completed
92c4e757-1f70-4214-8a76-9c0446c2bd03	877dcaa6-6e0d-4520-ae74-c1145f230329	c0917f04-365b-4cdc-9b75-e49a7c492727	4	48000	\N	0	\N	2026-08-13 09:25:18.463	completed
4808d854-5376-4f41-915d-e20b56582ce0	877dcaa6-6e0d-4520-ae74-c1145f230329	e718f02b-b657-444d-89ae-fb910537eb6c	4	42000	\N	0	\N	2026-08-13 09:25:18.463	completed
abf93fec-048e-4d85-9c15-6f180e71c0c8	877dcaa6-6e0d-4520-ae74-c1145f230329	12b460b3-749d-4ab1-80de-d8f51d5188cc	2	40000	\N	0	\N	2026-08-13 09:25:18.463	completed
d468b02b-ce2f-4f80-a251-3e2acb6dbb5e	877dcaa6-6e0d-4520-ae74-c1145f230329	5bc34fc9-24c2-4108-af83-5992af2291d6	1	40000	\N	0	\N	2026-08-13 09:25:18.463	completed
0550b354-0288-48d1-9a39-1f1f187f9a22	ee8799b5-13bc-4c8b-8aa4-7c8c1baf32a3	cbc78f47-cb0d-4d34-80e1-841ec7b0e5de	2	48000	\N	0	\N	2026-08-13 09:25:18.472	completed
a4bbca89-3692-417c-87f2-5d72265f611b	ee8799b5-13bc-4c8b-8aa4-7c8c1baf32a3	228cd2ca-0ce1-44ff-92d8-05b7c9480e55	4	42000	\N	0	\N	2026-08-13 09:25:18.472	completed
27398d5f-f5e4-483e-9a05-82ee886dbe3c	ee8799b5-13bc-4c8b-8aa4-7c8c1baf32a3	625d086d-e1db-42f3-9cd5-84006fb429c1	3	48000	\N	0	\N	2026-08-13 09:25:18.472	completed
49b762cd-a2b3-4af8-9a37-b87eb2d9731d	ee8799b5-13bc-4c8b-8aa4-7c8c1baf32a3	96531f07-be37-454a-aa0c-4a0eaab99930	1	55000	\N	0	\N	2026-08-13 09:25:18.472	completed
4fe4619c-0945-4796-9274-f50e2ffd1d3a	ee8799b5-13bc-4c8b-8aa4-7c8c1baf32a3	10b0cc63-2c10-44ef-bf34-8d19b7fda2bb	2	55000	\N	0	\N	2026-08-13 09:25:18.472	completed
8328920e-e586-450a-a666-258f8df43faf	64f6c8c1-46c0-4475-b5a7-c8baf0adedb5	803bcdee-17d3-41fc-a249-4e8d16b49575	2	48000	\N	0	\N	2026-08-13 09:25:18.481	completed
d0b0cb0d-edd4-479f-ad25-734534e18c51	64f6c8c1-46c0-4475-b5a7-c8baf0adedb5	c9ed90c7-689a-46ab-9fd2-84d017c264af	2	32000	\N	0	\N	2026-08-13 09:25:18.481	completed
aaa69c67-f8e7-4dde-bf95-15f4811f5c5f	64f6c8c1-46c0-4475-b5a7-c8baf0adedb5	8f09b4ea-702e-4845-b2c0-59b3bf810d9d	4	38000	\N	0	\N	2026-08-13 09:25:18.481	completed
0d9622f5-ec01-4610-94f4-c8394de7cbcf	64f6c8c1-46c0-4475-b5a7-c8baf0adedb5	a02247ba-a10e-4387-967d-e69a05c8193a	1	32000	\N	0	\N	2026-08-13 09:25:18.481	completed
f876654e-ca6b-4d3c-a0f1-f4a3cf7f5a18	64f6c8c1-46c0-4475-b5a7-c8baf0adedb5	2ce5c559-70e1-4bdd-8cf0-fcdf2a843273	4	46000	\N	0	\N	2026-08-13 09:25:18.481	completed
8b5d89ff-620f-4d43-ae76-c4d24be8bc8e	64f6c8c1-46c0-4475-b5a7-c8baf0adedb5	5bc34fc9-24c2-4108-af83-5992af2291d6	1	40000	\N	0	\N	2026-08-13 09:25:18.481	completed
2501aa9a-ad41-4b83-b636-107c1fd92ea2	64f6c8c1-46c0-4475-b5a7-c8baf0adedb5	d9f1fb87-e737-4210-a5bf-1bc0ba885771	1	42000	\N	0	\N	2026-08-13 09:25:18.481	completed
9ad6dc6f-abdc-47a2-9b72-2926fe636126	64f6c8c1-46c0-4475-b5a7-c8baf0adedb5	efc81916-6661-422b-826f-c68049339458	1	28000	\N	0	\N	2026-08-13 09:25:18.481	completed
9a31ca41-209d-472c-b0fe-8cc5c15d355e	d58a4ac9-5041-4ff7-9d10-02ec1b7f87e0	81d6f3b5-b26a-4dd0-bfca-fea91a42a296	1	35000	\N	0	\N	2026-08-13 09:25:18.485	completed
5c377278-f397-4cf2-818b-b7a45cb689df	d58a4ac9-5041-4ff7-9d10-02ec1b7f87e0	b429cd3c-c501-4b4a-b028-9ab5feedc41e	2	52000	\N	0	\N	2026-08-13 09:25:18.485	completed
ba72ee03-0a62-4088-92e1-acb401431fb1	d58a4ac9-5041-4ff7-9d10-02ec1b7f87e0	25a8343a-39c3-457e-9c1d-13689bd6469b	1	45000	\N	0	\N	2026-08-13 09:25:18.485	completed
effe4e4e-bff7-4b38-b88e-846018f40524	bf1eb956-59f8-48d1-a936-11e75bb3c2a9	a02247ba-a10e-4387-967d-e69a05c8193a	4	32000	\N	0	\N	2026-08-13 09:25:18.494	completed
c0142126-8f01-438e-991f-937e6ed33fff	bf1eb956-59f8-48d1-a936-11e75bb3c2a9	7484d38a-54a0-49c7-baa2-a93fdce6d347	1	55000	\N	0	\N	2026-08-13 09:25:18.494	completed
32013258-c44a-4f20-a969-ede2a20a2615	bf1eb956-59f8-48d1-a936-11e75bb3c2a9	b429cd3c-c501-4b4a-b028-9ab5feedc41e	3	52000	\N	0	\N	2026-08-13 09:25:18.494	completed
6bd8bfdd-d6aa-44f6-acc7-7e3b8fa46e9c	bf1eb956-59f8-48d1-a936-11e75bb3c2a9	81d6f3b5-b26a-4dd0-bfca-fea91a42a296	1	35000	\N	0	\N	2026-08-13 09:25:18.494	completed
f660ae33-c2bc-4037-9291-f8f376c660c2	bf1eb956-59f8-48d1-a936-11e75bb3c2a9	d809adca-e256-41bc-b7b0-75df0d3f5dcb	1	35000	\N	0	\N	2026-08-13 09:25:18.494	completed
ac3252af-b01c-476a-92d3-ee74edab6617	bf1eb956-59f8-48d1-a936-11e75bb3c2a9	e9bd0cdf-4357-4313-8b02-7f8260f6992f	1	52000	\N	0	\N	2026-08-13 09:25:18.494	completed
2fc5522b-ee21-4ba9-ba18-b18746011ddb	bf1eb956-59f8-48d1-a936-11e75bb3c2a9	00acd18c-4b3a-4737-a36c-530f2c16d3b6	2	38000	\N	0	\N	2026-08-13 09:25:18.494	completed
b83c2214-6374-49dc-8bed-9878386e211c	ac516846-7920-4361-ae39-4680a3597a36	01d338fc-cbda-492d-b496-2a55e100d813	1	45000	\N	0	\N	2026-08-13 09:25:18.502	completed
b6cac9ce-12ae-44a1-8ad1-c4cf79a9c22e	ac516846-7920-4361-ae39-4680a3597a36	25a8343a-39c3-457e-9c1d-13689bd6469b	2	45000	\N	0	\N	2026-08-13 09:25:18.502	completed
5d55ef1c-32ab-40fe-8b83-75b6e177919a	ac516846-7920-4361-ae39-4680a3597a36	c0917f04-365b-4cdc-9b75-e49a7c492727	2	48000	\N	0	\N	2026-08-13 09:25:18.502	completed
34526e6a-49e1-49ba-9002-fd8fb8b9b138	ac516846-7920-4361-ae39-4680a3597a36	308d182c-58a9-47d9-a56a-bba4a473ae24	2	42000	\N	0	\N	2026-08-13 09:25:18.502	completed
93995981-67c7-4b4a-b820-f1aa5a3e1b9b	ac516846-7920-4361-ae39-4680a3597a36	ceed2a39-e4e2-486c-b228-a909a81d8487	2	20000	\N	0	\N	2026-08-13 09:25:18.502	completed
b16b15d3-f62a-455b-a0a6-9d514ddd8e71	ac516846-7920-4361-ae39-4680a3597a36	10b0cc63-2c10-44ef-bf34-8d19b7fda2bb	1	55000	\N	0	\N	2026-08-13 09:25:18.502	completed
2e24718c-3f2d-4176-ab11-d3eb3d4d5792	ac516846-7920-4361-ae39-4680a3597a36	e24a6cc9-1b6e-4ba7-94a5-514f6aa8fe31	1	45000	\N	0	\N	2026-08-13 09:25:18.502	completed
47234ad6-60e4-474c-889d-f3a91847c401	ac516846-7920-4361-ae39-4680a3597a36	81d6f3b5-b26a-4dd0-bfca-fea91a42a296	2	35000	\N	0	\N	2026-08-13 09:25:18.502	completed
32cea109-6614-4865-87b6-aee764e01e03	9c303af7-25c2-42c0-bd3e-fd5c79dc2aa8	6798927c-bcba-49fd-a7ad-78291c69ac33	3	52000	\N	0	\N	2026-08-13 09:25:18.511	completed
60ed5404-0d92-4d55-9740-d41d6bc6f336	9c303af7-25c2-42c0-bd3e-fd5c79dc2aa8	5bc34fc9-24c2-4108-af83-5992af2291d6	2	40000	\N	0	\N	2026-08-13 09:25:18.511	completed
16b77810-73d3-40b9-b9bb-af3c99fce98d	9c303af7-25c2-42c0-bd3e-fd5c79dc2aa8	884570a1-2822-4840-a08f-fc4a4a3b5fad	4	48000	\N	0	\N	2026-08-13 09:25:18.511	completed
bf58cc4c-ed37-481d-9913-a345cc5629c0	9c303af7-25c2-42c0-bd3e-fd5c79dc2aa8	b6a4c689-bce0-4d87-883b-b0de919eba27	1	58000	\N	0	\N	2026-08-13 09:25:18.511	completed
97e05454-99ed-46b7-aa1a-bfd9c54a2194	9c303af7-25c2-42c0-bd3e-fd5c79dc2aa8	efc81916-6661-422b-826f-c68049339458	2	28000	\N	0	\N	2026-08-13 09:25:18.511	completed
45405fd2-6a75-496d-ba2b-fa44f62ef6d8	9c303af7-25c2-42c0-bd3e-fd5c79dc2aa8	c0917f04-365b-4cdc-9b75-e49a7c492727	4	48000	\N	0	\N	2026-08-13 09:25:18.511	completed
f9a65023-64d6-4536-ab1a-f5f1aa047529	f5805508-7922-44a7-8bd1-8f23a73c3751	faead849-9d7b-4831-b60e-20222fee6c1f	2	48000	\N	0	\N	2026-08-13 09:25:18.519	completed
f13ac711-f4ed-46d0-8cc0-a803bcdbfdea	f5805508-7922-44a7-8bd1-8f23a73c3751	c24edbc4-7c7a-4228-9b3c-1b95c2be051c	4	48000	\N	0	\N	2026-08-13 09:25:18.519	completed
e60d77b4-df2b-48ec-8c01-4df319556b4f	f5805508-7922-44a7-8bd1-8f23a73c3751	12b460b3-749d-4ab1-80de-d8f51d5188cc	4	40000	\N	0	\N	2026-08-13 09:25:18.519	completed
49af27dc-da93-4b93-bc93-52cefe98dde2	f5805508-7922-44a7-8bd1-8f23a73c3751	7804beb7-b72c-43db-a27a-82b955e5e31c	2	25000	\N	0	\N	2026-08-13 09:25:18.519	completed
9f188bdb-356f-4407-8148-4fc6618834b1	f5805508-7922-44a7-8bd1-8f23a73c3751	bcff5008-981c-428b-b652-31d8c1378d9f	3	28000	\N	0	\N	2026-08-13 09:25:18.519	completed
aefe972e-573e-47c8-9189-cfd0f6e0251a	f5805508-7922-44a7-8bd1-8f23a73c3751	3aac02bc-fcc6-4532-9a50-fa50790dd4cb	2	32000	\N	0	\N	2026-08-13 09:25:18.519	completed
86e7ca7c-78ff-4976-9f32-8fca0d076059	45492f39-036d-4ef6-ab5d-7b995b0e5809	625d086d-e1db-42f3-9cd5-84006fb429c1	1	48000	\N	0	\N	2026-08-13 09:25:18.528	completed
d0bb738c-07e1-41e4-a8b9-e43f141c8aca	45492f39-036d-4ef6-ab5d-7b995b0e5809	308d182c-58a9-47d9-a56a-bba4a473ae24	3	42000	\N	0	\N	2026-08-13 09:25:18.528	completed
9b5e9407-ddca-4a67-acf9-a26111ec0937	45492f39-036d-4ef6-ab5d-7b995b0e5809	25a8343a-39c3-457e-9c1d-13689bd6469b	4	45000	\N	0	\N	2026-08-13 09:25:18.528	completed
095cad3f-7d87-4db2-b739-fbc5c5db50ef	45492f39-036d-4ef6-ab5d-7b995b0e5809	f731a039-1a1f-413d-826c-0955bb9eea80	4	55000	\N	0	\N	2026-08-13 09:25:18.528	completed
9cba8be2-5dc6-41db-9100-641f31315304	45492f39-036d-4ef6-ab5d-7b995b0e5809	7484d38a-54a0-49c7-baa2-a93fdce6d347	3	55000	\N	0	\N	2026-08-13 09:25:18.528	completed
296f5125-2a38-4313-92af-bb12ede205ef	45492f39-036d-4ef6-ab5d-7b995b0e5809	acb42a52-c717-441a-824b-8a18079ee46c	4	50000	\N	0	\N	2026-08-13 09:25:18.528	completed
5b83b334-dd31-4bb2-bcef-9bd2ee4aad1a	45492f39-036d-4ef6-ab5d-7b995b0e5809	83ff8a95-3eb4-4b98-9978-63aa6d1b8323	3	55000	\N	0	\N	2026-08-13 09:25:18.528	completed
e52ce9e8-cc48-4e2c-98be-3fcb91ab4b1b	45492f39-036d-4ef6-ab5d-7b995b0e5809	308d182c-58a9-47d9-a56a-bba4a473ae24	3	42000	\N	0	\N	2026-08-13 09:25:18.528	completed
62b0db3e-c084-40e4-adae-dc8a243555f1	94879bc1-d740-46a3-9d27-40bbebd7d880	5bc34fc9-24c2-4108-af83-5992af2291d6	3	40000	\N	0	\N	2026-08-13 09:25:18.533	completed
ce4e4c69-3b37-4ac6-9717-ddac98ff77e9	94879bc1-d740-46a3-9d27-40bbebd7d880	01d338fc-cbda-492d-b496-2a55e100d813	4	45000	\N	0	\N	2026-08-13 09:25:18.533	completed
0a4b360b-9b52-4b76-832d-0e7ddfe45afc	94879bc1-d740-46a3-9d27-40bbebd7d880	ce6673bb-c51b-4a4f-ab3d-810e44601734	4	28000	\N	0	\N	2026-08-13 09:25:18.533	completed
890b1936-aa05-44f8-ada5-6945b0abd417	1b909f0c-aef7-4f1e-a7ef-58cdf1601059	5ba65aef-1f61-4c68-b8c1-d847553c8aef	3	52000	\N	0	\N	2026-08-13 09:25:18.542	completed
7ff58e66-a4eb-40f5-8d50-f578374c6156	1b909f0c-aef7-4f1e-a7ef-58cdf1601059	d9f1fb87-e737-4210-a5bf-1bc0ba885771	2	42000	\N	0	\N	2026-08-13 09:25:18.542	completed
7eff3071-3a0b-426d-a342-94789ff814f3	1b909f0c-aef7-4f1e-a7ef-58cdf1601059	5bc34fc9-24c2-4108-af83-5992af2291d6	3	40000	\N	0	\N	2026-08-13 09:25:18.542	completed
525784e0-9344-471a-bab6-5ab56e3213c1	3e530aaf-44a8-4dd0-bee7-a8cebc00fa35	219c20d2-6247-4e8b-a734-53cfbd90ba88	3	52000	\N	0	\N	2026-08-13 09:25:18.548	completed
e33d548c-43b8-4238-98f2-9220917ff018	3e530aaf-44a8-4dd0-bee7-a8cebc00fa35	c9ed90c7-689a-46ab-9fd2-84d017c264af	4	32000	\N	0	\N	2026-08-13 09:25:18.548	completed
a04f553a-bc63-4e4d-9e09-16e2d91760c6	3e530aaf-44a8-4dd0-bee7-a8cebc00fa35	6798927c-bcba-49fd-a7ad-78291c69ac33	4	52000	\N	0	\N	2026-08-13 09:25:18.548	completed
171f738b-c852-48ac-af61-0a03fa05d71f	3e530aaf-44a8-4dd0-bee7-a8cebc00fa35	ceed2a39-e4e2-486c-b228-a909a81d8487	3	20000	\N	0	\N	2026-08-13 09:25:18.548	completed
e1896b21-4536-4016-b202-73f9b6b6a8d6	3e530aaf-44a8-4dd0-bee7-a8cebc00fa35	51c45fec-e0e7-489e-8339-02a536d2e857	4	45000	\N	0	\N	2026-08-13 09:25:18.548	completed
a3674c70-e03e-44ec-97e5-88247b1aea96	3e530aaf-44a8-4dd0-bee7-a8cebc00fa35	b6a4c689-bce0-4d87-883b-b0de919eba27	2	58000	\N	0	\N	2026-08-13 09:25:18.548	completed
5a900b29-b4f7-4619-8038-0499128c6fc0	3e530aaf-44a8-4dd0-bee7-a8cebc00fa35	25a8343a-39c3-457e-9c1d-13689bd6469b	4	45000	\N	0	\N	2026-08-13 09:25:18.548	completed
3cf396b2-4f1c-4fdd-8629-3707625a4b5a	bb5ab3e7-b425-49c1-867e-f2fdacf824b9	daa4bd17-296f-4da1-8d21-15534fa8e045	2	25000	\N	0	\N	2026-08-13 09:25:18.558	completed
1bb0dddb-86c9-4c12-9c44-b764c368165f	bb5ab3e7-b425-49c1-867e-f2fdacf824b9	cbc78f47-cb0d-4d34-80e1-841ec7b0e5de	1	48000	\N	0	\N	2026-08-13 09:25:18.558	completed
6c5bdab4-9159-4cf8-94d0-77803a8edd88	bb5ab3e7-b425-49c1-867e-f2fdacf824b9	ceed2a39-e4e2-486c-b228-a909a81d8487	4	20000	\N	0	\N	2026-08-13 09:25:18.558	completed
8446ca42-d2ce-4e2d-acb4-a1dc1121fba0	bb5ab3e7-b425-49c1-867e-f2fdacf824b9	c24edbc4-7c7a-4228-9b3c-1b95c2be051c	2	48000	\N	0	\N	2026-08-13 09:25:18.558	completed
52acae3b-2d20-4e5c-89fe-4905a8cf2961	bb5ab3e7-b425-49c1-867e-f2fdacf824b9	b429cd3c-c501-4b4a-b028-9ab5feedc41e	1	52000	\N	0	\N	2026-08-13 09:25:18.558	completed
fc227c2e-17f7-4865-94c5-4356d377a0fc	bb5ab3e7-b425-49c1-867e-f2fdacf824b9	ceed2a39-e4e2-486c-b228-a909a81d8487	1	20000	\N	0	\N	2026-08-13 09:25:18.558	completed
b4af19df-9645-4feb-9e0d-1f97ef79d473	f7232f70-ea4b-4b12-8496-c7868bacb6c7	c0917f04-365b-4cdc-9b75-e49a7c492727	3	48000	\N	0	\N	2026-08-13 09:25:18.567	completed
f16233ef-6b85-4b74-a61a-92afe9950bb9	f7232f70-ea4b-4b12-8496-c7868bacb6c7	faead849-9d7b-4831-b60e-20222fee6c1f	2	48000	\N	0	\N	2026-08-13 09:25:18.567	completed
8ab7b215-748b-4394-a83c-f8874bd88bf8	f7232f70-ea4b-4b12-8496-c7868bacb6c7	219c20d2-6247-4e8b-a734-53cfbd90ba88	3	52000	\N	0	\N	2026-08-13 09:25:18.567	completed
8a841d8e-5cfa-4a35-9f14-050805493745	f7232f70-ea4b-4b12-8496-c7868bacb6c7	27af0495-2d91-4cb0-af88-4752edf671dc	3	10000	\N	0	\N	2026-08-13 09:25:18.567	completed
b221fb38-3a51-4bc3-96e3-18ced9b60177	ecc3579c-1cf5-4638-8f39-0ce39be1e633	96531f07-be37-454a-aa0c-4a0eaab99930	2	55000	\N	0	\N	2026-08-13 09:25:18.576	completed
ec1f1ef8-a804-4e2e-ac5c-ffe13ea7c908	ecc3579c-1cf5-4638-8f39-0ce39be1e633	5ba65aef-1f61-4c68-b8c1-d847553c8aef	1	52000	\N	0	\N	2026-08-13 09:25:18.576	completed
5ec10980-e9ce-4876-8176-c8d965045daf	ecc3579c-1cf5-4638-8f39-0ce39be1e633	83ceb824-bbdc-4b06-a867-037ded0aef0e	4	50000	\N	0	\N	2026-08-13 09:25:18.576	completed
ef7fb766-4fb0-410e-9f23-29612535c814	b2b9847a-a98d-450f-85d9-2ca6a1f15b41	803bcdee-17d3-41fc-a249-4e8d16b49575	3	48000	\N	0	\N	2026-08-13 09:25:18.584	completed
f48cadc9-e72d-4aee-9749-6cb014170bd8	b2b9847a-a98d-450f-85d9-2ca6a1f15b41	eb1dae05-cb14-4000-ba10-260f9cd79124	3	45000	\N	0	\N	2026-08-13 09:25:18.584	completed
47be93d7-19f2-480b-b373-ced7f7e55ece	b2b9847a-a98d-450f-85d9-2ca6a1f15b41	cb1888fc-f827-4522-b136-a22bf86816c2	1	35000	\N	0	\N	2026-08-13 09:25:18.584	completed
9f01f1a2-c4f2-4d4a-bee1-1253be704865	b2b9847a-a98d-450f-85d9-2ca6a1f15b41	acb42a52-c717-441a-824b-8a18079ee46c	4	50000	\N	0	\N	2026-08-13 09:25:18.584	completed
403bb356-1f66-4c95-836d-2a5caa0e61c6	b2b9847a-a98d-450f-85d9-2ca6a1f15b41	f731a039-1a1f-413d-826c-0955bb9eea80	3	55000	\N	0	\N	2026-08-13 09:25:18.584	completed
e0ab07fb-4628-43d9-9dce-8da52ccbe74e	b2b9847a-a98d-450f-85d9-2ca6a1f15b41	219c20d2-6247-4e8b-a734-53cfbd90ba88	2	52000	\N	0	\N	2026-08-13 09:25:18.584	completed
83315740-052b-4b34-b985-13ca6fe70a7a	c118a3bb-9d65-471d-a1a1-ec58e967677a	b6a4c689-bce0-4d87-883b-b0de919eba27	1	58000	\N	0	\N	2026-08-13 09:25:18.589	completed
f9c8820e-ac68-40db-af8c-15d78ab1dbf6	c118a3bb-9d65-471d-a1a1-ec58e967677a	d809adca-e256-41bc-b7b0-75df0d3f5dcb	2	35000	\N	0	\N	2026-08-13 09:25:18.589	completed
39d58376-ebdf-4cd8-ba58-f9ce301928ca	c118a3bb-9d65-471d-a1a1-ec58e967677a	daa4bd17-296f-4da1-8d21-15534fa8e045	1	25000	\N	0	\N	2026-08-13 09:25:18.589	completed
a988a99d-4777-400d-98b6-fbdb9c64f837	02035282-3d04-4658-a561-a8712c7aeca5	30ef5deb-6b46-47d1-a98c-8bc060d62b44	3	45000	\N	0	\N	2026-08-13 09:25:18.597	completed
f0934c46-ddaa-4533-a633-dc4db3d404ae	02035282-3d04-4658-a561-a8712c7aeca5	96531f07-be37-454a-aa0c-4a0eaab99930	3	55000	\N	0	\N	2026-08-13 09:25:18.597	completed
cb13bad4-d02e-4f76-a06a-2788cab62a79	02035282-3d04-4658-a561-a8712c7aeca5	7804beb7-b72c-43db-a27a-82b955e5e31c	1	25000	\N	0	\N	2026-08-13 09:25:18.597	completed
93f58851-6063-4a8e-b54f-203e6aba8ab5	02035282-3d04-4658-a561-a8712c7aeca5	625d086d-e1db-42f3-9cd5-84006fb429c1	3	48000	\N	0	\N	2026-08-13 09:25:18.597	completed
e1973eb8-d8fd-4646-9f79-98072ad552f9	d012e4e8-dd9c-45da-9244-7e119974e760	25a8343a-39c3-457e-9c1d-13689bd6469b	2	45000	\N	0	\N	2026-08-13 09:25:18.605	completed
ea0c9f33-f39e-4e7d-a28e-6244d269e39f	d012e4e8-dd9c-45da-9244-7e119974e760	625d086d-e1db-42f3-9cd5-84006fb429c1	2	48000	\N	0	\N	2026-08-13 09:25:18.605	completed
99b5f8a8-ea21-42ff-adfd-b8c1f41cbb10	d012e4e8-dd9c-45da-9244-7e119974e760	cb1888fc-f827-4522-b136-a22bf86816c2	1	35000	\N	0	\N	2026-08-13 09:25:18.605	completed
4d4defd6-f223-4e26-9b79-769670c5d9be	9036c0a0-71e2-468d-b586-823a2480b020	228cd2ca-0ce1-44ff-92d8-05b7c9480e55	3	42000	\N	0	\N	2026-08-13 09:25:18.614	completed
ce3cc8d8-55e0-4ea6-b121-78d8355ec44e	9036c0a0-71e2-468d-b586-823a2480b020	7484d38a-54a0-49c7-baa2-a93fdce6d347	4	55000	\N	0	\N	2026-08-13 09:25:18.614	completed
3802df4b-dca3-421d-aa53-ac632446fec0	9036c0a0-71e2-468d-b586-823a2480b020	e9bd0cdf-4357-4313-8b02-7f8260f6992f	1	52000	\N	0	\N	2026-08-13 09:25:18.614	completed
bbd49d26-4b91-4f57-93c5-373a5129c663	2554ac55-822a-49eb-8b4c-3dac547eab4b	ceed2a39-e4e2-486c-b228-a909a81d8487	3	20000	\N	0	\N	2026-08-13 09:25:18.622	completed
308a0c76-9c0d-4f4e-96b6-d002e3296f2c	2554ac55-822a-49eb-8b4c-3dac547eab4b	f731a039-1a1f-413d-826c-0955bb9eea80	2	55000	\N	0	\N	2026-08-13 09:25:18.622	completed
071d8c74-5a72-478f-9bb2-75d64668e23e	2554ac55-822a-49eb-8b4c-3dac547eab4b	81d6f3b5-b26a-4dd0-bfca-fea91a42a296	2	35000	\N	0	\N	2026-08-13 09:25:18.622	completed
1649ab85-4923-47f2-bdac-5e5c532c2841	2554ac55-822a-49eb-8b4c-3dac547eab4b	27af0495-2d91-4cb0-af88-4752edf671dc	4	10000	\N	0	\N	2026-08-13 09:25:18.622	completed
54115b10-3588-48b5-9e84-4252bac92dd6	14763051-de56-46ef-8e35-8c7ed97edf58	ceed2a39-e4e2-486c-b228-a909a81d8487	4	20000	\N	0	\N	2026-08-13 09:25:18.627	completed
71385173-5931-4bc8-8182-c1b4eb474c3e	14763051-de56-46ef-8e35-8c7ed97edf58	01d338fc-cbda-492d-b496-2a55e100d813	2	45000	\N	0	\N	2026-08-13 09:25:18.627	completed
91134832-8151-4221-b017-c380d1279f8d	14763051-de56-46ef-8e35-8c7ed97edf58	7484d38a-54a0-49c7-baa2-a93fdce6d347	4	55000	\N	0	\N	2026-08-13 09:25:18.627	completed
d7969397-2f4b-4ca0-9c3e-f69684c0208e	14763051-de56-46ef-8e35-8c7ed97edf58	30ef5deb-6b46-47d1-a98c-8bc060d62b44	1	45000	\N	0	\N	2026-08-13 09:25:18.627	completed
c177c6a4-cdfa-452a-9fe5-4809ee0cfddf	14763051-de56-46ef-8e35-8c7ed97edf58	27af0495-2d91-4cb0-af88-4752edf671dc	2	10000	\N	0	\N	2026-08-13 09:25:18.627	completed
ccfd0aed-e5c3-4d5b-82a1-be8fc65824a6	14763051-de56-46ef-8e35-8c7ed97edf58	faead849-9d7b-4831-b60e-20222fee6c1f	1	48000	\N	0	\N	2026-08-13 09:25:18.627	completed
624c3050-12e0-402b-82c1-38bb2493b519	14763051-de56-46ef-8e35-8c7ed97edf58	f731a039-1a1f-413d-826c-0955bb9eea80	1	55000	\N	0	\N	2026-08-13 09:25:18.627	completed
d83e0f10-9bb8-4e4e-bdda-a41e73e03f16	7a0e03ab-5b11-4eaf-abf2-ce82fc4c50c0	eaa3fac9-f60f-4db1-b33a-a4bd46e8ea71	3	45000	\N	0	\N	2026-08-13 09:25:18.631	completed
d7be2659-fa36-4662-b5b1-14cb1b4115e3	7a0e03ab-5b11-4eaf-abf2-ce82fc4c50c0	d21a6806-fffa-4462-b33f-2c91a1c6b013	4	50000	\N	0	\N	2026-08-13 09:25:18.631	completed
8976304a-55c5-46a2-ab5a-e82033c213a5	7a0e03ab-5b11-4eaf-abf2-ce82fc4c50c0	d849f917-4afe-4a94-8866-03848a938c79	3	35000	\N	0	\N	2026-08-13 09:25:18.631	completed
35ed5a45-9e49-4df3-af78-9cf3cf80f735	0a6331d7-1dfd-4d06-8cdc-72e41bddfcef	25a8343a-39c3-457e-9c1d-13689bd6469b	4	45000	\N	0	\N	2026-08-13 09:25:18.64	completed
6edb7d02-7cb2-418b-bb51-b83bcdf3077b	0a6331d7-1dfd-4d06-8cdc-72e41bddfcef	308d182c-58a9-47d9-a56a-bba4a473ae24	4	42000	\N	0	\N	2026-08-13 09:25:18.64	completed
177bdf16-cc98-400f-aca9-e71dd94af03c	0a6331d7-1dfd-4d06-8cdc-72e41bddfcef	27af0495-2d91-4cb0-af88-4752edf671dc	4	10000	\N	0	\N	2026-08-13 09:25:18.64	completed
4cb1eaf5-0c0c-4b9d-a4be-d82e3a9db75f	0a6331d7-1dfd-4d06-8cdc-72e41bddfcef	3aac02bc-fcc6-4532-9a50-fa50790dd4cb	2	32000	\N	0	\N	2026-08-13 09:25:18.64	completed
e25d02d5-992d-4d29-bb00-2634cada3668	0a6331d7-1dfd-4d06-8cdc-72e41bddfcef	96531f07-be37-454a-aa0c-4a0eaab99930	2	55000	\N	0	\N	2026-08-13 09:25:18.64	completed
568b106f-b4de-439e-b4ec-2c5f37934a05	0a6331d7-1dfd-4d06-8cdc-72e41bddfcef	228cd2ca-0ce1-44ff-92d8-05b7c9480e55	2	42000	\N	0	\N	2026-08-13 09:25:18.64	completed
6e5bcede-45a0-4635-ac73-ab26ec30bf90	0a6331d7-1dfd-4d06-8cdc-72e41bddfcef	83ceb824-bbdc-4b06-a867-037ded0aef0e	4	50000	\N	0	\N	2026-08-13 09:25:18.64	completed
128be41e-6230-4092-b26e-8b0d933913ec	e06e44ee-31c2-40c2-ba9d-e805c80a9d71	d21a6806-fffa-4462-b33f-2c91a1c6b013	3	50000	\N	0	\N	2026-08-13 09:25:18.649	completed
2fdb49ac-b1de-4842-9c7c-218706ec9f9e	e06e44ee-31c2-40c2-ba9d-e805c80a9d71	10b0cc63-2c10-44ef-bf34-8d19b7fda2bb	2	55000	\N	0	\N	2026-08-13 09:25:18.649	completed
bfe01902-9110-40dc-9e38-55315d2bb3e5	e06e44ee-31c2-40c2-ba9d-e805c80a9d71	7804beb7-b72c-43db-a27a-82b955e5e31c	4	25000	\N	0	\N	2026-08-13 09:25:18.649	completed
6e079997-f9ad-4658-9791-96d7a6c10f8c	e06e44ee-31c2-40c2-ba9d-e805c80a9d71	803bcdee-17d3-41fc-a249-4e8d16b49575	2	48000	\N	0	\N	2026-08-13 09:25:18.649	completed
9729332c-34de-4ded-97e5-5ee85c04b7ac	e06e44ee-31c2-40c2-ba9d-e805c80a9d71	daa4bd17-296f-4da1-8d21-15534fa8e045	1	25000	\N	0	\N	2026-08-13 09:25:18.649	completed
23933214-1d64-4de5-811a-823ca3f6c94a	e06e44ee-31c2-40c2-ba9d-e805c80a9d71	2ce5c559-70e1-4bdd-8cf0-fcdf2a843273	2	46000	\N	0	\N	2026-08-13 09:25:18.649	completed
8ee90c8f-1724-40f7-a830-8b03a84ba4f6	e06e44ee-31c2-40c2-ba9d-e805c80a9d71	d809adca-e256-41bc-b7b0-75df0d3f5dcb	3	35000	\N	0	\N	2026-08-13 09:25:18.649	completed
fc54f3a1-72bc-4d57-8cf3-07176341a54b	e06e44ee-31c2-40c2-ba9d-e805c80a9d71	81d6f3b5-b26a-4dd0-bfca-fea91a42a296	3	35000	\N	0	\N	2026-08-13 09:25:18.649	completed
decb5119-c33b-4513-abe5-28ce9b9addec	db789f1d-332e-4573-b00f-ca49f7015c98	00acd18c-4b3a-4737-a36c-530f2c16d3b6	3	38000	\N	0	\N	2026-08-13 09:25:18.658	completed
0cc78c49-7f42-459e-97f1-6c0f2d31c0cd	db789f1d-332e-4573-b00f-ca49f7015c98	faead849-9d7b-4831-b60e-20222fee6c1f	3	48000	\N	0	\N	2026-08-13 09:25:18.658	completed
67386793-6982-4bed-b88a-2f64aa83cb2a	db789f1d-332e-4573-b00f-ca49f7015c98	3a6ff9b1-cc6c-45ae-9635-ab2b2d03c232	4	38000	\N	0	\N	2026-08-13 09:25:18.658	completed
d0771443-ce6f-445e-88e0-e5b2176a75a8	db789f1d-332e-4573-b00f-ca49f7015c98	6798927c-bcba-49fd-a7ad-78291c69ac33	2	52000	\N	0	\N	2026-08-13 09:25:18.658	completed
17625925-3f24-4b07-8e8b-8f63d7faeb6c	db789f1d-332e-4573-b00f-ca49f7015c98	884570a1-2822-4840-a08f-fc4a4a3b5fad	3	48000	\N	0	\N	2026-08-13 09:25:18.658	completed
1c6de6fa-09dd-43c5-bf2c-b1c06ed58817	8fb648e7-7318-4817-b74c-5396fde26899	f731a039-1a1f-413d-826c-0955bb9eea80	2	55000	\N	0	\N	2026-08-13 09:25:18.666	completed
12779224-27de-4c1e-a255-9f872efd7707	8fb648e7-7318-4817-b74c-5396fde26899	0b97d8bc-ffce-4904-8c46-87752b930f5e	1	45000	\N	0	\N	2026-08-13 09:25:18.666	completed
b62e607e-566a-4ee0-8675-312ef19bc4d0	8fb648e7-7318-4817-b74c-5396fde26899	625d086d-e1db-42f3-9cd5-84006fb429c1	4	48000	\N	0	\N	2026-08-13 09:25:18.666	completed
2743c230-2c24-4d26-8136-6f4afa2fc463	c1f92091-3395-42ad-bc7c-3277435831d1	2ce5c559-70e1-4bdd-8cf0-fcdf2a843273	3	46000	\N	0	\N	2026-08-13 09:25:18.67	completed
5b972d26-5571-432e-b7ee-36f23d22f6f3	c1f92091-3395-42ad-bc7c-3277435831d1	884570a1-2822-4840-a08f-fc4a4a3b5fad	4	48000	\N	0	\N	2026-08-13 09:25:18.67	completed
fb583698-a650-4073-9c32-ec188cb5ab23	c1f92091-3395-42ad-bc7c-3277435831d1	35fbf376-436a-45ea-89a5-41560d3be32b	1	35000	\N	0	\N	2026-08-13 09:25:18.67	completed
b590aebf-8e6a-4801-a174-15da476f65d9	c1f92091-3395-42ad-bc7c-3277435831d1	ceed2a39-e4e2-486c-b228-a909a81d8487	2	20000	\N	0	\N	2026-08-13 09:25:18.67	completed
168907b1-4fd6-4cf6-a320-2be5e4f984bd	c1f92091-3395-42ad-bc7c-3277435831d1	86643a05-ac82-4216-bdf8-87fcd64da8ec	2	48000	\N	0	\N	2026-08-13 09:25:18.67	completed
00edf79e-cfa0-4f1b-bd8a-6f4e581d6546	c1f92091-3395-42ad-bc7c-3277435831d1	01d338fc-cbda-492d-b496-2a55e100d813	3	45000	\N	0	\N	2026-08-13 09:25:18.67	completed
3b4a5f79-335e-47ce-9c8f-61879c8ff1e5	c1f92091-3395-42ad-bc7c-3277435831d1	b429cd3c-c501-4b4a-b028-9ab5feedc41e	3	52000	\N	0	\N	2026-08-13 09:25:18.67	completed
35b7708f-560b-4eca-a0a8-229183108a46	a0d9cfe8-49b8-43dc-b2c1-bec359a49bc5	daa4bd17-296f-4da1-8d21-15534fa8e045	4	25000	\N	0	\N	2026-08-13 09:25:18.675	completed
f5a109f8-22b6-47a0-beb5-354c686e49ae	a0d9cfe8-49b8-43dc-b2c1-bec359a49bc5	ce6673bb-c51b-4a4f-ab3d-810e44601734	3	28000	\N	0	\N	2026-08-13 09:25:18.675	completed
b0cae400-7356-4031-9abf-fc628280ad05	a0d9cfe8-49b8-43dc-b2c1-bec359a49bc5	83ceb824-bbdc-4b06-a867-037ded0aef0e	3	50000	\N	0	\N	2026-08-13 09:25:18.675	completed
5ba379b1-d4c4-4f78-b8ea-ba3ed0ad4fa9	a0d9cfe8-49b8-43dc-b2c1-bec359a49bc5	d809adca-e256-41bc-b7b0-75df0d3f5dcb	4	35000	\N	0	\N	2026-08-13 09:25:18.675	completed
7627762d-2527-4dc1-bb10-330874a0e5df	a0d9cfe8-49b8-43dc-b2c1-bec359a49bc5	625d086d-e1db-42f3-9cd5-84006fb429c1	2	48000	\N	0	\N	2026-08-13 09:25:18.675	completed
cd29e959-d0c6-49c0-9c7d-a9dd56c2a960	a0d9cfe8-49b8-43dc-b2c1-bec359a49bc5	5ba65aef-1f61-4c68-b8c1-d847553c8aef	2	52000	\N	0	\N	2026-08-13 09:25:18.675	completed
3fadafce-16aa-4574-a944-738c84991eb4	a0d9cfe8-49b8-43dc-b2c1-bec359a49bc5	cb1888fc-f827-4522-b136-a22bf86816c2	1	35000	\N	0	\N	2026-08-13 09:25:18.675	completed
1ff9e6b2-95f9-4236-84fe-33e00837ba1d	84ddce28-cfb5-40e0-925b-82c00ae1d845	803bcdee-17d3-41fc-a249-4e8d16b49575	4	48000	\N	0	\N	2026-08-13 09:25:18.684	completed
f70cd14a-0baf-45ab-b40a-303a4a95b24d	84ddce28-cfb5-40e0-925b-82c00ae1d845	10b0cc63-2c10-44ef-bf34-8d19b7fda2bb	2	55000	\N	0	\N	2026-08-13 09:25:18.684	completed
9fbecc37-af1f-4d81-a596-56a4f9c487c0	84ddce28-cfb5-40e0-925b-82c00ae1d845	803bcdee-17d3-41fc-a249-4e8d16b49575	4	48000	\N	0	\N	2026-08-13 09:25:18.684	completed
0bd0f8bd-49eb-4cdf-a1cf-ad701a2b8332	0cb6ba79-3a90-4a2f-8c8f-dcf44a061fdc	daa4bd17-296f-4da1-8d21-15534fa8e045	3	25000	\N	0	\N	2026-08-13 09:25:18.692	completed
5477acff-7b6a-4ce7-9827-73059c13f840	0cb6ba79-3a90-4a2f-8c8f-dcf44a061fdc	faead849-9d7b-4831-b60e-20222fee6c1f	1	48000	\N	0	\N	2026-08-13 09:25:18.692	completed
415d1c2d-428e-48c6-be34-ad655596c6ad	0cb6ba79-3a90-4a2f-8c8f-dcf44a061fdc	30ef5deb-6b46-47d1-a98c-8bc060d62b44	4	45000	\N	0	\N	2026-08-13 09:25:18.692	completed
265c72e4-d930-4798-b8c4-fa9287c32d79	0cb6ba79-3a90-4a2f-8c8f-dcf44a061fdc	219c20d2-6247-4e8b-a734-53cfbd90ba88	4	52000	\N	0	\N	2026-08-13 09:25:18.692	completed
e7bfe438-8266-48e3-a478-baecd2150aeb	0cb6ba79-3a90-4a2f-8c8f-dcf44a061fdc	96531f07-be37-454a-aa0c-4a0eaab99930	3	55000	\N	0	\N	2026-08-13 09:25:18.692	completed
6d36db31-0833-4888-bec8-d6bc09cfefaf	e82975b2-67be-4687-ab1b-fa52f21d02c8	bcff5008-981c-428b-b652-31d8c1378d9f	2	28000	\N	0	\N	2026-08-13 09:25:18.696	completed
db1756fa-1162-457c-9f9b-2a52f588bcfb	e82975b2-67be-4687-ab1b-fa52f21d02c8	30ef5deb-6b46-47d1-a98c-8bc060d62b44	3	45000	\N	0	\N	2026-08-13 09:25:18.696	completed
9fd85005-c585-4db0-b31f-b0b2b7e5087d	e82975b2-67be-4687-ab1b-fa52f21d02c8	25a8343a-39c3-457e-9c1d-13689bd6469b	4	45000	\N	0	\N	2026-08-13 09:25:18.696	completed
d245a5d8-5986-4425-8df2-6733b553464c	e82975b2-67be-4687-ab1b-fa52f21d02c8	acb42a52-c717-441a-824b-8a18079ee46c	2	50000	\N	0	\N	2026-08-13 09:25:18.696	completed
b7e86877-65d1-4ef1-99c5-df4916d02633	4df175f2-546e-4863-92d8-72d0e7535e6a	e24a6cc9-1b6e-4ba7-94a5-514f6aa8fe31	1	45000	\N	0	\N	2026-08-13 09:25:18.7	completed
765b4d54-9ec7-443c-b9ab-b73e8d25778f	4df175f2-546e-4863-92d8-72d0e7535e6a	10b0cc63-2c10-44ef-bf34-8d19b7fda2bb	1	55000	\N	0	\N	2026-08-13 09:25:18.7	completed
8596baad-4c20-4024-b15f-aaef7f814dc2	4df175f2-546e-4863-92d8-72d0e7535e6a	308d182c-58a9-47d9-a56a-bba4a473ae24	4	42000	\N	0	\N	2026-08-13 09:25:18.7	completed
1b526442-ec76-4250-a438-d3cba3d8f91e	c0e8d6a9-dc0f-4951-b4a8-53f80a5e5fbb	b1ee3afc-db38-468c-a4bf-38b51b772024	3	20000	\N	0	\N	2026-08-13 09:25:18.708	completed
74f0735e-e70a-40f3-b972-a8afbe4981d4	c0e8d6a9-dc0f-4951-b4a8-53f80a5e5fbb	acb42a52-c717-441a-824b-8a18079ee46c	3	50000	\N	0	\N	2026-08-13 09:25:18.708	completed
bfffb54c-e88a-41a8-a3a6-59e2bd04e3b4	c0e8d6a9-dc0f-4951-b4a8-53f80a5e5fbb	01d338fc-cbda-492d-b496-2a55e100d813	4	45000	\N	0	\N	2026-08-13 09:25:18.708	completed
181fdc50-0697-4ee4-b98d-e0b989da070c	c0e8d6a9-dc0f-4951-b4a8-53f80a5e5fbb	bcff5008-981c-428b-b652-31d8c1378d9f	3	28000	\N	0	\N	2026-08-13 09:25:18.708	completed
268ca8e8-a700-410d-8d0c-666aa33cbc89	c0e8d6a9-dc0f-4951-b4a8-53f80a5e5fbb	6798927c-bcba-49fd-a7ad-78291c69ac33	4	52000	\N	0	\N	2026-08-13 09:25:18.708	completed
75d8f99a-b427-43ac-a19a-5f3299369b31	c0e8d6a9-dc0f-4951-b4a8-53f80a5e5fbb	a02247ba-a10e-4387-967d-e69a05c8193a	4	32000	\N	0	\N	2026-08-13 09:25:18.708	completed
aa561137-21b0-4fe4-9666-f2a45c984aea	c0e8d6a9-dc0f-4951-b4a8-53f80a5e5fbb	cbc78f47-cb0d-4d34-80e1-841ec7b0e5de	4	48000	\N	0	\N	2026-08-13 09:25:18.708	completed
1fe734e4-8383-419f-bba0-f86fa05b370a	c0e8d6a9-dc0f-4951-b4a8-53f80a5e5fbb	10b0cc63-2c10-44ef-bf34-8d19b7fda2bb	3	55000	\N	0	\N	2026-08-13 09:25:18.708	completed
9c5fcca2-679f-465a-9b9a-1daf472bd460	6353d038-ff05-4cbe-8cc0-775e745fd65f	faead849-9d7b-4831-b60e-20222fee6c1f	3	48000	\N	0	\N	2026-08-13 09:25:18.713	completed
f473a6f9-8b92-4e53-b525-86ece315f897	6353d038-ff05-4cbe-8cc0-775e745fd65f	e24a6cc9-1b6e-4ba7-94a5-514f6aa8fe31	4	45000	\N	0	\N	2026-08-13 09:25:18.713	completed
d43d087a-92a5-449b-b5ef-35312a8c3099	6353d038-ff05-4cbe-8cc0-775e745fd65f	7484d38a-54a0-49c7-baa2-a93fdce6d347	4	55000	\N	0	\N	2026-08-13 09:25:18.713	completed
398f72af-db50-4441-b9a5-b83c437c08ff	6353d038-ff05-4cbe-8cc0-775e745fd65f	e24a6cc9-1b6e-4ba7-94a5-514f6aa8fe31	3	45000	\N	0	\N	2026-08-13 09:25:18.713	completed
fb56ae84-fcc8-429a-8b04-c329037986f8	6353d038-ff05-4cbe-8cc0-775e745fd65f	3a6ff9b1-cc6c-45ae-9635-ab2b2d03c232	3	38000	\N	0	\N	2026-08-13 09:25:18.713	completed
fe17a7e9-251c-47a1-8fd9-de5df451e37b	6353d038-ff05-4cbe-8cc0-775e745fd65f	b1ee3afc-db38-468c-a4bf-38b51b772024	2	20000	\N	0	\N	2026-08-13 09:25:18.713	completed
dfc6a127-cd4c-4cfa-b2f6-91cf2fd5de2b	6353d038-ff05-4cbe-8cc0-775e745fd65f	83ceb824-bbdc-4b06-a867-037ded0aef0e	1	50000	\N	0	\N	2026-08-13 09:25:18.713	completed
e346b67e-e025-4853-b754-3645cfd44ba4	423ffa5d-5a9f-46dc-aa0e-89a003ed3cda	2ce5c559-70e1-4bdd-8cf0-fcdf2a843273	3	46000	\N	0	\N	2026-08-13 09:25:18.722	completed
5a3c8a1f-cb9f-40b1-8adf-4bc3352352b8	423ffa5d-5a9f-46dc-aa0e-89a003ed3cda	cb1888fc-f827-4522-b136-a22bf86816c2	1	35000	\N	0	\N	2026-08-13 09:25:18.722	completed
bc92cdf9-f1c5-4241-8e39-0138f8523253	423ffa5d-5a9f-46dc-aa0e-89a003ed3cda	01d338fc-cbda-492d-b496-2a55e100d813	2	45000	\N	0	\N	2026-08-13 09:25:18.722	completed
91293620-c782-4a02-b7b1-7a52f567a2d5	423ffa5d-5a9f-46dc-aa0e-89a003ed3cda	d809adca-e256-41bc-b7b0-75df0d3f5dcb	3	35000	\N	0	\N	2026-08-13 09:25:18.722	completed
4f55dd0d-d698-4a42-97aa-1d2548003b7a	423ffa5d-5a9f-46dc-aa0e-89a003ed3cda	219c20d2-6247-4e8b-a734-53cfbd90ba88	2	52000	\N	0	\N	2026-08-13 09:25:18.722	completed
595b963c-78b9-4a93-9c26-f6bc99651b8d	423ffa5d-5a9f-46dc-aa0e-89a003ed3cda	efc81916-6661-422b-826f-c68049339458	3	28000	\N	0	\N	2026-08-13 09:25:18.722	completed
fb2ec17a-e6fc-4494-88a8-fe70a642082e	423ffa5d-5a9f-46dc-aa0e-89a003ed3cda	cbc78f47-cb0d-4d34-80e1-841ec7b0e5de	3	48000	\N	0	\N	2026-08-13 09:25:18.722	completed
73f308ad-eee3-4873-9988-fdb72fa006b5	38d5491f-adba-4769-a023-a7c6584cd1e1	884570a1-2822-4840-a08f-fc4a4a3b5fad	4	48000	\N	0	\N	2026-08-13 09:25:18.732	completed
5c195cfe-d7cc-4362-8246-4c59591a63b6	38d5491f-adba-4769-a023-a7c6584cd1e1	daa4bd17-296f-4da1-8d21-15534fa8e045	3	25000	\N	0	\N	2026-08-13 09:25:18.732	completed
0e36628c-1b25-4604-9b1c-196e07d324b8	38d5491f-adba-4769-a023-a7c6584cd1e1	7484d38a-54a0-49c7-baa2-a93fdce6d347	3	55000	\N	0	\N	2026-08-13 09:25:18.732	completed
c87ccd4d-4edd-4233-8455-ee161e59eca5	38d5491f-adba-4769-a023-a7c6584cd1e1	3a6ff9b1-cc6c-45ae-9635-ab2b2d03c232	3	38000	\N	0	\N	2026-08-13 09:25:18.732	completed
67de0aae-6a7f-45fe-95f2-e7dbcf0ece1c	801433b6-894d-42e1-a8fa-f041ca811eff	ceed2a39-e4e2-486c-b228-a909a81d8487	2	20000	\N	0	\N	2026-08-13 09:25:18.74	completed
a67032dc-7216-465d-95e8-6d2bf3a97d8d	801433b6-894d-42e1-a8fa-f041ca811eff	2ce5c559-70e1-4bdd-8cf0-fcdf2a843273	3	46000	\N	0	\N	2026-08-13 09:25:18.74	completed
bd9943b8-bee2-483c-9986-157d770b0430	801433b6-894d-42e1-a8fa-f041ca811eff	884570a1-2822-4840-a08f-fc4a4a3b5fad	1	48000	\N	0	\N	2026-08-13 09:25:18.74	completed
5cb8f6d7-4329-4e00-9cf3-0b82eeefb624	801433b6-894d-42e1-a8fa-f041ca811eff	faead849-9d7b-4831-b60e-20222fee6c1f	3	48000	\N	0	\N	2026-08-13 09:25:18.74	completed
04e9cd44-a3b8-4a9b-9ef3-1f19879f8b90	801433b6-894d-42e1-a8fa-f041ca811eff	3aac02bc-fcc6-4532-9a50-fa50790dd4cb	3	32000	\N	0	\N	2026-08-13 09:25:18.74	completed
11ce9b3d-ea98-4a74-8999-0bcef450f46b	7370755a-72a7-408a-86c0-8846a0333023	81d6f3b5-b26a-4dd0-bfca-fea91a42a296	2	35000	\N	0	\N	2026-08-13 09:25:18.749	completed
0be06a2f-5daa-4bd8-81c1-bf7db7fe8550	7370755a-72a7-408a-86c0-8846a0333023	6798927c-bcba-49fd-a7ad-78291c69ac33	3	52000	\N	0	\N	2026-08-13 09:25:18.749	completed
e92c8d9f-46b6-4ce1-895d-32f8459730ff	7370755a-72a7-408a-86c0-8846a0333023	b429cd3c-c501-4b4a-b028-9ab5feedc41e	3	52000	\N	0	\N	2026-08-13 09:25:18.749	completed
c7853731-d5e6-47d2-a1d5-25879405b292	7370755a-72a7-408a-86c0-8846a0333023	cbc78f47-cb0d-4d34-80e1-841ec7b0e5de	1	48000	\N	0	\N	2026-08-13 09:25:18.749	completed
5176bd5a-dfc0-4cc4-985b-1b4b98818264	db51be87-57ad-4ac0-bd7b-53a143046ac1	35fbf376-436a-45ea-89a5-41560d3be32b	3	35000	\N	0	\N	2026-08-13 09:25:18.758	completed
1f9aef95-7932-4273-a475-2c1674ee6b68	db51be87-57ad-4ac0-bd7b-53a143046ac1	3aac02bc-fcc6-4532-9a50-fa50790dd4cb	2	32000	\N	0	\N	2026-08-13 09:25:18.758	completed
47f97cdd-8da3-4762-a8b9-0749389f7b88	db51be87-57ad-4ac0-bd7b-53a143046ac1	83ceb824-bbdc-4b06-a867-037ded0aef0e	2	50000	\N	0	\N	2026-08-13 09:25:18.758	completed
93d2cae3-050d-43ba-b7ad-b585a483eb5d	db51be87-57ad-4ac0-bd7b-53a143046ac1	ce6673bb-c51b-4a4f-ab3d-810e44601734	2	28000	\N	0	\N	2026-08-13 09:25:18.758	completed
fb192f66-1c5a-4c3b-9d10-e8b926d43d28	db51be87-57ad-4ac0-bd7b-53a143046ac1	7804beb7-b72c-43db-a27a-82b955e5e31c	2	25000	\N	0	\N	2026-08-13 09:25:18.758	completed
4f649bd5-39f8-4d8d-8f31-f1df1e21a16b	db51be87-57ad-4ac0-bd7b-53a143046ac1	eb1dae05-cb14-4000-ba10-260f9cd79124	2	45000	\N	0	\N	2026-08-13 09:25:18.758	completed
e57081ea-07a8-4f25-809d-9524e173bf01	db51be87-57ad-4ac0-bd7b-53a143046ac1	803bcdee-17d3-41fc-a249-4e8d16b49575	2	48000	\N	0	\N	2026-08-13 09:25:18.758	completed
248602c8-95c7-4199-9344-7f57b270cfb8	db51be87-57ad-4ac0-bd7b-53a143046ac1	eaa3fac9-f60f-4db1-b33a-a4bd46e8ea71	3	45000	\N	0	\N	2026-08-13 09:25:18.758	completed
3ab6abf8-c5b5-4c59-be2f-f6abaeba8323	3fe830f0-d0d4-4bf0-95a4-449ddac8dfa8	d809adca-e256-41bc-b7b0-75df0d3f5dcb	3	35000	\N	0	\N	2026-08-13 09:25:18.763	completed
d4b88a88-0627-4f0a-ac5d-228025808d71	3fe830f0-d0d4-4bf0-95a4-449ddac8dfa8	b6a4c689-bce0-4d87-883b-b0de919eba27	2	58000	\N	0	\N	2026-08-13 09:25:18.763	completed
a66589fa-1e0f-4855-9b1a-18f3c53239e7	3fe830f0-d0d4-4bf0-95a4-449ddac8dfa8	5bc34fc9-24c2-4108-af83-5992af2291d6	2	40000	\N	0	\N	2026-08-13 09:25:18.763	completed
cd132c97-415f-4d3c-aff8-6fb14e18d5eb	b3a8a7c6-ba58-474a-a95d-9c68e400d50f	5ba65aef-1f61-4c68-b8c1-d847553c8aef	3	52000	\N	0	\N	2026-08-13 09:25:18.771	completed
d4491366-9c2c-44f6-833b-32405681a190	b3a8a7c6-ba58-474a-a95d-9c68e400d50f	228cd2ca-0ce1-44ff-92d8-05b7c9480e55	2	42000	\N	0	\N	2026-08-13 09:25:18.771	completed
f33a50c7-d065-4472-acdd-b01dcde8adff	b3a8a7c6-ba58-474a-a95d-9c68e400d50f	5bc34fc9-24c2-4108-af83-5992af2291d6	1	40000	\N	0	\N	2026-08-13 09:25:18.771	completed
f2fced7d-1f47-41f5-8180-5dfffbbf850e	b3a8a7c6-ba58-474a-a95d-9c68e400d50f	d849f917-4afe-4a94-8866-03848a938c79	3	35000	\N	0	\N	2026-08-13 09:25:18.771	completed
0a485f27-f8c5-42e8-a3c7-e117ad9f80de	b3a8a7c6-ba58-474a-a95d-9c68e400d50f	a02247ba-a10e-4387-967d-e69a05c8193a	3	32000	\N	0	\N	2026-08-13 09:25:18.771	completed
9ec33807-2ae4-4ebb-b0ab-bed7f7a011f5	b3a8a7c6-ba58-474a-a95d-9c68e400d50f	e24a6cc9-1b6e-4ba7-94a5-514f6aa8fe31	1	45000	\N	0	\N	2026-08-13 09:25:18.771	completed
b3abcd20-0e3c-444f-84f1-2a65ab9249e9	b3a8a7c6-ba58-474a-a95d-9c68e400d50f	25a8343a-39c3-457e-9c1d-13689bd6469b	1	45000	\N	0	\N	2026-08-13 09:25:18.771	completed
54ca8a0b-9d32-4cc4-83ac-a8cc2b4f1a1c	b3a8a7c6-ba58-474a-a95d-9c68e400d50f	cbc78f47-cb0d-4d34-80e1-841ec7b0e5de	2	48000	\N	0	\N	2026-08-13 09:25:18.771	completed
59cd6dbb-8ca1-444a-b7dc-a4c86b05a260	2e81a64f-a505-4ef8-98fa-71332fb05171	b6a4c689-bce0-4d87-883b-b0de919eba27	3	58000	\N	0	\N	2026-08-13 09:25:18.775	completed
2614d84b-a288-448f-9f85-7562793a1bf9	2e81a64f-a505-4ef8-98fa-71332fb05171	eb1dae05-cb14-4000-ba10-260f9cd79124	4	45000	\N	0	\N	2026-08-13 09:25:18.775	completed
c24741e0-7f55-467f-be24-92bf8981eddd	2e81a64f-a505-4ef8-98fa-71332fb05171	bcff5008-981c-428b-b652-31d8c1378d9f	1	28000	\N	0	\N	2026-08-13 09:25:18.775	completed
c363946a-bcea-4c27-99a6-74caf43d660d	2e81a64f-a505-4ef8-98fa-71332fb05171	25a8343a-39c3-457e-9c1d-13689bd6469b	3	45000	\N	0	\N	2026-08-13 09:25:18.775	completed
00d34f8d-e246-46aa-9d12-1620ea842eea	2e81a64f-a505-4ef8-98fa-71332fb05171	a02247ba-a10e-4387-967d-e69a05c8193a	4	32000	\N	0	\N	2026-08-13 09:25:18.775	completed
fd6c5c84-f14c-4cc5-a8d3-cbb9078df908	2e81a64f-a505-4ef8-98fa-71332fb05171	803bcdee-17d3-41fc-a249-4e8d16b49575	4	48000	\N	0	\N	2026-08-13 09:25:18.775	completed
cab06e56-de40-448d-88db-5b740d795c1b	db5eff69-3421-4b27-acfc-3bf45be9d963	803bcdee-17d3-41fc-a249-4e8d16b49575	4	48000	\N	0	\N	2026-08-13 09:25:18.785	completed
60c5770a-5dc7-4508-baff-a70413776806	db5eff69-3421-4b27-acfc-3bf45be9d963	12b460b3-749d-4ab1-80de-d8f51d5188cc	2	40000	\N	0	\N	2026-08-13 09:25:18.785	completed
f5ec1a20-6850-4649-8d0e-5ad99ad89f04	db5eff69-3421-4b27-acfc-3bf45be9d963	d809adca-e256-41bc-b7b0-75df0d3f5dcb	2	35000	\N	0	\N	2026-08-13 09:25:18.785	completed
74ef0bd3-7a0d-445a-9449-988a7468b6e3	db5eff69-3421-4b27-acfc-3bf45be9d963	ce6673bb-c51b-4a4f-ab3d-810e44601734	1	28000	\N	0	\N	2026-08-13 09:25:18.785	completed
7627a5f1-7271-499f-8c31-9d089b73ff36	db5eff69-3421-4b27-acfc-3bf45be9d963	d52c0006-3bcd-48c7-ab83-082061dc6764	3	42000	\N	0	\N	2026-08-13 09:25:18.785	completed
d22f0620-c4a7-499d-be26-8e60366954a2	db5eff69-3421-4b27-acfc-3bf45be9d963	2ce5c559-70e1-4bdd-8cf0-fcdf2a843273	1	46000	\N	0	\N	2026-08-13 09:25:18.785	completed
fd2530d6-fc2a-4078-98da-b112d1e63446	db5eff69-3421-4b27-acfc-3bf45be9d963	96531f07-be37-454a-aa0c-4a0eaab99930	4	55000	\N	0	\N	2026-08-13 09:25:18.785	completed
d883fbb1-2e6f-4283-bfe1-dd09ad5f2c63	db5eff69-3421-4b27-acfc-3bf45be9d963	3a6ff9b1-cc6c-45ae-9635-ab2b2d03c232	3	38000	\N	0	\N	2026-08-13 09:25:18.785	completed
c5e03a12-7bd4-4220-9e9e-930978f6c9ea	7fae7d63-d0a1-4fb7-a310-f5a1619bbd6b	35fbf376-436a-45ea-89a5-41560d3be32b	4	35000	\N	0	\N	2026-08-13 09:25:18.795	completed
96f9c729-65e7-4a25-8d62-b3781b6e9a97	7fae7d63-d0a1-4fb7-a310-f5a1619bbd6b	f731a039-1a1f-413d-826c-0955bb9eea80	3	55000	\N	0	\N	2026-08-13 09:25:18.795	completed
bf085a2c-53a4-4a80-ad42-ff5fed0fe9a9	7fae7d63-d0a1-4fb7-a310-f5a1619bbd6b	c0917f04-365b-4cdc-9b75-e49a7c492727	4	48000	\N	0	\N	2026-08-13 09:25:18.795	completed
ffbe8e82-0c45-4264-b762-9f38efaf91a3	7fae7d63-d0a1-4fb7-a310-f5a1619bbd6b	faead849-9d7b-4831-b60e-20222fee6c1f	1	48000	\N	0	\N	2026-08-13 09:25:18.795	completed
43e42b91-c941-4c13-9629-bf17ba9cb575	7fae7d63-d0a1-4fb7-a310-f5a1619bbd6b	acb42a52-c717-441a-824b-8a18079ee46c	2	50000	\N	0	\N	2026-08-13 09:25:18.795	completed
5a7f45bb-e2a5-446d-8524-e54c03897740	7fae7d63-d0a1-4fb7-a310-f5a1619bbd6b	625d086d-e1db-42f3-9cd5-84006fb429c1	3	48000	\N	0	\N	2026-08-13 09:25:18.795	completed
1a57c44e-ab7d-4363-9507-a246f4093e2e	7fae7d63-d0a1-4fb7-a310-f5a1619bbd6b	acb42a52-c717-441a-824b-8a18079ee46c	1	50000	\N	0	\N	2026-08-13 09:25:18.795	completed
e026b6a8-5d38-45dd-9014-31c3449ca26e	38b5ef26-8a6d-4a4a-9b70-e5738c784f52	d21a6806-fffa-4462-b33f-2c91a1c6b013	4	50000	\N	0	\N	2026-08-13 09:25:18.805	completed
d213fae4-9e42-459a-9833-d1fbe3641ae0	38b5ef26-8a6d-4a4a-9b70-e5738c784f52	5ba65aef-1f61-4c68-b8c1-d847553c8aef	3	52000	\N	0	\N	2026-08-13 09:25:18.805	completed
066032d9-c61c-4cd1-88bd-96fd47897ad8	38b5ef26-8a6d-4a4a-9b70-e5738c784f52	228cd2ca-0ce1-44ff-92d8-05b7c9480e55	1	42000	\N	0	\N	2026-08-13 09:25:18.805	completed
bb49acc1-bad1-4b09-9fba-5c545d53842a	38b5ef26-8a6d-4a4a-9b70-e5738c784f52	308d182c-58a9-47d9-a56a-bba4a473ae24	1	42000	\N	0	\N	2026-08-13 09:25:18.805	completed
8c1b1502-4736-44ff-802d-2f6dcd3a3af8	38b5ef26-8a6d-4a4a-9b70-e5738c784f52	b429cd3c-c501-4b4a-b028-9ab5feedc41e	4	52000	\N	0	\N	2026-08-13 09:25:18.805	completed
60d507c2-fff3-4e88-89ae-8d00e01b05e8	38b5ef26-8a6d-4a4a-9b70-e5738c784f52	96531f07-be37-454a-aa0c-4a0eaab99930	2	55000	\N	0	\N	2026-08-13 09:25:18.805	completed
540f19d9-9f61-4e66-8dad-b3ccf1cff141	1c36a05b-a64b-4f37-9b3d-d026f925c623	5ba65aef-1f61-4c68-b8c1-d847553c8aef	2	52000	\N	0	\N	2026-08-13 09:25:18.813	completed
8ceeca61-a696-498f-83d2-60c5c5e88b79	1c36a05b-a64b-4f37-9b3d-d026f925c623	51c45fec-e0e7-489e-8339-02a536d2e857	3	45000	\N	0	\N	2026-08-13 09:25:18.813	completed
0ab0cf1b-8d83-4c1f-a418-0678c08a13fb	1c36a05b-a64b-4f37-9b3d-d026f925c623	01d338fc-cbda-492d-b496-2a55e100d813	3	45000	\N	0	\N	2026-08-13 09:25:18.813	completed
f58321c2-f3f5-4b39-8a23-310b1d9d222b	1c36a05b-a64b-4f37-9b3d-d026f925c623	10b0cc63-2c10-44ef-bf34-8d19b7fda2bb	1	55000	\N	0	\N	2026-08-13 09:25:18.813	completed
4f68c989-e437-40d6-91da-ee95490e043f	1c36a05b-a64b-4f37-9b3d-d026f925c623	bcff5008-981c-428b-b652-31d8c1378d9f	2	28000	\N	0	\N	2026-08-13 09:25:18.813	completed
bd1449b4-de35-486a-9693-9b15803c5c61	1c36a05b-a64b-4f37-9b3d-d026f925c623	ce6673bb-c51b-4a4f-ab3d-810e44601734	4	28000	\N	0	\N	2026-08-13 09:25:18.813	completed
7dc38adb-e846-407a-8ad6-8e4828fd63ae	1c36a05b-a64b-4f37-9b3d-d026f925c623	c24edbc4-7c7a-4228-9b3c-1b95c2be051c	1	48000	\N	0	\N	2026-08-13 09:25:18.813	completed
c366d4d7-35aa-4139-ab1f-6ba1d390fb6e	1c36a05b-a64b-4f37-9b3d-d026f925c623	803bcdee-17d3-41fc-a249-4e8d16b49575	4	48000	\N	0	\N	2026-08-13 09:25:18.813	completed
0e91d388-0f84-492f-8e26-88498c3c3582	33492934-b09c-41b9-a06d-00c5a16e5bb3	b429cd3c-c501-4b4a-b028-9ab5feedc41e	3	52000	\N	0	\N	2026-08-13 09:25:18.822	completed
a53b12a4-4af3-4c97-9c73-1f798e3b7dc7	33492934-b09c-41b9-a06d-00c5a16e5bb3	219c20d2-6247-4e8b-a734-53cfbd90ba88	4	52000	\N	0	\N	2026-08-13 09:25:18.822	completed
9355e2ef-f87d-42db-8cd0-3bb2251d2bf6	33492934-b09c-41b9-a06d-00c5a16e5bb3	faead849-9d7b-4831-b60e-20222fee6c1f	1	48000	\N	0	\N	2026-08-13 09:25:18.822	completed
3dd029d3-5f2a-47db-aae4-48a163cbb09c	33492934-b09c-41b9-a06d-00c5a16e5bb3	7804beb7-b72c-43db-a27a-82b955e5e31c	3	25000	\N	0	\N	2026-08-13 09:25:18.822	completed
5b6e96ef-c052-4485-ad25-6a3a39f6130e	33492934-b09c-41b9-a06d-00c5a16e5bb3	228cd2ca-0ce1-44ff-92d8-05b7c9480e55	4	42000	\N	0	\N	2026-08-13 09:25:18.822	completed
6aa4be53-9c87-4b36-9476-cd9bce405443	33492934-b09c-41b9-a06d-00c5a16e5bb3	35fbf376-436a-45ea-89a5-41560d3be32b	4	35000	\N	0	\N	2026-08-13 09:25:18.822	completed
a2a938b3-b513-4a29-8361-e3060c52ad34	af7264a4-308e-4470-ad2a-10d88661f216	12b460b3-749d-4ab1-80de-d8f51d5188cc	3	40000	\N	0	\N	2026-08-13 09:25:18.833	completed
fdb9194a-de63-415b-a0c3-c9b9ef7ff330	af7264a4-308e-4470-ad2a-10d88661f216	6798927c-bcba-49fd-a7ad-78291c69ac33	4	52000	\N	0	\N	2026-08-13 09:25:18.833	completed
ab97f58a-a5f0-4706-9014-36de0c0b6a78	af7264a4-308e-4470-ad2a-10d88661f216	e718f02b-b657-444d-89ae-fb910537eb6c	2	42000	\N	0	\N	2026-08-13 09:25:18.833	completed
1cd10859-f6c7-4867-a781-7c9702fe14be	af7264a4-308e-4470-ad2a-10d88661f216	a02247ba-a10e-4387-967d-e69a05c8193a	4	32000	\N	0	\N	2026-08-13 09:25:18.833	completed
bea17659-9a87-4466-9182-07124e3ef8e8	cc351b14-d115-411d-8e41-7cfd8627df85	cb1888fc-f827-4522-b136-a22bf86816c2	3	35000	\N	0	\N	2026-08-13 09:25:18.842	completed
1bcc636c-abb5-4cc8-8351-6debd5f67258	cc351b14-d115-411d-8e41-7cfd8627df85	5ba65aef-1f61-4c68-b8c1-d847553c8aef	1	52000	\N	0	\N	2026-08-13 09:25:18.842	completed
24c01165-0c34-4171-87a4-6d5414e60eae	cc351b14-d115-411d-8e41-7cfd8627df85	b429cd3c-c501-4b4a-b028-9ab5feedc41e	4	52000	\N	0	\N	2026-08-13 09:25:18.842	completed
fb60ea75-bda4-4bad-b04e-44350bc47a49	cc351b14-d115-411d-8e41-7cfd8627df85	10b0cc63-2c10-44ef-bf34-8d19b7fda2bb	4	55000	\N	0	\N	2026-08-13 09:25:18.842	completed
f1075fa9-2a76-42c3-9b14-cf2a6806e36d	ad325732-13eb-4a65-b620-ba185448b988	884570a1-2822-4840-a08f-fc4a4a3b5fad	3	48000	\N	0	\N	2026-08-13 09:25:18.85	completed
f610eb08-9df5-4ebc-a6a6-faf2569d5220	ad325732-13eb-4a65-b620-ba185448b988	51c45fec-e0e7-489e-8339-02a536d2e857	2	45000	\N	0	\N	2026-08-13 09:25:18.85	completed
0940af0f-aae4-43a2-a9b5-299fc2887516	ad325732-13eb-4a65-b620-ba185448b988	6798927c-bcba-49fd-a7ad-78291c69ac33	1	52000	\N	0	\N	2026-08-13 09:25:18.85	completed
38402457-ef78-49e7-a31e-eee77cce7304	6285d3ea-7006-4c7b-ac9b-35e187157d60	faead849-9d7b-4831-b60e-20222fee6c1f	3	48000	\N	0	\N	2026-08-13 09:25:18.86	completed
98c65918-bc46-4d9b-9de3-7a3a96008525	6285d3ea-7006-4c7b-ac9b-35e187157d60	7804beb7-b72c-43db-a27a-82b955e5e31c	3	25000	\N	0	\N	2026-08-13 09:25:18.86	completed
ab2370f6-80c4-40fc-9a3c-f2b42e85d60b	6285d3ea-7006-4c7b-ac9b-35e187157d60	308d182c-58a9-47d9-a56a-bba4a473ae24	2	42000	\N	0	\N	2026-08-13 09:25:18.86	completed
5fbab8c2-b1f3-474b-a8a3-5999d6d724d7	b1530886-110b-41cb-95d3-59b999a0bdb7	7484d38a-54a0-49c7-baa2-a93fdce6d347	4	55000	\N	0	\N	2026-08-13 09:25:18.868	completed
bc79ece7-3a27-4620-8971-72e5083debfe	b1530886-110b-41cb-95d3-59b999a0bdb7	30ef5deb-6b46-47d1-a98c-8bc060d62b44	4	45000	\N	0	\N	2026-08-13 09:25:18.868	completed
5cbcdf94-cc6f-4d18-84a3-67be8cfda4f2	b1530886-110b-41cb-95d3-59b999a0bdb7	00acd18c-4b3a-4737-a36c-530f2c16d3b6	3	38000	\N	0	\N	2026-08-13 09:25:18.868	completed
28bd474f-a822-41f5-9dc4-8ff22bca48cf	b1530886-110b-41cb-95d3-59b999a0bdb7	5bc34fc9-24c2-4108-af83-5992af2291d6	3	40000	\N	0	\N	2026-08-13 09:25:18.868	completed
7149688d-a585-40db-9f59-5d8549657f87	b1530886-110b-41cb-95d3-59b999a0bdb7	e718f02b-b657-444d-89ae-fb910537eb6c	4	42000	\N	0	\N	2026-08-13 09:25:18.868	completed
4f1ebec6-d169-4468-af39-699786a8ef15	b1530886-110b-41cb-95d3-59b999a0bdb7	d21a6806-fffa-4462-b33f-2c91a1c6b013	3	50000	\N	0	\N	2026-08-13 09:25:18.868	completed
4b0a5e56-6d4d-4c8d-9dee-894ae15ef4d6	b1530886-110b-41cb-95d3-59b999a0bdb7	6798927c-bcba-49fd-a7ad-78291c69ac33	3	52000	\N	0	\N	2026-08-13 09:25:18.868	completed
d0dee7ae-425e-43f4-b994-cee46be04e93	b1530886-110b-41cb-95d3-59b999a0bdb7	01d338fc-cbda-492d-b496-2a55e100d813	1	45000	\N	0	\N	2026-08-13 09:25:18.868	completed
bd9e50cc-d3c1-4cbc-9fa5-ea200b024e8d	31be94bc-8f1b-415c-a906-24700cb5812d	b429cd3c-c501-4b4a-b028-9ab5feedc41e	1	52000	\N	0	\N	2026-08-13 09:25:18.877	completed
e7ac946e-48f1-4c0a-bed5-8220e2b471c1	31be94bc-8f1b-415c-a906-24700cb5812d	3aac02bc-fcc6-4532-9a50-fa50790dd4cb	3	32000	\N	0	\N	2026-08-13 09:25:18.877	completed
58229b7e-eee5-4619-80dd-5b5428cd4919	31be94bc-8f1b-415c-a906-24700cb5812d	cb1888fc-f827-4522-b136-a22bf86816c2	3	35000	\N	0	\N	2026-08-13 09:25:18.877	completed
8f6d86a9-888f-4697-8860-66a63f09195d	31be94bc-8f1b-415c-a906-24700cb5812d	d849f917-4afe-4a94-8866-03848a938c79	1	35000	\N	0	\N	2026-08-13 09:25:18.877	completed
41d30556-40be-452f-b3a6-9e21720994d4	31be94bc-8f1b-415c-a906-24700cb5812d	884570a1-2822-4840-a08f-fc4a4a3b5fad	2	48000	\N	0	\N	2026-08-13 09:25:18.877	completed
5996acc3-0bc9-44a2-a8a3-5d88c81230d8	31be94bc-8f1b-415c-a906-24700cb5812d	35fbf376-436a-45ea-89a5-41560d3be32b	2	35000	\N	0	\N	2026-08-13 09:25:18.877	completed
e6f21570-50f0-4c21-91b4-995749b19fd7	4238d662-36a2-4e6d-8ace-a06f41092aec	d52c0006-3bcd-48c7-ab83-082061dc6764	1	42000	\N	0	\N	2026-08-13 09:25:18.881	completed
bfce3c95-0cfc-403f-9808-93f8f6f61e27	4238d662-36a2-4e6d-8ace-a06f41092aec	daa4bd17-296f-4da1-8d21-15534fa8e045	2	25000	\N	0	\N	2026-08-13 09:25:18.881	completed
ccf3ef59-43d0-46cf-9119-59edebc3f6d9	4238d662-36a2-4e6d-8ace-a06f41092aec	51c45fec-e0e7-489e-8339-02a536d2e857	2	45000	\N	0	\N	2026-08-13 09:25:18.881	completed
8a721107-bf39-4f90-b34a-3e44d46ee61f	4238d662-36a2-4e6d-8ace-a06f41092aec	219c20d2-6247-4e8b-a734-53cfbd90ba88	1	52000	\N	0	\N	2026-08-13 09:25:18.881	completed
d6729a15-9de1-4692-bc09-9f90a31edb97	8b4b0311-fcdf-443d-acd8-15fbcb63b950	35fbf376-436a-45ea-89a5-41560d3be32b	1	35000	\N	0	\N	2026-08-13 09:25:18.89	completed
863d6263-1435-43ec-ae4e-1a3dcbf6642c	8b4b0311-fcdf-443d-acd8-15fbcb63b950	27af0495-2d91-4cb0-af88-4752edf671dc	3	10000	\N	0	\N	2026-08-13 09:25:18.89	completed
d3529aa0-dbe4-4a5c-a8ed-4853377dcf03	8b4b0311-fcdf-443d-acd8-15fbcb63b950	faead849-9d7b-4831-b60e-20222fee6c1f	1	48000	\N	0	\N	2026-08-13 09:25:18.89	completed
0d0a21dc-e4db-4f49-b55c-79be447c61fe	8b4b0311-fcdf-443d-acd8-15fbcb63b950	a02247ba-a10e-4387-967d-e69a05c8193a	3	32000	\N	0	\N	2026-08-13 09:25:18.89	completed
e505f22d-28b8-4f25-a9f0-8303e533f815	8b4b0311-fcdf-443d-acd8-15fbcb63b950	803bcdee-17d3-41fc-a249-4e8d16b49575	4	48000	\N	0	\N	2026-08-13 09:25:18.89	completed
f8b4be34-60f4-4ae6-929e-29f365584b97	8b4b0311-fcdf-443d-acd8-15fbcb63b950	b1ee3afc-db38-468c-a4bf-38b51b772024	4	20000	\N	0	\N	2026-08-13 09:25:18.89	completed
8c877a18-cf29-4ae5-8146-c39169dbc5a7	bb15dd82-4647-47b0-a7dc-a11529a148a0	2ce5c559-70e1-4bdd-8cf0-fcdf2a843273	2	46000	\N	0	\N	2026-08-13 09:25:18.899	completed
a6a7c1b0-f9f0-48e2-93fd-7f9dcfc5e5cf	bb15dd82-4647-47b0-a7dc-a11529a148a0	35fbf376-436a-45ea-89a5-41560d3be32b	4	35000	\N	0	\N	2026-08-13 09:25:18.899	completed
431e6ddf-9fb6-4cea-a315-b480e974b450	bb15dd82-4647-47b0-a7dc-a11529a148a0	b429cd3c-c501-4b4a-b028-9ab5feedc41e	4	52000	\N	0	\N	2026-08-13 09:25:18.899	completed
2bf0cea0-9c77-4d20-8479-bf090a60ba9b	bb15dd82-4647-47b0-a7dc-a11529a148a0	eaa3fac9-f60f-4db1-b33a-a4bd46e8ea71	1	45000	\N	0	\N	2026-08-13 09:25:18.899	completed
b91655ad-3ac1-4627-b1f4-41b0e5208abb	bb15dd82-4647-47b0-a7dc-a11529a148a0	51c45fec-e0e7-489e-8339-02a536d2e857	2	45000	\N	0	\N	2026-08-13 09:25:18.899	completed
377e730e-80b1-478a-83a8-9697abd09278	a3a711b1-4e31-4046-8b51-3f4801b5693d	35fbf376-436a-45ea-89a5-41560d3be32b	2	35000	\N	0	\N	2026-08-13 09:25:18.904	completed
bd857482-e370-44f1-ad65-468992a64b43	a3a711b1-4e31-4046-8b51-3f4801b5693d	01d338fc-cbda-492d-b496-2a55e100d813	1	45000	\N	0	\N	2026-08-13 09:25:18.904	completed
622c9563-34be-4809-b416-c4566717f4dc	a3a711b1-4e31-4046-8b51-3f4801b5693d	51c45fec-e0e7-489e-8339-02a536d2e857	1	45000	\N	0	\N	2026-08-13 09:25:18.904	completed
d5b55437-fe90-4f2d-9520-41444bdcf570	a3a711b1-4e31-4046-8b51-3f4801b5693d	a02247ba-a10e-4387-967d-e69a05c8193a	2	32000	\N	0	\N	2026-08-13 09:25:18.904	completed
6718f1b8-c160-4392-9dbe-d7a37efe1caa	a3a711b1-4e31-4046-8b51-3f4801b5693d	51c45fec-e0e7-489e-8339-02a536d2e857	4	45000	\N	0	\N	2026-08-13 09:25:18.904	completed
9526fc0e-6871-4e4a-a807-ea155760a0eb	ee33abaa-52df-4e69-a16e-88d747994d02	308d182c-58a9-47d9-a56a-bba4a473ae24	1	42000	\N	0	\N	2026-08-13 09:25:18.913	completed
405ddca6-eede-47fd-8d5f-013ec702f3d1	ee33abaa-52df-4e69-a16e-88d747994d02	12b460b3-749d-4ab1-80de-d8f51d5188cc	2	40000	\N	0	\N	2026-08-13 09:25:18.913	completed
c6dfaeac-54a4-4f78-abd0-f68a79646b4c	ee33abaa-52df-4e69-a16e-88d747994d02	b6a4c689-bce0-4d87-883b-b0de919eba27	1	58000	\N	0	\N	2026-08-13 09:25:18.913	completed
43c4185d-2e0f-418a-8465-464e62cd34d4	ee33abaa-52df-4e69-a16e-88d747994d02	625d086d-e1db-42f3-9cd5-84006fb429c1	2	48000	\N	0	\N	2026-08-13 09:25:18.913	completed
a46d4d44-23ac-4a7f-a5d8-7fc174aedb24	ee33abaa-52df-4e69-a16e-88d747994d02	a02247ba-a10e-4387-967d-e69a05c8193a	4	32000	\N	0	\N	2026-08-13 09:25:18.913	completed
56604653-7442-4759-9fc1-7dcaa1336e3b	ee33abaa-52df-4e69-a16e-88d747994d02	a02247ba-a10e-4387-967d-e69a05c8193a	4	32000	\N	0	\N	2026-08-13 09:25:18.913	completed
1d28bff2-2310-4605-ad61-88f95d1695be	ee33abaa-52df-4e69-a16e-88d747994d02	6798927c-bcba-49fd-a7ad-78291c69ac33	4	52000	\N	0	\N	2026-08-13 09:25:18.913	completed
857b6c20-5223-4c71-aed6-40757d14432a	e028680f-502f-4335-a9e5-3266d34536b8	25a8343a-39c3-457e-9c1d-13689bd6469b	2	45000	\N	0	\N	2026-08-13 09:25:18.917	completed
45bf47ea-f4cb-42c9-946c-840112624ed0	e028680f-502f-4335-a9e5-3266d34536b8	ceed2a39-e4e2-486c-b228-a909a81d8487	2	20000	\N	0	\N	2026-08-13 09:25:18.917	completed
bdc5521d-265f-4f49-832e-511587f05674	e028680f-502f-4335-a9e5-3266d34536b8	e718f02b-b657-444d-89ae-fb910537eb6c	3	42000	\N	0	\N	2026-08-13 09:25:18.917	completed
3d5d184e-4be8-4c9b-9154-ab0d16dbac59	e028680f-502f-4335-a9e5-3266d34536b8	803bcdee-17d3-41fc-a249-4e8d16b49575	1	48000	\N	0	\N	2026-08-13 09:25:18.917	completed
46234e00-a736-46bc-9e46-8b53772ea272	e028680f-502f-4335-a9e5-3266d34536b8	30ef5deb-6b46-47d1-a98c-8bc060d62b44	2	45000	\N	0	\N	2026-08-13 09:25:18.917	completed
03b37c09-c962-4896-bd6b-a2bd78ece3c5	f230ad26-e90d-4e97-b365-103637dc4d9b	d21a6806-fffa-4462-b33f-2c91a1c6b013	4	50000	\N	0	\N	2026-08-13 09:25:18.923	completed
3f4c4a8a-08da-439f-a760-b9a9c6def980	f230ad26-e90d-4e97-b365-103637dc4d9b	27af0495-2d91-4cb0-af88-4752edf671dc	1	10000	\N	0	\N	2026-08-13 09:25:18.923	completed
a1f33d85-e77f-4697-bd23-5e7e3dc9aca7	f230ad26-e90d-4e97-b365-103637dc4d9b	3aac02bc-fcc6-4532-9a50-fa50790dd4cb	3	32000	\N	0	\N	2026-08-13 09:25:18.923	completed
142bc1af-4010-4007-ae2c-55a8a08e2b74	f230ad26-e90d-4e97-b365-103637dc4d9b	35fbf376-436a-45ea-89a5-41560d3be32b	3	35000	\N	0	\N	2026-08-13 09:25:18.923	completed
afc3eaba-b716-48c9-a2e8-bc4c23600614	60f39543-422e-4685-a8cd-4cdf9a30c231	e718f02b-b657-444d-89ae-fb910537eb6c	1	42000	\N	0	\N	2026-08-13 09:25:18.928	completed
91437245-ade3-460e-9399-6186bdbf59d1	60f39543-422e-4685-a8cd-4cdf9a30c231	cb1888fc-f827-4522-b136-a22bf86816c2	2	35000	\N	0	\N	2026-08-13 09:25:18.928	completed
57828cd2-dba9-4419-97bc-ceda4898a2aa	60f39543-422e-4685-a8cd-4cdf9a30c231	eb1dae05-cb14-4000-ba10-260f9cd79124	3	45000	\N	0	\N	2026-08-13 09:25:18.928	completed
bd8099c1-4723-43a3-8ff1-fa871b4ceb2a	60f39543-422e-4685-a8cd-4cdf9a30c231	8f09b4ea-702e-4845-b2c0-59b3bf810d9d	3	38000	\N	0	\N	2026-08-13 09:25:18.928	completed
27df8af4-4667-4ad9-9f90-16ab96d1e7bf	60f39543-422e-4685-a8cd-4cdf9a30c231	b6a4c689-bce0-4d87-883b-b0de919eba27	4	58000	\N	0	\N	2026-08-13 09:25:18.928	completed
6cf15415-ebd4-4eda-9ff0-5be4a502d623	60f39543-422e-4685-a8cd-4cdf9a30c231	00acd18c-4b3a-4737-a36c-530f2c16d3b6	3	38000	\N	0	\N	2026-08-13 09:25:18.928	completed
172a14b2-82fd-43f6-aef5-a2def2f13e36	2e66a039-4e0c-44a1-b719-02243f25eaa5	0b97d8bc-ffce-4904-8c46-87752b930f5e	3	45000	\N	0	\N	2026-08-13 09:25:18.938	completed
a0ca3a80-272c-4c52-9d14-c546b0c9297d	2e66a039-4e0c-44a1-b719-02243f25eaa5	0b97d8bc-ffce-4904-8c46-87752b930f5e	1	45000	\N	0	\N	2026-08-13 09:25:18.938	completed
ae9bd057-837b-4495-a330-7f57d79e68e9	2e66a039-4e0c-44a1-b719-02243f25eaa5	eaa3fac9-f60f-4db1-b33a-a4bd46e8ea71	3	45000	\N	0	\N	2026-08-13 09:25:18.938	completed
e09cd703-a4e2-41fe-a1cf-a0b3d24e2569	2e66a039-4e0c-44a1-b719-02243f25eaa5	83ff8a95-3eb4-4b98-9978-63aa6d1b8323	1	55000	\N	0	\N	2026-08-13 09:25:18.938	completed
2919eb46-bafe-4b76-b0cd-f17e523eeb1e	2e66a039-4e0c-44a1-b719-02243f25eaa5	5ba65aef-1f61-4c68-b8c1-d847553c8aef	1	52000	\N	0	\N	2026-08-13 09:25:18.938	completed
3bf34b21-4e71-4853-aa8d-87f346fda769	2e66a039-4e0c-44a1-b719-02243f25eaa5	96531f07-be37-454a-aa0c-4a0eaab99930	1	55000	\N	0	\N	2026-08-13 09:25:18.938	completed
c86a320e-fec7-4feb-84c1-0e7a3c437e3b	2e66a039-4e0c-44a1-b719-02243f25eaa5	faead849-9d7b-4831-b60e-20222fee6c1f	3	48000	\N	0	\N	2026-08-13 09:25:18.938	completed
75c68f74-f0fe-433e-bd8d-cf76f06d7676	2e66a039-4e0c-44a1-b719-02243f25eaa5	f731a039-1a1f-413d-826c-0955bb9eea80	2	55000	\N	0	\N	2026-08-13 09:25:18.938	completed
e9b8e17f-ca53-4a1f-bb29-88722d1b7947	ad35e5df-e686-4672-8169-4ed376fee29a	5ba65aef-1f61-4c68-b8c1-d847553c8aef	1	52000	\N	0	\N	2026-08-13 09:25:18.947	completed
b493ea43-24d7-47ce-ac79-b5524263189b	ad35e5df-e686-4672-8169-4ed376fee29a	efc81916-6661-422b-826f-c68049339458	4	28000	\N	0	\N	2026-08-13 09:25:18.947	completed
f15a25c6-ddf2-401f-a734-fd531b5cf8b2	ad35e5df-e686-4672-8169-4ed376fee29a	e718f02b-b657-444d-89ae-fb910537eb6c	3	42000	\N	0	\N	2026-08-13 09:25:18.947	completed
e21735a2-43ad-45ae-9465-67562805278c	ad35e5df-e686-4672-8169-4ed376fee29a	86643a05-ac82-4216-bdf8-87fcd64da8ec	4	48000	\N	0	\N	2026-08-13 09:25:18.947	completed
2e15c4df-5c5d-4d20-bf95-6c3e5de166bf	ad35e5df-e686-4672-8169-4ed376fee29a	bcff5008-981c-428b-b652-31d8c1378d9f	3	28000	\N	0	\N	2026-08-13 09:25:18.947	completed
04d41e43-a4bd-4a43-aa38-1890f8c1f3c6	ad35e5df-e686-4672-8169-4ed376fee29a	faead849-9d7b-4831-b60e-20222fee6c1f	3	48000	\N	0	\N	2026-08-13 09:25:18.947	completed
a8642b9f-7f37-4dbb-9427-7a895523bc1a	f56794c1-9980-4c71-a20c-b64a2c1cd32e	803bcdee-17d3-41fc-a249-4e8d16b49575	2	48000	\N	0	\N	2026-08-13 09:25:18.951	completed
a1c3c682-b9a3-439d-bc1d-c595f21c5fd0	f56794c1-9980-4c71-a20c-b64a2c1cd32e	7804beb7-b72c-43db-a27a-82b955e5e31c	3	25000	\N	0	\N	2026-08-13 09:25:18.951	completed
5605db19-0d56-46b9-ab0b-3d1f2c707c55	f56794c1-9980-4c71-a20c-b64a2c1cd32e	27af0495-2d91-4cb0-af88-4752edf671dc	1	10000	\N	0	\N	2026-08-13 09:25:18.951	completed
6879a728-2c42-43cd-b7ed-93f2a5f1e453	f56794c1-9980-4c71-a20c-b64a2c1cd32e	00acd18c-4b3a-4737-a36c-530f2c16d3b6	1	38000	\N	0	\N	2026-08-13 09:25:18.951	completed
7ec5bd64-d90b-4475-8bee-26a913895327	f56794c1-9980-4c71-a20c-b64a2c1cd32e	3a6ff9b1-cc6c-45ae-9635-ab2b2d03c232	3	38000	\N	0	\N	2026-08-13 09:25:18.951	completed
84554901-3d6f-4cd0-96b2-78b708c1e901	f56794c1-9980-4c71-a20c-b64a2c1cd32e	27af0495-2d91-4cb0-af88-4752edf671dc	2	10000	\N	0	\N	2026-08-13 09:25:18.951	completed
99dc1204-c045-4e03-958d-d992fe844d39	f56794c1-9980-4c71-a20c-b64a2c1cd32e	eb1dae05-cb14-4000-ba10-260f9cd79124	4	45000	\N	0	\N	2026-08-13 09:25:18.951	completed
8686731c-47e2-4cd4-a3b9-ac760e1b9bf1	3ebcbfd6-76d0-4f69-a93f-aa5f9f89b2f0	35fbf376-436a-45ea-89a5-41560d3be32b	3	35000	\N	0	\N	2026-08-13 09:25:18.959	completed
5e1e4d02-e53d-46a2-b21f-6537df838bfa	3ebcbfd6-76d0-4f69-a93f-aa5f9f89b2f0	01d338fc-cbda-492d-b496-2a55e100d813	2	45000	\N	0	\N	2026-08-13 09:25:18.959	completed
26c52e1c-1fd4-4ed7-8a41-51fa9b3e5eb8	3ebcbfd6-76d0-4f69-a93f-aa5f9f89b2f0	5bc34fc9-24c2-4108-af83-5992af2291d6	4	40000	\N	0	\N	2026-08-13 09:25:18.959	completed
115ed6fe-e424-49e0-bd90-c52edddefe4a	3ebcbfd6-76d0-4f69-a93f-aa5f9f89b2f0	e24a6cc9-1b6e-4ba7-94a5-514f6aa8fe31	3	45000	\N	0	\N	2026-08-13 09:25:18.959	completed
a8c8bc1e-01e8-4436-9563-b337e5559284	ff427e93-1b80-4de8-9694-5a5023a36901	7484d38a-54a0-49c7-baa2-a93fdce6d347	3	55000	\N	0	\N	2026-08-13 09:25:18.967	completed
82577172-a5b6-4dc4-93cd-0c2d6197e43a	ff427e93-1b80-4de8-9694-5a5023a36901	27af0495-2d91-4cb0-af88-4752edf671dc	1	10000	\N	0	\N	2026-08-13 09:25:18.967	completed
eaa1a941-2dd5-47d2-8254-fac7f9fa8662	ff427e93-1b80-4de8-9694-5a5023a36901	0b97d8bc-ffce-4904-8c46-87752b930f5e	1	45000	\N	0	\N	2026-08-13 09:25:18.967	completed
b30aa8f1-fe15-465d-8a64-388175392065	ff427e93-1b80-4de8-9694-5a5023a36901	308d182c-58a9-47d9-a56a-bba4a473ae24	1	42000	\N	0	\N	2026-08-13 09:25:18.967	completed
39a7bb15-9e49-4b9e-96d0-ef405705f70a	4352a519-dcbf-443f-87c5-256105618b15	cb1888fc-f827-4522-b136-a22bf86816c2	1	35000	\N	0	\N	2026-08-13 09:25:18.975	completed
71c3fc71-4311-4514-b4c3-36b412d2801d	4352a519-dcbf-443f-87c5-256105618b15	faead849-9d7b-4831-b60e-20222fee6c1f	1	48000	\N	0	\N	2026-08-13 09:25:18.975	completed
4a2ad8c4-adcf-4b7b-809c-e702cc3eaac5	4352a519-dcbf-443f-87c5-256105618b15	51c45fec-e0e7-489e-8339-02a536d2e857	2	45000	\N	0	\N	2026-08-13 09:25:18.975	completed
13d065a2-f327-4175-b340-12d7f95211c4	4352a519-dcbf-443f-87c5-256105618b15	cb1888fc-f827-4522-b136-a22bf86816c2	2	35000	\N	0	\N	2026-08-13 09:25:18.975	completed
7374e11c-6007-4131-834c-a24e27414425	7ff107f2-ee7d-44a2-8806-75d6172d4823	83ceb824-bbdc-4b06-a867-037ded0aef0e	4	50000	\N	0	\N	2026-08-13 09:25:18.984	completed
cbf7e99f-c239-481f-bce9-6b29b4bc3fab	7ff107f2-ee7d-44a2-8806-75d6172d4823	d9f1fb87-e737-4210-a5bf-1bc0ba885771	3	42000	\N	0	\N	2026-08-13 09:25:18.984	completed
2631cd12-03e5-495b-8e49-1b101afd4609	7ff107f2-ee7d-44a2-8806-75d6172d4823	2ce5c559-70e1-4bdd-8cf0-fcdf2a843273	1	46000	\N	0	\N	2026-08-13 09:25:18.984	completed
2155f807-6a33-4dab-ab7a-24aa3b65be96	7ff107f2-ee7d-44a2-8806-75d6172d4823	c0917f04-365b-4cdc-9b75-e49a7c492727	3	48000	\N	0	\N	2026-08-13 09:25:18.984	completed
c7f99898-c9ff-4e76-879c-27320c2fd6e9	7ff107f2-ee7d-44a2-8806-75d6172d4823	96531f07-be37-454a-aa0c-4a0eaab99930	2	55000	\N	0	\N	2026-08-13 09:25:18.984	completed
700178e2-adec-488e-8243-e88c8a02c39c	7ff107f2-ee7d-44a2-8806-75d6172d4823	3aac02bc-fcc6-4532-9a50-fa50790dd4cb	4	32000	\N	0	\N	2026-08-13 09:25:18.984	completed
590875e8-cdb6-4c1c-a6f2-08e3c88734f5	7ff107f2-ee7d-44a2-8806-75d6172d4823	cbc78f47-cb0d-4d34-80e1-841ec7b0e5de	4	48000	\N	0	\N	2026-08-13 09:25:18.984	completed
86c21f5a-fbb1-44b1-935e-7a21a2b2f29f	dc10dffb-60d5-4b0c-aabf-0a44f3130fc3	308d182c-58a9-47d9-a56a-bba4a473ae24	4	42000	\N	0	\N	2026-08-13 09:25:18.989	completed
daa08311-5a9c-470d-87ff-4a29b19016ca	dc10dffb-60d5-4b0c-aabf-0a44f3130fc3	c0917f04-365b-4cdc-9b75-e49a7c492727	2	48000	\N	0	\N	2026-08-13 09:25:18.989	completed
e6984695-25bb-4334-9ab4-8a3ab250a67c	dc10dffb-60d5-4b0c-aabf-0a44f3130fc3	2ce5c559-70e1-4bdd-8cf0-fcdf2a843273	3	46000	\N	0	\N	2026-08-13 09:25:18.989	completed
1ca726dd-6493-4b0b-9faf-f79583f857cd	dc10dffb-60d5-4b0c-aabf-0a44f3130fc3	7804beb7-b72c-43db-a27a-82b955e5e31c	3	25000	\N	0	\N	2026-08-13 09:25:18.989	completed
650aea18-394e-49a7-a3f2-c231c7b13c98	6e8de710-72cb-48c5-8f4a-2bdae21c6867	d52c0006-3bcd-48c7-ab83-082061dc6764	2	42000	\N	0	\N	2026-08-13 09:25:18.998	completed
12e03792-1cf1-4060-866f-acd3ccebf74c	6e8de710-72cb-48c5-8f4a-2bdae21c6867	2ce5c559-70e1-4bdd-8cf0-fcdf2a843273	3	46000	\N	0	\N	2026-08-13 09:25:18.998	completed
58c57fbc-b33f-4961-93bc-c25b9064d965	6e8de710-72cb-48c5-8f4a-2bdae21c6867	8f09b4ea-702e-4845-b2c0-59b3bf810d9d	3	38000	\N	0	\N	2026-08-13 09:25:18.998	completed
74e3791a-6c49-499d-b94c-8668d49363e8	8b966b47-66fb-4525-b4be-b3c17e415225	bcff5008-981c-428b-b652-31d8c1378d9f	4	28000	\N	0	\N	2026-08-13 09:25:19.003	completed
a11a3b81-cea0-4779-9567-c8a74ea33dd5	8b966b47-66fb-4525-b4be-b3c17e415225	c9ed90c7-689a-46ab-9fd2-84d017c264af	3	32000	\N	0	\N	2026-08-13 09:25:19.003	completed
c7702895-371c-4a1a-ae4d-cf9fe7ef99f1	8b966b47-66fb-4525-b4be-b3c17e415225	625d086d-e1db-42f3-9cd5-84006fb429c1	4	48000	\N	0	\N	2026-08-13 09:25:19.003	completed
3b9275d4-1ae4-45d8-9fe6-3820c32d91b6	8b966b47-66fb-4525-b4be-b3c17e415225	b429cd3c-c501-4b4a-b028-9ab5feedc41e	4	52000	\N	0	\N	2026-08-13 09:25:19.003	completed
0655db8b-99fe-4046-8828-4107886ea712	8b966b47-66fb-4525-b4be-b3c17e415225	d21a6806-fffa-4462-b33f-2c91a1c6b013	4	50000	\N	0	\N	2026-08-13 09:25:19.003	completed
42729b2a-09d2-4c4c-acf8-9d826b5a30ed	8b966b47-66fb-4525-b4be-b3c17e415225	27af0495-2d91-4cb0-af88-4752edf671dc	1	10000	\N	0	\N	2026-08-13 09:25:19.003	completed
7bb1f0a7-4efe-4d7f-bf8f-572ce1813cec	8b966b47-66fb-4525-b4be-b3c17e415225	d9f1fb87-e737-4210-a5bf-1bc0ba885771	3	42000	\N	0	\N	2026-08-13 09:25:19.003	completed
27db1cf3-63b3-402a-b40b-0ebb666778ab	5a81cf8c-308b-4462-9a3e-9769501d39d9	7484d38a-54a0-49c7-baa2-a93fdce6d347	4	55000	\N	0	\N	2026-08-13 09:25:19.012	completed
1156f947-92f9-4726-820f-b65517a1bda9	5a81cf8c-308b-4462-9a3e-9769501d39d9	b429cd3c-c501-4b4a-b028-9ab5feedc41e	1	52000	\N	0	\N	2026-08-13 09:25:19.012	completed
82f3fc40-cb08-4395-b758-3c8066ecbe4a	5a81cf8c-308b-4462-9a3e-9769501d39d9	e718f02b-b657-444d-89ae-fb910537eb6c	4	42000	\N	0	\N	2026-08-13 09:25:19.012	completed
378ae1a3-d62c-4775-89da-8034ca169208	5a81cf8c-308b-4462-9a3e-9769501d39d9	30ef5deb-6b46-47d1-a98c-8bc060d62b44	3	45000	\N	0	\N	2026-08-13 09:25:19.012	completed
5608133b-7276-43b9-ae78-ca138ed2fe1b	5a81cf8c-308b-4462-9a3e-9769501d39d9	cb1888fc-f827-4522-b136-a22bf86816c2	2	35000	\N	0	\N	2026-08-13 09:25:19.012	completed
bd2917c7-1a56-4ee8-8c25-1bac254770df	5a81cf8c-308b-4462-9a3e-9769501d39d9	f731a039-1a1f-413d-826c-0955bb9eea80	2	55000	\N	0	\N	2026-08-13 09:25:19.012	completed
51c4182c-6486-471d-b1c1-da7f57673811	5a81cf8c-308b-4462-9a3e-9769501d39d9	b429cd3c-c501-4b4a-b028-9ab5feedc41e	1	52000	\N	0	\N	2026-08-13 09:25:19.012	completed
b943df73-6448-4b5d-8b74-04adc95d4395	8b685b57-767b-4d22-a273-f148ffce718a	81d6f3b5-b26a-4dd0-bfca-fea91a42a296	2	35000	\N	0	\N	2026-08-13 09:25:19.022	completed
af6196be-1413-41b3-bed0-b047feed6751	8b685b57-767b-4d22-a273-f148ffce718a	25a8343a-39c3-457e-9c1d-13689bd6469b	3	45000	\N	0	\N	2026-08-13 09:25:19.022	completed
e55d10dd-adf3-448f-a684-3ace9445cf06	8b685b57-767b-4d22-a273-f148ffce718a	daa4bd17-296f-4da1-8d21-15534fa8e045	4	25000	\N	0	\N	2026-08-13 09:25:19.022	completed
ffdeb3d7-c338-428c-a654-212acb4bb2eb	8b685b57-767b-4d22-a273-f148ffce718a	5ba65aef-1f61-4c68-b8c1-d847553c8aef	1	52000	\N	0	\N	2026-08-13 09:25:19.022	completed
9eb8a66c-3d65-4bb2-9a5f-55cbdd170e29	8b685b57-767b-4d22-a273-f148ffce718a	219c20d2-6247-4e8b-a734-53cfbd90ba88	1	52000	\N	0	\N	2026-08-13 09:25:19.022	completed
1e0873c9-7fe6-41b4-bc73-109452870cda	8b685b57-767b-4d22-a273-f148ffce718a	884570a1-2822-4840-a08f-fc4a4a3b5fad	1	48000	\N	0	\N	2026-08-13 09:25:19.022	completed
9c9ad56b-1445-495d-a427-7bd5c7e828ca	4da06741-a80f-47cb-982d-af53e8555803	d849f917-4afe-4a94-8866-03848a938c79	4	35000	\N	0	\N	2026-08-13 09:25:19.031	completed
5f859054-cca9-4893-a96e-728b393c5892	4da06741-a80f-47cb-982d-af53e8555803	d9f1fb87-e737-4210-a5bf-1bc0ba885771	3	42000	\N	0	\N	2026-08-13 09:25:19.031	completed
a0320e3f-f63c-4e34-acdb-b71c906a185d	4da06741-a80f-47cb-982d-af53e8555803	86643a05-ac82-4216-bdf8-87fcd64da8ec	1	48000	\N	0	\N	2026-08-13 09:25:19.031	completed
07d5696a-e7fd-45d0-a47e-5f7c9e74a29e	4da06741-a80f-47cb-982d-af53e8555803	efc81916-6661-422b-826f-c68049339458	1	28000	\N	0	\N	2026-08-13 09:25:19.031	completed
1261030a-5f67-45d7-9272-7177ffb8afea	4da06741-a80f-47cb-982d-af53e8555803	6798927c-bcba-49fd-a7ad-78291c69ac33	3	52000	\N	0	\N	2026-08-13 09:25:19.031	completed
f72b5d89-d1d6-429e-aa7d-2ffa8eee12e6	4da06741-a80f-47cb-982d-af53e8555803	96531f07-be37-454a-aa0c-4a0eaab99930	3	55000	\N	0	\N	2026-08-13 09:25:19.031	completed
aee3c070-2371-4159-9b7d-213f6d8ef459	4da06741-a80f-47cb-982d-af53e8555803	25a8343a-39c3-457e-9c1d-13689bd6469b	4	45000	\N	0	\N	2026-08-13 09:25:19.031	completed
45c4d9e4-63b1-4a69-8f5e-9e1f6b1794fc	4da06741-a80f-47cb-982d-af53e8555803	f731a039-1a1f-413d-826c-0955bb9eea80	3	55000	\N	0	\N	2026-08-13 09:25:19.031	completed
68083fe2-a3e1-4180-ae61-2334372d785f	1de8a285-a307-4256-a1d8-c0da9dd66497	d21a6806-fffa-4462-b33f-2c91a1c6b013	1	50000	\N	0	\N	2026-08-13 09:25:19.037	completed
e758a3c4-f06c-403d-bbb3-8bd3e560bf14	1de8a285-a307-4256-a1d8-c0da9dd66497	0b97d8bc-ffce-4904-8c46-87752b930f5e	3	45000	\N	0	\N	2026-08-13 09:25:19.037	completed
b7e5d5a3-2b6e-405f-ac0c-8c55b10a0460	1de8a285-a307-4256-a1d8-c0da9dd66497	7484d38a-54a0-49c7-baa2-a93fdce6d347	2	55000	\N	0	\N	2026-08-13 09:25:19.037	completed
9ccea0b5-ee91-4058-94a2-436515be9729	41581666-4386-4ee1-83bb-bf7a0fef3991	01d338fc-cbda-492d-b496-2a55e100d813	3	45000	\N	0	\N	2026-08-13 09:25:19.041	completed
c9bd9b68-56bd-4a50-ae88-54a9b8913599	41581666-4386-4ee1-83bb-bf7a0fef3991	ceed2a39-e4e2-486c-b228-a909a81d8487	3	20000	\N	0	\N	2026-08-13 09:25:19.041	completed
32c018a2-0e72-4f18-b34a-1e6aa55f5ca1	41581666-4386-4ee1-83bb-bf7a0fef3991	8f09b4ea-702e-4845-b2c0-59b3bf810d9d	3	38000	\N	0	\N	2026-08-13 09:25:19.041	completed
f6baf108-d96e-45e0-91e2-3c8ce77d45d1	41581666-4386-4ee1-83bb-bf7a0fef3991	a02247ba-a10e-4387-967d-e69a05c8193a	3	32000	\N	0	\N	2026-08-13 09:25:19.041	completed
2378992c-f44c-459f-80f9-bc7d3dc4fba4	41581666-4386-4ee1-83bb-bf7a0fef3991	219c20d2-6247-4e8b-a734-53cfbd90ba88	3	52000	\N	0	\N	2026-08-13 09:25:19.041	completed
face1720-1a72-4a91-9721-8c013410d4bb	41581666-4386-4ee1-83bb-bf7a0fef3991	0b97d8bc-ffce-4904-8c46-87752b930f5e	4	45000	\N	0	\N	2026-08-13 09:25:19.041	completed
91c00a0a-1379-467c-a6dd-0c3c50b87987	41581666-4386-4ee1-83bb-bf7a0fef3991	c24edbc4-7c7a-4228-9b3c-1b95c2be051c	3	48000	\N	0	\N	2026-08-13 09:25:19.041	completed
a572fee9-589b-4a74-92a4-ed09ccacae6a	41581666-4386-4ee1-83bb-bf7a0fef3991	b6a4c689-bce0-4d87-883b-b0de919eba27	4	58000	\N	0	\N	2026-08-13 09:25:19.041	completed
a6d5ea7c-b05b-4d27-9cef-a791ff03e4cf	3f33809f-b10b-44de-99f1-62aa19a5759b	35fbf376-436a-45ea-89a5-41560d3be32b	4	35000	\N	0	\N	2026-08-13 09:25:19.05	completed
a43ebdb2-0aa0-4113-b094-bb296d377c6b	3f33809f-b10b-44de-99f1-62aa19a5759b	e718f02b-b657-444d-89ae-fb910537eb6c	2	42000	\N	0	\N	2026-08-13 09:25:19.05	completed
be236dc3-6d78-4485-8494-f3ddb9ec0be7	3f33809f-b10b-44de-99f1-62aa19a5759b	884570a1-2822-4840-a08f-fc4a4a3b5fad	2	48000	\N	0	\N	2026-08-13 09:25:19.05	completed
b97a1c6a-0654-4a46-b15b-72239de0d270	3f33809f-b10b-44de-99f1-62aa19a5759b	b429cd3c-c501-4b4a-b028-9ab5feedc41e	1	52000	\N	0	\N	2026-08-13 09:25:19.05	completed
bad2aed8-8948-4cd7-9987-1095d928e6b4	3f33809f-b10b-44de-99f1-62aa19a5759b	eb1dae05-cb14-4000-ba10-260f9cd79124	1	45000	\N	0	\N	2026-08-13 09:25:19.05	completed
5adb3f88-a0ef-497d-bfb9-1598af388824	3f33809f-b10b-44de-99f1-62aa19a5759b	803bcdee-17d3-41fc-a249-4e8d16b49575	3	48000	\N	0	\N	2026-08-13 09:25:19.05	completed
3d9ad169-2b0b-4e90-9a57-89ea549c560f	3f33809f-b10b-44de-99f1-62aa19a5759b	a02247ba-a10e-4387-967d-e69a05c8193a	1	32000	\N	0	\N	2026-08-13 09:25:19.05	completed
1a5306e6-fe93-4957-834e-f58103aadeb5	3f33809f-b10b-44de-99f1-62aa19a5759b	e718f02b-b657-444d-89ae-fb910537eb6c	1	42000	\N	0	\N	2026-08-13 09:25:19.05	completed
166fd281-7557-4036-9022-cc05bbca08ba	2b96a09f-dfc3-49ad-983e-705cdf799758	2ce5c559-70e1-4bdd-8cf0-fcdf2a843273	1	46000	\N	0	\N	2026-08-13 09:25:19.055	completed
4f681a30-ea16-417a-8704-b8fe1f9b5e74	2b96a09f-dfc3-49ad-983e-705cdf799758	d52c0006-3bcd-48c7-ab83-082061dc6764	1	42000	\N	0	\N	2026-08-13 09:25:19.055	completed
fc0442c0-a76a-430b-901e-3bab26a2d8aa	2b96a09f-dfc3-49ad-983e-705cdf799758	12b460b3-749d-4ab1-80de-d8f51d5188cc	4	40000	\N	0	\N	2026-08-13 09:25:19.055	completed
219081be-e89e-422b-a8ec-1a160f923cf0	2b96a09f-dfc3-49ad-983e-705cdf799758	5bc34fc9-24c2-4108-af83-5992af2291d6	1	40000	\N	0	\N	2026-08-13 09:25:19.055	completed
4f8ab7c9-72f7-4a8d-ab7b-962e931ce544	2b96a09f-dfc3-49ad-983e-705cdf799758	35fbf376-436a-45ea-89a5-41560d3be32b	4	35000	\N	0	\N	2026-08-13 09:25:19.055	completed
360f2fa4-7a3f-4f0f-a94f-3ae19ef93efd	2b96a09f-dfc3-49ad-983e-705cdf799758	e24a6cc9-1b6e-4ba7-94a5-514f6aa8fe31	3	45000	\N	0	\N	2026-08-13 09:25:19.055	completed
80c41995-8913-402e-be0a-fe9155cc5b2f	2b96a09f-dfc3-49ad-983e-705cdf799758	219c20d2-6247-4e8b-a734-53cfbd90ba88	4	52000	\N	0	\N	2026-08-13 09:25:19.055	completed
5daacb0b-6071-4770-968a-e635baeeeec7	7b6fd967-2195-43e2-b0df-ef6a0188be10	ce6673bb-c51b-4a4f-ab3d-810e44601734	4	28000	\N	0	\N	2026-08-13 09:25:19.066	completed
9b18f278-e99d-485e-a923-43f066a06a5b	7b6fd967-2195-43e2-b0df-ef6a0188be10	3a6ff9b1-cc6c-45ae-9635-ab2b2d03c232	2	38000	\N	0	\N	2026-08-13 09:25:19.066	completed
92f6762d-ef66-47ed-9dd5-24a5c0d59da5	7b6fd967-2195-43e2-b0df-ef6a0188be10	7804beb7-b72c-43db-a27a-82b955e5e31c	3	25000	\N	0	\N	2026-08-13 09:25:19.066	completed
3445129c-c747-4bf5-b956-b76f845c75b3	7b6fd967-2195-43e2-b0df-ef6a0188be10	eaa3fac9-f60f-4db1-b33a-a4bd46e8ea71	1	45000	\N	0	\N	2026-08-13 09:25:19.066	completed
bab990d5-83cc-4a29-866e-b32346e64770	7b6fd967-2195-43e2-b0df-ef6a0188be10	83ceb824-bbdc-4b06-a867-037ded0aef0e	4	50000	\N	0	\N	2026-08-13 09:25:19.066	completed
31b16c56-248d-4a16-a7e0-5d436d33a1aa	7b6fd967-2195-43e2-b0df-ef6a0188be10	219c20d2-6247-4e8b-a734-53cfbd90ba88	3	52000	\N	0	\N	2026-08-13 09:25:19.066	completed
38afbe69-0c4f-4744-a539-c2ecef8903d4	7b6fd967-2195-43e2-b0df-ef6a0188be10	bcff5008-981c-428b-b652-31d8c1378d9f	1	28000	\N	0	\N	2026-08-13 09:25:19.066	completed
1b2495d5-8163-4c82-80cd-d08d1f621e32	2aa05888-bcf5-4c04-b29f-7c8831159ed3	803bcdee-17d3-41fc-a249-4e8d16b49575	1	48000	\N	0	\N	2026-08-13 09:25:19.071	completed
c945acc6-63c8-449d-9146-d08481bd685a	2aa05888-bcf5-4c04-b29f-7c8831159ed3	228cd2ca-0ce1-44ff-92d8-05b7c9480e55	1	42000	\N	0	\N	2026-08-13 09:25:19.071	completed
67588c74-cb14-4984-81f7-26f12c152a4e	2aa05888-bcf5-4c04-b29f-7c8831159ed3	86643a05-ac82-4216-bdf8-87fcd64da8ec	2	48000	\N	0	\N	2026-08-13 09:25:19.071	completed
e8aa5eb4-50dd-49cd-8f38-4429f12b3722	2aa05888-bcf5-4c04-b29f-7c8831159ed3	a02247ba-a10e-4387-967d-e69a05c8193a	2	32000	\N	0	\N	2026-08-13 09:25:19.071	completed
70aa9feb-93bd-4935-9a1e-703868f69ab9	2aa05888-bcf5-4c04-b29f-7c8831159ed3	d9f1fb87-e737-4210-a5bf-1bc0ba885771	3	42000	\N	0	\N	2026-08-13 09:25:19.071	completed
91e56f27-2642-4092-a180-a33767617ea6	2aa05888-bcf5-4c04-b29f-7c8831159ed3	30ef5deb-6b46-47d1-a98c-8bc060d62b44	2	45000	\N	0	\N	2026-08-13 09:25:19.071	completed
1f5a398d-a56b-4a54-b2e0-aed62efb9c88	2aa05888-bcf5-4c04-b29f-7c8831159ed3	6798927c-bcba-49fd-a7ad-78291c69ac33	3	52000	\N	0	\N	2026-08-13 09:25:19.071	completed
20553a54-1a11-4f91-be35-5dc7afbd587b	ccb8d52d-12c3-4b32-84f2-dc60758c8ce2	5ba65aef-1f61-4c68-b8c1-d847553c8aef	2	52000	\N	0	\N	2026-08-13 09:25:19.08	completed
44428015-adc3-40fd-8ec8-d927d6125759	ccb8d52d-12c3-4b32-84f2-dc60758c8ce2	86643a05-ac82-4216-bdf8-87fcd64da8ec	2	48000	\N	0	\N	2026-08-13 09:25:19.08	completed
f1509ac5-c941-4f27-a859-128a9551acf3	ccb8d52d-12c3-4b32-84f2-dc60758c8ce2	884570a1-2822-4840-a08f-fc4a4a3b5fad	1	48000	\N	0	\N	2026-08-13 09:25:19.08	completed
9cc267c6-4ae3-4ba2-87c7-fc5e5d64a261	ccb8d52d-12c3-4b32-84f2-dc60758c8ce2	27af0495-2d91-4cb0-af88-4752edf671dc	1	10000	\N	0	\N	2026-08-13 09:25:19.08	completed
2b17fcbd-6656-4c92-b8ae-a9301a7a49d8	ccb8d52d-12c3-4b32-84f2-dc60758c8ce2	51c45fec-e0e7-489e-8339-02a536d2e857	4	45000	\N	0	\N	2026-08-13 09:25:19.08	completed
59434e1e-7f56-4d25-a44d-f8deeeb52abb	ccb8d52d-12c3-4b32-84f2-dc60758c8ce2	faead849-9d7b-4831-b60e-20222fee6c1f	2	48000	\N	0	\N	2026-08-13 09:25:19.08	completed
f971d794-d531-4c1d-823d-a99c86703204	ccb8d52d-12c3-4b32-84f2-dc60758c8ce2	cbc78f47-cb0d-4d34-80e1-841ec7b0e5de	2	48000	\N	0	\N	2026-08-13 09:25:19.08	completed
f688bab9-042c-49c7-874b-63b40a992fee	ccb8d52d-12c3-4b32-84f2-dc60758c8ce2	e9bd0cdf-4357-4313-8b02-7f8260f6992f	4	52000	\N	0	\N	2026-08-13 09:25:19.08	completed
b65b5eb3-a50a-4556-8d18-66d599aa1841	7b14ecbb-2643-4c44-bdf7-c4167fcdd7b8	81d6f3b5-b26a-4dd0-bfca-fea91a42a296	3	35000	\N	0	\N	2026-08-13 09:25:19.089	completed
72c55313-2f6b-44b8-96aa-846d442050df	7b14ecbb-2643-4c44-bdf7-c4167fcdd7b8	8f09b4ea-702e-4845-b2c0-59b3bf810d9d	1	38000	\N	0	\N	2026-08-13 09:25:19.089	completed
a9bf7403-5f2a-4ef7-84b0-5c7b701984d3	7b14ecbb-2643-4c44-bdf7-c4167fcdd7b8	96531f07-be37-454a-aa0c-4a0eaab99930	3	55000	\N	0	\N	2026-08-13 09:25:19.089	completed
084f5627-9128-4191-a527-46d6a9cc297c	7b14ecbb-2643-4c44-bdf7-c4167fcdd7b8	d849f917-4afe-4a94-8866-03848a938c79	4	35000	\N	0	\N	2026-08-13 09:25:19.089	completed
8815b6a3-779a-4e63-849e-03bef839fe19	7b14ecbb-2643-4c44-bdf7-c4167fcdd7b8	83ff8a95-3eb4-4b98-9978-63aa6d1b8323	1	55000	\N	0	\N	2026-08-13 09:25:19.089	completed
6e37410f-b545-411c-867f-fd54663eaeb2	7b14ecbb-2643-4c44-bdf7-c4167fcdd7b8	b1ee3afc-db38-468c-a4bf-38b51b772024	4	20000	\N	0	\N	2026-08-13 09:25:19.089	completed
1a22a0cb-e2b9-4e85-8cf6-e0b79a8a62e6	7b14ecbb-2643-4c44-bdf7-c4167fcdd7b8	10b0cc63-2c10-44ef-bf34-8d19b7fda2bb	1	55000	\N	0	\N	2026-08-13 09:25:19.089	completed
adb1162d-054c-4dc9-b185-2977d31aa545	bd4ca980-4611-4f53-b0f9-aabcd212325b	b1ee3afc-db38-468c-a4bf-38b51b772024	1	20000	\N	0	\N	2026-08-13 09:25:19.099	completed
f5c09df1-8c7e-4bdc-9ba5-e50180ad2ded	bd4ca980-4611-4f53-b0f9-aabcd212325b	faead849-9d7b-4831-b60e-20222fee6c1f	2	48000	\N	0	\N	2026-08-13 09:25:19.099	completed
204267e3-0a36-429e-8249-7557c6b264aa	bd4ca980-4611-4f53-b0f9-aabcd212325b	c24edbc4-7c7a-4228-9b3c-1b95c2be051c	2	48000	\N	0	\N	2026-08-13 09:25:19.099	completed
56081eb7-f5ad-423a-80c3-b071ac1ee5e2	bd4ca980-4611-4f53-b0f9-aabcd212325b	b429cd3c-c501-4b4a-b028-9ab5feedc41e	1	52000	\N	0	\N	2026-08-13 09:25:19.099	completed
66e2d4cd-828e-4b6e-8602-872b5d907621	bd4ca980-4611-4f53-b0f9-aabcd212325b	81d6f3b5-b26a-4dd0-bfca-fea91a42a296	3	35000	\N	0	\N	2026-08-13 09:25:19.099	completed
73decbfb-0e99-48cd-b5c2-fdb34c057b60	78899d39-5d9e-4d82-8d42-bfba95363075	b6a4c689-bce0-4d87-883b-b0de919eba27	1	58000	\N	0	\N	2026-08-13 09:25:19.107	completed
0f6fdd62-b30f-46cf-b988-1d8c26348bee	78899d39-5d9e-4d82-8d42-bfba95363075	12b460b3-749d-4ab1-80de-d8f51d5188cc	4	40000	\N	0	\N	2026-08-13 09:25:19.107	completed
1279f882-1e3e-46c9-bb82-fd984964761c	78899d39-5d9e-4d82-8d42-bfba95363075	a02247ba-a10e-4387-967d-e69a05c8193a	2	32000	\N	0	\N	2026-08-13 09:25:19.107	completed
e59e0b62-ee27-4d28-b201-8196d5d17928	78899d39-5d9e-4d82-8d42-bfba95363075	faead849-9d7b-4831-b60e-20222fee6c1f	3	48000	\N	0	\N	2026-08-13 09:25:19.107	completed
0bc2f507-9277-43dc-9bd2-a2616750f0d8	78899d39-5d9e-4d82-8d42-bfba95363075	83ceb824-bbdc-4b06-a867-037ded0aef0e	1	50000	\N	0	\N	2026-08-13 09:25:19.107	completed
d6f62283-f1be-48c4-96d4-224976feec80	f97b3b3d-b80d-4357-be08-a3c74836622a	3aac02bc-fcc6-4532-9a50-fa50790dd4cb	4	32000	\N	0	\N	2026-08-13 09:25:19.112	completed
875bd05b-2b00-4611-ace6-370c39c9a637	f97b3b3d-b80d-4357-be08-a3c74836622a	8f09b4ea-702e-4845-b2c0-59b3bf810d9d	1	38000	\N	0	\N	2026-08-13 09:25:19.112	completed
4a239b81-b0b9-4c82-8034-353ed73bf5bb	f97b3b3d-b80d-4357-be08-a3c74836622a	228cd2ca-0ce1-44ff-92d8-05b7c9480e55	2	42000	\N	0	\N	2026-08-13 09:25:19.112	completed
7c269779-0620-4e17-b074-289e91fe362f	f97b3b3d-b80d-4357-be08-a3c74836622a	35fbf376-436a-45ea-89a5-41560d3be32b	3	35000	\N	0	\N	2026-08-13 09:25:19.112	completed
be21bd64-acf5-4485-b675-d82e59899ce3	f97b3b3d-b80d-4357-be08-a3c74836622a	6798927c-bcba-49fd-a7ad-78291c69ac33	1	52000	\N	0	\N	2026-08-13 09:25:19.112	completed
742037bc-0f4a-401b-997b-12e124ebcdb0	f97b3b3d-b80d-4357-be08-a3c74836622a	b429cd3c-c501-4b4a-b028-9ab5feedc41e	3	52000	\N	0	\N	2026-08-13 09:25:19.112	completed
dbc0396c-f640-40f0-8a29-9c094471762d	2bb7505d-0c90-4010-a5e6-be8b757a3a59	51c45fec-e0e7-489e-8339-02a536d2e857	1	45000	\N	0	\N	2026-08-13 09:25:19.116	completed
f76bb9b7-53e7-4af3-bc8a-84efbdbcf24b	2bb7505d-0c90-4010-a5e6-be8b757a3a59	308d182c-58a9-47d9-a56a-bba4a473ae24	3	42000	\N	0	\N	2026-08-13 09:25:19.116	completed
c8ba3741-f189-4a1b-b837-b2a304064cf4	2bb7505d-0c90-4010-a5e6-be8b757a3a59	51c45fec-e0e7-489e-8339-02a536d2e857	2	45000	\N	0	\N	2026-08-13 09:25:19.116	completed
7d14ca1e-a288-413c-b41e-fc54d05690b3	2bb7505d-0c90-4010-a5e6-be8b757a3a59	3aac02bc-fcc6-4532-9a50-fa50790dd4cb	1	32000	\N	0	\N	2026-08-13 09:25:19.116	completed
8881dc35-3933-451d-8404-fd9b06456b60	2bb7505d-0c90-4010-a5e6-be8b757a3a59	6798927c-bcba-49fd-a7ad-78291c69ac33	2	52000	\N	0	\N	2026-08-13 09:25:19.116	completed
1b95154e-9a98-4a59-84d7-5da50d04f92c	74032e6f-baa2-4304-bf00-f3154e1e7afe	a02247ba-a10e-4387-967d-e69a05c8193a	4	32000	\N	0	\N	2026-08-13 09:25:19.125	completed
ccb561c4-138e-468a-b198-f46ec902c417	74032e6f-baa2-4304-bf00-f3154e1e7afe	81d6f3b5-b26a-4dd0-bfca-fea91a42a296	4	35000	\N	0	\N	2026-08-13 09:25:19.125	completed
49f68863-b4b2-4767-9118-834a5d4f5031	74032e6f-baa2-4304-bf00-f3154e1e7afe	8f09b4ea-702e-4845-b2c0-59b3bf810d9d	1	38000	\N	0	\N	2026-08-13 09:25:19.125	completed
f1a44a46-f51c-4838-bef4-882d6bc9badb	74032e6f-baa2-4304-bf00-f3154e1e7afe	daa4bd17-296f-4da1-8d21-15534fa8e045	4	25000	\N	0	\N	2026-08-13 09:25:19.125	completed
de761a5e-3f7a-4581-aeeb-13638cdbfe04	74032e6f-baa2-4304-bf00-f3154e1e7afe	7804beb7-b72c-43db-a27a-82b955e5e31c	4	25000	\N	0	\N	2026-08-13 09:25:19.125	completed
5d1ea4aa-d3ab-4e12-b827-ecf4526697a4	74032e6f-baa2-4304-bf00-f3154e1e7afe	b429cd3c-c501-4b4a-b028-9ab5feedc41e	1	52000	\N	0	\N	2026-08-13 09:25:19.125	completed
58279d0d-fe61-415a-bea9-12643c053dfc	74032e6f-baa2-4304-bf00-f3154e1e7afe	803bcdee-17d3-41fc-a249-4e8d16b49575	3	48000	\N	0	\N	2026-08-13 09:25:19.125	completed
5f510863-4dd1-4910-80cd-ff162b672e3b	d6201aca-0421-4e30-9634-71c653031583	30ef5deb-6b46-47d1-a98c-8bc060d62b44	1	45000	\N	0	\N	2026-08-13 09:25:19.134	completed
5fdd7bb2-7b17-4af6-8c71-dfcf6ce0e0ba	d6201aca-0421-4e30-9634-71c653031583	bcff5008-981c-428b-b652-31d8c1378d9f	4	28000	\N	0	\N	2026-08-13 09:25:19.134	completed
dc85e6d3-f7f9-4db6-bffe-ce679f8886c2	d6201aca-0421-4e30-9634-71c653031583	625d086d-e1db-42f3-9cd5-84006fb429c1	4	48000	\N	0	\N	2026-08-13 09:25:19.134	completed
a80f98f2-d574-47c7-a10a-2072eb11898c	d6201aca-0421-4e30-9634-71c653031583	b6a4c689-bce0-4d87-883b-b0de919eba27	3	58000	\N	0	\N	2026-08-13 09:25:19.134	completed
99222e4c-0449-446b-b2e0-b7e24a17daae	d6201aca-0421-4e30-9634-71c653031583	01d338fc-cbda-492d-b496-2a55e100d813	3	45000	\N	0	\N	2026-08-13 09:25:19.134	completed
ac8d5fb0-457a-47a1-a4e0-b087eb8eec74	d6201aca-0421-4e30-9634-71c653031583	daa4bd17-296f-4da1-8d21-15534fa8e045	1	25000	\N	0	\N	2026-08-13 09:25:19.134	completed
96ec5706-8aa8-4f41-b488-167dc238c415	d6201aca-0421-4e30-9634-71c653031583	f731a039-1a1f-413d-826c-0955bb9eea80	1	55000	\N	0	\N	2026-08-13 09:25:19.134	completed
746d6800-1fb9-4986-96fd-1a748aab4ef8	f5203a1b-51d9-4eb7-aeee-b2b39178e936	b429cd3c-c501-4b4a-b028-9ab5feedc41e	1	52000	\N	0	\N	2026-08-13 09:25:19.144	completed
837ae2b0-8b62-4dc4-9002-41140f7fdb39	f5203a1b-51d9-4eb7-aeee-b2b39178e936	884570a1-2822-4840-a08f-fc4a4a3b5fad	2	48000	\N	0	\N	2026-08-13 09:25:19.144	completed
51552236-9f89-4b6e-853f-70e60bac2b8b	f5203a1b-51d9-4eb7-aeee-b2b39178e936	faead849-9d7b-4831-b60e-20222fee6c1f	1	48000	\N	0	\N	2026-08-13 09:25:19.144	completed
43cc5520-0f1c-4cf7-87a5-0aa3c6bf2e9d	37fb1982-4222-4df4-937c-6fab7141c2ca	96531f07-be37-454a-aa0c-4a0eaab99930	3	55000	\N	0	\N	2026-08-13 09:25:19.154	completed
a72b0f10-b73b-4fc9-9750-be3e4f2432bd	37fb1982-4222-4df4-937c-6fab7141c2ca	01d338fc-cbda-492d-b496-2a55e100d813	2	45000	\N	0	\N	2026-08-13 09:25:19.154	completed
ebb1c14b-d7ab-46cf-9802-0875eadd5470	37fb1982-4222-4df4-937c-6fab7141c2ca	6798927c-bcba-49fd-a7ad-78291c69ac33	2	52000	\N	0	\N	2026-08-13 09:25:19.154	completed
4be14b77-80cb-4141-9564-0b37b951cf3c	37fb1982-4222-4df4-937c-6fab7141c2ca	f731a039-1a1f-413d-826c-0955bb9eea80	2	55000	\N	0	\N	2026-08-13 09:25:19.154	completed
c1d9ee93-df59-4dfd-b6c3-196d350378ad	592f9cd8-fa71-48a8-b45d-0dc5e479b940	30ef5deb-6b46-47d1-a98c-8bc060d62b44	2	45000	\N	0	\N	2026-08-13 09:25:19.162	completed
0dd8ee96-30c4-4690-8045-2c8b58b08257	592f9cd8-fa71-48a8-b45d-0dc5e479b940	d849f917-4afe-4a94-8866-03848a938c79	2	35000	\N	0	\N	2026-08-13 09:25:19.162	completed
75e7aded-4fde-4019-b559-70dd6a395f8e	592f9cd8-fa71-48a8-b45d-0dc5e479b940	3a6ff9b1-cc6c-45ae-9635-ab2b2d03c232	2	38000	\N	0	\N	2026-08-13 09:25:19.162	completed
6f7e4440-7f9d-4564-bf2b-07625b1bb1e2	592f9cd8-fa71-48a8-b45d-0dc5e479b940	00acd18c-4b3a-4737-a36c-530f2c16d3b6	4	38000	\N	0	\N	2026-08-13 09:25:19.162	completed
11bb7bf0-8aaf-4c53-950f-74118fe24f8d	f2541be6-54a3-477e-bcd2-dd6212b931fb	51c45fec-e0e7-489e-8339-02a536d2e857	4	45000	\N	0	\N	2026-08-13 09:25:19.171	completed
886aa806-7493-47d6-b3aa-784a25e2bb78	f2541be6-54a3-477e-bcd2-dd6212b931fb	c9ed90c7-689a-46ab-9fd2-84d017c264af	2	32000	\N	0	\N	2026-08-13 09:25:19.171	completed
18a800d3-a418-4666-8e06-4e34bc769ba0	f2541be6-54a3-477e-bcd2-dd6212b931fb	35fbf376-436a-45ea-89a5-41560d3be32b	4	35000	\N	0	\N	2026-08-13 09:25:19.171	completed
5072ba0d-9518-4f5f-adf3-de8f23548b56	f2541be6-54a3-477e-bcd2-dd6212b931fb	3aac02bc-fcc6-4532-9a50-fa50790dd4cb	3	32000	\N	0	\N	2026-08-13 09:25:19.171	completed
5bf1fefc-f5d2-41ab-aa9b-16c72e2ac4bf	f2541be6-54a3-477e-bcd2-dd6212b931fb	3aac02bc-fcc6-4532-9a50-fa50790dd4cb	1	32000	\N	0	\N	2026-08-13 09:25:19.171	completed
c39f903c-6b04-4575-afab-74053e84d7e5	f2541be6-54a3-477e-bcd2-dd6212b931fb	7484d38a-54a0-49c7-baa2-a93fdce6d347	3	55000	\N	0	\N	2026-08-13 09:25:19.171	completed
4c1a3311-e8cd-4ff8-a4ce-f0117162daac	f2541be6-54a3-477e-bcd2-dd6212b931fb	86643a05-ac82-4216-bdf8-87fcd64da8ec	4	48000	\N	0	\N	2026-08-13 09:25:19.171	completed
4e2383bb-1ba6-47c1-ad1a-140743a741c9	db0db4d1-dbbb-497a-a4b7-47ca2493b29c	27af0495-2d91-4cb0-af88-4752edf671dc	2	10000	\N	0	\N	2026-08-13 09:25:19.18	completed
810306a9-9f3d-4135-936b-b946c1f1c5f4	db0db4d1-dbbb-497a-a4b7-47ca2493b29c	884570a1-2822-4840-a08f-fc4a4a3b5fad	1	48000	\N	0	\N	2026-08-13 09:25:19.18	completed
5047b97c-ac70-478e-af57-fe5f391efdfd	db0db4d1-dbbb-497a-a4b7-47ca2493b29c	81d6f3b5-b26a-4dd0-bfca-fea91a42a296	3	35000	\N	0	\N	2026-08-13 09:25:19.18	completed
62810fe4-662e-4e8f-9440-0db38ab6d54e	b2888206-5391-48a9-b268-1d4938f9586a	ce6673bb-c51b-4a4f-ab3d-810e44601734	1	28000	\N	0	\N	2026-08-13 09:25:19.19	completed
e7c8065c-c1df-48b4-994a-eed489f4ac56	b2888206-5391-48a9-b268-1d4938f9586a	efc81916-6661-422b-826f-c68049339458	1	28000	\N	0	\N	2026-08-13 09:25:19.19	completed
605ed636-e8dc-41a9-82b0-455f01ef5751	b2888206-5391-48a9-b268-1d4938f9586a	acb42a52-c717-441a-824b-8a18079ee46c	2	50000	\N	0	\N	2026-08-13 09:25:19.19	completed
51866e30-4f05-4846-9abe-68174b11ed4c	b2888206-5391-48a9-b268-1d4938f9586a	308d182c-58a9-47d9-a56a-bba4a473ae24	1	42000	\N	0	\N	2026-08-13 09:25:19.19	completed
e16a6635-0526-4966-952c-ebf91610e7e4	b2888206-5391-48a9-b268-1d4938f9586a	8f09b4ea-702e-4845-b2c0-59b3bf810d9d	4	38000	\N	0	\N	2026-08-13 09:25:19.19	completed
da8bacc0-54d3-47fc-8059-755d0a9fece7	b2888206-5391-48a9-b268-1d4938f9586a	51c45fec-e0e7-489e-8339-02a536d2e857	4	45000	\N	0	\N	2026-08-13 09:25:19.19	completed
4f099799-4476-4fe7-a9e2-d703489f4fdc	f9522738-ad22-4f2c-838c-bffcfc797f81	8f09b4ea-702e-4845-b2c0-59b3bf810d9d	4	38000	\N	0	\N	2026-08-13 09:25:19.198	completed
c0126621-0834-49fd-b70d-04702359957b	f9522738-ad22-4f2c-838c-bffcfc797f81	219c20d2-6247-4e8b-a734-53cfbd90ba88	2	52000	\N	0	\N	2026-08-13 09:25:19.198	completed
92e21f71-6c9c-4bf1-b484-07ce8b13da07	f9522738-ad22-4f2c-838c-bffcfc797f81	eb1dae05-cb14-4000-ba10-260f9cd79124	4	45000	\N	0	\N	2026-08-13 09:25:19.198	completed
4275dd49-6ec0-4a1e-b4c9-27df8935224c	f9522738-ad22-4f2c-838c-bffcfc797f81	2ce5c559-70e1-4bdd-8cf0-fcdf2a843273	3	46000	\N	0	\N	2026-08-13 09:25:19.198	completed
0450fb6b-d92f-4b00-9ece-3e2c04f55955	9df77ff6-1631-4680-9c6a-33b312e5a516	884570a1-2822-4840-a08f-fc4a4a3b5fad	4	48000	\N	0	\N	2026-08-13 09:25:19.207	completed
485a7fac-7a30-42c9-8091-88862e52105a	9df77ff6-1631-4680-9c6a-33b312e5a516	acb42a52-c717-441a-824b-8a18079ee46c	3	50000	\N	0	\N	2026-08-13 09:25:19.207	completed
5da354cf-7d73-4b93-86ee-f840fa255cdd	9df77ff6-1631-4680-9c6a-33b312e5a516	d9f1fb87-e737-4210-a5bf-1bc0ba885771	3	42000	\N	0	\N	2026-08-13 09:25:19.207	completed
e2da9c2c-4703-49ab-bf22-d71a6eb23cd1	e47d4258-05ad-455f-ad91-b7ba5af9db3d	8f09b4ea-702e-4845-b2c0-59b3bf810d9d	3	38000	\N	0	\N	2026-08-13 09:25:19.215	completed
00d5f2d8-d715-43d8-85f4-9d4b026f0358	e47d4258-05ad-455f-ad91-b7ba5af9db3d	c0917f04-365b-4cdc-9b75-e49a7c492727	4	48000	\N	0	\N	2026-08-13 09:25:19.215	completed
272f4cbe-e45d-4fff-bbb9-2e1d9c55f777	e47d4258-05ad-455f-ad91-b7ba5af9db3d	ceed2a39-e4e2-486c-b228-a909a81d8487	2	20000	\N	0	\N	2026-08-13 09:25:19.215	completed
b4dd31e0-a44d-4fea-8822-378f25161690	17c6f325-b47e-4732-b4ed-aacb6c85a228	35fbf376-436a-45ea-89a5-41560d3be32b	1	35000	\N	0	\N	2026-08-13 09:25:19.224	completed
313fe1e1-3fe2-44a2-b8db-126c0fecc4a4	17c6f325-b47e-4732-b4ed-aacb6c85a228	e718f02b-b657-444d-89ae-fb910537eb6c	2	42000	\N	0	\N	2026-08-13 09:25:19.224	completed
004f31a2-c4af-467a-bcec-dea68e684f74	17c6f325-b47e-4732-b4ed-aacb6c85a228	a02247ba-a10e-4387-967d-e69a05c8193a	3	32000	\N	0	\N	2026-08-13 09:25:19.224	completed
fc86fdc2-ad3a-4bc5-acec-8db026707860	17c6f325-b47e-4732-b4ed-aacb6c85a228	b1ee3afc-db38-468c-a4bf-38b51b772024	2	20000	\N	0	\N	2026-08-13 09:25:19.224	completed
0f5159ca-c861-403d-ab6b-69b3f9fb2104	0dfcecc6-3d97-47db-8f74-c964bff937b7	12b460b3-749d-4ab1-80de-d8f51d5188cc	1	40000	\N	0	\N	2026-08-13 09:25:19.232	completed
7cf9b9c3-4120-47bf-838d-01145e4a22d6	0dfcecc6-3d97-47db-8f74-c964bff937b7	d52c0006-3bcd-48c7-ab83-082061dc6764	4	42000	\N	0	\N	2026-08-13 09:25:19.232	completed
c3547316-8bd9-4f6e-8510-868b8fab3310	0dfcecc6-3d97-47db-8f74-c964bff937b7	b6a4c689-bce0-4d87-883b-b0de919eba27	4	58000	\N	0	\N	2026-08-13 09:25:19.232	completed
03ee7a5d-136a-4a78-b4fc-4db0a3210dc7	0dfcecc6-3d97-47db-8f74-c964bff937b7	b6a4c689-bce0-4d87-883b-b0de919eba27	4	58000	\N	0	\N	2026-08-13 09:25:19.232	completed
6abe1ddf-5f4e-41c8-8de7-56560e6b1880	b60de131-ff5b-4d59-bbb1-e3764953e16a	d52c0006-3bcd-48c7-ab83-082061dc6764	2	42000	\N	0	\N	2026-08-13 09:25:19.236	completed
ec0c47d2-8e7f-40b1-9f73-2ad6fe195115	b60de131-ff5b-4d59-bbb1-e3764953e16a	96531f07-be37-454a-aa0c-4a0eaab99930	2	55000	\N	0	\N	2026-08-13 09:25:19.236	completed
232ab62a-1595-4d0b-8245-e82d1944a70f	b60de131-ff5b-4d59-bbb1-e3764953e16a	e718f02b-b657-444d-89ae-fb910537eb6c	2	42000	\N	0	\N	2026-08-13 09:25:19.236	completed
08b1a1e5-775d-4fa8-9717-7e534729d981	b60de131-ff5b-4d59-bbb1-e3764953e16a	cbc78f47-cb0d-4d34-80e1-841ec7b0e5de	3	48000	\N	0	\N	2026-08-13 09:25:19.236	completed
3d384b55-8349-4254-8a61-9428ce639dd1	b60de131-ff5b-4d59-bbb1-e3764953e16a	eb1dae05-cb14-4000-ba10-260f9cd79124	3	45000	\N	0	\N	2026-08-13 09:25:19.236	completed
c42034bf-493a-45a5-89c2-5dc946306029	b60de131-ff5b-4d59-bbb1-e3764953e16a	c24edbc4-7c7a-4228-9b3c-1b95c2be051c	2	48000	\N	0	\N	2026-08-13 09:25:19.236	completed
a64509c1-3b0c-4151-a246-f0e06390eeba	e9e9c143-593f-4b2a-894b-0556384f5a73	86643a05-ac82-4216-bdf8-87fcd64da8ec	2	48000	\N	0	\N	2026-08-13 09:25:19.246	completed
d3735563-7cd3-45e5-b366-a84babdc6b9c	e9e9c143-593f-4b2a-894b-0556384f5a73	cbc78f47-cb0d-4d34-80e1-841ec7b0e5de	3	48000	\N	0	\N	2026-08-13 09:25:19.246	completed
099f300e-cf65-496b-9d0d-0fb6e0fe7604	e9e9c143-593f-4b2a-894b-0556384f5a73	bcff5008-981c-428b-b652-31d8c1378d9f	3	28000	\N	0	\N	2026-08-13 09:25:19.246	completed
53c50d84-0c44-494d-9b1a-6e0a8d699a68	e9e9c143-593f-4b2a-894b-0556384f5a73	eaa3fac9-f60f-4db1-b33a-a4bd46e8ea71	3	45000	\N	0	\N	2026-08-13 09:25:19.246	completed
cc1922da-ab22-43c4-858a-c250a5334c76	e9e9c143-593f-4b2a-894b-0556384f5a73	27af0495-2d91-4cb0-af88-4752edf671dc	1	10000	\N	0	\N	2026-08-13 09:25:19.246	completed
3a935019-ca00-4b83-9afe-3b0458a57118	e9e9c143-593f-4b2a-894b-0556384f5a73	803bcdee-17d3-41fc-a249-4e8d16b49575	1	48000	\N	0	\N	2026-08-13 09:25:19.246	completed
b71e6966-9660-42c0-83cf-fdfaab78786a	e9e9c143-593f-4b2a-894b-0556384f5a73	30ef5deb-6b46-47d1-a98c-8bc060d62b44	1	45000	\N	0	\N	2026-08-13 09:25:19.246	completed
4eaa56d0-18b5-4f8a-9dc7-c3c4f637bebe	68902824-11fe-4bbe-86ff-87f46b0a3b61	0b97d8bc-ffce-4904-8c46-87752b930f5e	1	45000	\N	0	\N	2026-08-13 09:25:19.255	completed
1abd26b7-c618-45ff-a9ba-4b671e44163a	68902824-11fe-4bbe-86ff-87f46b0a3b61	efc81916-6661-422b-826f-c68049339458	3	28000	\N	0	\N	2026-08-13 09:25:19.255	completed
51582c87-ffac-4a8e-8088-33043526b61c	68902824-11fe-4bbe-86ff-87f46b0a3b61	35fbf376-436a-45ea-89a5-41560d3be32b	3	35000	\N	0	\N	2026-08-13 09:25:19.255	completed
2dabbc43-77ac-4b46-bea0-745bb2a95003	68902824-11fe-4bbe-86ff-87f46b0a3b61	884570a1-2822-4840-a08f-fc4a4a3b5fad	4	48000	\N	0	\N	2026-08-13 09:25:19.255	completed
ac053c1a-4d69-40d3-8f56-03680a730860	68902824-11fe-4bbe-86ff-87f46b0a3b61	d52c0006-3bcd-48c7-ab83-082061dc6764	3	42000	\N	0	\N	2026-08-13 09:25:19.255	completed
0f39c996-d2a6-46f6-b45a-b75d706f5934	cd30dd1b-56e0-47fc-bba6-0693f477cf0a	10b0cc63-2c10-44ef-bf34-8d19b7fda2bb	2	55000	\N	0	\N	2026-08-13 09:25:19.265	completed
4afa614a-b752-4c04-be08-a8dd3611f9fa	cd30dd1b-56e0-47fc-bba6-0693f477cf0a	c9ed90c7-689a-46ab-9fd2-84d017c264af	2	32000	\N	0	\N	2026-08-13 09:25:19.265	completed
7f1d2880-f9e4-4f9a-a93d-43b45e084d67	cd30dd1b-56e0-47fc-bba6-0693f477cf0a	daa4bd17-296f-4da1-8d21-15534fa8e045	3	25000	\N	0	\N	2026-08-13 09:25:19.265	completed
ac1209e2-e0ba-4a63-a1f8-6f4e746811be	cd30dd1b-56e0-47fc-bba6-0693f477cf0a	5ba65aef-1f61-4c68-b8c1-d847553c8aef	2	52000	\N	0	\N	2026-08-13 09:25:19.265	completed
4c93ad99-9e90-447f-960d-1c49d0c4c5cd	cd30dd1b-56e0-47fc-bba6-0693f477cf0a	faead849-9d7b-4831-b60e-20222fee6c1f	2	48000	\N	0	\N	2026-08-13 09:25:19.265	completed
5fee4322-ecf4-4f84-b8b8-621e151b6e26	cd30dd1b-56e0-47fc-bba6-0693f477cf0a	eaa3fac9-f60f-4db1-b33a-a4bd46e8ea71	4	45000	\N	0	\N	2026-08-13 09:25:19.265	completed
2d55d7de-16ef-41e6-b09f-36c0ad06ad4e	cd30dd1b-56e0-47fc-bba6-0693f477cf0a	51c45fec-e0e7-489e-8339-02a536d2e857	2	45000	\N	0	\N	2026-08-13 09:25:19.265	completed
26bbe83c-8f18-44ed-a949-0e59852cb91b	cd30dd1b-56e0-47fc-bba6-0693f477cf0a	7484d38a-54a0-49c7-baa2-a93fdce6d347	4	55000	\N	0	\N	2026-08-13 09:25:19.265	completed
12217551-9f89-48ae-b413-724afa3d9c28	73088109-3f2b-42f6-ae0a-54db69adae29	228cd2ca-0ce1-44ff-92d8-05b7c9480e55	1	42000	\N	0	\N	2026-08-13 09:25:19.275	completed
296c6ca3-30b1-49e7-892c-0849e0bf9618	73088109-3f2b-42f6-ae0a-54db69adae29	c9ed90c7-689a-46ab-9fd2-84d017c264af	1	32000	\N	0	\N	2026-08-13 09:25:19.275	completed
ee357ef8-14dc-4400-8f12-27654f866c3e	73088109-3f2b-42f6-ae0a-54db69adae29	d21a6806-fffa-4462-b33f-2c91a1c6b013	3	50000	\N	0	\N	2026-08-13 09:25:19.275	completed
2255b98a-a82f-4e48-9e43-fd944ae5fd74	73088109-3f2b-42f6-ae0a-54db69adae29	cb1888fc-f827-4522-b136-a22bf86816c2	1	35000	\N	0	\N	2026-08-13 09:25:19.275	completed
eea78706-2dcb-4b1f-b29b-dabef8063e70	73088109-3f2b-42f6-ae0a-54db69adae29	6798927c-bcba-49fd-a7ad-78291c69ac33	1	52000	\N	0	\N	2026-08-13 09:25:19.275	completed
fc87c857-40a6-48a1-9fa1-79aa447cf3ed	a007311b-ee5d-47a1-9b23-a971160379df	96531f07-be37-454a-aa0c-4a0eaab99930	1	55000	\N	0	\N	2026-08-13 09:25:19.285	completed
ae489f16-d909-4750-bda0-e17f88df996a	a007311b-ee5d-47a1-9b23-a971160379df	cb1888fc-f827-4522-b136-a22bf86816c2	4	35000	\N	0	\N	2026-08-13 09:25:19.285	completed
e8d731ae-9b47-4aae-aba6-73c495f82b2c	a007311b-ee5d-47a1-9b23-a971160379df	803bcdee-17d3-41fc-a249-4e8d16b49575	3	48000	\N	0	\N	2026-08-13 09:25:19.285	completed
1d35d9a1-6c31-4ca2-96ba-e60e0284ebc7	a007311b-ee5d-47a1-9b23-a971160379df	b1ee3afc-db38-468c-a4bf-38b51b772024	2	20000	\N	0	\N	2026-08-13 09:25:19.285	completed
6f91aeb2-d62a-4e7a-9241-f3d0d6e61d84	a007311b-ee5d-47a1-9b23-a971160379df	d21a6806-fffa-4462-b33f-2c91a1c6b013	2	50000	\N	0	\N	2026-08-13 09:25:19.285	completed
e1ecd96a-11dd-4764-a2cd-50abf54761fb	3b1e8995-f511-4457-8c65-9e38bbd980a6	5ba65aef-1f61-4c68-b8c1-d847553c8aef	1	52000	\N	0	\N	2026-08-13 09:25:19.289	completed
07793c87-fd9b-4a7d-b492-5c3c1e413153	3b1e8995-f511-4457-8c65-9e38bbd980a6	d21a6806-fffa-4462-b33f-2c91a1c6b013	1	50000	\N	0	\N	2026-08-13 09:25:19.289	completed
5fe8d865-4965-49e5-9bb0-1afcb316faf9	3b1e8995-f511-4457-8c65-9e38bbd980a6	eaa3fac9-f60f-4db1-b33a-a4bd46e8ea71	3	45000	\N	0	\N	2026-08-13 09:25:19.289	completed
83c358e5-ee44-44cd-bc13-21d84517ced2	0541b15b-18ee-4f77-8c0e-a464ecf829fc	d21a6806-fffa-4462-b33f-2c91a1c6b013	2	50000	\N	0	\N	2026-08-13 09:25:19.294	completed
141a6902-7eb6-42b7-b425-bf0c2cbbc63f	0541b15b-18ee-4f77-8c0e-a464ecf829fc	25a8343a-39c3-457e-9c1d-13689bd6469b	2	45000	\N	0	\N	2026-08-13 09:25:19.294	completed
afe03ce5-6122-46a9-a35c-8f3efd9d0726	0541b15b-18ee-4f77-8c0e-a464ecf829fc	5bc34fc9-24c2-4108-af83-5992af2291d6	2	40000	\N	0	\N	2026-08-13 09:25:19.294	completed
55a0919f-1458-49df-ab4e-2713ea12a977	0541b15b-18ee-4f77-8c0e-a464ecf829fc	81d6f3b5-b26a-4dd0-bfca-fea91a42a296	4	35000	\N	0	\N	2026-08-13 09:25:19.294	completed
e607d09e-3c98-4205-8adb-9e676eee1d9f	0541b15b-18ee-4f77-8c0e-a464ecf829fc	b6a4c689-bce0-4d87-883b-b0de919eba27	4	58000	\N	0	\N	2026-08-13 09:25:19.294	completed
47559c0a-1208-4613-b8e9-c182ece72ee7	9c5eba36-38df-4b8b-9bc5-3b11e1d865d4	eb1dae05-cb14-4000-ba10-260f9cd79124	4	45000	\N	0	\N	2026-08-13 09:25:19.303	completed
7f7b9b09-f8f6-4dca-a744-85a75f11943b	9c5eba36-38df-4b8b-9bc5-3b11e1d865d4	625d086d-e1db-42f3-9cd5-84006fb429c1	4	48000	\N	0	\N	2026-08-13 09:25:19.303	completed
edf48aae-5c8b-4161-90f4-be1ed7877d22	9c5eba36-38df-4b8b-9bc5-3b11e1d865d4	d809adca-e256-41bc-b7b0-75df0d3f5dcb	2	35000	\N	0	\N	2026-08-13 09:25:19.303	completed
f9c998c9-2eea-40ee-bf18-a87c44efb211	9c5eba36-38df-4b8b-9bc5-3b11e1d865d4	30ef5deb-6b46-47d1-a98c-8bc060d62b44	2	45000	\N	0	\N	2026-08-13 09:25:19.303	completed
de9e1496-14c5-4bc3-8c11-40da7cfd8e5f	396bcb7b-a516-4301-a106-107d164245d0	81d6f3b5-b26a-4dd0-bfca-fea91a42a296	3	35000	\N	0	\N	2026-08-13 09:25:19.311	completed
2df8f4a2-efa7-4040-b71c-bf7d8ce51d36	396bcb7b-a516-4301-a106-107d164245d0	803bcdee-17d3-41fc-a249-4e8d16b49575	2	48000	\N	0	\N	2026-08-13 09:25:19.311	completed
53e5ed23-3e8c-416b-8f4b-94aca85c49e6	396bcb7b-a516-4301-a106-107d164245d0	83ff8a95-3eb4-4b98-9978-63aa6d1b8323	2	55000	\N	0	\N	2026-08-13 09:25:19.311	completed
3a4bb7d9-44af-4191-a601-11e6fd1effc8	396bcb7b-a516-4301-a106-107d164245d0	d52c0006-3bcd-48c7-ab83-082061dc6764	2	42000	\N	0	\N	2026-08-13 09:25:19.311	completed
72f19e42-30db-486f-837c-bc46007890a9	396bcb7b-a516-4301-a106-107d164245d0	35fbf376-436a-45ea-89a5-41560d3be32b	2	35000	\N	0	\N	2026-08-13 09:25:19.311	completed
625d67ad-3a3a-45e7-8e90-6599cde9279a	396bcb7b-a516-4301-a106-107d164245d0	83ff8a95-3eb4-4b98-9978-63aa6d1b8323	1	55000	\N	0	\N	2026-08-13 09:25:19.311	completed
849cf094-a2b5-48d1-94f7-09e9fe31015f	396bcb7b-a516-4301-a106-107d164245d0	51c45fec-e0e7-489e-8339-02a536d2e857	2	45000	\N	0	\N	2026-08-13 09:25:19.311	completed
d6a2f050-33ee-42ce-841e-204d9cc6009f	24dec61c-a681-4b5c-8019-f1e56be90a50	35fbf376-436a-45ea-89a5-41560d3be32b	4	35000	\N	0	\N	2026-08-13 09:25:19.32	completed
55878f9d-d1f5-40ae-aeb8-7af81830432e	24dec61c-a681-4b5c-8019-f1e56be90a50	e718f02b-b657-444d-89ae-fb910537eb6c	3	42000	\N	0	\N	2026-08-13 09:25:19.32	completed
dbd1d17a-fbbc-4dd2-ae83-ad858c0506ad	24dec61c-a681-4b5c-8019-f1e56be90a50	625d086d-e1db-42f3-9cd5-84006fb429c1	2	48000	\N	0	\N	2026-08-13 09:25:19.32	completed
98c4e519-7add-4aca-a2ca-98d7e41d1898	6cc7d8e4-9270-46ec-915c-a57ae0ef5b8c	c24edbc4-7c7a-4228-9b3c-1b95c2be051c	3	48000	\N	0	\N	2026-08-13 09:25:19.329	completed
68d42240-d508-4d47-b98d-88850f431ee4	6cc7d8e4-9270-46ec-915c-a57ae0ef5b8c	cb1888fc-f827-4522-b136-a22bf86816c2	3	35000	\N	0	\N	2026-08-13 09:25:19.329	completed
0c70cb10-bef9-4c32-9503-dfb9d5e1b9bc	6cc7d8e4-9270-46ec-915c-a57ae0ef5b8c	2ce5c559-70e1-4bdd-8cf0-fcdf2a843273	3	46000	\N	0	\N	2026-08-13 09:25:19.329	completed
dab86ac4-9377-49df-82e2-670d9291ba25	6cc7d8e4-9270-46ec-915c-a57ae0ef5b8c	625d086d-e1db-42f3-9cd5-84006fb429c1	3	48000	\N	0	\N	2026-08-13 09:25:19.329	completed
e0f33e5a-00c5-4e10-99af-17b6b9014cba	10cdf339-2125-481c-b02f-17e6797861cc	acb42a52-c717-441a-824b-8a18079ee46c	1	50000	\N	0	\N	2026-08-13 09:25:19.333	completed
07322ac2-b4b6-462d-bef9-5869ae0e3b3f	10cdf339-2125-481c-b02f-17e6797861cc	b6a4c689-bce0-4d87-883b-b0de919eba27	1	58000	\N	0	\N	2026-08-13 09:25:19.333	completed
f023740c-b672-4a50-bc33-0346aa0ff8a3	10cdf339-2125-481c-b02f-17e6797861cc	5bc34fc9-24c2-4108-af83-5992af2291d6	4	40000	\N	0	\N	2026-08-13 09:25:19.333	completed
939d9182-c4e9-46f5-9137-cd4eb201aa36	10cdf339-2125-481c-b02f-17e6797861cc	c0917f04-365b-4cdc-9b75-e49a7c492727	3	48000	\N	0	\N	2026-08-13 09:25:19.333	completed
ab2ec747-a43f-4f08-8ceb-b5646cc626c5	663ff5cd-66c4-4bb8-aeb0-53dff5a7436f	faead849-9d7b-4831-b60e-20222fee6c1f	2	48000	\N	0	\N	2026-08-13 09:25:19.338	completed
d529ab91-59b1-4004-9699-457d16c3c8ec	663ff5cd-66c4-4bb8-aeb0-53dff5a7436f	884570a1-2822-4840-a08f-fc4a4a3b5fad	1	48000	\N	0	\N	2026-08-13 09:25:19.338	completed
47571b10-aa03-41b3-97a7-e9ca2bff0672	663ff5cd-66c4-4bb8-aeb0-53dff5a7436f	308d182c-58a9-47d9-a56a-bba4a473ae24	3	42000	\N	0	\N	2026-08-13 09:25:19.338	completed
67531ade-2d3c-42f8-8c6e-fc8e46430677	663ff5cd-66c4-4bb8-aeb0-53dff5a7436f	c9ed90c7-689a-46ab-9fd2-84d017c264af	4	32000	\N	0	\N	2026-08-13 09:25:19.338	completed
77faa141-0068-4c98-b3aa-94d1985c0c51	663ff5cd-66c4-4bb8-aeb0-53dff5a7436f	7484d38a-54a0-49c7-baa2-a93fdce6d347	3	55000	\N	0	\N	2026-08-13 09:25:19.338	completed
9aab75b2-1ed2-48e0-af5e-91f04637d55f	3b5e4fad-3079-40da-8173-0b4065fecbf5	00acd18c-4b3a-4737-a36c-530f2c16d3b6	2	38000	\N	0	\N	2026-08-13 09:25:19.348	completed
2fab9351-db21-4a8f-a56c-c9da7843775c	3b5e4fad-3079-40da-8173-0b4065fecbf5	faead849-9d7b-4831-b60e-20222fee6c1f	4	48000	\N	0	\N	2026-08-13 09:25:19.348	completed
10de940e-2042-41d7-af1f-4cad4cd55156	3b5e4fad-3079-40da-8173-0b4065fecbf5	d849f917-4afe-4a94-8866-03848a938c79	4	35000	\N	0	\N	2026-08-13 09:25:19.348	completed
57ee0f5f-062d-4997-9dfd-264095f3ac53	b375c368-cbae-4d53-9f9e-a3a797e6fa4a	e24a6cc9-1b6e-4ba7-94a5-514f6aa8fe31	1	45000	\N	0	\N	2026-08-13 09:25:19.356	completed
78779956-3ffc-40ac-9f22-1e44506fabe5	b375c368-cbae-4d53-9f9e-a3a797e6fa4a	803bcdee-17d3-41fc-a249-4e8d16b49575	1	48000	\N	0	\N	2026-08-13 09:25:19.356	completed
0798dfce-cfed-4899-ac48-9944296cdbf5	b375c368-cbae-4d53-9f9e-a3a797e6fa4a	51c45fec-e0e7-489e-8339-02a536d2e857	3	45000	\N	0	\N	2026-08-13 09:25:19.356	completed
88e0159e-b5a1-46e5-bd50-c766ae65cf05	b375c368-cbae-4d53-9f9e-a3a797e6fa4a	10b0cc63-2c10-44ef-bf34-8d19b7fda2bb	2	55000	\N	0	\N	2026-08-13 09:25:19.356	completed
20b35f5e-dd0f-438a-b973-40b75a4695f9	d0962c34-8b32-463c-b56c-86e72bcc6061	7804beb7-b72c-43db-a27a-82b955e5e31c	1	25000	\N	0	\N	2026-08-13 09:25:19.364	completed
da165174-b7b8-4e5b-b3da-4b3611097363	d0962c34-8b32-463c-b56c-86e72bcc6061	7804beb7-b72c-43db-a27a-82b955e5e31c	2	25000	\N	0	\N	2026-08-13 09:25:19.364	completed
083e70b5-3393-4839-b293-1054be08e84c	d0962c34-8b32-463c-b56c-86e72bcc6061	eaa3fac9-f60f-4db1-b33a-a4bd46e8ea71	4	45000	\N	0	\N	2026-08-13 09:25:19.364	completed
6058f772-2dde-45b4-beef-b6bdba9c97d8	d0962c34-8b32-463c-b56c-86e72bcc6061	b6a4c689-bce0-4d87-883b-b0de919eba27	3	58000	\N	0	\N	2026-08-13 09:25:19.364	completed
21b8cbad-18e2-42b9-a665-2a5775184bc2	d0962c34-8b32-463c-b56c-86e72bcc6061	7484d38a-54a0-49c7-baa2-a93fdce6d347	4	55000	\N	0	\N	2026-08-13 09:25:19.364	completed
3dd6e156-108a-4937-86d4-b401e5b7f63c	3ee1adc0-e0a2-4e79-beb4-aef13b68c141	d849f917-4afe-4a94-8866-03848a938c79	2	35000	\N	0	\N	2026-08-13 09:25:19.373	completed
c37d2415-72bc-46c8-9e1e-13ddb5c6f973	3ee1adc0-e0a2-4e79-beb4-aef13b68c141	c24edbc4-7c7a-4228-9b3c-1b95c2be051c	2	48000	\N	0	\N	2026-08-13 09:25:19.373	completed
ef63ca8f-15aa-47be-81d5-2269fc127e3e	3ee1adc0-e0a2-4e79-beb4-aef13b68c141	e9bd0cdf-4357-4313-8b02-7f8260f6992f	4	52000	\N	0	\N	2026-08-13 09:25:19.373	completed
1ddc3a38-4636-47fb-80c6-165b44c371ad	3ee1adc0-e0a2-4e79-beb4-aef13b68c141	b429cd3c-c501-4b4a-b028-9ab5feedc41e	1	52000	\N	0	\N	2026-08-13 09:25:19.373	completed
23224956-a89a-4313-8b3b-a432566d22bc	3ee1adc0-e0a2-4e79-beb4-aef13b68c141	c24edbc4-7c7a-4228-9b3c-1b95c2be051c	3	48000	\N	0	\N	2026-08-13 09:25:19.373	completed
6a363f3e-e5eb-47b9-979f-326b232778c2	ab042b1f-3612-4d79-9985-75a5c3aef8f1	e9bd0cdf-4357-4313-8b02-7f8260f6992f	2	52000	\N	0	\N	2026-08-13 09:25:19.377	completed
aed3aa79-9e2a-43d3-b5b1-2da45371d1cd	ab042b1f-3612-4d79-9985-75a5c3aef8f1	c0917f04-365b-4cdc-9b75-e49a7c492727	1	48000	\N	0	\N	2026-08-13 09:25:19.377	completed
be211e8a-97da-4347-ab81-b502285acb33	ab042b1f-3612-4d79-9985-75a5c3aef8f1	cb1888fc-f827-4522-b136-a22bf86816c2	4	35000	\N	0	\N	2026-08-13 09:25:19.377	completed
9198b544-8e3a-48b5-8435-38be36555958	ab042b1f-3612-4d79-9985-75a5c3aef8f1	83ceb824-bbdc-4b06-a867-037ded0aef0e	3	50000	\N	0	\N	2026-08-13 09:25:19.377	completed
4d947a8d-33bc-4780-9b91-e4ad64923e0b	ab042b1f-3612-4d79-9985-75a5c3aef8f1	e718f02b-b657-444d-89ae-fb910537eb6c	4	42000	\N	0	\N	2026-08-13 09:25:19.377	completed
ca758973-24f5-48b4-8da1-32e661830eec	ab042b1f-3612-4d79-9985-75a5c3aef8f1	d9f1fb87-e737-4210-a5bf-1bc0ba885771	2	42000	\N	0	\N	2026-08-13 09:25:19.377	completed
863dcd03-b295-43d1-b298-5f05e50a5345	ab042b1f-3612-4d79-9985-75a5c3aef8f1	efc81916-6661-422b-826f-c68049339458	2	28000	\N	0	\N	2026-08-13 09:25:19.377	completed
552806cd-3642-419f-a396-1eb6e52db16b	ab042b1f-3612-4d79-9985-75a5c3aef8f1	96531f07-be37-454a-aa0c-4a0eaab99930	1	55000	\N	0	\N	2026-08-13 09:25:19.377	completed
4f49b711-38f3-465f-9bd4-ddba7a14fb36	5f8a6718-0c35-4322-9c72-3a2e1be5633f	cbc78f47-cb0d-4d34-80e1-841ec7b0e5de	3	48000	\N	0	\N	2026-08-13 09:25:19.387	completed
8ffb7291-e7df-4db3-b309-c914037e6d38	5f8a6718-0c35-4322-9c72-3a2e1be5633f	acb42a52-c717-441a-824b-8a18079ee46c	2	50000	\N	0	\N	2026-08-13 09:25:19.387	completed
ada6efca-4312-46fb-b576-75a299bf176a	5f8a6718-0c35-4322-9c72-3a2e1be5633f	5ba65aef-1f61-4c68-b8c1-d847553c8aef	3	52000	\N	0	\N	2026-08-13 09:25:19.387	completed
cdbdc8e7-5e23-4764-96c4-295504cd551f	37a8a7ce-810f-45be-8be6-1cae0312a32d	ceed2a39-e4e2-486c-b228-a909a81d8487	1	20000	\N	0	\N	2026-08-13 09:25:19.391	completed
82afbe8c-a861-46ca-8c84-f0e7152248e2	37a8a7ce-810f-45be-8be6-1cae0312a32d	0b97d8bc-ffce-4904-8c46-87752b930f5e	1	45000	\N	0	\N	2026-08-13 09:25:19.391	completed
a0115352-0ee6-493c-bfc5-b2577d3ffbad	37a8a7ce-810f-45be-8be6-1cae0312a32d	eaa3fac9-f60f-4db1-b33a-a4bd46e8ea71	4	45000	\N	0	\N	2026-08-13 09:25:19.391	completed
8826aa39-9826-40db-9155-6f7601d9e04b	37a8a7ce-810f-45be-8be6-1cae0312a32d	e9bd0cdf-4357-4313-8b02-7f8260f6992f	2	52000	\N	0	\N	2026-08-13 09:25:19.391	completed
dff7a7ec-0094-40e4-8661-39daf6e2bbab	a6fcce19-1fa7-4b14-93a8-dcc336a2c7d8	7484d38a-54a0-49c7-baa2-a93fdce6d347	2	55000	\N	0	\N	2026-08-13 09:25:19.401	completed
e1d41525-d48c-42e8-9737-385906792c19	a6fcce19-1fa7-4b14-93a8-dcc336a2c7d8	e9bd0cdf-4357-4313-8b02-7f8260f6992f	2	52000	\N	0	\N	2026-08-13 09:25:19.401	completed
113befd6-1b77-4bbe-8a63-75ba3e9c8456	a6fcce19-1fa7-4b14-93a8-dcc336a2c7d8	eaa3fac9-f60f-4db1-b33a-a4bd46e8ea71	4	45000	\N	0	\N	2026-08-13 09:25:19.401	completed
56aa4fb0-9008-4e37-b5f5-b17049e4dc54	a6fcce19-1fa7-4b14-93a8-dcc336a2c7d8	2ce5c559-70e1-4bdd-8cf0-fcdf2a843273	1	46000	\N	0	\N	2026-08-13 09:25:19.401	completed
798d08d1-212c-4fa2-841d-3a3c1706c62c	a6fcce19-1fa7-4b14-93a8-dcc336a2c7d8	51c45fec-e0e7-489e-8339-02a536d2e857	3	45000	\N	0	\N	2026-08-13 09:25:19.401	completed
81f00e4a-6883-4797-adf7-71da9fcd9f2e	a6fcce19-1fa7-4b14-93a8-dcc336a2c7d8	acb42a52-c717-441a-824b-8a18079ee46c	1	50000	\N	0	\N	2026-08-13 09:25:19.401	completed
27aabe59-d9f8-4e87-a53f-62c9b8e50c6c	a6fcce19-1fa7-4b14-93a8-dcc336a2c7d8	51c45fec-e0e7-489e-8339-02a536d2e857	2	45000	\N	0	\N	2026-08-13 09:25:19.401	completed
a8aadfda-89cf-40fe-b83a-c5e948087cb7	35d9086d-a2dc-4ada-b970-c2c1a7fdcc9b	51c45fec-e0e7-489e-8339-02a536d2e857	2	45000	\N	0	\N	2026-08-13 09:25:19.41	completed
69b6fee1-450c-4b49-bdcf-5e6fcf0a5584	35d9086d-a2dc-4ada-b970-c2c1a7fdcc9b	30ef5deb-6b46-47d1-a98c-8bc060d62b44	4	45000	\N	0	\N	2026-08-13 09:25:19.41	completed
7b7afade-0ff4-4d44-a37f-930daefa45fb	35d9086d-a2dc-4ada-b970-c2c1a7fdcc9b	7804beb7-b72c-43db-a27a-82b955e5e31c	4	25000	\N	0	\N	2026-08-13 09:25:19.41	completed
32b26373-4e64-4068-a6e9-35e1436ecdca	87a21a43-a202-4795-9066-bb6d03e2a9bc	cb1888fc-f827-4522-b136-a22bf86816c2	3	35000	\N	0	\N	2026-08-13 09:25:19.415	completed
5621560a-eb82-4a5a-87fd-90b311047c3c	87a21a43-a202-4795-9066-bb6d03e2a9bc	5ba65aef-1f61-4c68-b8c1-d847553c8aef	1	52000	\N	0	\N	2026-08-13 09:25:19.415	completed
4e4f62e5-8dc2-4736-a68a-80831c9853bf	87a21a43-a202-4795-9066-bb6d03e2a9bc	308d182c-58a9-47d9-a56a-bba4a473ae24	2	42000	\N	0	\N	2026-08-13 09:25:19.415	completed
f0fb7a80-8bf0-40e2-a3c5-b00366d9c2f5	87a21a43-a202-4795-9066-bb6d03e2a9bc	27af0495-2d91-4cb0-af88-4752edf671dc	2	10000	\N	0	\N	2026-08-13 09:25:19.415	completed
752ea51e-fddc-4287-8d80-45434f3b9c0a	87a21a43-a202-4795-9066-bb6d03e2a9bc	c0917f04-365b-4cdc-9b75-e49a7c492727	2	48000	\N	0	\N	2026-08-13 09:25:19.415	completed
0a0f937c-c6d6-45de-96d3-2ae12aec2ea2	87a21a43-a202-4795-9066-bb6d03e2a9bc	51c45fec-e0e7-489e-8339-02a536d2e857	1	45000	\N	0	\N	2026-08-13 09:25:19.415	completed
816c2c04-c562-4c3c-9150-ef2f5b189075	87a21a43-a202-4795-9066-bb6d03e2a9bc	bcff5008-981c-428b-b652-31d8c1378d9f	3	28000	\N	0	\N	2026-08-13 09:25:19.415	completed
5ede09a7-c2e0-4048-af4a-ba9aacf8026a	a1a3e923-3a20-44ec-87b9-09609829e517	96531f07-be37-454a-aa0c-4a0eaab99930	4	55000	\N	0	\N	2026-08-13 09:25:19.425	completed
be7a3719-9371-46e8-a8b8-4b70fd8577d9	a1a3e923-3a20-44ec-87b9-09609829e517	d52c0006-3bcd-48c7-ab83-082061dc6764	4	42000	\N	0	\N	2026-08-13 09:25:19.425	completed
205d49f5-ac1d-4464-af64-dcfdcdd69839	a1a3e923-3a20-44ec-87b9-09609829e517	10b0cc63-2c10-44ef-bf34-8d19b7fda2bb	1	55000	\N	0	\N	2026-08-13 09:25:19.425	completed
2526a1e9-714a-452e-a6bb-302fb966e495	a1a3e923-3a20-44ec-87b9-09609829e517	5bc34fc9-24c2-4108-af83-5992af2291d6	4	40000	\N	0	\N	2026-08-13 09:25:19.425	completed
3675be04-559d-429a-ae21-b953644ca1bb	a1a3e923-3a20-44ec-87b9-09609829e517	7484d38a-54a0-49c7-baa2-a93fdce6d347	2	55000	\N	0	\N	2026-08-13 09:25:19.425	completed
e836db00-eaf6-4638-be09-f7140fdca623	a1a3e923-3a20-44ec-87b9-09609829e517	ceed2a39-e4e2-486c-b228-a909a81d8487	4	20000	\N	0	\N	2026-08-13 09:25:19.425	completed
213926c6-0cd2-4f32-8cb3-a758c208ce49	a1a3e923-3a20-44ec-87b9-09609829e517	308d182c-58a9-47d9-a56a-bba4a473ae24	1	42000	\N	0	\N	2026-08-13 09:25:19.425	completed
d33da29d-8eb4-4d8c-8d49-46e3f6392d84	9cd0e83e-a889-4e13-9c29-56a6c16974da	35fbf376-436a-45ea-89a5-41560d3be32b	3	35000	\N	0	\N	2026-08-13 09:25:19.434	completed
255b0e0c-986a-493a-8f27-f92660a6b758	9cd0e83e-a889-4e13-9c29-56a6c16974da	daa4bd17-296f-4da1-8d21-15534fa8e045	3	25000	\N	0	\N	2026-08-13 09:25:19.434	completed
5cffb273-124c-40c6-b01c-89847a5f752e	9cd0e83e-a889-4e13-9c29-56a6c16974da	27af0495-2d91-4cb0-af88-4752edf671dc	3	10000	\N	0	\N	2026-08-13 09:25:19.434	completed
8cc4b77b-198d-442b-bcd5-0a35a86277a8	9cd0e83e-a889-4e13-9c29-56a6c16974da	ceed2a39-e4e2-486c-b228-a909a81d8487	4	20000	\N	0	\N	2026-08-13 09:25:19.434	completed
21e251a6-c3a0-42a5-a819-43bd2043a4e2	9cd0e83e-a889-4e13-9c29-56a6c16974da	00acd18c-4b3a-4737-a36c-530f2c16d3b6	3	38000	\N	0	\N	2026-08-13 09:25:19.434	completed
1de36e81-e83c-432f-b4ea-af22612ac3f8	9cd0e83e-a889-4e13-9c29-56a6c16974da	3a6ff9b1-cc6c-45ae-9635-ab2b2d03c232	2	38000	\N	0	\N	2026-08-13 09:25:19.434	completed
3c9ab1b4-740e-417d-b64c-271c1e106a71	9cd0e83e-a889-4e13-9c29-56a6c16974da	308d182c-58a9-47d9-a56a-bba4a473ae24	3	42000	\N	0	\N	2026-08-13 09:25:19.434	completed
f869e068-459e-4925-85be-d4170c346b28	ba7b8b52-41a3-4ec1-9c8a-feb525009a5e	51c45fec-e0e7-489e-8339-02a536d2e857	2	45000	\N	0	\N	2026-08-13 09:25:19.44	completed
ee760628-b8b0-4a96-8287-7baa8450d144	ba7b8b52-41a3-4ec1-9c8a-feb525009a5e	c9ed90c7-689a-46ab-9fd2-84d017c264af	1	32000	\N	0	\N	2026-08-13 09:25:19.44	completed
02a26aca-af86-4e1c-927c-2d3dfcb3662e	ba7b8b52-41a3-4ec1-9c8a-feb525009a5e	83ceb824-bbdc-4b06-a867-037ded0aef0e	1	50000	\N	0	\N	2026-08-13 09:25:19.44	completed
b2a91b83-8af1-4a84-85e5-2db2ec489caf	ba7b8b52-41a3-4ec1-9c8a-feb525009a5e	6798927c-bcba-49fd-a7ad-78291c69ac33	1	52000	\N	0	\N	2026-08-13 09:25:19.44	completed
6faa80db-753e-49a4-a457-81b478092b61	ba7b8b52-41a3-4ec1-9c8a-feb525009a5e	f731a039-1a1f-413d-826c-0955bb9eea80	2	55000	\N	0	\N	2026-08-13 09:25:19.44	completed
18ee5e6f-b05a-46fa-9053-e59bfd4aad71	ba7b8b52-41a3-4ec1-9c8a-feb525009a5e	5ba65aef-1f61-4c68-b8c1-d847553c8aef	3	52000	\N	0	\N	2026-08-13 09:25:19.44	completed
02874ac4-6a82-4808-8156-cb72b3eb6809	ba7b8b52-41a3-4ec1-9c8a-feb525009a5e	803bcdee-17d3-41fc-a249-4e8d16b49575	4	48000	\N	0	\N	2026-08-13 09:25:19.44	completed
6a760c2c-1a28-4b1d-bb19-190d1b6214c5	ba7b8b52-41a3-4ec1-9c8a-feb525009a5e	228cd2ca-0ce1-44ff-92d8-05b7c9480e55	4	42000	\N	0	\N	2026-08-13 09:25:19.44	completed
b6b3fa2f-f7a4-4fbd-9a1d-9e4b8ac6d00a	37b6ad73-8927-4c59-868a-a959485969c9	8f09b4ea-702e-4845-b2c0-59b3bf810d9d	2	38000	\N	0	\N	2026-08-13 09:25:19.451	completed
886974a8-d965-4d17-b17e-93efb532ee31	37b6ad73-8927-4c59-868a-a959485969c9	b429cd3c-c501-4b4a-b028-9ab5feedc41e	2	52000	\N	0	\N	2026-08-13 09:25:19.451	completed
0fe246ad-90e9-489c-85d1-e083ae953a3c	37b6ad73-8927-4c59-868a-a959485969c9	83ceb824-bbdc-4b06-a867-037ded0aef0e	4	50000	\N	0	\N	2026-08-13 09:25:19.451	completed
b0f0d923-9a8d-4cd3-9905-57691f23b8b0	37b6ad73-8927-4c59-868a-a959485969c9	625d086d-e1db-42f3-9cd5-84006fb429c1	4	48000	\N	0	\N	2026-08-13 09:25:19.451	completed
1a8227eb-45a7-44fb-862c-9a988424302b	37b6ad73-8927-4c59-868a-a959485969c9	27af0495-2d91-4cb0-af88-4752edf671dc	2	10000	\N	0	\N	2026-08-13 09:25:19.451	completed
1882e838-042d-4926-9679-821fb28bd178	37b6ad73-8927-4c59-868a-a959485969c9	6798927c-bcba-49fd-a7ad-78291c69ac33	2	52000	\N	0	\N	2026-08-13 09:25:19.451	completed
6ec6cec7-1bc4-424f-9e56-cd5ec12a0670	37b6ad73-8927-4c59-868a-a959485969c9	b429cd3c-c501-4b4a-b028-9ab5feedc41e	2	52000	\N	0	\N	2026-08-13 09:25:19.451	completed
0ec02926-b392-4e67-a939-d12209f2f62f	7d679829-9202-4192-acb2-997c7261ed1d	81d6f3b5-b26a-4dd0-bfca-fea91a42a296	1	35000	\N	0	\N	2026-08-13 09:25:19.458	completed
aa976874-34f1-493d-9523-7c37b65282da	7d679829-9202-4192-acb2-997c7261ed1d	c0917f04-365b-4cdc-9b75-e49a7c492727	1	48000	\N	0	\N	2026-08-13 09:25:19.458	completed
136ca98b-4a23-4ef4-ba2c-d945aa3145ce	7d679829-9202-4192-acb2-997c7261ed1d	ce6673bb-c51b-4a4f-ab3d-810e44601734	3	28000	\N	0	\N	2026-08-13 09:25:19.458	completed
8e08e5ca-049b-426b-b499-52d55dfd8e2f	7d679829-9202-4192-acb2-997c7261ed1d	27af0495-2d91-4cb0-af88-4752edf671dc	2	10000	\N	0	\N	2026-08-13 09:25:19.458	completed
e3eba8b5-7be3-4123-baf5-d80cd9b125e5	7d679829-9202-4192-acb2-997c7261ed1d	3aac02bc-fcc6-4532-9a50-fa50790dd4cb	2	32000	\N	0	\N	2026-08-13 09:25:19.458	completed
322f8d5b-9a59-4d4c-b1fe-cb44fa1f6264	7d679829-9202-4192-acb2-997c7261ed1d	96531f07-be37-454a-aa0c-4a0eaab99930	3	55000	\N	0	\N	2026-08-13 09:25:19.458	completed
64163714-289b-437d-a7e4-4570fdbe51a2	7d679829-9202-4192-acb2-997c7261ed1d	c9ed90c7-689a-46ab-9fd2-84d017c264af	4	32000	\N	0	\N	2026-08-13 09:25:19.458	completed
36a18754-3690-4108-87e8-3c5e057aa896	7bd3791c-a45a-4ff8-be48-1d5bfba49919	5ba65aef-1f61-4c68-b8c1-d847553c8aef	3	52000	\N	0	\N	2026-08-13 09:25:19.469	completed
dd42a782-1019-4a3d-be92-a3aff42a5bec	7bd3791c-a45a-4ff8-be48-1d5bfba49919	e718f02b-b657-444d-89ae-fb910537eb6c	1	42000	\N	0	\N	2026-08-13 09:25:19.469	completed
85f024ac-1e91-4c7e-9f46-9981d1c2ebe3	7bd3791c-a45a-4ff8-be48-1d5bfba49919	8f09b4ea-702e-4845-b2c0-59b3bf810d9d	3	38000	\N	0	\N	2026-08-13 09:25:19.469	completed
bf248f6b-c1f6-436a-ae67-71670e5eb0c0	7bd3791c-a45a-4ff8-be48-1d5bfba49919	eaa3fac9-f60f-4db1-b33a-a4bd46e8ea71	1	45000	\N	0	\N	2026-08-13 09:25:19.469	completed
c6a24bc7-9eb5-4286-a7f5-f89850d1190e	7bd3791c-a45a-4ff8-be48-1d5bfba49919	e718f02b-b657-444d-89ae-fb910537eb6c	3	42000	\N	0	\N	2026-08-13 09:25:19.469	completed
bb44a80d-3c21-4fa7-b68b-4704775eb9f5	7bd3791c-a45a-4ff8-be48-1d5bfba49919	12b460b3-749d-4ab1-80de-d8f51d5188cc	4	40000	\N	0	\N	2026-08-13 09:25:19.469	completed
2cc89d19-8835-4100-8621-b9a8ee5ec236	7bd3791c-a45a-4ff8-be48-1d5bfba49919	cb1888fc-f827-4522-b136-a22bf86816c2	1	35000	\N	0	\N	2026-08-13 09:25:19.469	completed
bc12689f-7c16-45c9-8170-64f2c00193d0	0743541b-0a68-42ae-a0ea-3bd1c6e329eb	8f09b4ea-702e-4845-b2c0-59b3bf810d9d	3	38000	\N	0	\N	2026-08-13 09:25:19.481	completed
a5fb9db2-4741-4aee-b846-c8d44c98ff26	0743541b-0a68-42ae-a0ea-3bd1c6e329eb	12b460b3-749d-4ab1-80de-d8f51d5188cc	4	40000	\N	0	\N	2026-08-13 09:25:19.481	completed
afa088a5-aea7-4ede-8091-9939cd433307	0743541b-0a68-42ae-a0ea-3bd1c6e329eb	6798927c-bcba-49fd-a7ad-78291c69ac33	4	52000	\N	0	\N	2026-08-13 09:25:19.481	completed
7cf58e83-fd5d-418f-af3e-34149d99c5f1	0743541b-0a68-42ae-a0ea-3bd1c6e329eb	83ceb824-bbdc-4b06-a867-037ded0aef0e	3	50000	\N	0	\N	2026-08-13 09:25:19.481	completed
12c77d03-0967-4866-8457-41db528b43ee	0743541b-0a68-42ae-a0ea-3bd1c6e329eb	eb1dae05-cb14-4000-ba10-260f9cd79124	3	45000	\N	0	\N	2026-08-13 09:25:19.481	completed
a144a590-68c0-4735-b537-7d57d0d6e058	0743541b-0a68-42ae-a0ea-3bd1c6e329eb	f731a039-1a1f-413d-826c-0955bb9eea80	1	55000	\N	0	\N	2026-08-13 09:25:19.481	completed
086a0519-e218-4747-9fbc-d7e5830c9522	0743541b-0a68-42ae-a0ea-3bd1c6e329eb	803bcdee-17d3-41fc-a249-4e8d16b49575	3	48000	\N	0	\N	2026-08-13 09:25:19.481	completed
a741cb80-f19d-4867-b919-d84bfb7176d4	0743541b-0a68-42ae-a0ea-3bd1c6e329eb	bcff5008-981c-428b-b652-31d8c1378d9f	2	28000	\N	0	\N	2026-08-13 09:25:19.481	completed
f8fd9b95-785f-4589-9748-d651529fdbe1	7d4bf4f3-8b38-48b5-9c9f-ca4ae844f130	d21a6806-fffa-4462-b33f-2c91a1c6b013	2	50000	\N	0	\N	2026-08-13 09:25:19.486	completed
b21c5695-204c-4cc7-886a-6c643cfd5e49	7d4bf4f3-8b38-48b5-9c9f-ca4ae844f130	faead849-9d7b-4831-b60e-20222fee6c1f	3	48000	\N	0	\N	2026-08-13 09:25:19.486	completed
3eb88075-7ab0-4810-ad29-f0826691ed05	7d4bf4f3-8b38-48b5-9c9f-ca4ae844f130	cb1888fc-f827-4522-b136-a22bf86816c2	4	35000	\N	0	\N	2026-08-13 09:25:19.486	completed
1666a70c-1927-45d4-b0dc-aa19a20d6116	7d4bf4f3-8b38-48b5-9c9f-ca4ae844f130	efc81916-6661-422b-826f-c68049339458	2	28000	\N	0	\N	2026-08-13 09:25:19.486	completed
c14007ce-9eef-466d-842b-37f69aed500e	7d4bf4f3-8b38-48b5-9c9f-ca4ae844f130	e718f02b-b657-444d-89ae-fb910537eb6c	2	42000	\N	0	\N	2026-08-13 09:25:19.486	completed
f8033004-ac2e-4e26-b741-bbff0ea4f36a	7d4bf4f3-8b38-48b5-9c9f-ca4ae844f130	803bcdee-17d3-41fc-a249-4e8d16b49575	1	48000	\N	0	\N	2026-08-13 09:25:19.486	completed
e7860629-d238-4714-86b4-1f9c32e349da	7d4bf4f3-8b38-48b5-9c9f-ca4ae844f130	5ba65aef-1f61-4c68-b8c1-d847553c8aef	4	52000	\N	0	\N	2026-08-13 09:25:19.486	completed
1a2b0892-d250-4bd5-90db-2bf96f26954e	7d4bf4f3-8b38-48b5-9c9f-ca4ae844f130	5ba65aef-1f61-4c68-b8c1-d847553c8aef	4	52000	\N	0	\N	2026-08-13 09:25:19.486	completed
7535926c-2c8c-4d44-a0c9-075bf3f1f332	67291b42-3e09-4e1b-9360-24160d058f49	2ce5c559-70e1-4bdd-8cf0-fcdf2a843273	3	46000	\N	0	\N	2026-08-13 09:25:19.495	completed
425f2558-52f5-45b4-a03d-74114380b7db	67291b42-3e09-4e1b-9360-24160d058f49	7804beb7-b72c-43db-a27a-82b955e5e31c	3	25000	\N	0	\N	2026-08-13 09:25:19.495	completed
6721795d-25a2-45cb-9d45-36b99e570297	67291b42-3e09-4e1b-9360-24160d058f49	d809adca-e256-41bc-b7b0-75df0d3f5dcb	4	35000	\N	0	\N	2026-08-13 09:25:19.495	completed
9f7ffb3c-ba43-4237-9dd2-1a531593bca6	67291b42-3e09-4e1b-9360-24160d058f49	86643a05-ac82-4216-bdf8-87fcd64da8ec	1	48000	\N	0	\N	2026-08-13 09:25:19.495	completed
6bd2667a-0e27-4d8b-a74c-86dcc3de0731	67291b42-3e09-4e1b-9360-24160d058f49	c0917f04-365b-4cdc-9b75-e49a7c492727	1	48000	\N	0	\N	2026-08-13 09:25:19.495	completed
1180db60-d5ec-4118-90a1-6e69618e53e6	67291b42-3e09-4e1b-9360-24160d058f49	51c45fec-e0e7-489e-8339-02a536d2e857	3	45000	\N	0	\N	2026-08-13 09:25:19.495	completed
75256631-6b37-44c7-a268-ae827e278bce	67291b42-3e09-4e1b-9360-24160d058f49	b6a4c689-bce0-4d87-883b-b0de919eba27	3	58000	\N	0	\N	2026-08-13 09:25:19.495	completed
a05789f4-0e97-4815-bf85-01116f1f6776	06b9e756-6edb-4afe-89ca-d5b0d075288a	cb1888fc-f827-4522-b136-a22bf86816c2	4	35000	\N	0	\N	2026-08-13 09:25:19.499	completed
6f90ce31-312c-4bb1-a8e8-0dcf1f933ad0	06b9e756-6edb-4afe-89ca-d5b0d075288a	c9ed90c7-689a-46ab-9fd2-84d017c264af	3	32000	\N	0	\N	2026-08-13 09:25:19.499	completed
89e35cae-b3a6-45f2-b366-a5b4677a311c	06b9e756-6edb-4afe-89ca-d5b0d075288a	3aac02bc-fcc6-4532-9a50-fa50790dd4cb	2	32000	\N	0	\N	2026-08-13 09:25:19.499	completed
e6d79298-4f23-4410-b143-430502841be2	06b9e756-6edb-4afe-89ca-d5b0d075288a	27af0495-2d91-4cb0-af88-4752edf671dc	4	10000	\N	0	\N	2026-08-13 09:25:19.499	completed
bbafd581-d232-44e0-9aa0-b453302e55b9	f9ed209f-b4eb-44d6-818c-23085200e246	10b0cc63-2c10-44ef-bf34-8d19b7fda2bb	2	55000	\N	0	\N	2026-08-13 09:25:19.508	completed
e25aebe2-7a89-4b8c-8aa7-0c36e655568c	f9ed209f-b4eb-44d6-818c-23085200e246	625d086d-e1db-42f3-9cd5-84006fb429c1	4	48000	\N	0	\N	2026-08-13 09:25:19.508	completed
e9c9ad4c-afac-47a1-beb9-829c68f1f3ae	f9ed209f-b4eb-44d6-818c-23085200e246	7804beb7-b72c-43db-a27a-82b955e5e31c	3	25000	\N	0	\N	2026-08-13 09:25:19.508	completed
2e74b096-7ae8-4f4c-887b-858ed410b414	f9ed209f-b4eb-44d6-818c-23085200e246	faead849-9d7b-4831-b60e-20222fee6c1f	1	48000	\N	0	\N	2026-08-13 09:25:19.508	completed
41b1d35f-6c81-48a5-94d7-20036f250e7d	30bcb239-a8b7-4ac3-85d7-387959b9b07d	308d182c-58a9-47d9-a56a-bba4a473ae24	3	42000	\N	0	\N	2026-08-13 09:25:19.516	completed
293516f6-126e-4b90-a870-3d6ff0dd34a3	30bcb239-a8b7-4ac3-85d7-387959b9b07d	bcff5008-981c-428b-b652-31d8c1378d9f	2	28000	\N	0	\N	2026-08-13 09:25:19.516	completed
b6980afd-f529-40f2-b39d-84872a4c69bf	30bcb239-a8b7-4ac3-85d7-387959b9b07d	eaa3fac9-f60f-4db1-b33a-a4bd46e8ea71	2	45000	\N	0	\N	2026-08-13 09:25:19.516	completed
5b559f0b-40b3-47e5-8212-e0788bb20123	30bcb239-a8b7-4ac3-85d7-387959b9b07d	bcff5008-981c-428b-b652-31d8c1378d9f	2	28000	\N	0	\N	2026-08-13 09:25:19.516	completed
bf6e950c-8379-44e9-a1b7-816350f4628b	34ed2f69-45dd-481f-a9f7-5a485a9fe084	3a6ff9b1-cc6c-45ae-9635-ab2b2d03c232	3	38000	\N	0	\N	2026-08-13 09:25:19.525	completed
5068a741-be8c-43ca-a9bd-30bd8cf328bd	34ed2f69-45dd-481f-a9f7-5a485a9fe084	01d338fc-cbda-492d-b496-2a55e100d813	3	45000	\N	0	\N	2026-08-13 09:25:19.525	completed
8a83ecc5-e86c-4128-8f04-f52d5c1ff422	34ed2f69-45dd-481f-a9f7-5a485a9fe084	cb1888fc-f827-4522-b136-a22bf86816c2	4	35000	\N	0	\N	2026-08-13 09:25:19.525	completed
e9e54fa1-f6b1-4ddf-a762-8f3412ec9135	53ad0420-2acd-4bc2-a86f-0f26a6eb3980	27af0495-2d91-4cb0-af88-4752edf671dc	4	10000	\N	0	\N	2026-08-13 09:25:19.534	completed
b7dd29db-07c5-40c6-a544-3d7455596de8	53ad0420-2acd-4bc2-a86f-0f26a6eb3980	ce6673bb-c51b-4a4f-ab3d-810e44601734	4	28000	\N	0	\N	2026-08-13 09:25:19.534	completed
ae15cbc8-18e0-4cce-96e8-37e84682db4e	53ad0420-2acd-4bc2-a86f-0f26a6eb3980	308d182c-58a9-47d9-a56a-bba4a473ae24	1	42000	\N	0	\N	2026-08-13 09:25:19.534	completed
dd91dee7-a0d6-4904-951f-c0e1e39d8e1f	53ad0420-2acd-4bc2-a86f-0f26a6eb3980	81d6f3b5-b26a-4dd0-bfca-fea91a42a296	4	35000	\N	0	\N	2026-08-13 09:25:19.534	completed
1094cd9f-38dd-4548-b69c-9218573ab9c9	53ad0420-2acd-4bc2-a86f-0f26a6eb3980	83ff8a95-3eb4-4b98-9978-63aa6d1b8323	4	55000	\N	0	\N	2026-08-13 09:25:19.534	completed
a0c70cb9-b600-4230-8359-9624166fbade	53ad0420-2acd-4bc2-a86f-0f26a6eb3980	7804beb7-b72c-43db-a27a-82b955e5e31c	2	25000	\N	0	\N	2026-08-13 09:25:19.534	completed
afb7e1cb-6fb5-4152-8755-5ba16a98e107	53ad0420-2acd-4bc2-a86f-0f26a6eb3980	ce6673bb-c51b-4a4f-ab3d-810e44601734	2	28000	\N	0	\N	2026-08-13 09:25:19.534	completed
b35cb983-3154-4043-9fab-161e13bb11f5	53ad0420-2acd-4bc2-a86f-0f26a6eb3980	efc81916-6661-422b-826f-c68049339458	1	28000	\N	0	\N	2026-08-13 09:25:19.534	completed
55acee93-31e8-43c3-be6b-5f24636d5ba0	2eb9a87f-15e2-4027-b96e-7f6a0a1093b3	ce6673bb-c51b-4a4f-ab3d-810e44601734	4	28000	\N	0	\N	2026-08-13 09:25:19.544	completed
e7c9df3b-38e7-40fa-9ff2-0e7c8c5f7be7	2eb9a87f-15e2-4027-b96e-7f6a0a1093b3	6798927c-bcba-49fd-a7ad-78291c69ac33	4	52000	\N	0	\N	2026-08-13 09:25:19.544	completed
1f53509f-f803-4786-a82f-a404772a435a	2eb9a87f-15e2-4027-b96e-7f6a0a1093b3	daa4bd17-296f-4da1-8d21-15534fa8e045	1	25000	\N	0	\N	2026-08-13 09:25:19.544	completed
ed6951c3-ac6a-4e42-97d9-4c45c4ebb9c6	2eb9a87f-15e2-4027-b96e-7f6a0a1093b3	2ce5c559-70e1-4bdd-8cf0-fcdf2a843273	2	46000	\N	0	\N	2026-08-13 09:25:19.544	completed
6eca074a-ffd7-4212-a0e6-4dc4064b9001	2eb9a87f-15e2-4027-b96e-7f6a0a1093b3	8f09b4ea-702e-4845-b2c0-59b3bf810d9d	1	38000	\N	0	\N	2026-08-13 09:25:19.544	completed
6c703e39-ba66-459b-9272-d698058fb86f	2eb9a87f-15e2-4027-b96e-7f6a0a1093b3	b429cd3c-c501-4b4a-b028-9ab5feedc41e	4	52000	\N	0	\N	2026-08-13 09:25:19.544	completed
01d8d2cd-123b-438b-be24-12da5f6a66b2	2eb9a87f-15e2-4027-b96e-7f6a0a1093b3	219c20d2-6247-4e8b-a734-53cfbd90ba88	3	52000	\N	0	\N	2026-08-13 09:25:19.544	completed
658f6f29-2aa3-400f-90c0-aeafe1b3049d	8e75cae9-ebac-4ecf-84a9-e48f7f9e81ee	a02247ba-a10e-4387-967d-e69a05c8193a	2	32000	\N	0	\N	2026-08-13 09:25:19.549	completed
50a7f946-a3b4-4630-855a-e4d5045571bf	8e75cae9-ebac-4ecf-84a9-e48f7f9e81ee	00acd18c-4b3a-4737-a36c-530f2c16d3b6	2	38000	\N	0	\N	2026-08-13 09:25:19.549	completed
4269a975-b239-4d5e-a13b-48f99f9a032b	8e75cae9-ebac-4ecf-84a9-e48f7f9e81ee	b6a4c689-bce0-4d87-883b-b0de919eba27	3	58000	\N	0	\N	2026-08-13 09:25:19.549	completed
773209f3-249d-4e15-bb23-2c754ca51410	8e75cae9-ebac-4ecf-84a9-e48f7f9e81ee	faead849-9d7b-4831-b60e-20222fee6c1f	1	48000	\N	0	\N	2026-08-13 09:25:19.549	completed
0450c195-d31e-46da-8af0-50b05e8c9c34	8e75cae9-ebac-4ecf-84a9-e48f7f9e81ee	83ceb824-bbdc-4b06-a867-037ded0aef0e	3	50000	\N	0	\N	2026-08-13 09:25:19.549	completed
bff1a5cf-e935-492d-8b75-93c9147898a0	8e75cae9-ebac-4ecf-84a9-e48f7f9e81ee	cbc78f47-cb0d-4d34-80e1-841ec7b0e5de	2	48000	\N	0	\N	2026-08-13 09:25:19.549	completed
24758d01-c5ed-4c7c-8486-60b2a7c17b74	8e75cae9-ebac-4ecf-84a9-e48f7f9e81ee	83ceb824-bbdc-4b06-a867-037ded0aef0e	2	50000	\N	0	\N	2026-08-13 09:25:19.549	completed
bedae6bb-c440-40d7-a09b-74715f144cef	b0ec5cfd-79b6-463d-89f6-1474f6188c73	ce6673bb-c51b-4a4f-ab3d-810e44601734	3	28000	\N	0	\N	2026-08-13 09:25:19.555	completed
d0a89153-2b8a-48a5-85b4-f03e47221fc4	b0ec5cfd-79b6-463d-89f6-1474f6188c73	625d086d-e1db-42f3-9cd5-84006fb429c1	4	48000	\N	0	\N	2026-08-13 09:25:19.555	completed
2c81b764-16ab-407f-a448-135dad9efe29	b0ec5cfd-79b6-463d-89f6-1474f6188c73	12b460b3-749d-4ab1-80de-d8f51d5188cc	2	40000	\N	0	\N	2026-08-13 09:25:19.555	completed
a56b2e29-6c28-4441-b811-1ec724a6006d	b0ec5cfd-79b6-463d-89f6-1474f6188c73	c24edbc4-7c7a-4228-9b3c-1b95c2be051c	4	48000	\N	0	\N	2026-08-13 09:25:19.555	completed
c5744693-aa60-4118-bf0b-692c2094d850	b0ec5cfd-79b6-463d-89f6-1474f6188c73	51c45fec-e0e7-489e-8339-02a536d2e857	3	45000	\N	0	\N	2026-08-13 09:25:19.555	completed
fc0b7aee-5b1a-423b-9311-321c4a963425	b0ec5cfd-79b6-463d-89f6-1474f6188c73	2ce5c559-70e1-4bdd-8cf0-fcdf2a843273	3	46000	\N	0	\N	2026-08-13 09:25:19.555	completed
7568cf57-d901-4ea1-a1ff-be16c226648b	71bae7b1-8b8a-4dec-b0cc-4901d3f1b2ac	3a6ff9b1-cc6c-45ae-9635-ab2b2d03c232	2	38000	\N	0	\N	2026-08-13 09:25:19.56	completed
9bbd515e-eb21-47f2-8c3a-aae4eac96c93	71bae7b1-8b8a-4dec-b0cc-4901d3f1b2ac	803bcdee-17d3-41fc-a249-4e8d16b49575	1	48000	\N	0	\N	2026-08-13 09:25:19.56	completed
260abfa6-42e6-4bd3-a56b-f315e4494a19	71bae7b1-8b8a-4dec-b0cc-4901d3f1b2ac	ce6673bb-c51b-4a4f-ab3d-810e44601734	1	28000	\N	0	\N	2026-08-13 09:25:19.56	completed
0b96d8a3-8bcb-4306-aa7f-b1a8f870922a	71bae7b1-8b8a-4dec-b0cc-4901d3f1b2ac	faead849-9d7b-4831-b60e-20222fee6c1f	2	48000	\N	0	\N	2026-08-13 09:25:19.56	completed
5a9b4f9f-4549-4a3b-ac1e-ce01832047a3	71bae7b1-8b8a-4dec-b0cc-4901d3f1b2ac	12b460b3-749d-4ab1-80de-d8f51d5188cc	4	40000	\N	0	\N	2026-08-13 09:25:19.56	completed
42faba4a-e87b-4f3b-b5a9-6d0abf07d74f	71bae7b1-8b8a-4dec-b0cc-4901d3f1b2ac	bcff5008-981c-428b-b652-31d8c1378d9f	3	28000	\N	0	\N	2026-08-13 09:25:19.56	completed
18355949-e34b-41a4-97ac-d32c7fd7bc65	71bae7b1-8b8a-4dec-b0cc-4901d3f1b2ac	51c45fec-e0e7-489e-8339-02a536d2e857	3	45000	\N	0	\N	2026-08-13 09:25:19.56	completed
1584d4eb-920e-45e0-b20f-df6b6c5f16c4	601746ec-2aa4-4b6b-b6bb-8e57d391703e	86643a05-ac82-4216-bdf8-87fcd64da8ec	2	48000	\N	0	\N	2026-08-13 09:25:19.569	completed
8a3a7601-dc78-4ea5-be6e-e4e8ab9b8e80	601746ec-2aa4-4b6b-b6bb-8e57d391703e	d849f917-4afe-4a94-8866-03848a938c79	1	35000	\N	0	\N	2026-08-13 09:25:19.569	completed
8b5f0cb8-f622-4bc9-b935-246a51e8ee02	601746ec-2aa4-4b6b-b6bb-8e57d391703e	7484d38a-54a0-49c7-baa2-a93fdce6d347	2	55000	\N	0	\N	2026-08-13 09:25:19.569	completed
d9ed1813-12ec-4ce6-93ef-e9661d62d3f3	4380db15-7c0a-4bb7-9ce0-b8ce7edecec9	51c45fec-e0e7-489e-8339-02a536d2e857	1	45000	\N	0	\N	2026-08-13 09:25:19.577	completed
28f6ec7a-5d38-43c2-bea6-9170e5a83860	4380db15-7c0a-4bb7-9ce0-b8ce7edecec9	5bc34fc9-24c2-4108-af83-5992af2291d6	1	40000	\N	0	\N	2026-08-13 09:25:19.577	completed
cd22aa6b-6e48-48d5-a74f-8c0298334858	4380db15-7c0a-4bb7-9ce0-b8ce7edecec9	25a8343a-39c3-457e-9c1d-13689bd6469b	1	45000	\N	0	\N	2026-08-13 09:25:19.577	completed
566b4318-d2e1-4984-b6e8-d81dd86f1d91	4380db15-7c0a-4bb7-9ce0-b8ce7edecec9	bcff5008-981c-428b-b652-31d8c1378d9f	3	28000	\N	0	\N	2026-08-13 09:25:19.577	completed
91a85e6f-9a42-411a-b546-3ffa58a82d53	4380db15-7c0a-4bb7-9ce0-b8ce7edecec9	86643a05-ac82-4216-bdf8-87fcd64da8ec	4	48000	\N	0	\N	2026-08-13 09:25:19.577	completed
ef49c9db-93d5-4aca-a1ea-48cc99fe867a	4380db15-7c0a-4bb7-9ce0-b8ce7edecec9	0b97d8bc-ffce-4904-8c46-87752b930f5e	1	45000	\N	0	\N	2026-08-13 09:25:19.577	completed
0d624603-60bb-4d3c-a8a3-5a14bfcb9851	4ba7e663-819e-4637-b456-22a49f318b5a	daa4bd17-296f-4da1-8d21-15534fa8e045	4	25000	\N	0	\N	2026-08-13 09:25:19.582	completed
1e85095a-fa62-4fe1-87af-24e436f85bfa	4ba7e663-819e-4637-b456-22a49f318b5a	faead849-9d7b-4831-b60e-20222fee6c1f	1	48000	\N	0	\N	2026-08-13 09:25:19.582	completed
67e44761-a12a-48ad-9374-6751778cc357	4ba7e663-819e-4637-b456-22a49f318b5a	ceed2a39-e4e2-486c-b228-a909a81d8487	1	20000	\N	0	\N	2026-08-13 09:25:19.582	completed
c9da27c4-aab8-44d3-bd49-cce248776e03	4ba7e663-819e-4637-b456-22a49f318b5a	228cd2ca-0ce1-44ff-92d8-05b7c9480e55	2	42000	\N	0	\N	2026-08-13 09:25:19.582	completed
445736c3-fbe1-48a6-951b-14e09dca5d13	4ba7e663-819e-4637-b456-22a49f318b5a	7484d38a-54a0-49c7-baa2-a93fdce6d347	2	55000	\N	0	\N	2026-08-13 09:25:19.582	completed
6f6c5acf-5fde-4591-a4d6-8e8c691597d3	2ed11fb6-a4ee-4013-8f24-0077470e51dd	e718f02b-b657-444d-89ae-fb910537eb6c	2	42000	\N	0	\N	2026-08-13 09:25:19.587	completed
ef484011-9d6a-4c6f-8fd4-4ca512ad10e9	2ed11fb6-a4ee-4013-8f24-0077470e51dd	7804beb7-b72c-43db-a27a-82b955e5e31c	2	25000	\N	0	\N	2026-08-13 09:25:19.587	completed
fe082b48-187c-4242-89e6-aedd102705e9	2ed11fb6-a4ee-4013-8f24-0077470e51dd	ceed2a39-e4e2-486c-b228-a909a81d8487	4	20000	\N	0	\N	2026-08-13 09:25:19.587	completed
72dadf13-423f-471e-b4a3-c79b177ecf1a	2ed11fb6-a4ee-4013-8f24-0077470e51dd	b1ee3afc-db38-468c-a4bf-38b51b772024	2	20000	\N	0	\N	2026-08-13 09:25:19.587	completed
578620a9-541a-4654-8c97-14032c10c4da	2ed11fb6-a4ee-4013-8f24-0077470e51dd	81d6f3b5-b26a-4dd0-bfca-fea91a42a296	1	35000	\N	0	\N	2026-08-13 09:25:19.587	completed
b3461c9c-0f2d-4dbc-8d0f-2fb77af4102d	2ed11fb6-a4ee-4013-8f24-0077470e51dd	83ff8a95-3eb4-4b98-9978-63aa6d1b8323	3	55000	\N	0	\N	2026-08-13 09:25:19.587	completed
3bfc41b7-9ed1-409d-adba-91bc00d76344	2ed11fb6-a4ee-4013-8f24-0077470e51dd	2ce5c559-70e1-4bdd-8cf0-fcdf2a843273	3	46000	\N	0	\N	2026-08-13 09:25:19.587	completed
f37c6cc6-30f9-4918-9076-2a2bec3c4be9	918b4292-7ff9-4f4c-9090-2c1db8650587	d849f917-4afe-4a94-8866-03848a938c79	3	35000	\N	0	\N	2026-08-13 09:25:19.595	completed
75532a0e-874f-4a6e-80ea-2f3f9b29ab82	918b4292-7ff9-4f4c-9090-2c1db8650587	ce6673bb-c51b-4a4f-ab3d-810e44601734	4	28000	\N	0	\N	2026-08-13 09:25:19.595	completed
cb94c696-3e36-40fb-9d0f-a6685cf1e4f0	918b4292-7ff9-4f4c-9090-2c1db8650587	81d6f3b5-b26a-4dd0-bfca-fea91a42a296	1	35000	\N	0	\N	2026-08-13 09:25:19.595	completed
6993aaeb-3ff4-4517-8409-c22c7bb05f4d	918b4292-7ff9-4f4c-9090-2c1db8650587	e24a6cc9-1b6e-4ba7-94a5-514f6aa8fe31	4	45000	\N	0	\N	2026-08-13 09:25:19.595	completed
de7dbe12-85c3-4d52-9332-cc20832d26fe	918b4292-7ff9-4f4c-9090-2c1db8650587	d52c0006-3bcd-48c7-ab83-082061dc6764	4	42000	\N	0	\N	2026-08-13 09:25:19.595	completed
198ed346-2212-4ac0-b6d9-6b8bcc993d77	918b4292-7ff9-4f4c-9090-2c1db8650587	d9f1fb87-e737-4210-a5bf-1bc0ba885771	4	42000	\N	0	\N	2026-08-13 09:25:19.595	completed
639544ff-a5b8-41d7-a13e-52b03de871e7	918b4292-7ff9-4f4c-9090-2c1db8650587	e9bd0cdf-4357-4313-8b02-7f8260f6992f	4	52000	\N	0	\N	2026-08-13 09:25:19.595	completed
caf7dd8e-f31d-4479-a9bd-43d4101e1fc5	04b2b6da-d1ea-4452-a585-d6653f87e742	f731a039-1a1f-413d-826c-0955bb9eea80	3	55000	\N	0	\N	2026-08-13 09:25:19.604	completed
dcc2e06f-98ba-48c9-89d0-a522156ae326	04b2b6da-d1ea-4452-a585-d6653f87e742	625d086d-e1db-42f3-9cd5-84006fb429c1	3	48000	\N	0	\N	2026-08-13 09:25:19.604	completed
1cbee71b-a695-44f2-9a41-07a0eeb6d8be	04b2b6da-d1ea-4452-a585-d6653f87e742	cbc78f47-cb0d-4d34-80e1-841ec7b0e5de	2	48000	\N	0	\N	2026-08-13 09:25:19.604	completed
50d9a7ee-07d9-4bab-a2e8-984ba1ca2b35	04b2b6da-d1ea-4452-a585-d6653f87e742	acb42a52-c717-441a-824b-8a18079ee46c	4	50000	\N	0	\N	2026-08-13 09:25:19.604	completed
fd5f67c4-6f4b-4325-86ce-edb1e70fdccc	04b2b6da-d1ea-4452-a585-d6653f87e742	96531f07-be37-454a-aa0c-4a0eaab99930	4	55000	\N	0	\N	2026-08-13 09:25:19.604	completed
dc54b3dd-2a2a-4349-b6b0-9086adb6061a	04b2b6da-d1ea-4452-a585-d6653f87e742	83ceb824-bbdc-4b06-a867-037ded0aef0e	4	50000	\N	0	\N	2026-08-13 09:25:19.604	completed
a3d14ddf-aff1-4880-9bfb-c2ce96871272	04b2b6da-d1ea-4452-a585-d6653f87e742	faead849-9d7b-4831-b60e-20222fee6c1f	4	48000	\N	0	\N	2026-08-13 09:25:19.604	completed
bdd431d8-fe38-4e28-a784-e13c050aebcf	04b2b6da-d1ea-4452-a585-d6653f87e742	e24a6cc9-1b6e-4ba7-94a5-514f6aa8fe31	4	45000	\N	0	\N	2026-08-13 09:25:19.604	completed
c5f675fe-45e5-4322-8490-69d67b093c66	f4f2f780-c53d-4314-b9c3-20208cbf7dec	308d182c-58a9-47d9-a56a-bba4a473ae24	2	42000	\N	0	\N	2026-08-13 09:25:19.613	completed
f037906d-de3b-43c5-9631-e57809184fd2	f4f2f780-c53d-4314-b9c3-20208cbf7dec	d809adca-e256-41bc-b7b0-75df0d3f5dcb	4	35000	\N	0	\N	2026-08-13 09:25:19.613	completed
020a54e0-72f3-4560-a8cc-a30c1888f533	f4f2f780-c53d-4314-b9c3-20208cbf7dec	3a6ff9b1-cc6c-45ae-9635-ab2b2d03c232	2	38000	\N	0	\N	2026-08-13 09:25:19.613	completed
5e6c5fdd-2506-4f5c-87b9-0c6e25e0c518	f4f2f780-c53d-4314-b9c3-20208cbf7dec	d809adca-e256-41bc-b7b0-75df0d3f5dcb	1	35000	\N	0	\N	2026-08-13 09:25:19.613	completed
d060df41-1d87-4c5d-95fe-fe905ab24e24	f4f2f780-c53d-4314-b9c3-20208cbf7dec	cbc78f47-cb0d-4d34-80e1-841ec7b0e5de	2	48000	\N	0	\N	2026-08-13 09:25:19.613	completed
f13c045b-0157-4105-9e3e-ded87e304ec2	f4f2f780-c53d-4314-b9c3-20208cbf7dec	2ce5c559-70e1-4bdd-8cf0-fcdf2a843273	3	46000	\N	0	\N	2026-08-13 09:25:19.613	completed
ddf4880a-24aa-4100-b313-6759a9124996	f4f2f780-c53d-4314-b9c3-20208cbf7dec	a02247ba-a10e-4387-967d-e69a05c8193a	3	32000	\N	0	\N	2026-08-13 09:25:19.613	completed
0d28bdc6-c035-4aea-ac1c-5278d245278c	f4f2f780-c53d-4314-b9c3-20208cbf7dec	cb1888fc-f827-4522-b136-a22bf86816c2	3	35000	\N	0	\N	2026-08-13 09:25:19.613	completed
d2771b42-3c99-4077-9f39-acbae58534d9	1675f780-769a-4c28-88c2-2c1555eb8611	d21a6806-fffa-4462-b33f-2c91a1c6b013	2	50000	\N	0	\N	2026-08-13 09:25:19.624	completed
9d7aab15-a2df-4f61-90a6-22dc764124f3	1675f780-769a-4c28-88c2-2c1555eb8611	27af0495-2d91-4cb0-af88-4752edf671dc	1	10000	\N	0	\N	2026-08-13 09:25:19.624	completed
e8152bb0-b1c9-437a-a900-2f868e04a154	1675f780-769a-4c28-88c2-2c1555eb8611	27af0495-2d91-4cb0-af88-4752edf671dc	4	10000	\N	0	\N	2026-08-13 09:25:19.624	completed
d999c66b-be90-4687-bd33-ffa0f66244f4	1675f780-769a-4c28-88c2-2c1555eb8611	25a8343a-39c3-457e-9c1d-13689bd6469b	3	45000	\N	0	\N	2026-08-13 09:25:19.624	completed
48e92af1-445b-4d0e-b2ec-82135512a60e	1675f780-769a-4c28-88c2-2c1555eb8611	12b460b3-749d-4ab1-80de-d8f51d5188cc	4	40000	\N	0	\N	2026-08-13 09:25:19.624	completed
deed39e7-711a-4682-9f30-4c56f9396d6b	1675f780-769a-4c28-88c2-2c1555eb8611	d849f917-4afe-4a94-8866-03848a938c79	2	35000	\N	0	\N	2026-08-13 09:25:19.624	completed
9cd4f18a-1e41-4392-aa9f-298f54f3dead	1675f780-769a-4c28-88c2-2c1555eb8611	00acd18c-4b3a-4737-a36c-530f2c16d3b6	2	38000	\N	0	\N	2026-08-13 09:25:19.624	completed
cb1f965a-743e-46cf-a0fe-e875438396bc	1675f780-769a-4c28-88c2-2c1555eb8611	efc81916-6661-422b-826f-c68049339458	1	28000	\N	0	\N	2026-08-13 09:25:19.624	completed
35300e79-2a3b-4023-b04d-990a95a3e60c	c0eab934-22b6-44a3-b940-ca7ccb2e2482	25a8343a-39c3-457e-9c1d-13689bd6469b	3	45000	\N	0	\N	2026-08-13 09:25:19.633	completed
0b93a853-00c9-4c72-922f-5b6a9d60b3ce	c0eab934-22b6-44a3-b940-ca7ccb2e2482	3a6ff9b1-cc6c-45ae-9635-ab2b2d03c232	3	38000	\N	0	\N	2026-08-13 09:25:19.633	completed
f961f328-7026-4371-be09-4189b1ecbea3	c0eab934-22b6-44a3-b940-ca7ccb2e2482	308d182c-58a9-47d9-a56a-bba4a473ae24	1	42000	\N	0	\N	2026-08-13 09:25:19.633	completed
84df644d-2e5e-4cd2-ad57-2046ec6546cc	2d23eb00-edca-4c4f-83bb-21ecf1862950	308d182c-58a9-47d9-a56a-bba4a473ae24	1	42000	\N	0	\N	2026-08-13 09:25:19.642	completed
a82b3d5c-5532-4da3-897d-6dfd269366fc	2d23eb00-edca-4c4f-83bb-21ecf1862950	27af0495-2d91-4cb0-af88-4752edf671dc	1	10000	\N	0	\N	2026-08-13 09:25:19.642	completed
83f24355-d891-4c1f-b4b9-08987febe4f8	2d23eb00-edca-4c4f-83bb-21ecf1862950	b429cd3c-c501-4b4a-b028-9ab5feedc41e	2	52000	\N	0	\N	2026-08-13 09:25:19.642	completed
bc44d212-7857-4a23-aa0f-72910ceba4c1	2d23eb00-edca-4c4f-83bb-21ecf1862950	7484d38a-54a0-49c7-baa2-a93fdce6d347	4	55000	\N	0	\N	2026-08-13 09:25:19.642	completed
cd6b86db-3985-4c83-8594-53dc12a35b95	2d23eb00-edca-4c4f-83bb-21ecf1862950	01d338fc-cbda-492d-b496-2a55e100d813	1	45000	\N	0	\N	2026-08-13 09:25:19.642	completed
f11f517c-fd90-4b71-9971-d77dcb9d9ac8	2d23eb00-edca-4c4f-83bb-21ecf1862950	a02247ba-a10e-4387-967d-e69a05c8193a	4	32000	\N	0	\N	2026-08-13 09:25:19.642	completed
e5ec2813-8b8f-4812-95a7-b1edf684dd63	2d23eb00-edca-4c4f-83bb-21ecf1862950	cbc78f47-cb0d-4d34-80e1-841ec7b0e5de	1	48000	\N	0	\N	2026-08-13 09:25:19.642	completed
ed8e2b0b-3e12-4795-a5ca-56f66c0e9dd4	bf69551e-327f-49cf-abcd-73bd600e858b	219c20d2-6247-4e8b-a734-53cfbd90ba88	2	52000	\N	0	\N	2026-08-13 09:25:19.652	completed
0c95afbd-0420-4161-a704-44662af72821	bf69551e-327f-49cf-abcd-73bd600e858b	10b0cc63-2c10-44ef-bf34-8d19b7fda2bb	4	55000	\N	0	\N	2026-08-13 09:25:19.652	completed
12719ae3-58da-4572-b0da-4dd69bd47c58	bf69551e-327f-49cf-abcd-73bd600e858b	bcff5008-981c-428b-b652-31d8c1378d9f	2	28000	\N	0	\N	2026-08-13 09:25:19.652	completed
83b0feef-ee6a-4e63-9d14-c764b86c6fce	bf69551e-327f-49cf-abcd-73bd600e858b	01d338fc-cbda-492d-b496-2a55e100d813	4	45000	\N	0	\N	2026-08-13 09:25:19.652	completed
e70d85e2-8d55-4e75-9a7e-88e69b84753c	2f17cebb-4b0a-4800-8d68-d447b644064c	2ce5c559-70e1-4bdd-8cf0-fcdf2a843273	4	46000	\N	0	\N	2026-08-13 09:25:19.66	completed
64652710-fbf8-4f85-bf39-510f4062cf69	2f17cebb-4b0a-4800-8d68-d447b644064c	a02247ba-a10e-4387-967d-e69a05c8193a	3	32000	\N	0	\N	2026-08-13 09:25:19.66	completed
6069297e-5baf-4628-966d-3aa9aeaa76eb	2f17cebb-4b0a-4800-8d68-d447b644064c	96531f07-be37-454a-aa0c-4a0eaab99930	3	55000	\N	0	\N	2026-08-13 09:25:19.66	completed
bd579ea3-abf1-415e-b05f-6832a7643c53	2f17cebb-4b0a-4800-8d68-d447b644064c	d809adca-e256-41bc-b7b0-75df0d3f5dcb	3	35000	\N	0	\N	2026-08-13 09:25:19.66	completed
593caa91-f71f-44f0-89e3-2ce7ebfc29c0	2f17cebb-4b0a-4800-8d68-d447b644064c	eaa3fac9-f60f-4db1-b33a-a4bd46e8ea71	2	45000	\N	0	\N	2026-08-13 09:25:19.66	completed
fc2c4acf-2a07-4801-b889-e5191442c50c	2f17cebb-4b0a-4800-8d68-d447b644064c	86643a05-ac82-4216-bdf8-87fcd64da8ec	2	48000	\N	0	\N	2026-08-13 09:25:19.66	completed
bca812ab-a1e3-47de-8f36-2e9ef2a3dedc	2f17cebb-4b0a-4800-8d68-d447b644064c	7804beb7-b72c-43db-a27a-82b955e5e31c	1	25000	\N	0	\N	2026-08-13 09:25:19.66	completed
0e3fd5fe-b252-4179-961b-4e0cfc95f552	48cc3469-21e2-47aa-8241-5a2c411482a5	83ff8a95-3eb4-4b98-9978-63aa6d1b8323	3	55000	\N	0	\N	2026-08-13 09:25:19.669	completed
82e1b6d4-fbc6-4ca8-8f02-96c12f0a471d	48cc3469-21e2-47aa-8241-5a2c411482a5	51c45fec-e0e7-489e-8339-02a536d2e857	4	45000	\N	0	\N	2026-08-13 09:25:19.669	completed
bc725bf3-7304-4616-a5aa-6bd20abd7e0d	48cc3469-21e2-47aa-8241-5a2c411482a5	daa4bd17-296f-4da1-8d21-15534fa8e045	4	25000	\N	0	\N	2026-08-13 09:25:19.669	completed
46a5c718-1f7c-427a-a2b4-f920f3cb2c00	48cc3469-21e2-47aa-8241-5a2c411482a5	eaa3fac9-f60f-4db1-b33a-a4bd46e8ea71	4	45000	\N	0	\N	2026-08-13 09:25:19.669	completed
22b4ca47-ed9a-40a1-b085-63bdb76f88ec	2b5b06ae-4056-494e-aa2a-140dbaedd02b	faead849-9d7b-4831-b60e-20222fee6c1f	3	48000	\N	0	\N	2026-08-13 09:25:19.673	completed
2aee7dac-a98d-4750-a6de-1ffbb0dbd704	2b5b06ae-4056-494e-aa2a-140dbaedd02b	e24a6cc9-1b6e-4ba7-94a5-514f6aa8fe31	1	45000	\N	0	\N	2026-08-13 09:25:19.673	completed
2fb0f9cd-8b96-4bf1-a246-1a21f110a7ac	2b5b06ae-4056-494e-aa2a-140dbaedd02b	faead849-9d7b-4831-b60e-20222fee6c1f	3	48000	\N	0	\N	2026-08-13 09:25:19.673	completed
845b422f-8922-467f-abd3-2acfe1cb5da4	2b5b06ae-4056-494e-aa2a-140dbaedd02b	3a6ff9b1-cc6c-45ae-9635-ab2b2d03c232	1	38000	\N	0	\N	2026-08-13 09:25:19.673	completed
ae6c3971-bd22-4326-a2f5-bde8e156db63	2b5b06ae-4056-494e-aa2a-140dbaedd02b	10b0cc63-2c10-44ef-bf34-8d19b7fda2bb	1	55000	\N	0	\N	2026-08-13 09:25:19.673	completed
8e32f4bb-89ba-48ae-bb7f-9124526d8d63	2b5b06ae-4056-494e-aa2a-140dbaedd02b	7804beb7-b72c-43db-a27a-82b955e5e31c	2	25000	\N	0	\N	2026-08-13 09:25:19.673	completed
ce7db5f1-092c-4423-8d9b-d32769e6380e	6ee0f398-4c8e-49de-8dcd-b19d7bd2d8ea	5ba65aef-1f61-4c68-b8c1-d847553c8aef	3	52000	\N	0	\N	2026-08-13 09:25:19.678	completed
ebc88503-8de9-4ec2-ae66-dd1b5147e6bb	6ee0f398-4c8e-49de-8dcd-b19d7bd2d8ea	faead849-9d7b-4831-b60e-20222fee6c1f	4	48000	\N	0	\N	2026-08-13 09:25:19.678	completed
1c0878e9-0643-46e9-bc8f-183225b632db	6ee0f398-4c8e-49de-8dcd-b19d7bd2d8ea	2ce5c559-70e1-4bdd-8cf0-fcdf2a843273	4	46000	\N	0	\N	2026-08-13 09:25:19.678	completed
02fb1ac2-a5ac-45b0-9068-e42acd6cabea	bf6cead8-0bd6-4fc9-8801-e292a8d4b735	2ce5c559-70e1-4bdd-8cf0-fcdf2a843273	4	46000	\N	0	\N	2026-08-13 09:25:19.687	completed
71949a04-c85f-4277-82c3-c6c6a5e88bbc	bf6cead8-0bd6-4fc9-8801-e292a8d4b735	daa4bd17-296f-4da1-8d21-15534fa8e045	4	25000	\N	0	\N	2026-08-13 09:25:19.687	completed
183ccc99-e83d-4a8f-b503-e78202fcb937	bf6cead8-0bd6-4fc9-8801-e292a8d4b735	c0917f04-365b-4cdc-9b75-e49a7c492727	2	48000	\N	0	\N	2026-08-13 09:25:19.687	completed
8226fd53-ca3f-4cdf-8405-9c72a7d934ae	bf6cead8-0bd6-4fc9-8801-e292a8d4b735	faead849-9d7b-4831-b60e-20222fee6c1f	1	48000	\N	0	\N	2026-08-13 09:25:19.687	completed
a05b6f6e-b08d-4f51-89bd-0912c5d67057	bf6cead8-0bd6-4fc9-8801-e292a8d4b735	7804beb7-b72c-43db-a27a-82b955e5e31c	3	25000	\N	0	\N	2026-08-13 09:25:19.687	completed
0b736104-4679-4978-9c65-e4539a39729a	bf6cead8-0bd6-4fc9-8801-e292a8d4b735	7484d38a-54a0-49c7-baa2-a93fdce6d347	1	55000	\N	0	\N	2026-08-13 09:25:19.687	completed
e45b69d3-471e-4946-99cc-cadf1463ab4d	132c36bf-d90a-46ca-8a0c-5db4a3e1311e	efc81916-6661-422b-826f-c68049339458	1	28000	\N	0	\N	2026-08-13 09:25:19.698	completed
16e9f798-439e-4ab7-97aa-cb1e57d56922	132c36bf-d90a-46ca-8a0c-5db4a3e1311e	d9f1fb87-e737-4210-a5bf-1bc0ba885771	4	42000	\N	0	\N	2026-08-13 09:25:19.698	completed
44a1b550-310c-4514-807c-f9d141cd3274	132c36bf-d90a-46ca-8a0c-5db4a3e1311e	f731a039-1a1f-413d-826c-0955bb9eea80	1	55000	\N	0	\N	2026-08-13 09:25:19.698	completed
b03a1e99-859c-4162-b533-d9eb8be3bb95	132c36bf-d90a-46ca-8a0c-5db4a3e1311e	83ceb824-bbdc-4b06-a867-037ded0aef0e	2	50000	\N	0	\N	2026-08-13 09:25:19.698	completed
a07dafbe-ff81-43ef-abc0-cdc5b6fa2ed2	c9a5d7c0-39de-47a6-b47e-421bdde4c3df	b6a4c689-bce0-4d87-883b-b0de919eba27	3	58000	\N	0	\N	2026-08-13 09:25:19.707	completed
03a25cbc-4756-4958-97d3-29637c6a04ff	c9a5d7c0-39de-47a6-b47e-421bdde4c3df	faead849-9d7b-4831-b60e-20222fee6c1f	2	48000	\N	0	\N	2026-08-13 09:25:19.707	completed
c3a4dfac-867b-4e0a-b465-2048db0d6f5c	c9a5d7c0-39de-47a6-b47e-421bdde4c3df	e24a6cc9-1b6e-4ba7-94a5-514f6aa8fe31	1	45000	\N	0	\N	2026-08-13 09:25:19.707	completed
99034db2-f563-4333-988e-12a3215e07b2	c9a5d7c0-39de-47a6-b47e-421bdde4c3df	625d086d-e1db-42f3-9cd5-84006fb429c1	4	48000	\N	0	\N	2026-08-13 09:25:19.707	completed
dab4078c-53aa-4fc0-91f1-3af5bca80608	c9a5d7c0-39de-47a6-b47e-421bdde4c3df	daa4bd17-296f-4da1-8d21-15534fa8e045	1	25000	\N	0	\N	2026-08-13 09:25:19.707	completed
2e2d00d3-4eb0-4e6b-b955-8ad8b4d26d54	c9a5d7c0-39de-47a6-b47e-421bdde4c3df	daa4bd17-296f-4da1-8d21-15534fa8e045	4	25000	\N	0	\N	2026-08-13 09:25:19.707	completed
781ec511-0ff5-4147-9919-e88a0fe2c7b5	c9a5d7c0-39de-47a6-b47e-421bdde4c3df	cb1888fc-f827-4522-b136-a22bf86816c2	1	35000	\N	0	\N	2026-08-13 09:25:19.707	completed
83153b50-a79d-4cf5-817b-5033b6acedad	c9a5d7c0-39de-47a6-b47e-421bdde4c3df	d21a6806-fffa-4462-b33f-2c91a1c6b013	3	50000	\N	0	\N	2026-08-13 09:25:19.707	completed
752eab82-b617-4a1b-a2e9-c40a2f5aa7ad	994005c8-5a04-4866-a7fc-1805e9c95fb5	eaa3fac9-f60f-4db1-b33a-a4bd46e8ea71	3	45000	\N	0	\N	2026-08-13 09:25:19.716	completed
963b7c9a-5a37-47fc-a9b9-33262cb60cb3	994005c8-5a04-4866-a7fc-1805e9c95fb5	7484d38a-54a0-49c7-baa2-a93fdce6d347	2	55000	\N	0	\N	2026-08-13 09:25:19.716	completed
17c62414-f090-407e-b04a-2497e5f36974	994005c8-5a04-4866-a7fc-1805e9c95fb5	3aac02bc-fcc6-4532-9a50-fa50790dd4cb	4	32000	\N	0	\N	2026-08-13 09:25:19.716	completed
d6ead878-a0b1-40e9-9bcc-3c0bcb35f14a	994005c8-5a04-4866-a7fc-1805e9c95fb5	30ef5deb-6b46-47d1-a98c-8bc060d62b44	2	45000	\N	0	\N	2026-08-13 09:25:19.716	completed
239a0d07-f487-4664-b39f-77cbdadcb8df	994005c8-5a04-4866-a7fc-1805e9c95fb5	51c45fec-e0e7-489e-8339-02a536d2e857	1	45000	\N	0	\N	2026-08-13 09:25:19.716	completed
a872bee5-81d2-43ca-bf5b-f561e7b4fa3b	994005c8-5a04-4866-a7fc-1805e9c95fb5	5bc34fc9-24c2-4108-af83-5992af2291d6	1	40000	\N	0	\N	2026-08-13 09:25:19.716	completed
2ff2b815-a5c8-4473-93e7-8673baccb324	994005c8-5a04-4866-a7fc-1805e9c95fb5	c24edbc4-7c7a-4228-9b3c-1b95c2be051c	2	48000	\N	0	\N	2026-08-13 09:25:19.716	completed
a4ee347c-b068-428b-b8c8-b8edf9d5a134	93818dfc-f1c9-4eee-a1d4-1accdd83dae4	d21a6806-fffa-4462-b33f-2c91a1c6b013	1	50000	\N	0	\N	2026-08-13 09:25:19.725	completed
1e0ffe7c-d253-4318-9ee7-50efd418becc	93818dfc-f1c9-4eee-a1d4-1accdd83dae4	6798927c-bcba-49fd-a7ad-78291c69ac33	2	52000	\N	0	\N	2026-08-13 09:25:19.725	completed
1f1b47dd-89e3-4e03-a54c-e32876acd34e	93818dfc-f1c9-4eee-a1d4-1accdd83dae4	ceed2a39-e4e2-486c-b228-a909a81d8487	4	20000	\N	0	\N	2026-08-13 09:25:19.725	completed
16353592-c647-4cfc-b4ea-b4e23313edfd	93818dfc-f1c9-4eee-a1d4-1accdd83dae4	8f09b4ea-702e-4845-b2c0-59b3bf810d9d	4	38000	\N	0	\N	2026-08-13 09:25:19.725	completed
4dab042c-40a1-4428-b378-74c2fc60ff2e	93818dfc-f1c9-4eee-a1d4-1accdd83dae4	5ba65aef-1f61-4c68-b8c1-d847553c8aef	2	52000	\N	0	\N	2026-08-13 09:25:19.725	completed
0bb04018-8bb4-43db-9192-c082948ae0bf	93818dfc-f1c9-4eee-a1d4-1accdd83dae4	81d6f3b5-b26a-4dd0-bfca-fea91a42a296	4	35000	\N	0	\N	2026-08-13 09:25:19.725	completed
78d8f88b-13f8-468f-8f7d-22ae08a04e55	48afc2b8-f7cc-4328-b49b-675608c109e3	eb1dae05-cb14-4000-ba10-260f9cd79124	3	45000	\N	0	\N	2026-08-13 09:25:19.731	completed
c4b03ce4-5116-4c6f-bc3d-ff1a88d0c36a	48afc2b8-f7cc-4328-b49b-675608c109e3	96531f07-be37-454a-aa0c-4a0eaab99930	4	55000	\N	0	\N	2026-08-13 09:25:19.731	completed
fc8af367-3704-451b-8b58-9e06ddc6752e	48afc2b8-f7cc-4328-b49b-675608c109e3	25a8343a-39c3-457e-9c1d-13689bd6469b	2	45000	\N	0	\N	2026-08-13 09:25:19.731	completed
19a6fff0-accf-4ade-9e47-7e12c8a43516	48afc2b8-f7cc-4328-b49b-675608c109e3	86643a05-ac82-4216-bdf8-87fcd64da8ec	1	48000	\N	0	\N	2026-08-13 09:25:19.731	completed
bc2348d4-eef8-42e9-b916-46263c51a3ab	c31e5c28-9ec2-4bc6-90bc-e77838b9e6d8	25a8343a-39c3-457e-9c1d-13689bd6469b	1	45000	\N	0	\N	2026-08-13 09:25:19.736	completed
426a2680-0dbf-4c1d-854a-ca2cacf0c2ba	c31e5c28-9ec2-4bc6-90bc-e77838b9e6d8	acb42a52-c717-441a-824b-8a18079ee46c	1	50000	\N	0	\N	2026-08-13 09:25:19.736	completed
77f737c8-49d0-415b-b1e9-93ac81934b76	c31e5c28-9ec2-4bc6-90bc-e77838b9e6d8	81d6f3b5-b26a-4dd0-bfca-fea91a42a296	3	35000	\N	0	\N	2026-08-13 09:25:19.736	completed
bb3fa751-f238-4f86-87f1-0ebecdf3f7b6	c31e5c28-9ec2-4bc6-90bc-e77838b9e6d8	c9ed90c7-689a-46ab-9fd2-84d017c264af	2	32000	\N	0	\N	2026-08-13 09:25:19.736	completed
78e50de1-0146-4b6c-947b-126c3497f0ba	4331bf24-79f6-42b1-aad4-efd3c02db70f	d849f917-4afe-4a94-8866-03848a938c79	3	35000	\N	0	\N	2026-08-13 09:25:19.745	completed
74239d2c-5e52-4a31-be81-9deaeb567218	4331bf24-79f6-42b1-aad4-efd3c02db70f	6798927c-bcba-49fd-a7ad-78291c69ac33	3	52000	\N	0	\N	2026-08-13 09:25:19.745	completed
f0cf6338-b8a4-492a-bf6a-02b9aa6d35a4	4331bf24-79f6-42b1-aad4-efd3c02db70f	efc81916-6661-422b-826f-c68049339458	1	28000	\N	0	\N	2026-08-13 09:25:19.745	completed
1e2ff286-ce5a-4f83-b1a4-23ebd0d53f68	4331bf24-79f6-42b1-aad4-efd3c02db70f	35fbf376-436a-45ea-89a5-41560d3be32b	4	35000	\N	0	\N	2026-08-13 09:25:19.745	completed
a25a3fa9-9150-4868-aa3a-87b389e7448f	4331bf24-79f6-42b1-aad4-efd3c02db70f	faead849-9d7b-4831-b60e-20222fee6c1f	1	48000	\N	0	\N	2026-08-13 09:25:19.745	completed
536cb2c4-32b6-4a7f-b86e-5faca92adac3	4331bf24-79f6-42b1-aad4-efd3c02db70f	c9ed90c7-689a-46ab-9fd2-84d017c264af	2	32000	\N	0	\N	2026-08-13 09:25:19.745	completed
313b8939-bd7b-40b5-9d15-1825d3c288fa	4331bf24-79f6-42b1-aad4-efd3c02db70f	daa4bd17-296f-4da1-8d21-15534fa8e045	2	25000	\N	0	\N	2026-08-13 09:25:19.745	completed
866629b0-e318-4836-998c-20d460c5aa4f	4331bf24-79f6-42b1-aad4-efd3c02db70f	884570a1-2822-4840-a08f-fc4a4a3b5fad	4	48000	\N	0	\N	2026-08-13 09:25:19.745	completed
e691e796-4a4d-4335-bdcf-0278e583ce0e	8ff87b1a-19d1-402e-a6a2-5080fd48d3a9	ce6673bb-c51b-4a4f-ab3d-810e44601734	4	28000	\N	0	\N	2026-08-13 09:25:19.755	completed
c4883ffd-528c-4245-b9b3-59c7a1faffd2	8ff87b1a-19d1-402e-a6a2-5080fd48d3a9	81d6f3b5-b26a-4dd0-bfca-fea91a42a296	1	35000	\N	0	\N	2026-08-13 09:25:19.755	completed
9ae93310-9d75-4937-bec2-5d60768bed12	8ff87b1a-19d1-402e-a6a2-5080fd48d3a9	d849f917-4afe-4a94-8866-03848a938c79	1	35000	\N	0	\N	2026-08-13 09:25:19.755	completed
3f652681-33fb-4aa7-88b3-1289107aaebc	8ff87b1a-19d1-402e-a6a2-5080fd48d3a9	884570a1-2822-4840-a08f-fc4a4a3b5fad	4	48000	\N	0	\N	2026-08-13 09:25:19.755	completed
9fe26eb1-4fbe-40dc-adec-ee5183aa1c80	8ff87b1a-19d1-402e-a6a2-5080fd48d3a9	5bc34fc9-24c2-4108-af83-5992af2291d6	3	40000	\N	0	\N	2026-08-13 09:25:19.755	completed
b797fd13-78b7-439d-b27f-c679de9f63e6	f24e2a16-46bb-4cda-90be-0a39607fa004	b6a4c689-bce0-4d87-883b-b0de919eba27	2	58000	\N	0	\N	2026-08-13 09:25:19.759	completed
baf17c50-86ca-4ed1-866b-bf8a3d5fc225	f24e2a16-46bb-4cda-90be-0a39607fa004	d9f1fb87-e737-4210-a5bf-1bc0ba885771	1	42000	\N	0	\N	2026-08-13 09:25:19.759	completed
f28005ed-52cb-49ae-a84b-3826137f5109	f24e2a16-46bb-4cda-90be-0a39607fa004	ce6673bb-c51b-4a4f-ab3d-810e44601734	4	28000	\N	0	\N	2026-08-13 09:25:19.759	completed
5fde9752-c3d7-4a66-ab02-45e20d22cff5	7542dd41-b0c5-4b30-80b2-cfb11db59a39	e9bd0cdf-4357-4313-8b02-7f8260f6992f	1	52000	\N	0	\N	2026-08-13 09:25:19.764	completed
906826d1-cfca-417c-87b5-ebd896223959	7542dd41-b0c5-4b30-80b2-cfb11db59a39	f731a039-1a1f-413d-826c-0955bb9eea80	4	55000	\N	0	\N	2026-08-13 09:25:19.764	completed
3ebebc82-d812-40f2-974c-72685ef3c86d	7542dd41-b0c5-4b30-80b2-cfb11db59a39	0b97d8bc-ffce-4904-8c46-87752b930f5e	3	45000	\N	0	\N	2026-08-13 09:25:19.764	completed
19427f86-1b28-4628-88e1-169890b0f788	7542dd41-b0c5-4b30-80b2-cfb11db59a39	ce6673bb-c51b-4a4f-ab3d-810e44601734	2	28000	\N	0	\N	2026-08-13 09:25:19.764	completed
a1b35c5a-d1f2-4f88-b25e-6f0f499fbee7	0f5d5835-9afa-4f1c-9277-9fc4f82e64eb	10b0cc63-2c10-44ef-bf34-8d19b7fda2bb	4	55000	\N	0	\N	2026-08-13 09:25:19.768	completed
3ec227cc-0445-43d6-88b9-fe744a7d1b40	0f5d5835-9afa-4f1c-9277-9fc4f82e64eb	00acd18c-4b3a-4737-a36c-530f2c16d3b6	3	38000	\N	0	\N	2026-08-13 09:25:19.768	completed
5fe01e7f-941d-42b1-919c-b3d8d64bd570	0f5d5835-9afa-4f1c-9277-9fc4f82e64eb	83ff8a95-3eb4-4b98-9978-63aa6d1b8323	4	55000	\N	0	\N	2026-08-13 09:25:19.768	completed
c88d0366-7dce-4125-8bcb-8d5a93939cec	0f5d5835-9afa-4f1c-9277-9fc4f82e64eb	eaa3fac9-f60f-4db1-b33a-a4bd46e8ea71	2	45000	\N	0	\N	2026-08-13 09:25:19.768	completed
ee725186-f416-4cf1-911d-a2c7667d774e	0f5d5835-9afa-4f1c-9277-9fc4f82e64eb	e24a6cc9-1b6e-4ba7-94a5-514f6aa8fe31	3	45000	\N	0	\N	2026-08-13 09:25:19.768	completed
5df6621e-a7e2-4b67-86ac-3e2c542567eb	0f5d5835-9afa-4f1c-9277-9fc4f82e64eb	884570a1-2822-4840-a08f-fc4a4a3b5fad	2	48000	\N	0	\N	2026-08-13 09:25:19.768	completed
3923d134-0c17-4d0b-bb70-585593bcb453	0f5d5835-9afa-4f1c-9277-9fc4f82e64eb	219c20d2-6247-4e8b-a734-53cfbd90ba88	1	52000	\N	0	\N	2026-08-13 09:25:19.768	completed
e5c4bc38-2078-4688-ae80-9c0d8c698e50	0f5d5835-9afa-4f1c-9277-9fc4f82e64eb	3aac02bc-fcc6-4532-9a50-fa50790dd4cb	4	32000	\N	0	\N	2026-08-13 09:25:19.768	completed
84003b87-80bf-41bd-bc94-e59ed4c7ef80	2e0ffae2-6bd9-4ce0-b4c3-80c5cd940068	228cd2ca-0ce1-44ff-92d8-05b7c9480e55	3	42000	\N	0	\N	2026-08-13 09:25:19.777	completed
1e98306e-df20-456f-83a1-2a036b17b737	2e0ffae2-6bd9-4ce0-b4c3-80c5cd940068	c24edbc4-7c7a-4228-9b3c-1b95c2be051c	2	48000	\N	0	\N	2026-08-13 09:25:19.777	completed
a1ca4375-81fb-4fc5-896f-63ae38e01848	2e0ffae2-6bd9-4ce0-b4c3-80c5cd940068	b1ee3afc-db38-468c-a4bf-38b51b772024	3	20000	\N	0	\N	2026-08-13 09:25:19.777	completed
6ad85d00-7796-4c69-9777-a53c71ab00fd	2e0ffae2-6bd9-4ce0-b4c3-80c5cd940068	803bcdee-17d3-41fc-a249-4e8d16b49575	3	48000	\N	0	\N	2026-08-13 09:25:19.777	completed
21e43c46-9ecf-4d0b-a0fb-3539fc1ae78d	2e0ffae2-6bd9-4ce0-b4c3-80c5cd940068	e24a6cc9-1b6e-4ba7-94a5-514f6aa8fe31	2	45000	\N	0	\N	2026-08-13 09:25:19.777	completed
a0ea9d3f-fe34-4274-8393-f79b8d32b025	cb7de401-ed25-4fe9-a6ce-c1e3cc1ae555	3a6ff9b1-cc6c-45ae-9635-ab2b2d03c232	2	38000	\N	0	\N	2026-08-13 09:25:19.787	completed
6d2dafbd-a3a1-4764-abad-951a2ba88656	cb7de401-ed25-4fe9-a6ce-c1e3cc1ae555	25a8343a-39c3-457e-9c1d-13689bd6469b	1	45000	\N	0	\N	2026-08-13 09:25:19.787	completed
ea4ed0c1-2100-4929-9071-451f23587004	cb7de401-ed25-4fe9-a6ce-c1e3cc1ae555	ceed2a39-e4e2-486c-b228-a909a81d8487	2	20000	\N	0	\N	2026-08-13 09:25:19.787	completed
32f34b79-1b50-4d9d-99e3-6374ca73b9e0	cb7de401-ed25-4fe9-a6ce-c1e3cc1ae555	d9f1fb87-e737-4210-a5bf-1bc0ba885771	4	42000	\N	0	\N	2026-08-13 09:25:19.787	completed
8121d385-9c8a-4be0-8ac6-c4f77156495f	cb7de401-ed25-4fe9-a6ce-c1e3cc1ae555	7484d38a-54a0-49c7-baa2-a93fdce6d347	4	55000	\N	0	\N	2026-08-13 09:25:19.787	completed
e913279d-69e9-4b87-be22-6b457e855310	5442e30a-59a6-411a-a356-cc2f432e46b3	2ce5c559-70e1-4bdd-8cf0-fcdf2a843273	3	46000	\N	0	\N	2026-08-13 09:25:19.796	completed
fe53414a-d354-4076-bdd6-e7b9462fec49	5442e30a-59a6-411a-a356-cc2f432e46b3	81d6f3b5-b26a-4dd0-bfca-fea91a42a296	1	35000	\N	0	\N	2026-08-13 09:25:19.796	completed
ce2f607b-2572-426f-a43c-7a7b89fa3a19	5442e30a-59a6-411a-a356-cc2f432e46b3	2ce5c559-70e1-4bdd-8cf0-fcdf2a843273	4	46000	\N	0	\N	2026-08-13 09:25:19.796	completed
20455cf2-35bb-4525-9f8f-520b5501bcc5	5442e30a-59a6-411a-a356-cc2f432e46b3	eaa3fac9-f60f-4db1-b33a-a4bd46e8ea71	1	45000	\N	0	\N	2026-08-13 09:25:19.796	completed
d100cd4a-c5ee-4d3c-8be8-52e249f7e125	5442e30a-59a6-411a-a356-cc2f432e46b3	219c20d2-6247-4e8b-a734-53cfbd90ba88	2	52000	\N	0	\N	2026-08-13 09:25:19.796	completed
d79be3c6-61b5-4431-9fb3-d6ba83be7899	dc68ea32-8e65-4e4c-893b-188c588791d3	cbc78f47-cb0d-4d34-80e1-841ec7b0e5de	1	48000	\N	0	\N	2026-08-13 09:25:19.805	completed
de6b4dd9-c7c4-4bc1-9a3e-d76424915047	dc68ea32-8e65-4e4c-893b-188c588791d3	86643a05-ac82-4216-bdf8-87fcd64da8ec	3	48000	\N	0	\N	2026-08-13 09:25:19.805	completed
64e636f1-b316-459c-8aab-67e1eaf4603f	dc68ea32-8e65-4e4c-893b-188c588791d3	c0917f04-365b-4cdc-9b75-e49a7c492727	1	48000	\N	0	\N	2026-08-13 09:25:19.805	completed
f9bdc0cf-eda2-4d52-83c8-981916ee9a9b	dc68ea32-8e65-4e4c-893b-188c588791d3	daa4bd17-296f-4da1-8d21-15534fa8e045	3	25000	\N	0	\N	2026-08-13 09:25:19.805	completed
170195ac-4ddc-43b8-bf99-9a1c6048b134	dc68ea32-8e65-4e4c-893b-188c588791d3	cbc78f47-cb0d-4d34-80e1-841ec7b0e5de	1	48000	\N	0	\N	2026-08-13 09:25:19.805	completed
e57f6b08-b037-4a68-bea6-dba390bbc44b	dc68ea32-8e65-4e4c-893b-188c588791d3	884570a1-2822-4840-a08f-fc4a4a3b5fad	2	48000	\N	0	\N	2026-08-13 09:25:19.805	completed
f0d1073d-f415-413c-8969-d09d5a64f1cc	dc68ea32-8e65-4e4c-893b-188c588791d3	27af0495-2d91-4cb0-af88-4752edf671dc	4	10000	\N	0	\N	2026-08-13 09:25:19.805	completed
b4a29c77-64e1-4417-86ca-1b3e9448d44d	532bb693-1b2e-4dbb-9224-d94f90363a0b	acb42a52-c717-441a-824b-8a18079ee46c	4	50000	\N	0	\N	2026-08-13 09:25:19.815	completed
407effc0-2686-4187-83ae-26afa6755504	532bb693-1b2e-4dbb-9224-d94f90363a0b	0b97d8bc-ffce-4904-8c46-87752b930f5e	1	45000	\N	0	\N	2026-08-13 09:25:19.815	completed
67de7f03-b083-4420-b995-4717c097bc53	532bb693-1b2e-4dbb-9224-d94f90363a0b	625d086d-e1db-42f3-9cd5-84006fb429c1	2	48000	\N	0	\N	2026-08-13 09:25:19.815	completed
6183c02f-bfe9-462e-aed3-fa7ddf51441f	532bb693-1b2e-4dbb-9224-d94f90363a0b	3aac02bc-fcc6-4532-9a50-fa50790dd4cb	4	32000	\N	0	\N	2026-08-13 09:25:19.815	completed
4d61fe92-485e-4166-b4f3-0f6e73d289e1	532bb693-1b2e-4dbb-9224-d94f90363a0b	6798927c-bcba-49fd-a7ad-78291c69ac33	4	52000	\N	0	\N	2026-08-13 09:25:19.815	completed
679a4edf-fe3c-4bce-b53f-47b2e185af2f	532bb693-1b2e-4dbb-9224-d94f90363a0b	eaa3fac9-f60f-4db1-b33a-a4bd46e8ea71	3	45000	\N	0	\N	2026-08-13 09:25:19.815	completed
219a3492-1ceb-4fe1-9ac6-f8cba1f5745a	532bb693-1b2e-4dbb-9224-d94f90363a0b	ce6673bb-c51b-4a4f-ab3d-810e44601734	1	28000	\N	0	\N	2026-08-13 09:25:19.815	completed
fe189654-22ea-4b2a-a533-9688dab9ca2a	532bb693-1b2e-4dbb-9224-d94f90363a0b	625d086d-e1db-42f3-9cd5-84006fb429c1	2	48000	\N	0	\N	2026-08-13 09:25:19.815	completed
55f5605a-41c4-4031-b14d-391202aa2337	f86aa9dc-6497-4d69-b7b1-d8be77dfb997	e24a6cc9-1b6e-4ba7-94a5-514f6aa8fe31	2	45000	\N	0	\N	2026-08-13 09:25:19.824	completed
f7fbb993-a5d7-42f0-b856-f8ce8938e6c1	f86aa9dc-6497-4d69-b7b1-d8be77dfb997	d849f917-4afe-4a94-8866-03848a938c79	2	35000	\N	0	\N	2026-08-13 09:25:19.824	completed
dda66514-8cc8-42fa-83e7-8dc658728be2	f86aa9dc-6497-4d69-b7b1-d8be77dfb997	96531f07-be37-454a-aa0c-4a0eaab99930	1	55000	\N	0	\N	2026-08-13 09:25:19.824	completed
11cf9195-68b7-4b5a-ad8f-2d86a0fe5569	f86aa9dc-6497-4d69-b7b1-d8be77dfb997	25a8343a-39c3-457e-9c1d-13689bd6469b	1	45000	\N	0	\N	2026-08-13 09:25:19.824	completed
f6d22394-3c35-4096-bfe7-939118770f82	f86aa9dc-6497-4d69-b7b1-d8be77dfb997	3a6ff9b1-cc6c-45ae-9635-ab2b2d03c232	1	38000	\N	0	\N	2026-08-13 09:25:19.824	completed
cf5474ed-2dda-4cd1-a7c9-3d98977fb35f	f86aa9dc-6497-4d69-b7b1-d8be77dfb997	228cd2ca-0ce1-44ff-92d8-05b7c9480e55	2	42000	\N	0	\N	2026-08-13 09:25:19.824	completed
d2ec2637-1108-4ff2-ba65-6aadb49ff0c4	f86aa9dc-6497-4d69-b7b1-d8be77dfb997	83ff8a95-3eb4-4b98-9978-63aa6d1b8323	1	55000	\N	0	\N	2026-08-13 09:25:19.824	completed
2a152c8f-2574-41fb-83f3-6c1a72783b22	3b272102-d0dc-410e-adf7-04076e5149b0	e24a6cc9-1b6e-4ba7-94a5-514f6aa8fe31	3	45000	\N	0	\N	2026-08-13 09:25:19.83	completed
08daae82-0ed0-4a49-9c28-5962c7f51789	3b272102-d0dc-410e-adf7-04076e5149b0	27af0495-2d91-4cb0-af88-4752edf671dc	2	10000	\N	0	\N	2026-08-13 09:25:19.83	completed
e1058cb8-ffe5-4acd-8d46-971d16a7f56d	3b272102-d0dc-410e-adf7-04076e5149b0	0b97d8bc-ffce-4904-8c46-87752b930f5e	2	45000	\N	0	\N	2026-08-13 09:25:19.83	completed
b9b9e99a-da87-4f61-a741-5ede5a8c48bf	3b272102-d0dc-410e-adf7-04076e5149b0	3aac02bc-fcc6-4532-9a50-fa50790dd4cb	1	32000	\N	0	\N	2026-08-13 09:25:19.83	completed
06740477-c0d0-47a9-b853-5c6eef86406e	3b272102-d0dc-410e-adf7-04076e5149b0	eaa3fac9-f60f-4db1-b33a-a4bd46e8ea71	4	45000	\N	0	\N	2026-08-13 09:25:19.83	completed
9ef9c441-7b1f-4cfc-ad43-3d70af02a0dd	3b272102-d0dc-410e-adf7-04076e5149b0	803bcdee-17d3-41fc-a249-4e8d16b49575	3	48000	\N	0	\N	2026-08-13 09:25:19.83	completed
17cdc408-f030-42ee-96ac-a15552637508	178ada1c-bd5d-4e40-9ae4-45063e44be08	ceed2a39-e4e2-486c-b228-a909a81d8487	3	20000	\N	0	\N	2026-08-13 09:25:19.835	completed
8a01eb3a-7a02-4668-8fd4-1c245adeba85	178ada1c-bd5d-4e40-9ae4-45063e44be08	5bc34fc9-24c2-4108-af83-5992af2291d6	4	40000	\N	0	\N	2026-08-13 09:25:19.835	completed
adc4213e-2d62-4096-afae-15a38b481a46	178ada1c-bd5d-4e40-9ae4-45063e44be08	ceed2a39-e4e2-486c-b228-a909a81d8487	1	20000	\N	0	\N	2026-08-13 09:25:19.835	completed
700cbc62-1b44-42d2-853d-5163c43b07ac	178ada1c-bd5d-4e40-9ae4-45063e44be08	cbc78f47-cb0d-4d34-80e1-841ec7b0e5de	2	48000	\N	0	\N	2026-08-13 09:25:19.835	completed
34a17d61-4daf-4c88-a818-3298ea173fca	663ef4e5-9d01-40a3-9b37-b9ceb3b19955	cbc78f47-cb0d-4d34-80e1-841ec7b0e5de	1	48000	\N	0	\N	2026-08-13 09:25:19.845	completed
029b19a3-b7bd-42bd-82ec-7c8e2dcde8dd	663ef4e5-9d01-40a3-9b37-b9ceb3b19955	6798927c-bcba-49fd-a7ad-78291c69ac33	1	52000	\N	0	\N	2026-08-13 09:25:19.845	completed
5c8a0ee9-51a2-49d5-b8f0-78c42b81b2dd	663ef4e5-9d01-40a3-9b37-b9ceb3b19955	ceed2a39-e4e2-486c-b228-a909a81d8487	4	20000	\N	0	\N	2026-08-13 09:25:19.845	completed
272b0a5c-73c8-4785-a104-6ebb12d2d21f	1c75af2c-44d3-4482-b871-882071a54938	f731a039-1a1f-413d-826c-0955bb9eea80	2	55000	\N	0	\N	2026-08-13 09:25:19.853	completed
c4b59854-5009-47bb-9ffc-e415ede50f81	1c75af2c-44d3-4482-b871-882071a54938	12b460b3-749d-4ab1-80de-d8f51d5188cc	2	40000	\N	0	\N	2026-08-13 09:25:19.853	completed
a65f67c6-80f6-47bb-bf19-5a0d2557b1fa	1c75af2c-44d3-4482-b871-882071a54938	25a8343a-39c3-457e-9c1d-13689bd6469b	3	45000	\N	0	\N	2026-08-13 09:25:19.853	completed
46384823-180f-4191-a32e-1ba11ea0206b	1c75af2c-44d3-4482-b871-882071a54938	ce6673bb-c51b-4a4f-ab3d-810e44601734	3	28000	\N	0	\N	2026-08-13 09:25:19.853	completed
28416999-f7a6-49d4-b306-543db4b25cc2	1c75af2c-44d3-4482-b871-882071a54938	cbc78f47-cb0d-4d34-80e1-841ec7b0e5de	4	48000	\N	0	\N	2026-08-13 09:25:19.853	completed
0bcf2ab7-8cbd-4219-9e91-9490b01eaa87	1c75af2c-44d3-4482-b871-882071a54938	625d086d-e1db-42f3-9cd5-84006fb429c1	2	48000	\N	0	\N	2026-08-13 09:25:19.853	completed
2c454444-3d1c-4b0a-97cf-bc033eecc74b	1c75af2c-44d3-4482-b871-882071a54938	35fbf376-436a-45ea-89a5-41560d3be32b	4	35000	\N	0	\N	2026-08-13 09:25:19.853	completed
750c2b8c-9b6d-4f82-92f8-19f76bee596d	1c75af2c-44d3-4482-b871-882071a54938	b429cd3c-c501-4b4a-b028-9ab5feedc41e	2	52000	\N	0	\N	2026-08-13 09:25:19.853	completed
181d5b88-26d4-45a6-afc6-89cd9813fe7f	77885b5c-7834-4210-a4df-4bb5efdf9bcc	e718f02b-b657-444d-89ae-fb910537eb6c	3	42000	\N	0	\N	2026-08-13 09:25:19.863	completed
c2908649-c3c2-44ee-a7fb-bd20cd2565d9	77885b5c-7834-4210-a4df-4bb5efdf9bcc	01d338fc-cbda-492d-b496-2a55e100d813	1	45000	\N	0	\N	2026-08-13 09:25:19.863	completed
e08ef2a2-5e5f-4d82-b465-0242db798d4c	77885b5c-7834-4210-a4df-4bb5efdf9bcc	a02247ba-a10e-4387-967d-e69a05c8193a	2	32000	\N	0	\N	2026-08-13 09:25:19.863	completed
e5fa9807-b4bd-4475-b555-cd7bcb915041	77885b5c-7834-4210-a4df-4bb5efdf9bcc	e9bd0cdf-4357-4313-8b02-7f8260f6992f	3	52000	\N	0	\N	2026-08-13 09:25:19.863	completed
baf4d519-fcba-466a-a453-47ad907933ef	77885b5c-7834-4210-a4df-4bb5efdf9bcc	7804beb7-b72c-43db-a27a-82b955e5e31c	4	25000	\N	0	\N	2026-08-13 09:25:19.863	completed
fa0d7e68-4828-4cb3-8236-3e888bc74f48	77885b5c-7834-4210-a4df-4bb5efdf9bcc	bcff5008-981c-428b-b652-31d8c1378d9f	2	28000	\N	0	\N	2026-08-13 09:25:19.863	completed
43c8f155-e3f8-4de2-b253-9716d46437d6	77885b5c-7834-4210-a4df-4bb5efdf9bcc	219c20d2-6247-4e8b-a734-53cfbd90ba88	2	52000	\N	0	\N	2026-08-13 09:25:19.863	completed
9cf1624a-000d-4073-b94d-d8eeb8946dca	e91c3802-9280-4334-a993-1d77ea01c059	8f09b4ea-702e-4845-b2c0-59b3bf810d9d	1	38000	\N	0	\N	2026-08-13 09:25:19.871	completed
06a37367-f098-4ca9-9331-2e97b163e354	e91c3802-9280-4334-a993-1d77ea01c059	bcff5008-981c-428b-b652-31d8c1378d9f	2	28000	\N	0	\N	2026-08-13 09:25:19.871	completed
077ecf47-3f14-4024-bbaf-0e58254e81ea	e91c3802-9280-4334-a993-1d77ea01c059	01d338fc-cbda-492d-b496-2a55e100d813	4	45000	\N	0	\N	2026-08-13 09:25:19.871	completed
9db96f18-e45e-4af7-b04f-20a97ab83f48	e91c3802-9280-4334-a993-1d77ea01c059	cbc78f47-cb0d-4d34-80e1-841ec7b0e5de	2	48000	\N	0	\N	2026-08-13 09:25:19.871	completed
551dfc05-8a2b-4194-8fea-8a322c5b81ac	4da0691b-0131-43d4-b6c0-da3bcaa6985d	2ce5c559-70e1-4bdd-8cf0-fcdf2a843273	3	46000	\N	0	\N	2026-08-13 09:25:19.875	completed
10f3d307-af57-402f-9dae-4d3e9eaf7a31	4da0691b-0131-43d4-b6c0-da3bcaa6985d	ceed2a39-e4e2-486c-b228-a909a81d8487	3	20000	\N	0	\N	2026-08-13 09:25:19.875	completed
fe09adb7-3a62-4800-bb63-21a5b2e8a3e2	4da0691b-0131-43d4-b6c0-da3bcaa6985d	eb1dae05-cb14-4000-ba10-260f9cd79124	1	45000	\N	0	\N	2026-08-13 09:25:19.875	completed
88ea040c-ca45-4fe0-b882-ffd523e357aa	4da0691b-0131-43d4-b6c0-da3bcaa6985d	ceed2a39-e4e2-486c-b228-a909a81d8487	2	20000	\N	0	\N	2026-08-13 09:25:19.875	completed
3055d38e-6d59-48e3-b1c3-c9b714900ad5	4da0691b-0131-43d4-b6c0-da3bcaa6985d	35fbf376-436a-45ea-89a5-41560d3be32b	3	35000	\N	0	\N	2026-08-13 09:25:19.875	completed
1d5f1d3e-bbf5-40a8-b390-34feb26b091e	4da0691b-0131-43d4-b6c0-da3bcaa6985d	228cd2ca-0ce1-44ff-92d8-05b7c9480e55	4	42000	\N	0	\N	2026-08-13 09:25:19.875	completed
2a8c5bcd-6bae-4c30-bbf1-ff202b5205c1	4da0691b-0131-43d4-b6c0-da3bcaa6985d	219c20d2-6247-4e8b-a734-53cfbd90ba88	1	52000	\N	0	\N	2026-08-13 09:25:19.875	completed
86b1eeac-5c0b-4697-ae01-a55c530a9045	a8e04cdb-8c14-44ec-9f79-ba9b2ecd96d0	a02247ba-a10e-4387-967d-e69a05c8193a	2	32000	\N	0	\N	2026-08-13 09:25:19.881	completed
ac31bc86-9a01-4d01-a090-5c93a1ac7cfc	a8e04cdb-8c14-44ec-9f79-ba9b2ecd96d0	7484d38a-54a0-49c7-baa2-a93fdce6d347	2	55000	\N	0	\N	2026-08-13 09:25:19.881	completed
fee61724-5ebb-4d82-9fde-bc4d7ef33373	a8e04cdb-8c14-44ec-9f79-ba9b2ecd96d0	daa4bd17-296f-4da1-8d21-15534fa8e045	4	25000	\N	0	\N	2026-08-13 09:25:19.881	completed
d2ce9d02-dae6-44c4-8c50-6d1ca5ff7a3b	a8e04cdb-8c14-44ec-9f79-ba9b2ecd96d0	625d086d-e1db-42f3-9cd5-84006fb429c1	1	48000	\N	0	\N	2026-08-13 09:25:19.881	completed
13b3c279-0ba6-4a8e-bbb7-ff76127a7122	3a9d17c3-bd34-4a63-8799-ece09949918a	d21a6806-fffa-4462-b33f-2c91a1c6b013	2	50000	\N	0	\N	2026-08-13 09:25:19.889	completed
3fd6b409-55da-4201-8e37-ebafee683755	3a9d17c3-bd34-4a63-8799-ece09949918a	35fbf376-436a-45ea-89a5-41560d3be32b	2	35000	\N	0	\N	2026-08-13 09:25:19.889	completed
15e00f60-1993-4e30-9ad8-816c679c5d1d	3a9d17c3-bd34-4a63-8799-ece09949918a	d21a6806-fffa-4462-b33f-2c91a1c6b013	4	50000	\N	0	\N	2026-08-13 09:25:19.889	completed
4986db21-72ea-425d-b353-64bb0426efa5	3a9d17c3-bd34-4a63-8799-ece09949918a	219c20d2-6247-4e8b-a734-53cfbd90ba88	1	52000	\N	0	\N	2026-08-13 09:25:19.889	completed
731e279f-551c-4aff-86af-c1e43a57c10c	3a9d17c3-bd34-4a63-8799-ece09949918a	51c45fec-e0e7-489e-8339-02a536d2e857	1	45000	\N	0	\N	2026-08-13 09:25:19.889	completed
3d00ad06-7d5c-40cf-9900-822ab9823660	3a9d17c3-bd34-4a63-8799-ece09949918a	308d182c-58a9-47d9-a56a-bba4a473ae24	2	42000	\N	0	\N	2026-08-13 09:25:19.889	completed
6befffbf-f6e0-4c03-9657-1f5b682b78ba	ce6e9e5d-801f-45af-ab31-83de9c9e3d5e	a02247ba-a10e-4387-967d-e69a05c8193a	1	32000	\N	0	\N	2026-08-13 09:25:19.899	completed
1d747589-887a-45f7-ad53-35a85525e4ff	ce6e9e5d-801f-45af-ab31-83de9c9e3d5e	308d182c-58a9-47d9-a56a-bba4a473ae24	4	42000	\N	0	\N	2026-08-13 09:25:19.899	completed
bc62c5cc-187a-42de-992e-a584795c721a	ce6e9e5d-801f-45af-ab31-83de9c9e3d5e	ceed2a39-e4e2-486c-b228-a909a81d8487	4	20000	\N	0	\N	2026-08-13 09:25:19.899	completed
1ffcbe6a-e32d-4193-a5bf-f62c5718daf3	a77e2ff4-ac55-4c78-8366-288eea982c0c	daa4bd17-296f-4da1-8d21-15534fa8e045	3	25000	\N	0	\N	2026-08-13 09:25:19.903	completed
38caf808-6727-409c-a5df-8eff916144bc	a77e2ff4-ac55-4c78-8366-288eea982c0c	803bcdee-17d3-41fc-a249-4e8d16b49575	2	48000	\N	0	\N	2026-08-13 09:25:19.903	completed
e8d9ffb7-79b0-4b64-b95f-8c759b4e62d5	a77e2ff4-ac55-4c78-8366-288eea982c0c	cbc78f47-cb0d-4d34-80e1-841ec7b0e5de	2	48000	\N	0	\N	2026-08-13 09:25:19.903	completed
10efef66-0bce-4f04-b7cb-09655fb44bec	a77e2ff4-ac55-4c78-8366-288eea982c0c	f731a039-1a1f-413d-826c-0955bb9eea80	1	55000	\N	0	\N	2026-08-13 09:25:19.903	completed
009a6f06-c998-4871-b9a2-34c1a013ceaa	a77e2ff4-ac55-4c78-8366-288eea982c0c	d849f917-4afe-4a94-8866-03848a938c79	4	35000	\N	0	\N	2026-08-13 09:25:19.903	completed
ce18985f-866d-4b67-b347-da20bb8a7b1c	a77e2ff4-ac55-4c78-8366-288eea982c0c	219c20d2-6247-4e8b-a734-53cfbd90ba88	4	52000	\N	0	\N	2026-08-13 09:25:19.903	completed
a57212a7-9962-4ef8-9cba-42520324716d	a77e2ff4-ac55-4c78-8366-288eea982c0c	83ceb824-bbdc-4b06-a867-037ded0aef0e	1	50000	\N	0	\N	2026-08-13 09:25:19.903	completed
3c18e36d-21f4-4cb1-8ad5-f2451dbde2be	60f65814-9d8f-4d85-93da-2b78c5c29d8e	86643a05-ac82-4216-bdf8-87fcd64da8ec	4	48000	\N	0	\N	2026-08-13 09:25:19.912	completed
37d70b4f-25c9-4762-89ec-560d463aec67	60f65814-9d8f-4d85-93da-2b78c5c29d8e	c24edbc4-7c7a-4228-9b3c-1b95c2be051c	2	48000	\N	0	\N	2026-08-13 09:25:19.912	completed
660fbe5e-b803-46fb-9d5c-4ad132a140fe	60f65814-9d8f-4d85-93da-2b78c5c29d8e	cbc78f47-cb0d-4d34-80e1-841ec7b0e5de	4	48000	\N	0	\N	2026-08-13 09:25:19.912	completed
25c76872-3bfc-4517-92ad-9b46638e8185	60f65814-9d8f-4d85-93da-2b78c5c29d8e	daa4bd17-296f-4da1-8d21-15534fa8e045	1	25000	\N	0	\N	2026-08-13 09:25:19.912	completed
d11c01f9-e971-4ecf-9c20-c815c58f88f3	60f65814-9d8f-4d85-93da-2b78c5c29d8e	3a6ff9b1-cc6c-45ae-9635-ab2b2d03c232	1	38000	\N	0	\N	2026-08-13 09:25:19.912	completed
4a27fa87-7673-4661-a19e-60f931a7afb0	60f65814-9d8f-4d85-93da-2b78c5c29d8e	acb42a52-c717-441a-824b-8a18079ee46c	2	50000	\N	0	\N	2026-08-13 09:25:19.912	completed
4daefa7b-e6c3-478a-87e2-3407bb7493a7	60f65814-9d8f-4d85-93da-2b78c5c29d8e	d849f917-4afe-4a94-8866-03848a938c79	2	35000	\N	0	\N	2026-08-13 09:25:19.912	completed
688ea6f8-e0a4-4b92-a567-1c5a3d9867a1	06db2960-5b2e-420a-acac-971b937b5412	5bc34fc9-24c2-4108-af83-5992af2291d6	1	40000	\N	0	\N	2026-08-13 09:25:19.916	completed
878f341f-1120-4c51-b104-d009aa59a854	06db2960-5b2e-420a-acac-971b937b5412	3a6ff9b1-cc6c-45ae-9635-ab2b2d03c232	3	38000	\N	0	\N	2026-08-13 09:25:19.916	completed
25e37ea0-9083-4779-bf0e-af170b374b5b	06db2960-5b2e-420a-acac-971b937b5412	c0917f04-365b-4cdc-9b75-e49a7c492727	2	48000	\N	0	\N	2026-08-13 09:25:19.916	completed
291b8bc1-70da-447c-8627-ac7dd76987a2	9dd49790-f59a-4479-8ad3-4d22accc4838	00acd18c-4b3a-4737-a36c-530f2c16d3b6	3	38000	\N	0	\N	2026-08-13 09:25:19.923	completed
d75c759f-8989-45da-9d15-17df06974502	9dd49790-f59a-4479-8ad3-4d22accc4838	a02247ba-a10e-4387-967d-e69a05c8193a	1	32000	\N	0	\N	2026-08-13 09:25:19.923	completed
1ed3c3ce-2c98-4483-8eef-0b2cde701cf1	9dd49790-f59a-4479-8ad3-4d22accc4838	8f09b4ea-702e-4845-b2c0-59b3bf810d9d	1	38000	\N	0	\N	2026-08-13 09:25:19.923	completed
44347492-49a0-47d7-a28f-d71ff16c9e47	9dd49790-f59a-4479-8ad3-4d22accc4838	27af0495-2d91-4cb0-af88-4752edf671dc	3	10000	\N	0	\N	2026-08-13 09:25:19.923	completed
b7cbe9f3-232c-4a24-895d-f50ddd82daab	9dd49790-f59a-4479-8ad3-4d22accc4838	ce6673bb-c51b-4a4f-ab3d-810e44601734	3	28000	\N	0	\N	2026-08-13 09:25:19.923	completed
a6501445-b7fd-4e14-b850-b52fdde2ad82	9dd49790-f59a-4479-8ad3-4d22accc4838	35fbf376-436a-45ea-89a5-41560d3be32b	1	35000	\N	0	\N	2026-08-13 09:25:19.923	completed
1a3347e7-922f-4877-98da-36c5020405b5	e956c605-56f6-4a01-b65b-bcd00c7ef89b	884570a1-2822-4840-a08f-fc4a4a3b5fad	1	48000	\N	0	\N	2026-08-13 09:25:19.929	completed
a880543d-89d4-42d3-aeb8-628459727400	e956c605-56f6-4a01-b65b-bcd00c7ef89b	81d6f3b5-b26a-4dd0-bfca-fea91a42a296	4	35000	\N	0	\N	2026-08-13 09:25:19.929	completed
b688956c-aa34-43ce-a51f-84172359ba7e	e956c605-56f6-4a01-b65b-bcd00c7ef89b	cbc78f47-cb0d-4d34-80e1-841ec7b0e5de	4	48000	\N	0	\N	2026-08-13 09:25:19.929	completed
c51fbd4e-4957-4e6f-8255-96ddc94ad453	e956c605-56f6-4a01-b65b-bcd00c7ef89b	5bc34fc9-24c2-4108-af83-5992af2291d6	1	40000	\N	0	\N	2026-08-13 09:25:19.929	completed
c7404cfd-111a-48ea-9258-bc6c4a779ba1	e956c605-56f6-4a01-b65b-bcd00c7ef89b	884570a1-2822-4840-a08f-fc4a4a3b5fad	1	48000	\N	0	\N	2026-08-13 09:25:19.929	completed
94be1931-8e25-4103-b0ce-0d89f53ba8a0	e956c605-56f6-4a01-b65b-bcd00c7ef89b	219c20d2-6247-4e8b-a734-53cfbd90ba88	4	52000	\N	0	\N	2026-08-13 09:25:19.929	completed
dfa1fbe9-9a31-4647-8d72-ca6104ac1760	e956c605-56f6-4a01-b65b-bcd00c7ef89b	b6a4c689-bce0-4d87-883b-b0de919eba27	4	58000	\N	0	\N	2026-08-13 09:25:19.929	completed
14e3aaf7-0d6a-4118-b94b-cde52695ae06	561c8090-3837-4e36-97ca-b3e3759835e4	d9f1fb87-e737-4210-a5bf-1bc0ba885771	1	42000	\N	0	\N	2026-08-13 09:25:19.939	completed
947133c8-173f-48d4-bf66-01b596fa3de1	561c8090-3837-4e36-97ca-b3e3759835e4	3aac02bc-fcc6-4532-9a50-fa50790dd4cb	3	32000	\N	0	\N	2026-08-13 09:25:19.939	completed
5e1d68b8-e3b5-483a-b231-3d463a927bba	561c8090-3837-4e36-97ca-b3e3759835e4	884570a1-2822-4840-a08f-fc4a4a3b5fad	3	48000	\N	0	\N	2026-08-13 09:25:19.939	completed
9c94450e-3373-4c63-b60a-345e7259f0e6	fbb39031-d349-49e6-b776-2bc214694c0d	0b97d8bc-ffce-4904-8c46-87752b930f5e	2	45000	\N	0	\N	2026-08-13 09:25:19.944	completed
c764e8f9-242b-4460-ab74-47380a44d0ee	fbb39031-d349-49e6-b776-2bc214694c0d	7484d38a-54a0-49c7-baa2-a93fdce6d347	1	55000	\N	0	\N	2026-08-13 09:25:19.944	completed
7fcd2e32-1c48-454d-93f3-49c77d9b1546	fbb39031-d349-49e6-b776-2bc214694c0d	3aac02bc-fcc6-4532-9a50-fa50790dd4cb	1	32000	\N	0	\N	2026-08-13 09:25:19.944	completed
3b0f97e7-12f2-4782-9106-fce384794d73	fbb39031-d349-49e6-b776-2bc214694c0d	5ba65aef-1f61-4c68-b8c1-d847553c8aef	3	52000	\N	0	\N	2026-08-13 09:25:19.944	completed
7f6ba5b8-cc11-402b-ae54-76da85cba324	fbb39031-d349-49e6-b776-2bc214694c0d	884570a1-2822-4840-a08f-fc4a4a3b5fad	4	48000	\N	0	\N	2026-08-13 09:25:19.944	completed
a317a3de-0ce5-4cc0-a83f-82909827010e	fbb39031-d349-49e6-b776-2bc214694c0d	d52c0006-3bcd-48c7-ab83-082061dc6764	1	42000	\N	0	\N	2026-08-13 09:25:19.944	completed
ed2fabab-45da-4df3-b8dc-146b009ad4e2	c7353d96-3ed8-4565-b5b0-c3f273148a25	e718f02b-b657-444d-89ae-fb910537eb6c	1	42000	\N	0	\N	2026-08-13 09:25:19.949	completed
8b7f5541-592a-4423-b706-83ea24fc48f9	c7353d96-3ed8-4565-b5b0-c3f273148a25	2ce5c559-70e1-4bdd-8cf0-fcdf2a843273	4	46000	\N	0	\N	2026-08-13 09:25:19.949	completed
2d3782d1-2bbb-41e6-8c8e-2d11af370fde	c7353d96-3ed8-4565-b5b0-c3f273148a25	cb1888fc-f827-4522-b136-a22bf86816c2	4	35000	\N	0	\N	2026-08-13 09:25:19.949	completed
8c2ae85a-ac58-44e7-a1df-22918518d44b	483168d3-1d27-42b1-963d-4487edfdc8d5	8f09b4ea-702e-4845-b2c0-59b3bf810d9d	3	38000	\N	0	\N	2026-08-13 09:25:19.958	completed
c60b5c34-9b43-4086-b2e3-834c12ed760f	483168d3-1d27-42b1-963d-4487edfdc8d5	625d086d-e1db-42f3-9cd5-84006fb429c1	3	48000	\N	0	\N	2026-08-13 09:25:19.958	completed
bc0d1800-6d8c-4096-8cb0-646a43100fbe	483168d3-1d27-42b1-963d-4487edfdc8d5	d52c0006-3bcd-48c7-ab83-082061dc6764	1	42000	\N	0	\N	2026-08-13 09:25:19.958	completed
7f750f26-d9d1-4d03-ab21-35a7c7086e00	483168d3-1d27-42b1-963d-4487edfdc8d5	d52c0006-3bcd-48c7-ab83-082061dc6764	4	42000	\N	0	\N	2026-08-13 09:25:19.958	completed
0c7bab72-3a7e-4cd0-9a13-f3ba4d99daf7	483168d3-1d27-42b1-963d-4487edfdc8d5	10b0cc63-2c10-44ef-bf34-8d19b7fda2bb	4	55000	\N	0	\N	2026-08-13 09:25:19.958	completed
02438abd-411c-4d0b-9a42-c39661f5eb3e	483168d3-1d27-42b1-963d-4487edfdc8d5	c0917f04-365b-4cdc-9b75-e49a7c492727	4	48000	\N	0	\N	2026-08-13 09:25:19.958	completed
32327dec-50a0-4213-813c-901f5625d347	483168d3-1d27-42b1-963d-4487edfdc8d5	51c45fec-e0e7-489e-8339-02a536d2e857	2	45000	\N	0	\N	2026-08-13 09:25:19.958	completed
5bcaa953-17f6-4b07-bbec-b569a73ed325	ff729df8-a4cf-4fb8-84a1-b990496459e3	2ce5c559-70e1-4bdd-8cf0-fcdf2a843273	4	46000	\N	0	\N	2026-08-13 09:25:19.967	completed
43ef4fdb-2d10-4506-afb4-30a859f06aef	ff729df8-a4cf-4fb8-84a1-b990496459e3	ceed2a39-e4e2-486c-b228-a909a81d8487	3	20000	\N	0	\N	2026-08-13 09:25:19.967	completed
40eb81a9-a8fa-44d4-b2ed-65daeb7279e1	ff729df8-a4cf-4fb8-84a1-b990496459e3	b6a4c689-bce0-4d87-883b-b0de919eba27	2	58000	\N	0	\N	2026-08-13 09:25:19.967	completed
eedff8b8-369c-48cd-9cc5-51b4bff6b0ab	ff729df8-a4cf-4fb8-84a1-b990496459e3	228cd2ca-0ce1-44ff-92d8-05b7c9480e55	1	42000	\N	0	\N	2026-08-13 09:25:19.967	completed
5d65c924-d2a0-4f17-99e7-89a1a4c09948	ff729df8-a4cf-4fb8-84a1-b990496459e3	c0917f04-365b-4cdc-9b75-e49a7c492727	3	48000	\N	0	\N	2026-08-13 09:25:19.967	completed
87d12ace-3819-4df0-ba05-82b0bde69eca	9b669f7d-6651-4435-ab38-2619c7a606db	01d338fc-cbda-492d-b496-2a55e100d813	1	45000	\N	0	\N	2026-08-13 09:25:19.976	completed
c680512d-10b9-4669-9fe1-7e943ef4004e	9b669f7d-6651-4435-ab38-2619c7a606db	a02247ba-a10e-4387-967d-e69a05c8193a	2	32000	\N	0	\N	2026-08-13 09:25:19.976	completed
4e7705de-a26b-40c9-9403-71606e5b9316	9b669f7d-6651-4435-ab38-2619c7a606db	625d086d-e1db-42f3-9cd5-84006fb429c1	2	48000	\N	0	\N	2026-08-13 09:25:19.976	completed
adc2dda9-d63c-4072-ad90-2f31a2d9fdc6	9b669f7d-6651-4435-ab38-2619c7a606db	00acd18c-4b3a-4737-a36c-530f2c16d3b6	2	38000	\N	0	\N	2026-08-13 09:25:19.976	completed
17986d6b-aa66-4119-9c6a-804af123b716	9b669f7d-6651-4435-ab38-2619c7a606db	acb42a52-c717-441a-824b-8a18079ee46c	3	50000	\N	0	\N	2026-08-13 09:25:19.976	completed
9a5cd2ba-5b3a-4a55-92c5-ef37deb4e951	9b669f7d-6651-4435-ab38-2619c7a606db	3aac02bc-fcc6-4532-9a50-fa50790dd4cb	3	32000	\N	0	\N	2026-08-13 09:25:19.976	completed
fd591914-b9bd-4377-b268-b5697cd5c12d	9b669f7d-6651-4435-ab38-2619c7a606db	f731a039-1a1f-413d-826c-0955bb9eea80	3	55000	\N	0	\N	2026-08-13 09:25:19.976	completed
48980142-846b-4f78-be61-09688d450498	d50bcb56-ff14-4271-bcb3-d37b123ff4f9	10b0cc63-2c10-44ef-bf34-8d19b7fda2bb	2	55000	\N	0	\N	2026-08-13 09:25:19.984	completed
b690dfd5-ebb0-4202-b59e-b68f41187af8	d50bcb56-ff14-4271-bcb3-d37b123ff4f9	cbc78f47-cb0d-4d34-80e1-841ec7b0e5de	3	48000	\N	0	\N	2026-08-13 09:25:19.984	completed
ef905dc5-6991-4901-abd3-ce306a06480a	d50bcb56-ff14-4271-bcb3-d37b123ff4f9	30ef5deb-6b46-47d1-a98c-8bc060d62b44	4	45000	\N	0	\N	2026-08-13 09:25:19.984	completed
906a007a-42c3-46c9-9460-7801c6207fec	d50bcb56-ff14-4271-bcb3-d37b123ff4f9	eaa3fac9-f60f-4db1-b33a-a4bd46e8ea71	3	45000	\N	0	\N	2026-08-13 09:25:19.984	completed
54ce054b-c3bf-4d3d-b2b2-3e6752d0d3b3	d50bcb56-ff14-4271-bcb3-d37b123ff4f9	81d6f3b5-b26a-4dd0-bfca-fea91a42a296	3	35000	\N	0	\N	2026-08-13 09:25:19.984	completed
967f49d1-a9a0-40c5-ab2b-73b5cb7d0dd7	d50bcb56-ff14-4271-bcb3-d37b123ff4f9	d52c0006-3bcd-48c7-ab83-082061dc6764	4	42000	\N	0	\N	2026-08-13 09:25:19.984	completed
645b2b41-697b-4148-827d-9b96895fbc32	d50bcb56-ff14-4271-bcb3-d37b123ff4f9	b1ee3afc-db38-468c-a4bf-38b51b772024	3	20000	\N	0	\N	2026-08-13 09:25:19.984	completed
204a3be4-945f-4485-b137-16522b13fb91	d50bcb56-ff14-4271-bcb3-d37b123ff4f9	7804beb7-b72c-43db-a27a-82b955e5e31c	2	25000	\N	0	\N	2026-08-13 09:25:19.984	completed
d7b7ae4d-f744-40c4-bbe9-551710095006	9045e714-37d5-42c0-9101-4a5d6e0c3cbd	01d338fc-cbda-492d-b496-2a55e100d813	4	45000	\N	0	\N	2026-08-13 09:25:19.989	completed
75816d4e-bad8-4ae3-a242-351ab32ce07f	9045e714-37d5-42c0-9101-4a5d6e0c3cbd	81d6f3b5-b26a-4dd0-bfca-fea91a42a296	4	35000	\N	0	\N	2026-08-13 09:25:19.989	completed
dcd74018-afc1-4424-87e6-966a8b627c7e	9045e714-37d5-42c0-9101-4a5d6e0c3cbd	27af0495-2d91-4cb0-af88-4752edf671dc	3	10000	\N	0	\N	2026-08-13 09:25:19.989	completed
189b8907-4a6a-427a-a58d-0a417fa898e6	9045e714-37d5-42c0-9101-4a5d6e0c3cbd	884570a1-2822-4840-a08f-fc4a4a3b5fad	2	48000	\N	0	\N	2026-08-13 09:25:19.989	completed
424c1252-82f8-4929-98b6-d4dbd978e2ab	9045e714-37d5-42c0-9101-4a5d6e0c3cbd	83ceb824-bbdc-4b06-a867-037ded0aef0e	4	50000	\N	0	\N	2026-08-13 09:25:19.989	completed
0f69130a-ba39-4ce4-bc35-90481cfe6bb9	9045e714-37d5-42c0-9101-4a5d6e0c3cbd	3a6ff9b1-cc6c-45ae-9635-ab2b2d03c232	1	38000	\N	0	\N	2026-08-13 09:25:19.989	completed
6f190aab-09f4-4e90-b6bd-a55a647fb5f9	9045e714-37d5-42c0-9101-4a5d6e0c3cbd	7484d38a-54a0-49c7-baa2-a93fdce6d347	4	55000	\N	0	\N	2026-08-13 09:25:19.989	completed
a6016e12-5493-4139-909c-2950513c123f	9045e714-37d5-42c0-9101-4a5d6e0c3cbd	00acd18c-4b3a-4737-a36c-530f2c16d3b6	4	38000	\N	0	\N	2026-08-13 09:25:19.989	completed
e82207fe-1b62-40fd-aa6f-36e13c34d52c	7c78d7c3-b7d0-4ebf-ba13-7d64ac4a66ba	d849f917-4afe-4a94-8866-03848a938c79	4	35000	\N	0	\N	2026-08-13 09:25:19.995	completed
5e662e8d-71df-4250-9694-e4a3f7329ae8	7c78d7c3-b7d0-4ebf-ba13-7d64ac4a66ba	b6a4c689-bce0-4d87-883b-b0de919eba27	3	58000	\N	0	\N	2026-08-13 09:25:19.995	completed
a64639e1-1005-4466-bb88-35f4ac7ad70c	7c78d7c3-b7d0-4ebf-ba13-7d64ac4a66ba	308d182c-58a9-47d9-a56a-bba4a473ae24	3	42000	\N	0	\N	2026-08-13 09:25:19.995	completed
45f716be-022b-43cf-97ff-9bfd60c4fcef	52ca97f2-224d-4741-9545-35612f78a28a	83ceb824-bbdc-4b06-a867-037ded0aef0e	4	50000	\N	0	\N	2026-08-13 09:25:20.004	completed
41d08e9e-737a-45f0-b5ba-400c988b3832	52ca97f2-224d-4741-9545-35612f78a28a	01d338fc-cbda-492d-b496-2a55e100d813	4	45000	\N	0	\N	2026-08-13 09:25:20.004	completed
77fea4ac-9e96-47aa-b0b6-6365e5a1a090	52ca97f2-224d-4741-9545-35612f78a28a	884570a1-2822-4840-a08f-fc4a4a3b5fad	1	48000	\N	0	\N	2026-08-13 09:25:20.004	completed
1213389e-fe8f-4df9-8031-8a151b9e2f5d	52ca97f2-224d-4741-9545-35612f78a28a	d9f1fb87-e737-4210-a5bf-1bc0ba885771	1	42000	\N	0	\N	2026-08-13 09:25:20.004	completed
5ec79758-c499-4452-99b6-8140057bb977	52ca97f2-224d-4741-9545-35612f78a28a	3aac02bc-fcc6-4532-9a50-fa50790dd4cb	2	32000	\N	0	\N	2026-08-13 09:25:20.004	completed
fd274ac2-1909-4464-b13d-0b59fdff598c	52ca97f2-224d-4741-9545-35612f78a28a	308d182c-58a9-47d9-a56a-bba4a473ae24	1	42000	\N	0	\N	2026-08-13 09:25:20.004	completed
5d1baac5-29d2-4dc4-b01a-faa9977fc45a	52ca97f2-224d-4741-9545-35612f78a28a	12b460b3-749d-4ab1-80de-d8f51d5188cc	2	40000	\N	0	\N	2026-08-13 09:25:20.004	completed
3435b764-29d1-4ca5-b74f-5ba5b966aec6	82088048-a119-42b4-9ef6-6eca9d533fe6	cbc78f47-cb0d-4d34-80e1-841ec7b0e5de	1	48000	\N	0	\N	2026-08-13 09:25:20.009	completed
9b8ed881-134f-491c-b3b1-816f7b5c2cb9	82088048-a119-42b4-9ef6-6eca9d533fe6	8f09b4ea-702e-4845-b2c0-59b3bf810d9d	1	38000	\N	0	\N	2026-08-13 09:25:20.009	completed
e9e613c6-eca5-4b8b-ac28-6c018bafc001	82088048-a119-42b4-9ef6-6eca9d533fe6	86643a05-ac82-4216-bdf8-87fcd64da8ec	1	48000	\N	0	\N	2026-08-13 09:25:20.009	completed
871beb00-849f-494c-be98-ac82703c8083	82088048-a119-42b4-9ef6-6eca9d533fe6	81d6f3b5-b26a-4dd0-bfca-fea91a42a296	2	35000	\N	0	\N	2026-08-13 09:25:20.009	completed
f7e8ade5-5f1f-48db-a48e-51bd7621dd56	82088048-a119-42b4-9ef6-6eca9d533fe6	96531f07-be37-454a-aa0c-4a0eaab99930	2	55000	\N	0	\N	2026-08-13 09:25:20.009	completed
bc1168bb-a3f8-442f-864a-5f1962cba355	ba26535b-dc47-4278-aa6c-15ef7d129538	5bc34fc9-24c2-4108-af83-5992af2291d6	1	40000	\N	0	\N	2026-08-13 09:25:20.014	completed
e750ebdc-f5cf-471a-850c-09d8edcd6bac	ba26535b-dc47-4278-aa6c-15ef7d129538	625d086d-e1db-42f3-9cd5-84006fb429c1	3	48000	\N	0	\N	2026-08-13 09:25:20.014	completed
d2318d5e-04d5-40ad-9049-4291ca0d11a5	ba26535b-dc47-4278-aa6c-15ef7d129538	5ba65aef-1f61-4c68-b8c1-d847553c8aef	3	52000	\N	0	\N	2026-08-13 09:25:20.014	completed
e24864cd-644d-4da8-b327-95cbe7933b3e	ba26535b-dc47-4278-aa6c-15ef7d129538	3aac02bc-fcc6-4532-9a50-fa50790dd4cb	3	32000	\N	0	\N	2026-08-13 09:25:20.014	completed
5595c047-bf75-41a2-ae71-8b9b2abbdf51	ba26535b-dc47-4278-aa6c-15ef7d129538	daa4bd17-296f-4da1-8d21-15534fa8e045	3	25000	\N	0	\N	2026-08-13 09:25:20.014	completed
a26529c8-19f3-4955-9eb1-5d5b7f014099	ba26535b-dc47-4278-aa6c-15ef7d129538	51c45fec-e0e7-489e-8339-02a536d2e857	3	45000	\N	0	\N	2026-08-13 09:25:20.014	completed
978ae8ff-7ee7-4664-ad26-dbc854a5b73f	ba26535b-dc47-4278-aa6c-15ef7d129538	25a8343a-39c3-457e-9c1d-13689bd6469b	4	45000	\N	0	\N	2026-08-13 09:25:20.014	completed
485f4260-d968-425a-90cb-524efa1ed299	7c449362-ebc1-4600-9f78-649f1be4613a	b1ee3afc-db38-468c-a4bf-38b51b772024	1	20000	\N	0	\N	2026-08-13 09:25:20.024	completed
6f604242-e5f7-4dd4-bc3a-d43d53b526ca	7c449362-ebc1-4600-9f78-649f1be4613a	219c20d2-6247-4e8b-a734-53cfbd90ba88	4	52000	\N	0	\N	2026-08-13 09:25:20.024	completed
54364aac-3649-40da-85ab-c2c47b4f8a37	7c449362-ebc1-4600-9f78-649f1be4613a	6798927c-bcba-49fd-a7ad-78291c69ac33	2	52000	\N	0	\N	2026-08-13 09:25:20.024	completed
be8bb700-d832-47ff-9117-e52befb8dd1b	7c449362-ebc1-4600-9f78-649f1be4613a	c9ed90c7-689a-46ab-9fd2-84d017c264af	4	32000	\N	0	\N	2026-08-13 09:25:20.024	completed
df55dc10-3bcd-4693-8f8f-1b150df8a6ed	7c449362-ebc1-4600-9f78-649f1be4613a	ce6673bb-c51b-4a4f-ab3d-810e44601734	3	28000	\N	0	\N	2026-08-13 09:25:20.024	completed
633c30e4-7ffe-495f-8c54-cf849f47066a	7c449362-ebc1-4600-9f78-649f1be4613a	10b0cc63-2c10-44ef-bf34-8d19b7fda2bb	4	55000	\N	0	\N	2026-08-13 09:25:20.024	completed
7e80b4fa-00c8-492e-aa97-d3bb35950d79	84c7c07e-c5a8-4248-b76a-1d1dd1248cf7	83ff8a95-3eb4-4b98-9978-63aa6d1b8323	3	55000	\N	0	\N	2026-08-13 09:25:20.03	completed
3078bc0a-ed04-48b6-ae82-c2457fe3c631	84c7c07e-c5a8-4248-b76a-1d1dd1248cf7	83ff8a95-3eb4-4b98-9978-63aa6d1b8323	2	55000	\N	0	\N	2026-08-13 09:25:20.03	completed
6842041a-b1e8-4450-96cd-4ac183f43610	84c7c07e-c5a8-4248-b76a-1d1dd1248cf7	c0917f04-365b-4cdc-9b75-e49a7c492727	3	48000	\N	0	\N	2026-08-13 09:25:20.03	completed
f68d159f-84c1-4acf-a504-4ce606bf967e	84c7c07e-c5a8-4248-b76a-1d1dd1248cf7	d849f917-4afe-4a94-8866-03848a938c79	4	35000	\N	0	\N	2026-08-13 09:25:20.03	completed
da7e45bb-2dc9-46cb-a106-52a4226abe73	84c7c07e-c5a8-4248-b76a-1d1dd1248cf7	e24a6cc9-1b6e-4ba7-94a5-514f6aa8fe31	1	45000	\N	0	\N	2026-08-13 09:25:20.03	completed
d29d3c19-eda1-43d1-b8ea-c5570bdd0246	84c7c07e-c5a8-4248-b76a-1d1dd1248cf7	884570a1-2822-4840-a08f-fc4a4a3b5fad	1	48000	\N	0	\N	2026-08-13 09:25:20.03	completed
919c1240-e7aa-48b8-ac60-5cfbbdd49b7f	e9ef4604-9902-4d17-837e-4d28fdf14b5e	faead849-9d7b-4831-b60e-20222fee6c1f	4	48000	\N	0	\N	2026-08-13 09:25:20.034	completed
d635d871-8127-480a-8215-4a4711d37a65	e9ef4604-9902-4d17-837e-4d28fdf14b5e	35fbf376-436a-45ea-89a5-41560d3be32b	3	35000	\N	0	\N	2026-08-13 09:25:20.034	completed
dcb64f11-1ed4-44d3-b1e3-01a6a01e9102	e9ef4604-9902-4d17-837e-4d28fdf14b5e	5bc34fc9-24c2-4108-af83-5992af2291d6	3	40000	\N	0	\N	2026-08-13 09:25:20.034	completed
940d4f09-2b7c-468f-865b-6bb43b407522	e9ef4604-9902-4d17-837e-4d28fdf14b5e	2ce5c559-70e1-4bdd-8cf0-fcdf2a843273	3	46000	\N	0	\N	2026-08-13 09:25:20.034	completed
db8d6b29-5084-4f22-810c-0b9dd0dde245	e9ef4604-9902-4d17-837e-4d28fdf14b5e	eb1dae05-cb14-4000-ba10-260f9cd79124	1	45000	\N	0	\N	2026-08-13 09:25:20.034	completed
a0906129-5417-4f38-b354-3dd9e99e9835	e9ef4604-9902-4d17-837e-4d28fdf14b5e	3a6ff9b1-cc6c-45ae-9635-ab2b2d03c232	4	38000	\N	0	\N	2026-08-13 09:25:20.034	completed
5cc3baf5-d47c-4ba8-9eb5-8b2364e78dfe	b0dd400d-f8eb-49e3-b1a4-96ee3f13aa56	d9f1fb87-e737-4210-a5bf-1bc0ba885771	4	42000	\N	0	\N	2026-08-13 09:25:20.043	completed
b2a0aba5-3c01-4f92-8583-d81d3879865f	b0dd400d-f8eb-49e3-b1a4-96ee3f13aa56	daa4bd17-296f-4da1-8d21-15534fa8e045	1	25000	\N	0	\N	2026-08-13 09:25:20.043	completed
d8bd818b-c645-4a97-9e4e-eb59ef2bea2b	b0dd400d-f8eb-49e3-b1a4-96ee3f13aa56	d849f917-4afe-4a94-8866-03848a938c79	2	35000	\N	0	\N	2026-08-13 09:25:20.043	completed
76fd0cac-0e47-4756-a9b2-e8286ed34447	b0dd400d-f8eb-49e3-b1a4-96ee3f13aa56	f731a039-1a1f-413d-826c-0955bb9eea80	3	55000	\N	0	\N	2026-08-13 09:25:20.043	completed
73b8af55-0f61-43cf-a3f7-e1ca711bc21c	b0dd400d-f8eb-49e3-b1a4-96ee3f13aa56	01d338fc-cbda-492d-b496-2a55e100d813	4	45000	\N	0	\N	2026-08-13 09:25:20.043	completed
4e15e905-ef55-4156-a615-2fdb5ee19ada	b0dd400d-f8eb-49e3-b1a4-96ee3f13aa56	219c20d2-6247-4e8b-a734-53cfbd90ba88	4	52000	\N	0	\N	2026-08-13 09:25:20.043	completed
ecc9c686-b232-40ec-924d-525fbf49ac56	b0dd400d-f8eb-49e3-b1a4-96ee3f13aa56	cbc78f47-cb0d-4d34-80e1-841ec7b0e5de	3	48000	\N	0	\N	2026-08-13 09:25:20.043	completed
cd9e8271-b574-4f83-8591-860c263f6bc9	6789df6f-d638-414f-8715-7cc10f9f07b8	884570a1-2822-4840-a08f-fc4a4a3b5fad	3	48000	\N	0	\N	2026-08-13 09:25:20.051	completed
35a11bcc-d5e1-48d7-bdbd-23129f5276d2	6789df6f-d638-414f-8715-7cc10f9f07b8	6798927c-bcba-49fd-a7ad-78291c69ac33	2	52000	\N	0	\N	2026-08-13 09:25:20.051	completed
111643c6-7157-4e94-9088-3539f27c2273	6789df6f-d638-414f-8715-7cc10f9f07b8	8f09b4ea-702e-4845-b2c0-59b3bf810d9d	3	38000	\N	0	\N	2026-08-13 09:25:20.051	completed
b47d5a72-6d15-4e15-a02b-38982bb64fb8	49eb5c2e-7205-4eaa-977d-940ff68cb766	83ff8a95-3eb4-4b98-9978-63aa6d1b8323	1	55000	\N	0	\N	2026-08-13 09:25:20.06	completed
b70cee0c-4aa5-46c0-b190-623727b33b62	49eb5c2e-7205-4eaa-977d-940ff68cb766	d809adca-e256-41bc-b7b0-75df0d3f5dcb	1	35000	\N	0	\N	2026-08-13 09:25:20.06	completed
14c8eedf-89ed-4124-986d-e8f396e82976	49eb5c2e-7205-4eaa-977d-940ff68cb766	eb1dae05-cb14-4000-ba10-260f9cd79124	4	45000	\N	0	\N	2026-08-13 09:25:20.06	completed
e7065ab5-6db8-4578-8565-dbf3f1e91da1	49eb5c2e-7205-4eaa-977d-940ff68cb766	a02247ba-a10e-4387-967d-e69a05c8193a	4	32000	\N	0	\N	2026-08-13 09:25:20.06	completed
aeeabef8-9ca1-4fbe-9034-aa9abf5c66a1	49eb5c2e-7205-4eaa-977d-940ff68cb766	7484d38a-54a0-49c7-baa2-a93fdce6d347	4	55000	\N	0	\N	2026-08-13 09:25:20.06	completed
81b131cf-97fa-46e6-8872-d8b1a40f46d0	1ec3011b-57d1-4ee3-ba5d-99d90ee7e6cb	25a8343a-39c3-457e-9c1d-13689bd6469b	2	45000	\N	0	\N	2026-08-13 09:25:20.066	completed
2dfadc7e-b9a6-4fcc-b4b1-c0cb6318f886	1ec3011b-57d1-4ee3-ba5d-99d90ee7e6cb	8f09b4ea-702e-4845-b2c0-59b3bf810d9d	3	38000	\N	0	\N	2026-08-13 09:25:20.066	completed
9f20e3c3-c5b6-49de-8168-23365860a57c	1ec3011b-57d1-4ee3-ba5d-99d90ee7e6cb	8f09b4ea-702e-4845-b2c0-59b3bf810d9d	3	38000	\N	0	\N	2026-08-13 09:25:20.066	completed
42cb34df-8a37-4c96-b2f4-b4182a8c0e96	1ec3011b-57d1-4ee3-ba5d-99d90ee7e6cb	d809adca-e256-41bc-b7b0-75df0d3f5dcb	1	35000	\N	0	\N	2026-08-13 09:25:20.066	completed
1f62fcbe-3b8d-491f-b142-845131ccc3e6	1ec3011b-57d1-4ee3-ba5d-99d90ee7e6cb	219c20d2-6247-4e8b-a734-53cfbd90ba88	3	52000	\N	0	\N	2026-08-13 09:25:20.066	completed
aab3d9d7-6ef9-47b5-9b89-b495fab02389	1c99bbcb-f0f1-4709-a6c7-dc918435527b	d52c0006-3bcd-48c7-ab83-082061dc6764	4	42000	\N	0	\N	2026-08-13 09:25:20.071	completed
94a61dc0-2fe1-4f33-9eac-b8708309f17f	1c99bbcb-f0f1-4709-a6c7-dc918435527b	83ff8a95-3eb4-4b98-9978-63aa6d1b8323	4	55000	\N	0	\N	2026-08-13 09:25:20.071	completed
fb3c71ea-5dd2-4690-b7c6-2a8e51e7bc5c	1c99bbcb-f0f1-4709-a6c7-dc918435527b	c0917f04-365b-4cdc-9b75-e49a7c492727	3	48000	\N	0	\N	2026-08-13 09:25:20.071	completed
19637882-b152-4264-a5e6-c64dbc5da6f8	54205e83-31db-4d7f-a565-c076f8130872	daa4bd17-296f-4da1-8d21-15534fa8e045	2	25000	\N	0	\N	2026-08-13 09:25:20.076	completed
ee5bc550-f11c-444d-aa33-d80b902f4357	54205e83-31db-4d7f-a565-c076f8130872	eb1dae05-cb14-4000-ba10-260f9cd79124	4	45000	\N	0	\N	2026-08-13 09:25:20.076	completed
d99f5a54-f449-4ce3-b136-77254d62b2f9	54205e83-31db-4d7f-a565-c076f8130872	acb42a52-c717-441a-824b-8a18079ee46c	4	50000	\N	0	\N	2026-08-13 09:25:20.076	completed
76e39bc7-3ee9-4480-a5c6-b9872e885e6c	54205e83-31db-4d7f-a565-c076f8130872	eb1dae05-cb14-4000-ba10-260f9cd79124	2	45000	\N	0	\N	2026-08-13 09:25:20.076	completed
65258923-fb5f-466e-a607-dd29d0a820d8	54205e83-31db-4d7f-a565-c076f8130872	eaa3fac9-f60f-4db1-b33a-a4bd46e8ea71	2	45000	\N	0	\N	2026-08-13 09:25:20.076	completed
3f9cdf13-3ece-4505-b282-2621990c3a4f	54205e83-31db-4d7f-a565-c076f8130872	30ef5deb-6b46-47d1-a98c-8bc060d62b44	4	45000	\N	0	\N	2026-08-13 09:25:20.076	completed
da53a08c-7aca-43de-add2-06e12ebb41ba	54205e83-31db-4d7f-a565-c076f8130872	c9ed90c7-689a-46ab-9fd2-84d017c264af	1	32000	\N	0	\N	2026-08-13 09:25:20.076	completed
ce468da3-c48c-457c-8b81-067a9230980a	54205e83-31db-4d7f-a565-c076f8130872	83ff8a95-3eb4-4b98-9978-63aa6d1b8323	1	55000	\N	0	\N	2026-08-13 09:25:20.076	completed
84b06c24-0bc3-440d-b21b-81f2184e53ce	5b609815-1699-419c-8674-ea3c7ea1a08b	625d086d-e1db-42f3-9cd5-84006fb429c1	1	48000	\N	0	\N	2026-08-13 09:25:20.086	completed
3734bcb5-da46-491d-b8fd-e558565dac6a	5b609815-1699-419c-8674-ea3c7ea1a08b	d849f917-4afe-4a94-8866-03848a938c79	2	35000	\N	0	\N	2026-08-13 09:25:20.086	completed
4dd9fc6d-3619-48da-ba14-61bb8d8ce20e	5b609815-1699-419c-8674-ea3c7ea1a08b	eaa3fac9-f60f-4db1-b33a-a4bd46e8ea71	2	45000	\N	0	\N	2026-08-13 09:25:20.086	completed
9ce5c029-eefd-4da1-bb9e-e2cb14dd88e2	ddcdf1d8-131f-4071-9780-dd7736e97eb1	2ce5c559-70e1-4bdd-8cf0-fcdf2a843273	4	46000	\N	0	\N	2026-08-13 09:25:20.095	completed
e180996b-0d27-44b6-950e-f9299720e298	ddcdf1d8-131f-4071-9780-dd7736e97eb1	b1ee3afc-db38-468c-a4bf-38b51b772024	3	20000	\N	0	\N	2026-08-13 09:25:20.095	completed
47f6a802-e3a4-4d7f-87a0-d8117a5d8441	ddcdf1d8-131f-4071-9780-dd7736e97eb1	7804beb7-b72c-43db-a27a-82b955e5e31c	2	25000	\N	0	\N	2026-08-13 09:25:20.095	completed
9e68156a-b608-45c8-a891-9d274569fd08	ddcdf1d8-131f-4071-9780-dd7736e97eb1	96531f07-be37-454a-aa0c-4a0eaab99930	4	55000	\N	0	\N	2026-08-13 09:25:20.095	completed
0086f393-042c-4824-ad98-5789210c5f6e	ddcdf1d8-131f-4071-9780-dd7736e97eb1	27af0495-2d91-4cb0-af88-4752edf671dc	3	10000	\N	0	\N	2026-08-13 09:25:20.095	completed
10c24150-fc55-412a-943f-c98d895a5c83	ddcdf1d8-131f-4071-9780-dd7736e97eb1	f731a039-1a1f-413d-826c-0955bb9eea80	1	55000	\N	0	\N	2026-08-13 09:25:20.095	completed
f97e690f-31df-4ec2-a589-bf634932fdc4	ddcdf1d8-131f-4071-9780-dd7736e97eb1	83ceb824-bbdc-4b06-a867-037ded0aef0e	4	50000	\N	0	\N	2026-08-13 09:25:20.095	completed
744be149-9907-4c9d-b80f-21426d60c0b8	ddcdf1d8-131f-4071-9780-dd7736e97eb1	81d6f3b5-b26a-4dd0-bfca-fea91a42a296	4	35000	\N	0	\N	2026-08-13 09:25:20.095	completed
22bf0d89-7097-41bb-b227-2747842769bc	52046e27-2698-42cb-a74a-6939452be6f6	308d182c-58a9-47d9-a56a-bba4a473ae24	3	42000	\N	0	\N	2026-08-13 09:25:20.105	completed
09811db5-790e-4f9c-a218-6fcb838bcb92	52046e27-2698-42cb-a74a-6939452be6f6	10b0cc63-2c10-44ef-bf34-8d19b7fda2bb	2	55000	\N	0	\N	2026-08-13 09:25:20.105	completed
500c95a1-7a47-412f-a982-8f00a7724726	52046e27-2698-42cb-a74a-6939452be6f6	10b0cc63-2c10-44ef-bf34-8d19b7fda2bb	1	55000	\N	0	\N	2026-08-13 09:25:20.105	completed
c0bad0c2-80ab-44a9-9048-3ac5d49ca1c3	52046e27-2698-42cb-a74a-6939452be6f6	51c45fec-e0e7-489e-8339-02a536d2e857	3	45000	\N	0	\N	2026-08-13 09:25:20.105	completed
7e34d784-29d4-4d4d-baa9-6b59a9998ac3	52046e27-2698-42cb-a74a-6939452be6f6	daa4bd17-296f-4da1-8d21-15534fa8e045	4	25000	\N	0	\N	2026-08-13 09:25:20.105	completed
cf7e97c4-5467-4825-bdc6-b35d0cd519c6	52046e27-2698-42cb-a74a-6939452be6f6	ce6673bb-c51b-4a4f-ab3d-810e44601734	2	28000	\N	0	\N	2026-08-13 09:25:20.105	completed
db6b9f24-55ee-44ab-b79e-2214149c4ba5	52046e27-2698-42cb-a74a-6939452be6f6	0b97d8bc-ffce-4904-8c46-87752b930f5e	3	45000	\N	0	\N	2026-08-13 09:25:20.105	completed
879ee301-ff00-4ba2-93c9-c7c740b3f47d	7f30827a-2b81-4c6f-81b2-b82a97aa497f	e718f02b-b657-444d-89ae-fb910537eb6c	3	42000	\N	0	\N	2026-08-13 09:25:20.114	completed
67c3b068-40fc-4cf6-905c-148916ef51f9	7f30827a-2b81-4c6f-81b2-b82a97aa497f	f731a039-1a1f-413d-826c-0955bb9eea80	1	55000	\N	0	\N	2026-08-13 09:25:20.114	completed
35be1e36-6296-4389-b09a-794c243b98eb	7f30827a-2b81-4c6f-81b2-b82a97aa497f	c24edbc4-7c7a-4228-9b3c-1b95c2be051c	1	48000	\N	0	\N	2026-08-13 09:25:20.114	completed
c539a7f7-a835-4c15-99c4-67d747848cfe	7f30827a-2b81-4c6f-81b2-b82a97aa497f	faead849-9d7b-4831-b60e-20222fee6c1f	2	48000	\N	0	\N	2026-08-13 09:25:20.114	completed
\.


--
-- Data for Name: order_void_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_void_logs (id, order_id, product_id, quantity, reason, cashier_id, created_at) FROM stdin;
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, cashier_id, total_amount, payment_method, status, created_at, table_number, discount_amount, rounding_amount, notes, customer_order_id, outlet_id, payment_transaction_id, customer_id) FROM stdin;
07da7c18-bbf8-4724-a1a8-6739d9fc5a92	9133834e-ef39-4135-97e3-a3d04ea53589	403200	card	cancelled	2026-05-18 18:10:00+07	Meja 5	44800	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
02548a7e-407a-465f-b749-4358cbbaeff6	9133834e-ef39-4135-97e3-a3d04ea53589	470000	cash	completed	2026-06-03 13:04:00+07	Meja 4	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	d223e467-475e-4ecc-ace4-b9c3e347ac6a	\N
86a62d02-7b80-4b85-93f6-554c61a070ea	9133834e-ef39-4135-97e3-a3d04ea53589	322000	transfer	cancelled	2026-05-30 18:44:00+07	Meja 7	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
efc2b62f-bab3-4d67-a626-94c1e7453d92	9133834e-ef39-4135-97e3-a3d04ea53589	280000	cash	cancelled	2026-07-21 18:37:00+07	Meja 7	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
18a5b5ee-edcf-4986-8a16-c54a8196c803	9133834e-ef39-4135-97e3-a3d04ea53589	1261000	cash	completed	2026-06-14 20:43:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	e0a1e65c-e6cf-45db-83eb-04f378e2f276	\N
8dc30fb6-f901-4897-bb52-545a4aac790e	9133834e-ef39-4135-97e3-a3d04ea53589	555000	card	pending	2026-08-07 13:07:00+07	Meja 2	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
1853031b-c967-435d-8b80-3b7989db5c9b	9133834e-ef39-4135-97e3-a3d04ea53589	601200	cash	cancelled	2026-07-15 20:22:00+07	\N	66800	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
f5fdeeee-5cbd-43ab-bf32-5f47b2c4450a	9133834e-ef39-4135-97e3-a3d04ea53589	460000	cash	paid	2026-07-19 10:03:00+07	Meja 7	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	ef34b88a-d9a5-4643-9961-be34eb4b5ab8	\N
a734967b-b800-48ce-a152-84c86ea6e531	9133834e-ef39-4135-97e3-a3d04ea53589	422000	cash	pending	2026-06-05 18:06:00+07	Meja 7	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
2aafef5e-9b9b-4da2-9c66-96cb0aa617ed	9133834e-ef39-4135-97e3-a3d04ea53589	545000	card	paid	2026-06-07 19:58:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	aed08c08-7af8-4ca7-8846-408921fd68d6	\N
f1b24ce5-9746-40ab-830b-471cf2524501	9133834e-ef39-4135-97e3-a3d04ea53589	609000	card	completed	2026-07-22 12:08:00+07	Meja 8	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	14df6778-5ff5-443d-9baf-52164458287b	\N
a11c35d7-4bf7-4904-96e7-c004b0b44a0f	9133834e-ef39-4135-97e3-a3d04ea53589	243000	card	completed	2026-07-06 12:56:00+07	Meja 2	27000	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	73ee55fe-22dc-4c7c-8852-065032568bce	\N
1cc47a13-c4b7-4031-8f04-d4b39ad01d5b	9133834e-ef39-4135-97e3-a3d04ea53589	484000	cash	cancelled	2026-06-22 12:10:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
34dcb5a8-914d-408d-9543-04fe54587244	9133834e-ef39-4135-97e3-a3d04ea53589	335000	card	paid	2026-05-20 15:29:00+07	Meja 1	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	5a6c1348-7d7b-4dc5-9c96-91bd3d77edb9	\N
4f1b7364-a31f-4ec7-9d33-ef273246ea21	9133834e-ef39-4135-97e3-a3d04ea53589	329000	transfer	pending	2026-08-09 20:13:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
e32733de-a842-4193-b8d8-9a26c2e36eef	9133834e-ef39-4135-97e3-a3d04ea53589	683000	cash	pending	2026-08-03 11:04:00+07	Meja 8	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
70bcff8e-1c94-41c0-9a41-d8459ab93056	9133834e-ef39-4135-97e3-a3d04ea53589	342000	transfer	pending	2026-05-23 12:07:00+07	Meja 1	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
d8d661de-c972-43b0-9421-397946aa9bba	9133834e-ef39-4135-97e3-a3d04ea53589	366000	card	pending	2026-07-30 18:11:00+07	Meja 5	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
2d4b5eb4-c9a0-4f34-af8b-32f75336c4a4	9133834e-ef39-4135-97e3-a3d04ea53589	709000	card	paid	2026-06-19 20:23:00+07	Meja 2	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	185cfafa-82e6-42e9-8142-3adf329aeed9	\N
e0aaad70-7b94-4021-9135-ffb1a781f65b	9133834e-ef39-4135-97e3-a3d04ea53589	1172000	card	paid	2026-07-13 12:02:00+07	Meja 6	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	768f58f8-5efc-4c9b-be62-5447c66e9910	\N
24c5f39b-df39-4af3-acc6-e60f362b1535	9133834e-ef39-4135-97e3-a3d04ea53589	914000	card	completed	2026-06-24 10:43:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	c0d4b195-1091-413d-b5df-6cbb6bd32806	\N
75496fc9-3394-4bf7-a2fd-9143c7c3d0ce	9133834e-ef39-4135-97e3-a3d04ea53589	436000	card	paid	2026-06-22 17:14:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	2cc6ad11-8ff0-451a-816a-98858fbb5060	\N
5f436b83-5736-49ff-a583-b01d0b3d4844	9133834e-ef39-4135-97e3-a3d04ea53589	293000	cash	completed	2026-07-03 18:06:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	e5e0493c-027b-4b03-804a-495862db7ffe	\N
304bd31e-68d4-495e-b14f-41b0b18f6a5c	9133834e-ef39-4135-97e3-a3d04ea53589	515000	cash	paid	2026-06-29 09:10:00+07	Meja 5	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	97dc185a-df2d-4d15-a444-5be07a37da01	\N
20eeab6a-15d9-43f5-ace1-1d00ed56b77e	9133834e-ef39-4135-97e3-a3d04ea53589	474000	transfer	paid	2026-07-02 20:36:00+07	Meja 1	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	a1e701fe-c4ba-4377-8e28-3dfaee9ddc9f	\N
46d66cca-506e-485d-9469-60af978690de	9133834e-ef39-4135-97e3-a3d04ea53589	395000	transfer	pending	2026-05-15 14:53:00+07	Meja 7	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
03c44a98-cc3d-4dcd-8bb3-bf88cce2dfbb	9133834e-ef39-4135-97e3-a3d04ea53589	562000	cash	cancelled	2026-05-28 19:49:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
b80ec5c6-2ba1-4261-8e2f-50a9186dc1a8	9133834e-ef39-4135-97e3-a3d04ea53589	797000	cash	paid	2026-05-18 13:46:00+07	Meja 1	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	b8a0f88e-17e3-4032-bd98-09c35f1567fe	\N
71839682-0231-44da-9405-d06a4c9be926	9133834e-ef39-4135-97e3-a3d04ea53589	864000	cash	paid	2026-08-07 18:21:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	9c8f19f9-d9ff-49d3-978f-cd5447d53289	\N
d8e24537-d845-4961-ac9e-051c655e6775	9133834e-ef39-4135-97e3-a3d04ea53589	736000	card	pending	2026-07-12 18:42:00+07	Meja 3	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
24a2e2c3-e380-4bee-9239-7570f8b5c936	9133834e-ef39-4135-97e3-a3d04ea53589	682000	card	pending	2026-06-30 20:03:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
413d274f-51c1-424c-b1d0-bc552fc3dbcd	9133834e-ef39-4135-97e3-a3d04ea53589	371700	cash	paid	2026-07-26 18:10:00+07	Meja 4	41300	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	9d07e889-ae80-41c9-8087-1af985d490f8	\N
7e5a7e7a-2718-44ca-8d9a-9b64c2141474	9133834e-ef39-4135-97e3-a3d04ea53589	232200	card	pending	2026-06-13 19:40:00+07	Meja 6	25800	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
e7f6632b-7f8a-414d-827a-f378d921836b	9133834e-ef39-4135-97e3-a3d04ea53589	421000	cash	paid	2026-06-03 20:40:00+07	Meja 8	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	5e60775e-0bc7-4b24-8ad8-91f7cec3d973	\N
2a81c573-7b5b-457f-b97b-d4942f7908df	9133834e-ef39-4135-97e3-a3d04ea53589	355000	card	cancelled	2026-06-30 12:44:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
3bd58b58-4b26-4c27-89ff-ce4cb4ea8e28	9133834e-ef39-4135-97e3-a3d04ea53589	310000	cash	completed	2026-08-10 11:17:00+07	Meja 3	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	da36feed-f972-4f6f-8bd3-ddb3461814b1	\N
a931272e-461e-4818-960b-ac5d84718f97	9133834e-ef39-4135-97e3-a3d04ea53589	682000	transfer	paid	2026-06-19 18:02:00+07	Meja 5	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	f0256e81-96c1-4a35-a747-3861db8c3da2	\N
bde35d01-6efb-4409-bc59-0a227efcf441	9133834e-ef39-4135-97e3-a3d04ea53589	788000	transfer	paid	2026-07-11 19:29:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	e028f28d-d817-4915-8d56-e25e8701a2e4	\N
27d11210-9573-476a-aa6f-f8c2ec6db42d	9133834e-ef39-4135-97e3-a3d04ea53589	356000	cash	completed	2026-07-30 14:01:00+07	Meja 7	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	c7e7899f-028a-43d3-8651-e098dae0d395	\N
000f7ba5-06f8-4a65-a0e6-e2bfbbd64981	9133834e-ef39-4135-97e3-a3d04ea53589	631800	transfer	completed	2026-05-26 17:58:00+07	Meja 6	70200	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	81d310cd-f63a-4579-b95e-d9f02e2cdb05	\N
b7f52d2c-6f6e-44d1-afe2-c97c5ff4cfcc	9133834e-ef39-4135-97e3-a3d04ea53589	856000	cash	paid	2026-08-12 11:57:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	c8ca2a62-9ca4-4b60-8eb2-840a01071c96	\N
882aefea-c7ab-4d93-8270-c4a73d3610de	9133834e-ef39-4135-97e3-a3d04ea53589	511000	transfer	paid	2026-05-17 16:56:00+07	Meja 8	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	7afaa3e7-28ca-4faa-abff-a218062b70eb	\N
bd6323a1-d006-497e-89af-dd18ee4fdebe	9133834e-ef39-4135-97e3-a3d04ea53589	394000	cash	paid	2026-06-11 14:17:00+07	Meja 8	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	b6ec1620-12a1-4255-8e04-68489e9f0b89	\N
373276b1-3e6e-4c28-b572-014fe25a6c48	9133834e-ef39-4135-97e3-a3d04ea53589	277000	cash	pending	2026-06-01 12:12:00+07	Meja 5	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
50ad577b-590b-438a-8fd1-06b17971b12b	9133834e-ef39-4135-97e3-a3d04ea53589	418000	card	paid	2026-07-06 20:34:00+07	Meja 4	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	00b071ce-5ffa-47fd-9b5f-2ffd4d882ca4	\N
7e7669bc-4023-4901-aa41-7db516a0fd1c	9133834e-ef39-4135-97e3-a3d04ea53589	778000	cash	paid	2026-07-01 17:03:00+07	Meja 1	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	bfa5a541-bbd6-419a-9ff9-655452103348	\N
81665cd4-6de4-47c7-8d3a-99477b09bdcf	9133834e-ef39-4135-97e3-a3d04ea53589	415000	card	completed	2026-06-29 20:28:00+07	Meja 3	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	c9102f5f-dda4-4f3d-8801-d72526d566ce	\N
2f3ac4e0-723d-4c8a-bde8-e9b27fd96933	9133834e-ef39-4135-97e3-a3d04ea53589	667000	transfer	paid	2026-08-06 20:36:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	b5df9302-1fb6-409e-b9ac-68d10fa61a8b	\N
c13dba7c-f84c-4ba7-9d26-20e7011b0d6f	9133834e-ef39-4135-97e3-a3d04ea53589	822000	transfer	paid	2026-06-14 13:00:00+07	Meja 1	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	40909226-f6f1-493b-8317-ba4bfe8fe814	\N
d7179d6a-d2dc-4c31-a44e-c1270b24ac70	9133834e-ef39-4135-97e3-a3d04ea53589	403200	card	paid	2026-05-18 19:05:00+07	Meja 1	44800	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	d7e22ced-03a7-4fb4-96f2-47245812ef02	\N
739fd426-b4ef-4312-bbab-67ce76acd733	9133834e-ef39-4135-97e3-a3d04ea53589	790000	card	pending	2026-06-28 19:24:00+07	Meja 7	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
28fae993-6ab8-4521-8170-419f97320813	9133834e-ef39-4135-97e3-a3d04ea53589	296000	card	paid	2026-06-09 19:40:00+07	Meja 4	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	0cf0f40e-4383-4190-a5e9-8d2d1b1e77d0	\N
5cee9486-df96-4668-a3a4-80c875d37cae	9133834e-ef39-4135-97e3-a3d04ea53589	758000	transfer	completed	2026-06-10 13:48:00+07	Meja 7	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	e9804ed2-ae36-4774-b2fb-db8f4ac2032c	\N
db9602cf-163a-48f0-9c49-bff1c428a7b3	9133834e-ef39-4135-97e3-a3d04ea53589	720000	card	completed	2026-08-07 11:28:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	e7367804-e3de-4617-9bd2-39659daae9bd	\N
5529c415-66b5-4086-a1c6-a793eb85f4ec	9133834e-ef39-4135-97e3-a3d04ea53589	108000	transfer	completed	2026-05-27 19:52:00+07	Meja 5	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	74aefda4-4b83-4691-9d64-7ce7a12db363	\N
2c8572a8-6001-4d5f-abab-9e43023121fe	9133834e-ef39-4135-97e3-a3d04ea53589	768600	transfer	paid	2026-06-10 20:08:00+07	Meja 1	85400	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	67778e5a-34c6-4cc9-acfe-07994ca4b215	\N
187631c0-5a42-4af7-bad6-893847572d0f	9133834e-ef39-4135-97e3-a3d04ea53589	819000	cash	completed	2026-06-01 20:46:00+07	Meja 2	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	cabe79d6-6570-4867-bab2-e0c0b61e7923	\N
0232c90a-be47-405b-964a-60b938d9143a	9133834e-ef39-4135-97e3-a3d04ea53589	754000	card	completed	2026-08-01 10:18:00+07	Meja 6	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	5a81722e-b768-4ff9-91a4-9115288d03a3	\N
1070f283-7ea0-4b67-a629-ceec25defe19	9133834e-ef39-4135-97e3-a3d04ea53589	794000	transfer	paid	2026-06-13 19:04:00+07	Meja 7	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	18cbd35e-97ef-4ef9-beb9-dc9c7eff49ae	\N
0603d225-e5dc-4f87-949e-19496497203e	9133834e-ef39-4135-97e3-a3d04ea53589	475000	transfer	completed	2026-07-08 13:13:00+07	Meja 1	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	dacd43b5-7266-4e70-8d09-618b31398e5d	\N
0b74b501-6175-4347-aeb9-5f26663470a9	9133834e-ef39-4135-97e3-a3d04ea53589	1025000	transfer	paid	2026-07-01 12:24:00+07	Meja 8	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	c842806d-b79c-46c2-bcd4-8e06e6df8ebc	\N
8c1feb2c-0d89-4a9f-a307-0579817f8eab	9133834e-ef39-4135-97e3-a3d04ea53589	535000	transfer	completed	2026-05-26 11:37:00+07	Meja 3	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	744f717a-990b-4769-beaf-44004685738d	\N
84ebfad7-b488-4282-8eec-86946c235032	9133834e-ef39-4135-97e3-a3d04ea53589	605000	transfer	paid	2026-06-05 18:06:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	cfbea05c-2452-4931-ba4d-3681f32fb87e	\N
69e326b5-bc18-481d-b0d3-3dab60b8a13f	9133834e-ef39-4135-97e3-a3d04ea53589	356000	transfer	paid	2026-08-09 19:36:00+07	Meja 2	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	44d0cc4a-dd3b-41e8-973f-8c60042ba14d	\N
0d462aa1-2d29-4cef-b880-32803c3877fd	9133834e-ef39-4135-97e3-a3d04ea53589	771000	transfer	completed	2026-07-18 15:13:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	2fb58a3c-225e-4456-b174-270bc7bde7ec	\N
76e799f2-0bab-4273-8d3a-0a26fe065249	9133834e-ef39-4135-97e3-a3d04ea53589	334000	card	paid	2026-06-08 11:58:00+07	Meja 2	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	3ce37eb9-77f1-43f1-95d0-5a61ca590a78	\N
e036fd4a-78fc-4d94-a126-c69397c62443	9133834e-ef39-4135-97e3-a3d04ea53589	562000	card	paid	2026-07-05 13:41:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	6288b86a-72a3-4acb-91af-1f3330c7125f	\N
ba382715-f9ba-4c4e-b1ce-cd9db642805c	9133834e-ef39-4135-97e3-a3d04ea53589	970000	transfer	paid	2026-07-26 19:10:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	5584c052-96f8-4059-a1f1-ec596906a716	\N
1a2c22e7-5ecb-4196-ba55-62e3b173cd14	9133834e-ef39-4135-97e3-a3d04ea53589	840000	card	paid	2026-05-20 18:06:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	2ea62dd0-fc6f-49ee-aa26-c5e457aa8ff6	\N
b4e8a020-623c-44ea-895e-ce6442808745	9133834e-ef39-4135-97e3-a3d04ea53589	760000	card	completed	2026-07-15 12:36:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	91270fe7-850b-41c0-89e6-67c16bec6f0e	\N
ed5ccf0e-dede-4964-a382-e44012ead7df	9133834e-ef39-4135-97e3-a3d04ea53589	332000	cash	paid	2026-06-25 11:27:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	f78fa63c-9e80-4de9-8751-42ae43378ae0	\N
752a9b8b-3575-41fa-bf4f-ac7a1b989cef	9133834e-ef39-4135-97e3-a3d04ea53589	947000	transfer	cancelled	2026-06-12 19:21:00+07	Meja 4	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
81183027-9e54-482c-8799-eab3695c55fd	9133834e-ef39-4135-97e3-a3d04ea53589	651600	card	paid	2026-05-22 18:27:00+07	Meja 5	72400	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	204dc353-823f-42a7-9c35-a81e4d32097e	\N
badc7ff7-f8a3-43a7-a49f-f8d57c4dc88c	9133834e-ef39-4135-97e3-a3d04ea53589	535000	transfer	paid	2026-05-22 18:34:00+07	Meja 7	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	6496537d-bc2e-4594-9ed5-09c05c706f0e	\N
bc10d31f-fdaf-45d9-9803-a0d0c2f84fcb	9133834e-ef39-4135-97e3-a3d04ea53589	786000	card	cancelled	2026-07-16 20:56:00+07	Meja 3	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
4ddd27fa-9d11-4117-8f2d-abe83ab27665	9133834e-ef39-4135-97e3-a3d04ea53589	331000	card	paid	2026-06-11 12:43:00+07	Meja 4	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	d612b48e-a969-4cd2-8059-142720eb7990	\N
6148510a-c241-4918-958c-a77a8e632abc	9133834e-ef39-4135-97e3-a3d04ea53589	746100	transfer	pending	2026-06-07 13:36:00+07	Meja 5	82900	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
0db3bf26-15bd-4afa-a852-32555a122ce9	9133834e-ef39-4135-97e3-a3d04ea53589	226000	card	paid	2026-06-03 18:23:00+07	Meja 8	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	a71de898-dba4-4a78-9101-9e07e4117bf1	\N
188145f3-83dc-48f4-b082-d7331dd5a6ba	9133834e-ef39-4135-97e3-a3d04ea53589	406000	cash	paid	2026-06-09 12:07:00+07	Meja 6	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	8e17d608-2609-473c-99ab-e17770610dcf	\N
fc756c61-991e-4649-8fec-9c53a844194f	9133834e-ef39-4135-97e3-a3d04ea53589	514000	cash	cancelled	2026-06-05 11:09:00+07	Meja 5	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
578f426a-4de6-4ce9-a15b-6c34260bc6e8	9133834e-ef39-4135-97e3-a3d04ea53589	568000	transfer	paid	2026-07-12 20:42:00+07	Meja 3	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	02ce512a-2988-4945-aebe-fea826fd4631	\N
00a09915-b569-4c13-aed5-232b09847fa7	9133834e-ef39-4135-97e3-a3d04ea53589	260100	cash	cancelled	2026-06-19 14:27:00+07	Meja 4	28900	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
a0e1609e-f2f7-41b4-a9be-580cc481ce68	9133834e-ef39-4135-97e3-a3d04ea53589	278000	cash	completed	2026-06-06 11:35:00+07	Meja 7	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	eec8e737-b0ff-4880-b458-8605268c5151	\N
af30e6a1-2557-498d-8b75-3f8917acfdd5	9133834e-ef39-4135-97e3-a3d04ea53589	635000	card	paid	2026-08-08 14:07:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	243b6fc3-32c1-4126-80c7-a38b10bdf5ba	\N
3137aa5d-28d5-4f9c-9245-1e86c092a1e4	9133834e-ef39-4135-97e3-a3d04ea53589	576000	card	pending	2026-07-12 18:17:00+07	Meja 5	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
6a526dbf-7231-4050-86d8-5a98cc4c82c1	9133834e-ef39-4135-97e3-a3d04ea53589	457000	card	paid	2026-06-16 11:33:00+07	Meja 4	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	0b9a78e6-e9ac-425e-b4aa-c43359ca3473	\N
d842d6e5-c180-4ed3-b2d3-1813fd6def98	9133834e-ef39-4135-97e3-a3d04ea53589	552000	transfer	paid	2026-06-26 15:26:00+07	Meja 5	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	f9ca83fe-76d6-4d57-8ead-65a660bb0160	\N
20a0bffb-56a5-4f89-a54c-704a299b247d	9133834e-ef39-4135-97e3-a3d04ea53589	608000	cash	pending	2026-05-17 12:56:00+07	Meja 6	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
de8d544c-dd7f-4bc2-b3db-11fa0f53b605	9133834e-ef39-4135-97e3-a3d04ea53589	716000	cash	completed	2026-07-20 19:24:00+07	Meja 1	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	fab4f0b0-9d94-4060-96c1-850dc6b13b90	\N
427ae7a6-82ac-40df-adad-f91c3e265c36	9133834e-ef39-4135-97e3-a3d04ea53589	751000	card	paid	2026-08-01 18:49:00+07	Meja 8	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	be839229-f02e-4a1a-966a-b082ba7fab2a	\N
7e5ad3c2-bcf9-4294-ab76-ff5a6bcec093	9133834e-ef39-4135-97e3-a3d04ea53589	837000	transfer	completed	2026-07-31 20:49:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	6bf3e703-63ae-41de-bd5e-d2fd2fcab581	\N
074a6a5c-3874-429a-afbd-ff70866b036a	9133834e-ef39-4135-97e3-a3d04ea53589	673000	cash	pending	2026-07-26 12:26:00+07	Meja 5	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
d1f8d593-6b02-4ffb-8542-8e35ddc6e5db	9133834e-ef39-4135-97e3-a3d04ea53589	460000	cash	paid	2026-07-24 11:14:00+07	Meja 3	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	f43f2848-4289-4a64-85b5-5136f087d1a2	\N
4b816e7e-3c43-4300-893c-d134a834e476	9133834e-ef39-4135-97e3-a3d04ea53589	173700	transfer	paid	2026-06-25 18:12:00+07	\N	19300	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	22e70f3e-4b8a-46fe-a64c-eb1537c81c86	\N
424ba2e1-5897-4eda-b913-eedb7a6a27ef	9133834e-ef39-4135-97e3-a3d04ea53589	743000	cash	pending	2026-05-24 13:27:00+07	Meja 4	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
625f74db-3591-4450-8218-5a97f61f51db	9133834e-ef39-4135-97e3-a3d04ea53589	472000	card	pending	2026-06-25 18:01:00+07	Meja 6	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
48bc05eb-c7d7-4f26-98f4-481b5e213502	9133834e-ef39-4135-97e3-a3d04ea53589	648000	card	pending	2026-07-05 19:22:00+07	Meja 2	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
67d58101-b660-43f0-b0af-e1815ad53349	9133834e-ef39-4135-97e3-a3d04ea53589	515000	cash	completed	2026-07-30 11:49:00+07	Meja 2	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	5c562a18-f8c3-4dad-91fa-084d70cc0c4f	\N
2bd47d9e-e01a-448d-bd2d-d2c9c97b283c	9133834e-ef39-4135-97e3-a3d04ea53589	738000	cash	paid	2026-07-18 13:32:00+07	Meja 2	82000	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	69c85b29-478b-44cb-bf06-18d22d10596a	\N
39daa26b-d7be-4523-b6fd-81a1f8cb42e4	9133834e-ef39-4135-97e3-a3d04ea53589	490000	cash	paid	2026-07-02 19:46:00+07	Meja 8	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	ba8dc102-a14c-4ce9-b611-7d775d43a678	\N
5ba398fb-01aa-4a38-a6ad-2094a2faf4d9	9133834e-ef39-4135-97e3-a3d04ea53589	763000	cash	paid	2026-05-22 11:39:00+07	Meja 2	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	20a0f10a-d32b-4a53-8fad-90ff4a4407cb	\N
fc73591f-67de-4b74-8feb-c9bb1a2188f6	9133834e-ef39-4135-97e3-a3d04ea53589	681000	transfer	cancelled	2026-07-06 10:02:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
f93744eb-6eec-4b53-8ad9-003a11d3150b	9133834e-ef39-4135-97e3-a3d04ea53589	893000	transfer	paid	2026-06-03 13:19:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	8ba5e145-2778-49fb-a581-82856388bd9e	\N
0a994637-102f-4e08-b6ea-38fa237fbc98	9133834e-ef39-4135-97e3-a3d04ea53589	317000	transfer	paid	2026-05-22 19:44:00+07	Meja 5	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	f44f7ecd-7877-4db3-8b6a-63a50579e2ce	\N
936b3165-834f-412a-a61c-a6209490a62a	9133834e-ef39-4135-97e3-a3d04ea53589	817000	transfer	paid	2026-07-24 18:25:00+07	Meja 4	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	eaf41932-4ccf-4ec1-954b-970c569801d1	\N
5723287d-0c1e-42c9-bdcd-431e8a5daec7	9133834e-ef39-4135-97e3-a3d04ea53589	416000	card	paid	2026-05-21 12:35:00+07	Meja 6	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	b47bf7a5-f910-4c91-8430-e665e3de9aeb	\N
f56f0412-4e64-48db-923b-f6425a7a788e	9133834e-ef39-4135-97e3-a3d04ea53589	410000	card	cancelled	2026-07-27 18:35:00+07	Meja 4	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
f566af81-b20b-4dc7-8f56-2e815899b666	9133834e-ef39-4135-97e3-a3d04ea53589	824000	card	paid	2026-05-15 19:46:00+07	Meja 6	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	95d754ca-4564-4a83-afa1-d7fd06432bcb	\N
0150c23a-6abe-4a3a-8ebe-85220146ebc9	9133834e-ef39-4135-97e3-a3d04ea53589	877000	cash	paid	2026-06-21 11:59:00+07	Meja 8	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	19ad928d-93c9-4a84-9571-fbc251494e9a	\N
66b1c6e4-162b-4c9a-99ae-ed8855ced12a	9133834e-ef39-4135-97e3-a3d04ea53589	438000	cash	cancelled	2026-07-15 13:10:00+07	Meja 4	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
ef7a0454-86fe-4a73-987c-5f33c8ef3486	9133834e-ef39-4135-97e3-a3d04ea53589	828000	card	paid	2026-08-04 19:38:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	49f7a864-206f-4b4a-a3b7-d7dd6ecc491b	\N
e3a2849e-41ae-47b7-ba7c-ba8eff8cd0c5	9133834e-ef39-4135-97e3-a3d04ea53589	556000	card	paid	2026-06-15 11:51:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	e1c07e14-ee6a-43d4-a310-5b9e42c7810d	\N
dbe0d3fa-ff58-4d82-bc8e-6db9002e75c2	9133834e-ef39-4135-97e3-a3d04ea53589	269000	card	paid	2026-06-21 18:06:00+07	Meja 8	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	cacedbd6-495d-413b-a43b-36900077ccca	\N
e0844488-4097-419b-b80b-825c3e93681e	9133834e-ef39-4135-97e3-a3d04ea53589	604000	cash	cancelled	2026-07-22 12:06:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
885db444-6630-4404-9fc2-3eaab11a542b	9133834e-ef39-4135-97e3-a3d04ea53589	982000	cash	completed	2026-07-28 12:44:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	1e176633-9eb6-4a3a-a8c7-419879d42df5	\N
e665c630-1746-4ced-84c5-0d30fe3cf4dd	9133834e-ef39-4135-97e3-a3d04ea53589	332000	card	paid	2026-05-27 18:04:00+07	Meja 1	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	c7a44b9f-bb0a-4917-9796-5b28b253e5ca	\N
2cc2c3fa-2a0c-4782-8531-bc48632c1a30	9133834e-ef39-4135-97e3-a3d04ea53589	564000	card	paid	2026-06-01 20:14:00+07	Meja 4	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	1bd6f2ea-e44a-4269-9a73-7d3e94268881	\N
4af69d26-46c5-4845-b397-138c9f73ca23	9133834e-ef39-4135-97e3-a3d04ea53589	648000	card	pending	2026-07-02 12:15:00+07	Meja 3	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
da9d8602-edff-42bd-bab5-5cad41436220	9133834e-ef39-4135-97e3-a3d04ea53589	726000	card	cancelled	2026-06-02 12:01:00+07	Meja 5	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
af0b105e-39f2-402e-a642-d57915ff202e	9133834e-ef39-4135-97e3-a3d04ea53589	326000	card	paid	2026-07-13 12:43:00+07	Meja 8	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	ef483af7-9ae6-464a-aa09-afca6d7f1051	\N
1728e5a3-98c6-4991-85a3-65c045698049	9133834e-ef39-4135-97e3-a3d04ea53589	509400	card	cancelled	2026-06-23 13:22:00+07	\N	56600	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
a20a451d-ba0c-448b-a44c-2909c0722d0a	9133834e-ef39-4135-97e3-a3d04ea53589	990900	card	pending	2026-06-28 12:37:00+07	Meja 3	110100	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
5757131f-d08b-4266-8a62-e2824bd4a95e	9133834e-ef39-4135-97e3-a3d04ea53589	422000	transfer	completed	2026-07-13 11:11:00+07	Meja 5	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	0c5b7ecc-3592-4ba6-9c8c-be8b65416f26	\N
953fa126-2546-4708-9a31-d71cde15962f	9133834e-ef39-4135-97e3-a3d04ea53589	484000	transfer	completed	2026-06-05 12:59:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	93201133-804d-4d0c-8fc8-d2d913c49bb7	\N
46fc0b0e-2576-430c-9d3f-649d9aa4676d	9133834e-ef39-4135-97e3-a3d04ea53589	522000	card	paid	2026-05-16 13:25:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	13198d6a-92b1-469a-bc8c-3fd48692ca84	\N
f5fc7467-2e2c-4d61-ae6a-89e5c613e887	9133834e-ef39-4135-97e3-a3d04ea53589	281000	transfer	paid	2026-07-26 11:45:00+07	Meja 4	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	8d77c70a-d329-4ac8-bc00-9b9b2a10a74e	\N
7be02ac1-49b3-4802-bef0-a9f014aa5fa0	9133834e-ef39-4135-97e3-a3d04ea53589	409000	cash	paid	2026-06-17 13:21:00+07	Meja 8	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	4e3ea00d-f09b-4337-b5db-9900cf5d700e	\N
e55a39d6-6dd2-4a10-b058-1afc89ebdc2c	9133834e-ef39-4135-97e3-a3d04ea53589	312000	cash	cancelled	2026-08-12 11:38:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
daeac7d9-8d56-47b0-83db-08432c705ec4	9133834e-ef39-4135-97e3-a3d04ea53589	722000	cash	paid	2026-06-10 12:33:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	2860f530-6f6a-4188-b924-c99a4a428c72	\N
5bb88122-676a-4c37-af00-c49a3302bfd7	9133834e-ef39-4135-97e3-a3d04ea53589	260000	cash	cancelled	2026-07-24 12:45:00+07	Meja 1	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
767adbfd-9a4a-4c82-b182-edfae9115b86	9133834e-ef39-4135-97e3-a3d04ea53589	469000	cash	cancelled	2026-05-28 17:55:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
6b2f5e28-60db-454a-b1f4-26542db5964d	9133834e-ef39-4135-97e3-a3d04ea53589	434000	transfer	paid	2026-06-04 14:29:00+07	Meja 5	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	db99a9fd-1f9a-4a87-804c-7d309e11be6b	\N
f02eebb8-7500-41e4-b376-24dd70569e87	9133834e-ef39-4135-97e3-a3d04ea53589	475000	transfer	completed	2026-06-07 13:00:00+07	Meja 3	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	a587c822-56bf-491c-8484-6eeb3756a392	\N
a03f90c5-9ed9-409f-b06f-0dec4259138c	9133834e-ef39-4135-97e3-a3d04ea53589	338400	transfer	paid	2026-06-22 11:59:00+07	Meja 3	37600	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	4e8b7869-62b8-4964-8e00-44ce5bce049c	\N
4beb4f0c-4218-4fe1-88a8-74b5f7078dda	9133834e-ef39-4135-97e3-a3d04ea53589	256500	card	paid	2026-07-22 12:40:00+07	Meja 4	28500	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	75d81a8b-272b-4bee-bebc-b3cb7800c1a7	\N
a8e76674-9c0b-4c4c-b76e-6502ecc26694	9133834e-ef39-4135-97e3-a3d04ea53589	465000	transfer	paid	2026-06-05 19:18:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	bda4f4fa-9f45-4023-b036-f7c0c298295c	\N
af081543-959e-4e7a-98a1-a06499f7803c	9133834e-ef39-4135-97e3-a3d04ea53589	121500	cash	paid	2026-05-16 11:00:00+07	Meja 3	13500	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	bc3d1eb1-8e28-4665-b468-82de8b074e64	\N
260add6b-4fe1-4200-b277-7a6734cd9e16	9133834e-ef39-4135-97e3-a3d04ea53589	553000	cash	paid	2026-07-10 18:26:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	f2431bb4-1619-4803-804c-24cb1c32fb5e	\N
f210cc82-048f-414f-91ec-179d662d4fad	9133834e-ef39-4135-97e3-a3d04ea53589	388000	cash	cancelled	2026-07-11 13:47:00+07	Meja 2	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
1b7e4ed8-6df0-4c9a-91ae-6a19d728dd9d	9133834e-ef39-4135-97e3-a3d04ea53589	431000	card	paid	2026-07-29 20:53:00+07	Meja 4	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	509f1457-8478-48ac-aab1-862d41a8253d	\N
a9a4e50f-b953-458d-a0dd-553310589811	9133834e-ef39-4135-97e3-a3d04ea53589	706000	card	pending	2026-06-11 19:55:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
fa7e096e-1645-4ad2-a725-b2dff12a2fd2	9133834e-ef39-4135-97e3-a3d04ea53589	474000	card	paid	2026-05-23 12:54:00+07	Meja 4	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	e6d9c9ad-1506-4b96-8014-c520b4b2dd09	\N
c65ef677-67f7-4214-9632-a6b3da6e17d3	9133834e-ef39-4135-97e3-a3d04ea53589	261000	transfer	completed	2026-07-07 13:31:00+07	Meja 7	29000	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	0f9d2245-f370-469e-8b2b-2c674f2d8ba4	\N
2047e774-9c05-4b2a-a01c-e3472bb47e10	9133834e-ef39-4135-97e3-a3d04ea53589	540000	cash	cancelled	2026-06-09 11:40:00+07	Meja 2	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
9d27b0e6-be2e-469a-a141-2579200f35ea	9133834e-ef39-4135-97e3-a3d04ea53589	718000	transfer	cancelled	2026-06-04 19:08:00+07	Meja 5	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
8c32c1b7-fff6-481a-b0cb-08f99dfc1815	9133834e-ef39-4135-97e3-a3d04ea53589	584000	card	completed	2026-05-15 20:51:00+07	Meja 6	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	f4619c7a-81b8-42c1-aef1-0763d2125c34	\N
a5741c29-3c63-4dc5-ba35-e819d7850576	9133834e-ef39-4135-97e3-a3d04ea53589	833000	cash	completed	2026-06-10 13:42:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	925f4133-d496-4047-acb7-6bc15af18271	\N
fbd8710c-6894-4dec-a6b3-57f24463774c	9133834e-ef39-4135-97e3-a3d04ea53589	443000	card	paid	2026-07-30 11:03:00+07	Meja 3	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	5fe274bf-89e3-4d0d-9272-d2d73fcf9f77	\N
34a2b6fb-9151-4274-8c3a-99c63c100506	9133834e-ef39-4135-97e3-a3d04ea53589	689000	transfer	paid	2026-06-03 18:43:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	345d8e4e-960e-4fa8-8424-fa6f6a46b485	\N
6697750e-2c29-4f07-9e93-9e8e2f80f8e6	9133834e-ef39-4135-97e3-a3d04ea53589	897000	cash	paid	2026-07-17 19:42:00+07	Meja 1	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	964d2421-4734-4b4d-b769-f94da1b37de2	\N
f599b789-dc18-4560-9623-daa3741a8b11	9133834e-ef39-4135-97e3-a3d04ea53589	269000	cash	paid	2026-07-02 18:50:00+07	Meja 5	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	e199a19e-5a60-4b29-bc69-6878dc75f69a	\N
dad26f03-0bcd-435d-acd1-dda69a879396	9133834e-ef39-4135-97e3-a3d04ea53589	391000	cash	paid	2026-06-29 12:35:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	9f89d785-3da1-433b-8209-4df57bd19a73	\N
c9c0f0b8-0b34-4d56-bd81-aaf9ac1069ae	9133834e-ef39-4135-97e3-a3d04ea53589	743400	cash	paid	2026-08-11 13:07:00+07	Meja 2	82600	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	312d318d-5818-4955-8695-dc16ff0cdd6e	\N
ab1cfcb1-2a4e-4664-af3a-c2e47dce7e40	9133834e-ef39-4135-97e3-a3d04ea53589	650000	transfer	paid	2026-07-26 15:26:00+07	Meja 6	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	b8d62c02-cc4c-4c52-9304-1eb05648c31e	\N
88de6227-564c-4492-a07c-3950adf3cbbb	9133834e-ef39-4135-97e3-a3d04ea53589	303000	card	paid	2026-06-07 11:38:00+07	Meja 6	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	6f370081-dfa0-439c-afcc-9c772c76f5c2	\N
fbc51641-b459-4b18-9eff-006d3826922d	9133834e-ef39-4135-97e3-a3d04ea53589	276000	card	pending	2026-06-04 19:47:00+07	Meja 5	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
ad53a2ef-0bac-409f-8cc0-1c5501f70a30	9133834e-ef39-4135-97e3-a3d04ea53589	543000	cash	cancelled	2026-06-14 11:12:00+07	Meja 8	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
3002b89e-4185-4fa2-9d2c-779e503ab2d0	9133834e-ef39-4135-97e3-a3d04ea53589	901000	card	pending	2026-05-28 19:04:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
72a5bc33-5f68-4dbd-9641-fa276e31ae99	9133834e-ef39-4135-97e3-a3d04ea53589	404000	cash	completed	2026-07-01 20:56:00+07	Meja 8	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	fba0ada7-8847-487f-afb2-bae58035f0de	\N
3f870f79-7bc0-4cb2-8f6c-1c033f2a162f	9133834e-ef39-4135-97e3-a3d04ea53589	821000	transfer	paid	2026-05-25 19:02:00+07	Meja 1	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	5d82226f-c0bd-443c-8099-f4193a357030	\N
d989cddc-b4a8-4263-81b6-d912a6b4572a	9133834e-ef39-4135-97e3-a3d04ea53589	449000	transfer	pending	2026-06-13 19:43:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
4bdd0200-04f8-47f7-93e5-1353d859d41c	9133834e-ef39-4135-97e3-a3d04ea53589	472000	transfer	paid	2026-07-11 18:22:00+07	Meja 6	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	6f738030-9da5-456c-881a-5afebb2bcc3f	\N
22a13b93-4fa7-4112-a084-f2108580b6aa	9133834e-ef39-4135-97e3-a3d04ea53589	388000	cash	paid	2026-06-09 13:18:00+07	Meja 6	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	ae814fa6-d91e-46b0-a05c-9d46236ce416	\N
d9d8df3c-c2f3-4a81-ac4f-33f626e15eab	9133834e-ef39-4135-97e3-a3d04ea53589	548000	cash	paid	2026-06-27 11:05:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	3bbd2437-41db-4a7d-9112-7291a984613a	\N
93c44084-afbe-42c5-bfc5-7f08065d30ab	9133834e-ef39-4135-97e3-a3d04ea53589	821000	cash	completed	2026-07-08 19:49:00+07	Meja 6	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	bd05915d-2b82-4ac8-a288-1dae1e43e074	\N
a8b67061-d1cf-4446-b6f0-9bb44c63ec2f	9133834e-ef39-4135-97e3-a3d04ea53589	677000	transfer	pending	2026-05-20 13:04:00+07	Meja 2	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
e73ef591-f508-434c-9dd0-0108feda6e01	9133834e-ef39-4135-97e3-a3d04ea53589	873000	cash	completed	2026-07-19 13:24:00+07	Meja 2	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	50afda85-6186-4aea-862a-0f334c94522b	\N
c42447fe-ec1e-4b8c-ad03-36459e8e989c	9133834e-ef39-4135-97e3-a3d04ea53589	576000	card	paid	2026-07-08 18:45:00+07	Meja 3	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	3fd28fb4-f7c6-46bf-8a56-e13e011480b3	\N
daf10539-4564-4707-9394-b27c81433071	9133834e-ef39-4135-97e3-a3d04ea53589	775000	cash	completed	2026-06-13 12:02:00+07	Meja 5	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	77fa0e12-a581-423d-85e8-b7ffb2f5e19b	\N
63f43c48-0722-458c-9767-219f6056e1e5	9133834e-ef39-4135-97e3-a3d04ea53589	588000	card	paid	2026-07-07 12:12:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	b7574579-2efc-4f20-bb0f-fc730dc48923	\N
6214bb49-fa8d-494a-9335-c979db6c7846	9133834e-ef39-4135-97e3-a3d04ea53589	702000	card	paid	2026-07-25 20:53:00+07	Meja 8	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	81d49c79-0b87-4a5f-9094-0a337206f14b	\N
8ab33dbb-82c7-4583-af7f-08053c287536	9133834e-ef39-4135-97e3-a3d04ea53589	433800	card	paid	2026-06-10 11:07:00+07	\N	48200	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	e45d649e-aaf8-499f-b9da-cf02fcfa4238	\N
43f73b49-a103-4002-a359-ed2045204980	9133834e-ef39-4135-97e3-a3d04ea53589	753000	card	paid	2026-07-28 11:32:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	e6ac79fe-3528-46b6-8460-dee2bf4f5851	\N
bb888987-331e-4e41-8f80-5a511d3e1084	9133834e-ef39-4135-97e3-a3d04ea53589	545000	card	paid	2026-06-13 20:40:00+07	Meja 3	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	7778b011-a1ef-4ec6-a6c3-e0166ad58165	\N
1e5589d8-717b-4901-b961-06ed94b5a042	9133834e-ef39-4135-97e3-a3d04ea53589	414000	card	paid	2026-07-30 20:02:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	f6d6d5ee-dcbc-40b1-a303-4a024f573977	\N
36a105f0-a096-4eb7-89b1-331ab72fb9ce	9133834e-ef39-4135-97e3-a3d04ea53589	560000	transfer	paid	2026-06-16 11:28:00+07	Meja 2	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	4813fb74-c249-4634-945d-b9379c2357e9	\N
7bd483f0-56e8-47db-a638-8f62ba831d4a	9133834e-ef39-4135-97e3-a3d04ea53589	976000	card	paid	2026-06-09 13:21:00+07	Meja 4	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	85fe4d3f-b4b8-49b8-bdd4-a489b6938486	\N
d2c60024-a56e-46a7-a334-691e484ac256	9133834e-ef39-4135-97e3-a3d04ea53589	350100	cash	paid	2026-05-22 12:11:00+07	Meja 3	38900	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	74afbcc5-5be5-408b-a0e2-3ae9aa3f1c91	\N
a5b4a3d7-8fd9-41b0-9afa-1f05c5c8ff45	9133834e-ef39-4135-97e3-a3d04ea53589	688000	card	paid	2026-08-09 13:38:00+07	Meja 4	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	41faf3fc-6bdc-4918-871d-12f0e0a1efe7	\N
2b81c117-0a1d-427b-8a0a-7d5fcd639baf	9133834e-ef39-4135-97e3-a3d04ea53589	740000	cash	cancelled	2026-06-16 18:48:00+07	Meja 7	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
d6d4873a-528d-4806-944a-59aa910b0117	9133834e-ef39-4135-97e3-a3d04ea53589	828000	cash	paid	2026-05-18 13:12:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	078fb65f-132d-4f9c-8f42-084d5ccd66e2	\N
cb3ee024-2498-43be-b9e1-4fcbd349c75c	9133834e-ef39-4135-97e3-a3d04ea53589	339000	card	paid	2026-08-09 11:18:00+07	Meja 2	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	e16ee9f8-52c9-4db0-8f10-7752201e098d	\N
697416fa-e0fd-4b25-9503-b8e99c52f3b5	9133834e-ef39-4135-97e3-a3d04ea53589	499000	transfer	paid	2026-05-19 11:44:00+07	Meja 4	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	82f9489f-c33f-4d12-8992-fb6824313c41	\N
d15b9dc9-737b-4b16-9c2d-344e15e55b1b	9133834e-ef39-4135-97e3-a3d04ea53589	407000	card	cancelled	2026-06-22 12:11:00+07	Meja 7	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
6e8b7300-7710-4236-a9a7-59cb20a61752	9133834e-ef39-4135-97e3-a3d04ea53589	676000	cash	cancelled	2026-07-19 11:39:00+07	Meja 5	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
877dcaa6-6e0d-4520-ae74-c1145f230329	9133834e-ef39-4135-97e3-a3d04ea53589	746000	cash	paid	2026-06-26 12:40:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	e1477e9e-685f-4327-8693-0295feac193d	\N
ee8799b5-13bc-4c8b-8aa4-7c8c1baf32a3	9133834e-ef39-4135-97e3-a3d04ea53589	573000	cash	paid	2026-06-27 18:47:00+07	Meja 1	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	29e6f4df-9f9c-4297-bfdb-06ff682a2336	\N
64f6c8c1-46c0-4475-b5a7-c8baf0adedb5	9133834e-ef39-4135-97e3-a3d04ea53589	574200	card	cancelled	2026-08-08 11:24:00+07	Meja 3	63800	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
d58a4ac9-5041-4ff7-9d10-02ec1b7f87e0	9133834e-ef39-4135-97e3-a3d04ea53589	184000	card	completed	2026-06-22 18:16:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	778b7ba2-ca2c-4479-a804-3b1b85704cdc	\N
bf1eb956-59f8-48d1-a936-11e75bb3c2a9	9133834e-ef39-4135-97e3-a3d04ea53589	537000	cash	paid	2026-06-20 18:51:00+07	Meja 8	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	c220c8c0-97f7-4e24-8ea8-1562f4da601d	\N
ac516846-7920-4361-ae39-4680a3597a36	9133834e-ef39-4135-97e3-a3d04ea53589	472500	cash	completed	2026-08-08 18:46:00+07	Meja 5	52500	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	01b09b3a-218d-4e5e-a67f-ac79efe298e3	\N
9c303af7-25c2-42c0-bd3e-fd5c79dc2aa8	9133834e-ef39-4135-97e3-a3d04ea53589	734000	cash	paid	2026-08-07 18:18:00+07	Meja 8	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	d386e54d-ba4b-4665-b96d-3bf62f95621c	\N
f5805508-7922-44a7-8bd1-8f23a73c3751	9133834e-ef39-4135-97e3-a3d04ea53589	646000	cash	paid	2026-07-10 18:17:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	0975df81-68be-4ba1-bf1b-2cf0a8b557ea	\N
45492f39-036d-4ef6-ab5d-7b995b0e5809	9133834e-ef39-4135-97e3-a3d04ea53589	1230000	cash	cancelled	2026-07-08 18:31:00+07	Meja 1	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
94879bc1-d740-46a3-9d27-40bbebd7d880	9133834e-ef39-4135-97e3-a3d04ea53589	412000	card	paid	2026-08-06 12:47:00+07	Meja 2	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	7d893418-d12e-4c20-9c0f-cce0edff4333	\N
1b909f0c-aef7-4f1e-a7ef-58cdf1601059	9133834e-ef39-4135-97e3-a3d04ea53589	324000	cash	pending	2026-06-22 11:42:00+07	Meja 6	36000	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
3e530aaf-44a8-4dd0-bee7-a8cebc00fa35	9133834e-ef39-4135-97e3-a3d04ea53589	1028000	transfer	paid	2026-07-16 11:07:00+07	Meja 7	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	1f8cecc4-090a-4bb9-b07d-e8d64c999472	\N
bb5ab3e7-b425-49c1-867e-f2fdacf824b9	9133834e-ef39-4135-97e3-a3d04ea53589	311400	card	paid	2026-05-19 12:24:00+07	\N	34600	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	791b390a-aeae-41f6-8c06-67cdebce7fa8	\N
f7232f70-ea4b-4b12-8496-c7868bacb6c7	9133834e-ef39-4135-97e3-a3d04ea53589	426000	transfer	paid	2026-06-22 20:01:00+07	Meja 6	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	94bb0f25-488c-425f-a051-9e26651445bd	\N
ecc3579c-1cf5-4638-8f39-0ce39be1e633	9133834e-ef39-4135-97e3-a3d04ea53589	362000	transfer	paid	2026-07-10 12:21:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	0965194a-31d9-455b-be54-ee0c3f113c49	\N
b2b9847a-a98d-450f-85d9-2ca6a1f15b41	9133834e-ef39-4135-97e3-a3d04ea53589	783000	cash	cancelled	2026-07-28 19:46:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
c118a3bb-9d65-471d-a1a1-ec58e967677a	9133834e-ef39-4135-97e3-a3d04ea53589	153000	card	paid	2026-07-25 09:50:00+07	Meja 6	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	8a84b7c3-f61a-41a3-ae76-676b39101aa9	\N
02035282-3d04-4658-a561-a8712c7aeca5	9133834e-ef39-4135-97e3-a3d04ea53589	469000	cash	paid	2026-05-22 18:57:00+07	Meja 1	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	f2f8abf0-4ad8-451d-8ef9-281b45f1aced	\N
d012e4e8-dd9c-45da-9244-7e119974e760	9133834e-ef39-4135-97e3-a3d04ea53589	221000	card	paid	2026-05-20 18:18:00+07	Meja 8	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	e45e7186-1a12-4d96-82cd-17822010448f	\N
9036c0a0-71e2-468d-b586-823a2480b020	9133834e-ef39-4135-97e3-a3d04ea53589	398000	transfer	paid	2026-06-20 20:07:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	9f077158-7bd4-4e2b-a513-abdccbbc416f	\N
2554ac55-822a-49eb-8b4c-3dac547eab4b	9133834e-ef39-4135-97e3-a3d04ea53589	280000	cash	cancelled	2026-06-20 20:28:00+07	Meja 3	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
14763051-de56-46ef-8e35-8c7ed97edf58	9133834e-ef39-4135-97e3-a3d04ea53589	502200	card	pending	2026-06-22 20:12:00+07	Meja 5	55800	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
7a0e03ab-5b11-4eaf-abf2-ce82fc4c50c0	9133834e-ef39-4135-97e3-a3d04ea53589	440000	cash	paid	2026-07-09 19:21:00+07	Meja 2	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	4302c1d8-5ac1-44bf-97a0-886864f5a40e	\N
0a6331d7-1dfd-4d06-8cdc-72e41bddfcef	9133834e-ef39-4135-97e3-a3d04ea53589	761400	cash	completed	2026-07-27 12:31:00+07	Meja 6	84600	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	1a279086-6346-48db-95bb-7fe6bae3f28d	\N
e06e44ee-31c2-40c2-ba9d-e805c80a9d71	9133834e-ef39-4135-97e3-a3d04ea53589	783000	transfer	completed	2026-07-29 12:11:00+07	Meja 7	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	9e89563c-73e6-4817-b892-577344e3426f	\N
db789f1d-332e-4573-b00f-ca49f7015c98	9133834e-ef39-4135-97e3-a3d04ea53589	658000	transfer	paid	2026-07-17 20:26:00+07	Meja 4	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	bf21f525-af22-441b-8348-251f5921f795	\N
8fb648e7-7318-4817-b74c-5396fde26899	9133834e-ef39-4135-97e3-a3d04ea53589	347000	card	pending	2026-06-27 19:07:00+07	Meja 2	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
c1f92091-3395-42ad-bc7c-3277435831d1	9133834e-ef39-4135-97e3-a3d04ea53589	792000	transfer	pending	2026-05-16 20:46:00+07	Meja 8	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
a0d9cfe8-49b8-43dc-b2c1-bec359a49bc5	9133834e-ef39-4135-97e3-a3d04ea53589	709000	transfer	completed	2026-06-08 12:39:00+07	Meja 4	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	9269b283-3041-4bd4-b7a2-a69b0009bbc6	\N
84ddce28-cfb5-40e0-925b-82c00ae1d845	9133834e-ef39-4135-97e3-a3d04ea53589	494000	card	completed	2026-05-30 19:01:00+07	Meja 3	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	6ac9a15d-97ab-464b-94a1-f99febdfd12c	\N
0cb6ba79-3a90-4a2f-8c8f-dcf44a061fdc	9133834e-ef39-4135-97e3-a3d04ea53589	676000	transfer	cancelled	2026-06-01 20:06:00+07	Meja 8	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
e82975b2-67be-4687-ab1b-fa52f21d02c8	9133834e-ef39-4135-97e3-a3d04ea53589	471000	card	pending	2026-06-26 14:18:00+07	Meja 1	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
4df175f2-546e-4863-92d8-72d0e7535e6a	9133834e-ef39-4135-97e3-a3d04ea53589	241200	transfer	completed	2026-06-10 19:02:00+07	Meja 6	26800	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	d93342fa-9629-4183-a57f-35bb7a8cf6e0	\N
c0e8d6a9-dc0f-4951-b4a8-53f80a5e5fbb	9133834e-ef39-4135-97e3-a3d04ea53589	1167000	card	cancelled	2026-07-04 13:48:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
6353d038-ff05-4cbe-8cc0-775e745fd65f	9133834e-ef39-4135-97e3-a3d04ea53589	883000	card	paid	2026-06-17 13:41:00+07	Meja 1	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	e8359bca-569c-443d-b334-78f63ca59673	\N
423ffa5d-5a9f-46dc-aa0e-89a003ed3cda	9133834e-ef39-4135-97e3-a3d04ea53589	700000	cash	paid	2026-08-08 12:05:00+07	Meja 8	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	770517b2-01a6-4dbc-b3cd-08e8fe1fce88	\N
38d5491f-adba-4769-a023-a7c6584cd1e1	9133834e-ef39-4135-97e3-a3d04ea53589	546000	card	paid	2026-06-05 12:39:00+07	Meja 1	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	0bb6bcad-f0db-4c3a-a83a-c74777103b81	\N
801433b6-894d-42e1-a8fa-f041ca811eff	9133834e-ef39-4135-97e3-a3d04ea53589	466000	cash	paid	2026-08-04 12:44:00+07	Meja 6	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	d533b181-592b-4c21-a4bc-2039ca4cccd9	\N
7370755a-72a7-408a-86c0-8846a0333023	9133834e-ef39-4135-97e3-a3d04ea53589	387000	transfer	paid	2026-05-17 11:15:00+07	Meja 6	43000	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	0ec05f00-e1fb-4988-bbf4-83bb435109f8	\N
db51be87-57ad-4ac0-bd7b-53a143046ac1	9133834e-ef39-4135-97e3-a3d04ea53589	696000	card	pending	2026-07-16 13:07:00+07	Meja 8	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
3fe830f0-d0d4-4bf0-95a4-449ddac8dfa8	9133834e-ef39-4135-97e3-a3d04ea53589	301000	card	paid	2026-07-05 19:02:00+07	Meja 7	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	aeb81e29-7a4b-4552-ad45-047a0f3bb7aa	\N
b3a8a7c6-ba58-474a-a95d-9c68e400d50f	9133834e-ef39-4135-97e3-a3d04ea53589	667000	card	cancelled	2026-08-08 19:19:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
2e81a64f-a505-4ef8-98fa-71332fb05171	9133834e-ef39-4135-97e3-a3d04ea53589	753300	transfer	completed	2026-08-01 18:21:00+07	Meja 1	83700	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	8d276fd0-eb6c-487b-9c12-518282b1d5b8	\N
db5eff69-3421-4b27-acfc-3bf45be9d963	9133834e-ef39-4135-97e3-a3d04ea53589	876000	card	completed	2026-05-18 12:23:00+07	Meja 1	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	f12f73b3-c360-4ab2-92b2-6d10e26b09ad	\N
7fae7d63-d0a1-4fb7-a310-f5a1619bbd6b	9133834e-ef39-4135-97e3-a3d04ea53589	839000	card	paid	2026-06-22 18:07:00+07	Meja 4	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	f3bd999d-5ca9-4123-a1b5-ca589f079db7	\N
38b5ef26-8a6d-4a4a-9b70-e5738c784f52	9133834e-ef39-4135-97e3-a3d04ea53589	758000	card	paid	2026-07-03 19:35:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	4005d97f-1178-4fb1-9f3c-cc721c3c081a	\N
1c36a05b-a64b-4f37-9b3d-d026f925c623	9133834e-ef39-4135-97e3-a3d04ea53589	837000	cash	paid	2026-07-31 11:26:00+07	Meja 3	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	400424f8-fa58-417d-8f22-ed17e329f56b	\N
33492934-b09c-41b9-a06d-00c5a16e5bb3	9133834e-ef39-4135-97e3-a3d04ea53589	795000	cash	completed	2026-07-03 13:48:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	49491759-cb7a-40f0-bd45-9d07cc835ea7	\N
af7264a4-308e-4470-ad2a-10d88661f216	9133834e-ef39-4135-97e3-a3d04ea53589	486000	cash	paid	2026-05-23 12:11:00+07	Meja 4	54000	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	5032d825-244f-475a-9c58-be07a1e04ce4	\N
cc351b14-d115-411d-8e41-7cfd8627df85	9133834e-ef39-4135-97e3-a3d04ea53589	585000	transfer	paid	2026-07-04 20:30:00+07	Meja 2	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	daf73428-35ec-4ff7-a7ce-5cb52d46560b	\N
ad325732-13eb-4a65-b620-ba185448b988	9133834e-ef39-4135-97e3-a3d04ea53589	286000	transfer	completed	2026-06-21 12:44:00+07	Meja 1	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	5ca92872-46ef-4274-89c5-c105b063e974	\N
6285d3ea-7006-4c7b-ac9b-35e187157d60	9133834e-ef39-4135-97e3-a3d04ea53589	303000	transfer	paid	2026-07-23 09:14:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	37290480-5460-48a5-87d4-4d25c69f0003	\N
b1530886-110b-41cb-95d3-59b999a0bdb7	9133834e-ef39-4135-97e3-a3d04ea53589	1153000	cash	paid	2026-06-08 19:29:00+07	Meja 7	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	b57a5d87-a78c-47dd-9adf-815b68a5c80d	\N
31be94bc-8f1b-415c-a906-24700cb5812d	9133834e-ef39-4135-97e3-a3d04ea53589	454000	transfer	pending	2026-07-24 11:06:00+07	Meja 2	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
4238d662-36a2-4e6d-8ace-a06f41092aec	9133834e-ef39-4135-97e3-a3d04ea53589	234000	transfer	paid	2026-06-29 18:03:00+07	Meja 8	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	63d01c7e-09c4-41f1-b3f9-737c939198a1	\N
8b4b0311-fcdf-443d-acd8-15fbcb63b950	9133834e-ef39-4135-97e3-a3d04ea53589	481000	card	paid	2026-06-15 20:47:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	189048bb-6c6b-4805-adb5-144d75618f14	\N
bb15dd82-4647-47b0-a7dc-a11529a148a0	9133834e-ef39-4135-97e3-a3d04ea53589	575000	cash	cancelled	2026-06-25 18:25:00+07	Meja 3	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
a3a711b1-4e31-4046-8b51-3f4801b5693d	9133834e-ef39-4135-97e3-a3d04ea53589	404000	cash	paid	2026-08-12 09:25:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	6c6b2a41-298a-4d72-8b9e-d6b7e269d0b0	\N
ee33abaa-52df-4e69-a16e-88d747994d02	9133834e-ef39-4135-97e3-a3d04ea53589	740000	transfer	cancelled	2026-08-11 19:59:00+07	Meja 5	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
e028680f-502f-4335-a9e5-3266d34536b8	9133834e-ef39-4135-97e3-a3d04ea53589	394000	cash	pending	2026-05-30 11:08:00+07	Meja 7	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
f230ad26-e90d-4e97-b365-103637dc4d9b	9133834e-ef39-4135-97e3-a3d04ea53589	411000	cash	cancelled	2026-07-13 19:02:00+07	Meja 1	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
60f39543-422e-4685-a8cd-4cdf9a30c231	9133834e-ef39-4135-97e3-a3d04ea53589	707000	card	completed	2026-06-05 20:09:00+07	Meja 3	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	378fb668-573c-4a53-bc96-9fca8b2ec54b	\N
2e66a039-4e0c-44a1-b719-02243f25eaa5	9133834e-ef39-4135-97e3-a3d04ea53589	731000	cash	completed	2026-07-26 09:55:00+07	Meja 2	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	5ee74c4c-6d63-495a-b81d-ffaedd28e798	\N
ad35e5df-e686-4672-8169-4ed376fee29a	9133834e-ef39-4135-97e3-a3d04ea53589	710000	transfer	cancelled	2026-05-30 15:02:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
f56794c1-9980-4c71-a20c-b64a2c1cd32e	9133834e-ef39-4135-97e3-a3d04ea53589	533000	card	paid	2026-06-16 13:20:00+07	Meja 7	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	5cdf8a8a-b474-43ef-b924-29cbd0d6aa7f	\N
3ebcbfd6-76d0-4f69-a93f-aa5f9f89b2f0	9133834e-ef39-4135-97e3-a3d04ea53589	490000	transfer	paid	2026-07-11 12:25:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	a0ade761-28c8-41f8-b5f3-bd99631c2bf8	\N
ff427e93-1b80-4de8-9694-5a5023a36901	9133834e-ef39-4135-97e3-a3d04ea53589	262000	card	paid	2026-06-05 11:17:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	573b994d-13a6-471d-8b4d-d43564e1afc3	\N
4352a519-dcbf-443f-87c5-256105618b15	9133834e-ef39-4135-97e3-a3d04ea53589	243000	transfer	paid	2026-07-15 11:02:00+07	Meja 3	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	86b0080a-e065-4430-8454-c4c16fca17e9	\N
7ff107f2-ee7d-44a2-8806-75d6172d4823	9133834e-ef39-4135-97e3-a3d04ea53589	851400	card	pending	2026-07-19 11:27:00+07	\N	94600	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
dc10dffb-60d5-4b0c-aabf-0a44f3130fc3	9133834e-ef39-4135-97e3-a3d04ea53589	477000	card	paid	2026-08-10 13:04:00+07	Meja 4	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	8f444f06-c7ab-4d9e-8d4f-f1e7eb229152	\N
6e8de710-72cb-48c5-8f4a-2bdae21c6867	9133834e-ef39-4135-97e3-a3d04ea53589	302400	card	cancelled	2026-06-02 13:33:00+07	Meja 2	33600	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
8b966b47-66fb-4525-b4be-b3c17e415225	9133834e-ef39-4135-97e3-a3d04ea53589	944000	cash	paid	2026-05-22 20:20:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	24ad35ea-35b6-4ab3-b60c-d3e656434cc4	\N
5a81cf8c-308b-4462-9a3e-9769501d39d9	9133834e-ef39-4135-97e3-a3d04ea53589	807000	card	paid	2026-05-26 09:02:00+07	Meja 1	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	b63669a2-d9fd-44af-a94e-857173743fbb	\N
8b685b57-767b-4d22-a273-f148ffce718a	9133834e-ef39-4135-97e3-a3d04ea53589	457000	card	completed	2026-07-31 19:06:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	9bdd8bbb-095c-4551-be64-11d1693338d5	\N
4da06741-a80f-47cb-982d-af53e8555803	9133834e-ef39-4135-97e3-a3d04ea53589	1008000	card	pending	2026-07-03 19:04:00+07	Meja 3	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
1de8a285-a307-4256-a1d8-c0da9dd66497	9133834e-ef39-4135-97e3-a3d04ea53589	295000	transfer	cancelled	2026-06-13 19:27:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
41581666-4386-4ee1-83bb-bf7a0fef3991	9133834e-ef39-4135-97e3-a3d04ea53589	1117000	cash	paid	2026-05-27 12:47:00+07	Meja 7	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	1e0b3261-f114-46a6-8163-00ca2667297d	\N
3f33809f-b10b-44de-99f1-62aa19a5759b	9133834e-ef39-4135-97e3-a3d04ea53589	635000	card	cancelled	2026-06-10 11:22:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
2b96a09f-dfc3-49ad-983e-705cdf799758	9133834e-ef39-4135-97e3-a3d04ea53589	771000	card	paid	2026-06-18 15:42:00+07	Meja 1	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	bf11d74b-60c6-45fb-a40e-1bf4c85e4f77	\N
7b6fd967-2195-43e2-b0df-ef6a0188be10	9133834e-ef39-4135-97e3-a3d04ea53589	692000	transfer	cancelled	2026-05-17 13:44:00+07	Meja 2	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
2aa05888-bcf5-4c04-b29f-7c8831159ed3	9133834e-ef39-4135-97e3-a3d04ea53589	559800	cash	paid	2026-06-14 13:48:00+07	Meja 6	62200	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	8fe34b2c-ab02-4a80-947c-a7014d467ebd	\N
ccb8d52d-12c3-4b32-84f2-dc60758c8ce2	9133834e-ef39-4135-97e3-a3d04ea53589	838000	transfer	paid	2026-08-11 19:10:00+07	Meja 1	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	95bfdd70-c1ef-4b50-8069-94f8309ab60d	\N
7b14ecbb-2643-4c44-bdf7-c4167fcdd7b8	9133834e-ef39-4135-97e3-a3d04ea53589	638000	card	paid	2026-06-14 13:26:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	2ecee2bc-483a-412e-ac91-c1a21a08ec89	\N
bd4ca980-4611-4f53-b0f9-aabcd212325b	9133834e-ef39-4135-97e3-a3d04ea53589	369000	cash	paid	2026-06-11 13:52:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	8a4c77a0-47e0-4689-81cc-355cc4e54436	\N
78899d39-5d9e-4d82-8d42-bfba95363075	9133834e-ef39-4135-97e3-a3d04ea53589	476000	card	pending	2026-05-31 12:39:00+07	Meja 5	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
f97b3b3d-b80d-4357-be08-a3c74836622a	9133834e-ef39-4135-97e3-a3d04ea53589	563000	card	pending	2026-07-06 11:48:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
2bb7505d-0c90-4010-a5e6-be8b757a3a59	9133834e-ef39-4135-97e3-a3d04ea53589	397000	transfer	paid	2026-06-19 14:13:00+07	Meja 5	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	31b358c8-31f1-40de-b552-49e1f8d955df	\N
74032e6f-baa2-4304-bf00-f3154e1e7afe	9133834e-ef39-4135-97e3-a3d04ea53589	631800	card	paid	2026-06-05 12:05:00+07	\N	70200	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	402ad326-56ad-4378-a99f-6850ce5be336	\N
d6201aca-0421-4e30-9634-71c653031583	9133834e-ef39-4135-97e3-a3d04ea53589	738000	cash	paid	2026-07-04 20:21:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	d354fc57-cc8d-42b8-92f9-af95c059cd80	\N
f5203a1b-51d9-4eb7-aeee-b2b39178e936	9133834e-ef39-4135-97e3-a3d04ea53589	176400	transfer	completed	2026-07-22 12:04:00+07	Meja 3	19600	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	8e750408-9bf8-4812-8b4a-dc18a39fce63	\N
37fb1982-4222-4df4-937c-6fab7141c2ca	9133834e-ef39-4135-97e3-a3d04ea53589	469000	cash	paid	2026-07-29 11:25:00+07	Meja 1	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	2426d985-1a38-4f04-b58e-30e80896f063	\N
592f9cd8-fa71-48a8-b45d-0dc5e479b940	9133834e-ef39-4135-97e3-a3d04ea53589	388000	card	completed	2026-07-23 19:48:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	b7f21b56-3abe-4fcf-bed1-b574c38f9c8d	\N
f2541be6-54a3-477e-bcd2-dd6212b931fb	9133834e-ef39-4135-97e3-a3d04ea53589	782100	cash	completed	2026-07-12 11:00:00+07	Meja 1	86900	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	be82f7e1-7110-47f4-ba81-719e4489fabb	\N
db0db4d1-dbbb-497a-a4b7-47ca2493b29c	9133834e-ef39-4135-97e3-a3d04ea53589	173000	card	paid	2026-06-12 20:57:00+07	Meja 7	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	a0fe8bdf-3fb1-4382-9a54-4c9d5e6cee02	\N
b2888206-5391-48a9-b268-1d4938f9586a	9133834e-ef39-4135-97e3-a3d04ea53589	477000	card	paid	2026-07-01 13:17:00+07	Meja 5	53000	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	dd17949f-7e1d-44b7-94d3-440a58f6353f	\N
f9522738-ad22-4f2c-838c-bffcfc797f81	9133834e-ef39-4135-97e3-a3d04ea53589	516600	card	paid	2026-08-12 18:29:00+07	\N	57400	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	8c0269c8-363e-4b83-bf72-acca36a2ba33	\N
9df77ff6-1631-4680-9c6a-33b312e5a516	9133834e-ef39-4135-97e3-a3d04ea53589	468000	transfer	completed	2026-08-04 20:06:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	68650d30-cd96-4849-bd2f-07199ee9c756	\N
e47d4258-05ad-455f-ad91-b7ba5af9db3d	9133834e-ef39-4135-97e3-a3d04ea53589	346000	cash	paid	2026-08-06 12:48:00+07	Meja 3	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	834856aa-2421-4f36-a710-b6888959e02c	\N
17c6f325-b47e-4732-b4ed-aacb6c85a228	9133834e-ef39-4135-97e3-a3d04ea53589	255000	card	completed	2026-07-12 18:11:00+07	Meja 5	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	77ab7362-20bd-4489-9d25-909be49ccbb3	\N
0dfcecc6-3d97-47db-8f74-c964bff937b7	9133834e-ef39-4135-97e3-a3d04ea53589	604800	transfer	pending	2026-07-16 13:29:00+07	Meja 6	67200	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
b60de131-ff5b-4d59-bbb1-e3764953e16a	9133834e-ef39-4135-97e3-a3d04ea53589	653000	cash	paid	2026-06-18 20:48:00+07	Meja 1	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	856cfa1e-ca66-463f-83bb-445b38c4099c	\N
e9e9c143-593f-4b2a-894b-0556384f5a73	9133834e-ef39-4135-97e3-a3d04ea53589	505800	cash	paid	2026-05-23 13:57:00+07	Meja 6	56200	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	0ae518b1-b697-4ec8-9c40-e0262f5a2897	\N
68902824-11fe-4bbe-86ff-87f46b0a3b61	9133834e-ef39-4135-97e3-a3d04ea53589	496800	cash	completed	2026-07-04 09:22:00+07	Meja 5	55200	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	5abded22-d95e-478e-a6b6-9643a207cc8a	\N
cd30dd1b-56e0-47fc-bba6-0693f477cf0a	9133834e-ef39-4135-97e3-a3d04ea53589	939000	cash	paid	2026-07-18 12:19:00+07	Meja 6	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	41926ce6-dd13-4ee9-962c-d05c5c217e21	\N
73088109-3f2b-42f6-ae0a-54db69adae29	9133834e-ef39-4135-97e3-a3d04ea53589	311000	transfer	completed	2026-06-03 19:40:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	535c36ba-8480-4ba2-8ffb-829fd6a920be	\N
a007311b-ee5d-47a1-9b23-a971160379df	9133834e-ef39-4135-97e3-a3d04ea53589	479000	transfer	pending	2026-07-25 11:31:00+07	Meja 3	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
3b1e8995-f511-4457-8c65-9e38bbd980a6	9133834e-ef39-4135-97e3-a3d04ea53589	213300	cash	pending	2026-05-18 11:55:00+07	Meja 7	23700	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
0541b15b-18ee-4f77-8c0e-a464ecf829fc	9133834e-ef39-4135-97e3-a3d04ea53589	642000	cash	paid	2026-07-23 19:03:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	c534222b-29d3-4db0-89b3-2c9d03dfaabf	\N
9c5eba36-38df-4b8b-9bc5-3b11e1d865d4	9133834e-ef39-4135-97e3-a3d04ea53589	532000	card	paid	2026-06-17 20:16:00+07	Meja 7	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	fc9df875-69bf-46ca-bd59-5a1d2390ac82	\N
396bcb7b-a516-4301-a106-107d164245d0	9133834e-ef39-4135-97e3-a3d04ea53589	610000	card	completed	2026-05-15 19:44:00+07	Meja 2	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	457ec573-6777-4418-aaa3-43408cf807df	\N
24dec61c-a681-4b5c-8019-f1e56be90a50	9133834e-ef39-4135-97e3-a3d04ea53589	325800	cash	paid	2026-06-08 12:33:00+07	Meja 3	36200	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	d3e922ff-f771-4a3d-b768-0be9412093e4	\N
6cc7d8e4-9270-46ec-915c-a57ae0ef5b8c	9133834e-ef39-4135-97e3-a3d04ea53589	531000	transfer	cancelled	2026-06-09 11:41:00+07	Meja 5	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
10cdf339-2125-481c-b02f-17e6797861cc	9133834e-ef39-4135-97e3-a3d04ea53589	412000	card	cancelled	2026-05-21 19:52:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
663ff5cd-66c4-4bb8-aeb0-53dff5a7436f	9133834e-ef39-4135-97e3-a3d04ea53589	563000	transfer	paid	2026-05-25 11:07:00+07	Meja 1	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	a9d755f7-7f21-4c39-a497-18d6b82fd09d	\N
3b5e4fad-3079-40da-8173-0b4065fecbf5	9133834e-ef39-4135-97e3-a3d04ea53589	408000	card	paid	2026-05-21 19:07:00+07	Meja 6	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	2572bebd-62da-46c3-9d43-1c673268f210	\N
b375c368-cbae-4d53-9f9e-a3a797e6fa4a	9133834e-ef39-4135-97e3-a3d04ea53589	338000	card	completed	2026-07-29 13:56:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	8856dcdf-0752-49cf-b542-f8a45f6f8427	\N
d0962c34-8b32-463c-b56c-86e72bcc6061	9133834e-ef39-4135-97e3-a3d04ea53589	649000	card	paid	2026-06-17 13:14:00+07	Meja 1	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	59bd25d3-3ecc-4b7a-98bd-362da1c74d82	\N
3ee1adc0-e0a2-4e79-beb4-aef13b68c141	9133834e-ef39-4135-97e3-a3d04ea53589	570000	card	pending	2026-07-05 16:23:00+07	Meja 1	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
ab042b1f-3612-4d79-9985-75a5c3aef8f1	9133834e-ef39-4135-97e3-a3d04ea53589	805000	cash	completed	2026-07-23 11:17:00+07	Meja 3	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	f8753dfa-e64c-4fde-adb8-2fb516bd9f21	\N
5f8a6718-0c35-4322-9c72-3a2e1be5633f	9133834e-ef39-4135-97e3-a3d04ea53589	400000	card	pending	2026-07-30 20:22:00+07	Meja 2	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
37a8a7ce-810f-45be-8be6-1cae0312a32d	9133834e-ef39-4135-97e3-a3d04ea53589	349000	card	paid	2026-06-30 10:07:00+07	Meja 2	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	ef75ef90-8c9e-49cd-a113-a019b958891e	\N
a6fcce19-1fa7-4b14-93a8-dcc336a2c7d8	9133834e-ef39-4135-97e3-a3d04ea53589	715000	cash	paid	2026-06-09 13:57:00+07	Meja 2	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	6dd8a631-e509-4de0-a045-68e01c1d62b2	\N
35d9086d-a2dc-4ada-b970-c2c1a7fdcc9b	9133834e-ef39-4135-97e3-a3d04ea53589	370000	card	cancelled	2026-06-12 18:08:00+07	Meja 1	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
87a21a43-a202-4795-9066-bb6d03e2a9bc	9133834e-ef39-4135-97e3-a3d04ea53589	486000	transfer	paid	2026-05-31 18:02:00+07	Meja 1	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	635609f0-e01c-4640-9cff-18db13457749	\N
a1a3e923-3a20-44ec-87b9-09609829e517	9133834e-ef39-4135-97e3-a3d04ea53589	835000	cash	paid	2026-07-24 19:03:00+07	Meja 5	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	84678649-72ac-4886-9f9c-07e3a66ea022	\N
9cd0e83e-a889-4e13-9c29-56a6c16974da	9133834e-ef39-4135-97e3-a3d04ea53589	545400	cash	cancelled	2026-06-20 13:59:00+07	Meja 1	60600	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
ba7b8b52-41a3-4ec1-9c8a-feb525009a5e	9133834e-ef39-4135-97e3-a3d04ea53589	850000	transfer	paid	2026-05-28 20:47:00+07	Meja 5	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	66b2e392-dbaa-4ac4-8720-bea59a16e636	\N
37b6ad73-8927-4c59-868a-a959485969c9	9133834e-ef39-4135-97e3-a3d04ea53589	800000	card	pending	2026-05-23 11:23:00+07	Meja 4	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
7d679829-9202-4192-acb2-997c7261ed1d	9133834e-ef39-4135-97e3-a3d04ea53589	544000	card	paid	2026-07-17 11:59:00+07	Meja 5	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	050b6a8c-2f85-4daa-9487-9739a4dfa177	\N
7bd3791c-a45a-4ff8-be48-1d5bfba49919	9133834e-ef39-4135-97e3-a3d04ea53589	678000	card	paid	2026-06-13 13:36:00+07	Meja 2	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	8975c130-64ee-4757-af8b-8147502f43ec	\N
0743541b-0a68-42ae-a0ea-3bd1c6e329eb	9133834e-ef39-4135-97e3-a3d04ea53589	919800	cash	cancelled	2026-05-31 13:44:00+07	Meja 7	102200	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
7d4bf4f3-8b38-48b5-9c9f-ca4ae844f130	9133834e-ef39-4135-97e3-a3d04ea53589	988000	transfer	paid	2026-05-23 09:46:00+07	Meja 3	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	8a3e8ec2-6f4a-444f-b857-8d4e0ef9d14a	\N
67291b42-3e09-4e1b-9360-24160d058f49	9133834e-ef39-4135-97e3-a3d04ea53589	758000	cash	pending	2026-06-25 19:29:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
06b9e756-6edb-4afe-89ca-d5b0d075288a	9133834e-ef39-4135-97e3-a3d04ea53589	340000	cash	paid	2026-08-12 18:51:00+07	Meja 3	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	176142f7-6556-419a-9b9f-20f003e697c1	\N
f9ed209f-b4eb-44d6-818c-23085200e246	9133834e-ef39-4135-97e3-a3d04ea53589	425000	cash	paid	2026-07-25 20:39:00+07	Meja 1	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	d4ba6040-f30f-4ad0-9610-a7d27e2a690e	\N
30bcb239-a8b7-4ac3-85d7-387959b9b07d	9133834e-ef39-4135-97e3-a3d04ea53589	295200	card	paid	2026-05-25 10:12:00+07	Meja 8	32800	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	0a44576d-cf36-4b78-8781-0b5ff83c18ec	\N
34ed2f69-45dd-481f-a9f7-5a485a9fe084	9133834e-ef39-4135-97e3-a3d04ea53589	389000	transfer	paid	2026-08-09 19:45:00+07	Meja 8	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	2bd46e33-8d51-40b8-9b8e-d45144c2a1c0	\N
53ad0420-2acd-4bc2-a86f-0f26a6eb3980	9133834e-ef39-4135-97e3-a3d04ea53589	688000	card	paid	2026-07-15 18:06:00+07	Meja 7	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	d9747894-ef56-431a-b015-f1255de2aed7	\N
2eb9a87f-15e2-4027-b96e-7f6a0a1093b3	9133834e-ef39-4135-97e3-a3d04ea53589	839000	card	cancelled	2026-06-17 18:19:00+07	Meja 5	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
8e75cae9-ebac-4ecf-84a9-e48f7f9e81ee	9133834e-ef39-4135-97e3-a3d04ea53589	637200	card	pending	2026-06-26 18:00:00+07	Meja 8	70800	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
b0ec5cfd-79b6-463d-89f6-1474f6188c73	9133834e-ef39-4135-97e3-a3d04ea53589	821000	cash	cancelled	2026-06-27 15:45:00+07	Meja 1	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
71bae7b1-8b8a-4dec-b0cc-4901d3f1b2ac	9133834e-ef39-4135-97e3-a3d04ea53589	627000	card	completed	2026-07-28 12:16:00+07	Meja 4	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	45ff6774-d46a-4603-8d1d-f670d6f33ed6	\N
601746ec-2aa4-4b6b-b6bb-8e57d391703e	9133834e-ef39-4135-97e3-a3d04ea53589	241000	transfer	paid	2026-07-08 20:51:00+07	Meja 3	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	5a644183-8b42-49a3-9649-92304399f509	\N
4380db15-7c0a-4bb7-9ce0-b8ce7edecec9	9133834e-ef39-4135-97e3-a3d04ea53589	405900	card	cancelled	2026-06-03 12:49:00+07	Meja 1	45100	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
4ba7e663-819e-4637-b456-22a49f318b5a	9133834e-ef39-4135-97e3-a3d04ea53589	362000	card	pending	2026-05-24 17:46:00+07	Meja 6	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
2ed11fb6-a4ee-4013-8f24-0077470e51dd	9133834e-ef39-4135-97e3-a3d04ea53589	592000	cash	paid	2026-07-27 12:36:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	8769369e-4bfb-4773-a419-11cdafcc846e	\N
918b4292-7ff9-4f4c-9090-2c1db8650587	9133834e-ef39-4135-97e3-a3d04ea53589	976000	transfer	paid	2026-05-19 15:31:00+07	Meja 3	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	4cd5b6e8-f58d-45e4-8121-d6a6177df772	\N
04b2b6da-d1ea-4452-a585-d6653f87e742	9133834e-ef39-4135-97e3-a3d04ea53589	1397000	cash	paid	2026-08-01 13:07:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	72ecc3e9-b616-4418-9fce-5889e483aeb9	\N
f4f2f780-c53d-4314-b9c3-20208cbf7dec	9133834e-ef39-4135-97e3-a3d04ea53589	693000	card	completed	2026-07-10 10:31:00+07	Meja 2	77000	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	56230b6d-c3f0-45a8-9d76-596fd1d1725c	\N
1675f780-769a-4c28-88c2-2c1555eb8611	9133834e-ef39-4135-97e3-a3d04ea53589	619000	card	paid	2026-06-05 15:48:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	e75c1efe-9e16-40b4-b295-1e4292c701dd	\N
c0eab934-22b6-44a3-b940-ca7ccb2e2482	9133834e-ef39-4135-97e3-a3d04ea53589	291000	card	paid	2026-06-21 13:27:00+07	Meja 8	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	d76da80a-fdae-41fe-a61d-dbd1a3ec4bd1	\N
2d23eb00-edca-4c4f-83bb-21ecf1862950	9133834e-ef39-4135-97e3-a3d04ea53589	597000	card	completed	2026-05-21 19:44:00+07	Meja 1	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	2c7f716e-a343-4634-80db-92f31a2d83d9	\N
bf69551e-327f-49cf-abcd-73bd600e858b	9133834e-ef39-4135-97e3-a3d04ea53589	560000	cash	paid	2026-06-20 10:53:00+07	Meja 7	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	1aaaebd4-bb1f-414d-81db-81cc253365a2	\N
2f17cebb-4b0a-4800-8d68-d447b644064c	9133834e-ef39-4135-97e3-a3d04ea53589	761000	card	paid	2026-06-11 20:50:00+07	Meja 2	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	7aa84659-0ad7-48e8-846f-8c6f0465a9d7	\N
48cc3469-21e2-47aa-8241-5a2c411482a5	9133834e-ef39-4135-97e3-a3d04ea53589	625000	transfer	pending	2026-06-01 13:09:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
2b5b06ae-4056-494e-aa2a-140dbaedd02b	9133834e-ef39-4135-97e3-a3d04ea53589	476000	transfer	cancelled	2026-07-04 12:45:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
6ee0f398-4c8e-49de-8dcd-b19d7bd2d8ea	9133834e-ef39-4135-97e3-a3d04ea53589	532000	cash	completed	2026-05-30 12:17:00+07	Meja 8	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	90494935-9986-4bd6-8a8d-bd1c2f942c1c	\N
bf6cead8-0bd6-4fc9-8801-e292a8d4b735	9133834e-ef39-4135-97e3-a3d04ea53589	558000	transfer	paid	2026-05-23 13:43:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	20201ad2-3116-4e77-b703-cbe592ea0f70	\N
132c36bf-d90a-46ca-8a0c-5db4a3e1311e	9133834e-ef39-4135-97e3-a3d04ea53589	351000	card	paid	2026-06-10 11:41:00+07	Meja 1	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	6546cc83-940e-478f-ab48-b8c7be824f09	\N
c9a5d7c0-39de-47a6-b47e-421bdde4c3df	9133834e-ef39-4135-97e3-a3d04ea53589	817000	card	paid	2026-07-30 20:01:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	31aa5775-3b65-4ca6-b762-9534defaf19f	\N
994005c8-5a04-4866-a7fc-1805e9c95fb5	9133834e-ef39-4135-97e3-a3d04ea53589	644000	cash	paid	2026-07-13 13:36:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	84c4bdb2-1efa-4539-80ec-41d29a136ee3	\N
93818dfc-f1c9-4eee-a1d4-1accdd83dae4	9133834e-ef39-4135-97e3-a3d04ea53589	630000	transfer	cancelled	2026-08-04 18:28:00+07	Meja 8	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
48afc2b8-f7cc-4328-b49b-675608c109e3	9133834e-ef39-4135-97e3-a3d04ea53589	493000	card	pending	2026-08-12 20:26:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
c31e5c28-9ec2-4bc6-90bc-e77838b9e6d8	9133834e-ef39-4135-97e3-a3d04ea53589	237600	cash	paid	2026-06-27 12:42:00+07	Meja 2	26400	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	6cc87d65-436c-40b3-8328-b2561c613029	\N
4331bf24-79f6-42b1-aad4-efd3c02db70f	9133834e-ef39-4135-97e3-a3d04ea53589	783000	card	paid	2026-06-08 12:15:00+07	Meja 5	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	77455ab6-3d80-41a5-b887-f28bc84a50e4	\N
8ff87b1a-19d1-402e-a6a2-5080fd48d3a9	9133834e-ef39-4135-97e3-a3d04ea53589	494000	transfer	pending	2026-08-07 12:35:00+07	Meja 6	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
f24e2a16-46bb-4cda-90be-0a39607fa004	9133834e-ef39-4135-97e3-a3d04ea53589	270000	card	cancelled	2026-07-16 12:13:00+07	Meja 3	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
7542dd41-b0c5-4b30-80b2-cfb11db59a39	9133834e-ef39-4135-97e3-a3d04ea53589	463000	transfer	pending	2026-06-01 12:07:00+07	Meja 6	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
0f5d5835-9afa-4f1c-9277-9fc4f82e64eb	9133834e-ef39-4135-97e3-a3d04ea53589	1055000	cash	paid	2026-05-27 13:15:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	f5d9ae3f-c8de-4a3f-8f0c-73a9fbbea39a	\N
2e0ffae2-6bd9-4ce0-b4c3-80c5cd940068	9133834e-ef39-4135-97e3-a3d04ea53589	516000	card	paid	2026-07-18 12:30:00+07	Meja 7	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	06656e65-f964-4efc-ada6-dde2e8a9a0b0	\N
cb7de401-ed25-4fe9-a6ce-c1e3cc1ae555	9133834e-ef39-4135-97e3-a3d04ea53589	549000	transfer	paid	2026-06-01 20:07:00+07	Meja 2	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	8312b480-f3ad-4d97-ae37-1442efe3243b	\N
5442e30a-59a6-411a-a356-cc2f432e46b3	9133834e-ef39-4135-97e3-a3d04ea53589	506000	transfer	paid	2026-06-07 20:33:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	7c4e756d-f3a2-4433-9fe3-476f5595c538	\N
dc68ea32-8e65-4e4c-893b-188c588791d3	9133834e-ef39-4135-97e3-a3d04ea53589	499000	cash	paid	2026-07-14 18:08:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	b07bea65-81ec-4e1e-a184-e20f09e1dad0	\N
532bb693-1b2e-4dbb-9224-d94f90363a0b	9133834e-ef39-4135-97e3-a3d04ea53589	936000	transfer	paid	2026-06-15 11:23:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	3c8111f6-2c6d-4a6c-8bc2-2e785849851b	\N
f86aa9dc-6497-4d69-b7b1-d8be77dfb997	9133834e-ef39-4135-97e3-a3d04ea53589	437000	cash	cancelled	2026-05-20 20:43:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
3b272102-d0dc-410e-adf7-04076e5149b0	9133834e-ef39-4135-97e3-a3d04ea53589	540900	cash	cancelled	2026-05-15 20:08:00+07	Meja 8	60100	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
178ada1c-bd5d-4e40-9ae4-45063e44be08	9133834e-ef39-4135-97e3-a3d04ea53589	302400	card	paid	2026-06-12 10:53:00+07	Meja 6	33600	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	8357503f-7498-4bc3-8163-36f75bb254ae	\N
663ef4e5-9d01-40a3-9b37-b9ceb3b19955	9133834e-ef39-4135-97e3-a3d04ea53589	180000	card	completed	2026-06-23 12:51:00+07	Meja 7	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	fa3c0580-38c4-451d-9f5b-ab7a9b57f947	\N
1c75af2c-44d3-4482-b871-882071a54938	9133834e-ef39-4135-97e3-a3d04ea53589	941000	cash	paid	2026-05-30 20:31:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	2256b648-123c-4580-9add-cb0503cce631	\N
77885b5c-7834-4210-a4df-4bb5efdf9bcc	9133834e-ef39-4135-97e3-a3d04ea53589	585900	card	paid	2026-06-10 19:26:00+07	Meja 1	65100	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	9347b266-4da9-4bee-a3ec-18a0a6ce6538	\N
e91c3802-9280-4334-a993-1d77ea01c059	9133834e-ef39-4135-97e3-a3d04ea53589	370000	card	cancelled	2026-06-22 20:57:00+07	Meja 5	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
4da0691b-0131-43d4-b6c0-da3bcaa6985d	9133834e-ef39-4135-97e3-a3d04ea53589	608000	cash	pending	2026-06-07 13:43:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
a8e04cdb-8c14-44ec-9f79-ba9b2ecd96d0	9133834e-ef39-4135-97e3-a3d04ea53589	322000	cash	completed	2026-07-05 19:48:00+07	Meja 3	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	a28655d1-ff2c-4762-bc50-5650a379e182	\N
3a9d17c3-bd34-4a63-8799-ece09949918a	9133834e-ef39-4135-97e3-a3d04ea53589	551000	card	paid	2026-05-26 13:49:00+07	Meja 6	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	ddd85fd9-70a6-45a8-bee3-ca41c92eace3	\N
ce6e9e5d-801f-45af-ab31-83de9c9e3d5e	9133834e-ef39-4135-97e3-a3d04ea53589	280000	cash	cancelled	2026-07-27 12:31:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
a77e2ff4-ac55-4c78-8366-288eea982c0c	9133834e-ef39-4135-97e3-a3d04ea53589	720000	cash	paid	2026-05-24 19:24:00+07	Meja 6	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	194c03d1-77ba-43e9-bce1-544cc55fb3ce	\N
60f65814-9d8f-4d85-93da-2b78c5c29d8e	9133834e-ef39-4135-97e3-a3d04ea53589	713000	cash	cancelled	2026-05-30 20:10:00+07	Meja 1	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
06db2960-5b2e-420a-acac-971b937b5412	9133834e-ef39-4135-97e3-a3d04ea53589	250000	card	paid	2026-07-17 20:14:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	87e75f0e-eae7-4d8c-9dac-b7d592e09d85	\N
9dd49790-f59a-4479-8ad3-4d22accc4838	9133834e-ef39-4135-97e3-a3d04ea53589	333000	cash	pending	2026-08-06 13:28:00+07	Meja 1	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
e956c605-56f6-4a01-b65b-bcd00c7ef89b	9133834e-ef39-4135-97e3-a3d04ea53589	908000	cash	paid	2026-05-17 18:59:00+07	Meja 4	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	378642a3-086f-4b15-adba-7ff0e1990097	\N
561c8090-3837-4e36-97ca-b3e3759835e4	9133834e-ef39-4135-97e3-a3d04ea53589	282000	transfer	cancelled	2026-06-09 19:40:00+07	Meja 8	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
fbb39031-d349-49e6-b776-2bc214694c0d	9133834e-ef39-4135-97e3-a3d04ea53589	567000	transfer	cancelled	2026-06-19 18:36:00+07	Meja 5	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
c7353d96-3ed8-4565-b5b0-c3f273148a25	9133834e-ef39-4135-97e3-a3d04ea53589	366000	card	paid	2026-08-05 11:40:00+07	Meja 4	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	a8d6ca4f-0838-4652-9212-b6d5c3bbcab0	\N
483168d3-1d27-42b1-963d-4487edfdc8d5	9133834e-ef39-4135-97e3-a3d04ea53589	970000	cash	completed	2026-07-03 11:07:00+07	Meja 6	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	6101d527-1fc8-485f-b80d-1b3785a8ed29	\N
ff729df8-a4cf-4fb8-84a1-b990496459e3	9133834e-ef39-4135-97e3-a3d04ea53589	546000	card	paid	2026-05-19 13:49:00+07	Meja 8	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	d534950e-e5ed-49ed-932d-403940b3153b	\N
9b669f7d-6651-4435-ab38-2619c7a606db	9133834e-ef39-4135-97e3-a3d04ea53589	692000	cash	paid	2026-06-18 12:56:00+07	Meja 1	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	49777b65-00f6-40c5-bc8e-35c03460e640	\N
d50bcb56-ff14-4271-bcb3-d37b123ff4f9	9133834e-ef39-4135-97e3-a3d04ea53589	952000	cash	cancelled	2026-08-10 18:19:00+07	Meja 7	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
9045e714-37d5-42c0-9101-4a5d6e0c3cbd	9133834e-ef39-4135-97e3-a3d04ea53589	950400	transfer	cancelled	2026-06-27 14:00:00+07	\N	105600	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
7c78d7c3-b7d0-4ebf-ba13-7d64ac4a66ba	9133834e-ef39-4135-97e3-a3d04ea53589	440000	card	paid	2026-06-10 11:14:00+07	Meja 2	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	358ced35-0c27-4b5f-9e40-d3ac668f2cf9	\N
52ca97f2-224d-4741-9545-35612f78a28a	9133834e-ef39-4135-97e3-a3d04ea53589	656000	cash	cancelled	2026-08-01 20:40:00+07	Meja 8	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
82088048-a119-42b4-9ef6-6eca9d533fe6	9133834e-ef39-4135-97e3-a3d04ea53589	314000	card	cancelled	2026-08-07 16:08:00+07	Meja 4	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
ba26535b-dc47-4278-aa6c-15ef7d129538	9133834e-ef39-4135-97e3-a3d04ea53589	826000	transfer	paid	2026-06-09 12:14:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	555f2281-b0ff-49c6-98eb-bb0149a952f3	\N
7c449362-ebc1-4600-9f78-649f1be4613a	9133834e-ef39-4135-97e3-a3d04ea53589	764000	cash	cancelled	2026-05-17 13:11:00+07	Meja 4	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
84c7c07e-c5a8-4248-b76a-1d1dd1248cf7	9133834e-ef39-4135-97e3-a3d04ea53589	652000	transfer	pending	2026-07-27 12:18:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
e9ef4604-9902-4d17-837e-4d28fdf14b5e	9133834e-ef39-4135-97e3-a3d04ea53589	752000	card	paid	2026-07-19 11:57:00+07	Meja 2	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	a8823de1-2bd9-46b8-8cc2-63333d2eeca9	\N
b0dd400d-f8eb-49e3-b1a4-96ee3f13aa56	9133834e-ef39-4135-97e3-a3d04ea53589	960000	cash	paid	2026-06-27 09:38:00+07	Meja 3	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	70252185-a40c-4a50-b5f0-2f61351566c7	\N
6789df6f-d638-414f-8715-7cc10f9f07b8	9133834e-ef39-4135-97e3-a3d04ea53589	362000	cash	paid	2026-06-10 18:23:00+07	Meja 6	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	22e7ad7d-bf6e-44a9-b7d9-7f987e8ec8a7	\N
49eb5c2e-7205-4eaa-977d-940ff68cb766	9133834e-ef39-4135-97e3-a3d04ea53589	618000	transfer	pending	2026-07-06 12:55:00+07	Meja 3	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
1ec3011b-57d1-4ee3-ba5d-99d90ee7e6cb	9133834e-ef39-4135-97e3-a3d04ea53589	509000	transfer	cancelled	2026-06-26 11:23:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
1c99bbcb-f0f1-4709-a6c7-dc918435527b	9133834e-ef39-4135-97e3-a3d04ea53589	532000	transfer	pending	2026-07-05 18:55:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	\N
54205e83-31db-4d7f-a565-c076f8130872	9133834e-ef39-4135-97e3-a3d04ea53589	877000	transfer	paid	2026-06-11 18:00:00+07	\N	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	a4c8453c-9078-4864-8e54-2b5c09871701	\N
5b609815-1699-419c-8674-ea3c7ea1a08b	9133834e-ef39-4135-97e3-a3d04ea53589	208000	card	completed	2026-07-05 13:12:00+07	Meja 4	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	8ffc1c44-b320-4e81-b2cd-21891ccd5ab6	\N
ddcdf1d8-131f-4071-9780-dd7736e97eb1	9133834e-ef39-4135-97e3-a3d04ea53589	939000	cash	paid	2026-08-07 11:37:00+07	Meja 7	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	3b2fcbee-91e0-436c-8ac2-db6abfbbd9f7	\N
52046e27-2698-42cb-a74a-6939452be6f6	9133834e-ef39-4135-97e3-a3d04ea53589	717000	card	paid	2026-07-19 13:18:00+07	Meja 7	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	f9b77e1c-1a69-432d-8a20-de0712fe2e18	\N
7f30827a-2b81-4c6f-81b2-b82a97aa497f	9133834e-ef39-4135-97e3-a3d04ea53589	325000	cash	completed	2026-08-07 12:20:00+07	Meja 5	0	0	\N	\N	413ec5c9-2713-47ff-b0b3-b475a8447656	338ca661-a1eb-47c7-ad45-32ed1b11d956	\N
\.


--
-- Data for Name: outlets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.outlets (id, name, code, address, phone, is_active, created_at, updated_at, delivery_fee, company_id) FROM stdin;
413ec5c9-2713-47ff-b0b3-b475a8447656	Outlet Pusat	OUT-001	Jl. Jendral Sudirman No. 1, Jakarta	021-12345678	t	2026-08-13 09:25:16.36	2026-08-13 09:25:16.36	15000	00000000-0000-4000-8000-000000000001
cfe7fcb6-92f2-45e7-bcd4-ad1d8efc259a	Outlet Cabang Senopati	OUT-002	Jl. Senopati Raya No. 45, Jakarta Selatan	021-87654321	t	2026-08-13 09:25:16.748	2026-08-13 09:25:16.748	15000	00000000-0000-4000-8000-000000000001
c31fc88f-2847-47aa-991a-3fd353d6542e	Outlet Cabang BSD	OUT-003	Jl. BSD City Raya No. 78, Tangerang	021-55555555	t	2026-08-13 09:25:16.753	2026-08-13 09:25:16.753	15000	00000000-0000-4000-8000-000000000001
\.


--
-- Data for Name: payment_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payment_transactions (id, order_id, gateway, gateway_tx_id, amount, payment_method, status, qr_code, qr_expiry, paid_at, created_at, updated_at, void_reason, voided_at, voided_by) FROM stdin;
d223e467-475e-4ecc-ace4-b9c3e347ac6a	02548a7e-407a-465f-b749-4358cbbaeff6	manual	\N	470000	cash	completed	\N	\N	2026-06-03 06:04:00	2026-08-13 09:25:16.98	2026-08-13 09:25:16.98	\N	\N	\N
e0a1e65c-e6cf-45db-83eb-04f378e2f276	18a5b5ee-edcf-4986-8a16-c54a8196c803	manual	\N	1261000	cash	completed	\N	\N	2026-06-14 13:43:00	2026-08-13 09:25:17.003	2026-08-13 09:25:17.003	\N	\N	\N
ef34b88a-d9a5-4643-9961-be34eb4b5ab8	f5fdeeee-5cbd-43ab-bf32-5f47b2c4450a	manual	\N	460000	cash	completed	\N	\N	2026-07-19 03:03:00	2026-08-13 09:25:17.02	2026-08-13 09:25:17.02	\N	\N	\N
aed08c08-7af8-4ca7-8846-408921fd68d6	2aafef5e-9b9b-4da2-9c66-96cb0aa617ed	qris	\N	545000	card	completed	\N	\N	2026-06-07 12:58:00	2026-08-13 09:25:17.033	2026-08-13 09:25:17.033	\N	\N	\N
14df6778-5ff5-443d-9baf-52164458287b	f1b24ce5-9746-40ab-830b-471cf2524501	qris	\N	609000	card	completed	\N	\N	2026-07-22 05:08:00	2026-08-13 09:25:17.042	2026-08-13 09:25:17.042	\N	\N	\N
73ee55fe-22dc-4c7c-8852-065032568bce	a11c35d7-4bf7-4904-96e7-c004b0b44a0f	qris	\N	243000	card	completed	\N	\N	2026-07-06 05:56:00	2026-08-13 09:25:17.05	2026-08-13 09:25:17.05	\N	\N	\N
5a6c1348-7d7b-4dc5-9c96-91bd3d77edb9	34dcb5a8-914d-408d-9543-04fe54587244	qris	\N	335000	card	completed	\N	\N	2026-05-20 08:29:00	2026-08-13 09:25:17.064	2026-08-13 09:25:17.064	\N	\N	\N
185cfafa-82e6-42e9-8142-3adf329aeed9	2d4b5eb4-c9a0-4f34-af8b-32f75336c4a4	qris	\N	709000	card	completed	\N	\N	2026-06-19 13:23:00	2026-08-13 09:25:17.091	2026-08-13 09:25:17.091	\N	\N	\N
768f58f8-5efc-4c9b-be62-5447c66e9910	e0aaad70-7b94-4021-9135-ffb1a781f65b	qris	\N	1172000	card	completed	\N	\N	2026-07-13 05:02:00	2026-08-13 09:25:17.102	2026-08-13 09:25:17.102	\N	\N	\N
c0d4b195-1091-413d-b5df-6cbb6bd32806	24c5f39b-df39-4af3-acc6-e60f362b1535	qris	\N	914000	card	completed	\N	\N	2026-06-24 03:43:00	2026-08-13 09:25:17.115	2026-08-13 09:25:17.115	\N	\N	\N
2cc6ad11-8ff0-451a-816a-98858fbb5060	75496fc9-3394-4bf7-a2fd-9143c7c3d0ce	qris	\N	436000	card	completed	\N	\N	2026-06-22 10:14:00	2026-08-13 09:25:17.128	2026-08-13 09:25:17.128	\N	\N	\N
e5e0493c-027b-4b03-804a-495862db7ffe	5f436b83-5736-49ff-a583-b01d0b3d4844	manual	\N	293000	cash	completed	\N	\N	2026-07-03 11:06:00	2026-08-13 09:25:17.14	2026-08-13 09:25:17.14	\N	\N	\N
97dc185a-df2d-4d15-a444-5be07a37da01	304bd31e-68d4-495e-b14f-41b0b18f6a5c	manual	\N	515000	cash	completed	\N	\N	2026-06-29 02:10:00	2026-08-13 09:25:17.153	2026-08-13 09:25:17.153	\N	\N	\N
a1e701fe-c4ba-4377-8e28-3dfaee9ddc9f	20eeab6a-15d9-43f5-ace1-1d00ed56b77e	qris	\N	474000	transfer	completed	\N	\N	2026-07-02 13:36:00	2026-08-13 09:25:17.164	2026-08-13 09:25:17.164	\N	\N	\N
b8a0f88e-17e3-4032-bd98-09c35f1567fe	b80ec5c6-2ba1-4261-8e2f-50a9186dc1a8	manual	\N	797000	cash	completed	\N	\N	2026-05-18 06:46:00	2026-08-13 09:25:17.204	2026-08-13 09:25:17.204	\N	\N	\N
9c8f19f9-d9ff-49d3-978f-cd5447d53289	71839682-0231-44da-9405-d06a4c9be926	manual	\N	864000	cash	completed	\N	\N	2026-08-07 11:21:00	2026-08-13 09:25:17.228	2026-08-13 09:25:17.228	\N	\N	\N
9d07e889-ae80-41c9-8087-1af985d490f8	413d274f-51c1-424c-b1d0-bc552fc3dbcd	manual	\N	371700	cash	completed	\N	\N	2026-07-26 11:10:00	2026-08-13 09:25:17.25	2026-08-13 09:25:17.25	\N	\N	\N
5e60775e-0bc7-4b24-8ad8-91f7cec3d973	e7f6632b-7f8a-414d-827a-f378d921836b	manual	\N	421000	cash	completed	\N	\N	2026-06-03 13:40:00	2026-08-13 09:25:17.273	2026-08-13 09:25:17.273	\N	\N	\N
da36feed-f972-4f6f-8bd3-ddb3461814b1	3bd58b58-4b26-4c27-89ff-ce4cb4ea8e28	manual	\N	310000	cash	completed	\N	\N	2026-08-10 04:17:00	2026-08-13 09:25:17.286	2026-08-13 09:25:17.286	\N	\N	\N
f0256e81-96c1-4a35-a747-3861db8c3da2	a931272e-461e-4818-960b-ac5d84718f97	qris	\N	682000	transfer	completed	\N	\N	2026-06-19 11:02:00	2026-08-13 09:25:17.296	2026-08-13 09:25:17.296	\N	\N	\N
e028f28d-d817-4915-8d56-e25e8701a2e4	bde35d01-6efb-4409-bc59-0a227efcf441	qris	\N	788000	transfer	completed	\N	\N	2026-07-11 12:29:00	2026-08-13 09:25:17.304	2026-08-13 09:25:17.304	\N	\N	\N
c7e7899f-028a-43d3-8651-e098dae0d395	27d11210-9573-476a-aa6f-f8c2ec6db42d	manual	\N	356000	cash	completed	\N	\N	2026-07-30 07:01:00	2026-08-13 09:25:17.313	2026-08-13 09:25:17.313	\N	\N	\N
81d310cd-f63a-4579-b95e-d9f02e2cdb05	000f7ba5-06f8-4a65-a0e6-e2bfbbd64981	qris	\N	631800	transfer	completed	\N	\N	2026-05-26 10:58:00	2026-08-13 09:25:17.321	2026-08-13 09:25:17.321	\N	\N	\N
c8ca2a62-9ca4-4b60-8eb2-840a01071c96	b7f52d2c-6f6e-44d1-afe2-c97c5ff4cfcc	manual	\N	856000	cash	completed	\N	\N	2026-08-12 04:57:00	2026-08-13 09:25:17.33	2026-08-13 09:25:17.33	\N	\N	\N
7afaa3e7-28ca-4faa-abff-a218062b70eb	882aefea-c7ab-4d93-8270-c4a73d3610de	qris	\N	511000	transfer	completed	\N	\N	2026-05-17 09:56:00	2026-08-13 09:25:17.339	2026-08-13 09:25:17.339	\N	\N	\N
b6ec1620-12a1-4255-8e04-68489e9f0b89	bd6323a1-d006-497e-89af-dd18ee4fdebe	manual	\N	394000	cash	completed	\N	\N	2026-06-11 07:17:00	2026-08-13 09:25:17.347	2026-08-13 09:25:17.347	\N	\N	\N
00b071ce-5ffa-47fd-9b5f-2ffd4d882ca4	50ad577b-590b-438a-8fd1-06b17971b12b	qris	\N	418000	card	completed	\N	\N	2026-07-06 13:34:00	2026-08-13 09:25:17.36	2026-08-13 09:25:17.36	\N	\N	\N
bfa5a541-bbd6-419a-9ff9-655452103348	7e7669bc-4023-4901-aa41-7db516a0fd1c	manual	\N	778000	cash	completed	\N	\N	2026-07-01 10:03:00	2026-08-13 09:25:17.369	2026-08-13 09:25:17.369	\N	\N	\N
c9102f5f-dda4-4f3d-8801-d72526d566ce	81665cd4-6de4-47c7-8d3a-99477b09bdcf	qris	\N	415000	card	completed	\N	\N	2026-06-29 13:28:00	2026-08-13 09:25:17.379	2026-08-13 09:25:17.379	\N	\N	\N
b5df9302-1fb6-409e-b9ac-68d10fa61a8b	2f3ac4e0-723d-4c8a-bde8-e9b27fd96933	qris	\N	667000	transfer	completed	\N	\N	2026-08-06 13:36:00	2026-08-13 09:25:17.387	2026-08-13 09:25:17.387	\N	\N	\N
40909226-f6f1-493b-8317-ba4bfe8fe814	c13dba7c-f84c-4ba7-9d26-20e7011b0d6f	qris	\N	822000	transfer	completed	\N	\N	2026-06-14 06:00:00	2026-08-13 09:25:17.397	2026-08-13 09:25:17.397	\N	\N	\N
d7e22ced-03a7-4fb4-96f2-47245812ef02	d7179d6a-d2dc-4c31-a44e-c1270b24ac70	qris	\N	403200	card	completed	\N	\N	2026-05-18 12:05:00	2026-08-13 09:25:17.405	2026-08-13 09:25:17.405	\N	\N	\N
0cf0f40e-4383-4190-a5e9-8d2d1b1e77d0	28fae993-6ab8-4521-8170-419f97320813	qris	\N	296000	card	completed	\N	\N	2026-06-09 12:40:00	2026-08-13 09:25:17.417	2026-08-13 09:25:17.417	\N	\N	\N
e9804ed2-ae36-4774-b2fb-db8f4ac2032c	5cee9486-df96-4668-a3a4-80c875d37cae	qris	\N	758000	transfer	completed	\N	\N	2026-06-10 06:48:00	2026-08-13 09:25:17.426	2026-08-13 09:25:17.426	\N	\N	\N
e7367804-e3de-4617-9bd2-39659daae9bd	db9602cf-163a-48f0-9c49-bff1c428a7b3	qris	\N	720000	card	completed	\N	\N	2026-08-07 04:28:00	2026-08-13 09:25:17.435	2026-08-13 09:25:17.435	\N	\N	\N
74aefda4-4b83-4691-9d64-7ce7a12db363	5529c415-66b5-4086-a1c6-a793eb85f4ec	qris	\N	108000	transfer	completed	\N	\N	2026-05-27 12:52:00	2026-08-13 09:25:17.443	2026-08-13 09:25:17.443	\N	\N	\N
67778e5a-34c6-4cc9-acfe-07994ca4b215	2c8572a8-6001-4d5f-abab-9e43023121fe	qris	\N	768600	transfer	completed	\N	\N	2026-06-10 13:08:00	2026-08-13 09:25:17.453	2026-08-13 09:25:17.453	\N	\N	\N
cabe79d6-6570-4867-bab2-e0c0b61e7923	187631c0-5a42-4af7-bad6-893847572d0f	manual	\N	819000	cash	completed	\N	\N	2026-06-01 13:46:00	2026-08-13 09:25:17.463	2026-08-13 09:25:17.463	\N	\N	\N
5a81722e-b768-4ff9-91a4-9115288d03a3	0232c90a-be47-405b-964a-60b938d9143a	qris	\N	754000	card	completed	\N	\N	2026-08-01 03:18:00	2026-08-13 09:25:17.474	2026-08-13 09:25:17.474	\N	\N	\N
18cbd35e-97ef-4ef9-beb9-dc9c7eff49ae	1070f283-7ea0-4b67-a629-ceec25defe19	qris	\N	794000	transfer	completed	\N	\N	2026-06-13 12:04:00	2026-08-13 09:25:17.484	2026-08-13 09:25:17.484	\N	\N	\N
dacd43b5-7266-4e70-8d09-618b31398e5d	0603d225-e5dc-4f87-949e-19496497203e	qris	\N	475000	transfer	completed	\N	\N	2026-07-08 06:13:00	2026-08-13 09:25:17.492	2026-08-13 09:25:17.492	\N	\N	\N
c842806d-b79c-46c2-bcd4-8e06e6df8ebc	0b74b501-6175-4347-aeb9-5f26663470a9	qris	\N	1025000	transfer	completed	\N	\N	2026-07-01 05:24:00	2026-08-13 09:25:17.501	2026-08-13 09:25:17.501	\N	\N	\N
744f717a-990b-4769-beaf-44004685738d	8c1feb2c-0d89-4a9f-a307-0579817f8eab	qris	\N	535000	transfer	completed	\N	\N	2026-05-26 04:37:00	2026-08-13 09:25:17.51	2026-08-13 09:25:17.51	\N	\N	\N
cfbea05c-2452-4931-ba4d-3681f32fb87e	84ebfad7-b488-4282-8eec-86946c235032	qris	\N	605000	transfer	completed	\N	\N	2026-06-05 11:06:00	2026-08-13 09:25:17.52	2026-08-13 09:25:17.52	\N	\N	\N
44d0cc4a-dd3b-41e8-973f-8c60042ba14d	69e326b5-bc18-481d-b0d3-3dab60b8a13f	qris	\N	356000	transfer	completed	\N	\N	2026-08-09 12:36:00	2026-08-13 09:25:17.53	2026-08-13 09:25:17.53	\N	\N	\N
2fb58a3c-225e-4456-b174-270bc7bde7ec	0d462aa1-2d29-4cef-b880-32803c3877fd	qris	\N	771000	transfer	completed	\N	\N	2026-07-18 08:13:00	2026-08-13 09:25:17.54	2026-08-13 09:25:17.54	\N	\N	\N
3ce37eb9-77f1-43f1-95d0-5a61ca590a78	76e799f2-0bab-4273-8d3a-0a26fe065249	qris	\N	334000	card	completed	\N	\N	2026-06-08 04:58:00	2026-08-13 09:25:17.548	2026-08-13 09:25:17.548	\N	\N	\N
6288b86a-72a3-4acb-91af-1f3330c7125f	e036fd4a-78fc-4d94-a126-c69397c62443	qris	\N	562000	card	completed	\N	\N	2026-07-05 06:41:00	2026-08-13 09:25:17.557	2026-08-13 09:25:17.557	\N	\N	\N
5584c052-96f8-4059-a1f1-ec596906a716	ba382715-f9ba-4c4e-b1ce-cd9db642805c	qris	\N	970000	transfer	completed	\N	\N	2026-07-26 12:10:00	2026-08-13 09:25:17.566	2026-08-13 09:25:17.566	\N	\N	\N
2ea62dd0-fc6f-49ee-aa26-c5e457aa8ff6	1a2c22e7-5ecb-4196-ba55-62e3b173cd14	qris	\N	840000	card	completed	\N	\N	2026-05-20 11:06:00	2026-08-13 09:25:17.575	2026-08-13 09:25:17.575	\N	\N	\N
91270fe7-850b-41c0-89e6-67c16bec6f0e	b4e8a020-623c-44ea-895e-ce6442808745	qris	\N	760000	card	completed	\N	\N	2026-07-15 05:36:00	2026-08-13 09:25:17.584	2026-08-13 09:25:17.584	\N	\N	\N
f78fa63c-9e80-4de9-8751-42ae43378ae0	ed5ccf0e-dede-4964-a382-e44012ead7df	manual	\N	332000	cash	completed	\N	\N	2026-06-25 04:27:00	2026-08-13 09:25:17.592	2026-08-13 09:25:17.592	\N	\N	\N
204dc353-823f-42a7-9c35-a81e4d32097e	81183027-9e54-482c-8799-eab3695c55fd	qris	\N	651600	card	completed	\N	\N	2026-05-22 11:27:00	2026-08-13 09:25:17.606	2026-08-13 09:25:17.606	\N	\N	\N
6496537d-bc2e-4594-9ed5-09c05c706f0e	badc7ff7-f8a3-43a7-a49f-f8d57c4dc88c	qris	\N	535000	transfer	completed	\N	\N	2026-05-22 11:34:00	2026-08-13 09:25:17.615	2026-08-13 09:25:17.615	\N	\N	\N
d612b48e-a969-4cd2-8059-142720eb7990	4ddd27fa-9d11-4117-8f2d-abe83ab27665	qris	\N	331000	card	completed	\N	\N	2026-06-11 05:43:00	2026-08-13 09:25:17.627	2026-08-13 09:25:17.627	\N	\N	\N
a71de898-dba4-4a78-9101-9e07e4117bf1	0db3bf26-15bd-4afa-a852-32555a122ce9	qris	\N	226000	card	completed	\N	\N	2026-06-03 11:23:00	2026-08-13 09:25:17.639	2026-08-13 09:25:17.639	\N	\N	\N
8e17d608-2609-473c-99ab-e17770610dcf	188145f3-83dc-48f4-b082-d7331dd5a6ba	manual	\N	406000	cash	completed	\N	\N	2026-06-09 05:07:00	2026-08-13 09:25:17.648	2026-08-13 09:25:17.648	\N	\N	\N
02ce512a-2988-4945-aebe-fea826fd4631	578f426a-4de6-4ce9-a15b-6c34260bc6e8	qris	\N	568000	transfer	completed	\N	\N	2026-07-12 13:42:00	2026-08-13 09:25:17.661	2026-08-13 09:25:17.661	\N	\N	\N
eec8e737-b0ff-4880-b458-8605268c5151	a0e1609e-f2f7-41b4-a9be-580cc481ce68	manual	\N	278000	cash	completed	\N	\N	2026-06-06 04:35:00	2026-08-13 09:25:17.676	2026-08-13 09:25:17.676	\N	\N	\N
243b6fc3-32c1-4126-80c7-a38b10bdf5ba	af30e6a1-2557-498d-8b75-3f8917acfdd5	qris	\N	635000	card	completed	\N	\N	2026-08-08 07:07:00	2026-08-13 09:25:17.684	2026-08-13 09:25:17.684	\N	\N	\N
0b9a78e6-e9ac-425e-b4aa-c43359ca3473	6a526dbf-7231-4050-86d8-5a98cc4c82c1	qris	\N	457000	card	completed	\N	\N	2026-06-16 04:33:00	2026-08-13 09:25:17.699	2026-08-13 09:25:17.699	\N	\N	\N
f9ca83fe-76d6-4d57-8ead-65a660bb0160	d842d6e5-c180-4ed3-b2d3-1813fd6def98	qris	\N	552000	transfer	completed	\N	\N	2026-06-26 08:26:00	2026-08-13 09:25:17.708	2026-08-13 09:25:17.708	\N	\N	\N
fab4f0b0-9d94-4060-96c1-850dc6b13b90	de8d544c-dd7f-4bc2-b3db-11fa0f53b605	manual	\N	716000	cash	completed	\N	\N	2026-07-20 12:24:00	2026-08-13 09:25:17.721	2026-08-13 09:25:17.721	\N	\N	\N
be839229-f02e-4a1a-966a-b082ba7fab2a	427ae7a6-82ac-40df-adad-f91c3e265c36	qris	\N	751000	card	completed	\N	\N	2026-08-01 11:49:00	2026-08-13 09:25:17.73	2026-08-13 09:25:17.73	\N	\N	\N
6bf3e703-63ae-41de-bd5e-d2fd2fcab581	7e5ad3c2-bcf9-4294-ab76-ff5a6bcec093	qris	\N	837000	transfer	completed	\N	\N	2026-07-31 13:49:00	2026-08-13 09:25:17.738	2026-08-13 09:25:17.738	\N	\N	\N
f43f2848-4289-4a64-85b5-5136f087d1a2	d1f8d593-6b02-4ffb-8542-8e35ddc6e5db	manual	\N	460000	cash	completed	\N	\N	2026-07-24 04:14:00	2026-08-13 09:25:17.751	2026-08-13 09:25:17.751	\N	\N	\N
22e70f3e-4b8a-46fe-a64c-eb1537c81c86	4b816e7e-3c43-4300-893c-d134a834e476	qris	\N	173700	transfer	completed	\N	\N	2026-06-25 11:12:00	2026-08-13 09:25:17.76	2026-08-13 09:25:17.76	\N	\N	\N
5c562a18-f8c3-4dad-91fa-084d70cc0c4f	67d58101-b660-43f0-b0af-e1815ad53349	manual	\N	515000	cash	completed	\N	\N	2026-07-30 04:49:00	2026-08-13 09:25:17.782	2026-08-13 09:25:17.782	\N	\N	\N
69c85b29-478b-44cb-bf06-18d22d10596a	2bd47d9e-e01a-448d-bd2d-d2c9c97b283c	manual	\N	738000	cash	completed	\N	\N	2026-07-18 06:32:00	2026-08-13 09:25:17.791	2026-08-13 09:25:17.791	\N	\N	\N
ba8dc102-a14c-4ce9-b611-7d775d43a678	39daa26b-d7be-4523-b6fd-81a1f8cb42e4	manual	\N	490000	cash	completed	\N	\N	2026-07-02 12:46:00	2026-08-13 09:25:17.801	2026-08-13 09:25:17.801	\N	\N	\N
20a0f10a-d32b-4a53-8fad-90ff4a4407cb	5ba398fb-01aa-4a38-a6ad-2094a2faf4d9	manual	\N	763000	cash	completed	\N	\N	2026-05-22 04:39:00	2026-08-13 09:25:17.81	2026-08-13 09:25:17.81	\N	\N	\N
8ba5e145-2778-49fb-a581-82856388bd9e	f93744eb-6eec-4b53-8ad9-003a11d3150b	qris	\N	893000	transfer	completed	\N	\N	2026-06-03 06:19:00	2026-08-13 09:25:17.825	2026-08-13 09:25:17.825	\N	\N	\N
f44f7ecd-7877-4db3-8b6a-63a50579e2ce	0a994637-102f-4e08-b6ea-38fa237fbc98	qris	\N	317000	transfer	completed	\N	\N	2026-05-22 12:44:00	2026-08-13 09:25:17.835	2026-08-13 09:25:17.835	\N	\N	\N
eaf41932-4ccf-4ec1-954b-970c569801d1	936b3165-834f-412a-a61c-a6209490a62a	qris	\N	817000	transfer	completed	\N	\N	2026-07-24 11:25:00	2026-08-13 09:25:17.844	2026-08-13 09:25:17.844	\N	\N	\N
b47bf7a5-f910-4c91-8430-e665e3de9aeb	5723287d-0c1e-42c9-bdcd-431e8a5daec7	qris	\N	416000	card	completed	\N	\N	2026-05-21 05:35:00	2026-08-13 09:25:17.852	2026-08-13 09:25:17.852	\N	\N	\N
95d754ca-4564-4a83-afa1-d7fd06432bcb	f566af81-b20b-4dc7-8f56-2e815899b666	qris	\N	824000	card	completed	\N	\N	2026-05-15 12:46:00	2026-08-13 09:25:17.865	2026-08-13 09:25:17.865	\N	\N	\N
19ad928d-93c9-4a84-9571-fbc251494e9a	0150c23a-6abe-4a3a-8ebe-85220146ebc9	manual	\N	877000	cash	completed	\N	\N	2026-06-21 04:59:00	2026-08-13 09:25:17.874	2026-08-13 09:25:17.874	\N	\N	\N
49f7a864-206f-4b4a-a3b7-d7dd6ecc491b	ef7a0454-86fe-4a73-987c-5f33c8ef3486	qris	\N	828000	card	completed	\N	\N	2026-08-04 12:38:00	2026-08-13 09:25:17.887	2026-08-13 09:25:17.887	\N	\N	\N
e1c07e14-ee6a-43d4-a310-5b9e42c7810d	e3a2849e-41ae-47b7-ba7c-ba8eff8cd0c5	qris	\N	556000	card	completed	\N	\N	2026-06-15 04:51:00	2026-08-13 09:25:17.896	2026-08-13 09:25:17.896	\N	\N	\N
cacedbd6-495d-413b-a43b-36900077ccca	dbe0d3fa-ff58-4d82-bc8e-6db9002e75c2	qris	\N	269000	card	completed	\N	\N	2026-06-21 11:06:00	2026-08-13 09:25:17.904	2026-08-13 09:25:17.904	\N	\N	\N
1e176633-9eb6-4a3a-a8c7-419879d42df5	885db444-6630-4404-9fc2-3eaab11a542b	manual	\N	982000	cash	completed	\N	\N	2026-07-28 05:44:00	2026-08-13 09:25:17.917	2026-08-13 09:25:17.917	\N	\N	\N
c7a44b9f-bb0a-4917-9796-5b28b253e5ca	e665c630-1746-4ced-84c5-0d30fe3cf4dd	qris	\N	332000	card	completed	\N	\N	2026-05-27 11:04:00	2026-08-13 09:25:17.925	2026-08-13 09:25:17.925	\N	\N	\N
1bd6f2ea-e44a-4269-9a73-7d3e94268881	2cc2c3fa-2a0c-4782-8531-bc48632c1a30	qris	\N	564000	card	completed	\N	\N	2026-06-01 13:14:00	2026-08-13 09:25:17.934	2026-08-13 09:25:17.934	\N	\N	\N
ef483af7-9ae6-464a-aa09-afca6d7f1051	af0b105e-39f2-402e-a642-d57915ff202e	qris	\N	326000	card	completed	\N	\N	2026-07-13 05:43:00	2026-08-13 09:25:17.95	2026-08-13 09:25:17.95	\N	\N	\N
0c5b7ecc-3592-4ba6-9c8c-be8b65416f26	5757131f-d08b-4266-8a62-e2824bd4a95e	qris	\N	422000	transfer	completed	\N	\N	2026-07-13 04:11:00	2026-08-13 09:25:17.968	2026-08-13 09:25:17.968	\N	\N	\N
93201133-804d-4d0c-8fc8-d2d913c49bb7	953fa126-2546-4708-9a31-d71cde15962f	qris	\N	484000	transfer	completed	\N	\N	2026-06-05 05:59:00	2026-08-13 09:25:17.978	2026-08-13 09:25:17.978	\N	\N	\N
13198d6a-92b1-469a-bc8c-3fd48692ca84	46fc0b0e-2576-430c-9d3f-649d9aa4676d	qris	\N	522000	card	completed	\N	\N	2026-05-16 06:25:00	2026-08-13 09:25:17.986	2026-08-13 09:25:17.986	\N	\N	\N
8d77c70a-d329-4ac8-bc00-9b9b2a10a74e	f5fc7467-2e2c-4d61-ae6a-89e5c613e887	qris	\N	281000	transfer	completed	\N	\N	2026-07-26 04:45:00	2026-08-13 09:25:17.995	2026-08-13 09:25:17.995	\N	\N	\N
4e3ea00d-f09b-4337-b5db-9900cf5d700e	7be02ac1-49b3-4802-bef0-a9f014aa5fa0	manual	\N	409000	cash	completed	\N	\N	2026-06-17 06:21:00	2026-08-13 09:25:18.003	2026-08-13 09:25:18.003	\N	\N	\N
2860f530-6f6a-4188-b924-c99a4a428c72	daeac7d9-8d56-47b0-83db-08432c705ec4	manual	\N	722000	cash	completed	\N	\N	2026-06-10 05:33:00	2026-08-13 09:25:18.016	2026-08-13 09:25:18.016	\N	\N	\N
db99a9fd-1f9a-4a87-804c-7d309e11be6b	6b2f5e28-60db-454a-b1f4-26542db5964d	qris	\N	434000	transfer	completed	\N	\N	2026-06-04 07:29:00	2026-08-13 09:25:18.033	2026-08-13 09:25:18.033	\N	\N	\N
a587c822-56bf-491c-8484-6eeb3756a392	f02eebb8-7500-41e4-b376-24dd70569e87	qris	\N	475000	transfer	completed	\N	\N	2026-06-07 06:00:00	2026-08-13 09:25:18.041	2026-08-13 09:25:18.041	\N	\N	\N
4e8b7869-62b8-4964-8e00-44ce5bce049c	a03f90c5-9ed9-409f-b06f-0dec4259138c	qris	\N	338400	transfer	completed	\N	\N	2026-06-22 04:59:00	2026-08-13 09:25:18.05	2026-08-13 09:25:18.05	\N	\N	\N
75d81a8b-272b-4bee-bebc-b3cb7800c1a7	4beb4f0c-4218-4fe1-88a8-74b5f7078dda	qris	\N	256500	card	completed	\N	\N	2026-07-22 05:40:00	2026-08-13 09:25:18.058	2026-08-13 09:25:18.058	\N	\N	\N
bda4f4fa-9f45-4023-b036-f7c0c298295c	a8e76674-9c0b-4c4c-b76e-6502ecc26694	qris	\N	465000	transfer	completed	\N	\N	2026-06-05 12:18:00	2026-08-13 09:25:18.068	2026-08-13 09:25:18.068	\N	\N	\N
bc3d1eb1-8e28-4665-b468-82de8b074e64	af081543-959e-4e7a-98a1-a06499f7803c	manual	\N	121500	cash	completed	\N	\N	2026-05-16 04:00:00	2026-08-13 09:25:18.077	2026-08-13 09:25:18.077	\N	\N	\N
f2431bb4-1619-4803-804c-24cb1c32fb5e	260add6b-4fe1-4200-b277-7a6734cd9e16	manual	\N	553000	cash	completed	\N	\N	2026-07-10 11:26:00	2026-08-13 09:25:18.084	2026-08-13 09:25:18.084	\N	\N	\N
509f1457-8478-48ac-aab1-862d41a8253d	1b7e4ed8-6df0-4c9a-91ae-6a19d728dd9d	qris	\N	431000	card	completed	\N	\N	2026-07-29 13:53:00	2026-08-13 09:25:18.096	2026-08-13 09:25:18.096	\N	\N	\N
e6d9c9ad-1506-4b96-8014-c520b4b2dd09	fa7e096e-1645-4ad2-a725-b2dff12a2fd2	qris	\N	474000	card	completed	\N	\N	2026-05-23 05:54:00	2026-08-13 09:25:18.109	2026-08-13 09:25:18.109	\N	\N	\N
0f9d2245-f370-469e-8b2b-2c674f2d8ba4	c65ef677-67f7-4214-9632-a6b3da6e17d3	qris	\N	261000	transfer	completed	\N	\N	2026-07-07 06:31:00	2026-08-13 09:25:18.118	2026-08-13 09:25:18.118	\N	\N	\N
f4619c7a-81b8-42c1-aef1-0763d2125c34	8c32c1b7-fff6-481a-b0cb-08f99dfc1815	qris	\N	584000	card	completed	\N	\N	2026-05-15 13:51:00	2026-08-13 09:25:18.135	2026-08-13 09:25:18.135	\N	\N	\N
925f4133-d496-4047-acb7-6bc15af18271	a5741c29-3c63-4dc5-ba35-e819d7850576	manual	\N	833000	cash	completed	\N	\N	2026-06-10 06:42:00	2026-08-13 09:25:18.145	2026-08-13 09:25:18.145	\N	\N	\N
5fe274bf-89e3-4d0d-9272-d2d73fcf9f77	fbd8710c-6894-4dec-a6b3-57f24463774c	qris	\N	443000	card	completed	\N	\N	2026-07-30 04:03:00	2026-08-13 09:25:18.154	2026-08-13 09:25:18.154	\N	\N	\N
345d8e4e-960e-4fa8-8424-fa6f6a46b485	34a2b6fb-9151-4274-8c3a-99c63c100506	qris	\N	689000	transfer	completed	\N	\N	2026-06-03 11:43:00	2026-08-13 09:25:18.163	2026-08-13 09:25:18.163	\N	\N	\N
964d2421-4734-4b4d-b769-f94da1b37de2	6697750e-2c29-4f07-9e93-9e8e2f80f8e6	manual	\N	897000	cash	completed	\N	\N	2026-07-17 12:42:00	2026-08-13 09:25:18.171	2026-08-13 09:25:18.171	\N	\N	\N
e199a19e-5a60-4b29-bc69-6878dc75f69a	f599b789-dc18-4560-9623-daa3741a8b11	manual	\N	269000	cash	completed	\N	\N	2026-07-02 11:50:00	2026-08-13 09:25:18.18	2026-08-13 09:25:18.18	\N	\N	\N
9f89d785-3da1-433b-8209-4df57bd19a73	dad26f03-0bcd-435d-acd1-dda69a879396	manual	\N	391000	cash	completed	\N	\N	2026-06-29 05:35:00	2026-08-13 09:25:18.188	2026-08-13 09:25:18.188	\N	\N	\N
312d318d-5818-4955-8695-dc16ff0cdd6e	c9c0f0b8-0b34-4d56-bd81-aaf9ac1069ae	manual	\N	743400	cash	completed	\N	\N	2026-08-11 06:07:00	2026-08-13 09:25:18.197	2026-08-13 09:25:18.197	\N	\N	\N
b8d62c02-cc4c-4c52-9304-1eb05648c31e	ab1cfcb1-2a4e-4664-af3a-c2e47dce7e40	qris	\N	650000	transfer	completed	\N	\N	2026-07-26 08:26:00	2026-08-13 09:25:18.206	2026-08-13 09:25:18.206	\N	\N	\N
6f370081-dfa0-439c-afcc-9c772c76f5c2	88de6227-564c-4492-a07c-3950adf3cbbb	qris	\N	303000	card	completed	\N	\N	2026-06-07 04:38:00	2026-08-13 09:25:18.215	2026-08-13 09:25:18.215	\N	\N	\N
fba0ada7-8847-487f-afb2-bae58035f0de	72a5bc33-5f68-4dbd-9641-fa276e31ae99	manual	\N	404000	cash	completed	\N	\N	2026-07-01 13:56:00	2026-08-13 09:25:18.238	2026-08-13 09:25:18.238	\N	\N	\N
5d82226f-c0bd-443c-8099-f4193a357030	3f870f79-7bc0-4cb2-8f6c-1c033f2a162f	qris	\N	821000	transfer	completed	\N	\N	2026-05-25 12:02:00	2026-08-13 09:25:18.247	2026-08-13 09:25:18.247	\N	\N	\N
6f738030-9da5-456c-881a-5afebb2bcc3f	4bdd0200-04f8-47f7-93e5-1353d859d41c	qris	\N	472000	transfer	completed	\N	\N	2026-07-11 11:22:00	2026-08-13 09:25:18.26	2026-08-13 09:25:18.26	\N	\N	\N
ae814fa6-d91e-46b0-a05c-9d46236ce416	22a13b93-4fa7-4112-a084-f2108580b6aa	manual	\N	388000	cash	completed	\N	\N	2026-06-09 06:18:00	2026-08-13 09:25:18.269	2026-08-13 09:25:18.269	\N	\N	\N
3bbd2437-41db-4a7d-9112-7291a984613a	d9d8df3c-c2f3-4a81-ac4f-33f626e15eab	manual	\N	548000	cash	completed	\N	\N	2026-06-27 04:05:00	2026-08-13 09:25:18.278	2026-08-13 09:25:18.278	\N	\N	\N
bd05915d-2b82-4ac8-a288-1dae1e43e074	93c44084-afbe-42c5-bfc5-7f08065d30ab	manual	\N	821000	cash	completed	\N	\N	2026-07-08 12:49:00	2026-08-13 09:25:18.286	2026-08-13 09:25:18.286	\N	\N	\N
50afda85-6186-4aea-862a-0f334c94522b	e73ef591-f508-434c-9dd0-0108feda6e01	manual	\N	873000	cash	completed	\N	\N	2026-07-19 06:24:00	2026-08-13 09:25:18.3	2026-08-13 09:25:18.3	\N	\N	\N
3fd28fb4-f7c6-46bf-8a56-e13e011480b3	c42447fe-ec1e-4b8c-ad03-36459e8e989c	qris	\N	576000	card	completed	\N	\N	2026-07-08 11:45:00	2026-08-13 09:25:18.308	2026-08-13 09:25:18.308	\N	\N	\N
77fa0e12-a581-423d-85e8-b7ffb2f5e19b	daf10539-4564-4707-9394-b27c81433071	manual	\N	775000	cash	completed	\N	\N	2026-06-13 05:02:00	2026-08-13 09:25:18.317	2026-08-13 09:25:18.317	\N	\N	\N
b7574579-2efc-4f20-bb0f-fc730dc48923	63f43c48-0722-458c-9767-219f6056e1e5	qris	\N	588000	card	completed	\N	\N	2026-07-07 05:12:00	2026-08-13 09:25:18.326	2026-08-13 09:25:18.326	\N	\N	\N
81d49c79-0b87-4a5f-9094-0a337206f14b	6214bb49-fa8d-494a-9335-c979db6c7846	qris	\N	702000	card	completed	\N	\N	2026-07-25 13:53:00	2026-08-13 09:25:18.335	2026-08-13 09:25:18.335	\N	\N	\N
e45d649e-aaf8-499f-b9da-cf02fcfa4238	8ab33dbb-82c7-4583-af7f-08053c287536	qris	\N	433800	card	completed	\N	\N	2026-06-10 04:07:00	2026-08-13 09:25:18.344	2026-08-13 09:25:18.344	\N	\N	\N
e6ac79fe-3528-46b6-8460-dee2bf4f5851	43f73b49-a103-4002-a359-ed2045204980	qris	\N	753000	card	completed	\N	\N	2026-07-28 04:32:00	2026-08-13 09:25:18.353	2026-08-13 09:25:18.353	\N	\N	\N
7778b011-a1ef-4ec6-a6c3-e0166ad58165	bb888987-331e-4e41-8f80-5a511d3e1084	qris	\N	545000	card	completed	\N	\N	2026-06-13 13:40:00	2026-08-13 09:25:18.363	2026-08-13 09:25:18.363	\N	\N	\N
f6d6d5ee-dcbc-40b1-a303-4a024f573977	1e5589d8-717b-4901-b961-06ed94b5a042	qris	\N	414000	card	completed	\N	\N	2026-07-30 13:02:00	2026-08-13 09:25:18.373	2026-08-13 09:25:18.373	\N	\N	\N
4813fb74-c249-4634-945d-b9379c2357e9	36a105f0-a096-4eb7-89b1-331ab72fb9ce	qris	\N	560000	transfer	completed	\N	\N	2026-06-16 04:28:00	2026-08-13 09:25:18.383	2026-08-13 09:25:18.383	\N	\N	\N
85fe4d3f-b4b8-49b8-bdd4-a489b6938486	7bd483f0-56e8-47db-a638-8f62ba831d4a	qris	\N	976000	card	completed	\N	\N	2026-06-09 06:21:00	2026-08-13 09:25:18.393	2026-08-13 09:25:18.393	\N	\N	\N
74afbcc5-5be5-408b-a0e2-3ae9aa3f1c91	d2c60024-a56e-46a7-a334-691e484ac256	manual	\N	350100	cash	completed	\N	\N	2026-05-22 05:11:00	2026-08-13 09:25:18.403	2026-08-13 09:25:18.403	\N	\N	\N
41faf3fc-6bdc-4918-871d-12f0e0a1efe7	a5b4a3d7-8fd9-41b0-9afa-1f05c5c8ff45	qris	\N	688000	card	completed	\N	\N	2026-08-09 06:38:00	2026-08-13 09:25:18.414	2026-08-13 09:25:18.414	\N	\N	\N
078fb65f-132d-4f9c-8f42-084d5ccd66e2	d6d4873a-528d-4806-944a-59aa910b0117	manual	\N	828000	cash	completed	\N	\N	2026-05-18 06:12:00	2026-08-13 09:25:18.429	2026-08-13 09:25:18.429	\N	\N	\N
e16ee9f8-52c9-4db0-8f10-7752201e098d	cb3ee024-2498-43be-b9e1-4fcbd349c75c	qris	\N	339000	card	completed	\N	\N	2026-08-09 04:18:00	2026-08-13 09:25:18.438	2026-08-13 09:25:18.438	\N	\N	\N
82f9489f-c33f-4d12-8992-fb6824313c41	697416fa-e0fd-4b25-9503-b8e99c52f3b5	qris	\N	499000	transfer	completed	\N	\N	2026-05-19 04:44:00	2026-08-13 09:25:18.448	2026-08-13 09:25:18.448	\N	\N	\N
e1477e9e-685f-4327-8693-0295feac193d	877dcaa6-6e0d-4520-ae74-c1145f230329	manual	\N	746000	cash	completed	\N	\N	2026-06-26 05:40:00	2026-08-13 09:25:18.467	2026-08-13 09:25:18.467	\N	\N	\N
29e6f4df-9f9c-4297-bfdb-06ff682a2336	ee8799b5-13bc-4c8b-8aa4-7c8c1baf32a3	manual	\N	573000	cash	completed	\N	\N	2026-06-27 11:47:00	2026-08-13 09:25:18.476	2026-08-13 09:25:18.476	\N	\N	\N
778b7ba2-ca2c-4479-a804-3b1b85704cdc	d58a4ac9-5041-4ff7-9d10-02ec1b7f87e0	qris	\N	184000	card	completed	\N	\N	2026-06-22 11:16:00	2026-08-13 09:25:18.489	2026-08-13 09:25:18.489	\N	\N	\N
c220c8c0-97f7-4e24-8ea8-1562f4da601d	bf1eb956-59f8-48d1-a936-11e75bb3c2a9	manual	\N	537000	cash	completed	\N	\N	2026-06-20 11:51:00	2026-08-13 09:25:18.498	2026-08-13 09:25:18.498	\N	\N	\N
01b09b3a-218d-4e5e-a67f-ac79efe298e3	ac516846-7920-4361-ae39-4680a3597a36	manual	\N	472500	cash	completed	\N	\N	2026-08-08 11:46:00	2026-08-13 09:25:18.506	2026-08-13 09:25:18.506	\N	\N	\N
d386e54d-ba4b-4665-b96d-3bf62f95621c	9c303af7-25c2-42c0-bd3e-fd5c79dc2aa8	manual	\N	734000	cash	completed	\N	\N	2026-08-07 11:18:00	2026-08-13 09:25:18.515	2026-08-13 09:25:18.515	\N	\N	\N
0975df81-68be-4ba1-bf1b-2cf0a8b557ea	f5805508-7922-44a7-8bd1-8f23a73c3751	manual	\N	646000	cash	completed	\N	\N	2026-07-10 11:17:00	2026-08-13 09:25:18.523	2026-08-13 09:25:18.523	\N	\N	\N
7d893418-d12e-4c20-9c0f-cce0edff4333	94879bc1-d740-46a3-9d27-40bbebd7d880	qris	\N	412000	card	completed	\N	\N	2026-08-06 05:47:00	2026-08-13 09:25:18.538	2026-08-13 09:25:18.538	\N	\N	\N
1f8cecc4-090a-4bb9-b07d-e8d64c999472	3e530aaf-44a8-4dd0-bee7-a8cebc00fa35	qris	\N	1028000	transfer	completed	\N	\N	2026-07-16 04:07:00	2026-08-13 09:25:18.552	2026-08-13 09:25:18.552	\N	\N	\N
791b390a-aeae-41f6-8c06-67cdebce7fa8	bb5ab3e7-b425-49c1-867e-f2fdacf824b9	qris	\N	311400	card	completed	\N	\N	2026-05-19 05:24:00	2026-08-13 09:25:18.562	2026-08-13 09:25:18.562	\N	\N	\N
94bb0f25-488c-425f-a051-9e26651445bd	f7232f70-ea4b-4b12-8496-c7868bacb6c7	qris	\N	426000	transfer	completed	\N	\N	2026-06-22 13:01:00	2026-08-13 09:25:18.571	2026-08-13 09:25:18.571	\N	\N	\N
0965194a-31d9-455b-be54-ee0c3f113c49	ecc3579c-1cf5-4638-8f39-0ce39be1e633	qris	\N	362000	transfer	completed	\N	\N	2026-07-10 05:21:00	2026-08-13 09:25:18.58	2026-08-13 09:25:18.58	\N	\N	\N
8a84b7c3-f61a-41a3-ae76-676b39101aa9	c118a3bb-9d65-471d-a1a1-ec58e967677a	qris	\N	153000	card	completed	\N	\N	2026-07-25 02:50:00	2026-08-13 09:25:18.593	2026-08-13 09:25:18.593	\N	\N	\N
f2f8abf0-4ad8-451d-8ef9-281b45f1aced	02035282-3d04-4658-a561-a8712c7aeca5	manual	\N	469000	cash	completed	\N	\N	2026-05-22 11:57:00	2026-08-13 09:25:18.601	2026-08-13 09:25:18.601	\N	\N	\N
e45e7186-1a12-4d96-82cd-17822010448f	d012e4e8-dd9c-45da-9244-7e119974e760	qris	\N	221000	card	completed	\N	\N	2026-05-20 11:18:00	2026-08-13 09:25:18.609	2026-08-13 09:25:18.609	\N	\N	\N
9f077158-7bd4-4e2b-a513-abdccbbc416f	9036c0a0-71e2-468d-b586-823a2480b020	qris	\N	398000	transfer	completed	\N	\N	2026-06-20 13:07:00	2026-08-13 09:25:18.618	2026-08-13 09:25:18.618	\N	\N	\N
4302c1d8-5ac1-44bf-97a0-886864f5a40e	7a0e03ab-5b11-4eaf-abf2-ce82fc4c50c0	manual	\N	440000	cash	completed	\N	\N	2026-07-09 12:21:00	2026-08-13 09:25:18.635	2026-08-13 09:25:18.635	\N	\N	\N
1a279086-6346-48db-95bb-7fe6bae3f28d	0a6331d7-1dfd-4d06-8cdc-72e41bddfcef	manual	\N	761400	cash	completed	\N	\N	2026-07-27 05:31:00	2026-08-13 09:25:18.645	2026-08-13 09:25:18.645	\N	\N	\N
9e89563c-73e6-4817-b892-577344e3426f	e06e44ee-31c2-40c2-ba9d-e805c80a9d71	qris	\N	783000	transfer	completed	\N	\N	2026-07-29 05:11:00	2026-08-13 09:25:18.653	2026-08-13 09:25:18.653	\N	\N	\N
bf21f525-af22-441b-8348-251f5921f795	db789f1d-332e-4573-b00f-ca49f7015c98	qris	\N	658000	transfer	completed	\N	\N	2026-07-17 13:26:00	2026-08-13 09:25:18.662	2026-08-13 09:25:18.662	\N	\N	\N
9269b283-3041-4bd4-b7a2-a69b0009bbc6	a0d9cfe8-49b8-43dc-b2c1-bec359a49bc5	qris	\N	709000	transfer	completed	\N	\N	2026-06-08 05:39:00	2026-08-13 09:25:18.68	2026-08-13 09:25:18.68	\N	\N	\N
6ac9a15d-97ab-464b-94a1-f99febdfd12c	84ddce28-cfb5-40e0-925b-82c00ae1d845	qris	\N	494000	card	completed	\N	\N	2026-05-30 12:01:00	2026-08-13 09:25:18.688	2026-08-13 09:25:18.688	\N	\N	\N
d93342fa-9629-4183-a57f-35bb7a8cf6e0	4df175f2-546e-4863-92d8-72d0e7535e6a	qris	\N	241200	transfer	completed	\N	\N	2026-06-10 12:02:00	2026-08-13 09:25:18.704	2026-08-13 09:25:18.704	\N	\N	\N
e8359bca-569c-443d-b334-78f63ca59673	6353d038-ff05-4cbe-8cc0-775e745fd65f	qris	\N	883000	card	completed	\N	\N	2026-06-17 06:41:00	2026-08-13 09:25:18.717	2026-08-13 09:25:18.717	\N	\N	\N
770517b2-01a6-4dbc-b3cd-08e8fe1fce88	423ffa5d-5a9f-46dc-aa0e-89a003ed3cda	manual	\N	700000	cash	completed	\N	\N	2026-08-08 05:05:00	2026-08-13 09:25:18.727	2026-08-13 09:25:18.727	\N	\N	\N
0bb6bcad-f0db-4c3a-a83a-c74777103b81	38d5491f-adba-4769-a023-a7c6584cd1e1	qris	\N	546000	card	completed	\N	\N	2026-06-05 05:39:00	2026-08-13 09:25:18.736	2026-08-13 09:25:18.736	\N	\N	\N
d533b181-592b-4c21-a4bc-2039ca4cccd9	801433b6-894d-42e1-a8fa-f041ca811eff	manual	\N	466000	cash	completed	\N	\N	2026-08-04 05:44:00	2026-08-13 09:25:18.745	2026-08-13 09:25:18.745	\N	\N	\N
0ec05f00-e1fb-4988-bbf4-83bb435109f8	7370755a-72a7-408a-86c0-8846a0333023	qris	\N	387000	transfer	completed	\N	\N	2026-05-17 04:15:00	2026-08-13 09:25:18.754	2026-08-13 09:25:18.754	\N	\N	\N
aeb81e29-7a4b-4552-ad45-047a0f3bb7aa	3fe830f0-d0d4-4bf0-95a4-449ddac8dfa8	qris	\N	301000	card	completed	\N	\N	2026-07-05 12:02:00	2026-08-13 09:25:18.767	2026-08-13 09:25:18.767	\N	\N	\N
8d276fd0-eb6c-487b-9c12-518282b1d5b8	2e81a64f-a505-4ef8-98fa-71332fb05171	qris	\N	753300	transfer	completed	\N	\N	2026-08-01 11:21:00	2026-08-13 09:25:18.78	2026-08-13 09:25:18.78	\N	\N	\N
f12f73b3-c360-4ab2-92b2-6d10e26b09ad	db5eff69-3421-4b27-acfc-3bf45be9d963	qris	\N	876000	card	completed	\N	\N	2026-05-18 05:23:00	2026-08-13 09:25:18.791	2026-08-13 09:25:18.791	\N	\N	\N
f3bd999d-5ca9-4123-a1b5-ca589f079db7	7fae7d63-d0a1-4fb7-a310-f5a1619bbd6b	qris	\N	839000	card	completed	\N	\N	2026-06-22 11:07:00	2026-08-13 09:25:18.8	2026-08-13 09:25:18.8	\N	\N	\N
4005d97f-1178-4fb1-9f3c-cc721c3c081a	38b5ef26-8a6d-4a4a-9b70-e5738c784f52	qris	\N	758000	card	completed	\N	\N	2026-07-03 12:35:00	2026-08-13 09:25:18.809	2026-08-13 09:25:18.809	\N	\N	\N
400424f8-fa58-417d-8f22-ed17e329f56b	1c36a05b-a64b-4f37-9b3d-d026f925c623	manual	\N	837000	cash	completed	\N	\N	2026-07-31 04:26:00	2026-08-13 09:25:18.818	2026-08-13 09:25:18.818	\N	\N	\N
49491759-cb7a-40f0-bd45-9d07cc835ea7	33492934-b09c-41b9-a06d-00c5a16e5bb3	manual	\N	795000	cash	completed	\N	\N	2026-07-03 06:48:00	2026-08-13 09:25:18.827	2026-08-13 09:25:18.827	\N	\N	\N
5032d825-244f-475a-9c58-be07a1e04ce4	af7264a4-308e-4470-ad2a-10d88661f216	manual	\N	486000	cash	completed	\N	\N	2026-05-23 05:11:00	2026-08-13 09:25:18.838	2026-08-13 09:25:18.838	\N	\N	\N
daf73428-35ec-4ff7-a7ce-5cb52d46560b	cc351b14-d115-411d-8e41-7cfd8627df85	qris	\N	585000	transfer	completed	\N	\N	2026-07-04 13:30:00	2026-08-13 09:25:18.846	2026-08-13 09:25:18.846	\N	\N	\N
5ca92872-46ef-4274-89c5-c105b063e974	ad325732-13eb-4a65-b620-ba185448b988	qris	\N	286000	transfer	completed	\N	\N	2026-06-21 05:44:00	2026-08-13 09:25:18.855	2026-08-13 09:25:18.855	\N	\N	\N
37290480-5460-48a5-87d4-4d25c69f0003	6285d3ea-7006-4c7b-ac9b-35e187157d60	qris	\N	303000	transfer	completed	\N	\N	2026-07-23 02:14:00	2026-08-13 09:25:18.864	2026-08-13 09:25:18.864	\N	\N	\N
b57a5d87-a78c-47dd-9adf-815b68a5c80d	b1530886-110b-41cb-95d3-59b999a0bdb7	manual	\N	1153000	cash	completed	\N	\N	2026-06-08 12:29:00	2026-08-13 09:25:18.873	2026-08-13 09:25:18.873	\N	\N	\N
63d01c7e-09c4-41f1-b3f9-737c939198a1	4238d662-36a2-4e6d-8ace-a06f41092aec	qris	\N	234000	transfer	completed	\N	\N	2026-06-29 11:03:00	2026-08-13 09:25:18.886	2026-08-13 09:25:18.886	\N	\N	\N
189048bb-6c6b-4805-adb5-144d75618f14	8b4b0311-fcdf-443d-acd8-15fbcb63b950	qris	\N	481000	card	completed	\N	\N	2026-06-15 13:47:00	2026-08-13 09:25:18.894	2026-08-13 09:25:18.894	\N	\N	\N
6c6b2a41-298a-4d72-8b9e-d6b7e269d0b0	a3a711b1-4e31-4046-8b51-3f4801b5693d	manual	\N	404000	cash	completed	\N	\N	2026-08-12 02:25:00	2026-08-13 09:25:18.908	2026-08-13 09:25:18.908	\N	\N	\N
378fb668-573c-4a53-bc96-9fca8b2ec54b	60f39543-422e-4685-a8cd-4cdf9a30c231	qris	\N	707000	card	completed	\N	\N	2026-06-05 13:09:00	2026-08-13 09:25:18.933	2026-08-13 09:25:18.933	\N	\N	\N
5ee74c4c-6d63-495a-b81d-ffaedd28e798	2e66a039-4e0c-44a1-b719-02243f25eaa5	manual	\N	731000	cash	completed	\N	\N	2026-07-26 02:55:00	2026-08-13 09:25:18.942	2026-08-13 09:25:18.942	\N	\N	\N
5cdf8a8a-b474-43ef-b924-29cbd0d6aa7f	f56794c1-9980-4c71-a20c-b64a2c1cd32e	qris	\N	533000	card	completed	\N	\N	2026-06-16 06:20:00	2026-08-13 09:25:18.955	2026-08-13 09:25:18.955	\N	\N	\N
a0ade761-28c8-41f8-b5f3-bd99631c2bf8	3ebcbfd6-76d0-4f69-a93f-aa5f9f89b2f0	qris	\N	490000	transfer	completed	\N	\N	2026-07-11 05:25:00	2026-08-13 09:25:18.963	2026-08-13 09:25:18.963	\N	\N	\N
573b994d-13a6-471d-8b4d-d43564e1afc3	ff427e93-1b80-4de8-9694-5a5023a36901	qris	\N	262000	card	completed	\N	\N	2026-06-05 04:17:00	2026-08-13 09:25:18.971	2026-08-13 09:25:18.971	\N	\N	\N
86b0080a-e065-4430-8454-c4c16fca17e9	4352a519-dcbf-443f-87c5-256105618b15	qris	\N	243000	transfer	completed	\N	\N	2026-07-15 04:02:00	2026-08-13 09:25:18.979	2026-08-13 09:25:18.979	\N	\N	\N
8f444f06-c7ab-4d9e-8d4f-f1e7eb229152	dc10dffb-60d5-4b0c-aabf-0a44f3130fc3	qris	\N	477000	card	completed	\N	\N	2026-08-10 06:04:00	2026-08-13 09:25:18.993	2026-08-13 09:25:18.993	\N	\N	\N
24ad35ea-35b6-4ab3-b60c-d3e656434cc4	8b966b47-66fb-4525-b4be-b3c17e415225	manual	\N	944000	cash	completed	\N	\N	2026-05-22 13:20:00	2026-08-13 09:25:19.008	2026-08-13 09:25:19.008	\N	\N	\N
b63669a2-d9fd-44af-a94e-857173743fbb	5a81cf8c-308b-4462-9a3e-9769501d39d9	qris	\N	807000	card	completed	\N	\N	2026-05-26 02:02:00	2026-08-13 09:25:19.017	2026-08-13 09:25:19.017	\N	\N	\N
9bdd8bbb-095c-4551-be64-11d1693338d5	8b685b57-767b-4d22-a273-f148ffce718a	qris	\N	457000	card	completed	\N	\N	2026-07-31 12:06:00	2026-08-13 09:25:19.027	2026-08-13 09:25:19.027	\N	\N	\N
1e0b3261-f114-46a6-8163-00ca2667297d	41581666-4386-4ee1-83bb-bf7a0fef3991	manual	\N	1117000	cash	completed	\N	\N	2026-05-27 05:47:00	2026-08-13 09:25:19.046	2026-08-13 09:25:19.046	\N	\N	\N
bf11d74b-60c6-45fb-a40e-1bf4c85e4f77	2b96a09f-dfc3-49ad-983e-705cdf799758	qris	\N	771000	card	completed	\N	\N	2026-06-18 08:42:00	2026-08-13 09:25:19.06	2026-08-13 09:25:19.06	\N	\N	\N
8fe34b2c-ab02-4a80-947c-a7014d467ebd	2aa05888-bcf5-4c04-b29f-7c8831159ed3	manual	\N	559800	cash	completed	\N	\N	2026-06-14 06:48:00	2026-08-13 09:25:19.075	2026-08-13 09:25:19.075	\N	\N	\N
95bfdd70-c1ef-4b50-8069-94f8309ab60d	ccb8d52d-12c3-4b32-84f2-dc60758c8ce2	qris	\N	838000	transfer	completed	\N	\N	2026-08-11 12:10:00	2026-08-13 09:25:19.085	2026-08-13 09:25:19.085	\N	\N	\N
2ecee2bc-483a-412e-ac91-c1a21a08ec89	7b14ecbb-2643-4c44-bdf7-c4167fcdd7b8	qris	\N	638000	card	completed	\N	\N	2026-06-14 06:26:00	2026-08-13 09:25:19.095	2026-08-13 09:25:19.095	\N	\N	\N
8a4c77a0-47e0-4689-81cc-355cc4e54436	bd4ca980-4611-4f53-b0f9-aabcd212325b	manual	\N	369000	cash	completed	\N	\N	2026-06-11 06:52:00	2026-08-13 09:25:19.103	2026-08-13 09:25:19.103	\N	\N	\N
31b358c8-31f1-40de-b552-49e1f8d955df	2bb7505d-0c90-4010-a5e6-be8b757a3a59	qris	\N	397000	transfer	completed	\N	\N	2026-06-19 07:13:00	2026-08-13 09:25:19.121	2026-08-13 09:25:19.121	\N	\N	\N
402ad326-56ad-4378-a99f-6850ce5be336	74032e6f-baa2-4304-bf00-f3154e1e7afe	qris	\N	631800	card	completed	\N	\N	2026-06-05 05:05:00	2026-08-13 09:25:19.13	2026-08-13 09:25:19.13	\N	\N	\N
d354fc57-cc8d-42b8-92f9-af95c059cd80	d6201aca-0421-4e30-9634-71c653031583	manual	\N	738000	cash	completed	\N	\N	2026-07-04 13:21:00	2026-08-13 09:25:19.139	2026-08-13 09:25:19.139	\N	\N	\N
8e750408-9bf8-4812-8b4a-dc18a39fce63	f5203a1b-51d9-4eb7-aeee-b2b39178e936	qris	\N	176400	transfer	completed	\N	\N	2026-07-22 05:04:00	2026-08-13 09:25:19.149	2026-08-13 09:25:19.149	\N	\N	\N
2426d985-1a38-4f04-b58e-30e80896f063	37fb1982-4222-4df4-937c-6fab7141c2ca	manual	\N	469000	cash	completed	\N	\N	2026-07-29 04:25:00	2026-08-13 09:25:19.158	2026-08-13 09:25:19.158	\N	\N	\N
b7f21b56-3abe-4fcf-bed1-b574c38f9c8d	592f9cd8-fa71-48a8-b45d-0dc5e479b940	qris	\N	388000	card	completed	\N	\N	2026-07-23 12:48:00	2026-08-13 09:25:19.166	2026-08-13 09:25:19.166	\N	\N	\N
be82f7e1-7110-47f4-ba81-719e4489fabb	f2541be6-54a3-477e-bcd2-dd6212b931fb	manual	\N	782100	cash	completed	\N	\N	2026-07-12 04:00:00	2026-08-13 09:25:19.176	2026-08-13 09:25:19.176	\N	\N	\N
a0fe8bdf-3fb1-4382-9a54-4c9d5e6cee02	db0db4d1-dbbb-497a-a4b7-47ca2493b29c	qris	\N	173000	card	completed	\N	\N	2026-06-12 13:57:00	2026-08-13 09:25:19.185	2026-08-13 09:25:19.185	\N	\N	\N
dd17949f-7e1d-44b7-94d3-440a58f6353f	b2888206-5391-48a9-b268-1d4938f9586a	qris	\N	477000	card	completed	\N	\N	2026-07-01 06:17:00	2026-08-13 09:25:19.194	2026-08-13 09:25:19.194	\N	\N	\N
8c0269c8-363e-4b83-bf72-acca36a2ba33	f9522738-ad22-4f2c-838c-bffcfc797f81	qris	\N	516600	card	completed	\N	\N	2026-08-12 11:29:00	2026-08-13 09:25:19.202	2026-08-13 09:25:19.202	\N	\N	\N
68650d30-cd96-4849-bd2f-07199ee9c756	9df77ff6-1631-4680-9c6a-33b312e5a516	qris	\N	468000	transfer	completed	\N	\N	2026-08-04 13:06:00	2026-08-13 09:25:19.21	2026-08-13 09:25:19.21	\N	\N	\N
834856aa-2421-4f36-a710-b6888959e02c	e47d4258-05ad-455f-ad91-b7ba5af9db3d	manual	\N	346000	cash	completed	\N	\N	2026-08-06 05:48:00	2026-08-13 09:25:19.219	2026-08-13 09:25:19.219	\N	\N	\N
77ab7362-20bd-4489-9d25-909be49ccbb3	17c6f325-b47e-4732-b4ed-aacb6c85a228	qris	\N	255000	card	completed	\N	\N	2026-07-12 11:11:00	2026-08-13 09:25:19.228	2026-08-13 09:25:19.228	\N	\N	\N
856cfa1e-ca66-463f-83bb-445b38c4099c	b60de131-ff5b-4d59-bbb1-e3764953e16a	manual	\N	653000	cash	completed	\N	\N	2026-06-18 13:48:00	2026-08-13 09:25:19.241	2026-08-13 09:25:19.241	\N	\N	\N
0ae518b1-b697-4ec8-9c40-e0262f5a2897	e9e9c143-593f-4b2a-894b-0556384f5a73	manual	\N	505800	cash	completed	\N	\N	2026-05-23 06:57:00	2026-08-13 09:25:19.25	2026-08-13 09:25:19.25	\N	\N	\N
5abded22-d95e-478e-a6b6-9643a207cc8a	68902824-11fe-4bbe-86ff-87f46b0a3b61	manual	\N	496800	cash	completed	\N	\N	2026-07-04 02:22:00	2026-08-13 09:25:19.26	2026-08-13 09:25:19.26	\N	\N	\N
41926ce6-dd13-4ee9-962c-d05c5c217e21	cd30dd1b-56e0-47fc-bba6-0693f477cf0a	manual	\N	939000	cash	completed	\N	\N	2026-07-18 05:19:00	2026-08-13 09:25:19.271	2026-08-13 09:25:19.271	\N	\N	\N
535c36ba-8480-4ba2-8ffb-829fd6a920be	73088109-3f2b-42f6-ae0a-54db69adae29	qris	\N	311000	transfer	completed	\N	\N	2026-06-03 12:40:00	2026-08-13 09:25:19.28	2026-08-13 09:25:19.28	\N	\N	\N
c534222b-29d3-4db0-89b3-2c9d03dfaabf	0541b15b-18ee-4f77-8c0e-a464ecf829fc	manual	\N	642000	cash	completed	\N	\N	2026-07-23 12:03:00	2026-08-13 09:25:19.298	2026-08-13 09:25:19.298	\N	\N	\N
fc9df875-69bf-46ca-bd59-5a1d2390ac82	9c5eba36-38df-4b8b-9bc5-3b11e1d865d4	qris	\N	532000	card	completed	\N	\N	2026-06-17 13:16:00	2026-08-13 09:25:19.307	2026-08-13 09:25:19.307	\N	\N	\N
457ec573-6777-4418-aaa3-43408cf807df	396bcb7b-a516-4301-a106-107d164245d0	qris	\N	610000	card	completed	\N	\N	2026-05-15 12:44:00	2026-08-13 09:25:19.316	2026-08-13 09:25:19.316	\N	\N	\N
d3e922ff-f771-4a3d-b768-0be9412093e4	24dec61c-a681-4b5c-8019-f1e56be90a50	manual	\N	325800	cash	completed	\N	\N	2026-06-08 05:33:00	2026-08-13 09:25:19.324	2026-08-13 09:25:19.324	\N	\N	\N
a9d755f7-7f21-4c39-a497-18d6b82fd09d	663ff5cd-66c4-4bb8-aeb0-53dff5a7436f	qris	\N	563000	transfer	completed	\N	\N	2026-05-25 04:07:00	2026-08-13 09:25:19.342	2026-08-13 09:25:19.342	\N	\N	\N
2572bebd-62da-46c3-9d43-1c673268f210	3b5e4fad-3079-40da-8173-0b4065fecbf5	qris	\N	408000	card	completed	\N	\N	2026-05-21 12:07:00	2026-08-13 09:25:19.351	2026-08-13 09:25:19.351	\N	\N	\N
8856dcdf-0752-49cf-b542-f8a45f6f8427	b375c368-cbae-4d53-9f9e-a3a797e6fa4a	qris	\N	338000	card	completed	\N	\N	2026-07-29 06:56:00	2026-08-13 09:25:19.36	2026-08-13 09:25:19.36	\N	\N	\N
59bd25d3-3ecc-4b7a-98bd-362da1c74d82	d0962c34-8b32-463c-b56c-86e72bcc6061	qris	\N	649000	card	completed	\N	\N	2026-06-17 06:14:00	2026-08-13 09:25:19.369	2026-08-13 09:25:19.369	\N	\N	\N
f8753dfa-e64c-4fde-adb8-2fb516bd9f21	ab042b1f-3612-4d79-9985-75a5c3aef8f1	manual	\N	805000	cash	completed	\N	\N	2026-07-23 04:17:00	2026-08-13 09:25:19.383	2026-08-13 09:25:19.383	\N	\N	\N
ef75ef90-8c9e-49cd-a113-a019b958891e	37a8a7ce-810f-45be-8be6-1cae0312a32d	qris	\N	349000	card	completed	\N	\N	2026-06-30 03:07:00	2026-08-13 09:25:19.396	2026-08-13 09:25:19.396	\N	\N	\N
6dd8a631-e509-4de0-a045-68e01c1d62b2	a6fcce19-1fa7-4b14-93a8-dcc336a2c7d8	manual	\N	715000	cash	completed	\N	\N	2026-06-09 06:57:00	2026-08-13 09:25:19.406	2026-08-13 09:25:19.406	\N	\N	\N
635609f0-e01c-4640-9cff-18db13457749	87a21a43-a202-4795-9066-bb6d03e2a9bc	qris	\N	486000	transfer	completed	\N	\N	2026-05-31 11:02:00	2026-08-13 09:25:19.42	2026-08-13 09:25:19.42	\N	\N	\N
84678649-72ac-4886-9f9c-07e3a66ea022	a1a3e923-3a20-44ec-87b9-09609829e517	manual	\N	835000	cash	completed	\N	\N	2026-07-24 12:03:00	2026-08-13 09:25:19.429	2026-08-13 09:25:19.429	\N	\N	\N
66b2e392-dbaa-4ac4-8720-bea59a16e636	ba7b8b52-41a3-4ec1-9c8a-feb525009a5e	qris	\N	850000	transfer	completed	\N	\N	2026-05-28 13:47:00	2026-08-13 09:25:19.446	2026-08-13 09:25:19.446	\N	\N	\N
050b6a8c-2f85-4daa-9487-9739a4dfa177	7d679829-9202-4192-acb2-997c7261ed1d	qris	\N	544000	card	completed	\N	\N	2026-07-17 04:59:00	2026-08-13 09:25:19.464	2026-08-13 09:25:19.464	\N	\N	\N
8975c130-64ee-4757-af8b-8147502f43ec	7bd3791c-a45a-4ff8-be48-1d5bfba49919	qris	\N	678000	card	completed	\N	\N	2026-06-13 06:36:00	2026-08-13 09:25:19.474	2026-08-13 09:25:19.474	\N	\N	\N
8a3e8ec2-6f4a-444f-b857-8d4e0ef9d14a	7d4bf4f3-8b38-48b5-9c9f-ca4ae844f130	qris	\N	988000	transfer	completed	\N	\N	2026-05-23 02:46:00	2026-08-13 09:25:19.49	2026-08-13 09:25:19.49	\N	\N	\N
176142f7-6556-419a-9b9f-20f003e697c1	06b9e756-6edb-4afe-89ca-d5b0d075288a	manual	\N	340000	cash	completed	\N	\N	2026-08-12 11:51:00	2026-08-13 09:25:19.504	2026-08-13 09:25:19.504	\N	\N	\N
d4ba6040-f30f-4ad0-9610-a7d27e2a690e	f9ed209f-b4eb-44d6-818c-23085200e246	manual	\N	425000	cash	completed	\N	\N	2026-07-25 13:39:00	2026-08-13 09:25:19.512	2026-08-13 09:25:19.512	\N	\N	\N
0a44576d-cf36-4b78-8781-0b5ff83c18ec	30bcb239-a8b7-4ac3-85d7-387959b9b07d	qris	\N	295200	card	completed	\N	\N	2026-05-25 03:12:00	2026-08-13 09:25:19.521	2026-08-13 09:25:19.521	\N	\N	\N
2bd46e33-8d51-40b8-9b8e-d45144c2a1c0	34ed2f69-45dd-481f-a9f7-5a485a9fe084	qris	\N	389000	transfer	completed	\N	\N	2026-08-09 12:45:00	2026-08-13 09:25:19.53	2026-08-13 09:25:19.53	\N	\N	\N
d9747894-ef56-431a-b015-f1255de2aed7	53ad0420-2acd-4bc2-a86f-0f26a6eb3980	qris	\N	688000	card	completed	\N	\N	2026-07-15 11:06:00	2026-08-13 09:25:19.539	2026-08-13 09:25:19.539	\N	\N	\N
45ff6774-d46a-4603-8d1d-f670d6f33ed6	71bae7b1-8b8a-4dec-b0cc-4901d3f1b2ac	qris	\N	627000	card	completed	\N	\N	2026-07-28 05:16:00	2026-08-13 09:25:19.564	2026-08-13 09:25:19.564	\N	\N	\N
5a644183-8b42-49a3-9649-92304399f509	601746ec-2aa4-4b6b-b6bb-8e57d391703e	qris	\N	241000	transfer	completed	\N	\N	2026-07-08 13:51:00	2026-08-13 09:25:19.572	2026-08-13 09:25:19.572	\N	\N	\N
8769369e-4bfb-4773-a419-11cdafcc846e	2ed11fb6-a4ee-4013-8f24-0077470e51dd	manual	\N	592000	cash	completed	\N	\N	2026-07-27 05:36:00	2026-08-13 09:25:19.591	2026-08-13 09:25:19.591	\N	\N	\N
4cd5b6e8-f58d-45e4-8121-d6a6177df772	918b4292-7ff9-4f4c-9090-2c1db8650587	qris	\N	976000	transfer	completed	\N	\N	2026-05-19 08:31:00	2026-08-13 09:25:19.6	2026-08-13 09:25:19.6	\N	\N	\N
72ecc3e9-b616-4418-9fce-5889e483aeb9	04b2b6da-d1ea-4452-a585-d6653f87e742	manual	\N	1397000	cash	completed	\N	\N	2026-08-01 06:07:00	2026-08-13 09:25:19.608	2026-08-13 09:25:19.608	\N	\N	\N
56230b6d-c3f0-45a8-9d76-596fd1d1725c	f4f2f780-c53d-4314-b9c3-20208cbf7dec	qris	\N	693000	card	completed	\N	\N	2026-07-10 03:31:00	2026-08-13 09:25:19.619	2026-08-13 09:25:19.619	\N	\N	\N
e75c1efe-9e16-40b4-b295-1e4292c701dd	1675f780-769a-4c28-88c2-2c1555eb8611	qris	\N	619000	card	completed	\N	\N	2026-06-05 08:48:00	2026-08-13 09:25:19.629	2026-08-13 09:25:19.629	\N	\N	\N
d76da80a-fdae-41fe-a61d-dbd1a3ec4bd1	c0eab934-22b6-44a3-b940-ca7ccb2e2482	qris	\N	291000	card	completed	\N	\N	2026-06-21 06:27:00	2026-08-13 09:25:19.637	2026-08-13 09:25:19.637	\N	\N	\N
2c7f716e-a343-4634-80db-92f31a2d83d9	2d23eb00-edca-4c4f-83bb-21ecf1862950	qris	\N	597000	card	completed	\N	\N	2026-05-21 12:44:00	2026-08-13 09:25:19.647	2026-08-13 09:25:19.647	\N	\N	\N
1aaaebd4-bb1f-414d-81db-81cc253365a2	bf69551e-327f-49cf-abcd-73bd600e858b	manual	\N	560000	cash	completed	\N	\N	2026-06-20 03:53:00	2026-08-13 09:25:19.656	2026-08-13 09:25:19.656	\N	\N	\N
7aa84659-0ad7-48e8-846f-8c6f0465a9d7	2f17cebb-4b0a-4800-8d68-d447b644064c	qris	\N	761000	card	completed	\N	\N	2026-06-11 13:50:00	2026-08-13 09:25:19.664	2026-08-13 09:25:19.664	\N	\N	\N
90494935-9986-4bd6-8a8d-bd1c2f942c1c	6ee0f398-4c8e-49de-8dcd-b19d7bd2d8ea	manual	\N	532000	cash	completed	\N	\N	2026-05-30 05:17:00	2026-08-13 09:25:19.683	2026-08-13 09:25:19.683	\N	\N	\N
20201ad2-3116-4e77-b703-cbe592ea0f70	bf6cead8-0bd6-4fc9-8801-e292a8d4b735	qris	\N	558000	transfer	completed	\N	\N	2026-05-23 06:43:00	2026-08-13 09:25:19.692	2026-08-13 09:25:19.692	\N	\N	\N
6546cc83-940e-478f-ab48-b8c7be824f09	132c36bf-d90a-46ca-8a0c-5db4a3e1311e	qris	\N	351000	card	completed	\N	\N	2026-06-10 04:41:00	2026-08-13 09:25:19.702	2026-08-13 09:25:19.702	\N	\N	\N
31aa5775-3b65-4ca6-b762-9534defaf19f	c9a5d7c0-39de-47a6-b47e-421bdde4c3df	qris	\N	817000	card	completed	\N	\N	2026-07-30 13:01:00	2026-08-13 09:25:19.712	2026-08-13 09:25:19.712	\N	\N	\N
84c4bdb2-1efa-4539-80ec-41d29a136ee3	994005c8-5a04-4866-a7fc-1805e9c95fb5	manual	\N	644000	cash	completed	\N	\N	2026-07-13 06:36:00	2026-08-13 09:25:19.721	2026-08-13 09:25:19.721	\N	\N	\N
6cc87d65-436c-40b3-8328-b2561c613029	c31e5c28-9ec2-4bc6-90bc-e77838b9e6d8	manual	\N	237600	cash	completed	\N	\N	2026-06-27 05:42:00	2026-08-13 09:25:19.74	2026-08-13 09:25:19.74	\N	\N	\N
77455ab6-3d80-41a5-b887-f28bc84a50e4	4331bf24-79f6-42b1-aad4-efd3c02db70f	qris	\N	783000	card	completed	\N	\N	2026-06-08 05:15:00	2026-08-13 09:25:19.75	2026-08-13 09:25:19.75	\N	\N	\N
f5d9ae3f-c8de-4a3f-8f0c-73a9fbbea39a	0f5d5835-9afa-4f1c-9277-9fc4f82e64eb	manual	\N	1055000	cash	completed	\N	\N	2026-05-27 06:15:00	2026-08-13 09:25:19.772	2026-08-13 09:25:19.772	\N	\N	\N
06656e65-f964-4efc-ada6-dde2e8a9a0b0	2e0ffae2-6bd9-4ce0-b4c3-80c5cd940068	qris	\N	516000	card	completed	\N	\N	2026-07-18 05:30:00	2026-08-13 09:25:19.782	2026-08-13 09:25:19.782	\N	\N	\N
8312b480-f3ad-4d97-ae37-1442efe3243b	cb7de401-ed25-4fe9-a6ce-c1e3cc1ae555	qris	\N	549000	transfer	completed	\N	\N	2026-06-01 13:07:00	2026-08-13 09:25:19.792	2026-08-13 09:25:19.792	\N	\N	\N
7c4e756d-f3a2-4433-9fe3-476f5595c538	5442e30a-59a6-411a-a356-cc2f432e46b3	qris	\N	506000	transfer	completed	\N	\N	2026-06-07 13:33:00	2026-08-13 09:25:19.801	2026-08-13 09:25:19.801	\N	\N	\N
b07bea65-81ec-4e1e-a184-e20f09e1dad0	dc68ea32-8e65-4e4c-893b-188c588791d3	manual	\N	499000	cash	completed	\N	\N	2026-07-14 11:08:00	2026-08-13 09:25:19.811	2026-08-13 09:25:19.811	\N	\N	\N
3c8111f6-2c6d-4a6c-8bc2-2e785849851b	532bb693-1b2e-4dbb-9224-d94f90363a0b	qris	\N	936000	transfer	completed	\N	\N	2026-06-15 04:23:00	2026-08-13 09:25:19.82	2026-08-13 09:25:19.82	\N	\N	\N
8357503f-7498-4bc3-8163-36f75bb254ae	178ada1c-bd5d-4e40-9ae4-45063e44be08	qris	\N	302400	card	completed	\N	\N	2026-06-12 03:53:00	2026-08-13 09:25:19.839	2026-08-13 09:25:19.839	\N	\N	\N
fa3c0580-38c4-451d-9f5b-ab7a9b57f947	663ef4e5-9d01-40a3-9b37-b9ceb3b19955	qris	\N	180000	card	completed	\N	\N	2026-06-23 05:51:00	2026-08-13 09:25:19.849	2026-08-13 09:25:19.849	\N	\N	\N
2256b648-123c-4580-9add-cb0503cce631	1c75af2c-44d3-4482-b871-882071a54938	manual	\N	941000	cash	completed	\N	\N	2026-05-30 13:31:00	2026-08-13 09:25:19.858	2026-08-13 09:25:19.858	\N	\N	\N
9347b266-4da9-4bee-a3ec-18a0a6ce6538	77885b5c-7834-4210-a4df-4bb5efdf9bcc	qris	\N	585900	card	completed	\N	\N	2026-06-10 12:26:00	2026-08-13 09:25:19.867	2026-08-13 09:25:19.867	\N	\N	\N
a28655d1-ff2c-4762-bc50-5650a379e182	a8e04cdb-8c14-44ec-9f79-ba9b2ecd96d0	manual	\N	322000	cash	completed	\N	\N	2026-07-05 12:48:00	2026-08-13 09:25:19.885	2026-08-13 09:25:19.885	\N	\N	\N
ddd85fd9-70a6-45a8-bee3-ca41c92eace3	3a9d17c3-bd34-4a63-8799-ece09949918a	qris	\N	551000	card	completed	\N	\N	2026-05-26 06:49:00	2026-08-13 09:25:19.895	2026-08-13 09:25:19.895	\N	\N	\N
194c03d1-77ba-43e9-bce1-544cc55fb3ce	a77e2ff4-ac55-4c78-8366-288eea982c0c	manual	\N	720000	cash	completed	\N	\N	2026-05-24 12:24:00	2026-08-13 09:25:19.907	2026-08-13 09:25:19.907	\N	\N	\N
87e75f0e-eae7-4d8c-9dac-b7d592e09d85	06db2960-5b2e-420a-acac-971b937b5412	qris	\N	250000	card	completed	\N	\N	2026-07-17 13:14:00	2026-08-13 09:25:19.92	2026-08-13 09:25:19.92	\N	\N	\N
378642a3-086f-4b15-adba-7ff0e1990097	e956c605-56f6-4a01-b65b-bcd00c7ef89b	manual	\N	908000	cash	completed	\N	\N	2026-05-17 11:59:00	2026-08-13 09:25:19.934	2026-08-13 09:25:19.934	\N	\N	\N
a8d6ca4f-0838-4652-9212-b6d5c3bbcab0	c7353d96-3ed8-4565-b5b0-c3f273148a25	qris	\N	366000	card	completed	\N	\N	2026-08-05 04:40:00	2026-08-13 09:25:19.954	2026-08-13 09:25:19.954	\N	\N	\N
6101d527-1fc8-485f-b80d-1b3785a8ed29	483168d3-1d27-42b1-963d-4487edfdc8d5	manual	\N	970000	cash	completed	\N	\N	2026-07-03 04:07:00	2026-08-13 09:25:19.963	2026-08-13 09:25:19.963	\N	\N	\N
d534950e-e5ed-49ed-932d-403940b3153b	ff729df8-a4cf-4fb8-84a1-b990496459e3	qris	\N	546000	card	completed	\N	\N	2026-05-19 06:49:00	2026-08-13 09:25:19.971	2026-08-13 09:25:19.971	\N	\N	\N
49777b65-00f6-40c5-bc8e-35c03460e640	9b669f7d-6651-4435-ab38-2619c7a606db	manual	\N	692000	cash	completed	\N	\N	2026-06-18 05:56:00	2026-08-13 09:25:19.98	2026-08-13 09:25:19.98	\N	\N	\N
358ced35-0c27-4b5f-9e40-d3ac668f2cf9	7c78d7c3-b7d0-4ebf-ba13-7d64ac4a66ba	qris	\N	440000	card	completed	\N	\N	2026-06-10 04:14:00	2026-08-13 09:25:19.999	2026-08-13 09:25:19.999	\N	\N	\N
555f2281-b0ff-49c6-98eb-bb0149a952f3	ba26535b-dc47-4278-aa6c-15ef7d129538	qris	\N	826000	transfer	completed	\N	\N	2026-06-09 05:14:00	2026-08-13 09:25:20.019	2026-08-13 09:25:20.019	\N	\N	\N
a8823de1-2bd9-46b8-8cc2-63333d2eeca9	e9ef4604-9902-4d17-837e-4d28fdf14b5e	qris	\N	752000	card	completed	\N	\N	2026-07-19 04:57:00	2026-08-13 09:25:20.038	2026-08-13 09:25:20.038	\N	\N	\N
70252185-a40c-4a50-b5f0-2f61351566c7	b0dd400d-f8eb-49e3-b1a4-96ee3f13aa56	manual	\N	960000	cash	completed	\N	\N	2026-06-27 02:38:00	2026-08-13 09:25:20.047	2026-08-13 09:25:20.047	\N	\N	\N
22e7ad7d-bf6e-44a9-b7d9-7f987e8ec8a7	6789df6f-d638-414f-8715-7cc10f9f07b8	manual	\N	362000	cash	completed	\N	\N	2026-06-10 11:23:00	2026-08-13 09:25:20.056	2026-08-13 09:25:20.056	\N	\N	\N
a4c8453c-9078-4864-8e54-2b5c09871701	54205e83-31db-4d7f-a565-c076f8130872	qris	\N	877000	transfer	completed	\N	\N	2026-06-11 11:00:00	2026-08-13 09:25:20.082	2026-08-13 09:25:20.082	\N	\N	\N
8ffc1c44-b320-4e81-b2cd-21891ccd5ab6	5b609815-1699-419c-8674-ea3c7ea1a08b	qris	\N	208000	card	completed	\N	\N	2026-07-05 06:12:00	2026-08-13 09:25:20.09	2026-08-13 09:25:20.09	\N	\N	\N
3b2fcbee-91e0-436c-8ac2-db6abfbbd9f7	ddcdf1d8-131f-4071-9780-dd7736e97eb1	manual	\N	939000	cash	completed	\N	\N	2026-08-07 04:37:00	2026-08-13 09:25:20.1	2026-08-13 09:25:20.1	\N	\N	\N
f9b77e1c-1a69-432d-8a20-de0712fe2e18	52046e27-2698-42cb-a74a-6939452be6f6	qris	\N	717000	card	completed	\N	\N	2026-07-19 06:18:00	2026-08-13 09:25:20.11	2026-08-13 09:25:20.11	\N	\N	\N
338ca661-a1eb-47c7-ad45-32ed1b11d956	7f30827a-2b81-4c6f-81b2-b82a97aa497f	manual	\N	325000	cash	completed	\N	\N	2026-08-07 05:20:00	2026-08-13 09:25:20.119	2026-08-13 09:25:20.119	\N	\N	\N
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, invoice_id, supplier_id, status, payment_date, amount, payment_method, reference_number, notes, processed_by, processed_at) FROM stdin;
\.


--
-- Data for Name: payrolls; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payrolls (id, employee_id, period_start, period_end, base_salary, overtime_hours, overtime_pay, bonus, deduction, total_pay, status, created_at, updated_at) FROM stdin;
f85a55bf-f643-4b29-9155-cbee322529bd	7dfc8a49-e15d-46ca-a141-3cf6515b822f	2026-07-31 17:00:00	2026-08-30 17:00:00	8000000	2	136364	390985	28758	8498591	pending	2026-08-13 09:25:20.125	2026-08-13 09:25:20.125
5179215d-33ad-4467-ab39-17ba6d452fbe	51333090-037d-4f04-aaca-179198d057cb	2026-07-31 17:00:00	2026-08-30 17:00:00	7500000	2	127841	92821	72936	7647726	pending	2026-08-13 09:25:20.129	2026-08-13 09:25:20.129
e097423e-d658-4dfb-a54c-a77878d61309	9851d5da-398c-45f2-88bc-364a7d9c0f78	2026-07-31 17:00:00	2026-08-30 17:00:00	4500000	12	460227	471786	43565	5388448	pending	2026-08-13 09:25:20.131	2026-08-13 09:25:20.131
7fce126d-994a-407d-b2af-b716404d8964	3a9cdc83-8886-43ca-8c3d-dd9b99b9686c	2026-07-31 17:00:00	2026-08-30 17:00:00	0	2	90000	184962	31914	5283048	pending	2026-08-13 09:25:20.133	2026-08-13 09:25:20.133
e02af329-2589-4015-a02b-71962292ac8f	9cfb2c32-74c0-44b8-b1e4-4e8b5e820b07	2026-07-31 17:00:00	2026-08-30 17:00:00	0	9	472500	338634	25718	6945416	pending	2026-08-13 09:25:20.135	2026-08-13 09:25:20.135
4fd85287-b0b0-493e-9eea-24645fcb76b4	1fc86c49-b571-4622-ae22-09325dcafc0a	2026-07-31 17:00:00	2026-08-30 17:00:00	6000000	2	102273	63934	57419	6108788	pending	2026-08-13 09:25:20.137	2026-08-13 09:25:20.137
d01b0eea-db53-4917-ae97-25186a4f8112	cc6ac485-10f6-40e2-b7c4-cae8c744eb8c	2026-07-31 17:00:00	2026-08-30 17:00:00	5500000	12	562500	102452	60106	6104846	pending	2026-08-13 09:25:20.139	2026-08-13 09:25:20.139
50870788-ebe5-4bba-afd2-a4a2fb31ddef	7ca9ca98-d3e6-403e-b992-473331848e32	2026-07-31 17:00:00	2026-08-30 17:00:00	0	2	135000	293375	77764	8990611	pending	2026-08-13 09:25:20.141	2026-08-13 09:25:20.141
5a8afefe-fe35-4ef6-b2bd-d27b66b7a257	187daedc-9e28-408b-b2b1-7c07ec2f8e1e	2026-07-31 17:00:00	2026-08-30 17:00:00	3500000	16	477273	38865	45332	3970806	pending	2026-08-13 09:25:20.144	2026-08-13 09:25:20.144
06f2b5c4-e612-4123-9bbb-009849966eec	e0b24bf7-d7fe-4e6c-994f-79ca2824d9f0	2026-07-31 17:00:00	2026-08-30 17:00:00	0	1	42000	453398	51486	6267912	pending	2026-08-13 09:25:20.147	2026-08-13 09:25:20.147
9ad426e1-3064-4b1b-988a-905c7bb1ecd7	4ad1e88d-e63d-4efe-9fa6-a95db1b8da54	2026-07-31 17:00:00	2026-08-30 17:00:00	5000000	5	213068	363743	86962	5489849	pending	2026-08-13 09:25:20.149	2026-08-13 09:25:20.149
5c3780b5-315e-4b97-a33b-a75caf9dcd31	4fd8096d-7111-4cde-a70f-37404ac2a45e	2026-07-31 17:00:00	2026-08-30 17:00:00	0	3	171000	224757	24134	6755623	pending	2026-08-13 09:25:20.152	2026-08-13 09:25:20.152
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permissions (id, name, description, module, action, created_at, updated_at) FROM stdin;
12a24584-eae9-4d7a-99a1-b7a349090ec2	users.view	view users	users	view	2026-08-13 09:25:15.604	2026-08-13 09:25:15.604
e90c3390-6420-482b-a033-9debcc90a2a8	users.create	create users	users	create	2026-08-13 09:25:15.608	2026-08-13 09:25:15.608
0e9f179f-7dff-4c44-8451-08563aa5277e	users.update	update users	users	update	2026-08-13 09:25:15.609	2026-08-13 09:25:15.609
f3afcc57-4fa1-45b6-817c-0eaff54b951b	users.delete	delete users	users	delete	2026-08-13 09:25:15.612	2026-08-13 09:25:15.612
e4fcbdb0-f8b7-41fb-a33e-743f42bab568	roles.view	view roles	roles	view	2026-08-13 09:25:15.614	2026-08-13 09:25:15.614
95bfd6db-1d84-4228-a8e2-39080bee4a4b	roles.create	create roles	roles	create	2026-08-13 09:25:15.616	2026-08-13 09:25:15.616
05a1157d-b712-4990-9d57-f85949c3f0a7	roles.update	update roles	roles	update	2026-08-13 09:25:15.618	2026-08-13 09:25:15.618
9de3857e-a5d1-4692-9c06-38214180b78c	roles.delete	delete roles	roles	delete	2026-08-13 09:25:15.62	2026-08-13 09:25:15.62
5e2b08da-743c-4198-bea0-d748d8811e26	roles.assign	assign roles	roles	assign	2026-08-13 09:25:15.622	2026-08-13 09:25:15.622
848e6235-2d68-475a-a394-eae64540d654	products.view	view products	products	view	2026-08-13 09:25:15.624	2026-08-13 09:25:15.624
e58d0168-8a9d-440a-8da2-88b308b36be2	products.create	create products	products	create	2026-08-13 09:25:15.625	2026-08-13 09:25:15.625
6bb7e530-3a92-4641-b865-1e3f67bcfd6f	products.edit	edit products	products	edit	2026-08-13 09:25:15.627	2026-08-13 09:25:15.627
963a1fbb-e5e7-4a35-ad31-8c328378d7c0	products.delete	delete products	products	delete	2026-08-13 09:25:15.629	2026-08-13 09:25:15.629
433d1a5b-5f32-4525-9646-476ed3915add	products.recipes_manage	recipes_manage products	products	recipes_manage	2026-08-13 09:25:15.631	2026-08-13 09:25:15.631
9bc5fe41-b57b-4186-9801-717fbc2395d4	orders.view	view orders	orders	view	2026-08-13 09:25:15.632	2026-08-13 09:25:15.632
f7811638-af29-45d0-9b27-68d187a2240d	orders.create	create orders	orders	create	2026-08-13 09:25:15.634	2026-08-13 09:25:15.634
4ddbf15f-a944-4a27-ae52-a19b63c49413	orders.edit	edit orders	orders	edit	2026-08-13 09:25:15.636	2026-08-13 09:25:15.636
e7738b96-deeb-4922-8285-614e5c53cfb4	orders.delete	delete orders	orders	delete	2026-08-13 09:25:15.638	2026-08-13 09:25:15.638
2c03b7a8-7fe2-4c72-b3a4-c43c39b6ba3e	orders.void	void orders	orders	void	2026-08-13 09:25:15.64	2026-08-13 09:25:15.64
f6e613f3-680a-46f8-8c72-cdbec1269803	orders.refund	refund orders	orders	refund	2026-08-13 09:25:15.641	2026-08-13 09:25:15.641
9af3b378-b7a0-48c4-bd15-6b73e4aaeec3	inventory.view	view inventory	inventory	view	2026-08-13 09:25:15.643	2026-08-13 09:25:15.643
50ddd8fb-3923-43d4-bcae-68801cc1c52c	inventory.create	create inventory	inventory	create	2026-08-13 09:25:15.645	2026-08-13 09:25:15.645
c2aa2900-7b05-4b24-a881-13a99b3d6ebf	inventory.edit	edit inventory	inventory	edit	2026-08-13 09:25:15.647	2026-08-13 09:25:15.647
64e10f76-ebd7-470a-870f-df3d0b1ce86c	inventory.delete	delete inventory	inventory	delete	2026-08-13 09:25:15.648	2026-08-13 09:25:15.648
fdbf0166-9063-4f89-8079-44695ed71fff	inventory.adjust	adjust inventory	inventory	adjust	2026-08-13 09:25:15.65	2026-08-13 09:25:15.65
2e8dceae-6cb9-47eb-97db-26baeb8702bd	inventory.approve	approve inventory	inventory	approve	2026-08-13 09:25:15.652	2026-08-13 09:25:15.652
1fb456d5-9e97-451a-b060-572ffef8039c	inventory.transfer	transfer inventory	inventory	transfer	2026-08-13 09:25:15.654	2026-08-13 09:25:15.654
70722727-39ff-4280-8fb3-5da1ab704047	purchasing.view	view purchasing	purchasing	view	2026-08-13 09:25:15.656	2026-08-13 09:25:15.656
77fec580-5974-4cfd-85c5-445f69f0ea08	purchasing.create	create purchasing	purchasing	create	2026-08-13 09:25:15.658	2026-08-13 09:25:15.658
b8b144f6-85fe-4372-a17d-4cd68c62e33b	purchasing.edit	edit purchasing	purchasing	edit	2026-08-13 09:25:15.66	2026-08-13 09:25:15.66
b9b67b6d-4e16-4776-a668-ddf2c86f919c	purchasing.delete	delete purchasing	purchasing	delete	2026-08-13 09:25:15.662	2026-08-13 09:25:15.662
c3bfc851-5f3f-49d2-8471-0d7b935b195b	purchasing.receive	receive purchasing	purchasing	receive	2026-08-13 09:25:15.664	2026-08-13 09:25:15.664
cd7d5ba7-9f02-44b5-8bb4-867196e85161	purchasing.pay	pay purchasing	purchasing	pay	2026-08-13 09:25:15.665	2026-08-13 09:25:15.665
62869e60-6051-4eda-b52a-76e130c05f30	crm.view	view crm	crm	view	2026-08-13 09:25:15.667	2026-08-13 09:25:15.667
d4fa958e-bd63-48b9-a383-63c70d8fc1a1	crm.create	create crm	crm	create	2026-08-13 09:25:15.669	2026-08-13 09:25:15.669
401ee1c4-b671-4406-a6a9-e601f1c93756	crm.edit	edit crm	crm	edit	2026-08-13 09:25:15.671	2026-08-13 09:25:15.671
fab0f100-b582-4929-9ea5-a6f2d88e4c12	crm.delete	delete crm	crm	delete	2026-08-13 09:25:15.672	2026-08-13 09:25:15.672
0cd2aaf2-92cb-4172-9511-bea19f52944e	promotions.view	view promotions	promotions	view	2026-08-13 09:25:15.673	2026-08-13 09:25:15.673
dc485b72-929f-4030-9dd2-be194304f6e9	promotions.create	create promotions	promotions	create	2026-08-13 09:25:15.674	2026-08-13 09:25:15.674
f19d567c-81aa-4fbd-81f0-8e8e83a7d2e4	promotions.edit	edit promotions	promotions	edit	2026-08-13 09:25:15.676	2026-08-13 09:25:15.676
188a7c96-fe48-4eae-b3a5-1ab962b4640d	promotions.delete	delete promotions	promotions	delete	2026-08-13 09:25:15.677	2026-08-13 09:25:15.677
7b10b3d2-d7ed-4e85-9e14-3abba7714224	attendance.view	view attendance	attendance	view	2026-08-13 09:25:15.679	2026-08-13 09:25:15.679
98d39df1-378e-4805-bf0c-0a4e2b23480e	attendance.edit	edit attendance	attendance	edit	2026-08-13 09:25:15.681	2026-08-13 09:25:15.681
289937fc-756d-4f72-ab38-2b0925c7fb83	attendance.delete	delete attendance	attendance	delete	2026-08-13 09:25:15.682	2026-08-13 09:25:15.682
b26cb05e-4d17-4186-8bd5-945b56b6a324	hr.view	view hr	hr	view	2026-08-13 09:25:15.683	2026-08-13 09:25:15.683
89cf85f8-df01-4a00-8a58-75bf79c89488	hr.create	create hr	hr	create	2026-08-13 09:25:15.685	2026-08-13 09:25:15.685
07cdd0ad-b654-4f4a-bbb0-8e736b79ce8c	hr.edit	edit hr	hr	edit	2026-08-13 09:25:15.686	2026-08-13 09:25:15.686
a904cdcd-77c5-42fb-ab00-0bb4dc8acecc	hr.delete	delete hr	hr	delete	2026-08-13 09:25:15.688	2026-08-13 09:25:15.688
9bf2be57-6c58-4822-9cb4-5209a6164777	payroll.view	view payroll	payroll	view	2026-08-13 09:25:15.689	2026-08-13 09:25:15.689
19719a4c-07fb-4230-98b7-e84de988ce12	payroll.create	create payroll	payroll	create	2026-08-13 09:25:15.69	2026-08-13 09:25:15.69
3c638c70-22de-4d5c-993e-9903e546b1c4	payroll.edit	edit payroll	payroll	edit	2026-08-13 09:25:15.691	2026-08-13 09:25:15.691
42bc2f75-2be1-4ddd-b27c-c5f63fcdf652	payroll.approve	approve payroll	payroll	approve	2026-08-13 09:25:15.693	2026-08-13 09:25:15.693
339fc51a-00bc-4a1a-a853-ec5cbee02fa1	finance.view	view finance	finance	view	2026-08-13 09:25:15.696	2026-08-13 09:25:15.696
dcbe4953-338b-4448-9089-b44d2b2071a3	finance.create	create finance	finance	create	2026-08-13 09:25:15.697	2026-08-13 09:25:15.697
789020d2-9cb8-4303-8ae2-8c3f992f5b31	finance.edit	edit finance	finance	edit	2026-08-13 09:25:15.699	2026-08-13 09:25:15.699
94667e20-6a81-4bb8-8033-ec964dcfdc2b	finance.delete	delete finance	finance	delete	2026-08-13 09:25:15.701	2026-08-13 09:25:15.701
a61a9cbc-0608-45aa-b665-c108beb7ca8a	finance.approve	approve finance	finance	approve	2026-08-13 09:25:15.703	2026-08-13 09:25:15.703
864651ba-9dd7-4b14-9eba-ef5a2434a6ec	finance.export	export finance	finance	export	2026-08-13 09:25:15.704	2026-08-13 09:25:15.704
7072bc02-31b5-4442-a5e2-93ca1f469f25	reports.view	view reports	reports	view	2026-08-13 09:25:15.706	2026-08-13 09:25:15.706
23563f6e-87ad-4d6e-960e-e27bb20ae43d	reports.export	export reports	reports	export	2026-08-13 09:25:15.708	2026-08-13 09:25:15.708
5f12d1e5-2009-4cfc-924d-350b5529c6a8	settings.view	view settings	settings	view	2026-08-13 09:25:15.709	2026-08-13 09:25:15.709
eed33497-9481-4785-9613-92e864b0c990	settings.edit	edit settings	settings	edit	2026-08-13 09:25:15.711	2026-08-13 09:25:15.711
2e59bf2f-dfcb-4136-bf0c-ee4e582472da	settings.reset	reset settings	settings	reset	2026-08-13 09:25:15.712	2026-08-13 09:25:15.712
dac5c2d5-a6ab-4750-846f-f271d8e781c5	settings.security_edit	security_edit settings	settings	security_edit	2026-08-13 09:25:15.714	2026-08-13 09:25:15.714
4c6beaf8-8d38-43d5-ad26-ae74195f0c06	outlets.view	view outlets	outlets	view	2026-08-13 09:25:15.716	2026-08-13 09:25:15.716
1f78f694-aded-439a-a223-6c73faf41394	outlets.create	create outlets	outlets	create	2026-08-13 09:25:15.717	2026-08-13 09:25:15.717
81a0ffb7-9eee-4ed5-8ddd-24a1ef7e6db1	outlets.edit	edit outlets	outlets	edit	2026-08-13 09:25:15.719	2026-08-13 09:25:15.719
51ce02dd-e7bf-491e-add0-c44ff2b40396	outlets.delete	delete outlets	outlets	delete	2026-08-13 09:25:15.721	2026-08-13 09:25:15.721
148cac39-640a-4c81-93c2-85e60aa8aa1f	modules.view	view modules	modules	view	2026-08-13 09:25:15.722	2026-08-13 09:25:15.722
6cb59f47-009e-4af5-90dc-b24efd33d56e	modules.manage	manage modules	modules	manage	2026-08-13 09:25:15.724	2026-08-13 09:25:15.724
6bd3696e-94bb-4f22-abce-ec4ae0f17322	kitchen.view	view kitchen	kitchen	view	2026-08-13 09:25:15.725	2026-08-13 09:25:15.725
890e89ec-5369-4b16-8539-0954f7fe5f3a	kitchen.manage	manage kitchen	kitchen	manage	2026-08-13 09:25:15.727	2026-08-13 09:25:15.727
a64a066e-57ba-4e88-afb5-d3843e788526	tables.view	view tables	tables	view	2026-08-13 09:25:15.729	2026-08-13 09:25:15.729
fa92c8fb-69a2-467a-83cf-f619108742be	tables.create	create tables	tables	create	2026-08-13 09:25:15.73	2026-08-13 09:25:15.73
2f29cd87-5129-4223-97b5-e66aac00e4f7	tables.edit	edit tables	tables	edit	2026-08-13 09:25:15.732	2026-08-13 09:25:15.732
2687d0e5-6688-48eb-b3df-fa44d1f4397a	tables.delete	delete tables	tables	delete	2026-08-13 09:25:15.734	2026-08-13 09:25:15.734
87e6a9eb-66f4-40dc-94b0-edae7025ef13	backup.view	view backup	backup	view	2026-08-13 09:25:15.735	2026-08-13 09:25:15.735
66deed5f-2ba0-4a72-954d-d3d791976f3c	backup.create	create backup	backup	create	2026-08-13 09:25:15.737	2026-08-13 09:25:15.737
8f9942e5-9a38-4924-81f7-104d00a803fc	backup.restore	restore backup	backup	restore	2026-08-13 09:25:15.739	2026-08-13 09:25:15.739
a62b2350-ffb0-4061-a80a-5b24b284f3a6	backup.delete	delete backup	backup	delete	2026-08-13 09:25:15.74	2026-08-13 09:25:15.74
e89567b6-0a2a-4263-b5c3-4efbdac3bf23	audit.view	view audit	audit	view	2026-08-13 09:25:15.741	2026-08-13 09:25:15.741
f88894eb-9c40-4ba3-b9bd-fe77e2169cef	printing.use	use printing	printing	use	2026-08-13 09:25:15.743	2026-08-13 09:25:15.743
ea8daa67-6c9d-40a9-878b-74480a82877f	printing.manage	manage printing	printing	manage	2026-08-13 09:25:15.745	2026-08-13 09:25:15.745
9488c3d7-03f7-4aca-9be5-cefc0b3d9ce3	approvals.view	view approvals	approvals	view	2026-08-13 09:25:15.747	2026-08-13 09:25:15.747
5e29e782-ef7e-451d-b3fa-f97dc4056f6c	approvals.create	create approvals	approvals	create	2026-08-13 09:25:15.748	2026-08-13 09:25:15.748
29907e75-47a6-4333-a4dc-522496a1fb8d	approvals.edit	edit approvals	approvals	edit	2026-08-13 09:25:15.75	2026-08-13 09:25:15.75
da739f76-e3f2-4e1b-bd02-bb543a083f5e	approvals.delete	delete approvals	approvals	delete	2026-08-13 09:25:15.752	2026-08-13 09:25:15.752
dac4cd94-d552-447a-8fe0-45692c3040d8	approvals.approve	approve approvals	approvals	approve	2026-08-13 09:25:15.754	2026-08-13 09:25:15.754
\.


--
-- Data for Name: petty_cash; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.petty_cash (id, amount, description, category, receipt_url, expense_date, created_by, created_at, updated_at, ingredient_id, shift_id) FROM stdin;
08cfaefa-eb5c-4ac5-abe6-d9e3e15171c6	19777	Beli bahan tambahan	ad_hoc_purchase	\N	2026-08-11 09:25:20.154	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	2026-08-13 09:25:20.156	2026-08-13 09:25:20.156	\N	\N
71835ff3-8ac2-428d-a9dd-378d51dd80bb	16939	Beli bahan tambahan	ad_hoc_purchase	\N	2026-08-09 09:25:20.159	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	2026-08-13 09:25:20.162	2026-08-13 09:25:20.162	\N	\N
579d33df-8aed-41b0-85ca-2885c65d0086	10861	Biaya tak terduga	misc	\N	2026-08-08 09:25:20.163	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	2026-08-13 09:25:20.167	2026-08-13 09:25:20.167	\N	\N
ca70ce8c-7e7f-436c-b6c9-a0bf864ea2fd	27928	Beli kemasan	ad_hoc_purchase	\N	2026-08-07 09:25:20.168	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	2026-08-13 09:25:20.17	2026-08-13 09:25:20.17	\N	\N
263ae397-1168-4b97-8614-cbf8346811e0	31299	Bensin operasional	operational	\N	2026-08-06 09:25:20.172	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	2026-08-13 09:25:20.175	2026-08-13 09:25:20.175	\N	\N
2b827142-add7-4ebe-b54f-fc52621f53d5	37352	Biaya tak terduga	misc	\N	2026-08-03 09:25:20.176	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	2026-08-13 09:25:20.18	2026-08-13 09:25:20.18	\N	\N
1f32055b-24aa-431d-8034-8d9a0c2dbd55	40871	Biaya parkir	operational	\N	2026-07-31 09:25:20.181	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	2026-08-13 09:25:20.183	2026-08-13 09:25:20.183	\N	\N
f7e03b02-e5ae-420e-8b6d-ac0922ff0722	30090	Transportasi kirim barang	operational	\N	2026-07-30 09:25:20.184	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	2026-08-13 09:25:20.187	2026-08-13 09:25:20.187	\N	\N
1c1895dc-f0c2-48b3-82be-014547d3d6fd	18771	Transportasi kirim barang	operational	\N	2026-07-29 09:25:20.188	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	2026-08-13 09:25:20.19	2026-08-13 09:25:20.19	\N	\N
8233cfe8-085c-4cc5-bdbf-a8b6bec64d33	33935	Pembelian alat dapur	ad_hoc_purchase	\N	2026-07-28 09:25:20.193	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	2026-08-13 09:25:20.195	2026-08-13 09:25:20.195	\N	\N
3144c46a-b4d1-47d2-abf2-92922450a7a6	21187	Beli kemasan	ad_hoc_purchase	\N	2026-07-25 09:25:20.196	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	2026-08-13 09:25:20.199	2026-08-13 09:25:20.199	\N	\N
b334ef72-38df-4b7e-84f6-883160ccf493	47705	Lain-lain	misc	\N	2026-07-24 09:25:20.201	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	2026-08-13 09:25:20.203	2026-08-13 09:25:20.203	\N	\N
9f6a65d9-5b10-4152-ab96-e79b8e7ca12d	41293	Beli kemasan	ad_hoc_purchase	\N	2026-07-23 09:25:20.204	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	2026-08-13 09:25:20.206	2026-08-13 09:25:20.206	\N	\N
efcdfa57-b8cb-42d7-b0c7-172392a94e46	27352	Pembelian alat dapur	ad_hoc_purchase	\N	2026-07-21 09:25:20.208	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	2026-08-13 09:25:20.21	2026-08-13 09:25:20.21	\N	\N
7f8aa36a-05b8-435b-b781-3efcc691e123	28995	Tips pengiriman	misc	\N	2026-07-20 09:25:20.211	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	2026-08-13 09:25:20.214	2026-08-13 09:25:20.214	\N	\N
3aa8c586-defe-4f15-8dab-2402c27d178f	47765	Bensin operasional	operational	\N	2026-07-19 09:25:20.215	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	2026-08-13 09:25:20.217	2026-08-13 09:25:20.217	\N	\N
f85d09f9-7218-4bf8-887f-70f7b034c00e	49445	Lain-lain	misc	\N	2026-07-18 09:25:20.218	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	2026-08-13 09:25:20.22	2026-08-13 09:25:20.22	\N	\N
35c1c131-b4ea-4626-8628-d40db19d8232	42867	Beli kemasan	ad_hoc_purchase	\N	2026-07-14 09:25:20.221	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	2026-08-13 09:25:20.223	2026-08-13 09:25:20.223	\N	\N
633f3c28-6888-4491-81a6-44ad78300d68	17741	Biaya tak terduga	misc	\N	2026-07-08 09:25:20.224	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	2026-08-13 09:25:20.228	2026-08-13 09:25:20.228	\N	\N
076afe43-ab6c-4061-b304-79f2aff253fc	12072	Lain-lain	misc	\N	2026-07-04 09:25:20.229	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	2026-08-13 09:25:20.231	2026-08-13 09:25:20.231	\N	\N
2bf839ba-d7a9-4930-99fc-29baf5ff3f3f	9018	Bensin operasional	operational	\N	2026-07-03 09:25:20.232	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	2026-08-13 09:25:20.236	2026-08-13 09:25:20.236	\N	\N
dfd0cb64-c1ba-4413-8bbb-cb6c33e52765	29896	Beli bahan tambahan	ad_hoc_purchase	\N	2026-07-02 09:25:20.237	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	2026-08-13 09:25:20.239	2026-08-13 09:25:20.239	\N	\N
86172a4a-c6d8-4fe9-9771-9461f109e563	38182	Beli bahan tambahan	ad_hoc_purchase	\N	2026-06-26 09:25:20.241	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	2026-08-13 09:25:20.244	2026-08-13 09:25:20.244	\N	\N
4afe2336-8d2c-423c-a3c3-49eccb642877	33266	Bensin operasional	operational	\N	2026-06-25 09:25:20.245	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	2026-08-13 09:25:20.247	2026-08-13 09:25:20.247	\N	\N
fef83b3d-efae-4672-a0cc-8b8ae9d2f9da	34189	Lain-lain	misc	\N	2026-06-22 09:25:20.248	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	2026-08-13 09:25:20.25	2026-08-13 09:25:20.25	\N	\N
c9e99975-53b7-488d-8bac-d8a96e4b0270	48027	Transportasi kirim barang	operational	\N	2026-06-21 09:25:20.251	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	2026-08-13 09:25:20.253	2026-08-13 09:25:20.253	\N	\N
e2f68677-1e2c-463a-8ff5-0f9d0807c42d	16020	Pembelian alat dapur	ad_hoc_purchase	\N	2026-06-20 09:25:20.254	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	2026-08-13 09:25:20.256	2026-08-13 09:25:20.256	\N	\N
7c102dcd-6199-4f68-8f36-485f8d37f746	5882	Beli bahan tambahan	ad_hoc_purchase	\N	2026-06-17 09:25:20.257	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	2026-08-13 09:25:20.26	2026-08-13 09:25:20.26	\N	\N
eb41f836-e9dd-4834-8ab7-b548d64fb3b2	17164	Bensin operasional	operational	\N	2026-06-16 09:25:20.261	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	2026-08-13 09:25:20.263	2026-08-13 09:25:20.263	\N	\N
2013e653-ee07-402e-8ba3-e71c9ae1c06d	16397	Biaya tak terduga	misc	\N	2026-06-14 09:25:20.264	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	2026-08-13 09:25:20.266	2026-08-13 09:25:20.266	\N	\N
2bd45310-b0c4-4332-abfa-c5f957d58aea	12635	Beli bahan tambahan	ad_hoc_purchase	\N	2026-06-13 09:25:20.267	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	2026-08-13 09:25:20.269	2026-08-13 09:25:20.269	\N	\N
0db5a612-3053-4b7f-94c2-e52a0b495c6b	23771	Biaya parkir	operational	\N	2026-06-09 09:25:20.27	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	2026-08-13 09:25:20.272	2026-08-13 09:25:20.272	\N	\N
8ed22948-5218-4632-a50b-06c17efb7c9f	49629	Biaya tak terduga	misc	\N	2026-06-08 09:25:20.273	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	2026-08-13 09:25:20.276	2026-08-13 09:25:20.276	\N	\N
7f6bb105-b61f-4bb0-98f5-293dd20364e5	8317	Beli kemasan	ad_hoc_purchase	\N	2026-06-07 09:25:20.277	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	2026-08-13 09:25:20.279	2026-08-13 09:25:20.279	\N	\N
52bbc69c-451a-4384-91f4-f2b92c78f2f1	38658	Biaya parkir	operational	\N	2026-06-06 09:25:20.28	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	2026-08-13 09:25:20.282	2026-08-13 09:25:20.282	\N	\N
08d145aa-2fe2-4de3-a564-cf1940065998	10313	Transportasi kirim barang	operational	\N	2026-06-03 09:25:20.283	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	2026-08-13 09:25:20.285	2026-08-13 09:25:20.285	\N	\N
e478962b-e12d-46de-9a03-1a13f550cc4a	29729	Lain-lain	misc	\N	2026-05-28 09:25:20.286	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	2026-08-13 09:25:20.288	2026-08-13 09:25:20.288	\N	\N
73ef54cb-4be2-4514-b76d-37c3fd57a318	25369	Biaya tak terduga	misc	\N	2026-05-26 09:25:20.29	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	2026-08-13 09:25:20.292	2026-08-13 09:25:20.292	\N	\N
eac574b8-a94d-4273-b1f1-9fc40c1d48f1	43984	Transportasi kirim barang	operational	\N	2026-05-25 09:25:20.293	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	2026-08-13 09:25:20.296	2026-08-13 09:25:20.296	\N	\N
fd3fc494-934a-4580-a231-e698f7f8a949	46700	Tips pengiriman	misc	\N	2026-05-24 09:25:20.297	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	2026-08-13 09:25:20.299	2026-08-13 09:25:20.299	\N	\N
e845c774-4fb1-4157-a663-b9ca3e231ecd	40220	Beli bahan tambahan	ad_hoc_purchase	\N	2026-05-23 09:25:20.3	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	2026-08-13 09:25:20.302	2026-08-13 09:25:20.302	\N	\N
fb291800-177b-46ca-a8bc-12841a90d35b	7959	Bensin operasional	operational	\N	2026-05-21 09:25:20.303	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	2026-08-13 09:25:20.305	2026-08-13 09:25:20.305	\N	\N
4b9c7692-42c9-47a4-b45e-ba034282bd4b	21382	Biaya tak terduga	misc	\N	2026-05-20 09:25:20.306	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	2026-08-13 09:25:20.309	2026-08-13 09:25:20.309	\N	\N
cf4b759e-2d3d-4118-827d-d0537e6551ba	9849	Biaya tak terduga	misc	\N	2026-05-18 09:25:20.311	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	2026-08-13 09:25:20.314	2026-08-13 09:25:20.314	\N	\N
8a5d9f0b-f762-4ba4-878d-284cd9ff1787	26762	Tips pengiriman	misc	\N	2026-05-17 09:25:20.314	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	2026-08-13 09:25:20.317	2026-08-13 09:25:20.317	\N	\N
796a480d-5e4f-4fa4-b3a3-e665a147f289	42654	Beli kemasan	ad_hoc_purchase	\N	2026-05-16 09:25:20.318	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	2026-08-13 09:25:20.32	2026-08-13 09:25:20.32	\N	\N
\.


--
-- Data for Name: printers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.printers (id, name, type, ip_address, port, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: product_modifier_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_modifier_groups (id, product_id, modifier_group_id, created_at) FROM stdin;
d4b07336-8561-42de-bfef-5e411a71c597	86643a05-ac82-4216-bdf8-87fcd64da8ec	e7cb72de-5473-4fec-8ab7-23dbd44cd7f8	2026-08-13 09:25:16.843
e2a7fa36-b04e-496e-a195-0a58b3847c31	86643a05-ac82-4216-bdf8-87fcd64da8ec	0ee4c6e0-8c4c-4439-a703-3a566fe7e39c	2026-08-13 09:25:16.843
16dfff85-ab90-4abe-b180-39caeb2e587f	86643a05-ac82-4216-bdf8-87fcd64da8ec	48ac660b-c9d0-4b15-928e-046f7e21ec24	2026-08-13 09:25:16.843
541605dc-16c0-48b1-a93f-772092f28133	7804beb7-b72c-43db-a27a-82b955e5e31c	e7cb72de-5473-4fec-8ab7-23dbd44cd7f8	2026-08-13 09:25:16.843
de402c54-a2a3-474f-ae7d-9d0d920b43a3	7804beb7-b72c-43db-a27a-82b955e5e31c	0ee4c6e0-8c4c-4439-a703-3a566fe7e39c	2026-08-13 09:25:16.843
c2fb28dd-407b-42ad-9373-9926d84d3a4e	7804beb7-b72c-43db-a27a-82b955e5e31c	48ac660b-c9d0-4b15-928e-046f7e21ec24	2026-08-13 09:25:16.843
535a439c-2df4-4614-8771-bda6598ec0e6	e9bd0cdf-4357-4313-8b02-7f8260f6992f	e7cb72de-5473-4fec-8ab7-23dbd44cd7f8	2026-08-13 09:25:16.844
35f9c3d2-6077-4599-b2b3-f865aff51a02	e9bd0cdf-4357-4313-8b02-7f8260f6992f	0ee4c6e0-8c4c-4439-a703-3a566fe7e39c	2026-08-13 09:25:16.844
618eec9c-97c1-4677-b987-d3bb4c0446bc	e9bd0cdf-4357-4313-8b02-7f8260f6992f	48ac660b-c9d0-4b15-928e-046f7e21ec24	2026-08-13 09:25:16.844
b0e2ff17-4d50-46ca-909f-210c42ed19af	35fbf376-436a-45ea-89a5-41560d3be32b	e7cb72de-5473-4fec-8ab7-23dbd44cd7f8	2026-08-13 09:25:16.843
75186364-5205-48a0-83eb-9bd63530fc89	35fbf376-436a-45ea-89a5-41560d3be32b	0ee4c6e0-8c4c-4439-a703-3a566fe7e39c	2026-08-13 09:25:16.843
5694e675-ac82-4a5f-996d-85201dd534e1	35fbf376-436a-45ea-89a5-41560d3be32b	48ac660b-c9d0-4b15-928e-046f7e21ec24	2026-08-13 09:25:16.843
b36d7b37-ac60-4fa3-bad7-2514113a958d	6798927c-bcba-49fd-a7ad-78291c69ac33	e7cb72de-5473-4fec-8ab7-23dbd44cd7f8	2026-08-13 09:25:16.843
f0033725-fe21-40fb-9ddf-853525e213ef	6798927c-bcba-49fd-a7ad-78291c69ac33	0ee4c6e0-8c4c-4439-a703-3a566fe7e39c	2026-08-13 09:25:16.843
ed22bd6e-8423-470e-bbd2-0f12f884327f	6798927c-bcba-49fd-a7ad-78291c69ac33	48ac660b-c9d0-4b15-928e-046f7e21ec24	2026-08-13 09:25:16.843
a9a53883-e196-40cb-8f84-ecf98500aa59	e24a6cc9-1b6e-4ba7-94a5-514f6aa8fe31	e7cb72de-5473-4fec-8ab7-23dbd44cd7f8	2026-08-13 09:25:16.843
2490bb52-6323-4791-82e1-732e2aae6019	e24a6cc9-1b6e-4ba7-94a5-514f6aa8fe31	0ee4c6e0-8c4c-4439-a703-3a566fe7e39c	2026-08-13 09:25:16.843
e9485488-3a3a-435d-829c-0fc07d14e188	e24a6cc9-1b6e-4ba7-94a5-514f6aa8fe31	48ac660b-c9d0-4b15-928e-046f7e21ec24	2026-08-13 09:25:16.843
dfb9eff7-08d3-4915-aa2c-b7d5b7b86643	96531f07-be37-454a-aa0c-4a0eaab99930	e7cb72de-5473-4fec-8ab7-23dbd44cd7f8	2026-08-13 09:25:16.843
87f814fb-3855-4433-ab83-759136c7d18e	96531f07-be37-454a-aa0c-4a0eaab99930	0ee4c6e0-8c4c-4439-a703-3a566fe7e39c	2026-08-13 09:25:16.843
cfed048b-3c28-498c-b63d-b278c4524936	96531f07-be37-454a-aa0c-4a0eaab99930	48ac660b-c9d0-4b15-928e-046f7e21ec24	2026-08-13 09:25:16.843
98ee22a4-cea6-4bf6-82ee-6c056c0df545	884570a1-2822-4840-a08f-fc4a4a3b5fad	e7cb72de-5473-4fec-8ab7-23dbd44cd7f8	2026-08-13 09:25:16.843
a846e1ab-8f5b-477d-b69c-e68852dd5b5a	acb42a52-c717-441a-824b-8a18079ee46c	e7cb72de-5473-4fec-8ab7-23dbd44cd7f8	2026-08-13 09:25:16.843
faf25649-4626-4adc-842b-af943e310382	884570a1-2822-4840-a08f-fc4a4a3b5fad	0ee4c6e0-8c4c-4439-a703-3a566fe7e39c	2026-08-13 09:25:16.843
04e529fa-7c80-4e76-8226-7861ed8bebc8	884570a1-2822-4840-a08f-fc4a4a3b5fad	48ac660b-c9d0-4b15-928e-046f7e21ec24	2026-08-13 09:25:16.843
744cdd29-3e3b-4fac-a7be-21bfa93a5aa8	acb42a52-c717-441a-824b-8a18079ee46c	0ee4c6e0-8c4c-4439-a703-3a566fe7e39c	2026-08-13 09:25:16.843
8a2b4803-2950-46f0-96e4-b5a6fee4fafc	acb42a52-c717-441a-824b-8a18079ee46c	48ac660b-c9d0-4b15-928e-046f7e21ec24	2026-08-13 09:25:16.843
9ba40ab3-8029-4c77-96cc-f2ee32ecacbb	7484d38a-54a0-49c7-baa2-a93fdce6d347	e7cb72de-5473-4fec-8ab7-23dbd44cd7f8	2026-08-13 09:25:16.843
4e0c7fe9-f2b0-4da1-8333-7834d52ebf23	7484d38a-54a0-49c7-baa2-a93fdce6d347	0ee4c6e0-8c4c-4439-a703-3a566fe7e39c	2026-08-13 09:25:16.843
dab6ace3-62d3-4696-9039-99d90a60150a	7484d38a-54a0-49c7-baa2-a93fdce6d347	48ac660b-c9d0-4b15-928e-046f7e21ec24	2026-08-13 09:25:16.843
cf0437a3-88ed-445c-87f5-28c447231cb7	faead849-9d7b-4831-b60e-20222fee6c1f	0ee4c6e0-8c4c-4439-a703-3a566fe7e39c	2026-08-13 09:25:16.899
ef0e3226-923e-4807-a57f-3a09a2fa3110	faead849-9d7b-4831-b60e-20222fee6c1f	065cebb3-c883-4f2c-be29-27db41a29c9b	2026-08-13 09:25:16.899
3870c598-c99b-41d2-a758-1e48a78f27d8	faead849-9d7b-4831-b60e-20222fee6c1f	f6bc6665-6904-4539-886e-ce33781df48a	2026-08-13 09:25:16.899
7e8b9c78-f964-4a48-a86d-76cf1665b674	83ceb824-bbdc-4b06-a867-037ded0aef0e	0ee4c6e0-8c4c-4439-a703-3a566fe7e39c	2026-08-13 09:25:16.899
f13768d8-85ec-4391-86c7-1e279ffe9021	83ceb824-bbdc-4b06-a867-037ded0aef0e	065cebb3-c883-4f2c-be29-27db41a29c9b	2026-08-13 09:25:16.899
1c53ab95-9fa5-4107-9f65-6b2a4ae8c875	83ceb824-bbdc-4b06-a867-037ded0aef0e	f6bc6665-6904-4539-886e-ce33781df48a	2026-08-13 09:25:16.899
dfc8319b-0de4-4fe3-879e-4dcc7e7fe050	83ff8a95-3eb4-4b98-9978-63aa6d1b8323	0ee4c6e0-8c4c-4439-a703-3a566fe7e39c	2026-08-13 09:25:16.899
be9a4c36-b7ff-4d33-9f2b-0dd02289f80a	83ff8a95-3eb4-4b98-9978-63aa6d1b8323	065cebb3-c883-4f2c-be29-27db41a29c9b	2026-08-13 09:25:16.899
9823e695-fbfb-415e-821d-20092f00c67e	83ff8a95-3eb4-4b98-9978-63aa6d1b8323	f6bc6665-6904-4539-886e-ce33781df48a	2026-08-13 09:25:16.899
5da1ad41-c19d-491a-ab98-2367437045e7	00acd18c-4b3a-4737-a36c-530f2c16d3b6	0ee4c6e0-8c4c-4439-a703-3a566fe7e39c	2026-08-13 09:25:16.899
3bff61f4-ebd5-4881-a0ad-57f519187777	00acd18c-4b3a-4737-a36c-530f2c16d3b6	065cebb3-c883-4f2c-be29-27db41a29c9b	2026-08-13 09:25:16.899
221a0397-a1f2-4f9e-9821-482fc889cab7	00acd18c-4b3a-4737-a36c-530f2c16d3b6	f6bc6665-6904-4539-886e-ce33781df48a	2026-08-13 09:25:16.899
f0d6fe55-86fa-4b12-9c12-da8d9a2a8e4a	219c20d2-6247-4e8b-a734-53cfbd90ba88	0ee4c6e0-8c4c-4439-a703-3a566fe7e39c	2026-08-13 09:25:16.899
dce3f556-a561-43bd-8766-34670eb1d69d	219c20d2-6247-4e8b-a734-53cfbd90ba88	065cebb3-c883-4f2c-be29-27db41a29c9b	2026-08-13 09:25:16.899
ab22c01e-1c2f-4b69-b2fa-1be96fdc07a1	219c20d2-6247-4e8b-a734-53cfbd90ba88	f6bc6665-6904-4539-886e-ce33781df48a	2026-08-13 09:25:16.899
663ddc92-0303-40e6-9def-8212bed954fc	25a8343a-39c3-457e-9c1d-13689bd6469b	0ee4c6e0-8c4c-4439-a703-3a566fe7e39c	2026-08-13 09:25:16.899
d9db8268-55e4-4039-b322-58639c3b1117	25a8343a-39c3-457e-9c1d-13689bd6469b	065cebb3-c883-4f2c-be29-27db41a29c9b	2026-08-13 09:25:16.899
1515c4f1-f488-4ecf-8a75-5470d73e1fb7	25a8343a-39c3-457e-9c1d-13689bd6469b	f6bc6665-6904-4539-886e-ce33781df48a	2026-08-13 09:25:16.899
092fd2ee-be8e-4cf7-9161-523eaca1358e	2ce5c559-70e1-4bdd-8cf0-fcdf2a843273	0ee4c6e0-8c4c-4439-a703-3a566fe7e39c	2026-08-13 09:25:16.899
7d2301f9-37fe-406e-ad2c-9ba48730ac85	2ce5c559-70e1-4bdd-8cf0-fcdf2a843273	065cebb3-c883-4f2c-be29-27db41a29c9b	2026-08-13 09:25:16.899
07571b16-7062-4258-b425-a6487ad9ff7b	2ce5c559-70e1-4bdd-8cf0-fcdf2a843273	f6bc6665-6904-4539-886e-ce33781df48a	2026-08-13 09:25:16.899
904feb56-50a9-4b84-8f91-07e5a1feb7b1	308d182c-58a9-47d9-a56a-bba4a473ae24	0ee4c6e0-8c4c-4439-a703-3a566fe7e39c	2026-08-13 09:25:16.9
bf37f063-b522-4950-9c8a-df6e1f440841	308d182c-58a9-47d9-a56a-bba4a473ae24	065cebb3-c883-4f2c-be29-27db41a29c9b	2026-08-13 09:25:16.9
65412e3b-44b0-40c2-ae00-7d2c0b6305f1	308d182c-58a9-47d9-a56a-bba4a473ae24	f6bc6665-6904-4539-886e-ce33781df48a	2026-08-13 09:25:16.9
0de16932-0c9a-4cfd-acf4-e35cd8770d28	c0917f04-365b-4cdc-9b75-e49a7c492727	0ee4c6e0-8c4c-4439-a703-3a566fe7e39c	2026-08-13 09:25:16.9
b1564b5d-ee0a-453d-ad47-86459c3b8e97	c0917f04-365b-4cdc-9b75-e49a7c492727	065cebb3-c883-4f2c-be29-27db41a29c9b	2026-08-13 09:25:16.9
5f7af66a-e902-4e8c-ab22-15112cd5681f	c0917f04-365b-4cdc-9b75-e49a7c492727	f6bc6665-6904-4539-886e-ce33781df48a	2026-08-13 09:25:16.9
d7f244b9-54d9-4a67-832f-4ef4e532fcb5	51c45fec-e0e7-489e-8339-02a536d2e857	0ee4c6e0-8c4c-4439-a703-3a566fe7e39c	2026-08-13 09:25:16.9
7e66ca9c-dbd3-43f2-b8c3-964d4e534c68	51c45fec-e0e7-489e-8339-02a536d2e857	065cebb3-c883-4f2c-be29-27db41a29c9b	2026-08-13 09:25:16.9
dbea0b90-8d01-42ed-9c07-2243c91b110f	51c45fec-e0e7-489e-8339-02a536d2e857	f6bc6665-6904-4539-886e-ce33781df48a	2026-08-13 09:25:16.9
52950d8a-1b82-4d88-9cf7-46f3826e61fe	c24edbc4-7c7a-4228-9b3c-1b95c2be051c	4adbfad8-a676-493e-9df0-beeb9e9ef4f8	2026-08-13 09:25:16.91
ba3d12c9-c0c7-440b-9114-911bbd3d80a6	c24edbc4-7c7a-4228-9b3c-1b95c2be051c	065cebb3-c883-4f2c-be29-27db41a29c9b	2026-08-13 09:25:16.91
f5a33455-250c-4fa2-a524-3d671918e2a9	c24edbc4-7c7a-4228-9b3c-1b95c2be051c	f6bc6665-6904-4539-886e-ce33781df48a	2026-08-13 09:25:16.91
e01512b2-1921-4bb9-8fe1-b1a5bf06c336	e718f02b-b657-444d-89ae-fb910537eb6c	4adbfad8-a676-493e-9df0-beeb9e9ef4f8	2026-08-13 09:25:16.91
653f8cd2-201b-477b-bca1-d414674642c1	e718f02b-b657-444d-89ae-fb910537eb6c	065cebb3-c883-4f2c-be29-27db41a29c9b	2026-08-13 09:25:16.91
79054ffb-7ef3-4468-993a-1dd563e3c8cc	e718f02b-b657-444d-89ae-fb910537eb6c	f6bc6665-6904-4539-886e-ce33781df48a	2026-08-13 09:25:16.91
4efaf577-b98d-4e1a-b39e-576383cca280	ceed2a39-e4e2-486c-b228-a909a81d8487	4adbfad8-a676-493e-9df0-beeb9e9ef4f8	2026-08-13 09:25:16.91
44489a5c-b4a9-4098-8fb2-33b9a19fe70f	ceed2a39-e4e2-486c-b228-a909a81d8487	065cebb3-c883-4f2c-be29-27db41a29c9b	2026-08-13 09:25:16.91
8fe8db4d-1a22-4d32-8aa4-167ac372a697	ceed2a39-e4e2-486c-b228-a909a81d8487	f6bc6665-6904-4539-886e-ce33781df48a	2026-08-13 09:25:16.91
aa8a8686-185c-4f68-bbf4-17167fb79297	b1ee3afc-db38-468c-a4bf-38b51b772024	4adbfad8-a676-493e-9df0-beeb9e9ef4f8	2026-08-13 09:25:16.911
7ab517b8-26cf-409b-b3ef-ef9f048c30d0	b1ee3afc-db38-468c-a4bf-38b51b772024	065cebb3-c883-4f2c-be29-27db41a29c9b	2026-08-13 09:25:16.911
6e6595b1-c99b-43d4-a0f7-0aa57bf39a62	b1ee3afc-db38-468c-a4bf-38b51b772024	f6bc6665-6904-4539-886e-ce33781df48a	2026-08-13 09:25:16.911
8e52cb2f-71d2-4171-a5f0-199e7d39c4d0	eaa3fac9-f60f-4db1-b33a-a4bd46e8ea71	4adbfad8-a676-493e-9df0-beeb9e9ef4f8	2026-08-13 09:25:16.91
eac21ef3-f5cc-4772-b81a-687d820d1e45	eaa3fac9-f60f-4db1-b33a-a4bd46e8ea71	065cebb3-c883-4f2c-be29-27db41a29c9b	2026-08-13 09:25:16.91
aa784376-59b2-4648-882a-8113a0ffbbef	eaa3fac9-f60f-4db1-b33a-a4bd46e8ea71	f6bc6665-6904-4539-886e-ce33781df48a	2026-08-13 09:25:16.91
5f40defb-45e6-4926-b8d1-7a7e9befde65	d21a6806-fffa-4462-b33f-2c91a1c6b013	4adbfad8-a676-493e-9df0-beeb9e9ef4f8	2026-08-13 09:25:16.91
ae59d0fc-344d-4bcc-be02-b6faf52e3e25	d9f1fb87-e737-4210-a5bf-1bc0ba885771	4adbfad8-a676-493e-9df0-beeb9e9ef4f8	2026-08-13 09:25:16.91
46a92034-b3d2-4c56-b098-40394ea6ff27	d21a6806-fffa-4462-b33f-2c91a1c6b013	065cebb3-c883-4f2c-be29-27db41a29c9b	2026-08-13 09:25:16.91
932e905c-d9be-4f9e-9387-f9309b603bb3	d9f1fb87-e737-4210-a5bf-1bc0ba885771	065cebb3-c883-4f2c-be29-27db41a29c9b	2026-08-13 09:25:16.91
19d3971b-044b-4253-9e40-ca6e9f9c9ce5	d21a6806-fffa-4462-b33f-2c91a1c6b013	f6bc6665-6904-4539-886e-ce33781df48a	2026-08-13 09:25:16.91
62ead739-751c-428d-8fa6-39efd6fbb917	d9f1fb87-e737-4210-a5bf-1bc0ba885771	f6bc6665-6904-4539-886e-ce33781df48a	2026-08-13 09:25:16.91
f417c76c-cefd-4148-8d92-3fe94ec18580	daa4bd17-296f-4da1-8d21-15534fa8e045	4adbfad8-a676-493e-9df0-beeb9e9ef4f8	2026-08-13 09:25:16.91
7b42c8a2-3288-49a0-b368-d07c103308c5	daa4bd17-296f-4da1-8d21-15534fa8e045	065cebb3-c883-4f2c-be29-27db41a29c9b	2026-08-13 09:25:16.91
b1686da5-9d0a-4140-8953-f51ca4091083	daa4bd17-296f-4da1-8d21-15534fa8e045	f6bc6665-6904-4539-886e-ce33781df48a	2026-08-13 09:25:16.91
d201d970-180f-4816-a20f-5b66f5891db0	27af0495-2d91-4cb0-af88-4752edf671dc	4adbfad8-a676-493e-9df0-beeb9e9ef4f8	2026-08-13 09:25:16.911
a043e189-c646-403a-a3af-e42cd79cfa8d	27af0495-2d91-4cb0-af88-4752edf671dc	065cebb3-c883-4f2c-be29-27db41a29c9b	2026-08-13 09:25:16.911
2576dbaa-88b8-4075-bdea-6bbde5dcddc7	27af0495-2d91-4cb0-af88-4752edf671dc	f6bc6665-6904-4539-886e-ce33781df48a	2026-08-13 09:25:16.911
e6db3fa8-9048-4ea9-a8e0-67a4c369c41c	cbc78f47-cb0d-4d34-80e1-841ec7b0e5de	9b81bc13-587f-4e72-9171-1672c3cb5af5	2026-08-13 09:25:16.92
3eee5a68-9bfa-4093-ad0e-dfceed5586d4	cbc78f47-cb0d-4d34-80e1-841ec7b0e5de	7ac020cf-13af-4cb1-87dd-77b664ba4357	2026-08-13 09:25:16.92
4ff46947-f155-4493-b628-b255d583a69e	eb1dae05-cb14-4000-ba10-260f9cd79124	9b81bc13-587f-4e72-9171-1672c3cb5af5	2026-08-13 09:25:16.92
431b33e6-9826-4cec-af0a-796f7ddcb64b	eb1dae05-cb14-4000-ba10-260f9cd79124	7ac020cf-13af-4cb1-87dd-77b664ba4357	2026-08-13 09:25:16.92
bd414ad8-b631-46b0-bb1f-aa4c5676107c	d52c0006-3bcd-48c7-ab83-082061dc6764	9b81bc13-587f-4e72-9171-1672c3cb5af5	2026-08-13 09:25:16.92
7d1a83ee-05da-475e-8712-4ab59e5b76b3	5ba65aef-1f61-4c68-b8c1-d847553c8aef	9b81bc13-587f-4e72-9171-1672c3cb5af5	2026-08-13 09:25:16.92
910b31d5-71f0-45b4-a90c-d88e9f6e5d26	5ba65aef-1f61-4c68-b8c1-d847553c8aef	7ac020cf-13af-4cb1-87dd-77b664ba4357	2026-08-13 09:25:16.92
03168f8b-9377-4df9-8097-510897e71c38	10b0cc63-2c10-44ef-bf34-8d19b7fda2bb	9b81bc13-587f-4e72-9171-1672c3cb5af5	2026-08-13 09:25:16.92
3480b6f1-1d41-4e82-87d3-7e250c27c930	30ef5deb-6b46-47d1-a98c-8bc060d62b44	9b81bc13-587f-4e72-9171-1672c3cb5af5	2026-08-13 09:25:16.921
4e79c6b7-b087-47dd-9611-3364a0e766f3	30ef5deb-6b46-47d1-a98c-8bc060d62b44	7ac020cf-13af-4cb1-87dd-77b664ba4357	2026-08-13 09:25:16.921
7c59b70f-e1c9-4301-bd48-a81f2e019dcb	d52c0006-3bcd-48c7-ab83-082061dc6764	7ac020cf-13af-4cb1-87dd-77b664ba4357	2026-08-13 09:25:16.92
b6868f5a-45d2-4206-b661-38ade072a96b	625d086d-e1db-42f3-9cd5-84006fb429c1	9b81bc13-587f-4e72-9171-1672c3cb5af5	2026-08-13 09:25:16.92
e76451d1-0b4e-4c4b-9c9c-f0410cdf4578	625d086d-e1db-42f3-9cd5-84006fb429c1	7ac020cf-13af-4cb1-87dd-77b664ba4357	2026-08-13 09:25:16.92
95fc95dc-ebb2-4fa3-a38f-d27865cb41dc	3a6ff9b1-cc6c-45ae-9635-ab2b2d03c232	4adbfad8-a676-493e-9df0-beeb9e9ef4f8	2026-08-13 09:25:16.942
428978f8-8213-4d45-83da-aa9570a758f0	3a6ff9b1-cc6c-45ae-9635-ab2b2d03c232	065cebb3-c883-4f2c-be29-27db41a29c9b	2026-08-13 09:25:16.942
279fa53e-9e9a-4785-9c26-22abe4744de4	b6a4c689-bce0-4d87-883b-b0de919eba27	9b81bc13-587f-4e72-9171-1672c3cb5af5	2026-08-13 09:25:16.921
d5c879eb-d4ea-4ed9-83e0-4bc0b22cf090	b6a4c689-bce0-4d87-883b-b0de919eba27	7ac020cf-13af-4cb1-87dd-77b664ba4357	2026-08-13 09:25:16.921
69636e2b-5ca4-4ede-b439-b2bc3ad2d81e	803bcdee-17d3-41fc-a249-4e8d16b49575	4adbfad8-a676-493e-9df0-beeb9e9ef4f8	2026-08-13 09:25:16.942
c241d5a5-40c3-456f-843f-1b08020a8bed	803bcdee-17d3-41fc-a249-4e8d16b49575	065cebb3-c883-4f2c-be29-27db41a29c9b	2026-08-13 09:25:16.942
cc825d23-3616-4aa3-9310-f47544fcc75d	f731a039-1a1f-413d-826c-0955bb9eea80	9b81bc13-587f-4e72-9171-1672c3cb5af5	2026-08-13 09:25:16.92
e1c89b14-8db0-416a-9265-8cc11c651e1a	f731a039-1a1f-413d-826c-0955bb9eea80	7ac020cf-13af-4cb1-87dd-77b664ba4357	2026-08-13 09:25:16.92
25e25fb0-9973-4282-9caf-c9a61f79653c	8f09b4ea-702e-4845-b2c0-59b3bf810d9d	4adbfad8-a676-493e-9df0-beeb9e9ef4f8	2026-08-13 09:25:16.942
bbfda5fd-3ae7-4bc1-840b-1b8a4aae551c	8f09b4ea-702e-4845-b2c0-59b3bf810d9d	065cebb3-c883-4f2c-be29-27db41a29c9b	2026-08-13 09:25:16.942
71552c1d-ccbb-40ba-a04e-191dd3a5442c	0b97d8bc-ffce-4904-8c46-87752b930f5e	4adbfad8-a676-493e-9df0-beeb9e9ef4f8	2026-08-13 09:25:16.942
45ebb53d-0675-4b0a-9506-e7085cd5f777	0b97d8bc-ffce-4904-8c46-87752b930f5e	065cebb3-c883-4f2c-be29-27db41a29c9b	2026-08-13 09:25:16.942
4d8be742-9d8b-4144-afd8-765e9b0aec69	b429cd3c-c501-4b4a-b028-9ab5feedc41e	9b81bc13-587f-4e72-9171-1672c3cb5af5	2026-08-13 09:25:16.921
7d72bca2-cb11-46d6-8f2b-e5139ce46788	b429cd3c-c501-4b4a-b028-9ab5feedc41e	7ac020cf-13af-4cb1-87dd-77b664ba4357	2026-08-13 09:25:16.921
9fc8be11-f85c-4dfc-83b3-ef8f88925d05	5bc34fc9-24c2-4108-af83-5992af2291d6	4adbfad8-a676-493e-9df0-beeb9e9ef4f8	2026-08-13 09:25:16.942
1b4202fa-98fb-420c-890d-38afcc7ccbf1	5bc34fc9-24c2-4108-af83-5992af2291d6	065cebb3-c883-4f2c-be29-27db41a29c9b	2026-08-13 09:25:16.942
5446128b-5262-450c-9943-f5b0220a0eed	10b0cc63-2c10-44ef-bf34-8d19b7fda2bb	7ac020cf-13af-4cb1-87dd-77b664ba4357	2026-08-13 09:25:16.92
a171c2df-303f-42ed-8493-22abfd1f12fc	cb1888fc-f827-4522-b136-a22bf86816c2	4adbfad8-a676-493e-9df0-beeb9e9ef4f8	2026-08-13 09:25:16.942
09506682-c715-4753-8a79-02ce9bc8e181	cb1888fc-f827-4522-b136-a22bf86816c2	065cebb3-c883-4f2c-be29-27db41a29c9b	2026-08-13 09:25:16.942
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, category_id, name, price, stock_quantity, image_url, sku, created_at, updated_at, description, is_active, outlet_id, hpp) FROM stdin;
7804beb7-b72c-43db-a27a-82b955e5e31c	65a3251a-9992-47ba-8af3-ebf2005d083b	Espresso	25000	100	https://picsum.photos/seed/espresso/500/500	ESP-001	2026-08-13 09:25:16.843	2026-08-13 09:25:16.843	Strong and concentrated coffee shot	t	\N	0
86643a05-ac82-4216-bdf8-87fcd64da8ec	65a3251a-9992-47ba-8af3-ebf2005d083b	Caffe Latte	48000	100	https://picsum.photos/seed/caffelatte/500/500	CL-004	2026-08-13 09:25:16.843	2026-08-13 09:25:16.843	Smooth espresso with steamed milk	t	\N	0
e9bd0cdf-4357-4313-8b02-7f8260f6992f	65a3251a-9992-47ba-8af3-ebf2005d083b	Affogato	52000	100	https://picsum.photos/seed/affogato/500/500	AF-010	2026-08-13 09:25:16.844	2026-08-13 09:25:16.844	Espresso poured over vanilla ice cream	t	\N	0
35fbf376-436a-45ea-89a5-41560d3be32b	65a3251a-9992-47ba-8af3-ebf2005d083b	Americano	35000	100	https://picsum.photos/seed/americano/500/500	AM-002	2026-08-13 09:25:16.843	2026-08-13 09:25:16.843	Espresso with hot water, smooth and bold	t	\N	0
6798927c-bcba-49fd-a7ad-78291c69ac33	65a3251a-9992-47ba-8af3-ebf2005d083b	Mocha	52000	100	https://picsum.photos/seed/mocha/500/500	MOC-006	2026-08-13 09:25:16.843	2026-08-13 09:25:16.843	Espresso with chocolate and steamed milk	t	\N	0
e24a6cc9-1b6e-4ba7-94a5-514f6aa8fe31	65a3251a-9992-47ba-8af3-ebf2005d083b	Cappuccino	45000	100	https://picsum.photos/seed/cappuccino/500/500	CAP-003	2026-08-13 09:25:16.843	2026-08-13 09:25:16.843	Espresso with steamed milk and foam	t	\N	0
96531f07-be37-454a-aa0c-4a0eaab99930	65a3251a-9992-47ba-8af3-ebf2005d083b	Caramel Macchiato	55000	100	https://picsum.photos/seed/caramelmacchiato/500/500	CM-005	2026-08-13 09:25:16.843	2026-08-13 09:25:16.843	Espresso with vanilla syrup, steamed milk, and caramel drizzle	t	\N	0
acb42a52-c717-441a-824b-8a18079ee46c	65a3251a-9992-47ba-8af3-ebf2005d083b	Vienna Coffee	50000	100	https://picsum.photos/seed/viennacoffee/500/500	VC-008	2026-08-13 09:25:16.843	2026-08-13 09:25:16.843	Espresso with whipped cream	t	\N	0
884570a1-2822-4840-a08f-fc4a4a3b5fad	65a3251a-9992-47ba-8af3-ebf2005d083b	Flat White	48000	100	https://picsum.photos/seed/flatwhite/500/500	FW-007	2026-08-13 09:25:16.843	2026-08-13 09:25:16.843	Velvety smooth espresso with microfoam	t	\N	0
7484d38a-54a0-49c7-baa2-a93fdce6d347	65a3251a-9992-47ba-8af3-ebf2005d083b	Irish Coffee	55000	100	https://picsum.photos/seed/irishcoffee/500/500	IC-009	2026-08-13 09:25:16.843	2026-08-13 09:25:16.843	Coffee with Irish cream and whipped cream	t	\N	0
2ce5c559-70e1-4bdd-8cf0-fcdf2a843273	65a3251a-9992-47ba-8af3-ebf2005d083b	Iced Cappuccino	46000	80	https://picsum.photos/seed/icedcappuccino/500/500	IC-006	2026-08-13 09:25:16.899	2026-08-13 09:25:16.899	Iced espresso with foamed milk	t	\N	0
25a8343a-39c3-457e-9c1d-13689bd6469b	65a3251a-9992-47ba-8af3-ebf2005d083b	Cold Brew	45000	80	https://picsum.photos/seed/coldbrew/500/500	CB-003	2026-08-13 09:25:16.899	2026-08-13 09:25:16.899	Slow-steeped cold coffee, smooth and less acidic	t	\N	0
faead849-9d7b-4831-b60e-20222fee6c1f	65a3251a-9992-47ba-8af3-ebf2005d083b	Iced Latte	48000	80	https://picsum.photos/seed/icedlatte/500/500	IL-002	2026-08-13 09:25:16.899	2026-08-13 09:25:16.899	Espresso with cold milk over ice	t	\N	0
83ceb824-bbdc-4b06-a867-037ded0aef0e	65a3251a-9992-47ba-8af3-ebf2005d083b	Nitro Cold Brew	50000	80	https://picsum.photos/seed/nitrocoldbrew/500/500	NCB-007	2026-08-13 09:25:16.899	2026-08-13 09:25:16.899	Cold brew infused with nitrogen for creamy texture	t	\N	0
83ff8a95-3eb4-4b98-9978-63aa6d1b8323	65a3251a-9992-47ba-8af3-ebf2005d083b	Iced Caramel Macchiato	55000	80	https://picsum.photos/seed/icedcaramelmacchiato/500/500	ICM-004	2026-08-13 09:25:16.899	2026-08-13 09:25:16.899	Iced espresso with vanilla, milk, and caramel	t	\N	0
00acd18c-4b3a-4737-a36c-530f2c16d3b6	65a3251a-9992-47ba-8af3-ebf2005d083b	Iced Americano	38000	80	https://picsum.photos/seed/icedamericano/500/500	IAM-001	2026-08-13 09:25:16.899	2026-08-13 09:25:16.899	Chilled espresso with water, refreshing and bold	t	\N	0
219c20d2-6247-4e8b-a734-53cfbd90ba88	65a3251a-9992-47ba-8af3-ebf2005d083b	Iced Mocha	52000	80	https://picsum.photos/seed/icedmocha/500/500	IM-005	2026-08-13 09:25:16.899	2026-08-13 09:25:16.899	Iced chocolate coffee with milk	t	\N	0
c0917f04-365b-4cdc-9b75-e49a7c492727	65a3251a-9992-47ba-8af3-ebf2005d083b	Iced Flat White	48000	80	https://picsum.photos/seed/icedflatwhite/500/500	IFW-008	2026-08-13 09:25:16.9	2026-08-13 09:25:16.9	Iced espresso with velvety microfoam	t	\N	0
308d182c-58a9-47d9-a56a-bba4a473ae24	65a3251a-9992-47ba-8af3-ebf2005d083b	Vietnamese Iced Coffee	42000	80	https://picsum.photos/seed/vietnameseicedcoffee/500/500	VIC-009	2026-08-13 09:25:16.9	2026-08-13 09:25:16.9	Strong coffee with sweetened condensed milk	t	\N	0
51c45fec-e0e7-489e-8339-02a536d2e857	65a3251a-9992-47ba-8af3-ebf2005d083b	Iced Espresso Tonic	45000	80	https://picsum.photos/seed/icedespressotonic/500/500	IET-010	2026-08-13 09:25:16.9	2026-08-13 09:25:16.9	Espresso over tonic water with citrus notes	t	\N	0
e718f02b-b657-444d-89ae-fb910537eb6c	3512a374-6a53-44fc-b3c6-a68582329403	Thai Milk Tea	42000	70	https://picsum.photos/seed/thaimilktea/500/500	TMT-004	2026-08-13 09:25:16.91	2026-08-13 09:25:16.91	Sweet Thai tea with condensed milk	t	\N	0
ceed2a39-e4e2-486c-b228-a909a81d8487	3512a374-6a53-44fc-b3c6-a68582329403	Coconut Water	20000	70	https://picsum.photos/seed/coconutwater/500/500	CW-007	2026-08-13 09:25:16.91	2026-08-13 09:25:16.91	Fresh coconut water	t	\N	0
c24edbc4-7c7a-4228-9b3c-1b95c2be051c	3512a374-6a53-44fc-b3c6-a68582329403	Matcha Latte	48000	70	https://picsum.photos/seed/matchalatte/500/500	ML-001	2026-08-13 09:25:16.91	2026-08-13 09:25:16.91	Japanese green tea with steamed milk	t	\N	0
b1ee3afc-db38-468c-a4bf-38b51b772024	3512a374-6a53-44fc-b3c6-a68582329403	Jus Jeruk Segar	20000	70	https://picsum.photos/seed/jusjeruk/500/500	JJS-008	2026-08-13 09:25:16.911	2026-08-13 09:25:16.911	Fresh orange juice	t	\N	0
eaa3fac9-f60f-4db1-b33a-a4bd46e8ea71	3512a374-6a53-44fc-b3c6-a68582329403	Iced Espresso Tonic	45000	70	https://picsum.photos/seed/icedespressotonic/500/500	IET-005	2026-08-13 09:25:16.91	2026-08-13 09:25:16.91	Espresso over tonic water with citrus notes	t	\N	0
d21a6806-fffa-4462-b33f-2c91a1c6b013	3512a374-6a53-44fc-b3c6-a68582329403	Iced Matcha Latte	50000	70	https://picsum.photos/seed/icedmatchalatte/500/500	IML-003	2026-08-13 09:25:16.91	2026-08-13 09:25:16.91	Cold green tea with milk over ice	t	\N	0
d9f1fb87-e737-4210-a5bf-1bc0ba885771	3512a374-6a53-44fc-b3c6-a68582329403	Hot Chocolate	42000	70	https://picsum.photos/seed/hotchocolate/500/500	HC-002	2026-08-13 09:25:16.91	2026-08-13 09:25:16.91	Rich chocolate drink with milk	t	\N	0
daa4bd17-296f-4da1-8d21-15534fa8e045	3512a374-6a53-44fc-b3c6-a68582329403	Lemonade	25000	70	https://picsum.photos/seed/lemonade/500/500	LM-006	2026-08-13 09:25:16.91	2026-08-13 09:25:16.91	Fresh lemonade	t	\N	0
27af0495-2d91-4cb0-af88-4752edf671dc	3512a374-6a53-44fc-b3c6-a68582329403	Es Teh Manis	10000	70	https://picsum.photos/seed/estehmanis/500/500	ETM-009	2026-08-13 09:25:16.911	2026-08-13 09:25:16.911	Sweet iced tea	t	\N	0
d52c0006-3bcd-48c7-ab83-082061dc6764	99e3bbcf-dd1f-49ad-8300-338db9621d18	Mie Goreng Jawa	42000	50	https://picsum.photos/seed/miegorengjawa/500/500	MG-002	2026-08-13 09:25:16.92	2026-08-13 09:25:16.92	Javanese style fried noodles	t	\N	0
cbc78f47-cb0d-4d34-80e1-841ec7b0e5de	99e3bbcf-dd1f-49ad-8300-338db9621d18	Chicken Sandwich	48000	50	https://picsum.photos/seed/chickensandwich/500/500	CS-006	2026-08-13 09:25:16.92	2026-08-13 09:25:16.92	Grilled chicken sandwich with vegetables	t	\N	0
10b0cc63-2c10-44ef-bf34-8d19b7fda2bb	99e3bbcf-dd1f-49ad-8300-338db9621d18	Sate Ayam	55000	50	https://picsum.photos/seed/sateayam/500/500	SA-004	2026-08-13 09:25:16.92	2026-08-13 09:25:16.92	Indonesian chicken skewers with peanut sauce	t	\N	0
eb1dae05-cb14-4000-ba10-260f9cd79124	99e3bbcf-dd1f-49ad-8300-338db9621d18	Nasi Goreng Spesial	45000	50	https://picsum.photos/seed/nasigorengspesial/500/500	NG-001	2026-08-13 09:25:16.92	2026-08-13 09:25:16.92	Indonesian fried rice with egg and vegetables	t	\N	0
f731a039-1a1f-413d-826c-0955bb9eea80	99e3bbcf-dd1f-49ad-8300-338db9621d18	Spaghetti Carbonara	55000	50	https://picsum.photos/seed/spaghetticarbonara/500/500	SC-007	2026-08-13 09:25:16.92	2026-08-13 09:25:16.92	Creamy pasta with bacon and parmesan	t	\N	0
30ef5deb-6b46-47d1-a98c-8bc060d62b44	99e3bbcf-dd1f-49ad-8300-338db9621d18	Caesar Salad	45000	50	https://picsum.photos/seed/caesarsalad/500/500	CS-010	2026-08-13 09:25:16.921	2026-08-13 09:25:16.921	Fresh salad with romaine and croutons	t	\N	0
5ba65aef-1f61-4c68-b8c1-d847553c8aef	99e3bbcf-dd1f-49ad-8300-338db9621d18	Burger Cheese	52000	50	https://picsum.photos/seed/burgercheese/500/500	BC-005	2026-08-13 09:25:16.92	2026-08-13 09:25:16.92	Classic beef burger with melted cheese	t	\N	0
b429cd3c-c501-4b4a-b028-9ab5feedc41e	99e3bbcf-dd1f-49ad-8300-338db9621d18	Fish and Chips	52000	50	https://picsum.photos/seed/fishandchips/500/500	FC-009	2026-08-13 09:25:16.921	2026-08-13 09:25:16.921	Battered fish with crispy fries	t	\N	0
81d6f3b5-b26a-4dd0-bfca-fea91a42a296	bc77c788-2749-4f33-98c2-f81f8a7ea2c5	Cinnamon Roll	35000	40	https://picsum.photos/seed/cinnamonroll/500/500	CR-005	2026-08-13 09:25:16.932	2026-08-13 09:25:16.932	Sweet cinnamon roll with glaze	t	\N	0
5bc34fc9-24c2-4108-af83-5992af2291d6	51c962ca-d397-4362-a367-9e6300a07716	Iced Peach Tea	40000	60	https://picsum.photos/seed/icedpeachtea/500/500	IPT-004	2026-08-13 09:25:16.942	2026-08-13 09:25:16.942	Fruity peach tea over ice	t	\N	0
625d086d-e1db-42f3-9cd5-84006fb429c1	99e3bbcf-dd1f-49ad-8300-338db9621d18	Ayam Bakar	48000	50	https://picsum.photos/seed/ayambakar/500/500	AB-003	2026-08-13 09:25:16.92	2026-08-13 09:25:16.92	Grilled chicken with sweet soy sauce	t	\N	0
efc81916-6661-422b-826f-c68049339458	bc77c788-2749-4f33-98c2-f81f8a7ea2c5	Croissant Butter	28000	40	https://picsum.photos/seed/croissantbutter/500/500	CR-001	2026-08-13 09:25:16.932	2026-08-13 09:25:16.932	Flaky butter croissant	t	\N	0
12b460b3-749d-4ab1-80de-d8f51d5188cc	bc77c788-2749-4f33-98c2-f81f8a7ea2c5	Carrot Cake	40000	40	https://picsum.photos/seed/carrotcake/500/500	CC-010	2026-08-13 09:25:16.934	2026-08-13 09:25:16.934	Spiced carrot cake with cream cheese frosting	t	\N	0
3a6ff9b1-cc6c-45ae-9635-ab2b2d03c232	51c962ca-d397-4362-a367-9e6300a07716	Iced Lemon Tea	38000	60	https://picsum.photos/seed/icedlemontea/500/500	ILT-003	2026-08-13 09:25:16.942	2026-08-13 09:25:16.942	Refreshing tea with lemon over ice	t	\N	0
b6a4c689-bce0-4d87-883b-b0de919eba27	99e3bbcf-dd1f-49ad-8300-338db9621d18	Beef Lasagna	58000	50	https://picsum.photos/seed/beeflasagna/500/500	BL-008	2026-08-13 09:25:16.921	2026-08-13 09:25:16.921	Layered pasta with beef and cheese	t	\N	0
a02247ba-a10e-4387-967d-e69a05c8193a	bc77c788-2749-4f33-98c2-f81f8a7ea2c5	Chocolate Muffin	32000	40	https://picsum.photos/seed/chocolatemuffin/500/500	CM-003	2026-08-13 09:25:16.932	2026-08-13 09:25:16.932	Rich chocolate chip muffin	t	\N	0
ce6673bb-c51b-4a4f-ab3d-810e44601734	bc77c788-2749-4f33-98c2-f81f8a7ea2c5	Brownie	28000	40	https://picsum.photos/seed/brownie/500/500	BR-007	2026-08-13 09:25:16.933	2026-08-13 09:25:16.933	Fudgy chocolate brownie	t	\N	0
c9ed90c7-689a-46ab-9fd2-84d017c264af	bc77c788-2749-4f33-98c2-f81f8a7ea2c5	Banana Bread	32000	40	https://picsum.photos/seed/bananabread/500/500	BB-008	2026-08-13 09:25:16.933	2026-08-13 09:25:16.933	Moist banana bread with walnuts	t	\N	0
228cd2ca-0ce1-44ff-92d8-05b7c9480e55	bc77c788-2749-4f33-98c2-f81f8a7ea2c5	Cheesecake Slice	42000	40	https://picsum.photos/seed/cheesecakeslice/500/500	CC-006	2026-08-13 09:25:16.933	2026-08-13 09:25:16.933	Creamy New York cheesecake	t	\N	0
d849f917-4afe-4a94-8866-03848a938c79	07099284-bd12-4ee3-bd8c-40fa13c4f149	Croissant Almond	35000	30	https://picsum.photos/seed/croissantalmond/500/500	CRA-002	2026-08-13 09:25:16.938	2026-08-13 09:25:16.938	Almond-filled butter croissant	t	\N	0
0b97d8bc-ffce-4904-8c46-87752b930f5e	51c962ca-d397-4362-a367-9e6300a07716	Chai Latte	45000	60	https://picsum.photos/seed/chailatte/500/500	CHL-001	2026-08-13 09:25:16.942	2026-08-13 09:25:16.942	Spiced tea with steamed milk	t	\N	0
d809adca-e256-41bc-b7b0-75df0d3f5dcb	bc77c788-2749-4f33-98c2-f81f8a7ea2c5	Croissant Almond	35000	40	https://picsum.photos/seed/croissantalmond/500/500	CA-002	2026-08-13 09:25:16.932	2026-08-13 09:25:16.932	Almond-filled butter croissant	t	\N	0
cb1888fc-f827-4522-b136-a22bf86816c2	51c962ca-d397-4362-a367-9e6300a07716	Jasmine Tea	35000	60	https://picsum.photos/seed/jasminetea/500/500	JT-006	2026-08-13 09:25:16.942	2026-08-13 09:25:16.942	Fragrant jasmine-scented green tea	t	\N	0
01d338fc-cbda-492d-b496-2a55e100d813	bc77c788-2749-4f33-98c2-f81f8a7ea2c5	Red Velvet Cake	45000	40	https://picsum.photos/seed/redvelvetcake/500/500	RVC-009	2026-08-13 09:25:16.933	2026-08-13 09:25:16.933	Classic red velvet cake slice	t	\N	0
8f09b4ea-702e-4845-b2c0-59b3bf810d9d	51c962ca-d397-4362-a367-9e6300a07716	Earl Grey Tea	38000	60	https://picsum.photos/seed/earlgreytea/500/500	EGT-005	2026-08-13 09:25:16.942	2026-08-13 09:25:16.942	Classic bergamot-infused black tea	t	\N	0
3aac02bc-fcc6-4532-9a50-fa50790dd4cb	bc77c788-2749-4f33-98c2-f81f8a7ea2c5	Blueberry Muffin	32000	40	https://picsum.photos/seed/blueberrymuffin/500/500	BM-004	2026-08-13 09:25:16.933	2026-08-13 09:25:16.933	Fresh blueberry muffin	t	\N	0
bcff5008-981c-428b-b652-31d8c1378d9f	07099284-bd12-4ee3-bd8c-40fa13c4f149	Croissant Butter	28000	30	https://picsum.photos/seed/croissantbutter/500/500	CRB-001	2026-08-13 09:25:16.938	2026-08-13 09:25:16.938	Flaky butter croissant	t	\N	0
803bcdee-17d3-41fc-a249-4e8d16b49575	51c962ca-d397-4362-a367-9e6300a07716	Iced Chai Latte	48000	60	https://picsum.photos/seed/icedchailatte/500/500	ICL-002	2026-08-13 09:25:16.942	2026-08-13 09:25:16.942	Cold spiced tea with milk over ice	t	\N	0
\.


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.profiles (id, username, password_hash, created_at, updated_at, outlet_id, email, full_name, is_active, phone, role_id, preferences) FROM stdin;
9133834e-ef39-4135-97e3-a3d04ea53589	cashier	$2b$10$UUUdaQMZuIArGjZe3XKA6OWT3z0UOlDLJKoCuW/RD9YBGQbIXAvbG	2026-08-13 09:25:16.516	2026-08-13 09:25:16.516	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	Cashier User	t	\N	00000000-0000-0000-0000-000000000002	{"recent": [{"route": "/pos", "title": "Point of Sale", "timestamp": "2026-08-13T09:10:16.364Z"}, {"route": "/products", "title": "Menu & Products", "timestamp": "2026-08-13T08:40:16.364Z"}], "favorites": ["/pos", "/products", "/settings"]}
75817c74-a58f-4f69-8c45-dc511a1162bc	manager	$2b$10$kmGI6Vx6gk/pmiT5F5i1veI/or5v14BrrJMnypzPKcpcwvjmOrQK.	2026-08-13 09:25:16.594	2026-08-13 09:25:16.594	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	Manager User	t	\N	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	{"recent": [{"route": "/pos", "title": "Point of Sale", "timestamp": "2026-08-13T09:10:16.364Z"}, {"route": "/products", "title": "Menu & Products", "timestamp": "2026-08-13T08:40:16.364Z"}], "favorites": ["/pos", "/products", "/settings"]}
9a1c60ea-ba6c-43f1-923f-748d7ac958ea	owner	$2b$10$95N/JHmnzl1bVtWcrLR7aemer8SQpsv0r5UbcsElupC4KxHT345IC	2026-08-13 09:25:16.668	2026-08-13 09:25:16.668	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	Owner User	t	\N	95b7fa32-df60-4e32-b831-7a0db95467ff	{"recent": [{"route": "/pos", "title": "Point of Sale", "timestamp": "2026-08-13T09:10:16.364Z"}, {"route": "/products", "title": "Menu & Products", "timestamp": "2026-08-13T08:40:16.364Z"}], "favorites": ["/pos", "/products", "/settings"]}
50dc0e7d-5d72-4458-8ffc-24d8749b8a99	admin2	$2b$10$tQKVSRaGXetRG5qmlLnkCewM51kfA9LKVmeee6DhO4myDuXAODxW.	2026-08-13 09:25:16.744	2026-08-13 09:25:16.744	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	Second Admin	t	\N	00000000-0000-0000-0000-000000000001	{"recent": [{"route": "/pos", "title": "Point of Sale", "timestamp": "2026-08-13T09:10:16.364Z"}, {"route": "/products", "title": "Menu & Products", "timestamp": "2026-08-13T08:40:16.364Z"}], "favorites": ["/pos", "/products", "/settings"]}
63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	$2b$10$opqf.3Nrilojh/PiHfF1r.KwWKGJTtMvn/AmZZy7B5slXQNX/VGK6	2026-08-13 09:25:16.438	2026-08-13 12:44:45.268	413ec5c9-2713-47ff-b0b3-b475a8447656	\N	System Administrator	t	\N	00000000-0000-0000-0000-000000000001	{"recent": [{"route": "/settings", "title": "Settings", "timestamp": "2026-08-13T12:44:45.254Z"}, {"route": "/inventory", "title": "Inventory", "timestamp": "2026-08-13T12:35:50.466Z"}, {"route": "/pos", "title": "Point of Sale", "timestamp": "2026-08-13T12:35:30.789Z"}, {"route": "/kitchen", "title": "Kitchen Display", "timestamp": "2026-08-13T11:39:31.207Z"}, {"route": "/products", "title": "Menu & Products", "timestamp": "2026-08-13T10:24:36.593Z"}, {"route": "/promotions", "title": "Promotions", "timestamp": "2026-08-13T09:43:50.650Z"}, {"route": "/inventory-suppliers", "title": "Purchase & Suppliers", "timestamp": "2026-08-13T09:42:38.138Z"}], "favorites": ["/pos", "/products", "/settings"]}
\.


--
-- Data for Name: purchase_order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_order_items (id, purchase_order_id, ingredient_id, ingredient_name, quantity, unit, unit_price, total_price) FROM stdin;
\.


--
-- Data for Name: purchase_orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_orders (id, supplier_id, status, order_date, notes, acknowledged_at, expected_delivery, payment_terms, po_number, quotation_id, reviewed_at, reviewed_by, sent_at, subtotal, tax, total) FROM stdin;
\.


--
-- Data for Name: purchase_requisition_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_requisition_items (id, purchase_requisition_id, ingredient_id, ingredient_name, quantity, unit, estimated_price, supplier_id) FROM stdin;
\.


--
-- Data for Name: purchase_requisitions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_requisitions (id, pr_number, status, requested_by, total_estimated, notes, approved_at, approved_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: quotation_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quotation_requests (id, stock_request_id, status, sent_at, closed_at, notes) FROM stdin;
\.


--
-- Data for Name: quotations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quotations (id, quotation_request_id, supplier_id, status, quoted_price, quoted_unit, delivery_date, payment_terms, valid_until, notes, received_at, selected_at, selected_by, selected_by_name) FROM stdin;
\.


--
-- Data for Name: recipes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.recipes (id, menu_item_id, ingredient_id, quantity_required, unit, created_at) FROM stdin;
d0c4e3c9-4c99-4870-af6e-850cb1c7316f	7804beb7-b72c-43db-a27a-82b955e5e31c	69d86a0c-44f6-48dc-a831-c61f5006d58c	0.018	kg	2026-08-13 11:38:59.466
920f8bae-2fb4-4c8a-a3f9-1d4b4f569faf	e24a6cc9-1b6e-4ba7-94a5-514f6aa8fe31	69d86a0c-44f6-48dc-a831-c61f5006d58c	0.018	kg	2026-08-13 11:38:59.471
45739606-fea9-486d-aaea-1dcc3a5ef9cc	e24a6cc9-1b6e-4ba7-94a5-514f6aa8fe31	0666228a-dbc2-4194-9858-7a3a0f3318b1	0.15	liter	2026-08-13 11:38:59.475
399ff145-0d6d-492d-93ae-472f15f7768a	35fbf376-436a-45ea-89a5-41560d3be32b	69d86a0c-44f6-48dc-a831-c61f5006d58c	0.018	kg	2026-08-13 11:42:32.628
0c1e30cb-8503-4d93-89fd-a11e029ce95d	2ce5c559-70e1-4bdd-8cf0-fcdf2a843273	69d86a0c-44f6-48dc-a831-c61f5006d58c	0.018	kg	2026-08-13 11:42:32.642
ee1accb3-d373-4ce6-87b7-8686df7d8dd5	2ce5c559-70e1-4bdd-8cf0-fcdf2a843273	0666228a-dbc2-4194-9858-7a3a0f3318b1	0.15	liter	2026-08-13 11:42:32.646
654fffd7-dd76-4bd8-8ca6-4c56e066f058	2ce5c559-70e1-4bdd-8cf0-fcdf2a843273	18358ddf-0e74-48ae-b766-b3263ef793c8	0.1	kg	2026-08-13 11:42:32.649
669afafe-ee6f-4a08-ab29-5a9c6ff0d4f3	86643a05-ac82-4216-bdf8-87fcd64da8ec	69d86a0c-44f6-48dc-a831-c61f5006d58c	0.018	kg	2026-08-13 11:42:32.653
65ca7dff-c5c8-45e1-82d3-168c1969303b	86643a05-ac82-4216-bdf8-87fcd64da8ec	0666228a-dbc2-4194-9858-7a3a0f3318b1	0.2	liter	2026-08-13 11:42:32.657
6610f9f9-ab3d-4fb5-8306-e8aaf6098104	faead849-9d7b-4831-b60e-20222fee6c1f	69d86a0c-44f6-48dc-a831-c61f5006d58c	0.018	kg	2026-08-13 11:42:32.661
8158302a-3686-46b3-8fb2-c901f22b13ad	faead849-9d7b-4831-b60e-20222fee6c1f	0666228a-dbc2-4194-9858-7a3a0f3318b1	0.2	liter	2026-08-13 11:42:32.663
44decf76-b562-4689-9ecb-244a82518410	faead849-9d7b-4831-b60e-20222fee6c1f	18358ddf-0e74-48ae-b766-b3263ef793c8	0.1	kg	2026-08-13 11:42:32.666
dc320035-ab70-41d6-b0b2-85d47e40464f	884570a1-2822-4840-a08f-fc4a4a3b5fad	69d86a0c-44f6-48dc-a831-c61f5006d58c	0.018	kg	2026-08-13 11:42:32.669
c5ea3db2-603d-402f-b8b3-f0ed77543fed	884570a1-2822-4840-a08f-fc4a4a3b5fad	0666228a-dbc2-4194-9858-7a3a0f3318b1	0.15	liter	2026-08-13 11:42:32.672
600165a5-22d0-4471-9d57-acd83dfe3181	c0917f04-365b-4cdc-9b75-e49a7c492727	69d86a0c-44f6-48dc-a831-c61f5006d58c	0.018	kg	2026-08-13 11:42:32.675
f6e4f861-ebf7-4736-a1ab-3bf82d6a3580	c0917f04-365b-4cdc-9b75-e49a7c492727	0666228a-dbc2-4194-9858-7a3a0f3318b1	0.15	liter	2026-08-13 11:42:32.678
eb0befb6-4145-4f93-8c09-9ea1b74c11fc	c0917f04-365b-4cdc-9b75-e49a7c492727	18358ddf-0e74-48ae-b766-b3263ef793c8	0.1	kg	2026-08-13 11:42:32.681
00ac7bbd-8079-42c9-815f-e00073fc8670	6798927c-bcba-49fd-a7ad-78291c69ac33	69d86a0c-44f6-48dc-a831-c61f5006d58c	0.018	kg	2026-08-13 11:42:32.683
a9cb1017-33be-4c11-a844-686ad210fc78	6798927c-bcba-49fd-a7ad-78291c69ac33	0666228a-dbc2-4194-9858-7a3a0f3318b1	0.15	liter	2026-08-13 11:42:32.688
b802f9ee-42f3-4857-88dd-ae28b075dad7	6798927c-bcba-49fd-a7ad-78291c69ac33	00ff959f-d32f-462a-a8a8-efafb19f0531	0.01	kg	2026-08-13 11:42:32.693
77099ccf-46cc-4b47-a7d7-922aea2980d4	219c20d2-6247-4e8b-a734-53cfbd90ba88	69d86a0c-44f6-48dc-a831-c61f5006d58c	0.018	kg	2026-08-13 11:42:32.695
8c6b7005-b740-4551-9b82-d9439f13c840	219c20d2-6247-4e8b-a734-53cfbd90ba88	0666228a-dbc2-4194-9858-7a3a0f3318b1	0.15	liter	2026-08-13 11:42:32.698
8d512e9e-e616-4d99-97ee-9a6f2db99c5b	219c20d2-6247-4e8b-a734-53cfbd90ba88	00ff959f-d32f-462a-a8a8-efafb19f0531	0.01	kg	2026-08-13 11:42:32.701
b68b34f2-79cb-46b5-97ec-567082949a98	219c20d2-6247-4e8b-a734-53cfbd90ba88	18358ddf-0e74-48ae-b766-b3263ef793c8	0.1	kg	2026-08-13 11:42:32.703
3f76b0dc-76bf-444d-959c-81d4443aa946	96531f07-be37-454a-aa0c-4a0eaab99930	69d86a0c-44f6-48dc-a831-c61f5006d58c	0.018	kg	2026-08-13 11:42:32.705
2fb25587-ef49-4f02-911c-ba8fdc967d88	96531f07-be37-454a-aa0c-4a0eaab99930	0666228a-dbc2-4194-9858-7a3a0f3318b1	0.1	liter	2026-08-13 11:42:32.708
03ebbadf-8a3e-4e05-aaf8-4253464d5070	96531f07-be37-454a-aa0c-4a0eaab99930	927efcd5-ec5f-43f5-be4a-54bfc0afddf1	0.02	liter	2026-08-13 11:42:32.71
c5176d18-5bf1-473e-ba5d-004628f46b27	83ff8a95-3eb4-4b98-9978-63aa6d1b8323	69d86a0c-44f6-48dc-a831-c61f5006d58c	0.018	kg	2026-08-13 11:42:32.712
0f2df8e9-5573-4db1-9448-78a41e41bbd5	83ff8a95-3eb4-4b98-9978-63aa6d1b8323	0666228a-dbc2-4194-9858-7a3a0f3318b1	0.1	liter	2026-08-13 11:42:32.714
fcdd98c1-c7f9-454a-a9d3-d36e088148f5	83ff8a95-3eb4-4b98-9978-63aa6d1b8323	927efcd5-ec5f-43f5-be4a-54bfc0afddf1	0.02	liter	2026-08-13 11:42:32.716
e41b9784-0104-46c2-8c0b-4576a2b73b1f	83ff8a95-3eb4-4b98-9978-63aa6d1b8323	18358ddf-0e74-48ae-b766-b3263ef793c8	0.1	kg	2026-08-13 11:42:32.719
71002884-d839-4268-acd7-04a995a1f4d6	25a8343a-39c3-457e-9c1d-13689bd6469b	69d86a0c-44f6-48dc-a831-c61f5006d58c	0.025	kg	2026-08-13 11:42:32.721
1527bbd2-35b1-4454-9c17-ee85dfb9c3a4	83ceb824-bbdc-4b06-a867-037ded0aef0e	69d86a0c-44f6-48dc-a831-c61f5006d58c	0.025	kg	2026-08-13 11:42:32.723
ef074ea7-d430-45e0-9a3f-864d7d0c6f63	83ceb824-bbdc-4b06-a867-037ded0aef0e	8660305b-58c0-4668-9f0c-894c4ed0e73d	0.01	tabung	2026-08-13 11:42:32.725
4909159f-b1fd-482a-bf87-60b4780544cd	00acd18c-4b3a-4737-a36c-530f2c16d3b6	69d86a0c-44f6-48dc-a831-c61f5006d58c	0.018	kg	2026-08-13 11:42:32.727
cf4d831a-d238-426a-9a8e-cc39c60ad1d9	00acd18c-4b3a-4737-a36c-530f2c16d3b6	18358ddf-0e74-48ae-b766-b3263ef793c8	0.1	kg	2026-08-13 11:42:32.729
e69cb484-2daf-412f-a846-4235836920d5	eaa3fac9-f60f-4db1-b33a-a4bd46e8ea71	69d86a0c-44f6-48dc-a831-c61f5006d58c	0.018	kg	2026-08-13 11:42:32.731
8ec5e481-ccb1-41fd-99d5-5fac98229fc3	eaa3fac9-f60f-4db1-b33a-a4bd46e8ea71	9d9655f7-f102-4c28-a27f-8c24df868916	0.15	liter	2026-08-13 11:42:32.734
e23b97f0-b0a1-4960-aa9e-6ea300054009	eaa3fac9-f60f-4db1-b33a-a4bd46e8ea71	18358ddf-0e74-48ae-b766-b3263ef793c8	0.1	kg	2026-08-13 11:42:32.736
f5f90357-23bb-4f74-94f7-a9793964d148	d9f1fb87-e737-4210-a5bf-1bc0ba885771	00ff959f-d32f-462a-a8a8-efafb19f0531	0.03	kg	2026-08-13 11:42:32.739
dbd98510-c0d2-435f-8cc0-7e4dcd12bfce	d9f1fb87-e737-4210-a5bf-1bc0ba885771	0666228a-dbc2-4194-9858-7a3a0f3318b1	0.2	liter	2026-08-13 11:42:32.741
72f503bd-45d4-4e53-97b9-ed6bf7d01b8f	e9bd0cdf-4357-4313-8b02-7f8260f6992f	69d86a0c-44f6-48dc-a831-c61f5006d58c	0.018	kg	2026-08-13 11:42:32.744
fbe854a1-e6ed-4810-9677-f284cb95e962	e9bd0cdf-4357-4313-8b02-7f8260f6992f	280b0e3a-42f2-423c-a415-f96ffc631c93	0.1	liter	2026-08-13 11:42:32.746
bfd94438-fe44-4080-9038-e27830ae5196	7484d38a-54a0-49c7-baa2-a93fdce6d347	69d86a0c-44f6-48dc-a831-c61f5006d58c	0.018	kg	2026-08-13 11:42:32.749
1ae6c451-923f-479c-a204-6fdd8a6e78c8	7484d38a-54a0-49c7-baa2-a93fdce6d347	ecc37f66-df46-423e-aaf4-28bf87f461e4	0.02	liter	2026-08-13 11:42:32.752
5f60ce9c-2c7b-470c-bad3-d8413ef67a2d	acb42a52-c717-441a-824b-8a18079ee46c	69d86a0c-44f6-48dc-a831-c61f5006d58c	0.018	kg	2026-08-13 11:42:32.754
128fe943-d485-471c-b4e5-eac199c37f03	acb42a52-c717-441a-824b-8a18079ee46c	ecc37f66-df46-423e-aaf4-28bf87f461e4	0.03	liter	2026-08-13 11:42:32.757
0abcb8cc-4211-4407-936b-361c3efe80ba	308d182c-58a9-47d9-a56a-bba4a473ae24	69d86a0c-44f6-48dc-a831-c61f5006d58c	0.02	kg	2026-08-13 11:42:32.759
6d4f32a7-f20a-4ef9-9354-d5ac7fac3067	308d182c-58a9-47d9-a56a-bba4a473ae24	9e82dd6d-9d74-4887-b61a-35d3b849dedb	0.05	kaleng	2026-08-13 11:42:32.761
6c084163-b2d2-4ead-90f4-949ca98afbe8	8f09b4ea-702e-4845-b2c0-59b3bf810d9d	8ec5d131-b85f-460f-aa5f-276f40756b14	0.005	kg	2026-08-13 11:42:32.764
8a7c0bbe-dd7e-4bb6-b6d5-58e084c2173c	cb1888fc-f827-4522-b136-a22bf86816c2	4aed869d-e995-4097-9083-4edf92aaa62a	0.005	kg	2026-08-13 11:42:32.766
b2fc4922-fb72-46d8-93bf-8de3bff49b41	0b97d8bc-ffce-4904-8c46-87752b930f5e	3eba3202-5bb7-4cda-91f0-14c7d4412b60	0.01	kg	2026-08-13 11:42:32.768
a49dfe94-5a17-47b8-96c5-9f5db8554059	0b97d8bc-ffce-4904-8c46-87752b930f5e	0666228a-dbc2-4194-9858-7a3a0f3318b1	0.15	liter	2026-08-13 11:42:32.77
2b4290eb-d6d9-49e6-8d0e-ffc1a0c49466	803bcdee-17d3-41fc-a249-4e8d16b49575	3eba3202-5bb7-4cda-91f0-14c7d4412b60	0.01	kg	2026-08-13 11:42:32.773
0943edc1-d49c-493b-bff7-bb9aeb488f2b	803bcdee-17d3-41fc-a249-4e8d16b49575	0666228a-dbc2-4194-9858-7a3a0f3318b1	0.15	liter	2026-08-13 11:42:32.775
5d3ccd01-f2ae-4195-9108-182499be6aad	803bcdee-17d3-41fc-a249-4e8d16b49575	18358ddf-0e74-48ae-b766-b3263ef793c8	0.1	kg	2026-08-13 11:42:32.777
f6faebbc-383e-4b8f-b5c7-f7873c1163ab	c24edbc4-7c7a-4228-9b3c-1b95c2be051c	8eb26642-1676-4860-96aa-9f9901080e1d	0.01	kg	2026-08-13 11:42:32.779
fd2c63d4-6491-4432-81e0-0673c9321c69	c24edbc4-7c7a-4228-9b3c-1b95c2be051c	0666228a-dbc2-4194-9858-7a3a0f3318b1	0.15	liter	2026-08-13 11:42:32.781
03f8a649-ccc1-4bf2-948b-20d41c769cac	d21a6806-fffa-4462-b33f-2c91a1c6b013	8eb26642-1676-4860-96aa-9f9901080e1d	0.01	kg	2026-08-13 11:42:32.784
7f6e52b1-c059-4e82-a49d-88d7fac2e32e	d21a6806-fffa-4462-b33f-2c91a1c6b013	0666228a-dbc2-4194-9858-7a3a0f3318b1	0.15	liter	2026-08-13 11:42:32.787
902bc850-709d-4fcb-abdf-9d23ff9b34ca	d21a6806-fffa-4462-b33f-2c91a1c6b013	18358ddf-0e74-48ae-b766-b3263ef793c8	0.1	kg	2026-08-13 11:42:32.79
9e73249d-bc9f-4914-bea8-db60ddbc46bd	27af0495-2d91-4cb0-af88-4752edf671dc	8ec5d131-b85f-460f-aa5f-276f40756b14	0.005	kg	2026-08-13 11:42:32.793
72d30aaa-5996-42be-b2b8-f65efe666f28	27af0495-2d91-4cb0-af88-4752edf671dc	d33b5646-418a-44ce-af22-d7f5ed047c5a	0.02	kg	2026-08-13 11:42:32.797
eeb3b305-b941-4014-bf29-761d48328848	27af0495-2d91-4cb0-af88-4752edf671dc	18358ddf-0e74-48ae-b766-b3263ef793c8	0.1	kg	2026-08-13 11:42:32.801
3d9dcfa9-da86-42de-a75a-085721747832	e718f02b-b657-444d-89ae-fb910537eb6c	208aece4-a60d-4b5b-b34b-c94d17317185	0.01	liter	2026-08-13 11:42:32.804
f79ff4fe-8ea3-4acb-a40d-0a2197396a30	e718f02b-b657-444d-89ae-fb910537eb6c	9e82dd6d-9d74-4887-b61a-35d3b849dedb	0.03	kaleng	2026-08-13 11:42:32.813
45e50e56-812d-4d07-8019-4811527b09dc	3a6ff9b1-cc6c-45ae-9635-ab2b2d03c232	8ec5d131-b85f-460f-aa5f-276f40756b14	0.005	kg	2026-08-13 11:42:32.816
db4ed6bd-2a8e-4f8b-b4a8-720121d06aeb	3a6ff9b1-cc6c-45ae-9635-ab2b2d03c232	bbc95ea7-cc30-49ab-a22b-41ebba8ce3ce	0.02	liter	2026-08-13 11:42:32.82
63ed6d70-ea48-4bd4-94d7-f00c935b71e8	3a6ff9b1-cc6c-45ae-9635-ab2b2d03c232	d33b5646-418a-44ce-af22-d7f5ed047c5a	0.02	kg	2026-08-13 11:42:32.827
75ae0283-0846-4ae9-b0dd-cef0f94b62a4	3a6ff9b1-cc6c-45ae-9635-ab2b2d03c232	18358ddf-0e74-48ae-b766-b3263ef793c8	0.1	kg	2026-08-13 11:42:32.831
62c416ca-a9c5-4d63-a1e3-9b44ec307898	5bc34fc9-24c2-4108-af83-5992af2291d6	8ec5d131-b85f-460f-aa5f-276f40756b14	0.005	kg	2026-08-13 11:42:32.834
dd748cb2-a102-4578-925b-8d7ce2923e22	5bc34fc9-24c2-4108-af83-5992af2291d6	d33b5646-418a-44ce-af22-d7f5ed047c5a	0.02	kg	2026-08-13 11:42:32.839
67ba7a90-dd6c-4acd-a70a-a457ec5774a7	5bc34fc9-24c2-4108-af83-5992af2291d6	18358ddf-0e74-48ae-b766-b3263ef793c8	0.1	kg	2026-08-13 11:42:32.844
e1df98ea-ebdc-4ef9-aa97-78980de567d8	daa4bd17-296f-4da1-8d21-15534fa8e045	bbc95ea7-cc30-49ab-a22b-41ebba8ce3ce	0.05	liter	2026-08-13 11:42:32.85
eb1a7173-ddc9-44e2-8956-3b01890502e5	daa4bd17-296f-4da1-8d21-15534fa8e045	d33b5646-418a-44ce-af22-d7f5ed047c5a	0.02	kg	2026-08-13 11:42:32.857
ac8a567b-a254-4bff-bb7f-aa8455dd7295	daa4bd17-296f-4da1-8d21-15534fa8e045	18358ddf-0e74-48ae-b766-b3263ef793c8	0.1	kg	2026-08-13 11:42:32.863
9ca80b9f-ac27-44b1-8088-b815bdd1b568	ceed2a39-e4e2-486c-b228-a909a81d8487	10cf222b-8e27-465e-8faf-2c3a9d4a2a40	0.3	liter	2026-08-13 11:42:32.868
3794cad8-e538-497e-b7cc-fdb3b0899e01	b1ee3afc-db38-468c-a4bf-38b51b772024	26146f8d-e7d4-4551-a7b5-111b2af909f0	0.2	kg	2026-08-13 11:42:32.877
c692c215-c40a-4700-9e2f-d5f9dbd303ae	eb1dae05-cb14-4000-ba10-260f9cd79124	cea77dc3-c9c2-4b61-b0d7-5437dadb0430	0.03	liter	2026-08-13 11:42:32.881
009f20a1-8350-4d66-9e72-c2b9c7838bd0	eb1dae05-cb14-4000-ba10-260f9cd79124	6f38efdf-87e4-4bcc-abe3-edd96e35463b	0.02	kg	2026-08-13 11:42:32.89
25d422eb-afc1-47d6-9f3d-3d6d1ad9799a	eb1dae05-cb14-4000-ba10-260f9cd79124	464f026e-362e-42ae-ac8f-3fcf1ae46a1f	0.01	kg	2026-08-13 11:42:32.9
f14b6412-b7d1-4a9f-aa8b-8456a59a1766	eb1dae05-cb14-4000-ba10-260f9cd79124	faa01933-f0e3-40f2-8f3e-8bc10f676542	1	butir	2026-08-13 11:42:32.906
e5d91d4e-eede-4a59-996f-1c54c6e5ffd1	d52c0006-3bcd-48c7-ab83-082061dc6764	cea77dc3-c9c2-4b61-b0d7-5437dadb0430	0.03	liter	2026-08-13 11:42:32.91
c1cc96d0-f3b4-466c-b23d-8a34fb1f4d0f	d52c0006-3bcd-48c7-ab83-082061dc6764	6f38efdf-87e4-4bcc-abe3-edd96e35463b	0.02	kg	2026-08-13 11:42:32.914
cdba47a7-ab0d-43fa-96ac-50bb93317017	d52c0006-3bcd-48c7-ab83-082061dc6764	464f026e-362e-42ae-ac8f-3fcf1ae46a1f	0.01	kg	2026-08-13 11:42:32.917
7658ac75-b92c-40cb-9d16-381f4aacb54d	625d086d-e1db-42f3-9cd5-84006fb429c1	6afcb439-bf35-46bc-95ef-f0ea936aa764	0.2	kg	2026-08-13 11:42:32.923
f64d8355-f52b-4504-90ad-c96ce8a18f29	625d086d-e1db-42f3-9cd5-84006fb429c1	46ca622f-e30a-40f7-869a-1dd780140e1d	0.02	liter	2026-08-13 11:42:32.927
6cece472-9660-433a-a4a8-1a93225b65c9	10b0cc63-2c10-44ef-bf34-8d19b7fda2bb	6afcb439-bf35-46bc-95ef-f0ea936aa764	0.15	kg	2026-08-13 11:42:32.93
66b428a4-47fd-4b66-9cee-69c4a6b0ace0	10b0cc63-2c10-44ef-bf34-8d19b7fda2bb	46ca622f-e30a-40f7-869a-1dd780140e1d	0.02	liter	2026-08-13 11:42:32.935
2d90482b-264d-495c-a1c8-42b83f60e858	5ba65aef-1f61-4c68-b8c1-d847553c8aef	df13e8ef-df5c-4894-b79a-01bcaf5ccca1	0.15	kg	2026-08-13 11:42:32.94
1d706f84-036b-4d63-81e9-ec419de566dd	5ba65aef-1f61-4c68-b8c1-d847553c8aef	81f1f09f-db38-4239-b9f8-7c6752a15749	0.02	kg	2026-08-13 11:42:32.945
0897abab-4c13-4af8-a1cf-1297ee364ceb	cbc78f47-cb0d-4d34-80e1-841ec7b0e5de	6afcb439-bf35-46bc-95ef-f0ea936aa764	0.1	kg	2026-08-13 11:42:32.949
da9d6386-e8f1-4d6b-81a0-4bfca411244f	cbc78f47-cb0d-4d34-80e1-841ec7b0e5de	f32c1122-defd-4ead-b1ae-64c750dbad42	0.1	pack	2026-08-13 11:42:32.952
66788991-09b8-47d1-a5a0-01ae45044b22	b429cd3c-c501-4b4a-b028-9ab5feedc41e	68162715-4a53-48cc-8910-2077cc7a1221	0.15	kg	2026-08-13 11:42:32.956
5715ef1f-b4b8-4d61-8717-ba789a1414a7	b429cd3c-c501-4b4a-b028-9ab5feedc41e	cea77dc3-c9c2-4b61-b0d7-5437dadb0430	0.05	liter	2026-08-13 11:42:32.959
3dc30fd7-6d25-4cdc-ac2a-c2094db63290	b6a4c689-bce0-4d87-883b-b0de919eba27	df13e8ef-df5c-4894-b79a-01bcaf5ccca1	0.1	kg	2026-08-13 11:42:32.962
2aa915b4-c9c8-471c-91e4-d6c9cce414d8	b6a4c689-bce0-4d87-883b-b0de919eba27	ff2ea0ab-11e3-433b-9086-1d9ac0522dac	0.03	kg	2026-08-13 11:42:32.964
6d545f49-7764-4161-a960-1b182da7d61e	f731a039-1a1f-413d-826c-0955bb9eea80	54337855-e516-4545-8634-8e8301ce40a4	0.1	kg	2026-08-13 11:42:32.967
f6fd4206-e07b-4d4c-8402-8b3d4ecbac27	30ef5deb-6b46-47d1-a98c-8bc060d62b44	f9da65d6-61e4-4f61-a1bc-28c7adb80a8c	0.1	kg	2026-08-13 11:42:32.97
531d68ee-f85c-4a8c-815c-ec5d041750b5	30ef5deb-6b46-47d1-a98c-8bc060d62b44	db96d053-6856-4187-b7df-a67eae42bd34	0.03	liter	2026-08-13 11:42:32.973
4d799224-20a2-4c35-a6f2-f0ea82ac73af	bcff5008-981c-428b-b652-31d8c1378d9f	04e3db48-f226-4604-8ae0-5d975fd8f61d	0.08	kg	2026-08-13 11:42:32.977
96da5186-6a46-477c-968a-c937039601b8	bcff5008-981c-428b-b652-31d8c1378d9f	91f1f579-a3b6-4d20-8893-762eb2b0fe2b	0.01	kg	2026-08-13 11:42:32.98
b1d73c09-cb2e-4477-ba93-ed65eb9824ec	d809adca-e256-41bc-b7b0-75df0d3f5dcb	04e3db48-f226-4604-8ae0-5d975fd8f61d	0.08	kg	2026-08-13 11:42:32.983
e9475319-ba4f-493d-ac7a-7b2fef39170f	d809adca-e256-41bc-b7b0-75df0d3f5dcb	91f1f579-a3b6-4d20-8893-762eb2b0fe2b	0.01	kg	2026-08-13 11:42:32.986
11c4c8f0-b657-498e-ae51-4883c017b1a8	d809adca-e256-41bc-b7b0-75df0d3f5dcb	d8bca5b1-a59f-441b-809d-e2b83f746df1	0.01	kg	2026-08-13 11:42:32.989
d8e591ff-ffb2-47fb-9ae5-d05688839085	3aac02bc-fcc6-4532-9a50-fa50790dd4cb	5687cf78-f754-4275-bab8-16ee5481c71e	0.05	kg	2026-08-13 11:42:32.992
4e54409a-8c74-4027-b430-0544377bc0d4	a02247ba-a10e-4387-967d-e69a05c8193a	00ff959f-d32f-462a-a8a8-efafb19f0531	0.02	kg	2026-08-13 11:42:32.995
f0490495-a398-49d1-9a57-d018e4c3a6df	c9ed90c7-689a-46ab-9fd2-84d017c264af	cba90769-31ac-43d0-9a09-d8525cdd5b88	0.1	sisir	2026-08-13 11:42:32.997
8669d1c6-9193-4eb1-8325-a4cbb1211ba0	ce6673bb-c51b-4a4f-ab3d-810e44601734	00ff959f-d32f-462a-a8a8-efafb19f0531	0.03	kg	2026-08-13 11:42:33
0b8b926d-f776-40e9-ae3a-bf122f82c5a9	228cd2ca-0ce1-44ff-92d8-05b7c9480e55	a795718b-1423-4c00-8414-39ff3ddbe973	0.05	kg	2026-08-13 11:42:33.002
2157251c-f0ca-4b56-91a8-4b435b54bba1	12b460b3-749d-4ab1-80de-d8f51d5188cc	582c651b-6f49-4746-b27f-7dc522decd06	0.05	kg	2026-08-13 11:42:33.005
c502d9c9-7c29-4848-9439-77baa716f622	81d6f3b5-b26a-4dd0-bfca-fea91a42a296	e77967a9-26a2-40f1-ade4-e72961875f52	0.005	kg	2026-08-13 11:42:33.008
0b5bebaf-a052-42c2-99f6-513c020db6b1	01d338fc-cbda-492d-b496-2a55e100d813	7c35ba89-54b7-4787-b8f8-d9f5888bb2c9	0.005	liter	2026-08-13 11:42:33.011
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role_permissions (id, role_id, permission_id, created_at) FROM stdin;
97c5a873-a948-4d2d-bb74-35383d870f79	00000000-0000-0000-0000-000000000001	12a24584-eae9-4d7a-99a1-b7a349090ec2	2026-08-13 09:25:15.761
afd312e1-c5ca-4f82-9a30-c6aa1286dc98	00000000-0000-0000-0000-000000000001	e90c3390-6420-482b-a033-9debcc90a2a8	2026-08-13 09:25:15.765
9ba83137-f8a7-437c-8ce5-f54797972ba4	00000000-0000-0000-0000-000000000001	0e9f179f-7dff-4c44-8451-08563aa5277e	2026-08-13 09:25:15.768
271453b6-1a64-40da-9309-adf1ca2eee8c	00000000-0000-0000-0000-000000000001	f3afcc57-4fa1-45b6-817c-0eaff54b951b	2026-08-13 09:25:15.771
0c4f2ce1-b4f2-4c36-ac15-c2b045c65229	00000000-0000-0000-0000-000000000001	e4fcbdb0-f8b7-41fb-a33e-743f42bab568	2026-08-13 09:25:15.774
d80822a0-27ec-496a-b6d4-183a2692e8b8	00000000-0000-0000-0000-000000000001	95bfd6db-1d84-4228-a8e2-39080bee4a4b	2026-08-13 09:25:15.777
33d05aeb-b95a-4dfe-8ddf-94146711dd62	00000000-0000-0000-0000-000000000001	05a1157d-b712-4990-9d57-f85949c3f0a7	2026-08-13 09:25:15.78
f0cd432b-4ffe-4a0e-b7d4-1552136625e7	00000000-0000-0000-0000-000000000001	9de3857e-a5d1-4692-9c06-38214180b78c	2026-08-13 09:25:15.783
cbb59b15-24f6-4d3c-8fae-01a7492826c1	00000000-0000-0000-0000-000000000001	5e2b08da-743c-4198-bea0-d748d8811e26	2026-08-13 09:25:15.785
c877acc3-ce5c-4ec3-82ab-67c4684afe3b	00000000-0000-0000-0000-000000000001	848e6235-2d68-475a-a394-eae64540d654	2026-08-13 09:25:15.788
7fddd067-7497-49f1-ba40-58a369cb57c9	00000000-0000-0000-0000-000000000001	e58d0168-8a9d-440a-8da2-88b308b36be2	2026-08-13 09:25:15.79
ebe59514-bd9e-4fde-8318-105f3f299fcf	00000000-0000-0000-0000-000000000001	6bb7e530-3a92-4641-b865-1e3f67bcfd6f	2026-08-13 09:25:15.793
7d808ab8-02e4-472f-977b-4951f5b2a809	00000000-0000-0000-0000-000000000001	963a1fbb-e5e7-4a35-ad31-8c328378d7c0	2026-08-13 09:25:15.795
b18a046f-c1ad-46cb-b663-12ca257b28a9	00000000-0000-0000-0000-000000000001	433d1a5b-5f32-4525-9646-476ed3915add	2026-08-13 09:25:15.798
cf92d017-248a-422e-bd99-57b8afd9f05e	00000000-0000-0000-0000-000000000001	9bc5fe41-b57b-4186-9801-717fbc2395d4	2026-08-13 09:25:15.8
1bcf8725-8fa7-45a8-9b7f-d6b72c61486a	00000000-0000-0000-0000-000000000001	f7811638-af29-45d0-9b27-68d187a2240d	2026-08-13 09:25:15.803
1321b082-d45c-4cfc-83bb-d9505dc7149f	00000000-0000-0000-0000-000000000001	4ddbf15f-a944-4a27-ae52-a19b63c49413	2026-08-13 09:25:15.805
63eb6377-2c21-4247-83d6-91d4f522a08e	00000000-0000-0000-0000-000000000001	e7738b96-deeb-4922-8285-614e5c53cfb4	2026-08-13 09:25:15.808
43608132-e242-4d0d-957b-277c554686c3	00000000-0000-0000-0000-000000000001	2c03b7a8-7fe2-4c72-b3a4-c43c39b6ba3e	2026-08-13 09:25:15.811
f43ce3c8-00a5-42f8-8f2f-a12abb634f4a	00000000-0000-0000-0000-000000000001	f6e613f3-680a-46f8-8c72-cdbec1269803	2026-08-13 09:25:15.815
43c1f8e0-8dd2-4995-8dc2-fe5c1cd801d5	00000000-0000-0000-0000-000000000001	9af3b378-b7a0-48c4-bd15-6b73e4aaeec3	2026-08-13 09:25:15.818
b252f028-81af-4436-b2cf-adcf216bfd5b	00000000-0000-0000-0000-000000000001	50ddd8fb-3923-43d4-bcae-68801cc1c52c	2026-08-13 09:25:15.823
9f48a149-9aa7-481d-8692-d336660cb75e	00000000-0000-0000-0000-000000000001	c2aa2900-7b05-4b24-a881-13a99b3d6ebf	2026-08-13 09:25:15.825
5975e0df-9808-4751-a3f9-7eb4a4e6e4ee	00000000-0000-0000-0000-000000000001	64e10f76-ebd7-470a-870f-df3d0b1ce86c	2026-08-13 09:25:15.831
320a3ce6-390d-4c07-87d2-6dab5451ca87	00000000-0000-0000-0000-000000000001	fdbf0166-9063-4f89-8079-44695ed71fff	2026-08-13 09:25:15.833
38082382-df53-4767-9f59-55a7cf42a7de	00000000-0000-0000-0000-000000000001	2e8dceae-6cb9-47eb-97db-26baeb8702bd	2026-08-13 09:25:15.835
6868934b-423d-4a28-9a5f-99a22aac6df2	00000000-0000-0000-0000-000000000001	1fb456d5-9e97-451a-b060-572ffef8039c	2026-08-13 09:25:15.837
06834b05-806a-406b-83e0-fc6f7ef6b083	00000000-0000-0000-0000-000000000001	70722727-39ff-4280-8fb3-5da1ab704047	2026-08-13 09:25:15.839
fb18044b-ad3a-4d43-bf07-a0d4b09b5223	00000000-0000-0000-0000-000000000001	77fec580-5974-4cfd-85c5-445f69f0ea08	2026-08-13 09:25:15.841
5b85d218-146e-4872-80a7-e416547ea9ee	00000000-0000-0000-0000-000000000001	b8b144f6-85fe-4372-a17d-4cd68c62e33b	2026-08-13 09:25:15.842
59288c77-c935-4a2c-8552-7b0e537eaf34	00000000-0000-0000-0000-000000000001	b9b67b6d-4e16-4776-a668-ddf2c86f919c	2026-08-13 09:25:15.845
dbf6734a-85c9-4bc1-a6a3-39f5d1d8dcc5	00000000-0000-0000-0000-000000000001	c3bfc851-5f3f-49d2-8471-0d7b935b195b	2026-08-13 09:25:15.847
00f0e031-e844-42b6-a1f0-f2817d53d1f6	00000000-0000-0000-0000-000000000001	cd7d5ba7-9f02-44b5-8bb4-867196e85161	2026-08-13 09:25:15.849
0df7d97a-f90e-45d8-ac6f-63d69242fab6	00000000-0000-0000-0000-000000000001	62869e60-6051-4eda-b52a-76e130c05f30	2026-08-13 09:25:15.852
9ec95474-b469-4994-b042-336f3016c6fa	00000000-0000-0000-0000-000000000001	d4fa958e-bd63-48b9-a383-63c70d8fc1a1	2026-08-13 09:25:15.854
4cdabb52-5bd7-4570-83c6-7e7122087e50	00000000-0000-0000-0000-000000000001	401ee1c4-b671-4406-a6a9-e601f1c93756	2026-08-13 09:25:15.856
e7e51008-6100-4918-9550-c293b6aa604e	00000000-0000-0000-0000-000000000001	fab0f100-b582-4929-9ea5-a6f2d88e4c12	2026-08-13 09:25:15.858
dff73146-79d4-438f-9ac2-6419d26b9915	00000000-0000-0000-0000-000000000001	0cd2aaf2-92cb-4172-9511-bea19f52944e	2026-08-13 09:25:15.86
d0698d1e-e91c-4c76-870a-c3c0afd2d80f	00000000-0000-0000-0000-000000000001	dc485b72-929f-4030-9dd2-be194304f6e9	2026-08-13 09:25:15.862
73e2bbbc-249c-4ebf-8806-af8fafd2f30e	00000000-0000-0000-0000-000000000001	f19d567c-81aa-4fbd-81f0-8e8e83a7d2e4	2026-08-13 09:25:15.864
f2af76e7-c429-4829-948f-a7275627ec13	00000000-0000-0000-0000-000000000001	188a7c96-fe48-4eae-b3a5-1ab962b4640d	2026-08-13 09:25:15.866
95a2f10e-c8ff-425b-8c22-4d7eb40e3394	00000000-0000-0000-0000-000000000001	7b10b3d2-d7ed-4e85-9e14-3abba7714224	2026-08-13 09:25:15.868
f4712108-e41b-4104-94de-95e5323d1727	00000000-0000-0000-0000-000000000001	98d39df1-378e-4805-bf0c-0a4e2b23480e	2026-08-13 09:25:15.87
d4ac0250-2856-403e-958e-a04e8360ed86	00000000-0000-0000-0000-000000000001	289937fc-756d-4f72-ab38-2b0925c7fb83	2026-08-13 09:25:15.872
f0a1788b-332d-42f2-8c30-431eb57a0c6a	00000000-0000-0000-0000-000000000001	b26cb05e-4d17-4186-8bd5-945b56b6a324	2026-08-13 09:25:15.874
d9c7b2a1-af33-4125-b4ef-20c4440aa92d	00000000-0000-0000-0000-000000000001	89cf85f8-df01-4a00-8a58-75bf79c89488	2026-08-13 09:25:15.875
310ea465-8f6c-450f-a234-65bb7fff93a8	00000000-0000-0000-0000-000000000001	07cdd0ad-b654-4f4a-bbb0-8e736b79ce8c	2026-08-13 09:25:15.878
6be82cdd-9ba5-40be-bffa-d1743d06be18	00000000-0000-0000-0000-000000000001	a904cdcd-77c5-42fb-ab00-0bb4dc8acecc	2026-08-13 09:25:15.88
3c53375e-0fbd-4159-86fb-cd26518d4b0d	00000000-0000-0000-0000-000000000001	9bf2be57-6c58-4822-9cb4-5209a6164777	2026-08-13 09:25:15.882
421127a2-279e-4533-98eb-07bf9f77929f	00000000-0000-0000-0000-000000000001	19719a4c-07fb-4230-98b7-e84de988ce12	2026-08-13 09:25:15.884
32ee5c10-d613-4e25-8784-6e8e2ec65ab0	00000000-0000-0000-0000-000000000001	3c638c70-22de-4d5c-993e-9903e546b1c4	2026-08-13 09:25:15.886
89fa263f-525b-470e-9948-a3d0285b14b6	00000000-0000-0000-0000-000000000001	42bc2f75-2be1-4ddd-b27c-c5f63fcdf652	2026-08-13 09:25:15.887
f045d54d-c635-4059-8554-bf0045a7a4cb	00000000-0000-0000-0000-000000000001	339fc51a-00bc-4a1a-a853-ec5cbee02fa1	2026-08-13 09:25:15.889
ddd339cb-4972-46a5-9b8c-df1c6e2dafb3	00000000-0000-0000-0000-000000000001	dcbe4953-338b-4448-9089-b44d2b2071a3	2026-08-13 09:25:15.891
d0495708-6eec-4c57-9227-0d93e22ab71c	00000000-0000-0000-0000-000000000001	789020d2-9cb8-4303-8ae2-8c3f992f5b31	2026-08-13 09:25:15.892
b57e1747-2024-4477-9b73-48a17900dd42	00000000-0000-0000-0000-000000000001	94667e20-6a81-4bb8-8033-ec964dcfdc2b	2026-08-13 09:25:15.894
acc0968f-5e69-445c-99a7-630a9a078da8	00000000-0000-0000-0000-000000000001	a61a9cbc-0608-45aa-b665-c108beb7ca8a	2026-08-13 09:25:15.896
d90711db-67c2-4630-bd9a-273bd1f0fc2c	00000000-0000-0000-0000-000000000001	864651ba-9dd7-4b14-9eba-ef5a2434a6ec	2026-08-13 09:25:15.898
8e7274a0-22e0-4329-abed-59a478994de0	00000000-0000-0000-0000-000000000001	7072bc02-31b5-4442-a5e2-93ca1f469f25	2026-08-13 09:25:15.901
516443ba-a167-4dff-8652-6ea6c015be81	00000000-0000-0000-0000-000000000001	23563f6e-87ad-4d6e-960e-e27bb20ae43d	2026-08-13 09:25:15.902
792124fb-afa7-4bcd-b30c-41f043234ebf	00000000-0000-0000-0000-000000000001	5f12d1e5-2009-4cfc-924d-350b5529c6a8	2026-08-13 09:25:15.904
4e50cec7-06e7-4044-9528-329341dea92b	00000000-0000-0000-0000-000000000001	eed33497-9481-4785-9613-92e864b0c990	2026-08-13 09:25:15.906
caca31b5-a809-4170-9a89-24e1dd45e84f	00000000-0000-0000-0000-000000000001	2e59bf2f-dfcb-4136-bf0c-ee4e582472da	2026-08-13 09:25:15.908
fdbfbbe7-95e7-4fa6-a46b-67b84aff3ff7	00000000-0000-0000-0000-000000000001	dac5c2d5-a6ab-4750-846f-f271d8e781c5	2026-08-13 09:25:15.909
2628af2c-9752-46b8-8633-f1904cb291ef	00000000-0000-0000-0000-000000000001	4c6beaf8-8d38-43d5-ad26-ae74195f0c06	2026-08-13 09:25:15.911
4f241765-022b-42eb-879e-360b7e587a5d	00000000-0000-0000-0000-000000000001	1f78f694-aded-439a-a223-6c73faf41394	2026-08-13 09:25:15.913
c91f7fc1-d07a-416d-8cb6-3f31666bcf20	00000000-0000-0000-0000-000000000001	81a0ffb7-9eee-4ed5-8ddd-24a1ef7e6db1	2026-08-13 09:25:15.916
aa2fef07-995d-4e91-9a80-4d4718e12747	00000000-0000-0000-0000-000000000001	51ce02dd-e7bf-491e-add0-c44ff2b40396	2026-08-13 09:25:15.918
e50fcaa3-2efb-4223-9656-4642c7aa2d9d	00000000-0000-0000-0000-000000000001	148cac39-640a-4c81-93c2-85e60aa8aa1f	2026-08-13 09:25:15.92
dcc42efd-86c4-46b4-9cbe-39ffbcc04b25	00000000-0000-0000-0000-000000000001	6cb59f47-009e-4af5-90dc-b24efd33d56e	2026-08-13 09:25:15.922
70f228ba-052a-4708-987c-c4ec555b472d	00000000-0000-0000-0000-000000000001	6bd3696e-94bb-4f22-abce-ec4ae0f17322	2026-08-13 09:25:15.923
7b5c5cee-58dd-47fd-ac3c-807b135e6a54	00000000-0000-0000-0000-000000000001	890e89ec-5369-4b16-8539-0954f7fe5f3a	2026-08-13 09:25:15.925
978160e0-a5a8-425d-9110-870b1714fa77	00000000-0000-0000-0000-000000000001	a64a066e-57ba-4e88-afb5-d3843e788526	2026-08-13 09:25:15.927
51036894-44e6-4641-be46-4186800b424e	00000000-0000-0000-0000-000000000001	fa92c8fb-69a2-467a-83cf-f619108742be	2026-08-13 09:25:15.929
2387a5e3-ef07-4e3d-977b-0129b7dd3726	00000000-0000-0000-0000-000000000001	2f29cd87-5129-4223-97b5-e66aac00e4f7	2026-08-13 09:25:15.931
9adfabda-4c2a-4e7d-8857-b05522b25f73	00000000-0000-0000-0000-000000000001	2687d0e5-6688-48eb-b3df-fa44d1f4397a	2026-08-13 09:25:15.933
56ada43f-c660-4cd9-ad96-6a9cb2b70072	00000000-0000-0000-0000-000000000001	87e6a9eb-66f4-40dc-94b0-edae7025ef13	2026-08-13 09:25:15.936
bbee601a-5f16-4e6a-b44e-7a85bb950a8e	00000000-0000-0000-0000-000000000001	66deed5f-2ba0-4a72-954d-d3d791976f3c	2026-08-13 09:25:15.938
bac00325-cad0-43f6-9016-2c611b534b10	00000000-0000-0000-0000-000000000001	8f9942e5-9a38-4924-81f7-104d00a803fc	2026-08-13 09:25:15.94
37f730c1-38a0-42cd-8fd5-7f855d8f472c	00000000-0000-0000-0000-000000000001	a62b2350-ffb0-4061-a80a-5b24b284f3a6	2026-08-13 09:25:15.943
94feaad0-79bd-48a1-83ba-662327bf20b2	00000000-0000-0000-0000-000000000001	e89567b6-0a2a-4263-b5c3-4efbdac3bf23	2026-08-13 09:25:15.945
62c07a49-0011-4d44-b527-f0c4d5efbfad	00000000-0000-0000-0000-000000000001	f88894eb-9c40-4ba3-b9bd-fe77e2169cef	2026-08-13 09:25:15.948
97904a41-ffe5-44e2-8e14-99a502535fd9	00000000-0000-0000-0000-000000000001	ea8daa67-6c9d-40a9-878b-74480a82877f	2026-08-13 09:25:15.95
46ad6761-6141-4b85-9356-ed7af4841d2d	00000000-0000-0000-0000-000000000001	9488c3d7-03f7-4aca-9be5-cefc0b3d9ce3	2026-08-13 09:25:15.952
ed616bc8-441f-486f-ab76-c9ead198bfa0	00000000-0000-0000-0000-000000000001	5e29e782-ef7e-451d-b3fa-f97dc4056f6c	2026-08-13 09:25:15.955
9e305ed6-170c-4f06-a409-81837aac597c	00000000-0000-0000-0000-000000000001	29907e75-47a6-4333-a4dc-522496a1fb8d	2026-08-13 09:25:15.957
3ad10167-0359-47a4-a16c-f28df8fe1316	00000000-0000-0000-0000-000000000001	da739f76-e3f2-4e1b-bd02-bb543a083f5e	2026-08-13 09:25:15.958
0d60c3ab-aeda-4d37-a94c-01abc6a21180	00000000-0000-0000-0000-000000000001	dac4cd94-d552-447a-8fe0-45692c3040d8	2026-08-13 09:25:15.96
49beab43-d4ae-4319-8cfd-1da79788d6bb	95b7fa32-df60-4e32-b831-7a0db95467ff	12a24584-eae9-4d7a-99a1-b7a349090ec2	2026-08-13 09:25:15.962
ff2d7e8a-89bf-448e-8c6b-12df6a6443e3	95b7fa32-df60-4e32-b831-7a0db95467ff	e90c3390-6420-482b-a033-9debcc90a2a8	2026-08-13 09:25:15.964
4223fd41-5135-4771-88e0-c17713329b0c	95b7fa32-df60-4e32-b831-7a0db95467ff	0e9f179f-7dff-4c44-8451-08563aa5277e	2026-08-13 09:25:15.966
ef820372-5954-4ec4-ae92-af66dba359c4	95b7fa32-df60-4e32-b831-7a0db95467ff	f3afcc57-4fa1-45b6-817c-0eaff54b951b	2026-08-13 09:25:15.968
cc9f1ef9-c6dd-4a9d-9210-824be43c258c	95b7fa32-df60-4e32-b831-7a0db95467ff	e4fcbdb0-f8b7-41fb-a33e-743f42bab568	2026-08-13 09:25:15.97
6d3267dc-aa82-45b4-b23d-e834acf9f440	95b7fa32-df60-4e32-b831-7a0db95467ff	95bfd6db-1d84-4228-a8e2-39080bee4a4b	2026-08-13 09:25:15.972
1369846b-83b7-4a49-9dea-64d31822a82c	95b7fa32-df60-4e32-b831-7a0db95467ff	05a1157d-b712-4990-9d57-f85949c3f0a7	2026-08-13 09:25:15.973
165174ee-c2e4-4abc-9018-b1a4d66b8fad	95b7fa32-df60-4e32-b831-7a0db95467ff	9de3857e-a5d1-4692-9c06-38214180b78c	2026-08-13 09:25:15.975
66dd30b6-7d0d-46e1-a1da-414cdd98fa84	95b7fa32-df60-4e32-b831-7a0db95467ff	5e2b08da-743c-4198-bea0-d748d8811e26	2026-08-13 09:25:15.977
cf392cb3-fba2-4cf7-b060-61310415cda0	95b7fa32-df60-4e32-b831-7a0db95467ff	848e6235-2d68-475a-a394-eae64540d654	2026-08-13 09:25:15.979
6452256f-6743-49b7-b865-2ff932155c13	95b7fa32-df60-4e32-b831-7a0db95467ff	e58d0168-8a9d-440a-8da2-88b308b36be2	2026-08-13 09:25:15.981
78785e23-3081-40fd-a3af-3e7526d8a76a	95b7fa32-df60-4e32-b831-7a0db95467ff	6bb7e530-3a92-4641-b865-1e3f67bcfd6f	2026-08-13 09:25:15.983
c25bec04-865e-44c8-8aa8-8a2878304370	95b7fa32-df60-4e32-b831-7a0db95467ff	963a1fbb-e5e7-4a35-ad31-8c328378d7c0	2026-08-13 09:25:15.986
11406134-e23a-4971-9f90-284b80bac436	95b7fa32-df60-4e32-b831-7a0db95467ff	433d1a5b-5f32-4525-9646-476ed3915add	2026-08-13 09:25:15.988
d4dd8a5c-0534-413e-a10d-937a08b6c5cb	95b7fa32-df60-4e32-b831-7a0db95467ff	9bc5fe41-b57b-4186-9801-717fbc2395d4	2026-08-13 09:25:15.99
e70a6767-cb47-4864-a42f-337ac164e19c	95b7fa32-df60-4e32-b831-7a0db95467ff	f7811638-af29-45d0-9b27-68d187a2240d	2026-08-13 09:25:15.991
8a4be255-9542-4ee1-a2e5-b8119251abc0	95b7fa32-df60-4e32-b831-7a0db95467ff	4ddbf15f-a944-4a27-ae52-a19b63c49413	2026-08-13 09:25:15.994
d474eaad-443f-4e81-a23e-1771d4a393b8	95b7fa32-df60-4e32-b831-7a0db95467ff	e7738b96-deeb-4922-8285-614e5c53cfb4	2026-08-13 09:25:15.996
b758f8af-7fc7-4f73-8e2e-4f6c374cf0ee	95b7fa32-df60-4e32-b831-7a0db95467ff	2c03b7a8-7fe2-4c72-b3a4-c43c39b6ba3e	2026-08-13 09:25:15.998
60481091-d169-49e7-8054-ba44414a8970	95b7fa32-df60-4e32-b831-7a0db95467ff	f6e613f3-680a-46f8-8c72-cdbec1269803	2026-08-13 09:25:16
8357e0e4-222d-4d23-8b3f-e98daf74502f	95b7fa32-df60-4e32-b831-7a0db95467ff	9af3b378-b7a0-48c4-bd15-6b73e4aaeec3	2026-08-13 09:25:16.003
c8729ad5-8555-40e1-8ca2-3d8c4f1a8a74	95b7fa32-df60-4e32-b831-7a0db95467ff	50ddd8fb-3923-43d4-bcae-68801cc1c52c	2026-08-13 09:25:16.006
60d1b7d9-217f-4004-a1c9-a1e31700616b	95b7fa32-df60-4e32-b831-7a0db95467ff	c2aa2900-7b05-4b24-a881-13a99b3d6ebf	2026-08-13 09:25:16.008
8e2b53f2-a059-472f-8b53-a54202d7a02a	95b7fa32-df60-4e32-b831-7a0db95467ff	64e10f76-ebd7-470a-870f-df3d0b1ce86c	2026-08-13 09:25:16.01
07df0e83-25d5-4386-ae0e-47e56ea0e947	95b7fa32-df60-4e32-b831-7a0db95467ff	fdbf0166-9063-4f89-8079-44695ed71fff	2026-08-13 09:25:16.013
d438f6da-16eb-4481-8071-4a8eaaa28dca	95b7fa32-df60-4e32-b831-7a0db95467ff	2e8dceae-6cb9-47eb-97db-26baeb8702bd	2026-08-13 09:25:16.015
3be20fc9-7c4b-4843-86b2-cdeaf6ca49ba	95b7fa32-df60-4e32-b831-7a0db95467ff	1fb456d5-9e97-451a-b060-572ffef8039c	2026-08-13 09:25:16.017
e8dab5c9-d61d-4cce-9635-c6d74b11ab12	95b7fa32-df60-4e32-b831-7a0db95467ff	70722727-39ff-4280-8fb3-5da1ab704047	2026-08-13 09:25:16.019
de210eb7-228b-4e84-8787-ba5bac1a50f6	95b7fa32-df60-4e32-b831-7a0db95467ff	77fec580-5974-4cfd-85c5-445f69f0ea08	2026-08-13 09:25:16.021
4ec8316b-476c-4934-bcee-49ebaca069bc	95b7fa32-df60-4e32-b831-7a0db95467ff	b8b144f6-85fe-4372-a17d-4cd68c62e33b	2026-08-13 09:25:16.023
fae20d74-e793-4007-9d80-4834ec145c50	95b7fa32-df60-4e32-b831-7a0db95467ff	b9b67b6d-4e16-4776-a668-ddf2c86f919c	2026-08-13 09:25:16.024
ea9add86-7df4-40d5-bb54-1ba9cf993894	95b7fa32-df60-4e32-b831-7a0db95467ff	c3bfc851-5f3f-49d2-8471-0d7b935b195b	2026-08-13 09:25:16.026
8335546d-c10d-4cba-b9ae-8b79fd93c421	95b7fa32-df60-4e32-b831-7a0db95467ff	cd7d5ba7-9f02-44b5-8bb4-867196e85161	2026-08-13 09:25:16.029
3f8b77ab-1691-4ab5-a951-b1805c144c98	95b7fa32-df60-4e32-b831-7a0db95467ff	62869e60-6051-4eda-b52a-76e130c05f30	2026-08-13 09:25:16.031
df0c1ed1-c1bd-4444-a9d5-bafe3ec08870	95b7fa32-df60-4e32-b831-7a0db95467ff	d4fa958e-bd63-48b9-a383-63c70d8fc1a1	2026-08-13 09:25:16.033
ad039f4a-ba20-4113-9d92-06b2a68ff76b	95b7fa32-df60-4e32-b831-7a0db95467ff	401ee1c4-b671-4406-a6a9-e601f1c93756	2026-08-13 09:25:16.035
bbd957f2-4df7-40f9-887d-22d9813f6339	95b7fa32-df60-4e32-b831-7a0db95467ff	fab0f100-b582-4929-9ea5-a6f2d88e4c12	2026-08-13 09:25:16.038
d7857dca-6418-4962-8f72-b7237fbe9d82	95b7fa32-df60-4e32-b831-7a0db95467ff	0cd2aaf2-92cb-4172-9511-bea19f52944e	2026-08-13 09:25:16.04
11671546-9107-478d-b39e-d176fa8faa32	95b7fa32-df60-4e32-b831-7a0db95467ff	dc485b72-929f-4030-9dd2-be194304f6e9	2026-08-13 09:25:16.042
a07b9ccd-d968-4c8a-9f2f-086d0408a24c	95b7fa32-df60-4e32-b831-7a0db95467ff	f19d567c-81aa-4fbd-81f0-8e8e83a7d2e4	2026-08-13 09:25:16.045
261addef-79bf-4564-980c-de864204d181	95b7fa32-df60-4e32-b831-7a0db95467ff	188a7c96-fe48-4eae-b3a5-1ab962b4640d	2026-08-13 09:25:16.047
08370a02-b947-4220-8731-2d0801c09852	95b7fa32-df60-4e32-b831-7a0db95467ff	7b10b3d2-d7ed-4e85-9e14-3abba7714224	2026-08-13 09:25:16.05
026ffd85-688b-4a37-895b-18179e83faa6	95b7fa32-df60-4e32-b831-7a0db95467ff	98d39df1-378e-4805-bf0c-0a4e2b23480e	2026-08-13 09:25:16.053
9d75ef32-65cc-47e0-bdba-32c6359e1661	95b7fa32-df60-4e32-b831-7a0db95467ff	289937fc-756d-4f72-ab38-2b0925c7fb83	2026-08-13 09:25:16.055
03bab152-ee94-463f-9eae-78abc3a65e24	95b7fa32-df60-4e32-b831-7a0db95467ff	b26cb05e-4d17-4186-8bd5-945b56b6a324	2026-08-13 09:25:16.057
bdee841f-cc38-4652-87d5-da713a8f9526	95b7fa32-df60-4e32-b831-7a0db95467ff	89cf85f8-df01-4a00-8a58-75bf79c89488	2026-08-13 09:25:16.06
a17aacf3-684a-4883-ad66-28616b3187ba	95b7fa32-df60-4e32-b831-7a0db95467ff	07cdd0ad-b654-4f4a-bbb0-8e736b79ce8c	2026-08-13 09:25:16.063
47125b5b-1d5e-4aef-8474-c1a446576e54	95b7fa32-df60-4e32-b831-7a0db95467ff	a904cdcd-77c5-42fb-ab00-0bb4dc8acecc	2026-08-13 09:25:16.065
0791cf06-c891-40c0-807f-fd24b0d83c9e	95b7fa32-df60-4e32-b831-7a0db95467ff	9bf2be57-6c58-4822-9cb4-5209a6164777	2026-08-13 09:25:16.068
8fb8a840-8d2f-4b8b-bffd-58baa2f9f06a	95b7fa32-df60-4e32-b831-7a0db95467ff	19719a4c-07fb-4230-98b7-e84de988ce12	2026-08-13 09:25:16.07
317ac5f0-863e-4bac-b6db-1a5b4134b96c	95b7fa32-df60-4e32-b831-7a0db95467ff	3c638c70-22de-4d5c-993e-9903e546b1c4	2026-08-13 09:25:16.073
db7cd6e0-2db0-44da-b93e-83a494839fa6	95b7fa32-df60-4e32-b831-7a0db95467ff	42bc2f75-2be1-4ddd-b27c-c5f63fcdf652	2026-08-13 09:25:16.075
02bf27e0-73be-40d7-be06-da69cca22fcc	95b7fa32-df60-4e32-b831-7a0db95467ff	339fc51a-00bc-4a1a-a853-ec5cbee02fa1	2026-08-13 09:25:16.078
954ecf7f-d046-4e3d-9e87-3a34b27619f8	95b7fa32-df60-4e32-b831-7a0db95467ff	dcbe4953-338b-4448-9089-b44d2b2071a3	2026-08-13 09:25:16.08
0b1616b8-cc38-46f6-b606-2969ab50c99c	95b7fa32-df60-4e32-b831-7a0db95467ff	789020d2-9cb8-4303-8ae2-8c3f992f5b31	2026-08-13 09:25:16.083
40018a9b-6d2e-4ccf-8e24-6b8da800af30	95b7fa32-df60-4e32-b831-7a0db95467ff	94667e20-6a81-4bb8-8033-ec964dcfdc2b	2026-08-13 09:25:16.085
192a895c-2c8f-47d0-9e1c-1cf946c2fc7d	95b7fa32-df60-4e32-b831-7a0db95467ff	a61a9cbc-0608-45aa-b665-c108beb7ca8a	2026-08-13 09:25:16.088
3a4a5a73-1ef0-409c-945e-378448dbefa0	95b7fa32-df60-4e32-b831-7a0db95467ff	864651ba-9dd7-4b14-9eba-ef5a2434a6ec	2026-08-13 09:25:16.09
75067a68-5e57-413f-a2e3-f1f21e25c6fc	95b7fa32-df60-4e32-b831-7a0db95467ff	7072bc02-31b5-4442-a5e2-93ca1f469f25	2026-08-13 09:25:16.092
67aa2655-2ed2-4969-a3a6-09164756104f	95b7fa32-df60-4e32-b831-7a0db95467ff	23563f6e-87ad-4d6e-960e-e27bb20ae43d	2026-08-13 09:25:16.095
e4819550-d054-4488-bbe2-51f48aedcc79	95b7fa32-df60-4e32-b831-7a0db95467ff	5f12d1e5-2009-4cfc-924d-350b5529c6a8	2026-08-13 09:25:16.097
fb869058-e1ac-45a5-929c-a5b978afca31	95b7fa32-df60-4e32-b831-7a0db95467ff	eed33497-9481-4785-9613-92e864b0c990	2026-08-13 09:25:16.099
70e598b4-58aa-48f5-83cb-0edf07584e28	95b7fa32-df60-4e32-b831-7a0db95467ff	2e59bf2f-dfcb-4136-bf0c-ee4e582472da	2026-08-13 09:25:16.102
86796972-ef0d-479e-9818-a65db2370440	95b7fa32-df60-4e32-b831-7a0db95467ff	dac5c2d5-a6ab-4750-846f-f271d8e781c5	2026-08-13 09:25:16.104
406dd029-7d7e-4641-b3d4-38319610b776	95b7fa32-df60-4e32-b831-7a0db95467ff	4c6beaf8-8d38-43d5-ad26-ae74195f0c06	2026-08-13 09:25:16.106
f0cd5c5a-2214-4cc9-b5c2-152dea8cb7f8	95b7fa32-df60-4e32-b831-7a0db95467ff	1f78f694-aded-439a-a223-6c73faf41394	2026-08-13 09:25:16.109
8b51128e-911a-4655-88af-19147ec03946	95b7fa32-df60-4e32-b831-7a0db95467ff	81a0ffb7-9eee-4ed5-8ddd-24a1ef7e6db1	2026-08-13 09:25:16.111
9fd4f11d-b9a4-4217-8a7d-5c903dee9a4e	95b7fa32-df60-4e32-b831-7a0db95467ff	51ce02dd-e7bf-491e-add0-c44ff2b40396	2026-08-13 09:25:16.114
a06ab2de-4809-431a-a1cf-5e81354f9cc9	95b7fa32-df60-4e32-b831-7a0db95467ff	148cac39-640a-4c81-93c2-85e60aa8aa1f	2026-08-13 09:25:16.116
b2d5a5e6-64b3-49f1-974a-e8b32a7667b8	95b7fa32-df60-4e32-b831-7a0db95467ff	6cb59f47-009e-4af5-90dc-b24efd33d56e	2026-08-13 09:25:16.119
4cf3f9cc-dd74-4327-862c-a0ff92e97291	95b7fa32-df60-4e32-b831-7a0db95467ff	6bd3696e-94bb-4f22-abce-ec4ae0f17322	2026-08-13 09:25:16.121
78964b2b-2be9-40e3-9697-a0db9ac59d7c	95b7fa32-df60-4e32-b831-7a0db95467ff	890e89ec-5369-4b16-8539-0954f7fe5f3a	2026-08-13 09:25:16.123
14c2c440-4d5b-48c7-87c8-b3a8398899ce	95b7fa32-df60-4e32-b831-7a0db95467ff	a64a066e-57ba-4e88-afb5-d3843e788526	2026-08-13 09:25:16.125
579d953b-1943-4dcc-a732-e1f338a94e47	95b7fa32-df60-4e32-b831-7a0db95467ff	fa92c8fb-69a2-467a-83cf-f619108742be	2026-08-13 09:25:16.128
e86e749a-94bf-4356-83f1-3d31cc79c4bc	95b7fa32-df60-4e32-b831-7a0db95467ff	2f29cd87-5129-4223-97b5-e66aac00e4f7	2026-08-13 09:25:16.131
fe369410-4171-4995-be6a-54075ff1ac9c	95b7fa32-df60-4e32-b831-7a0db95467ff	2687d0e5-6688-48eb-b3df-fa44d1f4397a	2026-08-13 09:25:16.133
d9f1082c-5a68-4b1d-a5fb-530055f92ddb	95b7fa32-df60-4e32-b831-7a0db95467ff	87e6a9eb-66f4-40dc-94b0-edae7025ef13	2026-08-13 09:25:16.136
f1bef329-3433-4b16-8a75-5d805bdcd200	95b7fa32-df60-4e32-b831-7a0db95467ff	66deed5f-2ba0-4a72-954d-d3d791976f3c	2026-08-13 09:25:16.139
d39d1d85-af0e-435f-ad03-e9d556b0785b	95b7fa32-df60-4e32-b831-7a0db95467ff	8f9942e5-9a38-4924-81f7-104d00a803fc	2026-08-13 09:25:16.141
d5847a47-30de-48d8-8be0-3b0ea8fea9d8	95b7fa32-df60-4e32-b831-7a0db95467ff	a62b2350-ffb0-4061-a80a-5b24b284f3a6	2026-08-13 09:25:16.144
1a9abfe9-7b62-49ea-bc1a-222045c3876c	95b7fa32-df60-4e32-b831-7a0db95467ff	e89567b6-0a2a-4263-b5c3-4efbdac3bf23	2026-08-13 09:25:16.146
628b3ad6-7534-4ad3-aa5e-eb15c55b606a	95b7fa32-df60-4e32-b831-7a0db95467ff	f88894eb-9c40-4ba3-b9bd-fe77e2169cef	2026-08-13 09:25:16.148
c3dfe1a0-bf46-46cb-a8d8-6e16ad709503	95b7fa32-df60-4e32-b831-7a0db95467ff	ea8daa67-6c9d-40a9-878b-74480a82877f	2026-08-13 09:25:16.151
d80384c8-30fe-456e-baad-a2867d95c9cb	95b7fa32-df60-4e32-b831-7a0db95467ff	9488c3d7-03f7-4aca-9be5-cefc0b3d9ce3	2026-08-13 09:25:16.153
20fb90f8-10f6-4a5c-b231-c1feba0d6487	95b7fa32-df60-4e32-b831-7a0db95467ff	5e29e782-ef7e-451d-b3fa-f97dc4056f6c	2026-08-13 09:25:16.156
50c521e8-a0de-46df-9875-75604cc3d3f1	95b7fa32-df60-4e32-b831-7a0db95467ff	29907e75-47a6-4333-a4dc-522496a1fb8d	2026-08-13 09:25:16.158
2221aadc-57a9-4464-a3b3-5de1a408a71c	95b7fa32-df60-4e32-b831-7a0db95467ff	da739f76-e3f2-4e1b-bd02-bb543a083f5e	2026-08-13 09:25:16.161
f2dcee96-d0e3-4b7a-80a9-7f27f0394619	95b7fa32-df60-4e32-b831-7a0db95467ff	dac4cd94-d552-447a-8fe0-45692c3040d8	2026-08-13 09:25:16.164
1c4c7115-ac91-4fbc-95fa-d4842400d386	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	12a24584-eae9-4d7a-99a1-b7a349090ec2	2026-08-13 09:25:16.166
2375ff2d-aa09-480e-82de-e2cea36758d1	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	e90c3390-6420-482b-a033-9debcc90a2a8	2026-08-13 09:25:16.169
d52b9f6f-2d4e-44ad-b6f9-f4deab19d78f	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	0e9f179f-7dff-4c44-8451-08563aa5277e	2026-08-13 09:25:16.171
251fbe40-0e22-4827-9480-dfe50e0dea0d	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	848e6235-2d68-475a-a394-eae64540d654	2026-08-13 09:25:16.174
a1ee889c-c305-4dd0-99bb-ea7f0822f3e1	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	e58d0168-8a9d-440a-8da2-88b308b36be2	2026-08-13 09:25:16.176
fe90c333-3c47-45bf-95fc-ee1ea108a814	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	6bb7e530-3a92-4641-b865-1e3f67bcfd6f	2026-08-13 09:25:16.179
a6400279-9d6d-4f44-8b24-4308d2c87fc7	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	963a1fbb-e5e7-4a35-ad31-8c328378d7c0	2026-08-13 09:25:16.181
3306fb7c-b91f-4e4f-a0dd-ba5b5242aed2	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	433d1a5b-5f32-4525-9646-476ed3915add	2026-08-13 09:25:16.183
71f09a13-81c9-451b-b027-888787d4c873	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	9bc5fe41-b57b-4186-9801-717fbc2395d4	2026-08-13 09:25:16.187
a87708f9-fb7c-4727-a2ff-111fd934a0a9	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	f7811638-af29-45d0-9b27-68d187a2240d	2026-08-13 09:25:16.189
04d1ced0-0cd0-4a85-93b8-b301e01f0eaa	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	4ddbf15f-a944-4a27-ae52-a19b63c49413	2026-08-13 09:25:16.191
c34e9e6f-33fd-4cc0-99da-386047e0b413	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	e7738b96-deeb-4922-8285-614e5c53cfb4	2026-08-13 09:25:16.194
a652e9d1-c6af-4c71-a544-ba3841128e52	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	9af3b378-b7a0-48c4-bd15-6b73e4aaeec3	2026-08-13 09:25:16.196
94f45bc5-8622-4a1d-a512-d7386e292fc9	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	50ddd8fb-3923-43d4-bcae-68801cc1c52c	2026-08-13 09:25:16.198
882c6930-9d79-47e6-bdf6-d15372d0b5a2	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	c2aa2900-7b05-4b24-a881-13a99b3d6ebf	2026-08-13 09:25:16.201
88077a22-4233-4094-9e77-3cdda4e0684d	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	64e10f76-ebd7-470a-870f-df3d0b1ce86c	2026-08-13 09:25:16.204
378cd49d-6d56-4335-97b4-d94efdff36bc	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	fdbf0166-9063-4f89-8079-44695ed71fff	2026-08-13 09:25:16.206
0f4ebd6f-1ad9-4d38-a0b0-5137598680e1	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	1fb456d5-9e97-451a-b060-572ffef8039c	2026-08-13 09:25:16.208
57a13de4-0ef6-4fe5-bd8c-f3bdf02b2c24	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	70722727-39ff-4280-8fb3-5da1ab704047	2026-08-13 09:25:16.211
965a58fb-8ac3-4f6d-88c7-c8c0c3eeebfa	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	77fec580-5974-4cfd-85c5-445f69f0ea08	2026-08-13 09:25:16.214
0640f14b-443d-41d2-9d71-e3fe4ede99b5	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	b8b144f6-85fe-4372-a17d-4cd68c62e33b	2026-08-13 09:25:16.216
75b795da-5d0f-4d96-8685-254d523a0a0e	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	b9b67b6d-4e16-4776-a668-ddf2c86f919c	2026-08-13 09:25:16.219
05ce3485-d4ca-4f7f-8b80-66815f4774ed	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	c3bfc851-5f3f-49d2-8471-0d7b935b195b	2026-08-13 09:25:16.221
84cc8bc1-49d1-4759-96f7-fff56e39436c	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	cd7d5ba7-9f02-44b5-8bb4-867196e85161	2026-08-13 09:25:16.223
c0b21fa9-3baf-4268-8414-5973d1b392f5	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	62869e60-6051-4eda-b52a-76e130c05f30	2026-08-13 09:25:16.225
1e70b761-c5b2-4c1c-9150-463fda689184	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	d4fa958e-bd63-48b9-a383-63c70d8fc1a1	2026-08-13 09:25:16.228
91b360be-c1b3-4fb0-823b-8b12a3daf993	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	401ee1c4-b671-4406-a6a9-e601f1c93756	2026-08-13 09:25:16.23
3f0fb68e-e2fc-4efc-866e-b842ad1dc7e9	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	fab0f100-b582-4929-9ea5-a6f2d88e4c12	2026-08-13 09:25:16.233
41004257-f06a-47cd-bd24-5e9838c7c910	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	0cd2aaf2-92cb-4172-9511-bea19f52944e	2026-08-13 09:25:16.236
0741098e-80be-446a-9271-6857525a739a	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	dc485b72-929f-4030-9dd2-be194304f6e9	2026-08-13 09:25:16.238
c7b7dcff-21c7-451a-9492-c4858cfb197e	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	f19d567c-81aa-4fbd-81f0-8e8e83a7d2e4	2026-08-13 09:25:16.241
46b43551-d308-4ec9-8ecc-179b16b3ed13	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	188a7c96-fe48-4eae-b3a5-1ab962b4640d	2026-08-13 09:25:16.244
c39d27bd-bd23-4622-b0b4-8edfb33d5b61	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	7b10b3d2-d7ed-4e85-9e14-3abba7714224	2026-08-13 09:25:16.247
42796ba1-3e36-460e-8be8-c862bea51002	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	98d39df1-378e-4805-bf0c-0a4e2b23480e	2026-08-13 09:25:16.25
3bf748cf-a402-46e8-b8f1-0192f28e989e	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	289937fc-756d-4f72-ab38-2b0925c7fb83	2026-08-13 09:25:16.253
cb856dc3-5e44-4332-aaa7-43691f96edb4	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	b26cb05e-4d17-4186-8bd5-945b56b6a324	2026-08-13 09:25:16.256
b3b8a638-dbaf-49a8-b0b3-ca6b056d00b1	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	89cf85f8-df01-4a00-8a58-75bf79c89488	2026-08-13 09:25:16.258
a0e55a23-8494-4e8d-9792-c8e3d59d04ad	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	07cdd0ad-b654-4f4a-bbb0-8e736b79ce8c	2026-08-13 09:25:16.26
317bd58c-3906-4c4b-a1f5-98af1176dae5	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	a904cdcd-77c5-42fb-ab00-0bb4dc8acecc	2026-08-13 09:25:16.263
c315ac40-910b-4730-ae39-bbdb5a0fc528	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	9bf2be57-6c58-4822-9cb4-5209a6164777	2026-08-13 09:25:16.266
cdcd0dc9-a651-4850-87cf-b18c61ceace8	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	19719a4c-07fb-4230-98b7-e84de988ce12	2026-08-13 09:25:16.269
ef16ecba-214d-43b6-8b57-00aa0274b412	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	3c638c70-22de-4d5c-993e-9903e546b1c4	2026-08-13 09:25:16.271
f1c147ae-f6de-4a93-8680-938a22c6602d	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	339fc51a-00bc-4a1a-a853-ec5cbee02fa1	2026-08-13 09:25:16.273
63a90afc-6d5f-4037-b6bf-b697465ddfb5	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	dcbe4953-338b-4448-9089-b44d2b2071a3	2026-08-13 09:25:16.275
de124e61-88fe-41f5-a63d-2c0dca8f1dc7	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	789020d2-9cb8-4303-8ae2-8c3f992f5b31	2026-08-13 09:25:16.277
a53ec5ab-c80d-428e-a3b4-32082efd64d8	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	94667e20-6a81-4bb8-8033-ec964dcfdc2b	2026-08-13 09:25:16.279
4fdfd018-700d-43ae-ad73-2cb7338e790a	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	864651ba-9dd7-4b14-9eba-ef5a2434a6ec	2026-08-13 09:25:16.281
3531ac42-ca41-4a6f-a4b9-30eeecea81cd	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	7072bc02-31b5-4442-a5e2-93ca1f469f25	2026-08-13 09:25:16.283
da30899e-f649-40c6-8f0d-f7cd1b52bc6d	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	23563f6e-87ad-4d6e-960e-e27bb20ae43d	2026-08-13 09:25:16.286
21d3f804-5d8d-4e74-8e36-1b6583bcfcff	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	5f12d1e5-2009-4cfc-924d-350b5529c6a8	2026-08-13 09:25:16.287
ab17454d-b806-4405-8731-ec5d65e456c1	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	eed33497-9481-4785-9613-92e864b0c990	2026-08-13 09:25:16.289
130af1e0-051d-48b8-804e-f2f2d0502dd0	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	2e59bf2f-dfcb-4136-bf0c-ee4e582472da	2026-08-13 09:25:16.291
4b43a252-f1ba-4127-b6c3-7d028f47b827	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	4c6beaf8-8d38-43d5-ad26-ae74195f0c06	2026-08-13 09:25:16.293
a89954c8-d910-4701-b118-9666ed3cddf9	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	1f78f694-aded-439a-a223-6c73faf41394	2026-08-13 09:25:16.296
301896ff-cf7b-44fc-8e0a-adf770d64a77	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	81a0ffb7-9eee-4ed5-8ddd-24a1ef7e6db1	2026-08-13 09:25:16.297
21f91aa0-54e7-4265-a960-cff7294e6c3d	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	51ce02dd-e7bf-491e-add0-c44ff2b40396	2026-08-13 09:25:16.3
d700afa8-8f25-44c9-ae79-5ff98fcf5f2c	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	148cac39-640a-4c81-93c2-85e60aa8aa1f	2026-08-13 09:25:16.302
d18258a9-01b8-48b6-b9f8-75ea123b383f	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	6bd3696e-94bb-4f22-abce-ec4ae0f17322	2026-08-13 09:25:16.304
e804e525-f2b4-4c33-a93b-ae73fa504fac	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	890e89ec-5369-4b16-8539-0954f7fe5f3a	2026-08-13 09:25:16.305
3099e624-1853-4957-930b-14137c581f64	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	a64a066e-57ba-4e88-afb5-d3843e788526	2026-08-13 09:25:16.307
894fbe92-9f0d-4e7f-9bdb-bd117509a43a	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	fa92c8fb-69a2-467a-83cf-f619108742be	2026-08-13 09:25:16.309
75a83075-7e1c-48dc-b43d-f6cb2cd1d61e	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	2f29cd87-5129-4223-97b5-e66aac00e4f7	2026-08-13 09:25:16.311
7c815355-ffed-47a6-9236-6d1066ec4f71	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	2687d0e5-6688-48eb-b3df-fa44d1f4397a	2026-08-13 09:25:16.313
041a2bce-984a-4149-8a80-5a6ffc134320	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	87e6a9eb-66f4-40dc-94b0-edae7025ef13	2026-08-13 09:25:16.316
d9b414fa-3f2e-4345-9ef9-a818c0317daa	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	66deed5f-2ba0-4a72-954d-d3d791976f3c	2026-08-13 09:25:16.318
cf7d3f98-4f7e-41c4-8a1f-0bc09ecb621c	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	e89567b6-0a2a-4263-b5c3-4efbdac3bf23	2026-08-13 09:25:16.32
80be93a5-7efc-479f-b0f8-a32138993f98	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	f88894eb-9c40-4ba3-b9bd-fe77e2169cef	2026-08-13 09:25:16.322
6695ce55-37dc-436c-ae93-79a4d52ae11c	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	ea8daa67-6c9d-40a9-878b-74480a82877f	2026-08-13 09:25:16.324
ebc688b3-5f54-482d-a1f0-f73506f9116d	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	9488c3d7-03f7-4aca-9be5-cefc0b3d9ce3	2026-08-13 09:25:16.327
dc2c19b7-6627-4a5b-aa7e-2aa44e7d9309	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	5e29e782-ef7e-451d-b3fa-f97dc4056f6c	2026-08-13 09:25:16.329
b32b253c-68f7-4647-884b-a376d664b7f2	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	29907e75-47a6-4333-a4dc-522496a1fb8d	2026-08-13 09:25:16.331
f5dc7b5d-92c7-4eca-9be0-8f1c089144fa	3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	da739f76-e3f2-4e1b-bd02-bb543a083f5e	2026-08-13 09:25:16.334
70acc2d0-e50a-444f-b88f-b41136a6834a	00000000-0000-0000-0000-000000000002	848e6235-2d68-475a-a394-eae64540d654	2026-08-13 09:25:16.336
d3f32b4e-ee43-489d-96c7-6ee01bbf9434	00000000-0000-0000-0000-000000000002	9bc5fe41-b57b-4186-9801-717fbc2395d4	2026-08-13 09:25:16.338
bd82763d-2645-4187-a4b8-263142faf8e0	00000000-0000-0000-0000-000000000002	f7811638-af29-45d0-9b27-68d187a2240d	2026-08-13 09:25:16.34
f76ce489-b9a5-409a-a700-7fe0c7707c12	00000000-0000-0000-0000-000000000002	4ddbf15f-a944-4a27-ae52-a19b63c49413	2026-08-13 09:25:16.342
e33aa126-0d0a-485a-b620-ec85e066e5bb	00000000-0000-0000-0000-000000000002	a64a066e-57ba-4e88-afb5-d3843e788526	2026-08-13 09:25:16.344
d9113443-497b-4c8a-b980-fa739d1f3a30	00000000-0000-0000-0000-000000000002	2f29cd87-5129-4223-97b5-e66aac00e4f7	2026-08-13 09:25:16.347
b3e17055-d7aa-43ef-acf6-a86abdb521b9	00000000-0000-0000-0000-000000000002	f88894eb-9c40-4ba3-b9bd-fe77e2169cef	2026-08-13 09:25:16.349
f25124fd-1b5e-4cd4-a66a-1689eee4d628	00000000-0000-0000-0000-000000000002	7072bc02-31b5-4442-a5e2-93ca1f469f25	2026-08-13 09:25:16.351
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, name, description, is_system, created_at, updated_at) FROM stdin;
00000000-0000-0000-0000-000000000001	admin	Administrator with full access	t	2026-08-13 16:24:57.433	2026-08-13 16:24:57.433
00000000-0000-0000-0000-000000000002	cashier	Cashier with POS access	t	2026-08-13 16:24:57.433	2026-08-13 16:24:57.433
00000000-0000-0000-0000-000000000003	manager	Manager with reporting access	t	2026-08-13 16:24:57.433	2026-08-13 16:24:57.433
00000000-0000-0000-0000-000000000004	kitchen	Kitchen staff with order access	t	2026-08-13 16:24:57.433	2026-08-13 16:24:57.433
3a26869a-8ec9-4ddb-a0ca-d12d34877cfa	management	Management role	t	2026-08-13 09:25:15.565	2026-08-13 09:25:15.565
95b7fa32-df60-4e32-b831-7a0db95467ff	owner	Owner role	t	2026-08-13 09:25:15.57	2026-08-13 09:25:15.57
\.


--
-- Data for Name: stock_adjustment_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_adjustment_logs (id, ingredient_id, previous_stock, new_stock, adjustment_type, reason, user_id, created_at) FROM stdin;
\.


--
-- Data for Name: stock_approval_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_approval_requests (id, request_number, type, requester_name, item_name, quantity, unit, status, manager_notes, processed_at, processed_by, created_at, updated_at, evidence_image) FROM stdin;
\.


--
-- Data for Name: stock_batches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_batches (id, ingredient_id, batch_code, quantity, cost_price, expiry_date, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: stock_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_logs (id, ingredient_id, quantity, type, reference_id, reference_type, notes, created_at) FROM stdin;
\.


--
-- Data for Name: stock_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_requests (id, ingredient_id, ingredient_name, quantity_requested, unit, notes, proof_file, proof_file_name, status, requested_by, requested_by_name, rejected_by, rejected_by_name, rejection_reason, requested_at, rejected_at, approval_level, finance_approved_at, finance_id, finance_name, finance_notes, manager_approved_at, manager_id, manager_name, manager_notes, rejection_level, supervisor_approved_at, supervisor_id, supervisor_name, supervisor_notes, supplier_id) FROM stdin;
838ab910-4474-470c-bad0-3f7d6f0a039b	04e3db48-f226-4604-8ae0-5d975fd8f61d	Adonan Croissant	10	kg	Tipe: Restock	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:21:36.121	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
ab9ab9c5-0a4a-4392-aa29-530122ea0bdf	10cf222b-8e27-465e-8faf-2c3a9d4a2a40	Air Kelapa Murni	10	liter	Tipe: Restock	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:21:36.156	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
1772bc0c-c91f-4e87-b86f-2e8e71c72c42	1600c671-f06d-4ad0-b1b2-93fabf152a7d	Air Mineral	20	botol	Tipe: Restock	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:21:36.17	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
55475322-6b9a-42c1-92d8-afcd845f1c65	9d9655f7-f102-4c28-a27f-8c24df868916	Air Tonic	20	liter	Tipe: Restock	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:21:36.183	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
865238e3-2cf0-4c52-9349-f915fbdec98c	933db0b3-0644-45ec-950d-e4a8f45684b6	Biskuit Regal	10	pack	Tipe: Restock	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:21:36.196	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
f2b0d872-6b28-43d3-a3ff-25310fdb70f1	5687cf78-f754-4275-bab8-16ee5481c71e	Blueberry	6	kg	Tipe: Restock	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:21:36.207	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
df307ee0-e28d-4a68-8f25-5c820730f6c0	26146f8d-e7d4-4551-a7b5-111b2af909f0	Buah Jeruk Segar	10	kg	Tipe: Restock	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:21:36.221	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
d6011cf8-371f-474d-b4bb-da1afbde2a27	3eba3202-5bb7-4cda-91f0-14c7d4412b60	Bubuk Chai	6	kg	Tipe: Restock	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:21:36.233	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
8dc77f34-31dc-45ed-9a58-cb5122ced5b1	8eb26642-1676-4860-96aa-9f9901080e1d	Bubuk Matcha	6	kg	Tipe: Restock	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:21:36.246	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
1668a3df-6807-42cb-aa62-f798f4cacf52	4fa33d8f-029a-4697-b9ee-a2c42af342b1	Cabai	6	kg	Tipe: Restock	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:21:36.26	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
dd2057e9-7920-4a2c-a8b5-8549da5db0ea	00ff959f-d32f-462a-a8a8-efafb19f0531	Cokelat Bubuk	6	kg	Tipe: Restock	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:21:36.271	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
ca329f54-c338-46e9-a65b-ad0fdf0f78e6	a795718b-1423-4c00-8414-39ff3ddbe973	Cream Cheese	6	kg	Tipe: Restock	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:21:36.285	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
cfe9e3ef-5540-41ce-a89a-f57f96d3643f	6df81fa3-2b99-4870-941c-5d091dc251bb	Dada Ayam	20	kg	Tipe: Restock	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:21:36.298	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
14162edf-5889-4767-b2b3-4680c16c3207	4aed869d-e995-4097-9083-4edf92aaa62a	Daun Teh Melati	10	kg	Tipe: Restock	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:21:36.31	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
89b6db83-46a8-4e7e-aaf8-a4f80134c144	db96d053-6856-4187-b7df-a67eae42bd34	Dressing Caesar	6	liter	Tipe: Restock	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:21:36.322	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
6c384f05-6ff2-4560-83f7-135f66d5fb94	18358ddf-0e74-48ae-b766-b3263ef793c8	Es Batu	20	kg	Tipe: Restock	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:21:36.335	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
d9989ef7-9efa-4db8-9f28-daaeffe350f8	68162715-4a53-48cc-8910-2077cc7a1221	Fillet Ikan Dori	10	kg	Tipe: Restock	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:21:36.349	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
989517a9-a53e-495f-89f8-57e5c82d89e3	8660305b-58c0-4668-9f0c-894c4ed0e73d	Gas Nitrogen	2	tabung	Tipe: Restock	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:21:36.362	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
a6e1ae71-f806-4d8c-93c3-a1ab01d41b37	d8bca5b1-a59f-441b-809d-e2b83f746df1	Kacang Almond	4	kg	Tipe: Restock	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:21:36.377	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
40d616a6-0c62-40ee-b239-cb7e5c53bf00	46342b92-fe84-47ba-a6fc-e6f33696fcde	Kacang Tanah	10	kg	Tipe: Restock	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:21:36.389	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
3bb152da-e134-42ba-87d2-09529c0f8d0a	e77967a9-26a2-40f1-ade4-e72961875f52	Kayu Manis Bubuk	4	kg	Tipe: Restock	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:21:36.402	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
a2c83016-c167-4c3d-807b-d312dd09ae69	46ca622f-e30a-40f7-869a-1dd780140e1d	Kecap Manis	10	liter	Tipe: Restock	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:21:36.413	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
05b8e526-05dc-4297-bba0-4747ca9591a4	ff2ea0ab-11e3-433b-9086-1d9ac0522dac	Keju Mozzarella	6	kg	Tipe: Restock	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:21:36.427	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
071d651e-b76f-447f-a525-162fbb851c91	8ec96dad-9a8e-4274-bb7c-a8269792d0dd	Keju Parmesan	4	kg	Tipe: Restock	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:21:36.438	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
1966de95-0938-46a5-8b7c-43275a60b532	28b6904a-8b2c-416d-b002-3ab401c201c0	Kentang Beku	20	kg	Tipe: Restock	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:21:36.451	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
5bd5d234-3ab4-4549-9c45-7a6db08684de	56248000-ee6c-4d61-aec6-04efdb11b738	Kol / Sayuran	10	kg	Tipe: Restock	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:21:36.465	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
a04c5351-56d1-4a25-b0c2-24da97604be7	91f1f579-a3b6-4d20-8893-762eb2b0fe2b	Mentega Butter	10	kg	Tipe: Restock	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:21:36.477	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
7f25cf29-faa1-4674-998e-e7e3951fc52c	54337855-e516-4545-8634-8e8301ce40a4	Pasta Spaghetti	10	kg	Tipe: Restock	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:21:36.49	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
5d75bd0a-48d5-4049-b805-5d507dc393d7	bbc95ea7-cc30-49ab-a22b-41ebba8ce3ce	Perasan Lemon	6	liter	Tipe: Restock	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:21:36.503	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
048d3cdc-da10-47f7-94e5-6124aebe749f	7c35ba89-54b7-4787-b8f8-d9f5888bb2c9	Pewarna Makanan Merah	4	liter	Tipe: Restock	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:21:36.515	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
260cd723-ec23-453a-b334-c35cc54e2976	cba90769-31ac-43d0-9a09-d8525cdd5b88	Pisang	6	sisir	Tipe: Restock	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:21:36.527	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
9b7c1d9a-3609-417e-92df-0df5f1b973a5	4649145b-72c6-4a9b-9aa9-fba94549ded2	Ragi	6	kg	Tipe: Restock	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:21:36.539	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
d34fe5ea-21c8-4afc-bbf7-6d074e005983	f32c1122-defd-4ead-b1ae-64c750dbad42	Roti Tawar	10	pack	Tipe: Restock	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:21:36.553	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
abc59d21-1f6e-4912-bf35-2189ba2d77ba	f9da65d6-61e4-4f61-a1bc-28c7adb80a8c	Selada Romaine	6	kg	Tipe: Restock	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:21:36.567	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
a9290d89-ffeb-4219-bfce-8e78ce2a3065	927efcd5-ec5f-43f5-be4a-54bfc0afddf1	Sirup Karamel	6	liter	Tipe: Restock	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:21:36.58	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
c1bce4b1-b7fc-4ae4-a61b-f666cf503de9	e97b2f31-58d3-4781-ad73-b4c8785464d3	Susu Evaporasi	10	liter	Tipe: Restock	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:21:36.595	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
8e2ae18d-8d53-4152-8685-1afc2a9c2048	9e82dd6d-9d74-4887-b61a-35d3b849dedb	Susu Kental Manis	10	kaleng	Tipe: Restock	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:21:36.608	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
06b0f7ed-d804-4ea3-934c-1b5a7b293a74	8ec5d131-b85f-460f-aa5f-276f40756b14	Teh Earl Grey	6	kg	Tipe: Restock	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:21:36.623	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
20569de2-d533-448e-bcfc-e46e8ccc2cb9	208aece4-a60d-4b5b-b34b-c94d17317185	Teh Thailand	6	liter	Tipe: Restock	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:21:36.635	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
91b9a8ef-236b-4570-b5cf-02bb65f73899	faa01933-f0e3-40f2-8f3e-8bc10f676542	Telur	20	butir	Tipe: Restock	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:21:36.648	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
9a882a50-8359-425c-9e51-6d43d0c7fd12	280b0e3a-42f2-423c-a415-f96ffc631c93	Vanilla Ice Cream	8	liter	Tipe: Restock	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:21:36.66	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
d60e12b1-d2c3-43f4-8a9f-c866b69f0ac5	ecc37f66-df46-423e-aaf4-28bf87f461e4	Whipped Cream	6	liter	Tipe: Restock	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:21:36.672	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
912d0105-18ba-4ecd-a1d0-b6ecdc71f9cd	582c651b-6f49-4746-b27f-7dc522decd06	Wortel	10	kg	Tipe: Restock	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:21:36.683	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
ca035808-c7a3-4454-8172-4b166ef6cc6f	04e3db48-f226-4604-8ae0-5d975fd8f61d	Adonan Croissant	10	kg	Tipe: Restock | Tujuan: Outlet Cabang BSD	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:30:00.582	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
e15b7984-5f12-4d8f-8bc8-f1a101fa9dfd	10cf222b-8e27-465e-8faf-2c3a9d4a2a40	Air Kelapa Murni	10	liter	Tipe: Restock | Tujuan: Outlet Cabang BSD	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:30:00.628	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
9ce4fcc4-9a79-4511-a695-ea643d6ea244	1600c671-f06d-4ad0-b1b2-93fabf152a7d	Air Mineral	20	botol	Tipe: Restock | Tujuan: Outlet Cabang BSD	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:30:00.645	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
74d73f6b-e9b3-402c-88f0-b9c8ebffb48d	9d9655f7-f102-4c28-a27f-8c24df868916	Air Tonic	20	liter	Tipe: Restock | Tujuan: Outlet Cabang BSD	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:30:00.661	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
0db999c4-982f-46f6-be92-cc2cad9982ea	933db0b3-0644-45ec-950d-e4a8f45684b6	Biskuit Regal	10	pack	Tipe: Restock | Tujuan: Outlet Cabang BSD	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:30:00.675	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
42925ded-6044-4d1b-b82e-2bf3b1cbbc31	5687cf78-f754-4275-bab8-16ee5481c71e	Blueberry	6	kg	Tipe: Restock | Tujuan: Outlet Cabang BSD	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:30:00.687	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
6ada6fc6-e037-45fd-ac16-1d080410247c	26146f8d-e7d4-4551-a7b5-111b2af909f0	Buah Jeruk Segar	10	kg	Tipe: Restock | Tujuan: Outlet Cabang BSD	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:30:00.699	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
a72cc3b4-fbaf-42d4-be0a-a5e1278c814b	3eba3202-5bb7-4cda-91f0-14c7d4412b60	Bubuk Chai	6	kg	Tipe: Restock | Tujuan: Outlet Cabang BSD	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:30:00.712	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
70862d85-d7ec-45ce-9039-34542b88957a	8eb26642-1676-4860-96aa-9f9901080e1d	Bubuk Matcha	6	kg	Tipe: Restock | Tujuan: Outlet Cabang BSD	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:30:00.724	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
df6ae602-4fb5-49f0-bb19-7e16b9e97866	4fa33d8f-029a-4697-b9ee-a2c42af342b1	Cabai	6	kg	Tipe: Restock | Tujuan: Outlet Cabang BSD	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:30:00.737	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
9aba0aa8-0615-4a6a-b88d-2dab4c595445	00ff959f-d32f-462a-a8a8-efafb19f0531	Cokelat Bubuk	6	kg	Tipe: Restock | Tujuan: Outlet Cabang BSD	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:30:00.749	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
d1f2d3ca-a09a-4df7-a763-8489ee9a971e	a795718b-1423-4c00-8414-39ff3ddbe973	Cream Cheese	6	kg	Tipe: Restock | Tujuan: Outlet Cabang BSD	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:30:00.762	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
2fc15ddb-27b9-4cbe-bee6-961aa9dd0a79	6df81fa3-2b99-4870-941c-5d091dc251bb	Dada Ayam	20	kg	Tipe: Restock | Tujuan: Outlet Cabang BSD	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:30:00.772	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
a95f0c76-8901-4e11-b0a6-cd3451e45ff5	4aed869d-e995-4097-9083-4edf92aaa62a	Daun Teh Melati	10	kg	Tipe: Restock | Tujuan: Outlet Cabang BSD	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:30:00.784	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
17029e99-270a-4f0f-aab4-2a49f339a2cd	db96d053-6856-4187-b7df-a67eae42bd34	Dressing Caesar	6	liter	Tipe: Restock | Tujuan: Outlet Cabang BSD	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:30:00.795	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
dd07d01e-2f0b-4bf4-bf1c-9234d752c0d8	18358ddf-0e74-48ae-b766-b3263ef793c8	Es Batu	20	kg	Tipe: Restock | Tujuan: Outlet Cabang BSD	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:30:00.806	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
e847e8fc-2cfe-4ecc-ba57-44acf953c0f6	68162715-4a53-48cc-8910-2077cc7a1221	Fillet Ikan Dori	10	kg	Tipe: Restock | Tujuan: Outlet Cabang BSD	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:30:00.819	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
e5ae2b6e-de9d-4a8b-ae13-45017af7232a	8660305b-58c0-4668-9f0c-894c4ed0e73d	Gas Nitrogen	2	tabung	Tipe: Restock | Tujuan: Outlet Cabang BSD	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:30:00.83	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
337e6f45-1d32-4556-a136-d1ff2775af28	d8bca5b1-a59f-441b-809d-e2b83f746df1	Kacang Almond	4	kg	Tipe: Restock | Tujuan: Outlet Cabang BSD	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:30:00.842	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
f6c8c5c4-4ede-4e17-bc0c-85e40bdf84aa	46342b92-fe84-47ba-a6fc-e6f33696fcde	Kacang Tanah	10	kg	Tipe: Restock | Tujuan: Outlet Cabang BSD	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:30:00.852	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
cb70044d-cd14-4e64-b19a-e03738339e0e	e77967a9-26a2-40f1-ade4-e72961875f52	Kayu Manis Bubuk	4	kg	Tipe: Restock | Tujuan: Outlet Cabang BSD	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:30:00.864	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
1305e664-73ba-45a4-ad79-115450c9ace9	46ca622f-e30a-40f7-869a-1dd780140e1d	Kecap Manis	10	liter	Tipe: Restock | Tujuan: Outlet Cabang BSD	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:30:00.875	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
8154cd67-32b4-4aa2-91b7-340d3c18fe6a	ff2ea0ab-11e3-433b-9086-1d9ac0522dac	Keju Mozzarella	6	kg	Tipe: Restock | Tujuan: Outlet Cabang BSD	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:30:00.886	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
cb039adf-0a1a-4742-adee-e1e80ac2f217	8ec96dad-9a8e-4274-bb7c-a8269792d0dd	Keju Parmesan	4	kg	Tipe: Restock | Tujuan: Outlet Cabang BSD	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:30:00.898	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
555ac9d6-fbec-49d5-acea-c773174382f6	28b6904a-8b2c-416d-b002-3ab401c201c0	Kentang Beku	20	kg	Tipe: Restock | Tujuan: Outlet Cabang BSD	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:30:00.909	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
13efe010-879b-42cb-94ce-a799dc14a3ab	56248000-ee6c-4d61-aec6-04efdb11b738	Kol / Sayuran	10	kg	Tipe: Restock | Tujuan: Outlet Cabang BSD	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:30:00.921	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
079ac61a-d885-43dd-bca4-050069768604	91f1f579-a3b6-4d20-8893-762eb2b0fe2b	Mentega Butter	10	kg	Tipe: Restock | Tujuan: Outlet Cabang BSD	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:30:00.932	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
42eed53d-e97e-4b7a-b3e1-2dd37410e5bd	54337855-e516-4545-8634-8e8301ce40a4	Pasta Spaghetti	10	kg	Tipe: Restock | Tujuan: Outlet Cabang BSD	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:30:00.944	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
21e5dc2d-d14f-41d1-a953-17bf3fb05352	bbc95ea7-cc30-49ab-a22b-41ebba8ce3ce	Perasan Lemon	6	liter	Tipe: Restock | Tujuan: Outlet Cabang BSD	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:30:00.955	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
72da4b09-0112-4b1d-bc32-6d823e8d2571	7c35ba89-54b7-4787-b8f8-d9f5888bb2c9	Pewarna Makanan Merah	4	liter	Tipe: Restock | Tujuan: Outlet Cabang BSD	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:30:00.966	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
df8fae02-b328-4bc7-888f-5db4b48cc8b7	cba90769-31ac-43d0-9a09-d8525cdd5b88	Pisang	6	sisir	Tipe: Restock | Tujuan: Outlet Cabang BSD	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:30:00.978	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
d3b24f69-20f4-4306-9412-36a4592a0e12	4649145b-72c6-4a9b-9aa9-fba94549ded2	Ragi	6	kg	Tipe: Restock | Tujuan: Outlet Cabang BSD	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:30:00.99	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
5cf39697-a5e3-4576-ba9b-c1d5ff2f1df7	f32c1122-defd-4ead-b1ae-64c750dbad42	Roti Tawar	10	pack	Tipe: Restock | Tujuan: Outlet Cabang BSD	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:30:01.003	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
730b7f52-83a8-4447-9020-2a870cd2465d	f9da65d6-61e4-4f61-a1bc-28c7adb80a8c	Selada Romaine	6	kg	Tipe: Restock | Tujuan: Outlet Cabang BSD	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:30:01.015	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
5dae0238-54ab-4d64-a438-02babf6aaeae	927efcd5-ec5f-43f5-be4a-54bfc0afddf1	Sirup Karamel	6	liter	Tipe: Restock | Tujuan: Outlet Cabang BSD	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:30:01.027	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
3b3c52cf-3794-4211-a7a2-118be93d60a4	e97b2f31-58d3-4781-ad73-b4c8785464d3	Susu Evaporasi	10	liter	Tipe: Restock | Tujuan: Outlet Cabang BSD	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:30:01.04	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
8f3837ba-ff99-48a6-ade0-3b978178ba2a	9e82dd6d-9d74-4887-b61a-35d3b849dedb	Susu Kental Manis	10	kaleng	Tipe: Restock | Tujuan: Outlet Cabang BSD	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:30:01.053	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
da451d4b-2034-4ec3-9c61-135ebf857430	8ec5d131-b85f-460f-aa5f-276f40756b14	Teh Earl Grey	6	kg	Tipe: Restock | Tujuan: Outlet Cabang BSD	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:30:01.065	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
a1fd7071-91e0-48d9-8a45-002009306856	208aece4-a60d-4b5b-b34b-c94d17317185	Teh Thailand	6	liter	Tipe: Restock | Tujuan: Outlet Cabang BSD	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:30:01.077	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
07b00e6c-fa11-4d77-9a54-64129840fc20	faa01933-f0e3-40f2-8f3e-8bc10f676542	Telur	20	butir	Tipe: Restock | Tujuan: Outlet Cabang BSD	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:30:01.088	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
c7ba7bdd-cfc3-4e05-a4e8-a65afdfa4e7c	280b0e3a-42f2-423c-a415-f96ffc631c93	Vanilla Ice Cream	8	liter	Tipe: Restock | Tujuan: Outlet Cabang BSD	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:30:01.1	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
ff3a51e5-5215-4319-8d9e-ff48efdb9c18	ecc37f66-df46-423e-aaf4-28bf87f461e4	Whipped Cream	6	liter	Tipe: Restock | Tujuan: Outlet Cabang BSD	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:30:01.111	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
6b067b12-8430-42a3-b639-2a147bc4c810	582c651b-6f49-4746-b27f-7dc522decd06	Wortel	10	kg	Tipe: Restock | Tujuan: Outlet Cabang BSD	\N	\N	pending_supervisor	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	admin	\N	\N	\N	2026-08-13 12:30:01.124	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: stock_transfer_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_transfer_items (id, transfer_id, ingredient_id, quantity, unit, created_at) FROM stdin;
\.


--
-- Data for Name: stock_transfers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_transfers (id, transfer_number, from_warehouse_id, to_warehouse_id, status, requested_by, approved_by, approved_at, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: stock_write_offs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_write_offs (id, ingredient_id, ingredient_name, quantity_written_off, unit, reason, notes, proof_file, proof_file_name, status, requested_by, requested_by_name, approved_by, approved_by_name, rejected_by, rejected_by_name, rejection_reason, requested_at, approved_at, rejected_at) FROM stdin;
aa5dde6b-adda-422b-a4e1-f68aa9d4aaea	488f816b-b305-47b2-8e98-003f1366166c	Tomat	4.57	kg	spoiled	Terkontaminasi	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-08-13 09:25:20.359	2026-08-13 09:25:20.359	\N
4124d85a-896d-4e14-a113-b537393c7740	f21c9755-be32-4a7f-8727-f5e5ef22ad6b	Susu Segar	1.16	liter	measurement_error	Salah pengukuran	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-08-13 09:25:20.359	2026-08-13 09:25:20.359	\N
ab46a272-e622-4d2f-87a6-add618dc247d	69d86a0c-44f6-48dc-a831-c61f5006d58c	Kopi Bubuk	4.18	kg	measurement_error	Kesalahan timbangan	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-08-10 09:25:20.368	2026-08-10 09:25:20.368	\N
7dda9777-644e-4bf6-b9cd-97055dc681d5	f027917b-1fa5-455e-bff3-70c9db53499a	Tepung Terigu	0.58	kg	quality_issue	Kualitas tidak memenuhi standar	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-08-10 09:25:20.368	2026-08-10 09:25:20.368	\N
20c6caf9-f349-49cf-81da-5bcf1c8693c4	6f38efdf-87e4-4bcc-abe3-edd96e35463b	Bawang Merah	0.42	kg	quality_issue	Bau tidak sedap	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-08-08 09:25:20.376	2026-08-08 09:25:20.376	\N
cada2a7c-894a-4bb4-8d87-9d7233d4b5e3	6f38efdf-87e4-4bcc-abe3-edd96e35463b	Bawang Merah	4.49	kg	damaged	Kemasan rusak	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-08-08 09:25:20.376	2026-08-08 09:25:20.376	\N
12796e76-1a40-47da-891a-46ef7876a377	df13e8ef-df5c-4894-b79a-01bcaf5ccca1	Daging Sapi	1.14	kg	expired	Kedaluwarsa	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-08-06 09:25:20.384	2026-08-06 09:25:20.384	\N
ab0a8528-bdc3-423f-9613-475acd86a28d	a8aa6b4e-88c4-4e04-8d63-a0a25bbaa081	Telur Ayam	0.63	kg	measurement_error	Salah pengukuran	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-08-06 09:25:20.384	2026-08-06 09:25:20.384	\N
46f648e6-28ce-4050-8f53-2294aaff8fdf	cea77dc3-c9c2-4b61-b0d7-5437dadb0430	Minyak Goreng	4.61	liter	expired	Masa habis terlewati	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-08-04 09:25:20.395	2026-08-04 09:25:20.395	\N
c86238e4-16f5-49e3-91a9-f0d776533184	6afcb439-bf35-46bc-95ef-f0ea936aa764	Ayam Potong	1.71	kg	spoiled	Terkontaminasi	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-08-03 09:25:20.399	2026-08-03 09:25:20.399	\N
feae028d-c948-4a64-bbb0-f779dca3943f	0666228a-dbc2-4194-9858-7a3a0f3318b1	Susu UHT	4.88	liter	expired	Kedaluwarsa	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-08-03 09:25:20.399	2026-08-03 09:25:20.399	\N
fbea5e8c-6969-4a46-aed7-ae2c2e6a620f	a8aa6b4e-88c4-4e04-8d63-a0a25bbaa081	Telur Ayam	3.68	kg	spoiled	Terkontaminasi	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-08-02 09:25:20.407	2026-08-02 09:25:20.407	\N
6a9e4e85-a0a8-4796-9b1a-90f8c2cb80b8	a8aa6b4e-88c4-4e04-8d63-a0a25bbaa081	Telur Ayam	0.69	kg	measurement_error	Salah pengukuran	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-08-02 09:25:20.407	2026-08-02 09:25:20.407	\N
2eb65dd3-5ecc-4c65-9d5d-3575ec3df62e	464f026e-362e-42ae-ac8f-3fcf1ae46a1f	Bawang Putih	4.6	kg	spoiled	Busuk	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-08-01 09:25:20.417	2026-08-01 09:25:20.417	\N
967a7955-8439-4bfd-bc84-b88a66840e17	a8aa6b4e-88c4-4e04-8d63-a0a25bbaa081	Telur Ayam	0.12	kg	expired	Kedaluwarsa	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-08-01 09:25:20.417	2026-08-01 09:25:20.417	\N
7f125ecd-6a4f-47ea-81d0-c2c40ddffb94	f21c9755-be32-4a7f-8727-f5e5ef22ad6b	Susu Segar	1.09	liter	damaged	Kemasan rusak	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-07-30 09:25:20.424	2026-07-30 09:25:20.424	\N
afddb684-67c0-4013-891c-dcf850c97c1f	165af566-b35b-4848-927f-bee9e54081ad	Coklat Bubuk	1.16	kg	spoiled	Basi	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-07-29 09:25:20.429	2026-07-29 09:25:20.429	\N
05bfa0f0-d34b-463b-958a-b8bc2ae57bf5	165af566-b35b-4848-927f-bee9e54081ad	Coklat Bubuk	1.03	kg	quality_issue	Bau tidak sedap	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-07-29 09:25:20.429	2026-07-29 09:25:20.429	\N
7676d801-bdd2-49a5-9f8a-3d80621b5bcf	6afcb439-bf35-46bc-95ef-f0ea936aa764	Ayam Potong	1.19	kg	measurement_error	Salah pengukuran	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-07-28 09:25:20.436	2026-07-28 09:25:20.436	\N
618ff6a3-1ffa-448d-ba34-db0b18e1fccb	165af566-b35b-4848-927f-bee9e54081ad	Coklat Bubuk	3.2	kg	measurement_error	Salah pengukuran	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-07-26 09:25:20.44	2026-07-26 09:25:20.44	\N
446d5d02-dcd7-498d-a99c-c82344bda01b	81f1f09f-db38-4239-b9f8-7c6752a15749	Keju Cheddar	2.31	kg	quality_issue	Warna berubah	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-07-22 09:25:20.444	2026-07-22 09:25:20.444	\N
b700f836-d5aa-44c1-911f-1ac9e83346ba	69d86a0c-44f6-48dc-a831-c61f5006d58c	Kopi Bubuk	1.85	kg	quality_issue	Kualitas tidak memenuhi standar	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-07-22 09:25:20.444	2026-07-22 09:25:20.444	\N
48ad697d-55f2-40c5-b80a-09566c6ee6ca	464f026e-362e-42ae-ac8f-3fcf1ae46a1f	Bawang Putih	3.39	kg	spoiled	Terkontaminasi	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-07-20 09:25:20.453	2026-07-20 09:25:20.453	\N
00080bee-32c8-4f69-82c5-f215b75ddf94	464f026e-362e-42ae-ac8f-3fcf1ae46a1f	Bawang Putih	2.25	kg	damaged	Bocor	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-07-18 09:25:20.458	2026-07-18 09:25:20.458	\N
433cf55c-aa32-41fb-90b1-3a1c21b4e053	69d86a0c-44f6-48dc-a831-c61f5006d58c	Kopi Bubuk	2.89	kg	measurement_error	Salah pengukuran	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-07-18 09:25:20.458	2026-07-18 09:25:20.458	\N
6b8b29ef-a9c5-488c-b85d-b8e10933a00e	a8aa6b4e-88c4-4e04-8d63-a0a25bbaa081	Telur Ayam	0.76	kg	quality_issue	Warna berubah	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-07-17 09:25:20.468	2026-07-17 09:25:20.468	\N
4f671bd8-adf2-46b9-97f8-ab63672255b7	d33b5646-418a-44ce-af22-d7f5ed047c5a	Gula Pasir	1.81	kg	spoiled	Terkontaminasi	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-07-16 09:25:20.471	2026-07-16 09:25:20.471	\N
ada5e837-2370-4237-8c46-2796fed37ea7	464f026e-362e-42ae-ac8f-3fcf1ae46a1f	Bawang Putih	2.2	kg	damaged	Kemasan rusak	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-07-14 09:25:20.476	2026-07-14 09:25:20.476	\N
6812380c-566b-4f68-9706-8c31ca972443	f027917b-1fa5-455e-bff3-70c9db53499a	Tepung Terigu	0.43	kg	spoiled	Basi	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-07-14 09:25:20.476	2026-07-14 09:25:20.476	\N
c4025b9f-148b-494e-a789-d0ddd01cea49	df13e8ef-df5c-4894-b79a-01bcaf5ccca1	Daging Sapi	2.12	kg	measurement_error	Salah pengukuran	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-07-11 09:25:20.484	2026-07-11 09:25:20.484	\N
279d5786-5b55-42cf-a8fb-d688c2bc8aae	0666228a-dbc2-4194-9858-7a3a0f3318b1	Susu UHT	3.17	liter	quality_issue	Kualitas tidak memenuhi standar	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-07-11 09:25:20.484	2026-07-11 09:25:20.484	\N
e2af81e3-d0f8-4526-93e5-47bf025c2814	0666228a-dbc2-4194-9858-7a3a0f3318b1	Susu UHT	0.13	liter	quality_issue	Bau tidak sedap	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-07-10 09:25:20.492	2026-07-10 09:25:20.492	\N
ba20693e-7b5a-4dee-b749-df0490648f1a	f027917b-1fa5-455e-bff3-70c9db53499a	Tepung Terigu	2.41	kg	damaged	Bocor	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-07-10 09:25:20.492	2026-07-10 09:25:20.492	\N
dbf04e03-feb2-4343-9b47-3c568d8f9843	6f38efdf-87e4-4bcc-abe3-edd96e35463b	Bawang Merah	2.18	kg	quality_issue	Kualitas tidak memenuhi standar	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-07-09 09:25:20.5	2026-07-09 09:25:20.5	\N
357c796e-c085-487e-b8a5-195d606f9891	f027917b-1fa5-455e-bff3-70c9db53499a	Tepung Terigu	3.44	kg	damaged	Kemasan rusak	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-07-08 09:25:20.504	2026-07-08 09:25:20.504	\N
11e971bc-e7df-40be-be3d-32e590fc39d0	a8aa6b4e-88c4-4e04-8d63-a0a25bbaa081	Telur Ayam	4.36	kg	damaged	Bocor	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-07-07 09:25:20.508	2026-07-07 09:25:20.508	\N
c59092e2-3c12-423d-9b19-7005219fa4d4	0666228a-dbc2-4194-9858-7a3a0f3318b1	Susu UHT	0.15	liter	quality_issue	Bau tidak sedap	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-07-07 09:25:20.508	2026-07-07 09:25:20.508	\N
ee41337b-c4ef-4885-a70a-117969963e08	488f816b-b305-47b2-8e98-003f1366166c	Tomat	3.01	kg	expired	Kedaluwarsa	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-07-06 09:25:20.516	2026-07-06 09:25:20.516	\N
30c664b7-c3f0-4b73-851f-ac54eb01c3c9	df13e8ef-df5c-4894-b79a-01bcaf5ccca1	Daging Sapi	2.06	kg	expired	Kedaluwarsa	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-07-06 09:25:20.516	2026-07-06 09:25:20.516	\N
f5ebcdea-c580-4a85-a87f-549a04621e5e	cea77dc3-c9c2-4b61-b0d7-5437dadb0430	Minyak Goreng	3.5	liter	damaged	Kemasan rusak	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-07-03 09:25:20.523	2026-07-03 09:25:20.523	\N
5fdf6401-be41-49bc-a4cc-c2f24b815a09	bc7ccadb-6a8e-48a6-8980-3a350020aad5	Sayur Bayam	1.7	kg	measurement_error	Kesalahan timbangan	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-07-03 09:25:20.523	2026-07-03 09:25:20.523	\N
bd662a62-1dd4-480a-a4da-68942a4c12f8	464f026e-362e-42ae-ac8f-3fcf1ae46a1f	Bawang Putih	2.19	kg	measurement_error	Kesalahan timbangan	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-07-02 09:25:20.532	2026-07-02 09:25:20.532	\N
2f0fff13-5ae1-4a25-b320-18c84eba1d26	cea77dc3-c9c2-4b61-b0d7-5437dadb0430	Minyak Goreng	3.3	liter	expired	Kedaluwarsa	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-07-02 09:25:20.532	2026-07-02 09:25:20.532	\N
a716f419-7695-4637-a849-0ac53172638b	69d86a0c-44f6-48dc-a831-c61f5006d58c	Kopi Bubuk	2.99	kg	damaged	Bocor	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-07-01 09:25:20.54	2026-07-01 09:25:20.54	\N
86d1978d-832f-46a4-a6cb-d56953144282	165af566-b35b-4848-927f-bee9e54081ad	Coklat Bubuk	3.39	kg	measurement_error	Kesalahan timbangan	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-06-30 09:25:20.545	2026-06-30 09:25:20.545	\N
1f574fcf-80e7-459d-a52a-438fc02b9172	cea77dc3-c9c2-4b61-b0d7-5437dadb0430	Minyak Goreng	3.35	liter	damaged	Terjatuh	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-06-29 09:25:20.548	2026-06-29 09:25:20.548	\N
32e43867-58cf-49fa-9763-9d824d2cda60	69d86a0c-44f6-48dc-a831-c61f5006d58c	Kopi Bubuk	0.66	kg	quality_issue	Kualitas tidak memenuhi standar	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-06-29 09:25:20.548	2026-06-29 09:25:20.548	\N
6b5c8fc8-cc55-4dff-ba93-42e31472aa96	f21c9755-be32-4a7f-8727-f5e5ef22ad6b	Susu Segar	2.92	liter	quality_issue	Warna berubah	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-06-28 09:25:20.556	2026-06-28 09:25:20.556	\N
56cc2e7c-22d1-4fd5-880c-0c581d8e0d2d	488f816b-b305-47b2-8e98-003f1366166c	Tomat	2.84	kg	expired	Kedaluwarsa	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-06-27 09:25:20.561	2026-06-27 09:25:20.561	\N
5b40c837-7da2-4ae9-8f69-033c2e1661d1	d33b5646-418a-44ce-af22-d7f5ed047c5a	Gula Pasir	2.29	kg	measurement_error	Kesalahan timbangan	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-06-27 09:25:20.561	2026-06-27 09:25:20.561	\N
627ff50e-9014-43fc-815e-dc3141989c6a	488f816b-b305-47b2-8e98-003f1366166c	Tomat	0.64	kg	expired	Kedaluwarsa	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-06-26 09:25:20.569	2026-06-26 09:25:20.569	\N
7cb3ab63-4364-4e05-90f4-d124cc33f8a3	6f38efdf-87e4-4bcc-abe3-edd96e35463b	Bawang Merah	4.51	kg	spoiled	Basi	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-06-25 09:25:20.572	2026-06-25 09:25:20.572	\N
d745607c-1c4f-409e-b0ce-97573fe4ee70	f21c9755-be32-4a7f-8727-f5e5ef22ad6b	Susu Segar	0.57	liter	damaged	Terjatuh	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-06-24 09:25:20.577	2026-06-24 09:25:20.577	\N
35fd7b0d-49f4-4099-9b70-befe0e75b66b	488f816b-b305-47b2-8e98-003f1366166c	Tomat	4.5	kg	expired	Masa habis terlewati	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-06-24 09:25:20.577	2026-06-24 09:25:20.577	\N
bc10991a-ad24-4295-9b74-91b0dc93c90c	cea77dc3-c9c2-4b61-b0d7-5437dadb0430	Minyak Goreng	4.43	liter	measurement_error	Salah pengukuran	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-06-22 09:25:20.585	2026-06-22 09:25:20.585	\N
b548716a-34e0-4c35-8edf-c01856db407c	bc7ccadb-6a8e-48a6-8980-3a350020aad5	Sayur Bayam	3.2	kg	expired	Kedaluwarsa	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-06-22 09:25:20.585	2026-06-22 09:25:20.585	\N
4a0bbe20-f218-4485-a2c3-0730cecda8b1	6f38efdf-87e4-4bcc-abe3-edd96e35463b	Bawang Merah	1.55	kg	expired	Kedaluwarsa	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-06-21 09:25:20.593	2026-06-21 09:25:20.593	\N
ffef83d0-078a-4cba-948c-54b48534660e	f21c9755-be32-4a7f-8727-f5e5ef22ad6b	Susu Segar	3.02	liter	expired	Kedaluwarsa	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-06-21 09:25:20.593	2026-06-21 09:25:20.593	\N
9bc3828a-8085-4608-b58b-fa57febdf925	81f1f09f-db38-4239-b9f8-7c6752a15749	Keju Cheddar	0.44	kg	quality_issue	Bau tidak sedap	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-06-20 09:25:20.6	2026-06-20 09:25:20.6	\N
df08ec07-5a43-4d33-826a-406efa4b86d2	a8aa6b4e-88c4-4e04-8d63-a0a25bbaa081	Telur Ayam	1.61	kg	damaged	Bocor	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-06-18 09:25:20.603	2026-06-18 09:25:20.603	\N
f31e382b-8c51-4286-84bb-080bb018a256	488f816b-b305-47b2-8e98-003f1366166c	Tomat	4.48	kg	spoiled	Terkontaminasi	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-06-15 09:25:20.608	2026-06-15 09:25:20.608	\N
f28f0858-e279-4908-943e-8a5605b0ac38	cea77dc3-c9c2-4b61-b0d7-5437dadb0430	Minyak Goreng	2.34	liter	spoiled	Terkontaminasi	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-06-15 09:25:20.608	2026-06-15 09:25:20.608	\N
4c53131f-eb4e-461b-8f94-1e374db95814	464f026e-362e-42ae-ac8f-3fcf1ae46a1f	Bawang Putih	2.83	kg	damaged	Terjatuh	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-06-14 09:25:20.616	2026-06-14 09:25:20.616	\N
39b7e992-9ee1-445b-a296-2be728af83d6	165af566-b35b-4848-927f-bee9e54081ad	Coklat Bubuk	4.84	kg	expired	Kedaluwarsa	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-06-13 09:25:20.619	2026-06-13 09:25:20.619	\N
6518f477-d48e-42c8-b5b2-e2ab2b0eeb67	6f38efdf-87e4-4bcc-abe3-edd96e35463b	Bawang Merah	0.29	kg	spoiled	Busuk	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-06-12 09:25:20.623	2026-06-12 09:25:20.623	\N
2a72458a-e853-4340-9d22-e09752f3cf2e	0666228a-dbc2-4194-9858-7a3a0f3318b1	Susu UHT	3.75	liter	quality_issue	Kualitas tidak memenuhi standar	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-06-10 09:25:20.627	2026-06-10 09:25:20.627	\N
c018dde0-066d-4dc5-a5ed-87f32f01f89c	cea77dc3-c9c2-4b61-b0d7-5437dadb0430	Minyak Goreng	2.8	liter	measurement_error	Kesalahan timbangan	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-06-09 09:25:20.631	2026-06-09 09:25:20.631	\N
bfa7ebed-13a1-42eb-a9ee-36c1e7889cd4	0666228a-dbc2-4194-9858-7a3a0f3318b1	Susu UHT	1.55	liter	quality_issue	Bau tidak sedap	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-06-08 09:25:20.635	2026-06-08 09:25:20.635	\N
c500dc38-fc15-4644-a7df-da29df363f9b	6f38efdf-87e4-4bcc-abe3-edd96e35463b	Bawang Merah	3.9	kg	quality_issue	Warna berubah	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-06-08 09:25:20.635	2026-06-08 09:25:20.635	\N
a3e2bf22-5ec9-451d-9f97-4b9fb0544014	6afcb439-bf35-46bc-95ef-f0ea936aa764	Ayam Potong	3.01	kg	quality_issue	Warna berubah	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-06-07 09:25:20.644	2026-06-07 09:25:20.644	\N
611e0549-aa1c-423e-a65f-27ed2a3168a1	81f1f09f-db38-4239-b9f8-7c6752a15749	Keju Cheddar	4.39	kg	expired	Kedaluwarsa	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-06-07 09:25:20.644	2026-06-07 09:25:20.644	\N
b449d7ee-7ba6-43c0-bf59-464153712d57	d33b5646-418a-44ce-af22-d7f5ed047c5a	Gula Pasir	0.75	kg	quality_issue	Bau tidak sedap	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-06-06 09:25:20.651	2026-06-06 09:25:20.651	\N
dfd58e77-67bb-4548-a11c-a41aae70f1e3	6f38efdf-87e4-4bcc-abe3-edd96e35463b	Bawang Merah	0.73	kg	spoiled	Terkontaminasi	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-06-05 09:25:20.655	2026-06-05 09:25:20.655	\N
6f9ac15c-b013-42fd-99a2-515a41cba39a	bc7ccadb-6a8e-48a6-8980-3a350020aad5	Sayur Bayam	4.51	kg	spoiled	Busuk	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-06-03 09:25:20.66	2026-06-03 09:25:20.66	\N
75ca7828-3a2a-4bd8-9678-737e194fd603	464f026e-362e-42ae-ac8f-3fcf1ae46a1f	Bawang Putih	2.76	kg	expired	Kedaluwarsa	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-05-30 09:25:20.664	2026-05-30 09:25:20.664	\N
ecfcfd2a-77a9-4ded-bbc3-3fd132213de5	f21c9755-be32-4a7f-8727-f5e5ef22ad6b	Susu Segar	4.25	liter	damaged	Bocor	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-05-29 09:25:20.668	2026-05-29 09:25:20.668	\N
4634fbb3-38c3-4b78-8c04-7a618fda5273	d33b5646-418a-44ce-af22-d7f5ed047c5a	Gula Pasir	1.36	kg	spoiled	Basi	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-05-29 09:25:20.668	2026-05-29 09:25:20.668	\N
e7998604-ec1e-439a-8c64-51289bf3edd7	bc7ccadb-6a8e-48a6-8980-3a350020aad5	Sayur Bayam	2.26	kg	quality_issue	Warna berubah	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-05-28 09:25:20.677	2026-05-28 09:25:20.677	\N
3514168b-921d-420e-92da-d45c425bf2e9	bc7ccadb-6a8e-48a6-8980-3a350020aad5	Sayur Bayam	1.19	kg	quality_issue	Kualitas tidak memenuhi standar	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-05-28 09:25:20.677	2026-05-28 09:25:20.677	\N
b85b69ce-b2f2-4f2a-814b-01641219099f	488f816b-b305-47b2-8e98-003f1366166c	Tomat	0.53	kg	expired	Kedaluwarsa	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-05-27 09:25:20.687	2026-05-27 09:25:20.687	\N
3ed7dcb4-362e-4d7d-8b52-b2524299c285	464f026e-362e-42ae-ac8f-3fcf1ae46a1f	Bawang Putih	2.16	kg	quality_issue	Kualitas tidak memenuhi standar	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-05-26 09:25:20.691	2026-05-26 09:25:20.691	\N
41de1c5c-fb0b-4c0e-b2cc-553bfb23b863	bc7ccadb-6a8e-48a6-8980-3a350020aad5	Sayur Bayam	4.67	kg	measurement_error	Kesalahan timbangan	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-05-26 09:25:20.691	2026-05-26 09:25:20.691	\N
ea125d90-fc42-4175-ad95-c67e2a5f2266	cea77dc3-c9c2-4b61-b0d7-5437dadb0430	Minyak Goreng	0.15	liter	spoiled	Busuk	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-05-25 09:25:20.7	2026-05-25 09:25:20.7	\N
6f408062-0418-4e18-9dbd-c9d9a40b7b86	464f026e-362e-42ae-ac8f-3fcf1ae46a1f	Bawang Putih	2.5	kg	quality_issue	Kualitas tidak memenuhi standar	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-05-22 09:25:20.705	2026-05-22 09:25:20.705	\N
d658dce0-679e-41f8-987e-feefe65497b7	bc7ccadb-6a8e-48a6-8980-3a350020aad5	Sayur Bayam	3.44	kg	quality_issue	Kualitas tidak memenuhi standar	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-05-22 09:25:20.705	2026-05-22 09:25:20.705	\N
ea39d861-1325-4d4d-b15b-61e2ea81f854	165af566-b35b-4848-927f-bee9e54081ad	Coklat Bubuk	1.92	kg	damaged	Bocor	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-05-21 09:25:20.715	2026-05-21 09:25:20.715	\N
cecb10c9-2b7f-4876-b79f-6e1e3191822c	cea77dc3-c9c2-4b61-b0d7-5437dadb0430	Minyak Goreng	0.41	liter	measurement_error	Kesalahan timbangan	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-05-20 09:25:20.72	2026-05-20 09:25:20.72	\N
037b75c9-c59e-4b39-b85d-801f6f7276bf	f21c9755-be32-4a7f-8727-f5e5ef22ad6b	Susu Segar	0.19	liter	damaged	Kemasan rusak	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-05-19 09:25:20.725	2026-05-19 09:25:20.725	\N
7b81bd07-2945-46e3-8617-86ff6a139c3f	f21c9755-be32-4a7f-8727-f5e5ef22ad6b	Susu Segar	1.32	liter	damaged	Terjatuh	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-05-19 09:25:20.725	2026-05-19 09:25:20.725	\N
898ce2aa-1424-4f26-a85d-9880610e947e	d33b5646-418a-44ce-af22-d7f5ed047c5a	Gula Pasir	1.83	kg	spoiled	Busuk	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-05-18 09:25:20.733	2026-05-18 09:25:20.733	\N
1dde9b9f-5ed0-45fa-b57a-a50bfd589e65	464f026e-362e-42ae-ac8f-3fcf1ae46a1f	Bawang Putih	1.7	kg	expired	Kedaluwarsa	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-05-16 09:25:20.737	2026-05-16 09:25:20.737	\N
9ae5172f-d7ca-44ab-bc98-f3736267f17a	6f38efdf-87e4-4bcc-abe3-edd96e35463b	Bawang Merah	3.03	kg	quality_issue	Kualitas tidak memenuhi standar	sample_proof.jpg	sample_proof.jpg	approved	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	63a8d475-d853-4a6b-ba8a-4234f44a7b4c	System Administrator	\N	\N	\N	2026-05-16 09:25:20.737	2026-05-16 09:25:20.737	\N
\.


--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.suppliers (id, name, phone, email, address, created_at, updated_at, is_active, payment_terms, tax_id, category, pic_mobile, pic_name, moq_amount, moq_unit, performance_notes) FROM stdin;
34ee0c0e-948b-468f-a004-53292dae922a	PT Indofood Sukses Makmur	021-57958888	sales@indofood.com	Jl. Jendral Sudirman Kav. 76-78, Jakarta	2026-08-13 09:25:16.948	2026-08-13 09:25:16.948	t	net 30	\N	\N	\N	\N	\N	\N	\N
88d5f03f-144f-432b-9874-0b068dbdc6b9	PT Ultra Jaya	022-7564321	order@ultrajaya.co.id	Jl. Raya Bandung Km. 24, Cimahi	2026-08-13 09:25:16.948	2026-08-13 09:25:16.948	t	net 30	\N	\N	\N	\N	\N	\N	\N
9e23c578-a62e-4be9-8a0e-4e3fc32a07fe	PT Wings Surya	031-8531234	procurement@wingsgroup.com	Jl. Raya Menganti Km. 16, Surabaya	2026-08-13 09:25:16.948	2026-08-13 09:25:16.948	t	net 30	\N	\N	\N	\N	\N	\N	\N
d0d37a44-99f2-4c9e-8eb4-54b930f4f8bb	PT Mayora Indah	021-54321234	supply@mayora.co.id	Jl. Tomang Raya No. 11-13, Jakarta	2026-08-13 09:25:16.948	2026-08-13 09:25:16.948	t	net 30	\N	\N	\N	\N	\N	\N	\N
558d779e-bdff-4566-9652-af23cfd1d7c1	PT Garudafood	021-65432109	vendor@garudafood.com	Jl. Bintaro Raya No. 9, Tangerang Selatan	2026-08-13 09:25:16.948	2026-08-13 09:25:16.948	t	net 30	\N	\N	\N	\N	\N	\N	\N
3bb13089-81d0-4a65-b95c-64f1586d75c7	PT Frisian Flag Indonesia	021-87654321	business@frisianflag.com	Jl. Raya Bogor Km. 28, Jakarta	2026-08-13 09:25:16.948	2026-08-13 09:25:16.948	t	net 30	\N	\N	\N	\N	\N	\N	\N
f1fb96a8-f924-43f3-a5c1-c8d386b5e27f	PT Unilever Indonesia	021-23456789	b2b@unilever.com	Jl. Gatot Subroto Kav. 15, Jakarta	2026-08-13 09:25:16.948	2026-08-13 09:25:16.948	t	net 30	\N	\N	\N	\N	\N	\N	\N
79af234e-313f-4590-acee-ca4d95d76169	PT Heinz ABC Indonesia	021-34567890	sales@heinzabc.com	Jl. Daan Mogot Km. 12, Jakarta	2026-08-13 09:25:16.948	2026-08-13 09:25:16.948	t	net 30	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: tables; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tables (id, table_number, qr_code, is_active, outlet_id, created_at, updated_at, status) FROM stdin;
9c207ed7-67d3-4f84-a51e-0dc349f32f29	Meja 1	\N	t	413ec5c9-2713-47ff-b0b3-b475a8447656	2026-08-13 09:25:16.757	2026-08-13 09:25:16.757	available
a8d4f963-85d7-4dbb-9748-e98c10326fc1	Meja 2	\N	t	413ec5c9-2713-47ff-b0b3-b475a8447656	2026-08-13 09:25:16.763	2026-08-13 09:25:16.763	available
5ed41b0b-109c-4da8-a239-7248dd7e607c	Meja 3	\N	t	413ec5c9-2713-47ff-b0b3-b475a8447656	2026-08-13 09:25:16.767	2026-08-13 09:25:16.767	available
476dc547-902a-40d9-a82a-a7ebbcce66b0	Meja 4	\N	t	413ec5c9-2713-47ff-b0b3-b475a8447656	2026-08-13 09:25:16.771	2026-08-13 09:25:16.771	available
bf1fd66a-8b43-4524-b1d8-25b049dbaff9	Meja 5	\N	t	413ec5c9-2713-47ff-b0b3-b475a8447656	2026-08-13 09:25:16.775	2026-08-13 09:25:16.775	available
f8e72264-0224-4d38-ab33-fef65937b016	Meja 6	\N	t	413ec5c9-2713-47ff-b0b3-b475a8447656	2026-08-13 09:25:16.779	2026-08-13 09:25:16.779	available
6f1ee214-a42a-4472-8819-40941f4688c6	Meja 7	\N	t	413ec5c9-2713-47ff-b0b3-b475a8447656	2026-08-13 09:25:16.783	2026-08-13 09:25:16.783	available
ea5a673a-dae7-4bcd-926a-3e8c19fe8117	Meja 8	\N	t	413ec5c9-2713-47ff-b0b3-b475a8447656	2026-08-13 09:25:16.786	2026-08-13 09:25:16.786	available
\.


--
-- Data for Name: vouchers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vouchers (id, code, name, description, discount_type, discount_value, minimum_purchase, max_discount, quota, used_count, valid_from, valid_until, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: warehouses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.warehouses (id, name, code, outlet_id, address, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: app_settings app_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.app_settings
    ADD CONSTRAINT app_settings_pkey PRIMARY KEY (id);


--
-- Name: approval_workflows approval_workflows_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.approval_workflows
    ADD CONSTRAINT approval_workflows_pkey PRIMARY KEY (id);


--
-- Name: attendances attendances_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT attendances_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: category_printers category_printers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.category_printers
    ADD CONSTRAINT category_printers_pkey PRIMARY KEY (id);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- Name: customer_order_items customer_order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_order_items
    ADD CONSTRAINT customer_order_items_pkey PRIMARY KEY (id);


--
-- Name: customer_orders customer_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_orders
    ADD CONSTRAINT customer_orders_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: database_backups database_backups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.database_backups
    ADD CONSTRAINT database_backups_pkey PRIMARY KEY (id);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: goods_received_notes goods_received_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.goods_received_notes
    ADD CONSTRAINT goods_received_notes_pkey PRIMARY KEY (id);


--
-- Name: grn_items grn_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grn_items
    ADD CONSTRAINT grn_items_pkey PRIMARY KEY (id);


--
-- Name: ingredient_categories ingredient_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ingredient_categories
    ADD CONSTRAINT ingredient_categories_pkey PRIMARY KEY (id);


--
-- Name: ingredients ingredients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ingredients
    ADD CONSTRAINT ingredients_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: kitchen_station_categories kitchen_station_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kitchen_station_categories
    ADD CONSTRAINT kitchen_station_categories_pkey PRIMARY KEY (id);


--
-- Name: kitchen_stations kitchen_stations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kitchen_stations
    ADD CONSTRAINT kitchen_stations_pkey PRIMARY KEY (id);


--
-- Name: modifier_groups modifier_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modifier_groups
    ADD CONSTRAINT modifier_groups_pkey PRIMARY KEY (id);


--
-- Name: modifiers modifiers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modifiers
    ADD CONSTRAINT modifiers_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: ocr_scans ocr_scans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ocr_scans
    ADD CONSTRAINT ocr_scans_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: order_void_logs order_void_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_void_logs
    ADD CONSTRAINT order_void_logs_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: outlets outlets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.outlets
    ADD CONSTRAINT outlets_pkey PRIMARY KEY (id);


--
-- Name: payment_transactions payment_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: payrolls payrolls_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payrolls
    ADD CONSTRAINT payrolls_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: petty_cash petty_cash_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.petty_cash
    ADD CONSTRAINT petty_cash_pkey PRIMARY KEY (id);


--
-- Name: printers printers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.printers
    ADD CONSTRAINT printers_pkey PRIMARY KEY (id);


--
-- Name: product_modifier_groups product_modifier_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_modifier_groups
    ADD CONSTRAINT product_modifier_groups_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: purchase_order_items purchase_order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_pkey PRIMARY KEY (id);


--
-- Name: purchase_orders purchase_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_pkey PRIMARY KEY (id);


--
-- Name: purchase_requisition_items purchase_requisition_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_requisition_items
    ADD CONSTRAINT purchase_requisition_items_pkey PRIMARY KEY (id);


--
-- Name: purchase_requisitions purchase_requisitions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_requisitions
    ADD CONSTRAINT purchase_requisitions_pkey PRIMARY KEY (id);


--
-- Name: quotation_requests quotation_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotation_requests
    ADD CONSTRAINT quotation_requests_pkey PRIMARY KEY (id);


--
-- Name: quotations quotations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT quotations_pkey PRIMARY KEY (id);


--
-- Name: recipes recipes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipes
    ADD CONSTRAINT recipes_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: stock_adjustment_logs stock_adjustment_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_adjustment_logs
    ADD CONSTRAINT stock_adjustment_logs_pkey PRIMARY KEY (id);


--
-- Name: stock_approval_requests stock_approval_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_approval_requests
    ADD CONSTRAINT stock_approval_requests_pkey PRIMARY KEY (id);


--
-- Name: stock_batches stock_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_batches
    ADD CONSTRAINT stock_batches_pkey PRIMARY KEY (id);


--
-- Name: stock_logs stock_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_logs
    ADD CONSTRAINT stock_logs_pkey PRIMARY KEY (id);


--
-- Name: stock_requests stock_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_requests
    ADD CONSTRAINT stock_requests_pkey PRIMARY KEY (id);


--
-- Name: stock_transfer_items stock_transfer_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_transfer_items
    ADD CONSTRAINT stock_transfer_items_pkey PRIMARY KEY (id);


--
-- Name: stock_transfers stock_transfers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_transfers
    ADD CONSTRAINT stock_transfers_pkey PRIMARY KEY (id);


--
-- Name: stock_write_offs stock_write_offs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_write_offs
    ADD CONSTRAINT stock_write_offs_pkey PRIMARY KEY (id);


--
-- Name: suppliers suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (id);


--
-- Name: tables tables_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tables
    ADD CONSTRAINT tables_pkey PRIMARY KEY (id);


--
-- Name: vouchers vouchers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vouchers
    ADD CONSTRAINT vouchers_pkey PRIMARY KEY (id);


--
-- Name: warehouses warehouses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouses
    ADD CONSTRAINT warehouses_pkey PRIMARY KEY (id);


--
-- Name: approval_workflows_level_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX approval_workflows_level_idx ON public.approval_workflows USING btree (level);


--
-- Name: approval_workflows_role_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX approval_workflows_role_id_idx ON public.approval_workflows USING btree (role_id);


--
-- Name: attendances_check_in_time_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX attendances_check_in_time_idx ON public.attendances USING btree (check_in_time);


--
-- Name: attendances_employee_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX attendances_employee_id_idx ON public.attendances USING btree (employee_id);


--
-- Name: audit_logs_action_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX audit_logs_action_idx ON public.audit_logs USING btree (action);


--
-- Name: audit_logs_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX audit_logs_created_at_idx ON public.audit_logs USING btree (created_at);


--
-- Name: audit_logs_entity_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX audit_logs_entity_type_idx ON public.audit_logs USING btree (entity_type);


--
-- Name: audit_logs_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX audit_logs_user_id_idx ON public.audit_logs USING btree (user_id);


--
-- Name: category_printers_category_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX category_printers_category_id_idx ON public.category_printers USING btree (category_id);


--
-- Name: category_printers_category_id_printer_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX category_printers_category_id_printer_id_key ON public.category_printers USING btree (category_id, printer_id);


--
-- Name: category_printers_printer_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX category_printers_printer_id_idx ON public.category_printers USING btree (printer_id);


--
-- Name: customer_order_items_order_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX customer_order_items_order_id_idx ON public.customer_order_items USING btree (order_id);


--
-- Name: customer_order_items_product_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX customer_order_items_product_id_idx ON public.customer_order_items USING btree (product_id);


--
-- Name: customer_orders_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX customer_orders_status_idx ON public.customer_orders USING btree (status);


--
-- Name: customer_orders_table_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX customer_orders_table_id_idx ON public.customer_orders USING btree (table_id);


--
-- Name: customers_is_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX customers_is_active_idx ON public.customers USING btree (is_active);


--
-- Name: customers_phone_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX customers_phone_idx ON public.customers USING btree (phone);


--
-- Name: customers_phone_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX customers_phone_key ON public.customers USING btree (phone);


--
-- Name: customers_tier_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX customers_tier_idx ON public.customers USING btree (tier);


--
-- Name: database_backups_backup_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX database_backups_backup_type_idx ON public.database_backups USING btree (backup_type);


--
-- Name: database_backups_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX database_backups_created_at_idx ON public.database_backups USING btree (created_at);


--
-- Name: database_backups_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX database_backups_status_idx ON public.database_backups USING btree (status);


--
-- Name: employees_is_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX employees_is_active_idx ON public.employees USING btree (is_active);


--
-- Name: employees_phone_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX employees_phone_idx ON public.employees USING btree (phone);


--
-- Name: employees_position_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX employees_position_idx ON public.employees USING btree ("position");


--
-- Name: goods_received_notes_grn_number_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX goods_received_notes_grn_number_idx ON public.goods_received_notes USING btree (grn_number);


--
-- Name: goods_received_notes_grn_number_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX goods_received_notes_grn_number_key ON public.goods_received_notes USING btree (grn_number);


--
-- Name: goods_received_notes_purchase_order_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX goods_received_notes_purchase_order_id_idx ON public.goods_received_notes USING btree (purchase_order_id);


--
-- Name: goods_received_notes_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX goods_received_notes_status_idx ON public.goods_received_notes USING btree (status);


--
-- Name: grn_items_grn_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX grn_items_grn_id_idx ON public.grn_items USING btree (grn_id);


--
-- Name: grn_items_ingredient_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX grn_items_ingredient_id_idx ON public.grn_items USING btree (ingredient_id);


--
-- Name: ingredients_barcode_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ingredients_barcode_idx ON public.ingredients USING btree (barcode);


--
-- Name: ingredients_category_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ingredients_category_id_idx ON public.ingredients USING btree (category_id);


--
-- Name: ingredients_name_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ingredients_name_idx ON public.ingredients USING btree (name);


--
-- Name: ingredients_sku_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ingredients_sku_idx ON public.ingredients USING btree (sku);


--
-- Name: ingredients_supplier_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ingredients_supplier_id_idx ON public.ingredients USING btree (supplier_id);


--
-- Name: ingredients_warehouse_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ingredients_warehouse_id_idx ON public.ingredients USING btree (warehouse_id);


--
-- Name: invoices_due_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX invoices_due_date_idx ON public.invoices USING btree (due_date);


--
-- Name: invoices_invoice_number_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX invoices_invoice_number_idx ON public.invoices USING btree (invoice_number);


--
-- Name: invoices_invoice_number_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX invoices_invoice_number_key ON public.invoices USING btree (invoice_number);


--
-- Name: invoices_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX invoices_status_idx ON public.invoices USING btree (status);


--
-- Name: invoices_supplier_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX invoices_supplier_id_idx ON public.invoices USING btree (supplier_id);


--
-- Name: kitchen_station_categories_category_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX kitchen_station_categories_category_id_idx ON public.kitchen_station_categories USING btree (category_id);


--
-- Name: kitchen_station_categories_kitchen_station_id_category_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX kitchen_station_categories_kitchen_station_id_category_id_key ON public.kitchen_station_categories USING btree (kitchen_station_id, category_id);


--
-- Name: kitchen_station_categories_kitchen_station_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX kitchen_station_categories_kitchen_station_id_idx ON public.kitchen_station_categories USING btree (kitchen_station_id);


--
-- Name: kitchen_stations_code_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX kitchen_stations_code_idx ON public.kitchen_stations USING btree (code);


--
-- Name: kitchen_stations_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX kitchen_stations_code_key ON public.kitchen_stations USING btree (code);


--
-- Name: kitchen_stations_outlet_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX kitchen_stations_outlet_id_idx ON public.kitchen_stations USING btree (outlet_id);


--
-- Name: modifiers_modifier_group_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX modifiers_modifier_group_id_idx ON public.modifiers USING btree (modifier_group_id);


--
-- Name: notifications_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX notifications_created_at_idx ON public.notifications USING btree (created_at);


--
-- Name: notifications_is_read_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX notifications_is_read_idx ON public.notifications USING btree (is_read);


--
-- Name: notifications_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX notifications_type_idx ON public.notifications USING btree (type);


--
-- Name: notifications_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX notifications_user_id_idx ON public.notifications USING btree (user_id);


--
-- Name: ocr_scans_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ocr_scans_created_at_idx ON public.ocr_scans USING btree (created_at);


--
-- Name: ocr_scans_scan_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ocr_scans_scan_type_idx ON public.ocr_scans USING btree (scan_type);


--
-- Name: ocr_scans_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ocr_scans_status_idx ON public.ocr_scans USING btree (status);


--
-- Name: ocr_scans_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ocr_scans_user_id_idx ON public.ocr_scans USING btree (user_id);


--
-- Name: order_items_order_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_items_order_id_idx ON public.order_items USING btree (order_id);


--
-- Name: order_items_product_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_items_product_id_idx ON public.order_items USING btree (product_id);


--
-- Name: order_items_split_group_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_items_split_group_id_idx ON public.order_items USING btree (split_group_id);


--
-- Name: order_items_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_items_status_idx ON public.order_items USING btree (status);


--
-- Name: order_void_logs_cashier_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_void_logs_cashier_id_idx ON public.order_void_logs USING btree (cashier_id);


--
-- Name: order_void_logs_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_void_logs_created_at_idx ON public.order_void_logs USING btree (created_at);


--
-- Name: order_void_logs_order_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_void_logs_order_id_idx ON public.order_void_logs USING btree (order_id);


--
-- Name: orders_cashier_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_cashier_id_idx ON public.orders USING btree (cashier_id);


--
-- Name: orders_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_created_at_idx ON public.orders USING btree (created_at);


--
-- Name: orders_customer_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_customer_id_idx ON public.orders USING btree (customer_id);


--
-- Name: orders_customer_order_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_customer_order_id_idx ON public.orders USING btree (customer_order_id);


--
-- Name: orders_outlet_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_outlet_id_idx ON public.orders USING btree (outlet_id);


--
-- Name: orders_payment_transaction_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_payment_transaction_id_idx ON public.orders USING btree (payment_transaction_id);


--
-- Name: orders_payment_transaction_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX orders_payment_transaction_id_key ON public.orders USING btree (payment_transaction_id);


--
-- Name: orders_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_status_idx ON public.orders USING btree (status);


--
-- Name: orders_table_number_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_table_number_idx ON public.orders USING btree (table_number);


--
-- Name: outlets_code_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX outlets_code_idx ON public.outlets USING btree (code);


--
-- Name: outlets_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX outlets_code_key ON public.outlets USING btree (code);


--
-- Name: outlets_company_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX outlets_company_id_idx ON public.outlets USING btree (company_id);


--
-- Name: payment_transactions_gateway_tx_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payment_transactions_gateway_tx_id_idx ON public.payment_transactions USING btree (gateway_tx_id);


--
-- Name: payment_transactions_gateway_tx_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX payment_transactions_gateway_tx_id_key ON public.payment_transactions USING btree (gateway_tx_id);


--
-- Name: payment_transactions_order_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payment_transactions_order_id_idx ON public.payment_transactions USING btree (order_id);


--
-- Name: payment_transactions_order_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX payment_transactions_order_id_key ON public.payment_transactions USING btree (order_id);


--
-- Name: payment_transactions_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payment_transactions_status_idx ON public.payment_transactions USING btree (status);


--
-- Name: payment_transactions_voided_by_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payment_transactions_voided_by_idx ON public.payment_transactions USING btree (voided_by);


--
-- Name: payments_invoice_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payments_invoice_id_idx ON public.payments USING btree (invoice_id);


--
-- Name: payments_payment_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payments_payment_date_idx ON public.payments USING btree (payment_date);


--
-- Name: payments_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payments_status_idx ON public.payments USING btree (status);


--
-- Name: payments_supplier_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payments_supplier_id_idx ON public.payments USING btree (supplier_id);


--
-- Name: payrolls_employee_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payrolls_employee_id_idx ON public.payrolls USING btree (employee_id);


--
-- Name: payrolls_period_end_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payrolls_period_end_idx ON public.payrolls USING btree (period_end);


--
-- Name: payrolls_period_start_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payrolls_period_start_idx ON public.payrolls USING btree (period_start);


--
-- Name: payrolls_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payrolls_status_idx ON public.payrolls USING btree (status);


--
-- Name: permissions_module_action_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX permissions_module_action_key ON public.permissions USING btree (module, action);


--
-- Name: permissions_module_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX permissions_module_idx ON public.permissions USING btree (module);


--
-- Name: permissions_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX permissions_name_key ON public.permissions USING btree (name);


--
-- Name: petty_cash_created_by_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX petty_cash_created_by_idx ON public.petty_cash USING btree (created_by);


--
-- Name: petty_cash_expense_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX petty_cash_expense_date_idx ON public.petty_cash USING btree (expense_date);


--
-- Name: petty_cash_ingredient_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX petty_cash_ingredient_id_idx ON public.petty_cash USING btree (ingredient_id);


--
-- Name: petty_cash_shift_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX petty_cash_shift_id_idx ON public.petty_cash USING btree (shift_id);


--
-- Name: product_modifier_groups_modifier_group_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_modifier_groups_modifier_group_id_idx ON public.product_modifier_groups USING btree (modifier_group_id);


--
-- Name: product_modifier_groups_product_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_modifier_groups_product_id_idx ON public.product_modifier_groups USING btree (product_id);


--
-- Name: product_modifier_groups_product_id_modifier_group_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX product_modifier_groups_product_id_modifier_group_id_key ON public.product_modifier_groups USING btree (product_id, modifier_group_id);


--
-- Name: products_category_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_category_id_idx ON public.products USING btree (category_id);


--
-- Name: products_name_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_name_idx ON public.products USING btree (name);


--
-- Name: products_outlet_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_outlet_id_idx ON public.products USING btree (outlet_id);


--
-- Name: products_sku_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_sku_idx ON public.products USING btree (sku);


--
-- Name: products_sku_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX products_sku_key ON public.products USING btree (sku);


--
-- Name: profiles_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX profiles_email_key ON public.profiles USING btree (email);


--
-- Name: profiles_outlet_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX profiles_outlet_id_idx ON public.profiles USING btree (outlet_id);


--
-- Name: profiles_role_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX profiles_role_id_idx ON public.profiles USING btree (role_id);


--
-- Name: profiles_username_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX profiles_username_key ON public.profiles USING btree (username);


--
-- Name: purchase_order_items_ingredient_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX purchase_order_items_ingredient_id_idx ON public.purchase_order_items USING btree (ingredient_id);


--
-- Name: purchase_order_items_purchase_order_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX purchase_order_items_purchase_order_id_idx ON public.purchase_order_items USING btree (purchase_order_id);


--
-- Name: purchase_orders_po_number_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX purchase_orders_po_number_idx ON public.purchase_orders USING btree (po_number);


--
-- Name: purchase_orders_po_number_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX purchase_orders_po_number_key ON public.purchase_orders USING btree (po_number);


--
-- Name: purchase_orders_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX purchase_orders_status_idx ON public.purchase_orders USING btree (status);


--
-- Name: purchase_orders_supplier_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX purchase_orders_supplier_id_idx ON public.purchase_orders USING btree (supplier_id);


--
-- Name: purchase_requisition_items_ingredient_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX purchase_requisition_items_ingredient_id_idx ON public.purchase_requisition_items USING btree (ingredient_id);


--
-- Name: purchase_requisition_items_purchase_requisition_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX purchase_requisition_items_purchase_requisition_id_idx ON public.purchase_requisition_items USING btree (purchase_requisition_id);


--
-- Name: purchase_requisition_items_supplier_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX purchase_requisition_items_supplier_id_idx ON public.purchase_requisition_items USING btree (supplier_id);


--
-- Name: purchase_requisitions_pr_number_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX purchase_requisitions_pr_number_idx ON public.purchase_requisitions USING btree (pr_number);


--
-- Name: purchase_requisitions_pr_number_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX purchase_requisitions_pr_number_key ON public.purchase_requisitions USING btree (pr_number);


--
-- Name: purchase_requisitions_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX purchase_requisitions_status_idx ON public.purchase_requisitions USING btree (status);


--
-- Name: quotation_requests_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX quotation_requests_status_idx ON public.quotation_requests USING btree (status);


--
-- Name: quotation_requests_stock_request_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX quotation_requests_stock_request_id_idx ON public.quotation_requests USING btree (stock_request_id);


--
-- Name: quotations_quotation_request_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX quotations_quotation_request_id_idx ON public.quotations USING btree (quotation_request_id);


--
-- Name: quotations_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX quotations_status_idx ON public.quotations USING btree (status);


--
-- Name: quotations_supplier_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX quotations_supplier_id_idx ON public.quotations USING btree (supplier_id);


--
-- Name: recipes_ingredient_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX recipes_ingredient_id_idx ON public.recipes USING btree (ingredient_id);


--
-- Name: recipes_menu_item_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX recipes_menu_item_id_idx ON public.recipes USING btree (menu_item_id);


--
-- Name: role_permissions_permission_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX role_permissions_permission_id_idx ON public.role_permissions USING btree (permission_id);


--
-- Name: role_permissions_role_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX role_permissions_role_id_idx ON public.role_permissions USING btree (role_id);


--
-- Name: role_permissions_role_id_permission_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX role_permissions_role_id_permission_id_key ON public.role_permissions USING btree (role_id, permission_id);


--
-- Name: roles_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX roles_name_key ON public.roles USING btree (name);


--
-- Name: stock_adjustment_logs_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX stock_adjustment_logs_created_at_idx ON public.stock_adjustment_logs USING btree (created_at);


--
-- Name: stock_adjustment_logs_ingredient_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX stock_adjustment_logs_ingredient_id_idx ON public.stock_adjustment_logs USING btree (ingredient_id);


--
-- Name: stock_adjustment_logs_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX stock_adjustment_logs_user_id_idx ON public.stock_adjustment_logs USING btree (user_id);


--
-- Name: stock_approval_requests_request_number_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX stock_approval_requests_request_number_idx ON public.stock_approval_requests USING btree (request_number);


--
-- Name: stock_approval_requests_request_number_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX stock_approval_requests_request_number_key ON public.stock_approval_requests USING btree (request_number);


--
-- Name: stock_approval_requests_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX stock_approval_requests_status_idx ON public.stock_approval_requests USING btree (status);


--
-- Name: stock_batches_batch_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX stock_batches_batch_code_key ON public.stock_batches USING btree (batch_code);


--
-- Name: stock_batches_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX stock_batches_created_at_idx ON public.stock_batches USING btree (created_at);


--
-- Name: stock_batches_expiry_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX stock_batches_expiry_date_idx ON public.stock_batches USING btree (expiry_date);


--
-- Name: stock_batches_ingredient_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX stock_batches_ingredient_id_idx ON public.stock_batches USING btree (ingredient_id);


--
-- Name: stock_logs_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX stock_logs_created_at_idx ON public.stock_logs USING btree (created_at);


--
-- Name: stock_logs_ingredient_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX stock_logs_ingredient_id_idx ON public.stock_logs USING btree (ingredient_id);


--
-- Name: stock_logs_reference_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX stock_logs_reference_id_idx ON public.stock_logs USING btree (reference_id);


--
-- Name: stock_logs_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX stock_logs_type_idx ON public.stock_logs USING btree (type);


--
-- Name: stock_requests_approval_level_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX stock_requests_approval_level_idx ON public.stock_requests USING btree (approval_level);


--
-- Name: stock_requests_requested_by_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX stock_requests_requested_by_idx ON public.stock_requests USING btree (requested_by);


--
-- Name: stock_requests_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX stock_requests_status_idx ON public.stock_requests USING btree (status);


--
-- Name: stock_transfer_items_ingredient_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX stock_transfer_items_ingredient_id_idx ON public.stock_transfer_items USING btree (ingredient_id);


--
-- Name: stock_transfer_items_transfer_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX stock_transfer_items_transfer_id_idx ON public.stock_transfer_items USING btree (transfer_id);


--
-- Name: stock_transfers_from_warehouse_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX stock_transfers_from_warehouse_id_idx ON public.stock_transfers USING btree (from_warehouse_id);


--
-- Name: stock_transfers_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX stock_transfers_status_idx ON public.stock_transfers USING btree (status);


--
-- Name: stock_transfers_to_warehouse_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX stock_transfers_to_warehouse_id_idx ON public.stock_transfers USING btree (to_warehouse_id);


--
-- Name: stock_transfers_transfer_number_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX stock_transfers_transfer_number_idx ON public.stock_transfers USING btree (transfer_number);


--
-- Name: stock_transfers_transfer_number_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX stock_transfers_transfer_number_key ON public.stock_transfers USING btree (transfer_number);


--
-- Name: stock_write_offs_ingredient_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX stock_write_offs_ingredient_id_idx ON public.stock_write_offs USING btree (ingredient_id);


--
-- Name: stock_write_offs_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX stock_write_offs_status_idx ON public.stock_write_offs USING btree (status);


--
-- Name: suppliers_category_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX suppliers_category_idx ON public.suppliers USING btree (category);


--
-- Name: suppliers_is_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX suppliers_is_active_idx ON public.suppliers USING btree (is_active);


--
-- Name: suppliers_name_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX suppliers_name_idx ON public.suppliers USING btree (name);


--
-- Name: tables_outlet_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX tables_outlet_id_idx ON public.tables USING btree (outlet_id);


--
-- Name: tables_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX tables_status_idx ON public.tables USING btree (status);


--
-- Name: tables_table_number_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX tables_table_number_idx ON public.tables USING btree (table_number);


--
-- Name: tables_table_number_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX tables_table_number_key ON public.tables USING btree (table_number);


--
-- Name: vouchers_code_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX vouchers_code_idx ON public.vouchers USING btree (code);


--
-- Name: vouchers_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX vouchers_code_key ON public.vouchers USING btree (code);


--
-- Name: vouchers_is_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX vouchers_is_active_idx ON public.vouchers USING btree (is_active);


--
-- Name: vouchers_valid_from_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX vouchers_valid_from_idx ON public.vouchers USING btree (valid_from);


--
-- Name: vouchers_valid_until_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX vouchers_valid_until_idx ON public.vouchers USING btree (valid_until);


--
-- Name: warehouses_code_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX warehouses_code_idx ON public.warehouses USING btree (code);


--
-- Name: warehouses_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX warehouses_code_key ON public.warehouses USING btree (code);


--
-- Name: warehouses_outlet_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX warehouses_outlet_id_idx ON public.warehouses USING btree (outlet_id);


--
-- Name: attendances attendances_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT attendances_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: category_printers category_printers_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.category_printers
    ADD CONSTRAINT category_printers_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: category_printers category_printers_printer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.category_printers
    ADD CONSTRAINT category_printers_printer_id_fkey FOREIGN KEY (printer_id) REFERENCES public.printers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: customer_order_items customer_order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_order_items
    ADD CONSTRAINT customer_order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.customer_orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: customer_order_items customer_order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_order_items
    ADD CONSTRAINT customer_order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: customer_orders customer_orders_table_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_orders
    ADD CONSTRAINT customer_orders_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.tables(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: goods_received_notes goods_received_notes_purchase_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.goods_received_notes
    ADD CONSTRAINT goods_received_notes_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: goods_received_notes goods_received_notes_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.goods_received_notes
    ADD CONSTRAINT goods_received_notes_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: grn_items grn_items_grn_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grn_items
    ADD CONSTRAINT grn_items_grn_id_fkey FOREIGN KEY (grn_id) REFERENCES public.goods_received_notes(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: grn_items grn_items_ingredient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grn_items
    ADD CONSTRAINT grn_items_ingredient_id_fkey FOREIGN KEY (ingredient_id) REFERENCES public.ingredients(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ingredients ingredients_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ingredients
    ADD CONSTRAINT ingredients_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.ingredient_categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ingredients ingredients_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ingredients
    ADD CONSTRAINT ingredients_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ingredients ingredients_warehouse_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ingredients
    ADD CONSTRAINT ingredients_warehouse_id_fkey FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: invoices invoices_grn_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_grn_id_fkey FOREIGN KEY (grn_id) REFERENCES public.goods_received_notes(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: invoices invoices_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: kitchen_station_categories kitchen_station_categories_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kitchen_station_categories
    ADD CONSTRAINT kitchen_station_categories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: kitchen_station_categories kitchen_station_categories_kitchen_station_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kitchen_station_categories
    ADD CONSTRAINT kitchen_station_categories_kitchen_station_id_fkey FOREIGN KEY (kitchen_station_id) REFERENCES public.kitchen_stations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: kitchen_stations kitchen_stations_outlet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kitchen_stations
    ADD CONSTRAINT kitchen_stations_outlet_id_fkey FOREIGN KEY (outlet_id) REFERENCES public.outlets(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: modifiers modifiers_modifier_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modifiers
    ADD CONSTRAINT modifiers_modifier_group_id_fkey FOREIGN KEY (modifier_group_id) REFERENCES public.modifier_groups(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_items order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: order_void_logs order_void_logs_cashier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_void_logs
    ADD CONSTRAINT order_void_logs_cashier_id_fkey FOREIGN KEY (cashier_id) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: order_void_logs order_void_logs_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_void_logs
    ADD CONSTRAINT order_void_logs_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_void_logs order_void_logs_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_void_logs
    ADD CONSTRAINT order_void_logs_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: orders orders_cashier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_cashier_id_fkey FOREIGN KEY (cashier_id) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: orders orders_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: orders orders_customer_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_customer_order_id_fkey FOREIGN KEY (customer_order_id) REFERENCES public.customer_orders(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: orders orders_outlet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_outlet_id_fkey FOREIGN KEY (outlet_id) REFERENCES public.outlets(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: outlets outlets_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.outlets
    ADD CONSTRAINT outlets_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: payment_transactions payment_transactions_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: payment_transactions payment_transactions_voided_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_voided_by_fkey FOREIGN KEY (voided_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: payments payments_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: payrolls payrolls_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payrolls
    ADD CONSTRAINT payrolls_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: petty_cash petty_cash_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.petty_cash
    ADD CONSTRAINT petty_cash_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: petty_cash petty_cash_ingredient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.petty_cash
    ADD CONSTRAINT petty_cash_ingredient_id_fkey FOREIGN KEY (ingredient_id) REFERENCES public.ingredients(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: product_modifier_groups product_modifier_groups_modifier_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_modifier_groups
    ADD CONSTRAINT product_modifier_groups_modifier_group_id_fkey FOREIGN KEY (modifier_group_id) REFERENCES public.modifier_groups(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_modifier_groups product_modifier_groups_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_modifier_groups
    ADD CONSTRAINT product_modifier_groups_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: products products_outlet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_outlet_id_fkey FOREIGN KEY (outlet_id) REFERENCES public.outlets(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: profiles profiles_outlet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_outlet_id_fkey FOREIGN KEY (outlet_id) REFERENCES public.outlets(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: profiles profiles_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: purchase_order_items purchase_order_items_ingredient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_ingredient_id_fkey FOREIGN KEY (ingredient_id) REFERENCES public.ingredients(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: purchase_order_items purchase_order_items_purchase_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: purchase_orders purchase_orders_quotation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_quotation_id_fkey FOREIGN KEY (quotation_id) REFERENCES public.quotations(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: purchase_orders purchase_orders_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: purchase_requisition_items purchase_requisition_items_ingredient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_requisition_items
    ADD CONSTRAINT purchase_requisition_items_ingredient_id_fkey FOREIGN KEY (ingredient_id) REFERENCES public.ingredients(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: purchase_requisition_items purchase_requisition_items_purchase_requisition_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_requisition_items
    ADD CONSTRAINT purchase_requisition_items_purchase_requisition_id_fkey FOREIGN KEY (purchase_requisition_id) REFERENCES public.purchase_requisitions(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: quotation_requests quotation_requests_stock_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotation_requests
    ADD CONSTRAINT quotation_requests_stock_request_id_fkey FOREIGN KEY (stock_request_id) REFERENCES public.stock_requests(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: quotations quotations_quotation_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT quotations_quotation_request_id_fkey FOREIGN KEY (quotation_request_id) REFERENCES public.quotation_requests(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: quotations quotations_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT quotations_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: recipes recipes_ingredient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipes
    ADD CONSTRAINT recipes_ingredient_id_fkey FOREIGN KEY (ingredient_id) REFERENCES public.ingredients(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: recipes recipes_menu_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipes
    ADD CONSTRAINT recipes_menu_item_id_fkey FOREIGN KEY (menu_item_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: role_permissions role_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: stock_adjustment_logs stock_adjustment_logs_ingredient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_adjustment_logs
    ADD CONSTRAINT stock_adjustment_logs_ingredient_id_fkey FOREIGN KEY (ingredient_id) REFERENCES public.ingredients(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: stock_batches stock_batches_ingredient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_batches
    ADD CONSTRAINT stock_batches_ingredient_id_fkey FOREIGN KEY (ingredient_id) REFERENCES public.ingredients(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: stock_logs stock_logs_ingredient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_logs
    ADD CONSTRAINT stock_logs_ingredient_id_fkey FOREIGN KEY (ingredient_id) REFERENCES public.ingredients(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: stock_requests stock_requests_ingredient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_requests
    ADD CONSTRAINT stock_requests_ingredient_id_fkey FOREIGN KEY (ingredient_id) REFERENCES public.ingredients(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: stock_requests stock_requests_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_requests
    ADD CONSTRAINT stock_requests_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: stock_transfer_items stock_transfer_items_ingredient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_transfer_items
    ADD CONSTRAINT stock_transfer_items_ingredient_id_fkey FOREIGN KEY (ingredient_id) REFERENCES public.ingredients(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: stock_transfer_items stock_transfer_items_transfer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_transfer_items
    ADD CONSTRAINT stock_transfer_items_transfer_id_fkey FOREIGN KEY (transfer_id) REFERENCES public.stock_transfers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: stock_transfers stock_transfers_from_warehouse_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_transfers
    ADD CONSTRAINT stock_transfers_from_warehouse_id_fkey FOREIGN KEY (from_warehouse_id) REFERENCES public.warehouses(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: stock_transfers stock_transfers_to_warehouse_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_transfers
    ADD CONSTRAINT stock_transfers_to_warehouse_id_fkey FOREIGN KEY (to_warehouse_id) REFERENCES public.warehouses(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: stock_write_offs stock_write_offs_ingredient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_write_offs
    ADD CONSTRAINT stock_write_offs_ingredient_id_fkey FOREIGN KEY (ingredient_id) REFERENCES public.ingredients(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tables tables_outlet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tables
    ADD CONSTRAINT tables_outlet_id_fkey FOREIGN KEY (outlet_id) REFERENCES public.outlets(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: warehouses warehouses_outlet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouses
    ADD CONSTRAINT warehouses_outlet_id_fkey FOREIGN KEY (outlet_id) REFERENCES public.outlets(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict zj33ZpzYO5oVwTcK4eKPG8BMooEbbtBBXirzymVDFM2URNnJSujIP547asgo4y6

