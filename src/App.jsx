import { useEffect, useMemo, useState } from "react";
import { BrowserRouter, NavLink, Route, Routes, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, ArrowUpRight, CalendarDays, Check, ChevronDown,
  Compass, Edit3, Heart, Leaf, MapPin, Menu, Moon, Plus, Search, Sun,
  Trash2, Wallet, X, GripVertical, Plane, Map, ListTodo,
  CircleDollarSign, ExternalLink, Sparkles, SlidersHorizontal, Bookmark,
} from "lucide-react";
import { AppDataProvider, useAppData } from "./context/AppDataContext";
import { categories, destinations } from "./data/destinations";
import heroLandscape from "./assets/hero-landscape.jpg";
import "./App.css";

const THEME_KEY = "roam-theme";
const money = (value, currency = "EUR") => new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(Number(value) || 0);
const currencyTotals = (items = []) => { const totals = items.reduce((acc, item) => { const currency = item.currency || "EUR"; acc[currency] = (acc[currency] || 0) + Number(item.amount || 0); return acc; }, {}); return Object.entries(totals).map(([currency, amount]) => money(amount, currency)).join(" Â· ") || money(0); };
const dateLabel = (value, options = { month: "short", day: "numeric", year: "numeric" }) => value ? new Date(`${value}T12:00:00`).toLocaleDateString("en-US", options) : "Date not set";
const tripDays = (start, end) => start && end ? Math.max(1, Math.round((new Date(`${end}T00:00:00Z`) - new Date(`${start}T00:00:00Z`)) / 86400000) + 1) : 0;
const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function initialTheme() {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "dark" || stored === "light") return stored;
  } catch { /* use system preference */ }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function Image({ src, alt, className = "", fallback = "A place worth discovering" }) {
  const [failedSrc, setFailedSrc] = useState(null);
  const baseUrl = import.meta.env.BASE_URL;
  const resolvedSrc = src?.startsWith("/") && baseUrl !== "/" && !src.startsWith(baseUrl)
    ? `${baseUrl}${src.slice(1)}`
    : src;
  if (failedSrc === src || !src) return <div className={`image-fallback ${className}`} role="img" aria-label={alt}><Compass size={25} /><span>{fallback}</span></div>;
  return <img className={className} src={resolvedSrc} alt={alt} loading={className === "hero-image" ? "eager" : "lazy"} fetchPriority={className === "hero-image" ? "high" : "auto"} onError={() => setFailedSrc(src)} />;
}

function ThemeButton({ theme, onToggle }) {
  return <button className="theme-toggle" onClick={onToggle} type="button" aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>{theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}<span>{theme === "dark" ? "Light" : "Dark"}</span></button>;
}

function Header({ theme, onToggle }) {
  const [open, setOpen] = useState(false);
  const { trips, savedPlaces } = useAppData();
  const links = [{ to: "/trips", label: "My trips", icon: CalendarDays }, { to: "/explore", label: "Explore", icon: Compass }, { to: "/saved", label: "Saved places", icon: Heart }];
  return <header className="header"><div className="header-inner">
    <NavLink to="/" className="brand" onClick={() => setOpen(false)}><span className="brand-mark"><Leaf size={19} /></span><span>roam<span className="brand-dot">.</span></span></NavLink>
    <button className="mobile-menu" type="button" aria-label="Toggle navigation" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
    <nav className={`nav ${open ? "nav-open" : ""}`}>{links.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === "/"} onClick={() => setOpen(false)} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}><Icon size={16} />{label}{to === "/trips" && <span className="nav-count">{trips.length}</span>}{to === "/saved" && savedPlaces.length > 0 && <span className="nav-count">{savedPlaces.length}</span>}</NavLink>)}</nav>
    <div className="header-right"><span className="header-tag"><span className="live-dot" /> Your next chapter awaits</span><ThemeButton theme={theme} onToggle={onToggle} /></div>
  </div></header>;
}

function SectionTitle({ eyebrow, title, link, to = "/explore" }) {
  return <div className="section-title"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div>{link && <NavLink className="text-link" to={to}>{link}<ArrowRight size={16} /></NavLink>}</div>;
}

