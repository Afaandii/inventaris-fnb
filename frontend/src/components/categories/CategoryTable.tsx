import React, { useMemo, useRef, useState, useEffect } from 'react';
import DataTable, { type DataTableRef } from 'datatables.net-react';
import DT from 'datatables.net-dt';
import 'datatables.net-dt/css/dataTables.dataTables.css';
import { Eye, Pencil, Trash2, Search, Filter, ChevronDown } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { Category } from '@/types/category';

DataTable.use(DT);

interface CategoryTableProps {
  categories: Category[];
  allCategories: Category[];
  onDetail: (category: Category) => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onOpenFilter?: () => void;
  activeFilterCount?: number;
}

export const CategoryTable: React.FC<CategoryTableProps> = ({
  categories,
  allCategories,
  onDetail,
  onEdit,
  onDelete,
  onOpenFilter,
  activeFilterCount = 0,
}) => {
  const { t, currentLanguage } = useTranslation();
  const dtRef = useRef<DataTableRef>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [mobilePage, setMobilePage] = useState(1);

  // Expanded rows state for mobile device mode
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRow = (id: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Quick lookup for parent category names
  const categoryMap = useMemo(() => {
    const map = new Map<number, string>();
    allCategories.forEach((c) => {
      map.set(c.id_category, c.category_name);
    });
    return map;
  }, [allCategories]);

  // Handle live search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setMobilePage(1);
    dtRef.current?.dt()?.search(query).draw();
  };

  // Handle page length change
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const size = Number(e.target.value);
    setPageSize(size);
    setMobilePage(1);
    dtRef.current?.dt()?.page.len(size).draw();
  };

  // Redraw datatable if data changes
  useEffect(() => {
    if (searchQuery) {
      dtRef.current?.dt()?.search(searchQuery).draw();
    }
  }, [categories, searchQuery]);

  // Mobile filtered & paginated data
  const mobileFilteredData = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase().trim();
    return categories.filter(
      (c) =>
        c.category_name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q) ||
        c.status.toLowerCase().includes(q) ||
        (categoryMap.get(c.parent_id ?? 0) || '').toLowerCase().includes(q),
    );
  }, [categories, searchQuery, categoryMap]);

  const totalMobilePages = Math.max(1, Math.ceil(mobileFilteredData.length / pageSize));
  const mobilePaginatedList = useMemo(() => {
    const start = (mobilePage - 1) * pageSize;
    return mobileFilteredData.slice(start, start + pageSize);
  }, [mobileFilteredData, mobilePage, pageSize]);

  // DataTables Column Definitions (For Desktop Mode)
  const columns = useMemo(() => {
    return [
      {
        title: 'No',
        data: 'id_category',
        width: '50px',
        className: 'dt-left',
      },
      {
        title: t.categories.colName,
        data: 'category_name',
        className: 'dt-left',
      },
      {
        title: t.categories.colParent,
        data: 'parent_id',
        className: 'dt-left',
      },
      {
        title: t.categories.colType,
        data: 'type',
        className: 'dt-left',
      },
      {
        title: t.categories.colStatus,
        data: 'status',
        className: 'dt-left',
      },
      {
        title: t.categories.colActions,
        data: null,
        orderable: false,
        searchable: false,
        width: '110px',
        className: 'dt-right',
      },
    ];
  }, [t]);

  // Custom Rendering Slots for React components (Desktop)
  const slots = useMemo(() => {
    return {
      // Column 0: No (clean number without #, without badge)
      0: (_data: unknown, _row: Category, _type: unknown, meta?: { row: number }) => {
        const rowNumber = meta !== undefined ? meta.row + 1 : 1;
        return (
          <span className="font-mono text-xs font-medium text-muted-foreground">
            {rowNumber}
          </span>
        );
      },

      // Column 1: Category Name ONLY (clean plain name, no route/slug below)
      1: (_data: unknown, row: Category) => (
        <span className="font-semibold text-xs text-foreground tracking-tight">
          {row.category_name}
        </span>
      ),

      // Column 2: Parent Category (plain text, no badges)
      2: (_data: unknown, row: Category) => {
        if (!row.parent_id) {
          return <span className="text-xs text-muted-foreground/60 font-mono">—</span>;
        }
        const parentName = categoryMap.get(row.parent_id);
        return (
          <span className="text-xs text-foreground/80 font-normal truncate max-w-[150px] inline-block">
            {parentName || `Induk #${row.parent_id}`}
          </span>
        );
      },

      // Column 3: Type (clean plain text without badges)
      3: (_data: unknown, row: Category) => {
        switch (row.type) {
          case 'ingredient':
            return (
              <span className="text-xs font-medium text-indigo-500 dark:text-indigo-400">
                {t.categories.typeIngredient}
              </span>
            );
          case 'menu':
            return (
              <span className="text-xs font-medium text-emerald-500 dark:text-emerald-400">
                {t.categories.typeMenu}
              </span>
            );
          case 'product':
            return (
              <span className="text-xs font-medium text-amber-500 dark:text-amber-400">
                {t.categories.typeProduct}
              </span>
            );
        }
      },

      // Column 4: Status (clean plain text with subtle dot, without badges)
      4: (_data: unknown, row: Category) => {
        return row.status === 'active' ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{t.categories.statusActive}</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-normal text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
            <span>{t.categories.statusInactive}</span>
          </span>
        );
      },

      // Column 5: Actions (Only 3 buttons: Detail, Edit, Delete)
      5: (_data: unknown, row: Category) => (
        <div className="flex items-center justify-end gap-1.5">
          {/* Detail Button */}
          <button
            type="button"
            onClick={() => onDetail(row)}
            title={t.categories.detailCategory}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-border/70 bg-card hover:bg-accent text-muted-foreground hover:text-foreground transition-all shadow-2xs"
            aria-label="Detail"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          {/* Edit Button */}
          <button
            type="button"
            onClick={() => onEdit(row)}
            title={t.categories.editCategory}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-border/70 bg-card hover:bg-indigo-500/10 text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-2xs"
            aria-label="Edit"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={() => onDelete(row)}
            title={t.categories.deleteCategory}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-border/70 bg-card hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all shadow-2xs"
            aria-label="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    };
  }, [categoryMap, t, onDetail, onEdit, onDelete]);

  // DataTables Options Configuration (Desktop)
  const options = useMemo(() => {
    return {
      responsive: true,
      pageLength: pageSize,
      order: [[0, 'asc']],
      layout: {
        topStart: null,
        topEnd: null,
        bottomStart: 'info',
        bottomEnd: 'paging',
      },
      language: {
        info:
          currentLanguage === 'id'
            ? 'Menampilkan _START_ sampai _END_ dari _TOTAL_ kategori'
            : 'Showing _START_ to _END_ of _TOTAL_ categories',
        infoEmpty:
          currentLanguage === 'id'
            ? 'Tidak ada data kategori'
            : 'No categories available',
        infoFiltered:
          currentLanguage === 'id'
            ? '(disaring dari _MAX_ total data)'
            : '(filtered from _MAX_ total entries)',
        zeroRecords: t.categories.emptyTitle,
        paginate: {
          first: '«',
          previous: '‹',
          next: '›',
          last: '»',
        },
      },
    };
  }, [pageSize, currentLanguage, t]);

  const getTypeText = (type: Category['type']) => {
    switch (type) {
      case 'ingredient':
        return t.categories.typeIngredient;
      case 'menu':
        return t.categories.typeMenu;
      case 'product':
        return t.categories.typeProduct;
      default:
        return '—';
    }
  };

  return (
    <div className="w-full rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-xs p-4 sm:p-5 space-y-4">
      {/* Top Custom Toolbar: Show entries on Left, Search + Filter Button on Right */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Show [N] entries */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{currentLanguage === 'id' ? 'Tampilkan' : 'Show'}</span>
          <select
            value={pageSize}
            onChange={handlePageSizeChange}
            className="h-9 px-2.5 rounded-xl border border-border/70 bg-card text-foreground text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ring/40 transition-all cursor-pointer"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span>{currentLanguage === 'id' ? 'data' : 'entries'}</span>
        </div>

        {/* Search Bar + Filter Button (Side-by-Side) */}
        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder={t.categories.searchPlaceholder}
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-border/70 bg-card text-foreground text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/40 transition-all"
            />
          </div>

          {/* Filter Button right next to search */}
          {onOpenFilter && (
            <button
              type="button"
              onClick={onOpenFilter}
              className={`flex items-center gap-1.5 h-9 px-3 rounded-xl border text-xs font-medium transition-all shadow-2xs shrink-0 ${
                activeFilterCount > 0
                  ? 'border-primary bg-primary text-primary-foreground font-semibold'
                  : 'border-border/70 bg-card hover:bg-accent text-foreground'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filter</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-background text-foreground text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* 1. Desktop Mode (Multi-column DataTable for md screens and above) */}
      <div className="hidden md:block w-full overflow-x-auto fnb-datatable-wrapper">
        <DataTable
          ref={dtRef}
          data={categories}
          columns={columns}
          options={options}
          slots={slots}
          className="display w-full border-collapse"
        />
      </div>

      {/* 2. Device / Mobile Mode (Expand Row System - Zero Horizontal Scroll!) */}
      <div className="block md:hidden space-y-2">
        {mobilePaginatedList.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            {t.categories.emptyTitle}
          </div>
        ) : (
          mobilePaginatedList.map((cat, idx) => {
            const isExpanded = expandedRows.has(cat.id_category);
            const rowNumber = (mobilePage - 1) * pageSize + idx + 1;
            const parentName = cat.parent_id
              ? categoryMap.get(cat.parent_id) || `Induk #${cat.parent_id}`
              : '—';

            return (
              <div
                key={cat.id_category}
                className="rounded-xl border border-border/70 bg-card/80 overflow-hidden transition-all shadow-2xs"
              >
                {/* Main Row Header (Always Visible - Tap to Expand) */}
                <div
                  onClick={() => toggleRow(cat.id_category)}
                  className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/30 transition-colors select-none"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    {/* Expand Toggle Chevron */}
                    <button
                      type="button"
                      aria-label="Toggle Expand Row"
                      className="w-6 h-6 rounded-md flex items-center justify-center bg-muted/60 text-muted-foreground hover:text-foreground shrink-0 transition-transform duration-200"
                    >
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180 text-foreground' : ''
                        }`}
                      />
                    </button>

                    <span className="font-mono text-xs text-muted-foreground shrink-0">
                      {rowNumber}
                    </span>

                    <span className="font-semibold text-xs text-foreground truncate">
                      {cat.category_name}
                    </span>
                  </div>

                  {/* Status Indicator */}
                  <div className="shrink-0">
                    {cat.status === 'active' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>{t.categories.statusActive}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-normal text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                        <span>{t.categories.statusInactive}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Expanded Row Content (Smooth Accordion Dropdown) */}
                {isExpanded && (
                  <div className="px-3 pb-3 pt-2 border-t border-border/50 bg-muted/20 space-y-3 animate-in fade-in duration-150">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-muted-foreground block">
                          {t.categories.colParent}
                        </span>
                        <span className="font-medium text-foreground truncate block">
                          {parentName}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-muted-foreground block">
                          {t.categories.colType}
                        </span>
                        <span className="font-medium text-foreground block">
                          {getTypeText(cat.type)}
                        </span>
                      </div>
                    </div>

                    {/* Actions Row */}
                    <div className="flex items-center justify-between pt-2 border-t border-border/40">
                      <span className="text-[10px] text-muted-foreground">
                        {t.categories.colActions}:
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onDetail(cat)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border/70 bg-card hover:bg-muted text-xs text-foreground font-medium shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Detail</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onEdit(cat)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border/70 bg-card hover:bg-indigo-500/10 text-xs text-indigo-600 dark:text-indigo-400 font-medium shadow-2xs"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onDelete(cat)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border/70 bg-card hover:bg-destructive/10 text-xs text-destructive font-medium shadow-2xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Mobile Pagination Controls */}
        <div className="flex items-center justify-between pt-3 text-xs text-muted-foreground">
          <span>
            {currentLanguage === 'id'
              ? `Halaman ${mobilePage} dari ${totalMobilePages}`
              : `Page ${mobilePage} of ${totalMobilePages}`}
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={mobilePage <= 1}
              onClick={() => setMobilePage((p) => Math.max(1, p - 1))}
              className="h-8 px-2.5 rounded-lg border border-border/70 bg-card text-foreground disabled:opacity-40 transition-colors"
            >
              ‹
            </button>
            <span className="h-8 px-3 rounded-lg bg-foreground text-background font-bold flex items-center justify-center">
              {mobilePage}
            </span>
            <button
              type="button"
              disabled={mobilePage >= totalMobilePages}
              onClick={() => setMobilePage((p) => Math.min(totalMobilePages, p + 1))}
              className="h-8 px-2.5 rounded-lg border border-border/70 bg-card text-foreground disabled:opacity-40 transition-colors"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
