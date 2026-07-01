import { useState, useRef, useEffect } from 'react'
import { Loader2, Upload, Camera, Sparkles, AlertCircle, X, Plus } from 'lucide-react'
import { Shop } from '../../types'
import { getCategoriesApi, createCategoryApi } from '../../api/categories'
import { Category } from '../../types'
import { todayISO, addDays } from '../../utils/helpers'
import { createBillApi } from '../../api/bills'
import { getShopsApi, createShopApi } from '../../api/shops'
import api from '../../api/client'
import toast from 'react-hot-toast'

function fileToBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader()
    r.onload = () => res((r.result as string).split(',')[1])
    r.onerror = rej
    r.readAsDataURL(file)
  })
}

interface Props {
  shops?: Shop[]
  onClose: () => void
}
export default function AddBillModal({ shops: shopsProp, onClose }: Props) {
  const [shops, setShops] = useState<Shop[]>(shopsProp || [])
  const [form, setForm] = useState({
    shopId: '', invoiceNumber: '', amount: '',
    billDate: todayISO(), period: '30', customDue: '', remarks: ''
  })

  const [categories, setCategories] = useState<Category[]>([])
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [creatingCategory, setCreatingCategory] = useState(false)
  // New shop inline
  const [showNewShop, setShowNewShop] = useState(false)
  const [newShopName, setNewShopName] = useState('')
  const [creatingShop, setCreatingShop] = useState(false)

  const [scanning, setScanning] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [scanMsg, setScanMsg] = useState('')
  const [scanErr, setScanErr] = useState('')
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const camRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!shopsProp || shopsProp.length === 0) {
      getShopsApi().then(setShops).catch(() => {})
    }
  }, [])

  useEffect(() => {
  getCategoriesApi().then(setCategories).catch(() => {})
}, [])

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))
  const getDue = () => form.period === 'custom' ? form.customDue : addDays(form.billDate, parseInt(form.period))

  const scanBill = async (file: File) => {
    setScanErr(''); setScanMsg(''); setScanning(true)
    setShowNewShop(false); setNewShopName('')
    setPreview(URL.createObjectURL(file))

    try {
      const base64 = await fileToBase64(file)
      const { data } = await api.post('/scan-bill', { base64, mimeType: file.type || 'image/jpeg' })

      if (data.totalAmount)   set('amount',        String(data.totalAmount))
      if (data.invoiceNumber) set('invoiceNumber', data.invoiceNumber)
      if (data.remarks)       set('remarks',       data.remarks)
      if (data.date) {
        const parsed = parseDate(data.date)
        if (parsed) set('billDate', parsed)
      }

      if (data.shopName) {
        const q = data.shopName.toLowerCase().split(' ')[0]
        const match = shops.find(s => s.shopName.toLowerCase().includes(q))
        if (match) {
          set('shopId', match.id)
          setScanMsg('✓ Data extracted! Review and save.')
        } else {
          // Auto show new shop form with scanned name
          setNewShopName(data.shopName)
          setShowNewShop(true)
          setScanMsg('✓ Data extracted! Shop not found — create below.')
        }
      } else {
        setScanMsg('✓ Data extracted! Select shop manually.')
      }

    } catch (err: any) {
      setScanErr(err?.response?.data?.message || 'Could not read bill. Try a clearer image.')
    } finally {
      setScanning(false)
    }
  }

  const handleCreateShop = async () => {
    if (!newShopName.trim()) { toast.error('Shop name required'); return }

    setCreatingShop(true)
    try {
      const res = await createShopApi({
        shopName: newShopName.trim(),
        ownerName: '-',
        phone: '0000000000',
        address: '-',
      })
      const newShop = res?.id ? res : (res?.shop || res?.data)
      setShops(prev => [...prev, newShop])
      set('shopId', newShop.id)
      setShowNewShop(false)
      setNewShopName('')
      setScanMsg(`✓ Shop "${newShop.shopName}" created & selected!`)
      toast.success('Shop created!')
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Shop create failed')
    } finally {
      setCreatingShop(false)
    }
  }

