-- Supabase / PostgreSQL
-- Admin Promoin: akun admin, sesi login, pengaturan brand, dan pencatatan pesanan.
--
-- Cara pakai:
--   1. Jalankan seluruh file ini di Supabase SQL Editor. Aman dijalankan ulang.
--   2. Buat akun admin pertama (ganti username dan password):
--
--        insert into public.admin_users (username, password_hash)
--        values ('admin', extensions.crypt('GANTI-PASSWORD-INI', extensions.gen_salt('bf')));
--
--   3. Buka /admin di aplikasi lalu login.
--
-- Keamanan tanpa service role:
--   - Semua tabel memakai RLS. Browser (publishable/anon key) hanya boleh MEMBACA
--     brand_settings. Tabel admin, sesi, dan pesanan tidak bisa diakses langsung.
--   - Perubahan hanya lewat fungsi RPC "security definer". Fungsi admin memeriksa
--     token sesi di admin_sessions sebelum menulis data.
--   - Password disimpan sebagai hash bcrypt. Token sesi disimpan sebagai hash SHA-256.
--   - Harga pesanan dihitung ulang di database, bukan dipercaya dari browser.

begin;

create extension if not exists pgcrypto with schema extensions;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- ============================================================
-- TABEL
-- ============================================================

create table if not exists public.admin_users (
    id bigint generated always as identity primary key,
    username text not null unique,
    password_hash text not null,
    failed_attempts integer not null default 0,
    locked_until timestamptz,
    created_at timestamptz not null default now(),

    constraint admin_users_username_check
        check (username = lower(username) and length(username) between 3 and 40)
);

create table if not exists public.admin_sessions (
    token_hash text primary key,
    admin_id bigint not null references public.admin_users (id) on delete cascade,
    expires_at timestamptz not null,
    created_at timestamptz not null default now()
);

create index if not exists admin_sessions_admin_id_idx
    on public.admin_sessions (admin_id);

create table if not exists public.brand_settings (
    brand text primary key,
    is_visible boolean not null default true,
    -- null = pakai selling_price dari tabel products
    -- 0    = tanpa diskon (harga normal)
    -- 1-90 = harga jual = harga normal x (100 - diskon)%, dibulatkan ke Rp 500
    discount_percent integer,
    updated_at timestamptz not null default now(),

    constraint brand_settings_discount_check
        check (discount_percent is null or discount_percent between 0 and 90)
);

-- Brand tidak dikunci ke daftar tetap agar brand baru di app/types/products.ts
-- (misalnya 'chagee') langsung bisa diatur dari admin.
alter table public.brand_settings
    drop constraint if exists brand_settings_brand_check;
alter table public.brand_settings
    drop constraint if exists brand_settings_brand_format_check;
alter table public.brand_settings
    add constraint brand_settings_brand_format_check
        check (brand ~ '^[a-z0-9_-]{2,30}$');

insert into public.brand_settings (brand)
values ('fore'), ('kopken'), ('tomoro'), ('starbuck'), ('chagee')
on conflict (brand) do nothing;

create table if not exists public.orders (
    id bigint generated always as identity primary key,
    customer_name text not null,
    status text not null default 'new',
    subtotal integer not null,
    admin_fee integer not null,
    total integer not null,
    outlets jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint orders_status_check
        check (status in ('new', 'paid', 'cancelled'))
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);

create table if not exists public.order_items (
    id bigint generated always as identity primary key,
    order_id bigint not null references public.orders (id) on delete cascade,
    product_id bigint not null,
    brand text not null,
    name text not null,
    qty integer not null,
    unit_price integer not null,
    subtotal integer not null,
    options jsonb not null default '[]'::jsonb,

    constraint order_items_qty_check check (qty between 1 and 99),
    constraint order_items_price_check check (unit_price >= 0)
);

create index if not exists order_items_order_id_idx on public.order_items (order_id);
create index if not exists order_items_brand_idx on public.order_items (brand);

-- ============================================================
-- RLS & HAK AKSES
-- ============================================================

alter table public.admin_users enable row level security;
alter table public.admin_sessions enable row level security;
alter table public.brand_settings enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

revoke all on public.admin_users, public.admin_sessions, public.orders, public.order_items
    from anon, authenticated;