function TripCard({ trip }) {
  const days = tripDays(trip.startDate, trip.endDate);
  return <article className="trip-card"><NavLink to={`/trips/${trip.id}`} className="trip-cover-link"><Image src={trip.coverImage} alt={`${trip.destination} trip`} className="trip-cover" /><span className="trip-pill"><span className="live-dot" /> Planning</span><span className="cover-arrow"><ArrowUpRight size={18} /></span></NavLink><div className="trip-card-body"><div className="trip-location"><MapPin size={14} />{trip.destination}, {trip.country}</div><h3><NavLink to={`/trips/${trip.id}`}>{trip.name}</NavLink></h3><p className="muted clamp-two">{trip.description || "A new adventure is taking shape."}</p><div className="trip-meta"><span><CalendarDays size={14} />{dateLabel(trip.startDate, { month: "short", day: "numeric" })} â€“ {dateLabel(trip.endDate, { month: "short", day: "numeric", year: "numeric" })}</span><span>{days} days</span></div><div className="trip-card-bottom"><span>{trip.activities?.length || 0} planned activities</span><NavLink to={`/trips/${trip.id}`} className="circle-arrow" aria-label="Open trip"><ArrowRight size={16} /></NavLink></div></div></article>;
}

function DestinationCard({ place }) {
  const { isSaved, toggleSaved } = useAppData();
  const saved = isSaved(place.id);
  return <article className="destination-card"><div className="destination-cover"><Image src={place.image} alt={`${place.name}, ${place.country}`} className="destination-img" /><button className={`heart-button ${saved ? "saved" : ""}`} type="button" onClick={() => toggleSaved(place)} aria-label={saved ? `Remove ${place.name} from saved` : `Save ${place.name}`} aria-pressed={saved}>{saved ? <Check size={17} /> : <Heart size={17} />}</button><span className="category-pill">{place.category}</span></div><div className="destination-body"><div><h3>{place.name}</h3><span className="muted small">{place.country}</span></div><p className="muted clamp-two">{place.description}</p><div className="destination-actions"><span className="small muted"><MapPin size={13} /> {place.lat.toFixed(2)}, {place.lng.toFixed(2)}</span><NavLink to={`/explore/${place.id}`} className="small-link">Discover <ArrowUpRight size={14} /></NavLink></div></div></article>;
}

function HomePage() {
  const { trips } = useAppData();
  const upcoming = [...trips].sort((a, b) => a.startDate.localeCompare(b.startDate));
  return <main className="page-shell"><section className="hero"><div className="hero-copy"><span className="eyebrow"><Sparkles size={14} /> YOUR TRAVEL JOURNAL</span><h1>Where will you<br /><em>go next?</em></h1><p>Collect the places you dream of, plan days worth remembering, and make room for the unexpected.</p><div className="hero-actions"><NavLink to="/trips/new" className="button button-primary"><Plus size={17} /> Plan a trip <ArrowRight size={16} /></NavLink><NavLink to="/explore" className="button button-ghost">Explore destinations <ArrowUpRight size={16} /></NavLink></div><div className="hero-note"><span className="note-icon"><Leaf size={16} /></span> Good trips start with a little curiosity.</div></div><div className="hero-art"><Image src={heroLandscape} alt="Alpine lake and mountains" className="hero-image" fallback="Find your next horizon" /><div className="hero-caption"><span className="caption-pin"><MapPin size={15} /></span><div><strong>Somewhere extraordinary</strong><span>Your next favorite place</span></div></div><span className="hero-sparkle" aria-hidden="true"><Sparkles size={15} strokeWidth={1.8} /></span></div></section>
    <section className="section-block"><SectionTitle eyebrow="YOUR TRAVEL JOURNAL" title="Trips on your mind" link="Explore destinations" /><div className="trip-grid">{upcoming.slice(0, 3).map((trip) => <TripCard key={trip.id} trip={trip} />)}<NavLink to="/trips/new" className="new-trip-card"><span className="new-trip-icon"><Plus size={23} /></span><strong>A new adventure?</strong><span>Every great trip starts somewhere.</span><span className="new-trip-link">Create a trip <ArrowRight size={15} /></span></NavLink></div>{upcoming.length > 3 && <div className="inline-more"><NavLink to="/trips" className="text-link">View all trips <ArrowRight size={16} /></NavLink></div>}</section>
    <section className="section-block"><SectionTitle eyebrow="A LITTLE INSPIRATION" title="Places worth dreaming about" link="Explore all places" /><div className="destination-grid">{destinations.slice(0, 3).map((place) => <DestinationCard key={place.id} place={place} />)}</div></section>
    <Footer />
  </main>;
}

