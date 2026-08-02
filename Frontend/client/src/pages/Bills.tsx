import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useBills } from '../hooks/useBills'
import BillsFilters from '../components/bills/BillsFilters'
import BillsTable from '../components/bills/BillsTable'
import BillsPagination from '../components/bills/BillsPagination'
import PayModal from '../components/modals/PayModal'
import AddBillModal from '../components/modals/AddBillModal'
import BillDetailModal from '../components/modals/BillDetailModal'
import { Bill } from '../types'

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
    <div className="p-4 md:p-6 space-y-4">
      {payBill && <PayModal bill={payBill} onClose={() => { setPayBill(null); load() }} />}
      {showAdd && <AddBillModal shops={shops} onClose={() => { setShowAdd(false); load() }} />}
      {editBill && <AddBillModal shops={shops} bill={editBill} onClose={() => { setEditBill(null); load() }} />}
      {viewBill && <BillDetailModal bill={viewBill} onClose={() => setViewBill(null)} />}

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Bills</h1>
          <p className="text-xs mt-0.5 text-slate-500">
            {totalCount} bill{totalCount !== 1 ? 's' : ''} found
            {totalPages > 1 && ` · Page ${page} of ${totalPages}`}
          </p>
        </div>
        <button className="btn btn-primary btn-sm flex-shrink-0" onClick={() => setShowAdd(true)}>
          <Plus size={14} /> Add bill
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
