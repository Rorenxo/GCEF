document.addEventListener('DOMContentLoaded', function() {
  const calendarEl = document.getElementById('calendar');

  if (!calendarEl) {
    console.error("Calendar element not found!");
    return;
  }


  if (typeof FullCalendar === 'undefined' || typeof FullCalendar.Calendar === 'undefined') {
    //console.error("FullCalendar library not loaded!");
    //console.log("Available globals:", Object.keys(window).filter(key => key.includes('Calendar')));
    return;
  }

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    height: 600,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    },
    buttonText: {
      today: 'Today',
      month: 'Month',
      week: 'Week',
      day: 'Day',
      list: 'List'
    },
    events: [
      { title: 'Event 1', start: new Date(), allDay: true },
      { title: 'Event 2', start: '2025-09-25', allDay: true }
    ],
    eventColor: '#15B34C', 
    eventTextColor: '#fff',
    navLinks: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    eventDidMount: function(info) {
      info.el.style.borderRadius = '8px';
      info.el.style.fontSize = '0.85rem';
    },
    dateClick: function(info) {
      console.log('Date clicked:', info.dateStr);
    }
  });

  calendar.render();
  console.log("Calendar rendered successfully!"); 
});
