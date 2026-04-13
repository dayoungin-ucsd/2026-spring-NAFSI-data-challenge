const { useState, useEffect, useRef, useMemo } = React;

// ── Header ────────────────────────────────────────────────────────────────────
function Header() {
  return (
    <header className="header">
      <div className="header-brand">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
          <circle cx="12" cy="9" r="2.5"/>
        </svg>
        <div>
          <h1>Nutri<span>Map</span></h1>
          <div className="header-tagline">NourishNet 2026 · Food Vulnerability Dashboard</div>
        </div>
      </div>
      <div className="header-badge">DC · MD · VA</div>
    </header>
  );
}

// ── Map Component ─────────────────────────────────────────────────────────────
function MapView({ counties, resources, selectedCounty, onSelectCounty, mapMode, showResources }) {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const markersRef = useRef([]);
  const resourceMarkersRef = useRef([]);

  useEffect(() => {
    if (leafletMap.current) return;
    leafletMap.current = L.map("map", {
      center: [38.9, -77.2],
      zoom: 8,
      zoomControl: true,
    });
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
    }).addTo(leafletMap.current);
  }, []);

  // County markers
  useEffect(() => {
    if (!leafletMap.current) return;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    counties.forEach(county => {
      const color = nviColor(county.nvi);
      const radius = Math.max(8, Math.min(22, county.population / 40000));
      const isSelected = selectedCounty && selectedCounty.fips === county.fips;

      const marker = L.circleMarker([county.lat, county.lon], {
        radius: isSelected ? radius + 4 : radius,
        fillColor: color,
        color: isSelected ? "#fff" : color,
        weight: isSelected ? 2.5 : 1,
        opacity: 1,
        fillOpacity: isSelected ? 0.95 : 0.75,
      }).addTo(leafletMap.current);

      marker.bindTooltip(
        `<strong>${county.name}, ${county.state}</strong><br/>NVI: ${county.nvi} — ${nviLabel(county.nvi)}<br/>Food Insecurity: ${county.food_insecurity_rate.toFixed(1)}%`,
        { className: "leaflet-tooltip-dark", sticky: true }
      );
      marker.on("click", () => onSelectCounty(county));
      markersRef.current.push(marker);
    });
  }, [counties, selectedCounty, mapMode]);

  // Resource markers
  useEffect(() => {
    if (!leafletMap.current) return;
    resourceMarkersRef.current.forEach(m => m.remove());
    resourceMarkersRef.current = [];
    if (!showResources) return;

    const iconMap = {
      "food-bank": "🏦", "pantry": "🧺", "snap": "🏛️",
      "wic": "👶", "volunteer": "🤝", "donor": "💚"
    };

    resources.forEach(r => {
      const icon = L.divIcon({
        html: `<div style="font-size:16px;line-height:1;filter:drop-shadow(0 1px 3px rgba(0,0,0,0.8))">${iconMap[r.type] || "📍"}</div>`,
        className: "",
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
      const m = L.marker([r.lat, r.lon], { icon })
        .addTo(leafletMap.current)
        .bindTooltip(`<strong>${r.name}</strong><br/>${r.type.replace("-", " ").toUpperCase()}`, { sticky: true });
      resourceMarkersRef.current.push(m);
    });
  }, [resources, showResources]);

  return (
    <div className="map-container">
      <div id="map" />
      <div className="map-legend">
        <div className="map-legend-title">NVI Score</div>
        {[
          { color:"#ef4444", label:"Critical (80–100)" },
          { color:"#f97316", label:"High (65–79)" },
          { color:"#f59e0b", label:"Moderate (50–64)" },
          { color:"#84cc16", label:"Low-Mod (35–49)" },
          { color:"#22c55e", label:"Low (0–34)" },
        ].map(({ color, label }) => (
          <div key={label} className="legend-row">
            <div className="legend-dot" style={{ background: color }} />
            <span style={{ fontSize:"0.75rem" }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── County Detail Panel ───────────────────────────────────────────────────────
function CountyDetail({ county, onClose }) {
  if (!county) return (
    <div className="card" style={{ textAlign:"center", color:"var(--text-muted)", padding:"24px 14px" }}>
      <div style={{ fontSize:"2rem", marginBottom:"8px" }}>🗺️</div>
      <div style={{ fontSize:"0.82rem" }}>Click any county on the map to see detailed food vulnerability data.</div>
    </div>
  );

  const metrics = [
    { name:"Food Insecurity Rate", val:`${county.food_insecurity_rate.toFixed(1)}%` },
    { name:"Poverty Rate", val:`${county.poverty_rate.toFixed(1)}%` },
    { name:"SNAP Participation", val:`${county.snap_rate.toFixed(1)}%` },
    { name:"Unemployment Rate", val:`${county.unemployment_rate.toFixed(1)}%` },
    { name:"Median Household Income", val:`$${county.median_income.toLocaleString()}` },
    { name:"Obesity Rate", val:`${county.obesity_rate.toFixed(1)}%` },
    { name:"Diabetes Rate", val:`${county.diabetes_rate.toFixed(1)}%` },
    { name:"Children Under 18", val:`${county.pct_under18.toFixed(1)}%` },
    { name:"No Vehicle Access", val:`${county.pct_no_vehicle.toFixed(1)}%` },
    { name:"Population", val:county.population.toLocaleString() },
  ];

  const barColor = nviColor(county.nvi);

  return (
    <div className="county-detail">
      <div className="card">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <div className="county-name">{county.name}</div>
            <div className="county-state">{county.state} · FIPS {county.fips}</div>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"var(--text-muted)", cursor:"pointer", fontSize:"1.1rem" }}>✕</button>
        </div>

        <div className="nvi-bar-wrap">
          <div className="nvi-label">
            <span style={{ fontWeight:700 }}>NVI Score</span>
            <span style={{ color: barColor, fontWeight:700 }}>{county.nvi} — {nviLabel(county.nvi)}</span>
          </div>
          <div className="nvi-bar-bg">
            <div className="nvi-bar-fill" style={{ width:`${county.nvi}%`, background: barColor }} />
          </div>
        </div>

        {metrics.map(m => (
          <div key={m.name} className="metric-row">
            <span className="metric-name">{m.name}</span>
            <span className="metric-val">{m.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Filters Panel ─────────────────────────────────────────────────────────────
function FiltersPanel({ filters, setFilters, stats }) {
  return (
    <div>
      <div className="card">
        <div className="card-title">📊 Region Overview</div>
        <div className="stats-grid">
          <div className="stat-box">
            <div className="stat-val">{stats.counties}</div>
            <div className="stat-label">Counties</div>
          </div>
          <div className="stat-box">
            <div className="stat-val">{stats.critical}</div>
            <div className="stat-label">Critical NVI</div>
          </div>
          <div className="stat-box">
            <div className="stat-val">{stats.avgNvi}</div>
            <div className="stat-label">Avg NVI</div>
          </div>
          <div className="stat-box">
            <div className="stat-val">{stats.avgFI}%</div>
            <div className="stat-label">Avg Food Insecurity</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">🔍 Filters</div>

        <label className="filter-label">State</label>
        <select className="filter-select" value={filters.state}
          onChange={e => setFilters(f => ({ ...f, state: e.target.value }))}>
          <option value="ALL">All States</option>
          <option value="DC">DC</option>
          <option value="MD">Maryland</option>
          <option value="VA">Virginia</option>
        </select>

        <label className="filter-label">Min NVI Score: {filters.minNvi}</label>
        <div className="range-row">
          <input type="range" min="0" max="100" value={filters.minNvi}
            onChange={e => setFilters(f => ({ ...f, minNvi: +e.target.value }))} />
          <span className="range-val">{filters.minNvi}</span>
        </div>

        <label className="filter-label">Max NVI Score: {filters.maxNvi}</label>
        <div className="range-row">
          <input type="range" min="0" max="100" value={filters.maxNvi}
            onChange={e => setFilters(f => ({ ...f, maxNvi: +e.target.value }))} />
          <span className="range-val">{filters.maxNvi}</span>
        </div>

        <label className="filter-label">Vulnerability Level</label>
        <select className="filter-select" value={filters.level}
          onChange={e => setFilters(f => ({ ...f, level: e.target.value }))}>
          <option value="ALL">All Levels</option>
          <option value="critical">Critical (80+)</option>
          <option value="high">High (65–79)</option>
          <option value="moderate">Moderate (50–64)</option>
          <option value="low-mod">Low-Moderate (35–49)</option>
          <option value="low">Low (0–34)</option>
        </select>

        <button className="btn btn-outline" style={{ width:"100%", justifyContent:"center" }}
          onClick={() => setFilters({ state:"ALL", minNvi:0, maxNvi:100, level:"ALL" })}>
          Reset Filters
        </button>
      </div>
    </div>
  );
}

// ── Resource Card ─────────────────────────────────────────────────────────────
function ResourceCard({ r }) {
  const typeLabels = {
    "food-bank":"Food Bank", "pantry":"Food Pantry", "snap":"SNAP",
    "wic":"WIC", "volunteer":"Volunteer", "donor":"Donate"
  };
  return (
    <div className="resource-card">
      <div className="resource-header">
        <div className="resource-name">{r.name}</div>
        <span className={`resource-type type-${r.type}`}>{typeLabels[r.type]}</span>
      </div>
      <div className="resource-desc">{r.desc}</div>
      <div className="resource-meta">
        <span>📍 {r.state}</span>
        <span>🕐 {r.hours}</span>
      </div>
      <div className="resource-meta" style={{ marginTop:"4px" }}>
        <span>📞 {r.phone}</span>
      </div>
      <div className="btn-row">
        <a href={r.website} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
          Visit Website ↗
        </a>
        <span className="btn btn-outline btn-sm" style={{ cursor:"default" }}>
          {r.address.length > 35 ? r.address.slice(0, 35) + "…" : r.address}
        </span>
      </div>
    </div>
  );
}

// ── Connect Panel ─────────────────────────────────────────────────────────────
function ConnectPanel({ resources }) {
  const [role, setRole] = useState("ALL");
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("ALL");

  const roles = [
    { id:"ALL",       icon:"🌍", title:"All Resources",    sub:"Browse everything" },
    { id:"family",    icon:"👨‍👩‍👧", title:"I Need Food Help", sub:"Find food near you" },
    { id:"volunteer", icon:"🤝", title:"I Want to Volunteer", sub:"Give your time" },
    { id:"donor",     icon:"💚", title:"I Want to Donate",  sub:"Support organizations" },
  ];

  const typeMap = {
    "ALL":      null,
    "family":   ["food-bank","pantry","snap","wic"],
    "volunteer":["volunteer"],
    "donor":    ["donor"],
  };

  const filtered = useMemo(() => {
    const types = typeMap[role];
    return resources.filter(r => {
      if (types && !types.includes(r.type)) return false;
      if (stateFilter !== "ALL" && r.state !== stateFilter) return false;
      if (search && !r.name.toLowerCase().includes(search.toLowerCase()) &&
          !r.desc.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [role, stateFilter, search, resources]);

  return (
    <div>
      <div className="card">
        <div className="card-title">I am a…</div>
        {roles.map(r => (
          <button key={r.id} className={`role-btn ${role === r.id ? "active" : ""}`}
            onClick={() => setRole(r.id)}>
            <span className="role-icon">{r.icon}</span>
            <span className="role-text">
              <span className="role-title">{r.title}</span>
              <span className="role-sub">{r.sub}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="card">
        <div className="card-title">🔎 Find Resources</div>
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input placeholder="Search by name or keyword…" value={search}
            onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="filter-select" value={stateFilter}
          onChange={e => setStateFilter(e.target.value)}>
          <option value="ALL">All States</option>
          <option value="DC">DC</option>
          <option value="MD">Maryland</option>
          <option value="VA">Virginia</option>
        </select>
        <div style={{ fontSize:"0.75rem", color:"var(--text-muted)", marginBottom:"8px" }}>
          {filtered.length} resource{filtered.length !== 1 ? "s" : ""} found
        </div>
        {filtered.map(r => <ResourceCard key={r.id} r={r} />)}
        {filtered.length === 0 && (
          <div style={{ textAlign:"center", color:"var(--text-muted)", padding:"20px", fontSize:"0.82rem" }}>
            No resources match your filters.
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ tab, setTab, counties, selectedCounty, onClearCounty, filters, setFilters, stats, resources }) {
  const tabs = [
    { id:"map",     label:"Map" },
    { id:"connect", label:"Connect" },
    { id:"about",   label:"About" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-tabs">
        {tabs.map(t => (
          <button key={t.id} className={`sidebar-tab ${tab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>
      <div className="sidebar-content">
        {tab === "map" && (
          <>
            <CountyDetail county={selectedCounty} onClose={onClearCounty} />
            <FiltersPanel filters={filters} setFilters={setFilters} stats={stats} />
          </>
        )}
        {tab === "connect" && <ConnectPanel resources={resources} />}
        {tab === "about" && <AboutPanel />}
      </div>
    </aside>
  );
}

// ── About Panel ───────────────────────────────────────────────────────────────
function AboutPanel() {
  return (
    <div>
      <div className="card">
        <div className="card-title">🌱 About NutriMap</div>
        <p style={{ fontSize:"0.82rem", lineHeight:1.6, color:"var(--text-muted)", marginBottom:"10px" }}>
          NutriMap is a food vulnerability intelligence dashboard built for the
          <strong style={{ color:"var(--text)" }}> NourishNet 2026 Challenge</strong> by
          Team NutriHog of Ozark, University of Arkansas.
        </p>
        <p style={{ fontSize:"0.82rem", lineHeight:1.6, color:"var(--text-muted)", marginBottom:"10px" }}>
          The <strong style={{ color:"var(--text)" }}>NutriVulnerability Index (NVI)</strong> is
          a composite 0–100 score combining poverty rate, food insecurity, SNAP participation,
          unemployment, obesity, diabetes, vehicle access, and child population share.
        </p>
        <p style={{ fontSize:"0.82rem", lineHeight:1.6, color:"var(--text-muted)" }}>
          Higher NVI = greater need for targeted food assistance interventions.
        </p>
      </div>

      <div className="card">
        <div className="card-title">📚 Data Sources</div>
        {[
          { src:"ACS 2021 (5-year)", url:"https://api.census.gov/data/2021/acs/acs5", desc:"Poverty, income, demographics" },
          { src:"CDC PLACES 2023", url:"https://data.cdc.gov/resource/swc5-untb.json", desc:"Obesity, diabetes rates" },
          { src:"USDA Food Access Atlas", url:"https://www.ers.usda.gov/data-products/food-access-research-atlas/", desc:"Food access metrics" },
          { src:"TIGER 2020 Centroids", url:"https://www2.census.gov/geo/docs/reference/cenpop2020/", desc:"County coordinates" },
        ].map(d => (
          <div key={d.src} className="metric-row">
            <span className="metric-name">{d.desc}</span>
            <a href={d.url} target="_blank" rel="noopener noreferrer"
              style={{ fontSize:"0.75rem", color:"var(--green-light)", textDecoration:"none" }}>
              {d.src} ↗
            </a>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-title">🏆 Team</div>
        <p style={{ fontSize:"0.82rem", color:"var(--text-muted)", lineHeight:1.6 }}>
          NutriHog of Ozark · University of Arkansas, Fayetteville<br/>
          NAFSI Student Data Challenge 2026 · Track 2: NourishNet<br/>
          Built on the National Data Platform (NSF Convergence Accelerator)
        </p>
      </div>
    </div>
  );
}

// ── App Root ──────────────────────────────────────────────────────────────────
function App() {
  const [tab, setTab] = useState("map");
  const [selectedCounty, setSelectedCounty] = useState(null);
  const [showResources, setShowResources] = useState(true);
  const [filters, setFilters] = useState({ state:"ALL", minNvi:0, maxNvi:100, level:"ALL" });

  const levelRange = { "ALL":[0,100], "critical":[80,100], "high":[65,79], "moderate":[50,64], "low-mod":[35,49], "low":[0,34] };

  const filteredCounties = useMemo(() => {
    const [lo, hi] = levelRange[filters.level] || [0, 100];
    const effMin = Math.max(filters.minNvi, lo);
    const effMax = Math.min(filters.maxNvi, hi);
    return COUNTY_DATA.filter(c => {
      if (filters.state !== "ALL" && c.state !== filters.state) return false;
      if (c.nvi < effMin || c.nvi > effMax) return false;
      return true;
    });
  }, [filters]);

  const stats = useMemo(() => {
    const d = filteredCounties;
    return {
      counties: d.length,
      critical: d.filter(c => c.nvi >= 80).length,
      avgNvi: d.length ? Math.round(d.reduce((s, c) => s + c.nvi, 0) / d.length) : 0,
      avgFI: d.length ? (d.reduce((s, c) => s + c.food_insecurity_rate, 0) / d.length).toFixed(1) : "0.0",
    };
  }, [filteredCounties]);

  return (
    <>
      <Header />
      <div className="app-body">
        <Sidebar
          tab={tab} setTab={setTab}
          counties={filteredCounties}
          selectedCounty={selectedCounty}
          onClearCounty={() => setSelectedCounty(null)}
          filters={filters} setFilters={setFilters}
          stats={stats}
          resources={RESOURCES}
        />
        <MapView
          counties={filteredCounties}
          resources={RESOURCES}
          selectedCounty={selectedCounty}
          onSelectCounty={c => { setSelectedCounty(c); setTab("map"); }}
          showResources={showResources}
        />
        <div className="map-controls">
          <button className={`map-ctrl-btn ${showResources ? "active" : ""}`}
            onClick={() => setShowResources(v => !v)}>
            {showResources ? "🏦 Hide Resources" : "🏦 Show Resources"}
          </button>
          <button className="map-ctrl-btn" onClick={() => setSelectedCounty(null)}>
            🗺️ Reset View
          </button>
        </div>
      </div>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

