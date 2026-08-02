import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getBillsApi, deleteBillApi } from '../api/bills'
import { getShopsApi } from '../api/shops'
import { getCategoriesApi } from '../api/categories'
import { Bill, Shop, Category } from '../types'
import toast from 'react-hot-toast'

const PAGE_SIZE = 10

export function useBills() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [bills, setBills] = useState<Bill[]>([])
  const [shops, setShops] = useState<Shop[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState(searchParams.get('status') || '')
  const [shopId, setShopId] = useState(searchParams.get('shopId') || '')
  const [categoryId, setCategoryId] = useState(searchParams.get('categoryId') || '')

  const [page, setPage] = useState(Number(searchParams.get('page')) || 1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [expandedPayments, setExpandedPayments] = useState<Record<string, boolean>>({})

  const load = () => {
    setLoading(true)
    Promise.all([
      getBillsApi({ search, status: status || undefined, shopId: shopId || undefined, categoryId: categoryId || undefined, limit: PAGE_SIZE, page }),
      getShopsApi(),
      getCategoriesApi(),
    ])
      .then(([b, s, c]) => {
        setBills(b.bills || b.data || b)
        setTotalPages(b.totalPages || 1)
        setTotalCount(b.totalCount || b.count || 0)
        setShops(s)
        setCategories(c)
      })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [search, status, shopId, categoryId, page])

  const updateUrl = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([k, v]) => (v ? params.set(k, v) : params.delete(k)))
    setSearchParams(params)
  }

  const handleStatusChange = (val: string) => { setStatus(val); setPage(1); updateUrl({ status: val, page: '1' }) }
  const handleCategoryChange = (val: string) => { setCategoryId(val); setPage(1); updateUrl({ categoryId: val, page: '1' }) }
  const handleShopChange = (val: string) => { setShopId(val); setPage(1); updateUrl({ shopId: val, page: '1' }) }
  const handleSearchChange = (val: string) => { setSearch(val); setPage(1) }

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return
    setPage(p)
    updateUrl({ page: String(p) })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this bill?')) return
    try {
      await deleteBillApi(id)
      toast.success('Bill deleted')
      load()
    } catch {
      toast.error('Delete failed')
    }
  }

  const togglePayments = (id: string) => setExpandedPayments(p => ({ ...p, [id]: !p[id] }))

  return {
    bills, shops, categories, loading,
    search, status, shopId, categoryId,
    page, totalPages, totalCount, pageSize: PAGE_SIZE,
    expandedPayments,
    load, goToPage, togglePayments, handleDelete,
    handleStatusChange, handleCategoryChange, handleShopChange, handleSearchChange,
  }
}
