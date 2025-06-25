// src/pages/Programari.js
import React, { useState, useEffect, useCallback } from "react";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import moment from "moment";
import "moment/locale/ro";

moment.locale("ro");
const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(BigCalendar);

const statusColors = {
  programata: "#ffcc00",
  "in curs": "#3399ff",
  finalizata: "#28a745",
  blocata: "#dc3545",
};

const Programari = () => {
  const [evenimente, setEvenimente] = useState([]);
  const [zileBlocate, setZileBlocate] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res1 = await fetch("http://localhost:3001/api/programari");
      const res2 = await fetch("http://localhost:3001/api/zile-blocate");
      const programari = await res1.json();
      const blocate = await res2.json();

      const events = programari.map((p) => {
        const start = new Date(p.data_programare);
        const end = new Date(
          start.getTime() + ((p.durata_zile || 1) - 1) * 24 * 60 * 60 * 1000
        );

        return {
          id: p.id,
          title: `${p.client_name} - ${p.project_name}`,
          start,
          end,
          status: p.status,
          observatii: p.observatii,
          durata_zile: p.durata_zile || 1,
        };
      });

      const blockedDays = blocate.map((z, index) => ({
        id: `blocata-${index}`,
        title: `❌ ${z.motiv || "Zi blocată"}`,
        start: new Date(z.data),
        end: new Date(z.data),
        status: "blocata",
        allDay: true,
      }));

      setEvenimente([...events, ...blockedDays]);
      setZileBlocate(blocate.map((z) => z.data));
    };

    fetchData();
  }, []);

  const handleEventDrop = useCallback(({ event, start }) => {
    if (event.status === "blocata") {
      return alert("⚠️ Nu poți muta o zi blocată.");
    }

    const newDate = moment(start).format("YYYY-MM-DD");

    fetch(`http://localhost:3001/api/programari/${event.id}/data`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data_programare: newDate }),
    })
      .then((res) => res.json())
      .then(() => {
        setEvenimente((prev) =>
          prev.map((e) => (e.id === event.id ? { ...e, start, end: start } : e))
        );
      })
      .catch((err) => console.error("Eroare la mutare:", err));
  }, []);

  const handleSelectSlot = (slotInfo) => {
    const data = moment(slotInfo.start).format("YYYY-MM-DD");
    const motiv = prompt(`Blochează ziua ${data}. Motiv:`); // motiv blocare ziua calendar
    if (motiv) {
      fetch("http://localhost:3001/api/zile-blocate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, motiv }),
      })
        .then((res) => res.json())
        .then(() => window.location.reload());
    }
  };

  const eventStyleGetter = (event) => {
    let bgColor = statusColors[event.status] || "#888";

    // Dacă are durată > 1 zi, folosim alta culoare sau accent
    if (event.durata_zile > 1 && event.status !== "blocata") {
      bgColor = "#f39c12"; // portocaliu deschis pentru durată lungă ///////////////////de verificat
    }

    return {
      style: {
        backgroundColor: bgColor,
        color: "white",
        borderRadius: "6px",
        border: "none",
        padding: "2px 6px",
      },
    };
  };

  const handleSelectEvent = (event) => {
    if (event.status === "blocata") {
      const confirmare = window.confirm(
        `Deblochezi ziua ${moment(event.start).format("YYYY-MM-DD")} (${
          event.title
        })?`
      );
      if (confirmare) {
        fetch(
          `http://localhost:3001/api/zile-blocate/${moment(event.start).format(
            "YYYY-MM-DD"
          )}`,
          {
            method: "DELETE",
          }
        )
          .then((res) => res.json())
          .then(() => window.location.reload());
      }
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">📅 Calendar programări</h2>

      <DnDCalendar
        localizer={localizer}
        events={evenimente}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "80vh" }}
        views={["month", "week", "day"]}
        defaultView="month"
        onEventDrop={handleEventDrop}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        selectable
        eventPropGetter={eventStyleGetter}
        popup
        resizable={false}
      />
    </div>
  );
};

export default Programari;