const submit = async () => {
  if (!form.shopId)   { toast.error('Select a shop'); return }
  if (!form.amount)   { toast.error('Enter amount'); return }
  if (!form.billDate) { toast.error('Enter bill date'); return }
  if (form.period === 'custom' && !form.customDue) { toast.error('Set custom due date'); return }

  setSaving(true)
  try {
    await createBillApi({
      shopId: form.shopId,
      invoiceNumber: form.invoiceNumber || undefined,
      amount: parseFloat(form.amount),
      billDate: form.billDate,
      dueDate: getDue(),
      remarks: form.remarks || undefined
    })
    toast.success('Bill added ✓')
    onClose()
  } catch (e: any) {
    toast.error(e.response?.data?.errors?.[0]?.msg || 'Failed to save bill')
  } finally {
    setSaving(false)
  }
}

  const [form, setForm] = useState({
  shopId: '', invoiceNumber: '', amount: '',
  billDate: todayISO(), period: '30', customDue: '', remarks: '', categoryId: ''
})

const handleCreateCategory = async () => {
  if (!newCategoryName.trim()) { toast.error('Category name required'); return }
  setCreatingCategory(true)
  try {
    const newCat = await createCategoryApi({ name: newCategoryName.trim() })
    setCategories(prev => [...prev, newCat])
    set('categoryId', newCat.id)
    setShowNewCategory(false)
    setNewCategoryName('')
    toast.success('Category created!')
  } catch (e: any) {
    toast.error(e?.response?.data?.message || 'Category create failed')
  } finally {
    setCreatingCategory(false)
  }
}

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal max-w-md max-h-[90vh] overflow-y-auto">

        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #f0f1f8' }}>
          <h3 className="font-semibold text-sm" style={{ color: '#0f1535' }}>Add bill</h3>
          <button className="btn btn-sm" onClick={onClose}><X size={14} /></button>
        </div>

        <div className="p-5 space-y-4">

          {/* AI Scan */}
          <div className="rounded-xl p-4 space-y-3" style={{ background: '#fafbff', border: '1px solid #e8eaf2' }}>
            <p className="text-xs font-semibold" style={{ color: '#374151' }}>
              📸 Scan bill — AI will extract data automatically
            </p>
            <div className="flex gap-2">
              <button className="btn flex-1 justify-center"
                style={{ borderStyle: 'dashed', borderColor: '#6366f1', color: '#6366f1', background: '#fafbff' }}
                onClick={() => fileRef.current?.click()} disabled={scanning}>
                {scanning ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                Upload photo
              </button>
              <button className="btn flex-1 justify-center"
                style={{ borderStyle: 'dashed', borderColor: '#8b5cf6', color: '#8b5cf6', background: '#fafbff' }}
                onClick={() => camRef.current?.click()} disabled={scanning}>
                {scanning ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                Camera
              </button>
            </div>

            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={e => { if (e.target.files?.[0]) scanBill(e.target.files[0]); e.target.value = '' }} />
            <input ref={camRef} type="file" accept="image/*" capture="environment" className="hidden"
              onChange={e => { if (e.target.files?.[0]) scanBill(e.target.files[0]); e.target.value = '' }} />

            {scanning && (
              <div className="flex items-center gap-2 py-1" style={{ color: '#6366f1' }}>
                <Loader2 size={13} className="animate-spin flex-shrink-0" />
                <span className="text-xs">AI bill padh raha hai... please wait</span>
              </div>
            )}

            {preview && !scanning && scanMsg && (
              <div className="flex items-center gap-3 rounded-xl p-3"
                style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                <img src={preview} className="w-10 h-10 object-cover rounded-lg flex-shrink-0" alt="bill" />
                <div className="flex items-center gap-1.5">
                  <Sparkles size={13} style={{ color: '#059669' }} />
                  <p className="text-xs font-medium" style={{ color: '#059669' }}>{scanMsg}</p>
                </div>
              </div>
            )}

            {scanErr && (
              <div className="rounded-xl p-3 flex gap-2"
                style={{ background: '#fff1f2', border: '1px solid #fca5a5' }}>
                <AlertCircle size={14} style={{ color: '#dc2626', flexShrink: 0, marginTop: 1 }} />
                <p className="text-xs" style={{ color: '#dc2626' }}>{scanErr}</p>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: '#f0f1f8' }} />
            <span className="text-xs" style={{ color: '#9ca3af' }}>or fill manually</span>
            <div className="flex-1 h-px" style={{ background: '#f0f1f8' }} />
          </div>

          {/* Shop select + New shop inline */}
          <div>
            <label className="label">Shop *</label>
            <select className="input" value={form.shopId}
              onChange={e => {
                if (e.target.value === '__new__') {
                  setShowNewShop(true)
                  setNewShopName('')
                  set('shopId', '')
                } else {
                  set('shopId', e.target.value)
                  setShowNewShop(false)
                }
              }}>
              <option value="">Select shop...</option>
              {shops.map(s => <option key={s.id} value={s.id}>{s.shopName}</option>)}
              <option value="__new__">➕ New shop...</option>
            </select>

            {/* Inline new shop creator */}
            {showNewShop && (
              <div className="mt-2 rounded-xl p-3 space-y-2"
                style={{ background: '#f5f3ff', border: '1px solid #c4b5fd' }}>
                <p className="text-xs font-semibold" style={{ color: '#5b21b6' }}>Create new shop</p>
                <div className="flex gap-2">
                  <input
                    className="input flex-1"
                    placeholder="Shop name *"
                    value={newShopName}
                    autoFocus
                    onChange={e => setNewShopName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleCreateShop()}
                  />
                  <button
                    className="btn btn-primary"
                    style={{ flexShrink: 0 }}
                    onClick={handleCreateShop}
                    disabled={creatingShop}
                  >
                    {creatingShop ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                  </button>
                  <button className="btn" style={{ flexShrink: 0, color: '#6b7280' }}
                    onClick={() => { setShowNewShop(false); setNewShopName('') }}>
                    <X size={13} />
                  </button>
                </div>
                <p className="text-xs" style={{ color: '#7c3aed' }}>
                  Baaki details baad mein Shop page pe fill karna
                </p>
              </div>
            )}
          </div>
          <div>
  <label className="label">Category</label>
  <select className="input" value={form.categoryId}
    onChange={e => {
      if (e.target.value === '__new__') {
        setShowNewCategory(true)
        setNewCategoryName('')
        set('categoryId', '')
      } else {
        set('categoryId', e.target.value)
        setShowNewCategory(false)
      }
    }}>
    <option value="">Select category...</option>
    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
    <option value="__new__">➕ New category...</option>
  </select>

  {showNewCategory && (
    <div className="mt-2 rounded-xl p-3 space-y-2"
      style={{ background: '#f5f3ff', border: '1px solid #c4b5fd' }}>
      <p className="text-xs font-semibold" style={{ color: '#5b21b6' }}>Create new category</p>
      <div className="flex gap-2">
        <input
          className="input flex-1"
          placeholder="e.g. Alo Fruit Juice"
          value={newCategoryName}
          autoFocus
          onChange={e => setNewCategoryName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleCreateCategory()}
        />
        <button className="btn btn-primary" style={{ flexShrink: 0 }}
          onClick={handleCreateCategory} disabled={creatingCategory}>
          {creatingCategory ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
        </button>
        <button className="btn" style={{ flexShrink: 0, color: '#6b7280' }}
          onClick={() => { setShowNewCategory(false); setNewCategoryName('') }}>
          <X size={13} />
        </button>
      </div>
    </div>
  )}
</div>
          <div>
            <label className="label">Invoice number</label>
            <input className="input" placeholder="INV-001" value={form.invoiceNumber}
              onChange={e => set('invoiceNumber', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Amount (₹) *</label>
              <input className="input" type="number" placeholder="0" value={form.amount}
                onChange={e => set('amount', e.target.value)} />
            </div>
            <div>
              <label className="label">Bill date *</label>
              <input className="input" type="date" value={form.billDate}
                onChange={e => set('billDate', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="label">Due period</label>
            <select className="input" value={form.period} onChange={e => set('period', e.target.value)}>
              <option value="7">1 week (7 days)</option>
              <option value="14">2 weeks (14 days)</option>
              <option value="30">1 month (30 days)</option>
              <option value="60">2 months (60 days)</option>
              <option value="custom">Custom date</option>
            </select>
          </div>

          {form.period === 'custom' && (
            <div>
              <label className="label">Custom due date</label>
              <input className="input" type="date" value={form.customDue}
                onChange={e => set('customDue', e.target.value)} />
            </div>
          )}

          <div>
            <label className="label">Remarks</label>
            <input className="input" placeholder="Optional notes..." value={form.remarks}
              onChange={e => set('remarks', e.target.value)} />
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 py-4" style={{ borderTop: '1px solid #f0f1f8' }}>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={saving}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : 'Save bill'}
          </button>
        </div>

      </div>
    </div>
  )
}

function parseDate(raw: string): string | null {
  if (!raw) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw
  const m = raw.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})$/)
  if (m) {
    const [, d, mo, y] = m
    const year = y.length === 2 ? `20${y}` : y
    return `${year}-${mo.padStart(2,'0')}-${d.padStart(2,'0')}`
  }
  const dt = new Date(raw)
  if (!isNaN(dt.getTime())) return dt.toISOString().split('T')[0]
  return null
}
