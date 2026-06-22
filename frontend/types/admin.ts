export interface AdminStats {
  users: { total: number; clients: number; drivers: number }
  deliveries: { total: number; by_status: Record<string, number> }
  revenue: { total_xof: number; this_month_xof: number }
  pending_validations: number
}

export interface AdminUser {
  id: string
  name: string
  email: string
  role: string
  created_at: string
  deliveries_count: number
}

export interface AdminDelivery {
  id: string
  status: string
  payment_method: string
  amount_xof: number
  created_at: string
  client: { name: string }
  driver: { name: string } | null
}

export interface AdminDriver {
  id: string
  name: string
  email: string
  is_active: boolean
  deliveries_completed: number
  created_at: string
}

export interface AdminReport {
  revenue_by_month: Array<{ month: string; total_xof: number }>
  deliveries_by_month: Array<{ month: string; count: number }>
  top_clients: Array<{ name: string; email: string; count: number; total_xof: number }>
  delivery_completion_rate: number
}
