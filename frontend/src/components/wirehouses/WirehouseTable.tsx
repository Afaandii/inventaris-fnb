import React, {
  useMemo,
  useRef,
  useState,
  useEffect,
  useCallback,
} from "react";
import DataTable, { type DataTableRef } from "datatables.net-react";
import DT from "datatables.net-dt";
import "datatables.net-dt/css/dataTables.dataTables.css";
import { Eye, Pencil, Trash2, Search, Filter, ChevronDown } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import type { Wirehouse, TypeWirehouse, StatusWirehouse } from "@/types/wirehouse";

// eslint-disable-next-line react-hooks/rules-of-hooks
DataTable.use(DT);

interface WirehouseTableProps {
  wirehouses: Wirehouse[];
  onDetail: (wirehouse: Wirehouse) => void;
  onEdit: (wirehouse: Wirehouse) => void;
  onDelete: (wirehouse: Wirehouse) => void;
  onOpenFilter?: () => void;
  activeFilterCount?: number;
}

export const WirehouseTable: React.FC<WirehouseTableProps> = ({
  wirehouses,
  onDetail,
  onEdit,
  onDelete,
  onOpenFilter,
  activeFilterCount = 0,
}) => {
  const { t, currentLanguage } = useTranslation();
  const dtRef = useRef<DataTableRef>(null);

  const [searchQuery, setSearchQuery] = useState("");
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
  }, [wirehouses, searchQuery]);

  // Type label renderer helper
  const renderTypeBadge = useCallback(
    (type: TypeWirehouse) => {
      switch (type) {
        case "main":
          return (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span>{t.wirehouses.typeMain}</span>
            </span>
          );
        case "kitchen":
          return (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>{t.wirehouses.typeKitchen}</span>
            </span>
          );
        case "bar":
          return (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-600 dark:text-purple-400">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              <span>{t.wirehouses.typeBar}</span>
            </span>
          );
        case "storage":
        default:
          return (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{t.wirehouses.typeStorage}</span>
            </span>
          );
      }
    },
    [t],
  );

  // Status badge renderer helper
  const renderStatusBadge = useCallback(
    (status: StatusWirehouse) => {
      switch (status) {
        case "active":
          return (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{t.wirehouses.statusActive}</span>
            </span>
          );
        case "maintenance":
          return (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>{t.wirehouses.statusMaintenance}</span>
            </span>
          );
        case "closed":
          return (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>{t.wirehouses.statusClosed}</span>
            </span>
          );
        case "inactive":
        default:
          return (
            <span className="inline-flex items-center gap-1.5 text-xs font-normal text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
              <span>{t.wirehouses.statusInactive}</span>
            </span>
          );
      }
    },
    [t],
  );

  // Mobile filtered & paginated data
  const mobileFilteredData = useMemo(() => {
    if (!searchQuery.trim()) return wirehouses;
    const q = searchQuery.toLowerCase().trim();
    return wirehouses.filter(
      (w) =>
        w.wirehouse_name.toLowerCase().includes(q) ||
        w.wirehouse_code.toLowerCase().includes(q) ||
        w.city.toLowerCase().includes(q) ||
        w.address.toLowerCase().includes(q) ||
        (w.Outlet?.outlet_name || "").toLowerCase().includes(q) ||
        (w.User?.name || "").toLowerCase().includes(q) ||
        (w.phone_number || "").toLowerCase().includes(q),
    );
  }, [wirehouses, searchQuery]);

  const totalMobilePages = Math.max(
    1,
    Math.ceil(mobileFilteredData.length / pageSize),
  );
  const mobilePaginatedList = useMemo(() => {
    const start = (mobilePage - 1) * pageSize;
    return mobileFilteredData.slice(start, start + pageSize);
  }, [mobileFilteredData, mobilePage, pageSize]);

  // DataTables Column Definitions (For Desktop Mode)
  const columns = useMemo(() => {
    return [
      {
        title: "No",
        data: "id_wirehouse",
        width: "50px",
        className: "dt-left",
      },
      {
        title: t.wirehouses.colName,
        data: "wirehouse_name",
        className: "dt-left",
      },
      {
        title: t.wirehouses.colOutlet,
        data: "outlet_id",
        className: "dt-left",
      },
      {
        title: t.wirehouses.colCityAddress,
        data: "city",
        className: "dt-left",
      },
      {
        title: t.wirehouses.colType,
        data: "type",
        className: "dt-left",
      },
      {
        title: t.wirehouses.colStatus,
        data: "status",
        className: "dt-left",
      },
      {
        title: t.wirehouses.colActions,
        data: null,
        orderable: false,
        searchable: false,
        width: "110px",
        className: "dt-right",
      },
    ];
  }, [t]);

  // Custom Rendering Slots for React components (Desktop)
  const slots = useMemo(() => {
    return {
      // Column 0: No (clean number)
      0: (
        _data: unknown,
        _row: Wirehouse,
        _type: unknown,
        meta?: { row: number },
      ) => {
        const rowNumber = meta !== undefined ? meta.row + 1 : 1;
        return (
          <span className="font-mono text-xs font-medium text-muted-foreground">
            {rowNumber}
          </span>
        );
      },

      // Column 1: Warehouse Name & Code
      1: (_data: unknown, row: Wirehouse) => (
        <div className="flex flex-col">
          <span className="font-semibold text-xs text-foreground tracking-tight">
            {row.wirehouse_name}
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">
            {row.wirehouse_code}
          </span>
        </div>
      ),

      // Column 2: Linked Outlet & Manager
      2: (_data: unknown, row: Wirehouse) => (
        <div className="flex flex-col max-w-[200px]">
          <span className="text-xs font-medium text-foreground truncate">
            {row.Outlet?.outlet_name || `Outlet #${row.outlet_id}`}
          </span>
          <span className="text-[10px] text-muted-foreground truncate">
            {row.User?.name ? `PJ: ${row.User.name}` : "—"}
          </span>
        </div>
      ),

      // Column 3: City & Address
      3: (_data: unknown, row: Wirehouse) => (
        <div className="flex flex-col max-w-[220px]">
          <span className="text-xs font-medium text-foreground">
            {row.city}
          </span>
          <span
            className="text-[11px] text-muted-foreground truncate"
            title={row.address}
          >
            {row.address}
          </span>
        </div>
      ),

      // Column 4: Warehouse Type
      4: (_data: unknown, row: Wirehouse) => renderTypeBadge(row.type),

      // Column 5: Status
      5: (_data: unknown, row: Wirehouse) => renderStatusBadge(row.status),

      // Column 6: Actions (Detail, Edit, Delete with native React onClick handlers)
      6: (_data: unknown, row: Wirehouse) => (
        <div className="flex items-center justify-end gap-1.5">
          {/* Detail Button */}
          <button
            type="button"
            onClick={() => onDetail(row)}
            title={t.wirehouses.detailWirehouse}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-border/70 bg-card hover:bg-accent text-muted-foreground hover:text-foreground transition-all shadow-2xs cursor-pointer"
            aria-label="Detail"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          {/* Edit Button */}
          <button
            type="button"
            onClick={() => onEdit(row)}
            title={t.wirehouses.editWirehouse}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-border/70 bg-card hover:bg-indigo-500/10 text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-2xs cursor-pointer"
            aria-label="Edit"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={() => onDelete(row)}
            title={t.wirehouses.deleteWirehouse}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-border/70 bg-card hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all shadow-2xs cursor-pointer"
            aria-label="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    };
  }, [t, onDetail, onEdit, onDelete, renderTypeBadge, renderStatusBadge]);

  // DataTables Options Configuration (Desktop)
  const options = useMemo(() => {
    return {
      responsive: true,
      pageLength: pageSize,
      order: [[0, "asc"]],
      layout: {
        topStart: null,
        topEnd: null,
        bottomStart: "info",
        bottomEnd: "paging",
      },
      language: {
        info:
          currentLanguage === "id"
            ? "Menampilkan _START_ sampai _END_ dari _TOTAL_ gudang"
            : "Showing _START_ to _END_ of _TOTAL_ warehouses",
        infoEmpty:
          currentLanguage === "id"
            ? "Tidak ada data gudang"
            : "No warehouses available",
        infoFiltered:
          currentLanguage === "id"
            ? "(disaring dari _MAX_ total data)"
            : "(filtered from _MAX_ total entries)",
        zeroRecords: t.wirehouses.emptyTitle,
        paginate: {
          first: "«",
          previous: "‹",
          next: "›",
          last: "»",
        },
      },
    };
  }, [pageSize, currentLanguage, t]);

  return (
    <div className="w-full rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-xs p-4 sm:p-5 space-y-4">
      {/* Top Custom Toolbar: Show entries on Left, Search + Filter Button on Right */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Show [N] entries */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{currentLanguage === "id" ? "Tampilkan" : "Show"}</span>
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
          <span>{currentLanguage === "id" ? "data" : "entries"}</span>
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
              placeholder={t.wirehouses.searchPlaceholder}
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-border/70 bg-card text-foreground text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/40 transition-all"
            />
          </div>

          {/* Filter Button right next to search */}
          {onOpenFilter && (
            <button
              type="button"
              onClick={onOpenFilter}
              className={`flex items-center gap-1.5 h-9 px-3 rounded-xl border text-xs font-medium transition-all shadow-2xs shrink-0 cursor-pointer ${
                activeFilterCount > 0
                  ? "border-primary bg-primary text-primary-foreground font-semibold"
                  : "border-border/70 bg-card hover:bg-accent text-foreground"
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
          data={wirehouses}
          columns={columns}
          options={options}
          slots={slots}
          className="display w-full border-collapse"
        />
      </div>

      {/* 2. Device / Mobile Mode (Expand Row System - Exactly identical to Category/Ingredient/Outlet Table) */}
      <div className="block md:hidden space-y-2">
        {mobilePaginatedList.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            {t.wirehouses.emptyTitle}
          </div>
        ) : (
          mobilePaginatedList.map((item, idx) => {
            const isExpanded = expandedRows.has(item.id_wirehouse);
            const rowNumber = (mobilePage - 1) * pageSize + idx + 1;

            return (
              <div
                key={item.id_wirehouse}
                className="rounded-xl border border-border/70 bg-card/80 overflow-hidden transition-all shadow-2xs"
              >
                {/* Main Row Header (Always Visible - Tap to Expand) */}
                <div
                  onClick={() => toggleRow(item.id_wirehouse)}
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
                          isExpanded ? "rotate-180 text-foreground" : ""
                        }`}
                      />
                    </button>

                    <span className="font-mono text-xs text-muted-foreground shrink-0">
                      {rowNumber}
                    </span>

                    <span className="font-semibold text-xs text-foreground truncate">
                      {item.wirehouse_name}
                    </span>
                  </div>

                  {/* Status Indicator */}
                  <div className="shrink-0">
                    {renderStatusBadge(item.status)}
                  </div>
                </div>

                {/* Expanded Row Content (Smooth Accordion Dropdown) */}
                {isExpanded && (
                  <div className="px-3 pb-3 pt-2 border-t border-border/50 bg-muted/20 space-y-3 animate-in fade-in duration-150">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-muted-foreground block">
                          {t.wirehouses.colOutlet}
                        </span>
                        <span className="font-medium text-foreground truncate block">
                          {item.Outlet?.outlet_name || `Outlet #${item.outlet_id}`}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-muted-foreground block">
                          {t.wirehouses.colManager}
                        </span>
                        <span className="font-medium text-foreground truncate block">
                          {item.User?.name || "—"}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-muted-foreground block">
                          {t.wirehouses.colType}
                        </span>
                        <div className="mt-0.5">{renderTypeBadge(item.type)}</div>
                      </div>

                      <div>
                        <span className="text-[10px] text-muted-foreground block">
                          {t.wirehouses.colCity}
                        </span>
                        <span className="font-medium text-foreground truncate block">
                          {item.city}
                        </span>
                      </div>

                      <div className="col-span-2">
                        <span className="text-[10px] text-muted-foreground block">
                          {t.wirehouses.colPhone}
                        </span>
                        <span className="font-medium text-foreground block font-mono">
                          {item.phone_number || "—"}
                        </span>
                      </div>

                      <div className="col-span-2">
                        <span className="text-[10px] text-muted-foreground block">
                          {t.wirehouses.colAddress}
                        </span>
                        <span className="font-medium text-foreground block">
                          {item.address}
                        </span>
                      </div>
                    </div>

                    {/* Actions Row */}
                    <div className="flex items-center justify-between pt-2 border-t border-border/40">
                      <span className="text-[10px] text-muted-foreground">
                        {t.wirehouses.colActions}:
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onDetail(item)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border/70 bg-card hover:bg-muted text-xs text-foreground font-medium shadow-2xs cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Detail</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onEdit(item)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border/70 bg-card hover:bg-indigo-500/10 text-xs text-indigo-600 dark:text-indigo-400 font-medium shadow-2xs cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onDelete(item)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border/70 bg-card hover:bg-destructive/10 text-xs text-destructive font-medium shadow-2xs cursor-pointer"
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
            {currentLanguage === "id"
              ? `Halaman ${mobilePage} dari ${totalMobilePages}`
              : `Page ${mobilePage} of ${totalMobilePages}`}
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={mobilePage <= 1}
              onClick={() => setMobilePage((p) => Math.max(1, p - 1))}
              className="h-8 px-2.5 rounded-lg border border-border/70 bg-card text-foreground disabled:opacity-40 transition-colors cursor-pointer"
            >
              ‹
            </button>
            <span className="h-8 px-3 rounded-lg bg-foreground text-background font-bold flex items-center justify-center">
              {mobilePage}
            </span>
            <button
              type="button"
              disabled={mobilePage >= totalMobilePages}
              onClick={() =>
                setMobilePage((p) => Math.min(totalMobilePages, p + 1))
              }
              className="h-8 px-2.5 rounded-lg border border-border/70 bg-card text-foreground disabled:opacity-40 transition-colors cursor-pointer"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WirehouseTable;
