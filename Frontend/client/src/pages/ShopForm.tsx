import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createShopApi, getShopByIdApi, updateShopApi } from '../api/shops'
import { Loader2, ArrowLeft, Store } from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY = {
  shopName: '', ownerName: '', phone: '', whatsapp: '',
  email: '', gstNumber: '', address: '', city: '', state: '',
  pincode: '', paymentTerm: '30', creditLimit: '0', notes: ''
}

function Field({ label, value, onChange, type = 'text', placeholder = '', required = false }: {
  label: string; value: string; onChange: (v: string) => void
  type?: string; placeholder?: string; required?: boolean
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <input
        className="input"
        type={type}
        placeholder={placeholder}
        value={value}
        required={required}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  )
}

export default function ShopForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (id) {
      getShopByIdApi(id).then(s =>
        setForm({ ...EMPTY, ...s, paymentTerm: String(s.paymentTerm), creditLimit: String(s.creditLimit) })
      )
    }
  }, [id])

  const set = (k: keyof typeof EMPTY) => (v: string) =>
    setForm(p => ({ ...p, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = { ...form, paymentTerm: Number(form.paymentTerm), creditLimit: Number(form.creditLimit) }
      if (isEdit) { await updateShopApi(id!, data); toast.success('Shop updated') }
      else { await createShopApi(data); toast.success('Shop added') }
      navigate('/shops')
    } catch (err: any) {
      toast.error(err.response?.data?.errors?.[0]?.msg || 'Failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          className="btn btn-sm"
          onClick={() => navigate(-1)}
          style={{ color: '#374151' }}
        >
          <ArrowLeft size={14} />
        </button>
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: '#ede9fe' }}
          >
            <Store size={14} style={{ color: '#7c3aed' }} />
          </div>
          <h1 className="text-base font-bold" style={{ color: '#0f1535' }}>
            {isEdit ? 'Edit shop' : 'Add new shop'}
          </h1>
        </div>
      </div>

      <form onSubmit={submit}>

        {/* Section: Basic info */}
        <div
          className="rounded-xl p-5 mb-4 space-y-4"
          style={{ background: '#fff', border: '1px solid #e8eaf2', boxShadow: '0 1px 4px rgba(15,21,53,0.06)' }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#6b7280' }}>
            Basic information
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Shop name *"  value={form.shopName}  onChange={set('shopName')}  placeholder="Sharma General Store" required />
            <Field label="Owner name " value={form.ownerName} onChange={set('ownerName')} />
            <Field label="Phone"      value={form.phone}     onChange={set('phone')}     placeholder="9876543210"  />
            <Field label="WhatsApp"     value={form.whatsapp}  onChange={set('whatsapp')}  placeholder="9876543210" />
            <Field label="Email"        value={form.email}     onChange={set('email')}     type="email" placeholder="shop@email.com" />
            <Field label="GST number"   value={form.gstNumber} onChange={set('gstNumber')} placeholder="22AAAAA0000A1Z5" />
          </div>
        </div>

        {/* Section: Address */}
        <div
          className="rounded-xl p-5 mb-4 space-y-4"
          style={{ background: '#fff', border: '1px solid #e8eaf2', boxShadow: '0 1px 4px rgba(15,21,53,0.06)' }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#6b7280' }}>
            Address
          </p>
          <Field label="Address" value={form.address} onChange={set('address')} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="City"    value={form.city}    onChange={set('city')}    />
            <Field label="State"   value={form.state}   onChange={set('state')}   />
            <Field label="Pincode" value={form.pincode} onChange={set('pincode')}  />
          </div>
        </div>

        {/* Section: Payment */}
        <div
          className="rounded-xl p-5 mb-6 space-y-4"
          style={{ background: '#fff', border: '1px solid #e8eaf2', boxShadow: '0 1px 4px rgba(15,21,53,0.06)' }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#6b7280' }}>
            Payment settings
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Payment term (days)" value={form.paymentTerm} onChange={set('paymentTerm')} type="number" placeholder="30" />
            <Field label="Credit limit (₹)"   value={form.creditLimit}  onChange={set('creditLimit')}  type="number" placeholder="50000" />
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea
              className="input resize-none"
              rows={2}
              placeholder="Any special notes about this shop..."
              value={form.notes}
              onChange={e => set('notes')(e.target.value)}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="btn"
            onClick={() => navigate(-1)}
            style={{ color: '#374151' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ minWidth: 110 }}
          >
            {loading
              ? <Loader2 size={14} className="animate-spin" />
              : isEdit ? 'Update shop' : 'Save shop'
            }
          </button>
        </div>
      </form>
    </div>
  )
}