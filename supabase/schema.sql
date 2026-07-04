create extension if not exists "pgcrypto";

create type public.user_role as enum ('sales', 'operations', 'finance', 'admin');
create type public.pricing_mode as enum ('whole_door', 'area_price');
create type public.cost_source as enum ('dispatch_form', 'acceptance_form', 'special_request');
create type public.finance_status as enum ('draft', 'submitted', 'finance_approved', 'posted', 'rejected');
create type public.payment_stage as enum ('payment_1', 'payment_2', 'payment_3');

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.user_role not null default 'operations',
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  code text,
  created_at timestamptz not null default now()
);

create table public.sales_orders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete restrict,
  so_number text not null,
  contract_number text not null,
  installation_revenue numeric(14, 2) not null check (installation_revenue >= 0),
  door_model text not null,
  quantity numeric(12, 2) not null check (quantity >= 0),
  area_square_meter numeric(12, 2) not null check (area_square_meter >= 0),
  created_at timestamptz not null default now(),
  unique (organization_id, so_number)
);

create table public.vendors (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  code text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.vendor_budgets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  sales_order_id uuid not null references public.sales_orders(id) on delete cascade,
  vendor_id uuid not null references public.vendors(id) on delete restrict,
  allocation_rate numeric(7, 6) not null check (allocation_rate >= 0 and allocation_rate <= 1),
  budget_amount numeric(14, 2) not null check (budget_amount >= 0),
  required_margin_rate numeric(7, 6) not null default 0.3 check (required_margin_rate >= 0 and required_margin_rate <= 1),
  created_at timestamptz not null default now()
);

create table public.price_list (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  door_model text not null,
  pricing_mode public.pricing_mode not null,
  min_price numeric(14, 2) not null check (min_price >= 0),
  list_price numeric(14, 2) not null check (list_price >= 0),
  max_price numeric(14, 2) not null check (max_price >= 0),
  valid_from date not null,
  valid_to date not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  check (min_price <= list_price and list_price <= max_price),
  check (valid_from <= valid_to)
);

create table public.application_forms (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  sales_order_id uuid not null references public.sales_orders(id) on delete cascade,
  vendor_budget_id uuid not null references public.vendor_budgets(id) on delete restrict,
  form_number text not null,
  requested_unit_price numeric(14, 2) not null check (requested_unit_price >= 0),
  accepted_unit_price numeric(14, 2) not null check (accepted_unit_price >= 0),
  billable_quantity numeric(12, 2) not null check (billable_quantity >= 0),
  standard_installation_amount numeric(14, 2) not null check (standard_installation_amount >= 0),
  first_payment_rate numeric(7, 6) not null check (first_payment_rate in (0.5, 0.666, 0.7)),
  status public.finance_status not null default 'draft',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (organization_id, form_number)
);

create table public.extra_costs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  sales_order_id uuid not null references public.sales_orders(id) on delete cascade,
  application_form_id uuid references public.application_forms(id) on delete cascade,
  cost_source public.cost_source not null,
  cost_type text not null,
  description text,
  amount numeric(14, 2) not null check (amount >= 0),
  margin_checkable boolean not null default true,
  offline_approval_reference text,
  created_at timestamptz not null default now()
);

create table public.acceptance_forms (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  sales_order_id uuid not null references public.sales_orders(id) on delete cascade,
  application_form_id uuid not null references public.application_forms(id) on delete cascade,
  accepted_quantity numeric(12, 2) not null check (accepted_quantity >= 0),
  status public.finance_status not null default 'submitted',
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.payment_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  application_form_id uuid not null references public.application_forms(id) on delete cascade,
  stage public.payment_stage not null,
  cumulative_rate numeric(7, 6) not null check (cumulative_rate >= 0 and cumulative_rate <= 1),
  base_amount numeric(14, 2) not null check (base_amount >= 0),
  prior_paid_amount numeric(14, 2) not null default 0 check (prior_paid_amount >= 0),
  payable_amount numeric(14, 2) not null check (payable_amount >= 0),
  status public.finance_status not null default 'submitted',
  requested_at timestamptz not null default now(),
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz
);

create table public.finance_posts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  payment_request_id uuid not null references public.payment_requests(id) on delete restrict,
  post_number text not null,
  posted_by uuid references auth.users(id) on delete set null,
  posted_at timestamptz not null default now(),
  unique (organization_id, post_number)
);

