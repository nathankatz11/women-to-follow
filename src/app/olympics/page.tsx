"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Ticket,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  GripVertical,
  Clock,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

type Priority = "must-have" | "backup";

interface TicketPlan {
  id: string;
  event: string;
  date: string;
  time: string;
  venue: string;
  quantity: number;
  priority: Priority;
  notes: string;
}

const INITIAL_TICKETS: TicketPlan[] = [
  {
    id: "1",
    event: "Women's Gymnastics",
    date: "2028-07-20",
    time: "18:00",
    venue: "",
    quantity: 6,
    priority: "must-have",
    notes: "",
  },
  {
    id: "2",
    event: "Swimming",
    date: "2028-07-23",
    time: "",
    venue: "",
    quantity: 6,
    priority: "must-have",
    notes: "",
  },
  {
    id: "3",
    event: "Women's Soccer Semifinal",
    date: "2028-08-01",
    time: "17:00",
    venue: "SoFi Stadium",
    quantity: 4,
    priority: "must-have",
    notes: "",
  },
  {
    id: "4",
    event: "Women's Basketball Gold Medal Game",
    date: "2028-08-09",
    time: "19:30",
    venue: "Crypto.com Arena",
    quantity: 2,
    priority: "backup",
    notes: "If gymnastics sells out",
  },
  {
    id: "5",
    event: "Women's Beach Volleyball Final",
    date: "2028-08-06",
    time: "20:00",
    venue: "Santa Monica Beach",
    quantity: 2,
    priority: "backup",
    notes: "",
  },
];

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

