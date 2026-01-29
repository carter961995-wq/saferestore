import { useEffect, useState } from "react";
import { clearEvents, getEvents } from "../lib/analytics.js";

export default function EventsPage() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    setEvents(getEvents().slice(-50).reverse());
  }, []);

  const handleClear = () => {
    clearEvents();
    setEvents([]);
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate">Events</h1>
        <button
          className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate transition hover:border-slate-300"
          type="button"
          onClick={handleClear}
        >
          Clear Events
        </button>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <ul className="space-y-2 text-xs text-slate-600">
          {events.length === 0 ? (
            <li>No events yet.</li>
          ) : (
            events.map((event, index) => (
              <li key={`${event.ts}-${index}`} className="space-y-1">
                <div className="font-semibold text-slate-700">
                  {event.event}
                </div>
                <div>{new Date(event.ts).toLocaleString()}</div>
                {event.data ? (
                  <pre className="whitespace-pre-wrap text-[11px] text-slate-500">
                    {JSON.stringify(event.data)}
                  </pre>
                ) : null}
              </li>
            ))
          )}
        </ul>
      </div>
    </section>
  );
}