function ExplorePage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const filtered = useMemo(() => destinations.filter((place) => `${place.name} ${place.country} ${place.description}`.toLowerCase().includes(query.toLowerCase().trim()) && (category === "All" || place.category === category)), [query, category]);
  return <main className="page-shell content-page"><PageIntro eyebrow="THE WORLD IS WAITING" title={<>Find your <em>somewhere.</em></>} description="A curated collection of places to spark your next big adventure." /><div className="explore-toolbar"><label className="search-field"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search destinations or countries..." /><SlidersHorizontal size={17} /></label><div className="filter-row">{categories.map((item) => <button key={item} type="button" className={`filter-chip ${category === item ? "selected" : ""}`} onClick={() => setCategory(item)}>{item}</button>)}</div></div><div className="results-line"><span className="eyebrow">CURATED COLLECTION</span><span>{filtered.length} destinations</span></div>{filtered.length ? <div className="destination-grid explore-grid">{filtered.map((place) => <DestinationCard key={place.id} place={place} />)}</div> : <EmptyState icon={Compass} title="No destinations found" description="Try another search or clear your category filter." action="Clear filters" onAction={() => { setQuery(""); setCategory("All"); }} />}</main>;
}

function SavedPage() {
  const { savedPlaces, clearSaved } = useAppData();
  return <main className="page-shell content-page"><PageIntro eyebrow="YOUR PERSONAL COLLECTION" title={<>Places to <em>come back to.</em></>} description="Keep the places that caught your eye close at hand." />{savedPlaces.length ? <><div className="results-line"><span className="eyebrow">SAVED PLACES</span><button className="small-link danger-text" type="button" onClick={() => { if (window.confirm("Remove all saved places?")) clearSaved(); }}>Clear all</button></div><div className="destination-grid">{savedPlaces.map((place) => <DestinationCard key={place.id} place={place} />)}</div></> : <EmptyState icon={Bookmark} title="Your collection is waiting" description="Tap the heart on any destination to save it here." action="Explore destinations" to="/explore" />}</main>;
}

function PageIntro({ eyebrow, title, description }) { return <div className="page-intro"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>; }

function EmptyState({ icon: Icon, title, description, action, onAction, to }) {
  return <div className="empty-state"><span className="empty-icon"><Icon size={29} /></span><h2>{title}</h2><p>{description}</p>{to ? <NavLink className="button button-primary" to={to}>{action}<ArrowRight size={16} /></NavLink> : action && <button className="button button-secondary" onClick={onAction} type="button">{action}</button>}</div>;
}

function TripFormPage() {
  const { tripId } = useParams();
  const { trips } = useAppData();
  const existing = trips.find((trip) => trip.id === tripId);
  return <TripFormContent key={tripId || "new"} tripId={tripId} existing={existing} />;
}