revoke insert, update, delete, truncate on public.brand_settings from anon, authenticated;
grant select on public.brand_settings to anon, authenticated;

drop policy if exists "brand_settings_public_read" on public.brand_settings;
create policy "brand_settings_public_read"
    on public.brand_settings
    for select
    to anon, authenticated
    using (true);

-- ============================================================
-- HELPER (schema private, tidak bisa dipanggil dari browser)
-- ============================================================

create or replace function private.token_hash(p_token text)
returns text
language sql
immutable
set search_path = ''
as $$
    select encode(extensions.digest(coalesce(p_token, ''), 'sha256'), 'hex');
$$;

-- Harus sama dengan applyBrandPrice() di app/lib/brandSettings.ts
create or replace function private.brand_selling_price(
    p_original numeric,
    p_selling numeric,
    p_discount integer
)
returns integer
language sql
immutable
set search_path = ''
as $$
    select case
        when p_discount is null then round(coalesce(p_selling, 0))::integer
        when p_discount = 0 then round(coalesce(p_original, 0))::integer
        else least(
            round(coalesce(p_original, 0)),
            round((coalesce(p_original, 0) * (100 - p_discount)) / 50000) * 500
        )::integer
    end;
$$;

create or replace function private.require_admin(p_token text)
returns bigint
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
    v_admin_id bigint;
begin
    if p_token is null or length(p_token) < 32 then
        raise exception 'UNAUTHORIZED' using errcode = '28000';
    end if;

    select s.admin_id
      into v_admin_id
      from public.admin_sessions s
     where s.token_hash = private.token_hash(p_token)
       and s.expires_at > now();

    if v_admin_id is null then
        raise exception 'UNAUTHORIZED' using errcode = '28000';
    end if;

    return v_admin_id;
end;
$$;

revoke all on function private.token_hash(text) from public, anon, authenticated;
revoke all on function private.brand_selling_price(numeric, numeric, integer)
    from public, anon, authenticated;
revoke all on function private.require_admin(text) from public, anon, authenticated;

-- ============================================================
-- RPC: LOGIN / LOGOUT / SESI
-- ============================================================

