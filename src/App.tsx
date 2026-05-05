import { useMemo, useState } from "react";
import { FileText, Printer, Search } from "lucide-react";
import { jobTravelers } from "./data/jobTravelers";
import type { JobTraveler, OrderStatus } from "./types";
import "./App.css";

function App() {
  const [orders, setOrders] = useState<JobTraveler[]>(jobTravelers);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>("active");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState(
    jobTravelers[0]?.id ?? "",
  );

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus = order.status === selectedStatus;
      const normalizedSearch = searchTerm.trim().toLowerCase();

      if (!normalizedSearch) {
        return matchesStatus;
      }

      return (
        matchesStatus &&
        (order.orderNumber.toLowerCase().includes(normalizedSearch) ||
          order.customer.toLowerCase().includes(normalizedSearch) ||
          order.jobName.toLowerCase().includes(normalizedSearch))
      );
    });
  }, [orders, searchTerm, selectedStatus]);

  const selectedOrder = useMemo(() => {
    return (
      orders.find((order) => order.id === selectedOrderId) ??
      filteredOrders[0] ??
      orders[0]
    );
  }, [orders, filteredOrders, selectedOrderId]);

  function handleStatusChange(status: OrderStatus) {
    setSelectedStatus(status);

    const firstMatchingOrder = orders.find((order) => order.status === status);
    if (firstMatchingOrder) {
      setSelectedOrderId(firstMatchingOrder.id);
    }
  }

  function toggleOrderStatus(orderId: string) {
    const targetOrder = orders.find((order) => order.id === orderId);

    if (!targetOrder) {
      return;
    }

    const nextStatus: OrderStatus =
      targetOrder.status === "active" ? "past" : "active";

    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId ? { ...order, status: nextStatus } : order,
      ),
    );

    setSelectedStatus(nextStatus);
    setSelectedOrderId(orderId);
  }

  return (
    <main className="app-shell">
      <header className="app-header no-print">
        <div>
          <p className="eyebrow">Olympus Job Travelers</p>
          <h1>Sewing Production Translation Portal</h1>
          <p className="subtitle">
            View active and past job travelers with translated production
            sections.
          </p>
        </div>

        <button className="print-button" onClick={() => window.print()}>
          <Printer size={18} />
          Print
        </button>
      </header>

      <section className="layout">
        <aside className="orders-panel no-print">
          <div className="search-box">
            <Search size={18} />
            <input
              value={searchTerm}
              placeholder="Search order, customer, or job..."
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div className="tabs">
            <button
              className={`tab-button ${
                selectedStatus === "active" ? "active-tab-active" : ""
              }`}
              onClick={() => handleStatusChange("active")}
            >
              Active Orders
            </button>
            <button
              className={`tab-button ${
                selectedStatus === "past" ? "active-tab-past" : ""
              }`}
              onClick={() => handleStatusChange("past")}
            >
              Past Orders
            </button>
          </div>

          <div className="order-list">
            {filteredOrders.length === 0 ? (
              <p className="empty-state">No orders found.</p>
            ) : (
              filteredOrders.map((order) => (
                <button
                  key={order.id}
                  className={`order-card ${
                    selectedOrder?.id === order.id ? "selected" : ""
                  }`}
                  onClick={() => setSelectedOrderId(order.id)}
                >
                  <span className="order-number">{order.orderNumber}</span>
                  <span className="customer">{order.customer}</span>
                  <span className="job-name">{order.jobName}</span>
                </button>
              ))
            )}
          </div>
        </aside>

        {selectedOrder && (
          <OrderDetail
            order={selectedOrder}
            onToggleStatus={toggleOrderStatus}
          />
        )}
      </section>
    </main>
  );
}

interface OrderDetailProps {
  order: JobTraveler;
  onToggleStatus: (orderId: string) => void;
}

function formatContent(content: string) {
  const lines = content.split("\n");

  return lines.map((line, index) => {
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      return <div key={index} className="section-break" />;
    }

    const colonIndex = line.indexOf(":");

    if (colonIndex !== -1) {
      const label = line.slice(0, colonIndex + 1);
      const value = line.slice(colonIndex + 1);

      return (
        <div key={index} className="formatted-line">
          <strong>{label}</strong>
          {value}
        </div>
      );
    }

    return (
      <div key={index} className="formatted-line">
        {line}
      </div>
    );
  });
}

function OrderDetail({ order, onToggleStatus }: OrderDetailProps) {
  return (
    <article className="order-detail">
      <section className="detail-card header-card">
        <div className="order-title-row">
          <div>
            <p className="eyebrow">Job Traveler</p>
            <h2>Order #{order.orderNumber}</h2>
          </div>

          <div className="order-actions no-print">
            <button
              className="secondary-button"
              onClick={() => onToggleStatus(order.id)}
            >
              {order.status === "active"
                ? "Move to Past Orders"
                : "Move to Active Orders"}
            </button>

            <span className={`status-badge ${order.status}`}>
              {order.status === "active" ? "Active" : "Past"}
            </span>
          </div>
        </div>

        <div className="header-grid">
          <InfoItem label="Job Name" value={order.jobName} />
          <InfoItem label="Customer" value={order.customer} />
          <InfoItem label="Description" value={order.description} />
          <InfoItem label="PO Number" value={order.poNumber} />
          <InfoItem label="Sales Person" value={order.salesPerson} />
          <InfoItem label="Engineer" value={order.engineer} />
          <InfoItem label="Entry Person" value={order.entryPerson} />
          <InfoItem label="Required Date" value={order.requiredDate} />
          <InfoItem label="For Order" value={String(order.quantityForOrder)} />
          <InfoItem label="For Stock" value={String(order.quantityForStock)} />
          <InfoItem label="Total" value={String(order.totalQuantity)} />
          <InfoItem label="Ship Via" value={order.shipVia} />
          <InfoItem label="Ship Date" value={order.shipDate} />
          <InfoItem label="Ship To" value={order.shipTo} />
        </div>

        <div className="source-file">
          <FileText size={18} />
          <span>Source file: {order.sourceFileName}</span>
        </div>
      </section>

      <section className="translation-section">
        <div className="section-heading">
          <p className="eyebrow">Translated Production Sections</p>
          <h3>English labels with Spanish content</h3>
        </div>

        {order.sections.map((section) => (
          <section className="detail-card section-card" key={section.id}>
            <h4>
              {section.labelEn} / {section.labelEs}
            </h4>

            <div className="comparison-grid">
              <div>
                <p className="column-label">Original English</p>
                <div className="formatted-content">
                  {formatContent(section.contentEn)}
                </div>
              </div>

              <div>
                <p className="column-label">Spanish Translation</p>
                <div className="formatted-content">
                  {formatContent(section.contentEs)}
                </div>
              </div>
            </div>
          </section>
        ))}
      </section>
    </article>
  );
}

interface InfoItemProps {
  label: string;
  value: string;
}

function InfoItem({ label, value }: InfoItemProps) {
  return (
    <div className="info-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default App;