function TripFormContent({ tripId, existing }) {
  const { addTrip, updateTrip } = useAppData();
  const navigate = useNavigate();
  const [form, setForm] = useState(() => existing ? { ...existing } : { name: "", destination: "", country: "", startDate: "", endDate: "", description: "", coverImage: "", lat: "", lng: "" });
  const [error, setError] = useState("");
  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  function submit(event) {
    event.preventDefault();
    if (!form.name.trim() || !form.destination.trim() || !form.country.trim() || !form.startDate || !form.endDate) { setError("Please complete all required fields."); return; }
    if (form.endDate < form.startDate) { setError("The end date must be on or after the start date."); return; }
    const match = destinations.find((place) => place.name.toLowerCase() === form.destination.trim().toLowerCase());
    const payload = { ...form, lat: Number(form.lat) || match?.lat || 20, lng: Number(form.lng) || match?.lng || 0, coverImage: match?.image || form.coverImage || "", name: form.name.trim(), destination: form.destination.trim(), country: form.country.trim(), description: form.description.trim() };
    if (existing) { updateTrip(payload); navigate(`/trips/${existing.id}`); }
    else { const trip = addTrip(payload); navigate(`/trips/${trip.id}`); }
  }
  if (tripId && !existing) return <main className="page-shell content-page"><EmptyState icon={Compass} title="Trip not found" description="This trip may have been removed." action="Back to trips" to="/" /></main>;
  return <main className="page-shell content-page narrow-page"><button className="back-link" type="button" onClick={() => navigate(-1)}><ArrowLeft size={16} /> Back</button><PageIntro eyebrow={existing ? "UPDATE YOUR PLANS" : "A NEW CHAPTER"} title={existing ? <>Edit your <em>trip.</em></> : <>Plan a new <em>adventure.</em></>} description="Start with the essentials. You can add the details as your plans take shape." /><form className="form-card" onSubmit={submit}><div className="form-grid"><label className="field full-field"><span>Trip name *</span><input name="name" value={form.name} onChange={change} placeholder="e.g. A slower kind of summer" required maxLength={70} /></label><label className="field"><span>Destination *</span><input name="destination" value={form.destination} onChange={change} placeholder="e.g. Kyoto" required /></label><label className="field"><span>Country *</span><input name="country" value={form.country} onChange={change} placeholder="e.g. Japan" required /></label><label className="field"><span>Start date *</span><input type="date" name="startDate" value={form.startDate} onChange={change} required /></label><label className="field"><span>End date *</span><input type="date" name="endDate" min={form.startDate || undefined} value={form.endDate} onChange={change} required /></label><label className="field full-field"><span>Description</span><textarea name="description" value={form.description || ""} onChange={change} rows="3" placeholder="What are you looking forward to?" maxLength={240} /></label><details className="advanced-fields full-field"><summary>Map coordinates <span>(optional)</span><ChevronDown size={15} /></summary><p className="field-hint">If the destination is in our curated list, coordinates are filled automatically. Otherwise, add latitude and longitude to position your map.</p><div className="form-grid"><label className="field"><span>Latitude</span><input type="number" step="any" name="lat" value={form.lat ?? ""} onChange={change} placeholder="e.g. 35.0116" /></label><label className="field"><span>Longitude</span><input type="number" step="any" name="lng" value={form.lng ?? ""} onChange={change} placeholder="e.g. 135.7681" /></label></div></details></div>{error && <p className="form-error">{error}</p>}<div className="form-actions"><button type="button" className="button button-secondary" onClick={() => navigate(-1)}>Cancel</button><button className="button button-primary" type="submit"><Check size={16} /> {existing ? "Save changes" : "Create trip"}</button></div></form></main>;
}

function TripDetailPage() {
  const { tripId } = useParams();
  const { trips, deleteTrip } = useAppData();
  const trip = trips.find((item) => item.id === tripId);
  const [tab, setTab] = useState("overview");
  const navigate = useNavigate();
  if (!trip) return <main className="page-shell content-page"><EmptyState icon={Compass} title="Trip not found" description="This trip may have been removed." action="Back to trips" to="/" /></main>;
  const expensesTotal = currencyTotals(trip.expenses || []);
  function removeTrip() { if (window.confirm(`Delete â€œ${trip.name}â€? This also removes its itinerary and expenses.`)) { deleteTrip(trip.id); navigate("/"); } }
  return <main className="page-shell content-page"><button className="back-link" type="button" onClick={() => navigate("/")}><ArrowLeft size={16} /> All trips</button><div className="trip-detail-hero"><Image src={trip.coverImage} alt={trip.destination} className="detail-cover" /><div className="detail-cover-shade" /><div className="detail-hero-copy"><span className="detail-location"><MapPin size={15} /> {trip.destination}, {trip.country}</span><h1>{trip.name}</h1><p>{dateLabel(trip.startDate)} â€” {dateLabel(trip.endDate)} <span>Â·</span> {tripDays(trip.startDate, trip.endDate)} days</p></div><div className="detail-hero-actions"><NavLink className="button button-light" to={`/trips/${trip.id}/edit`}><Edit3 size={15} /> Edit trip</NavLink><button className="icon-button light-icon" type="button" onClick={removeTrip} aria-label="Delete trip"><Trash2 size={17} /></button></div></div><div className="trip-summary-strip"><div><CalendarDays size={18} /><span><strong>{tripDays(trip.startDate, trip.endDate)}</strong><small>days</small></span></div><div><ListTodo size={18} /><span><strong>{trip.activities?.length || 0}</strong><small>activities</small></span></div><div><Wallet size={18} /><span><strong>{expensesTotal}</strong><small>spent</small></span></div></div><div className="detail-tabs" role="tablist">{[{ id: "overview", label: "Overview", icon: Compass }, { id: "itinerary", label: "Itinerary", icon: ListTodo }, { id: "budget", label: "Budget", icon: CircleDollarSign }, { id: "map", label: "Map", icon: Map }].map(({ id, label, icon: Icon }) => <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? "tab active" : "tab"} onClick={() => setTab(id)} type="button"><Icon size={16} />{label}</button>)}</div>{tab === "overview" && <TripOverview trip={trip} setTab={setTab} />}{tab === "itinerary" && <Itinerary trip={trip} />}{tab === "budget" && <Budget trip={trip} />}{tab === "map" && <TripMap trip={trip} />}</main>;
}

