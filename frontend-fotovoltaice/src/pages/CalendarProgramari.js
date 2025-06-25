import React, { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import ro from "date-fns/locale/ro";

const locales = { ro };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const CalendarProgramari = () => {
  const [evenimente, setEvenimente] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3001/api/programari")
      .then((res) => res.json())
      .then((data) => {
        const ev = data.map((p) => ({
          id: p.id,
          title: `${p.client_name} - ${p.project_name}`,
          start: new Date(p.data_programare),
          end: new Date(p.data_programare),
          allDay: true,
        }));
        setEvenimente(ev);
      });
  }, []);

  const handleEventDrop = ({ event, start }) => {
    fetch(`http://localhost:3001/api/programari/${event.id}/data`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data_programare: start.toISOString().split("T")[0],
      }),
    })
      .then((res) => res.json())
      .then(() => {
        setEvenimente((prev) =>
          prev.map((e) => (e.id === event.id ? { ...e, start, end: start } : e))
        );
      });
  };

  const handleDeblocheazaZi = (zi) => {
    if (window.confirm(`Deblochezi ziua ${zi}?`)) {
      fetch(`http://localhost:3001/api/zile-blocate/${zi}`, {
        method: "DELETE",
      })
        .then((res) => res.json())
        .then(() => window.location.reload());
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">📅 Calendar lucrări</h2>
      <Calendar
        localizer={localizer}
        events={evenimente}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        draggableAccessor={() => true}
        onEventDrop={handleEventDrop}
        resizable
      />
    </div>
  );
};

export default CalendarProgramari;