create table public.project_snapshots (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  so_number text not null,
  customer_name text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  entity_name text not null,
  entity_id uuid,
  event_name text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.is_org_member(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members members
    where members.organization_id = target_organization_id
      and members.user_id = auth.uid()
  );
$$;

create or replace function public.has_org_role(
  target_organization_id uuid,
  allowed_roles public.user_role[]
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members members
    where members.organization_id = target_organization_id
      and members.user_id = auth.uid()
      and members.role = any(allowed_roles)
  );
$$;

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.customers enable row level security;
alter table public.sales_orders enable row level security;
alter table public.vendors enable row level security;
alter table public.vendor_budgets enable row level security;
alter table public.price_list enable row level security;
alter table public.application_forms enable row level security;
alter table public.extra_costs enable row level security;
alter table public.acceptance_forms enable row level security;
alter table public.payment_requests enable row level security;
alter table public.finance_posts enable row level security;
alter table public.project_snapshots enable row level security;
alter table public.audit_events enable row level security;

create policy "Members can read organizations"
on public.organizations for select
using (public.is_org_member(id));

create policy "Admins can manage organizations"
on public.organizations for all
using (public.has_org_role(id, array['admin'::public.user_role]))
with check (public.has_org_role(id, array['admin'::public.user_role]));

create policy "Members can read organization members"
on public.organization_members for select
using (public.is_org_member(organization_id));

create policy "Admins can manage organization members"
on public.organization_members for all
using (public.has_org_role(organization_id, array['admin'::public.user_role]))
with check (public.has_org_role(organization_id, array['admin'::public.user_role]));

create policy "Owners can read snapshots"
on public.project_snapshots for select
using (owner_id = auth.uid());

create policy "Owners can create snapshots"
on public.project_snapshots for insert
with check (owner_id = auth.uid());

create policy "Owners can delete snapshots"
on public.project_snapshots for delete
using (owner_id = auth.uid());

create policy "Members can read customers"
on public.customers for select
using (public.is_org_member(organization_id));

create policy "Sales and admins can manage customers"
on public.customers for all
using (public.has_org_role(organization_id, array['sales'::public.user_role, 'admin'::public.user_role]))
with check (public.has_org_role(organization_id, array['sales'::public.user_role, 'admin'::public.user_role]));

create policy "Members can read sales orders"
on public.sales_orders for select
using (public.is_org_member(organization_id));

create policy "Sales and admins can manage sales orders"
on public.sales_orders for all
using (public.has_org_role(organization_id, array['sales'::public.user_role, 'admin'::public.user_role]))
with check (public.has_org_role(organization_id, array['sales'::public.user_role, 'admin'::public.user_role]));

create policy "Members can read vendors"
on public.vendors for select
using (public.is_org_member(organization_id));

create policy "Operations and admins can manage vendors"
on public.vendors for all
using (public.has_org_role(organization_id, array['operations'::public.user_role, 'admin'::public.user_role]))
with check (public.has_org_role(organization_id, array['operations'::public.user_role, 'admin'::public.user_role]));

create policy "Members can read vendor budgets"
on public.vendor_budgets for select
using (public.is_org_member(organization_id));

create policy "Operations and admins can manage vendor budgets"
on public.vendor_budgets for all
using (public.has_org_role(organization_id, array['operations'::public.user_role, 'admin'::public.user_role]))
with check (public.has_org_role(organization_id, array['operations'::public.user_role, 'admin'::public.user_role]));

create policy "Members can read price list"
on public.price_list for select
using (public.is_org_member(organization_id));

create policy "Operations and admins can manage price list"
on public.price_list for all
using (public.has_org_role(organization_id, array['operations'::public.user_role, 'admin'::public.user_role]))
with check (public.has_org_role(organization_id, array['operations'::public.user_role, 'admin'::public.user_role]));

create policy "Members can read application forms"
on public.application_forms for select
using (public.is_org_member(organization_id));

create policy "Operations and admins can manage application forms"
on public.application_forms for all
using (public.has_org_role(organization_id, array['operations'::public.user_role, 'admin'::public.user_role]))
with check (public.has_org_role(organization_id, array['operations'::public.user_role, 'admin'::public.user_role]));

create policy "Members can read extra costs"
on public.extra_costs for select
using (public.is_org_member(organization_id));

create policy "Operations and admins can manage extra costs"
on public.extra_costs for all
using (public.has_org_role(organization_id, array['operations'::public.user_role, 'admin'::public.user_role]))
with check (public.has_org_role(organization_id, array['operations'::public.user_role, 'admin'::public.user_role]));

create policy "Members can read acceptance forms"
on public.acceptance_forms for select
using (public.is_org_member(organization_id));

create policy "Operations and admins can manage acceptance forms"
on public.acceptance_forms for all
using (public.has_org_role(organization_id, array['operations'::public.user_role, 'admin'::public.user_role]))
with check (public.has_org_role(organization_id, array['operations'::public.user_role, 'admin'::public.user_role]));

create policy "Members can read payment requests"
on public.payment_requests for select
using (public.is_org_member(organization_id));

create policy "Operations can create payment requests"
on public.payment_requests for insert
with check (public.has_org_role(organization_id, array['operations'::public.user_role, 'admin'::public.user_role]));

create policy "Finance can approve payment requests"
on public.payment_requests for update
using (public.has_org_role(organization_id, array['finance'::public.user_role, 'admin'::public.user_role]))
with check (public.has_org_role(organization_id, array['finance'::public.user_role, 'admin'::public.user_role]));

create policy "Members can read finance posts"
on public.finance_posts for select
using (public.is_org_member(organization_id));

create policy "Finance can manage finance posts"
on public.finance_posts for all
using (public.has_org_role(organization_id, array['finance'::public.user_role, 'admin'::public.user_role]))
with check (public.has_org_role(organization_id, array['finance'::public.user_role, 'admin'::public.user_role]));

create policy "Members can read audit events"
on public.audit_events for select
using (public.is_org_member(organization_id));

create policy "System actors can create audit events"
on public.audit_events for insert
with check (public.is_org_member(organization_id));