function TripOverview({ trip, setTab }) {
  const expenses = currencyTotals(trip.expenses || []);
  return <section className="overview-grid"><div className="overview-main"><div className="content-card"><span className="eyebrow">THE STORY SO FAR</span><h2>A little about this trip</h2><p className="body-copy">{trip.description || "No description yet. Edit your trip to add a few words about what you have planned."}</p><div className="overview-date-row"><span><CalendarDays size={16} /> {dateLabel(trip.startDate)} â€“ {dateLabel(trip.endDate)}</span><span><Plane size={16} /> {tripDays(trip.startDate, trip.endDate)} days away</span></div></div><div className="content-card"><div className="card-heading"><div><span className="eyebrow">YOUR PLAN</span><h2>Make each day count</h2></div><button className="text-link" type="button" onClick={() => setTab("itinerary")}>Open itinerary <ArrowRight size={15} /></button></div>{trip.activities?.length ? <div className="mini-list">{trip.activities.slice(0, 3).map((item) => <div className="mini-row" key={item.id}><span className="mini-time">{item.time || "Anytime"}</span><span><strong>{item.title}</strong><small>{item.day ? dateLabel(item.day, { month: "short", day: "numeric" }) : "Date not set"}</small></span></div>)}</div> : <p className="muted">Your itinerary is still a blank page. Add the first activity when inspiration strikes.</p>}</div></div><aside className="overview-side"><div className="side-stat"><span className="stat-icon"><Wallet size={19} /></span><span className="eyebrow">TOTAL SPENT</span><strong>{expenses}</strong><button className="text-link" type="button" onClick={() => setTab("budget")}>Manage budget <ArrowRight size={14} /></button></div><div className="side-stat"><span className="stat-icon"><MapPin size={19} /></span><span className="eyebrow">DESTINATION</span><strong>{trip.destination}</strong><small>{trip.country}</small><button className="text-link" type="button" onClick={() => setTab("map")}>View on map <ArrowRight size={14} /></button></div></aside></section>;
}

