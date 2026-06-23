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
  reference: string
  delivery_reference: string
  client_name: string
  method: string
  amount_xof: number
  date: string
  status: 'success' | 'pending' | 'failed'
}