function TicketCard({
  ticket,
  onUpdate,
  onRemove,
  isEditing,
  onToggleEdit,
}: {
  ticket: TicketPlan;
  onUpdate: (updated: TicketPlan) => void;
  onRemove: () => void;
  isEditing: boolean;
  onToggleEdit: () => void;
}) {
  const isPrimary = ticket.priority === "must-have";

  return (
    <div
      className={cn(
        "rounded-2xl border-2 p-4 transition-all",
        isPrimary
          ? "border-brand-red bg-white shadow-md"
          : "border-amber-300 bg-amber-50/50"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1 text-gray-300 cursor-grab">
          <GripVertical size={18} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={cn(
                "inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full",
                isPrimary
                  ? "bg-brand-red text-white"
                  : "bg-amber-200 text-amber-800"
              )}
            >
              {isPrimary ? (
                <CheckCircle2 size={12} />
              ) : (
                <AlertTriangle size={12} />
              )}
              {isPrimary ? "Must-Have" : "Backup"}
            </span>
            <span className="text-xs text-gray-400">
              x{ticket.quantity} ticket{ticket.quantity > 1 ? "s" : ""}
            </span>
          </div>

          <h3 className="font-bold text-brand-dark text-lg leading-tight">
            {ticket.event || "Untitled Event"}
          </h3>

          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
            {ticket.date && (
              <span className="inline-flex items-center gap-1">
                <Calendar size={14} />
                {new Date(ticket.date + "T00:00:00").toLocaleDateString(
                  "en-US",
                  {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  }
                )}
              </span>
            )}
            {ticket.time && (
              <span className="inline-flex items-center gap-1">
                <Clock size={14} />
                {ticket.time}
              </span>
            )}
            {ticket.venue && (
              <span className="inline-flex items-center gap-1">
                <MapPin size={14} />
                {ticket.venue}
              </span>
            )}
          </div>

          {ticket.notes && (
            <p className="mt-2 text-sm text-gray-400 italic">
              {ticket.notes}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onToggleEdit}
            className="p-1.5 rounded-lg hover:bg-black/5 transition-colors text-gray-400 hover:text-brand-dark"
          >
            {isEditing ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          <button
            onClick={onRemove}
            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-gray-300 hover:text-brand-red"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {isEditing && (
        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              Event Name
            </label>
            <input
              type="text"
              value={ticket.event}
              onChange={(e) => onUpdate({ ...ticket, event: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow"
              placeholder="e.g. Women's 200m Final"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              Date
            </label>
            <input
              type="date"
              value={ticket.date}
              onChange={(e) => onUpdate({ ...ticket, date: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              Time
            </label>
            <input
              type="time"
              value={ticket.time}
              onChange={(e) => onUpdate({ ...ticket, time: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              Venue
            </label>
            <input
              type="text"
              value={ticket.venue}
              onChange={(e) => onUpdate({ ...ticket, venue: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow"
              placeholder="e.g. LA Memorial Coliseum"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              Quantity
            </label>
            <input
              type="number"
              min={1}
              max={24}
              value={ticket.quantity}
              onChange={(e) =>
                onUpdate({
                  ...ticket,
                  quantity: Math.max(1, parseInt(e.target.value) || 1),
                })
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              Priority
            </label>
            <select
              value={ticket.priority}
              onChange={(e) =>
                onUpdate({
                  ...ticket,
                  priority: e.target.value as Priority,
                })
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow"
            >
              <option value="must-have">Must-Have</option>
              <option value="backup">Backup</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              Notes
            </label>
            <input
              type="text"
              value={ticket.notes}
              onChange={(e) => onUpdate({ ...ticket, notes: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow"
              placeholder="e.g. Backup if gymnastics sells out"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function OlympicsScheduler() {
  const [tickets, setTickets] = useState<TicketPlan[]>(INITIAL_TICKETS);
  const [editingId, setEditingId] = useState<string | null>(null);

  const mustHaves = tickets.filter((t) => t.priority === "must-have");
  const backups = tickets.filter((t) => t.priority === "backup");
  const totalMustHave = mustHaves.reduce((sum, t) => sum + t.quantity, 0);
  const totalBackup = backups.reduce((sum, t) => sum + t.quantity, 0);
  const totalAll = totalMustHave + totalBackup;

  function addTicket(priority: Priority) {
    const newTicket: TicketPlan = {
      id: generateId(),
      event: "",
      date: "2028-07-21",
      time: "12:00",
      venue: "",
      quantity: 2,
      priority,
      notes: "",
    };
    setTickets([...tickets, newTicket]);
    setEditingId(newTicket.id);
  }

  function updateTicket(updated: TicketPlan) {
    setTickets(tickets.map((t) => (t.id === updated.id ? updated : t)));
  }

  function removeTicket(id: string) {
    setTickets(tickets.filter((t) => t.id !== id));
    if (editingId === id) setEditingId(null);
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="bg-brand-red text-white p-2.5 rounded-xl">
              <Ticket size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-brand-dark">
                LA 2028 Olympics Ticket Planner
              </h1>
              <p className="text-sm text-gray-500">
                Purchase day: Tomorrow, April 7, 2026
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* Budget Tracker */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-brand-dark mb-4">Ticket Budget</h2>
          <div className="flex items-end gap-2 mb-3">
            <span
              className={cn(
                "text-4xl font-black",
                totalMustHave > 24 ? "text-brand-red" : "text-brand-dark"
              )}
            >
              {totalMustHave}
            </span>
            <span className="text-lg text-gray-400 mb-1">/ 24 tickets</span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden mb-3">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                totalMustHave > 24 ? "bg-brand-red" : "bg-brand-red"
              )}
              style={{ width: `${Math.min((totalMustHave / 24) * 100, 100)}%` }}
            />
          </div>

          <div className="flex gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-brand-red" />
              <span className="text-gray-600">
                Must-Have: <strong>{totalMustHave}</strong> tickets (
                {mustHaves.length} events)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-300" />
              <span className="text-gray-600">
                Backup: <strong>{totalBackup}</strong> tickets ({backups.length}{" "}
                events)
              </span>
            </div>
          </div>

          {totalMustHave > 24 && (
            <div className="mt-3 flex items-center gap-2 text-brand-red text-sm font-semibold">
              <AlertTriangle size={16} />
              Over budget by {totalMustHave - 24} tickets! Move some to backup.
            </div>
          )}
        </div>

        {/* Purchase Order / Schedule */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-brand-dark mb-1">
            Purchase Order (Must-Haves)
          </h2>
          <p className="text-sm text-gray-400 mb-4">
            Try to buy these first, in order. Click the arrow to edit details.
          </p>
          <div className="space-y-3">
            {mustHaves.map((ticket, i) => (
              <div key={ticket.id} className="flex items-start gap-2">
                <span className="mt-4 w-6 h-6 rounded-full bg-brand-red text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <TicketCard
                    ticket={ticket}
                    onUpdate={updateTicket}
                    onRemove={() => removeTicket(ticket.id)}
                    isEditing={editingId === ticket.id}
                    onToggleEdit={() =>
                      setEditingId(
                        editingId === ticket.id ? null : ticket.id
                      )
                    }
                  />
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => addTicket("must-have")}
            className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-3 text-sm font-semibold text-gray-400 hover:border-brand-red hover:text-brand-red transition-colors"
          >
            <Plus size={16} />
            Add Must-Have Event
          </button>
        </div>

        {/* Backup Plans */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-brand-dark mb-1">Backup Plans</h2>
          <p className="text-sm text-gray-400 mb-4">
            If a must-have sells out, grab one of these instead.
          </p>
          <div className="space-y-3">
            {backups.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onUpdate={updateTicket}
                onRemove={() => removeTicket(ticket.id)}
                isEditing={editingId === ticket.id}
                onToggleEdit={() =>
                  setEditingId(
                    editingId === ticket.id ? null : ticket.id
                  )
                }
              />
            ))}
          </div>
          <button
            onClick={() => addTicket("backup")}
            className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-3 text-sm font-semibold text-gray-400 hover:border-amber-400 hover:text-amber-600 transition-colors"
          >
            <Plus size={16} />
            Add Backup Event
          </button>
        </div>

        {/* Quick Reference */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-brand-dark mb-3">
            Purchase Day Checklist
          </h2>
          <ul className="space-y-2 text-sm text-gray-600">
            {[
              "Log in 15 minutes early and have payment info saved",
              "Open this page on a second screen for reference",
              `Must-have tickets total: ${totalMustHave} of 24`,
              `Backup events ready: ${backups.length} alternatives`,
              "If an event is sold out, skip immediately and move to the next",
              "Circle back to backups only after all must-haves are attempted",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2
                  size={16}
                  className="text-brand-red shrink-0 mt-0.5"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Summary Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-brand-dark mb-3">
            Schedule at a Glance
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-400">
                  <th className="pb-2 font-semibold">Event</th>
                  <th className="pb-2 font-semibold">Date</th>
                  <th className="pb-2 font-semibold">Qty</th>
                  <th className="pb-2 font-semibold">Type</th>
                </tr>
              </thead>
              <tbody>
                {[...mustHaves, ...backups]
                  .sort(
                    (a, b) =>
                      new Date(a.date).getTime() - new Date(b.date).getTime()
                  )
                  .map((t) => (
                    <tr
                      key={t.id}
                      className="border-b border-gray-50 last:border-0"
                    >
                      <td className="py-2 pr-3 font-medium text-brand-dark">
                        {t.event || "Untitled"}
                      </td>
                      <td className="py-2 pr-3 text-gray-500">
                        {t.date
                          ? new Date(t.date + "T00:00:00").toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric" }
                            )
                          : "TBD"}
                      </td>
                      <td className="py-2 pr-3">{t.quantity}</td>
                      <td className="py-2">
                        <span
                          className={cn(
                            "text-xs font-bold px-2 py-0.5 rounded-full",
                            t.priority === "must-have"
                              ? "bg-red-100 text-brand-red"
                              : "bg-amber-100 text-amber-700"
                          )}
                        >
                          {t.priority === "must-have" ? "Must" : "Backup"}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-sm font-semibold">
            <span>Total tickets across all events</span>
            <span
              className={cn(totalAll > 24 ? "text-brand-red" : "text-brand-dark")}
            >
              {totalAll}
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
