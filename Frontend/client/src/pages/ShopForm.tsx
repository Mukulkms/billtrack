import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createShopApi, getShopByIdApi, updateShopApi } from '../api/shops'
import {
  Loader2, ArrowLeft, Store, User, Phone, MessageCircle, Mail,
  FileText, MapPin, Building2, Hash, CalendarClock, Wallet, StickyNote,
} from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY = {
  shopName: '', ownerName: '', phone: '', whatsapp: '',
  email: '', gstNumber: '', address: '', city: '', state: '',
  pincode: '', paymentTerm: '30', creditLimit: '0', notes: ''
}

function Field({ label, value, onChange, type = 'text', placeholder = '', required = false, icon: Icon }: {
  label: string; value: string; onChange: (v: string) => void
  type?: string; placeholder?: string; required?: boolean; icon?: React.ElementType
}) {
  return (
    <div>
      <label className="label flex items-center gap-1.5">
        {Icon && <Icon size={12} style={{ color: '#9ca3af' }} />}
        {label}
      </label>
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

function SectionCard({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl p-5 mb-4 space-y-4"
      style={{ background: '#fff', border: '1px solid #e8eaf2', boxShadow: '0 1px 4px rgba(15,21,53,0.06)' }}
    >
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: '#ede9fe' }}>
          <Icon size={12} style={{ color: '#7c3aed' }} />
        </div>
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#6b7280' }}>
          {title}
        </p>
      </div>
      {children}
    </div>
  )
}

export default function ShopForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)

  useEffect(() => {
    if (id) {
      setFetching(true)
      getShopByIdApi(id)
        .then(s => {
          const picked: any = {}
          for (const key of Object.keys(EMPTY)) {
            picked[key] = s[key] ?? EMPTY[key as keyof typeof EMPTY]
          }
          setForm({
            ...picked,
            paymentTerm: String(s.paymentTerm ?? 30),
            creditLimit: String(s.creditLimit ?? 0),
          })
        })
        .catch(() => toast.error('Failed to load shop'))
        .finally(() => setFetching(false))
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

  if (fetching) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="animate-spin" style={{ color: '#6366f1' }} size={24} />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl">

      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          className="btn btn-sm"
          onClick={() => navigate(-1)}
          style={{ color: '#374151' }}
        >
          <ArrowLeft size={14} />
        </button>
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)' }}
          >
            <Store size={16} style={{ color: '#7c3aed' }} />
          </div>
          <div>
            <h1 className="text-base font-bold" style={{ color: '#0f1535' }}>
              {isEdit ? 'Edit shop' : 'Add new shop'}
            </h1>
            <p className="text-[11px]" style={{ color: '#9ca3af' }}>
              {isEdit ? (form.shopName || 'Update shop details') : 'Fill in the shop details below'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={submit}>

        <SectionCard icon={User} title="Basic information">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Shop name *" icon={Store}   value={form.shopName}  onChange={set('shopName')}  placeholder="Sharma General Store" required />
            <Field label="Owner name"  icon={User}     value={form.ownerName} onChange={set('ownerName')} />
            <Field label="Phone"       icon={Phone}    value={form.phone}     onChange={set('phone')}     placeholder="9876543210" />
            <Field label="WhatsApp"    icon={MessageCircle} value={form.whatsapp} onChange={set('whatsapp')} placeholder="9876543210" />
            <Field label="Email"       icon={Mail}     value={form.email}     onChange={set('email')}     type="email" placeholder="shop@email.com" />
            <Field label="GST number"  icon={FileText} value={form.gstNumber} onChange={set('gstNumber')} placeholder="22AAAAA0000A1Z5" />
          </div>
        </SectionCard>

        <SectionCard icon={MapPin} title="Address">
          <Field label="Address" icon={Building2} value={form.address} onChange={set('address')} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="City"    icon={MapPin} value={form.city}    onChange={set('city')}    />
            <Field label="State"   icon={MapPin} value={form.state}   onChange={set('state')}   />
            <Field label="Pincode" icon={Hash}   value={form.pincode} onChange={set('pincode')}  />
          </div>
        </SectionCard>

        <SectionCard icon={Wallet} title="Payment settings">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Payment term (days)" icon={CalendarClock} value={form.paymentTerm} onChange={set('paymentTerm')} type="number" placeholder="30" />
            <Field label="Credit limit (₹)"    icon={Wallet}        value={form.creditLimit}  onChange={set('creditLimit')}  type="number" placeholder="50000" />
          </div>
          <div>
            <label className="label flex items-center gap-1.5">
              <StickyNote size={12} style={{ color: '#9ca3af' }} />
              Notes
            </label>
            <textarea
              className="input resize-none"
              rows={2}
              placeholder="Any special notes about this shop..."
              value={form.notes}
              onChange={e => set('notes')(e.target.value)}
            />
          </div>
        </SectionCard>

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
