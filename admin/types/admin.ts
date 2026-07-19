export interface AdminStats {
  users: { total: number; clients: number; drivers: number }
  deliveries: {
    total: number
    by_status: Record<string, number>
    active_count: number
    today: { total: number; delivered: number; cancelled: number }
  }
  revenue: {
    total_xof: number
    this_month_xof: number
    today_xof: number
    avg_basket_xof: number
    by_method: Record<string, { total_xof: number; count: number }>
  }
  pending_validations: number
  completion_rate: number
  trends: {
    revenue_today_pct: number | null
    revenue_month_pct: number | null
    deliveries_month: number
    deliveries_month_pct: number | null
    new_clients_month: number
    new_clients_month_pct: number | null
  }
}

export interface AdminReports {
  revenue_by_month: Array<{ month: string; total_xof: number }>
  deliveries_by_month: Array<{ month: string; count: number }>
  top_clients: Array<{ name: string; email: string; count: number; total_xof: number }>
  top_drivers: Array<{ name: string; email: string; count: number; total_xof: number }>
  deliveries_by_package_type: Array<{ package_type: string; count: number }>
  delivery_completion_rate: number
}

export interface AdminAlert {
  id: string
  severity: 'error' | 'warning' | 'info'
  kind: string
  title: string
  message: string
  count: number
  action: string
}

export interface AdminAlertsResponse {
  alerts: AdminAlert[]
  total: number
}

export interface AdminActivityLog {
  id: string
  action: string
  subject_type: string | null
  subject_id: string | null
  description: string
  created_at: string
  admin: { id: string; name: string; email?: string } | null
}

export interface AdminAccount {
  id: string
  name: string
  email: string
  phone?: string | null
  is_super_admin: boolean
  must_change_password?: boolean
  created_at: string
}

export interface AdminUser {
  id: string
  name: string
  email: string
  phone?: string
  role: string
  is_super_admin?: boolean
  city?: string
  created_at: string
  deliveries_count: number
  total_spent_xof?: number
}

export interface AdminDelivery {
  id: string
  reference: string
  status: string
  payment_method: string
  amount_xof: number
  created_at: string
  from_address?: string
  to_address?: string
  client: { name: string }
  driver: { name: string } | null
}

export interface AdminDriver {
  id: string
  name: string
  email: string
  phone?: string
  city?: string
  is_active: boolean
  deliveries_completed: number
  online_status?: 'online' | 'on_mission' | 'offline'
  created_at: string
}

export interface AdminPayment {
  id: string
  delivery_id: string
  reference: string
  delivery_reference: string
  client_name: string
  method: string
  amount_xof: number
  date: string
  status: 'success' | 'pending' | 'failed'
}