function Itinerary({ trip }) {
  const { updateTrip } = useAppData();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [dragId, setDragId] = useState(null);
  const [form, setForm] = useState({ title: "", day: trip.startDate, time: "09:00", category: "Sightseeing", place: "", notes: "" });
  const days = useMemo(() => Array.from({ length: tripDays(trip.startDate, trip.endDate) }, (_, index) => { const date = new Date(`${trip.startDate}T12:00:00`); date.setDate(date.getDate() + index); return date.toISOString().slice(0, 10); }), [trip.startDate, trip.endDate]);
  const activities = trip.activities || [];
  function openNew(day = trip.startDate) { setEditing(null); setForm({ title: "", day, time: "09:00", category: "Sightseeing", place: "", notes: "" }); setShowForm(true); }
  function openEdit(item) { setEditing(item.id); setForm({ ...item }); setShowForm(true); }
  function saveActivity(event) { event.preventDefault(); if (!form.title.trim()) return; const next = editing ? activities.map((item) => item.id === editing ? { ...item, ...form, title: form.title.trim() } : item) : [...activities, { ...form, id: makeId(), title: form.title.trim() }]; updateTrip({ id: trip.id, activities: next }); setShowForm(false); }
  function deleteActivity(id) { if (window.confirm("Delete this activity?")) updateTrip({ id: trip.id, activities: activities.filter((item) => item.id !== id) }); }
  function dropOn(targetId) { if (!dragId || dragId === targetId) return; const ordered = [...activities]; const from = ordered.findIndex((item) => item.id === dragId); const to = ordered.findIndex((item) => item.id === targetId); if (from < 0 || to < 0) return; const [moved] = ordered.splice(from, 1); ordered.splice(to, 0, moved); updateTrip({ id: trip.id, activities: ordered }); setDragId(null); }
  return <section className="tab-panel"><div className="panel-heading"><div><span className="eyebrow">DAY BY DAY</span><h2>Your itinerary</h2><p className="muted">Build a flexible plan. Drag activities to change their order.</p></div><button className="button button-primary" type="button" onClick={() => openNew()}><Plus size={16} /> Add activity</button></div>{showForm && <form className="inline-form content-card" onSubmit={saveActivity}><div className="card-heading"><h3>{editing ? "Edit activity" : "New activity"}</h3><button className="icon-button" type="button" onClick={() => setShowForm(false)} aria-label="Close form"><X size={17} /></button></div><div className="form-grid"><label className="field full-field"><span>Activity name *</span><input autoFocus value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Visit Fushimi Inari Shrine" required /></label><label className="field"><span>Day</span><select value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })}>{days.map((day) => <option key={day} value={day}>{dateLabel(day)}</option>)}</select></label><label className="field"><span>Time</span><input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></label><label className="field"><span>Category</span><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{["Sightseeing", "Food & drink", "Culture", "Nature", "Shopping", "Transport", "Stay", "Other"].map((item) => <option key={item}>{item}</option>)}</select></label><label className="field"><span>Place / address</span><input value={form.place} onChange={(e) => setForm({ ...form, place: e.target.value })} placeholder="Optional location" /></label><label className="field full-field"><span>Notes</span><textarea rows="2" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Reservation details, ideas, reminders..." /></label></div><div className="form-actions"><button className="button button-secondary" type="button" onClick={() => setShowForm(false)}>Cancel</button><button className="button button-primary" type="submit"><Check size={16} /> Save activity</button></div></form>}
    {days.map((day, index) => { const dayItems = activities.filter((item) => item.day === day); return <div className="itinerary-day" key={day}><div className="day-heading"><div className="day-number">{String(index + 1).padStart(2, "0")}</div><div><span className="eyebrow">DAY {index + 1}</span><h3>{dateLabel(day, { weekday: "long", month: "long", day: "numeric" })}</h3></div><button className="small-add" type="button" onClick={() => openNew(day)}><Plus size={15} /> Add</button></div>{dayItems.length ? <div className="activity-list">{dayItems.map((item) => <article className={`activity-card ${dragId === item.id ? "dragging" : ""}`} key={item.id} draggable onDragStart={() => setDragId(item.id)} onDragOver={(e) => e.preventDefault()} onDrop={() => dropOn(item.id)} onDragEnd={() => setDragId(null)}><span className="drag-handle" title="Drag to reorder"><GripVertical size={17} /></span><span className="activity-time">{item.time || "Anytime"}</span><div className="activity-info"><strong>{item.title}</strong><span>{item.category}{item.place ? ` Â· ${item.place}` : ""}</span>{item.notes && <p>{item.notes}</p>}</div><div className="activity-actions"><button className="icon-button" type="button" onClick={() => openEdit(item)} aria-label="Edit activity"><Edit3 size={15} /></button><button className="icon-button danger-icon" type="button" onClick={() => deleteActivity(item.id)} aria-label="Delete activity"><Trash2 size={15} /></button></div></article>)}</div> : <button className="day-empty" type="button" onClick={() => openNew(day)}><Plus size={16} /> Add the first activity for this day</button>}</div>; })}
  </section>;
}

