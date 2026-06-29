import { BillStatus } from '../../types'
import { statusColor } from '../../utils/helpers'
import clsx from 'clsx'

const LABELS: Record<BillStatus, string> = { PENDING: 'Pending', PARTIAL: 'Partial', PAID: 'Paid', OVERDUE: 'Overdue' }
export default function StatusPill({ status }: { status: BillStatus }) {
  return <span className={clsx('pill', statusColor[status])}>{LABELS[status]}</span>
}
