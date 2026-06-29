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
}

export interface AdminReports {
  revenue_by_month: Array<{ month: string; total_xof: number }>
  deliveries_by_month: Array<{ month: string; count: number }>
  top_clients: Array<{ name: string; email: string; count: number; total_xof: number }>
  delivery_completion_rate: number
}

export interface AdminUser {
  id: string
  name: string
  email: string
  phone?: string
  role: string
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