-- Mengembalikan { ok, token, username, expires_at } atau { ok: false, error }.
-- Error dikembalikan sebagai data (bukan exception) agar hitungan gagal login tersimpan.
create or replace function public.admin_login(p_username text, p_password text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
    v_user public.admin_users%rowtype;
    v_attempts integer;
    v_token text;
    v_expires timestamptz := now() + interval '7 days';
begin
    select *
      into v_user
      from public.admin_users
     where username = lower(trim(coalesce(p_username, '')));

    if not found then
        -- Samakan waktu respons agar username tidak mudah ditebak.
        perform extensions.crypt(coalesce(p_password, ''), extensions.gen_salt('bf'));
        return jsonb_build_object('ok', false, 'error', 'INVALID_CREDENTIALS');
    end if;

    if v_user.locked_until is not null and v_user.locked_until > now() then
        return jsonb_build_object(
            'ok', false,
            'error', 'ACCOUNT_LOCKED',
            'locked_until', v_user.locked_until
        );
    end if;

    v_attempts := case
        when v_user.locked_until is not null then 0
        else v_user.failed_attempts
    end;

    if v_user.password_hash <> extensions.crypt(coalesce(p_password, ''), v_user.password_hash) then
        update public.admin_users
           set failed_attempts = v_attempts + 1,
               locked_until = case
                   when v_attempts + 1 >= 5 then now() + interval '15 minutes'
                   else null
               end
         where id = v_user.id;

        return jsonb_build_object('ok', false, 'error', 'INVALID_CREDENTIALS');
    end if;

    update public.admin_users
       set failed_attempts = 0,
           locked_until = null
     where id = v_user.id;

    delete from public.admin_sessions where expires_at <= now();

    v_token := encode(extensions.gen_random_bytes(32), 'hex');

    insert into public.admin_sessions (token_hash, admin_id, expires_at)
    values (private.token_hash(v_token), v_user.id, v_expires);

    return jsonb_build_object(
        'ok', true,
        'token', v_token,
        'username', v_user.username,
        'expires_at', v_expires
    );
end;
$$;

create or replace function public.admin_logout(p_token text)
returns void
language sql
volatile
security definer
set search_path = ''
as $$
    delete from public.admin_sessions where token_hash = private.token_hash(p_token);
$$;

create or replace function public.admin_me(p_token text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
    v_admin_id bigint := private.require_admin(p_token);
begin
    return (
        select jsonb_build_object('username', u.username)
          from public.admin_users u
         where u.id = v_admin_id
    );
end;
$$;

-- ============================================================
-- RPC: PENGATURAN BRAND
-- ============================================================

create or replace function public.admin_update_brand(
    p_token text,
    p_brand text,
    p_is_visible boolean,
    p_discount_percent integer
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
    v_row public.brand_settings%rowtype;
begin
    perform private.require_admin(p_token);

    if p_is_visible is null then
        raise exception 'INVALID_INPUT' using errcode = '22023';
    end if;

    insert into public.brand_settings (brand, is_visible, discount_percent, updated_at)
    values (p_brand, p_is_visible, p_discount_percent, now())
    on conflict (brand) do update
        set is_visible = excluded.is_visible,
            discount_percent = excluded.discount_percent,
            updated_at = now()
    returning * into v_row;

    return to_jsonb(v_row);
end;
$$;

-- ============================================================
-- RPC: DASHBOARD & PESANAN
-- ============================================================

-- Penjualan dihitung hanya dari pesanan berstatus 'paid'.
create or replace function public.admin_dashboard(p_token text, p_from timestamptz default null)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
    v_totals jsonb;
    v_brands jsonb;
begin
    perform private.require_admin(p_token);

    select jsonb_build_object(
               'paid_orders', count(*) filter (where o.status = 'paid'),
               'new_orders', count(*) filter (where o.status = 'new'),
               'cancelled_orders', count(*) filter (where o.status = 'cancelled'),
               'paid_revenue', coalesce(sum(o.total) filter (where o.status = 'paid'), 0)
           )
      into v_totals
      from public.orders o
     where p_from is null or o.created_at >= p_from;

    select coalesce(jsonb_agg(to_jsonb(b) order by b.revenue desc), '[]'::jsonb)
      into v_brands
      from (
          select i.brand,
                 count(distinct o.id) as paid_orders,
                 sum(i.qty) as cups,
                 sum(i.subtotal) as revenue
            from public.order_items i
            join public.orders o on o.id = i.order_id
           where o.status = 'paid'
             and (p_from is null or o.created_at >= p_from)
           group by i.brand
      ) b;

    return jsonb_build_object('totals', v_totals, 'brands', v_brands);
end;
$$;

create or replace function public.admin_list_orders(
    p_token text,
    p_status text default null,
    p_from timestamptz default null,
    p_limit integer default 30
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
    perform private.require_admin(p_token);

    return (
        select coalesce(jsonb_agg(to_jsonb(x) order by x.created_at desc), '[]'::jsonb)
          from (
              select o.id,
                     o.customer_name,
                     o.status,
                     o.subtotal,
                     o.admin_fee,
                     o.total,
                     o.outlets,
                     o.created_at,
                     (
                         select coalesce(
                                    jsonb_agg(
                                        jsonb_build_object(
                                            'brand', i.brand,
                                            'name', i.name,
                                            'qty', i.qty,
                                            'unit_price', i.unit_price,
                                            'subtotal', i.subtotal,
                                            'options', i.options
                                        )
                                        order by i.id
                                    ),
                                    '[]'::jsonb
                                )
                           from public.order_items i
                          where i.order_id = o.id
                     ) as items
                from public.orders o
               where (p_status is null or o.status = p_status)
                 and (p_from is null or o.created_at >= p_from)
               order by o.created_at desc
               limit least(greatest(coalesce(p_limit, 30), 1), 100)
          ) x
    );
end;
$$;

create or replace function public.admin_set_order_status(
    p_token text,
    p_order_id bigint,
    p_status text
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
    v_status text;
begin
    perform private.require_admin(p_token);

    update public.orders
       set status = p_status,
           updated_at = now()
     where id = p_order_id
    returning status into v_status;

    if v_status is null then
        raise exception 'ORDER_NOT_FOUND' using errcode = 'P0002';
    end if;

    return jsonb_build_object('id', p_order_id, 'status', v_status);
end;
$$;

-- ============================================================
-- RPC: CHECKOUT (dipanggil pembeli)
-- ============================================================

-- p_items: [{ product_id, qty, unit_price, options: [{ name, value }] }]
-- p_outlets: { "<brand>": <outlet_id>, ... }
-- Mengembalikan { ok: true, order_id, total } atau { ok: false, error, ... }.
create or replace function public.create_order(
    p_customer_name text,
    p_items jsonb,
    p_outlets jsonb
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
    c_admin_fee constant integer := 5000;
    v_name text := trim(coalesce(p_customer_name, ''));
    v_item jsonb;
    v_option jsonb;
    v_qty_raw numeric;
    v_qty integer;
    v_product_id bigint;
    v_product_code text;
    v_brand text;
    v_product_name text;
    v_original numeric;
    v_selling numeric;
    v_visible boolean;
    v_discount integer;
    v_option_price numeric;
    v_option_total integer;
    v_unit integer;
    v_lines jsonb := '[]'::jsonb;
    v_subtotal integer := 0;
    v_hidden text[] := '{}';
    v_changed text[] := '{}';
    v_outlets jsonb := '{}'::jsonb;
    v_outlet_key text;
    v_outlet_value jsonb;
    v_outlet_name text;
    v_order_id bigint;
begin
    if length(v_name) < 2 or length(v_name) > 80 then
        return jsonb_build_object('ok', false, 'error', 'INVALID_NAME');
    end if;

    if jsonb_typeof(p_items) is distinct from 'array'
       or jsonb_array_length(p_items) = 0
       or jsonb_array_length(p_items) > 50 then
        return jsonb_build_object('ok', false, 'error', 'INVALID_ITEMS');
    end if;

    for v_item in select value from jsonb_array_elements(p_items) loop
        if jsonb_typeof(v_item -> 'product_id') is distinct from 'number'
           or jsonb_typeof(v_item -> 'qty') is distinct from 'number'
           or jsonb_typeof(v_item -> 'unit_price') is distinct from 'number' then
            return jsonb_build_object('ok', false, 'error', 'INVALID_ITEMS');
        end if;

        v_qty_raw := (v_item ->> 'qty')::numeric;
        if v_qty_raw <> trunc(v_qty_raw) or v_qty_raw < 1 or v_qty_raw > 99 then
            return jsonb_build_object('ok', false, 'error', 'INVALID_ITEMS');
        end if;
        v_qty := v_qty_raw::integer;
        v_product_id := (v_item ->> 'product_id')::bigint;

        select p.product_id, p.brand, p.name, p.original_price, p.selling_price
          into v_product_code, v_brand, v_product_name, v_original, v_selling
          from public.products p
         where p.id = v_product_id;

        if not found then
            return jsonb_build_object('ok', false, 'error', 'INVALID_ITEMS');
        end if;

        v_visible := true;
        v_discount := null;
        select bs.is_visible, bs.discount_percent
          into v_visible, v_discount
          from public.brand_settings bs
         where bs.brand = v_brand;
        v_visible := coalesce(v_visible, true);

        if not v_visible then
            if not (coalesce(v_brand, '') = any (v_hidden)) then
                v_hidden := array_append(v_hidden, coalesce(v_brand, ''));
            end if;
            continue;
        end if;

        v_option_total := 0;

        if jsonb_typeof(v_item -> 'options') = 'array' then
            for v_option in select value from jsonb_array_elements(v_item -> 'options') loop
                select ov.price_modifier
                  into v_option_price
                  from public.option_values ov
                  join public.product_options po on po.id = ov.option_id
                 where po.product_id = v_product_code
                   and po.name = v_option ->> 'name'
                   and ov.value = v_option ->> 'value'
                 limit 1;

                if not found then
                    return jsonb_build_object('ok', false, 'error', 'INVALID_OPTIONS');
                end if;

                v_option_total := v_option_total + round(coalesce(v_option_price, 0))::integer;
            end loop;
        end if;

        v_unit := private.brand_selling_price(v_original, v_selling, v_discount) + v_option_total;

        if (v_item ->> 'unit_price')::numeric <> v_unit then
            v_changed := array_append(v_changed, coalesce(v_product_name, ''));
        end if;

        v_subtotal := v_subtotal + v_unit * v_qty;
        v_lines := v_lines || jsonb_build_array(
            jsonb_build_object(
                'product_id', v_product_id,
                'brand', coalesce(v_brand, ''),
                'name', coalesce(v_product_name, ''),
                'qty', v_qty,
                'unit_price', v_unit,
                'subtotal', v_unit * v_qty,
                'options', coalesce(
                    (
                        select jsonb_agg(
                                   jsonb_build_object(
                                       'name', o.value ->> 'name',
                                       'value', o.value ->> 'value'
                                   )
                               )
                          from jsonb_array_elements(
                                   case when jsonb_typeof(v_item -> 'options') = 'array'
                                        then v_item -> 'options'
                                        else '[]'::jsonb
                                   end
                               ) o
                    ),
                    '[]'::jsonb
                )
            )
        );
    end loop;

    if array_length(v_hidden, 1) > 0 then
        return jsonb_build_object('ok', false, 'error', 'BRAND_HIDDEN', 'brands', to_jsonb(v_hidden));
    end if;

    if array_length(v_changed, 1) > 0 then
        return jsonb_build_object('ok', false, 'error', 'PRICE_CHANGED', 'items', to_jsonb(v_changed));
    end if;

    if jsonb_typeof(p_outlets) = 'object' then
        for v_outlet_key, v_outlet_value in select key, value from jsonb_each(p_outlets) loop
            if jsonb_typeof(v_outlet_value) is distinct from 'number' then
                return jsonb_build_object('ok', false, 'error', 'INVALID_OUTLET');
            end if;

            select ot.name
              into v_outlet_name
              from public.outlets ot
             where ot.id = (v_outlet_value #>> '{}')::bigint
               and ot.brand = v_outlet_key;

            if not found then
                return jsonb_build_object('ok', false, 'error', 'INVALID_OUTLET');
            end if;

            v_outlets := v_outlets || jsonb_build_object(
                v_outlet_key,
                jsonb_build_object('id', (v_outlet_value #>> '{}')::bigint, 'name', v_outlet_name)
            );
        end loop;
    end if;

    insert into public.orders (customer_name, subtotal, admin_fee, total, outlets)
    values (v_name, v_subtotal, c_admin_fee, v_subtotal + c_admin_fee, v_outlets)
    returning id into v_order_id;

    insert into public.order_items (order_id, product_id, brand, name, qty, unit_price, subtotal, options)
    select v_order_id,
           (line ->> 'product_id')::bigint,
           line ->> 'brand',
           line ->> 'name',
           (line ->> 'qty')::integer,
           (line ->> 'unit_price')::integer,
           (line ->> 'subtotal')::integer,
           line -> 'options'
      from jsonb_array_elements(v_lines) line;

    return jsonb_build_object(
        'ok', true,
        'order_id', v_order_id,
        'total', v_subtotal + c_admin_fee
    );
end;
$$;

-- Fungsi publik bisa dipanggil dengan publishable/anon key.
-- Fungsi admin tetap menolak tanpa token sesi yang valid.
revoke all on function public.admin_login(text, text) from public;
revoke all on function public.admin_logout(text) from public;
revoke all on function public.admin_me(text) from public;
revoke all on function public.admin_update_brand(text, text, boolean, integer) from public;
revoke all on function public.admin_dashboard(text, timestamptz) from public;
revoke all on function public.admin_list_orders(text, text, timestamptz, integer) from public;
revoke all on function public.admin_set_order_status(text, bigint, text) from public;
revoke all on function public.create_order(text, jsonb, jsonb) from public;

grant execute on function public.admin_login(text, text) to anon, authenticated;
grant execute on function public.admin_logout(text) to anon, authenticated;
grant execute on function public.admin_me(text) to anon, authenticated;
grant execute on function public.admin_update_brand(text, text, boolean, integer) to anon, authenticated;
grant execute on function public.admin_dashboard(text, timestamptz) to anon, authenticated;
grant execute on function public.admin_list_orders(text, text, timestamptz, integer) to anon, authenticated;
grant execute on function public.admin_set_order_status(text, bigint, text) to anon, authenticated;
grant execute on function public.create_order(text, jsonb, jsonb) to anon, authenticated;

commit;