function Budget({ trip }) {
  const { updateTrip } = useAppData();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", amount: "", currency: "EUR", category: "Food", date: trip.startDate, notes: "" });
  const expenses = trip.expenses || [];
  const totalsByCurrency = expenses.reduce((acc, item) => ({ ...acc, [item.currency || "EUR"]: (acc[item.currency || "EUR"] || 0) + Number(item.amount || 0) }), {});
  const categoriesTotal = expenses.reduce((acc, item) => { const key = `${item.category}|||${item.currency || "EUR"}`; acc[key] = (acc[key] || 0) + Number(item.amount || 0); return acc; }, {});
  function addExpense(event) { event.preventDefault(); if (!form.title.trim() || Number(form.amount) <= 0) return; updateTrip({ id: trip.id, expenses: [{ ...form, id: makeId(), amount: Number(form.amount), title: form.title.trim() }, ...expenses] }); setForm({ title: "", amount: "", currency: "EUR", category: "Food", date: trip.startDate, notes: "" }); setShowForm(false); }
  function removeExpense(id) { if (window.confirm("Delete this expense?")) updateTrip({ id: trip.id, expenses: expenses.filter((item) => item.id !== id) }); }
  return <section className="tab-panel"><div className="panel-heading"><div><span className="eyebrow">KEEP IT IN CHECK</span><h2>Trip budget</h2><p className="muted">Track what you spend as the journey unfolds.</p></div><button className="button button-primary" type="button" onClick={() => setShowForm(!showForm)}><Plus size={16} /> Add expense</button></div><div className="budget-summary"><div><span className="eyebrow">TOTAL EXPENSES</span><strong className="budget-total-values">{Object.entries(totalsByCurrency).length ? Object.entries(totalsByCurrency).map(([currency, amount]) => <span key={currency}>{money(amount, currency)}</span>) : money(0)}</strong><small>{expenses.length} recorded {expenses.length === 1 ? "expense" : "expenses"}</small></div><div className="budget-summary-icon"><CircleDollarSign size={30} /></div></div>{showForm && <form className="inline-form content-card" onSubmit={addExpense}><div className="card-heading"><h3>Record an expense</h3><button className="icon-button" type="button" onClick={() => setShowForm(false)} aria-label="Close form"><X size={17} /></button></div><div className="form-grid"><label className="field full-field"><span>Expense name *</span><input autoFocus value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Dinner at a local restaurant" required /></label><label className="field"><span>Amount *</span><input type="number" min="0.01" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" required /></label><label className="field"><span>Currency</span><select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>{["EUR", "USD", "GBP", "JPY", "CAD", "AUD", "TRY"].map((item) => <option key={item}>{item}</option>)}</select></label><label className="field"><span>Category</span><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{["Food", "Stay", "Transport", "Activities", "Shopping", "Other"].map((item) => <option key={item}>{item}</option>)}</select></label><label className="field"><span>Date</span><input type="date" value={form.date} min={trip.startDate} max={trip.endDate} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label><label className="field full-field"><span>Notes</span><input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional note" /></label></div><div className="form-actions"><button className="button button-secondary" type="button" onClick={() => setShowForm(false)}>Cancel</button><button className="button button-primary" type="submit"><Check size={16} /> Save expense</button></div></form>}
    <div className="budget-layout"><div className="content-card expense-card"><div className="card-heading"><div><span className="eyebrow">TRANSACTION LOG</span><h3>Recent expenses</h3></div></div>{expenses.length ? <div className="expense-list">{expenses.map((item) => <div className="expense-row" key={item.id}><span className="expense-category-icon"><Wallet size={17} /></span><div className="expense-description"><strong>{item.title}</strong><small>{item.category} Â· {dateLabel(item.date, { month: "short", day: "numeric" })}</small></div><strong className="expense-amount">{money(item.amount, item.currency || "EUR")}</strong><button className="icon-button danger-icon" type="button" onClick={() => removeExpense(item.id)} aria-label="Delete expense"><Trash2 size={15} /></button></div>)}</div> : <div className="empty-inline"><Wallet size={25} /><strong>No expenses yet</strong><span>Add your first expense to start tracking.</span></div>}</div><aside className="content-card category-card"><span className="eyebrow">SPENDING BY CATEGORY</span><h3>Where it goes</h3>{Object.keys(categoriesTotal).length ? <div className="category-breakdown">{Object.entries(categoriesTotal).sort((a, b) => b[1] - a[1]).map(([key, amount]) => { const [name, currency] = key.split("|||"); const percent = totalsByCurrency[currency] ? amount / totalsByCurrency[currency] * 100 : 0; return <div className="category-total" key={key}><div><span>{name} Â· {currency}</span><strong>{money(amount, currency)}</strong></div><div className="progress-track"><span style={{ width: `${percent}%` }} /></div></div>; })}</div> : <p className="muted small">Your category breakdown will appear here.</p>}</aside></div>
  </section>;
}

function TripMap({ trip }) {
  const lat = Number(trip.lat) || 20;
  const lng = Number(trip.lng) || 0;
  const bbox = `${lng - 0.12}%2C${lat - 0.08}%2C${lng + 0.12}%2C${lat + 0.08}`;
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
  return <section className="tab-panel"><div className="panel-heading"><div><span className="eyebrow">FIND YOUR WAY</span><h2>{trip.destination} on the map</h2><p className="muted">An OpenStreetMap view centered on your destination coordinates.</p></div><a className="button button-secondary" href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=12/${lat}/${lng}`} target="_blank" rel="noreferrer">Open full map <ExternalLink size={15} /></a></div><div className="map-frame"><iframe title={`Map of ${trip.destination}`} src={mapUrl} loading="lazy" /></div><div className="map-coordinates"><MapPin size={16} /><span>{trip.destination}, {trip.country}</span><code>{lat.toFixed(4)}, {lng.toFixed(4)}</code></div><p className="field-hint">Map tiles require an internet connection. For destinations not in the curated list, add coordinates when editing the trip.</p></section>;
}

function DestinationDetailPage() {
  const { destinationId } = useParams();
  const place = destinations.find((item) => item.id === destinationId);
  const { isSaved, toggleSaved } = useAppData();
  if (!place) return <main className="page-shell content-page"><EmptyState icon={Compass} title="Destination not found" description="We couldn't find this destination." action="Explore destinations" to="/explore" /></main>;
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${place.lng - 0.12}%2C${place.lat - 0.08}%2C${place.lng + 0.12}%2C${place.lat + 0.08}&layer=mapnik&marker=${place.lat}%2C${place.lng}`;
  return <main className="page-shell content-page"><NavLink className="back-link" to="/explore"><ArrowLeft size={16} /> Back to Explore</NavLink><div className="destination-detail"><Image src={place.image} alt={place.name} className="destination-detail-image" /><div className="destination-detail-copy"><span className="eyebrow">{place.category.toUpperCase()}</span><h1>{place.name}<em>.</em></h1><p className="detail-country"><MapPin size={16} /> {place.country}</p><p>{place.description}</p><button className={`button ${isSaved(place.id) ? "button-secondary" : "button-primary"}`} type="button" onClick={() => toggleSaved(place)}>{isSaved(place.id) ? <Check size={16} /> : <Heart size={16} />}{isSaved(place.id) ? "Saved to your places" : "Save this place"}</button></div></div><div className="map-frame destination-map"><iframe title={`Map of ${place.name}`} src={mapUrl} loading="lazy" /></div></main>;
}

function AllTripsPage() {
  const { trips } = useAppData();
  return <main className="page-shell content-page"><PageIntro eyebrow="YOUR TRAVEL JOURNAL" title={<>All your <em>trips.</em></>} description="Every plan, every possibility, all in one place." />{trips.length ? <div className="trip-grid all-trips-grid">{trips.map((trip) => <TripCard key={trip.id} trip={trip} />)}<NavLink to="/trips/new" className="new-trip-card"><span className="new-trip-icon"><Plus size={23} /></span><strong>A new adventure?</strong><span>Every great trip starts somewhere.</span><span className="new-trip-link">Create a trip <ArrowRight size={15} /></span></NavLink></div> : <EmptyState icon={Plane} title="No trips planned yet" description="Your next adventure is waiting to be imagined." action="Create your first trip" to="/trips/new" />}</main>;
}

function Footer() { return <footer className="footer"><NavLink to="/" className="footer-brand"><Leaf size={16} /> roam.</NavLink><span>Plan less. Explore more.</span><span>Made for the journey.</span></footer>; }

function NotFound() { return <main className="page-shell content-page"><EmptyState icon={Compass} title="Looks like a detour." description="We couldn't find that page. Let's get you back on track." action="Back home" to="/" /></main>; }

function AppShell() {
  const [theme, setTheme] = useState(initialTheme);
  useEffect(() => { document.documentElement.dataset.theme = theme; document.documentElement.style.colorScheme = theme; try { localStorage.setItem(THEME_KEY, theme); } catch { /* no-op */ } }, [theme]);
  return <><Header theme={theme} onToggle={() => setTheme((value) => value === "dark" ? "light" : "dark")} /><Routes><Route path="/" element={<HomePage />} /><Route path="/trips" element={<AllTripsPage />} /><Route path="/trips/new" element={<TripFormPage />} /><Route path="/trips/:tripId/edit" element={<TripFormPage />} /><Route path="/trips/:tripId" element={<TripDetailPage />} /><Route path="/explore" element={<ExplorePage />} /><Route path="/explore/:destinationId" element={<DestinationDetailPage />} /><Route path="/saved" element={<SavedPage />} /><Route path="*" element={<NotFound />} /></Routes></>;
}

export default function App() { return <AppDataProvider><BrowserRouter basename={import.meta.env.BASE_URL}><AppShell /></BrowserRouter></AppDataProvider>; }


