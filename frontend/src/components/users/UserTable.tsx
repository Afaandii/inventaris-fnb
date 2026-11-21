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
import type { User } from "@/types/user";

// eslint-disable-next-line react-hooks/rules-of-hooks
DataTable.use(DT);

interface UserTableProps {
  users: User[];
  onDetail: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onOpenFilter?: () => void;
  activeFilterCount?: number;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
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

  // Expanded rows state for mobile device mode (Expand Row System)
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
  }, [users, searchQuery]);

  const formatDate = useCallback(
    (isoString?: string | null) => {
      if (!isoString) return "—";
      try {
        const date = new Date(isoString);
        return new Intl.DateTimeFormat(
          currentLanguage === "id" ? "id-ID" : "en-US",
          {
            dateStyle: "medium",
            timeStyle: "short",
          },
        ).format(date);
      } catch {
        return isoString;
      }
    },
    [currentLanguage],
  );

  // Mobile filtered & paginated data
  const mobileFilteredData = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase().trim();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone_number && u.phone_number.toLowerCase().includes(q)) ||
        (u.role_name && u.role_name.toLowerCase().includes(q)) ||
        (u.display_role_name && u.display_role_name.toLowerCase().includes(q)) ||
        (u.outlet_name && u.outlet_name.toLowerCase().includes(q)),
    );
  }, [users, searchQuery]);

  const totalMobilePages = Math.max(
    1,
    Math.ceil(mobileFilteredData.length / pageSize),
  );
  const mobilePaginatedList = useMemo(() => {
    const start = (mobilePage - 1) * pageSize;
    return mobileFilteredData.slice(start, start + pageSize);
  }, [mobileFilteredData, mobilePage, pageSize]);

  // DataTables Column Definitions (For Desktop Mode - Matching Ingredient Structure)
  const columns = useMemo(() => {
    return [
      {
        title: "No",
        data: "id_user",
        width: "50px",
        className: "dt-left",
      },
      {
        title: t.users.colUser,
        data: "name",
        className: "dt-left",
      },
      {
        title: t.users.colRole,
        data: "role_id",
        className: "dt-left",
      },
      {
        title: t.users.colOutlet,
        data: "outlet_id",
        className: "dt-left",
      },
      {
        title: t.users.colContact,
        data: "email",
        className: "dt-left",
      },
      {
        title: t.users.colStatus,
        data: "is_active",
        className: "dt-left",
      },
      {
        title: t.users.colActions,
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
        _row: User,
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

      // Column 1: User (Name + Username)
      1: (_data: unknown, row: User) => (
        <div className="flex flex-col">
          <span className="font-semibold text-xs text-foreground tracking-tight">
            {row.name}
          </span>
          <span className="font-mono text-[11px] text-muted-foreground">
            @{row.username}
          </span>
        </div>
      ),

      // Column 2: Role Name
      2: (_data: unknown, row: User) => (
        <span className="text-xs text-foreground/80 font-normal truncate max-w-[150px] inline-block">
          {row.display_role_name || row.role_name || `Role #${row.role_id}`}
        </span>
      ),

      // Column 3: Outlet Name
      3: (_data: unknown, row: User) => (
        <span className="text-xs text-foreground/80 font-normal truncate max-w-[150px] inline-block">
          {row.outlet_name || `Outlet #${row.outlet_id}`}
        </span>
      ),

      // Column 4: Contact (Email + Phone)
      4: (_data: unknown, row: User) => (
        <div className="text-xs">
          <span className="text-foreground">{row.email}</span>
          {row.phone_number && (
            <span className="text-muted-foreground block text-[11px] font-mono">
              {row.phone_number}
            </span>
          )}
        </div>
      ),

      // Column 5: Status (clean text with subtle dot, matching IngredientTable)
      5: (_data: unknown, row: User) => {
        const isActive = row.is_active && row.status === "active";
        return isActive ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{t.users.statusActive}</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-normal text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
            <span>
              {row.status === "suspended"
                ? t.users.statusSuspended
                : row.status === "banned"
                  ? t.users.statusBanned
                  : t.users.statusInactive}
            </span>
          </span>
        );
      },

      // Column 6: Actions (Detail, Edit, Delete with native React onClick handlers)
      6: (_data: unknown, row: User) => (
        <div className="flex items-center justify-end gap-1.5">
          {/* Detail Button */}
          <button
            type="button"
            onClick={() => onDetail(row)}
            title={t.users.detailUser}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-border/70 bg-card hover:bg-accent text-muted-foreground hover:text-foreground transition-all shadow-2xs cursor-pointer"
            aria-label="Detail"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          {/* Edit Button */}
          <button
            type="button"
            onClick={() => onEdit(row)}
            title={t.users.editUser}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-border/70 bg-card hover:bg-indigo-500/10 text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-2xs cursor-pointer"
            aria-label="Edit"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={() => onDelete(row)}
            title={t.users.deleteUser}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-border/70 bg-card hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all shadow-2xs cursor-pointer"
            aria-label="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    };
  }, [t, onDetail, onEdit, onDelete]);

  // DataTables Options Configuration (Desktop - Matching Ingredient Structure)
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
            ? "Showing _START_ to _END_ of _TOTAL_ users"
            : "Showing _START_ to _END_ of _TOTAL_ users",
        infoEmpty:
          currentLanguage === "id"
            ? "No users available"
            : "No users available",
        infoFiltered:
          currentLanguage === "id"
            ? "(filtered from _MAX_ total entries)"
            : "(filtered from _MAX_ total entries)",
        zeroRecords: t.users.emptyTitle,
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
              placeholder={t.users.searchPlaceholder}
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
          data={users}
          columns={columns}
          options={options}
          slots={slots}
          className="display w-full border-collapse"
        />
      </div>

      {/* 2. Device / Mobile Mode (Expand Row System - Exactly identical to IngredientTable) */}
      <div className="block md:hidden space-y-2">
        {mobilePaginatedList.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            {t.users.emptyTitle}
          </div>
        ) : (
          mobilePaginatedList.map((item, idx) => {
            const isExpanded = expandedRows.has(item.id_user);
            const rowNumber = (mobilePage - 1) * pageSize + idx + 1;

            return (
              <div
                key={item.id_user}
                className="rounded-xl border border-border/70 bg-card/80 overflow-hidden transition-all shadow-2xs"
              >
                {/* Main Row Header (Always Visible - Tap to Expand) */}
                <div
                  onClick={() => toggleRow(item.id_user)}
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
                      {item.name}
                    </span>
                  </div>

                  {/* Status Indicator */}
                  <div className="shrink-0">
                    {item.is_active && item.status === "active" ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>{t.users.statusActive}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-normal text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                        <span>{t.users.statusInactive}</span>
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
                          {t.users.colUsername}
                        </span>
                        <span className="font-medium text-foreground truncate block font-mono">
                          @{item.username}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-muted-foreground block">
                          {t.users.colRole}
                        </span>
                        <span className="font-medium text-foreground block">
                          {item.display_role_name || item.role_name || `Role #${item.role_id}`}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-muted-foreground block">
                          {t.users.colOutlet}
                        </span>
                        <span className="font-medium text-foreground block">
                          {item.outlet_name || `Outlet #${item.outlet_id}`}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-muted-foreground block">
                          {t.users.colEmail}
                        </span>
                        <span className="font-medium text-foreground truncate block">
                          {item.email}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-muted-foreground block">
                          {t.users.colPhone}
                        </span>
                        <span className="font-medium text-foreground font-mono block">
                          {item.phone_number || "—"}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-muted-foreground block">
                          {t.users.colLastLogin}
                        </span>
                        <span className="font-medium text-muted-foreground font-mono text-[11px] block">
                          {formatDate(item.last_login)}
                        </span>
                      </div>
                    </div>

                    {/* Actions Row (Identical to IngredientTable) */}
                    <div className="flex items-center justify-between pt-2 border-t border-border/40">
                      <span className="text-[10px] text-muted-foreground">
                        {t.users.colActions}:
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

export default UserTable;
