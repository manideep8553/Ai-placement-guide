import { Search, SlidersHorizontal } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export type FilterType = 'all' | 'strong' | 'average' | 'weak'

interface ReplayFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const filters = [
  { value: 'all' as const, label: 'All Questions', color: '' },
  { value: 'strong' as const, label: 'Strong', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  { value: 'average' as const, label: 'Average', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  { value: 'weak' as const, label: 'Weak', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
]

export default function ReplayFilters({ search, onSearchChange, filter, onFilterChange }: ReplayFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <Input
          placeholder="Search questions..."
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          className="pl-9 h-9 text-sm rounded-xl bg-[#1E293B]/80 border-[#334155]/50 text-gray-300 placeholder:text-gray-600 focus:border-indigo-500/50"
        />
      </div>
      <div className="flex items-center gap-1.5">
        <SlidersHorizontal className="w-4 h-4 text-gray-500" />
        {filters.map(f => (
          <button
            key={f.value}
            onClick={() => onFilterChange(f.value)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
              filter === f.value
                ? f.color || 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20'
                : 'text-gray-400 border-transparent hover:text-gray-200 hover:bg-white/5'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  )
}
