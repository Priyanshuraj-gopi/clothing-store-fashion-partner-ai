import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  Filter,
  Download,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Sparkles,
  ArrowUpDown,
  ShoppingBag,
  DoorOpen,
  Phone,
  Mail,
  UserCheck,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { CustomerRecord, LeadStatus, FitProfile } from '../types';
import { initialCustomers, storeAssociates } from '../data/crmData';

type CrmPortalProps = {
  currentCustomerFit: FitProfile;
  currentBagCount: number;
  onSelectCustomerForStyling: (customer: CustomerRecord) => void;
  onClose: () => void;
};

export function CrmPortal({
  currentCustomerFit,
  currentBagCount,
  onSelectCustomerForStyling,
  onClose,
}: CrmPortalProps) {
  const [customers, setCustomers] = useState<CustomerRecord[]>(() => {
    try {
      const saved = localStorage.getItem('caelus-crm-customers');
      return saved ? (JSON.parse(saved) as CustomerRecord[]) : initialCustomers;
    } catch {
      return initialCustomers;
    }
  });

  const [activeTab, setActiveTab] = useState<'leads' | 'new-customer' | 'analytics'>('leads');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [tierFilter, setTierFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'spend' | 'visits' | 'name'>('spend');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);
  const [activeAssociate] = useState(storeAssociates[0]);

  // New customer form state
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustTier, setNewCustTier] = useState<CustomerRecord['tier']>('Standard');
  const [newCustStatus, setNewCustStatus] = useState<LeadStatus>('New');
  const [newCustOccasion, setNewCustOccasion] = useState('Date Night');
  const [newCustStyle, setNewCustStyle] = useState('Quiet Luxury');
  const [newCustNotes, setNewCustNotes] = useState('');
  const [newCustRoom, setNewCustRoom] = useState('');

  const saveCustomers = (updated: CustomerRecord[]) => {
    setCustomers(updated);
    try {
      localStorage.setItem('caelus-crm-customers', JSON.stringify(updated));
    } catch {
      // Ignored
    }
  };

  const filteredCustomers = useMemo(() => {
    return customers
      .filter((c) => {
        const matchesQuery =
          c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.phone.includes(searchQuery) ||
          c.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
        const matchesTier = tierFilter === 'All' || c.tier === tierFilter;
        return matchesQuery && matchesStatus && matchesTier;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortBy === 'spend') diff = a.totalSpend - b.totalSpend;
        else if (sortBy === 'visits') diff = a.visitCount - b.visitCount;
        else diff = a.fullName.localeCompare(b.fullName);
        return sortOrder === 'desc' ? -diff : diff;
      });
  }, [customers, searchQuery, statusFilter, tierFilter, sortBy, sortOrder]);

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) return;

    const newRecord: CustomerRecord = {
      id: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
      fullName: newCustName.trim(),
      phone: newCustPhone.trim() || '+91 90000 00000',
      email: newCustEmail.trim() || 'customer@retail.in',
      tier: newCustTier,
      status: newCustStatus,
      fitProfile: currentCustomerFit,
      favoriteOccasion: newCustOccasion,
      favoriteStyle: newCustStyle,
      stylistNotes: newCustNotes.trim(),
      fittingRoomAssigned: newCustRoom ? `Suite ${newCustRoom}` : undefined,
      visitCount: 1,
      totalSpend: 0,
      lastVisit: 'Just now',
      savedOutfitIds: [],
    };

    const updated = [newRecord, ...customers];
    saveCustomers(updated);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustEmail('');
    setNewCustNotes('');
    setNewCustRoom('');
    setActiveTab('leads');
    setSelectedCustomer(newRecord);
  };

  const handleUpdateStatus = (id: string, nextStatus: LeadStatus) => {
    const updated = customers.map((c) => (c.id === id ? { ...c, status: nextStatus } : c));
    saveCustomers(updated);
    if (selectedCustomer?.id === id) {
      setSelectedCustomer((prev) => (prev ? { ...prev, status: nextStatus } : null));
    }
  };

  const handleDeleteCustomer = (id: string) => {
    if (confirm('Are you sure you want to remove this customer record?')) {
      const updated = customers.filter((c) => c.id !== id);
      saveCustomers(updated);
      if (selectedCustomer?.id === id) setSelectedCustomer(null);
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Full Name', 'Phone', 'Email', 'Tier', 'Status', 'Total Spend', 'Visits', 'Notes'];
    const rows = customers.map((c) => [
      c.id,
      `"${c.fullName}"`,
      `"${c.phone}"`,
      `"${c.email}"`,
      c.tier,
      c.status,
      c.totalSpend,
      c.visitCount,
      `"${c.stylistNotes.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `caelus-crm-customers-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="crm-overlay">
      <div className="crm-container">
        {/* CRM Topbar */}
        <header className="crm-header">
          <div className="crm-brand">
            <span className="brand-orbit">◉</span>
            <div>
              <h2>Retail Associate & Stylist CRM</h2>
              <p>Store Concierge · Logged in as {activeAssociate.name} ({activeAssociate.role})</p>
            </div>
          </div>
          <div className="crm-header-actions">
            <button className="button ghost small" onClick={handleExportCSV}>
              <Download size={15} /> Export CSV
            </button>
            <button className="icon-button modal-close" onClick={onClose} aria-label="Close CRM">
              <X size={18} />
            </button>
          </div>
        </header>

        {/* CRM Subnav */}
        <div className="crm-nav">
          <div className="crm-tabs">
            <button
              className={activeTab === 'leads' ? 'active' : ''}
              onClick={() => setActiveTab('leads')}
            >
              <Users size={15} /> Client Records & Floor Leads ({customers.length})
            </button>
            <button
              className={activeTab === 'new-customer' ? 'active' : ''}
              onClick={() => setActiveTab('new-customer')}
            >
              <Plus size={15} /> Register In-Store Client
            </button>
            <button
              className={activeTab === 'analytics' ? 'active' : ''}
              onClick={() => setActiveTab('analytics')}
            >
              <Sparkles size={15} /> Stylist Performance & Floor Metrics
            </button>
          </div>
        </div>

        {/* Tab 1: Leads and Customers */}
        {activeTab === 'leads' && (
          <div className="crm-body">
            <div className="crm-filters-bar">
              <div className="crm-search">
                <Search size={15} />
                <input
                  type="text"
                  placeholder="Search by client name, mobile or email…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="crm-filter-group">
                <Filter size={14} />
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="All">All Statuses</option>
                  <option value="New">New</option>
                  <option value="Fitting Room">In Fitting Room</option>
                  <option value="Styling Active">Styling Active</option>
                  <option value="VIP Client">VIP Client</option>
                  <option value="Completed">Completed</option>
                </select>

                <select value={tierFilter} onChange={(e) => setTierFilter(e.target.value)}>
                  <option value="All">All Tiers</option>
                  <option value="Standard">Standard</option>
                  <option value="Silver">Silver</option>
                  <option value="Gold VIP">Gold VIP</option>
                  <option value="Black Diamond">Black Diamond</option>
                </select>

                <button
                  className="sort-button"
                  onClick={() => {
                    if (sortBy === 'spend') setSortBy('visits');
                    else if (sortBy === 'visits') setSortBy('name');
                    else setSortBy('spend');
                  }}
                >
                  <ArrowUpDown size={14} /> Sort: {sortBy} ({sortOrder})
                </button>
                <button
                  className="sort-direction-btn"
                  onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                  aria-label="Toggle sort order"
                >
                  {sortOrder === 'desc' ? '↓' : '↑'}
                </button>
              </div>
            </div>

            <div className="crm-content-layout">
              {/* Customer Table */}
              <div className="crm-table-wrap">
                <table className="crm-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Status</th>
                      <th>Tier</th>
                      <th>Fit Profile</th>
                      <th>Fitting Suite</th>
                      <th>Spend</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="crm-empty-cell">
                          No matching customer records found.
                        </td>
                      </tr>
                    ) : (
                      filteredCustomers.map((cust) => (
                        <tr
                          key={cust.id}
                          className={selectedCustomer?.id === cust.id ? 'selected-row' : ''}
                          onClick={() => setSelectedCustomer(cust)}
                        >
                          <td>
                            <strong>{cust.fullName}</strong>
                            <small>{cust.phone}</small>
                          </td>
                          <td>
                            <span className={`status-tag tag-${cust.status.toLowerCase().replace(/\s+/g, '-')}`}>
                              {cust.status}
                            </span>
                          </td>
                          <td>
                            <span className="tier-tag">{cust.tier}</span>
                          </td>
                          <td>
                            {cust.fitProfile.size} · {cust.fitProfile.preference}
                          </td>
                          <td>
                            {cust.fittingRoomAssigned ? (
                              <span className="room-badge">
                                <DoorOpen size={12} /> {cust.fittingRoomAssigned}
                              </span>
                            ) : (
                              <span className="muted-dash">—</span>
                            )}
                          </td>
                          <td>
                            <strong>₹{cust.totalSpend.toLocaleString('en-IN')}</strong>
                          </td>
                          <td>
                            <div className="table-actions" onClick={(e) => e.stopPropagation()}>
                              <button
                                className="action-link"
                                onClick={() => {
                                  onSelectCustomerForStyling(cust);
                                  onClose();
                                }}
                                title="Open this profile in Live Stylist"
                              >
                                <Sparkles size={14} /> Style
                              </button>
                              <button
                                className="action-delete"
                                onClick={() => handleDeleteCustomer(cust.id)}
                                title="Delete record"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Customer Detail Drawer */}
              {selectedCustomer && (
                <aside className="crm-detail-drawer">
                  <div className="drawer-header">
                    <div>
                      <span className="eyebrow">{selectedCustomer.id}</span>
                      <h3>{selectedCustomer.fullName}</h3>
                      <p>{selectedCustomer.tier} Member</p>
                    </div>
                    <button
                      className="icon-button small"
                      onClick={() => setSelectedCustomer(null)}
                      aria-label="Close detail panel"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  <div className="drawer-body">
                    <div className="detail-stat-grid">
                      <div>
                        <span>TOTAL VISITS</span>
                        <strong>{selectedCustomer.visitCount}</strong>
                      </div>
                      <div>
                        <span>TOTAL SPEND</span>
                        <strong>₹{selectedCustomer.totalSpend.toLocaleString('en-IN')}</strong>
                      </div>
                    </div>

                    <div className="detail-section">
                      <p className="section-label">CONTACT INFORMATION</p>
                      <p className="detail-row">
                        <Phone size={13} /> {selectedCustomer.phone}
                      </p>
                      <p className="detail-row">
                        <Mail size={13} /> {selectedCustomer.email}
                      </p>
                    </div>

                    <div className="detail-section">
                      <p className="section-label">FLOOR STATUS & SUITE</p>
                      <select
                        value={selectedCustomer.status}
                        onChange={(e) => handleUpdateStatus(selectedCustomer.id, e.target.value as LeadStatus)}
                        className="status-selector"
                      >
                        <option value="New">New Floor Lead</option>
                        <option value="Fitting Room">In Fitting Room</option>
                        <option value="Styling Active">Styling Active</option>
                        <option value="VIP Client">VIP Client Consult</option>
                        <option value="Completed">Checkout Completed</option>
                      </select>
                    </div>

                    <div className="detail-section">
                      <p className="section-label">FIT & STYLE PROFILE</p>
                      <div className="fit-chips">
                        <span>Height: {selectedCustomer.fitProfile.height}</span>
                        <span>Size: {selectedCustomer.fitProfile.size}</span>
                        <span>Cut: {selectedCustomer.fitProfile.preference}</span>
                        <span>Occasion: {selectedCustomer.favoriteOccasion}</span>
                        <span>Vibe: {selectedCustomer.favoriteStyle}</span>
                      </div>
                    </div>

                    <div className="detail-section">
                      <p className="section-label">STYLIST CONSULTATION NOTES</p>
                      <p className="stylist-notes-text">{selectedCustomer.stylistNotes || 'No notes added yet.'}</p>
                    </div>

                    <button
                      className="button primary full"
                      onClick={() => {
                        onSelectCustomerForStyling(selectedCustomer);
                        onClose();
                      }}
                    >
                      <Sparkles size={16} /> Load in AI Stylist
                    </button>
                  </div>
                </aside>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Register New In-Store Client */}
        {activeTab === 'new-customer' && (
          <form className="crm-form-body" onSubmit={handleCreateCustomer}>
            <div className="form-header">
              <h3>Register In-Store Client</h3>
              <p>Capture customer preferences directly at the style desk or fitting room entryway.</p>
            </div>

            <div className="form-grid">
              <label>
                <span>Full Name *</span>
                <input
                  required
                  type="text"
                  placeholder="e.g. Priya Kapoor"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                />
              </label>

              <label>
                <span>Mobile Number *</span>
                <input
                  type="tel"
                  placeholder="+91 98000 00000"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                />
              </label>

              <label>
                <span>Email Address</span>
                <input
                  type="email"
                  placeholder="client@domain.com"
                  value={newCustEmail}
                  onChange={(e) => setNewCustEmail(e.target.value)}
                />
              </label>

              <label>
                <span>Membership Tier</span>
                <select value={newCustTier} onChange={(e) => setNewCustTier(e.target.value as CustomerRecord['tier'])}>
                  <option value="Standard">Standard Tier</option>
                  <option value="Silver">Silver Privileges</option>
                  <option value="Gold VIP">Gold VIP</option>
                  <option value="Black Diamond">Black Diamond Exclusive</option>
                </select>
              </label>

              <label>
                <span>Initial Lifecycle Status</span>
                <select value={newCustStatus} onChange={(e) => setNewCustStatus(e.target.value as LeadStatus)}>
                  <option value="New">New In-Store Lead</option>
                  <option value="Fitting Room">Fitting Room Active</option>
                  <option value="Styling Active">Stylist Consultation</option>
                  <option value="VIP Client">VIP Client</option>
                </select>
              </label>

              <label>
                <span>Fitting Room Suite (Optional)</span>
                <input
                  type="text"
                  placeholder="e.g. Suite 02 (Diamond)"
                  value={newCustRoom}
                  onChange={(e) => setNewCustRoom(e.target.value)}
                />
              </label>

              <label>
                <span>Primary Occasion</span>
                <select value={newCustOccasion} onChange={(e) => setNewCustOccasion(e.target.value)}>
                  {['Date Night', 'College', 'Office', 'Wedding', 'Party', 'Casual', 'Vacation'].map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Style Preference</span>
                <select value={newCustStyle} onChange={(e) => setNewCustStyle(e.target.value)}>
                  {['Minimal', 'Streetwear', 'Classic', 'Quiet Luxury', 'Trendy', 'Bold'].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>

              <label className="span-full">
                <span>Stylist Observations & Fitting Notes</span>
                <textarea
                  rows={3}
                  placeholder="Notes on garment cuts, desired silhouettes, fit feedback, or items requested in fitting room…"
                  value={newCustNotes}
                  onChange={(e) => setNewCustNotes(e.target.value)}
                />
              </label>
            </div>

            <div className="form-actions">
              <button type="button" className="button ghost" onClick={() => setActiveTab('leads')}>
                Cancel
              </button>
              <button type="submit" className="button primary">
                <UserCheck size={16} /> Save Client Record
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Stylist Analytics */}
        {activeTab === 'analytics' && (
          <div className="crm-analytics-body">
            <div className="analytics-metrics-grid">
              <div className="metric-box">
                <span className="eyebrow">ACTIVE STORE CLIENTS</span>
                <strong>{customers.length}</strong>
                <small>+2 from yesterday</small>
              </div>
              <div className="metric-box">
                <span className="eyebrow">IN FITTING ROOMS</span>
                <strong>{customers.filter((c) => c.status === 'Fitting Room').length}</strong>
                <small>Average try-on: 8.5 mins</small>
              </div>
              <div className="metric-box">
                <span className="eyebrow">CUMULATIVE FLOOR SPEND</span>
                <strong>₹{customers.reduce((acc, c) => acc + c.totalSpend, 0).toLocaleString('en-IN')}</strong>
                <small>Across active consultations</small>
              </div>
              <div className="metric-box">
                <span className="eyebrow">AI FIT ADOPTION</span>
                <strong>94%</strong>
                <small>Visual silhouette calibrated</small>
              </div>
            </div>

            <div className="analytics-details">
              <h4>Store Associate Shift Roster</h4>
              <div className="associates-list">
                {storeAssociates.map((assoc) => (
                  <div key={assoc.id} className="assoc-item">
                    <div>
                      <strong>{assoc.name}</strong>
                      <span>{assoc.role}</span>
                    </div>
                    <span className="shift-badge">{assoc.shiftStatus}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
