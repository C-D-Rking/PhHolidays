import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import holidaysData from './assets/JsonReadyPhilippinesPublicHolidays.json';


function App() {
  const years = Array.from({ length: 2025 - 1960 + 1 }, (_, i) => 1960 + i);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [checkedDays, setCheckedDays] = useState({});

  const getDayIndex = (day) => {
    const map = {
      'Sunday': 0,
      'Monday': 1,
      'Tuesday': 2,
      'Wednesday': 3,
      'Thursday': 4,
      'Friday': 5,
      'Saturday': 6
    };
    return map[day];
  };

  const getMonthIndex = (month) => months.indexOf(month);

  const getDatesForDay = (year, month, dayOfWeek) => {
    const monthIndex = getMonthIndex(month);
    const dayIndex = getDayIndex(dayOfWeek);
    const dates = [];
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    for (let date = 1; date <= daysInMonth; date++) {
      const d = new Date(year, monthIndex, date);
      if (d.getDay() === dayIndex) {
        dates.push(date);
      }
    }
    return dates;
  };

  let dates = [];
  let formattedDates = '';
  let yearDisplay = selectedYear || ' ';
  let monthDisplay = selectedMonth || ' ';
  let dayDisplay = selectedDay || ' ';
  const holidaysFromAsset = (() => {
    if (!selectedYear || !holidaysData) return null;
    if (holidaysData[selectedYear]) {
      return Array.isArray(holidaysData[selectedYear]) ? holidaysData[selectedYear] : [holidaysData[selectedYear]];
    }
    if (Array.isArray(holidaysData)) {
      const matches = holidaysData.filter(h => {
        if (!h) return false;
        if (typeof h === 'string') return false;
        if (h.year) return String(h.year) === String(selectedYear);
        if (h.date) {
          const dt = new Date(h.date);
          return !isNaN(dt) && dt.getFullYear() === Number(selectedYear);
        }
        return false;
      });
      if (matches.length) return matches.map(h => h.name || h.holiday || JSON.stringify(h));
    }
    if (typeof holidaysData === 'object') {
      const val = holidaysData[String(selectedYear)];
      if (val) return Array.isArray(val) ? val : [val];
    }
    return null;
  })();

  let holidaysArr = [];
  if (holidaysFromAsset && holidaysFromAsset.length) {
    holidaysArr = holidaysFromAsset
      .map(h => {
        if (typeof h === 'string') return { name: h, date: '' };
        const name = h.name || h.holiday || '';
        const date = h.date || h.dt || '';
        const dateNoDigits = String(date).replace(/\d/g, '');
        const sortKey = dateNoDigits.length;
        return { name, date, sortKey };
      })
      .sort((a, b) => {
        const ka = typeof a.sortKey === 'number' ? a.sortKey : Number.POSITIVE_INFINITY;
        const kb = typeof b.sortKey === 'number' ? b.sortKey : Number.POSITIVE_INFINITY;
        if (ka !== kb) return ka - kb;
        return String(a.name).localeCompare(String(b.name));
      });
  } else {
    holidaysArr = [];
  }

  const monthlyHolidays = (() => {
    if (!selectedYear || !selectedMonth || !holidaysData) return [];
    const yearKey = String(selectedYear);
    const yearHolidays = holidaysData[yearKey] || holidaysData[selectedYear];
    if (!Array.isArray(yearHolidays)) return [];
    return yearHolidays.filter(h => h && h.date && String(h.date).startsWith(selectedMonth));
  })();
  if (selectedYear && selectedMonth && selectedDay) {
    dates = getDatesForDay(Number(selectedYear), selectedMonth, selectedDay);
    formattedDates = dates.map(d => {
      const shortMonth = selectedMonth.slice(0, 3);
      return `${shortMonth}. ${d}`;
    }).join(', ');
  }

  

  return (
    <div className="date-dropdowns">
      <label>
        Year:
        <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
          <option value=""> </option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </label>
      <label>
        Month:
        <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
          <option value=""> </option>
          {months.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </label>
      <label>
        Day:
        <select value={selectedDay} onChange={e => setSelectedDay(e.target.value)}>
          <option value=""> </option>
          {daysOfWeek.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </label>
      
  <div className="info-container">
        On the month of <b>{monthDisplay}</b> the numbers of <b>{dayDisplay}s</b> in Year <b>{yearDisplay}</b> are: <br />
        {(selectedYear && selectedMonth && selectedDay)
          ? (formattedDates ? formattedDates : 'None')
          : ' '}
        .<br />
        Base on counting the number of "{dayDisplay}s" are: <b>{(selectedYear && selectedMonth && selectedDay) ? `${dates.length} ${dayDisplay}${dates.length !== 1 ? 's' : ''}` : ' '}</b>.
        <br />
        for the month of <b>{monthDisplay}</b> with holidays:
        <div className="holidays-box" style={{ marginTop: 6, marginBottom: 6 }}>
          {monthlyHolidays.length > 0 ? (
            <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
              {monthlyHolidays.map(h => `${h.date} ${h.name}`).join('\n')}
            </pre>
          ) : (
            <div style={{ color: '#666' }}>No holidays for selected month/year</div>
          )}
        </div>
        Holidays: <b>{monthlyHolidays.length}</b>.
        <br />
        For the year <b>{yearDisplay}</b> the number of holidays are the following:

        <ul>
          {holidaysArr.length > 0 ? holidaysArr.map((h, i) => (
            <li key={i}>
              {typeof h === 'string' ? h : `${h.date ? h.date + '  ' : ''}${h.name}`}
            </li>
          )) : <li>None</li>}
        </ul>

  <div className="section">
          <b>Month of {monthDisplay} {yearDisplay}</b>{', '}
          {(() => {
            const checked = daysOfWeek.filter(d => checkedDays[d]);
            return checked.length ? checked.join(', ') : '(no days checked)';
          })()}
        </div>

        <div className="section">
          <div>Choose days to include:</div>
          <div className="weekday-checkboxes">
            {daysOfWeek.map(d => (
              <label key={d} className="weekday-label">
                <input
                  type="checkbox"
                  checked={!!checkedDays[d]}
                  onChange={() => setCheckedDays(prev => ({ ...prev, [d]: !prev[d] }))}
                />
                {d}
              </label>
            ))}
          </div>
        </div>

  <div className="triangle">
          {(() => {
            if (!(selectedYear && selectedMonth)) return ' ';
            const checked = daysOfWeek.filter(d => checkedDays[d]);
            const checkedCount = checked.length;
            if (!checkedCount) return <div>Please check at least one weekday to see the triangle.</div>;

            const year = Number(selectedYear);
            const monthIndex = getMonthIndex(selectedMonth);
            const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

            // Compute Monday-start offset for the 1st of the month (0=Monday .. 6=Sunday)
            const firstDay = new Date(year, monthIndex, 1).getDay(); // 0=Sun..6=Sat
            const firstDayMondayIndex = (firstDay + 6) % 7; // shift so Monday=0

            // Start from the Monday of the week that contains the 1st (could be <= 0 -> previous month)
            let weekStart = 1 - firstDayMondayIndex; // may be negative or zero
            const rows = [];

            // map checked weekday names to offsets within the week where Monday=0
            const weekdayOffset = (dayName) => {
              // getDayIndex: Sunday=0..Saturday=6, convert to Monday-based 0..6
              const dow = getDayIndex(dayName); // Sunday=0..Saturday=6
              return (dow + 6) % 7; // Monday=0
            };

            while (weekStart <= daysInMonth) {
              const rowDates = [];
              for (const dName of checked) {
                const off = weekdayOffset(dName);
                const date = weekStart + off;
                if (date >= 1 && date <= daysInMonth) rowDates.push(date);
              }
              // keep ascending order
              rowDates.sort((a, b) => a - b);
              // only include rows that have at least one date inside the month
              if (rowDates.length > 0) rows.push(rowDates);
              weekStart += 7;
            }

            if (rows.length === 0) return <div>No matching dates for the selected month/year and checked weekdays.</div>;

            // Flatten week-grouped rows into a chronological list
            const flatDates = rows.flat();

            // Build an acute triangle capped at 3 per row: 1,2,3,3,3...
            const tri = [];
            const CAP = 3;
            let need = 1;
            let idx = 0;
            while (idx < flatDates.length) {
              const cur = Math.min(need, CAP);
              const slice = flatDates.slice(idx, idx + cur);
              tri.push(slice);
              idx += slice.length;
              if (need < CAP) need += 1; // increase until cap, then keep at cap
            }

            return (
              <pre>
                {tri.map(r => r.join(' ')).join('\n')}
              </pre>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

export default App
