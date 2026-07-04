insert into public.organizations (id, name)
values ('00000000-0000-0000-0000-000000000001', 'Install Procea Demo')
on conflict (id) do nothing;

insert into public.customers (id, organization_id, name, code)
values (
  '00000000-0000-0000-0000-000000000101',
  '00000000-0000-0000-0000-000000000001',
  'Customer A',
  'CUST-A'
) on conflict (id) do nothing;

insert into public.vendors (id, organization_id, name, code)
values
  ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000001', 'Vendor A', 'V-A'),
  ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000001', 'Vendor B', 'V-B'),
  ('00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000001', 'Vendor C', 'V-C')
on conflict (id) do nothing;

insert into public.sales_orders (
  id,
  organization_id,
  customer_id,
  so_number,
  contract_number,
  installation_revenue,
  door_model,
  quantity,
  area_square_meter
) values (
  '00000000-0000-0000-0000-000000000301',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000101',
  'SO-2026-0001',
  'CNT-2026-Install-001',
  80000,
  'Industrial Door A',
  1,
  54
) on conflict (organization_id, so_number) do nothing;

insert into public.vendor_budgets (
  organization_id,
  sales_order_id,
  vendor_id,
  allocation_rate,
  budget_amount,
  required_margin_rate
) values
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000201', 0.3, 24000, 0.3),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000202', 0.3, 24000, 0.3),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000203', 0.4, 32000, 0.3);

insert into public.price_list (
  organization_id,
  door_model,
  pricing_mode,
  min_price,
  list_price,
  max_price,
  valid_from,
  valid_to
) values
  ('00000000-0000-0000-0000-000000000001', 'Industrial Door A', 'whole_door', 12000, 16200, 16800, '2026-01-01', '2026-12-31'),
  ('00000000-0000-0000-0000-000000000001', 'Industrial Door B', 'area_price', 260, 300, 360, '2026-01-01', '2026-12-31');
