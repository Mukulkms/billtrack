import { Suspense, lazy, useState } from 'react'
import { Plus, Receipt, Loader2 } from 'lucide-react'
import { useBills } from '../hooks/useBills'
import BillsFilters from '../components/bills/BillsFilters'
import BillsTable from '../components/bills/BillsTable'
import BillsPagination from '../components/bills/BillsPagination'
import { Bill } from '../types'

// These modals aren't needed until the user opens one, so they're split
// into their own chunks instead of loading on every Bills page visit.
const PayModal = lazy(() => import('../components/modals/PayModal'))
const AddBillModal = lazy(() => import('../components/modals/AddBillModal'))
const BillDetailModal = lazy(() => import('../components/modals/BillDetailModal'))

function ModalFallback() {
  return (
    <div className="modal-overlay">
      <Loader2 className="animate-spin text-white" size={22} />
    </div>
  )
}

export default function Bills() {
  const {
    bills, shops, categories, loading,
    search, status, shopId, categoryId,
    page, totalPages, totalCount, pageSize,
    expandedPayments,
    load, goToPage, togglePayments, handleDelete,
    handleStatusChange, handleCategoryChange, handleShopChange, handleSearchChange,
  } = useBills()

  const [payBill, setPayBill] = useState<Bill | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [viewBill, setViewBill] = useState<Bill | null>(null)
  const [editBill, setEditBill] = useState<Bill | null>(null)

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-[1400px] mx-auto">
      <Suspense fallback={<ModalFallback />}>
        {payBill && <PayModal bill={payBill} onClose={() => { setPayBill(null); load() }} />}
        {showAdd && <AddBillModal shops={shops} onClose={() => { setShowAdd(false); load() }} />}
        {editBill && <AddBillModal shops={shops} bill={editBill} onClose={() => { setEditBill(null); load() }} />}
        {viewBill && <BillDetailModal bill={viewBill} onClose={() => setViewBill(null)} />}
      </Suspense>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--color-primary-soft)', border: '1px solid var(--color-primary-border)' }}
          >
            <Receipt size={20} style={{ color: 'var(--color-primary)' }} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Bills</h1>
            <p className="text-xs mt-0.5 text-slate-500">
              {totalCount} bill{totalCount !== 1 ? 's' : ''} found
              {totalPages > 1 && ` · Page ${page} of ${totalPages}`}
            </p>
          </div>
        </div>
        <button className="btn btn-primary flex-shrink-0" onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Add bill
        </button>
      </div>

      <BillsFilters
        search={search}
        status={status}
        shopId={shopId}
        categoryId={categoryId}
        shops={shops}
        categories={categories}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
        onShopChange={handleShopChange}
        onCategoryChange={handleCategoryChange}
      />

      <BillsTable
        bills={bills}
        loading={loading}
        expandedPayments={expandedPayments}
        onTogglePayments={togglePayments}
        onPay={setPayBill}
        onDelete={handleDelete}
        onView={setViewBill}
        onEdit={setEditBill}
        onAddBill={() => setShowAdd(true)}
      />

      {!loading && (
        <BillsPagination
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          pageSize={pageSize}
          onGoToPage={goToPage}
        />
      )}
    </div>
  )
}
