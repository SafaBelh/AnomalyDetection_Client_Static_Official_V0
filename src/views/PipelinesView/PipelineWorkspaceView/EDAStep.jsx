
import { useEffect, useMemo, useState } from "react";
import { CheckCircle } from "lucide-react";
import { Area, Bar, BarChart, CartesianGrid, Cell, ComposedChart, LabelList, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CustomTip } from "@/components/ui/CustomTip";
import { Spinner } from "@/components/ui/Spinner";
import { C, CC } from "@/constants/colors";
import { wsAPI, wsStore } from "@/store/wsAPI";
import { fmtE, fmtK } from "@/utils/formatters";

export function WSEDAStep({ onConfirm, onNavigate }) {
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [supplierCounts, setSupplierCounts] = useState({});
  const [monthly, setMonthly] = useState({ months: [], totals: [] });
  const [distribution, setDistribution] = useState([]);
  const [timeseriesData, setTimeseriesData] = useState([]);
  useEffect(() => {
    (async () => {
      try {
        const [sc, mt, dist, ts] = await Promise.all([
          wsAPI.getSupplierCounts(),
          wsAPI.getMonthlyTotals(),
          wsAPI.getDistribution(),
          wsAPI.getTimeseries(),
        ]);
        setSupplierCounts(sc.supplier_counts || {});
        setMonthly({ months: Array.isArray(mt?.months) ? mt.months : [], totals: Array.isArray(mt?.totals) ? mt.totals : [] });
        setDistribution(dist.amounts || []);
        setTimeseriesData(ts.data || []);
      } catch (e) {
        const invoices = Array.isArray(wsStore.invoices) ? wsStore.invoices : [];
        const supplierMap = {};
        const monthMap = {};
        const amounts = [];
        const ts = invoices.map((inv) => {
          const supplier = inv.supplier || inv.supplier_code || "N/A";
          const date = inv.date || inv.invoice_date || "";
          const amount = Number(inv.amount || 0);
          const month = date.slice(0, 7);
          supplierMap[supplier] = (supplierMap[supplier] || 0) + 1;
          if (month) monthMap[month] = (monthMap[month] || 0) + amount;
          if (Number.isFinite(amount)) amounts.push(amount);
          return { supplier, label: inv.label || null, date, amount };
        });
        const months = Object.keys(monthMap).sort();
        setSupplierCounts(supplierMap);
        setMonthly({ months, totals: months.map((m) => monthMap[m]) });
        setDistribution(amounts);
        setTimeseriesData(ts);
        setErr(e.message);
      }
      setLoading(false);
    })();
  }, []);
  const supBarData = useMemo(
    () =>
      Object.entries(supplierCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([id, count]) => ({ id, count })),
    [supplierCounts]
  );
  const top5 = supBarData.slice(0, 5).map((s) => s.id);
  const supColorLocal = (id) => {
    const i = top5.indexOf(id);
    return i >= 0 ? CC[i % CC.length] : CC[4];
  };
  const monthlyChart = useMemo(
    () => {
      const months = Array.isArray(monthly?.months) ? monthly.months : [];
      const totals = Array.isArray(monthly?.totals) ? monthly.totals : [];
      return months.map((m, i) => ({ m, total: totals[i] || 0 }));
    },
    [monthly]
  );
  const total = (Array.isArray(monthly?.totals) ? monthly.totals : []).reduce((a, b) => a + b, 0);
  const histBuckets = useMemo(() => {
    if (!distribution.length) return [];
    const mn = Math.min(...distribution),
      mx = Math.max(...distribution);
    const bs = (mx - mn) / 40 || 1;
    const buckets = Array.from({ length: 40 }, (_, i) => ({
      x: Math.round(mn + i * bs),
      count: 0,
    }));
    distribution.forEach((a) => {
      const bi = Math.min(39, Math.floor((a - mn) / bs));
      buckets[bi].count++;
    });
    return buckets;
  }, [distribution]);
  const services = useMemo(() => {
    const map = {};
    timeseriesData.forEach((r) => {
      const key = r.label ? `${r.supplier} · ${r.label}` : r.supplier;
      if (!map[key])
        map[key] = {
          name: key,
          supplier: r.supplier,
          label: r.label || null,
          total: 0,
          count: 0,
        };
      map[key].total += r.amount || 0;
      map[key].count++;
    });
    return Object.values(map)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [timeseriesData]);
  const monthlyBySup = useMemo(() => {
    const m = {};
    timeseriesData.forEach((r) => {
      const d = new Date(r.date);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      if (!m[k]) {
        const o = { m: k };
        top5.forEach((s) => {
          o[s] = 0;
        });
        m[k] = o;
      }
      if (top5.includes(r.supplier))
        m[k][r.supplier] = (m[k][r.supplier] || 0) + (r.amount || 0);
    });
    return Object.values(m).sort((a, b) => a.m.localeCompare(b.m));
  }, [timeseriesData, top5]);
  if (loading)
    return (
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <div style={{ textAlign: "center", padding: 48 }}>
          <Spinner size={36} />
        </div>
      </div>
    );
  return (
    <div style={{ maxWidth: 980, margin: "0 auto" }}>
      <h2
        style={{
          fontFamily: "'Instrument Serif',serif",
          fontSize: 24,
          color: C.grey900,
          marginBottom: 4,
        }}
      >
        Analyse exploratoire (EDA)
      </h2>
      <p style={{ fontSize: 13, color: C.grey500, marginBottom: 14 }}>
        {distribution.length.toLocaleString()} factures chargées depuis l'API
      </p>
      {err && (
        <div
          style={{
            background: C.redPale,
            border: `1px solid rgba(217,79,61,.25)`,
            borderRadius: 10,
            padding: "10px 14px",
            fontSize: 12,
            color: C.red,
            marginBottom: 12,
          }}
        >
          {err}
        </div>
      )}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 10,
          marginBottom: 14,
        }}
      >
        {[
          {
            lbl: "Factures",
            val: distribution.length.toLocaleString(),
            color: C.info,
          },
          { lbl: "Total", val: fmtK(Math.round(total)), color: C.success },
          { lbl: "Fournisseurs", val: supBarData.length, color: C.purple },
          { lbl: "Sous-catégories", val: services.length, color: C.warning },
        ].map((k) => (
          <div
            key={k.lbl}
            className="glass-card-sm"
            style={{ padding: "12px 14px" }}
          >
            <div style={{ fontSize: 18, fontWeight: 800, color: k.color }}>
              {k.val}
            </div>
            <div style={{ fontSize: 11, color: C.grey500, marginTop: 2 }}>
              {k.lbl}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 5, marginBottom: 14 }}>
        {[
          ["overview", "Vue générale"],
          ["distribution", "Distribution"],
          ["services", "Services"],
        ].map(([id, lbl]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`tab${tab === id ? " active" : ""}`}
            style={{ fontSize: 12, padding: "7px 14px" }}
          >
            {lbl}
          </button>
        ))}
      </div>
      {tab === "overview" && (
        <>
          <div className="glass-card" style={{ padding: 18, marginBottom: 14 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: C.grey700,
                marginBottom: 10,
              }}
            >
              Factures par fournisseur
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={supBarData}
                margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={C.grey100} />
                <XAxis
                  dataKey="id"
                  tick={{ fill: C.grey700, fontSize: 11 }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: C.grey500, fontSize: 9 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTip />} />
                <Bar dataKey="count" name="# Factures" radius={[6, 6, 0, 0]}>
                  {supBarData.map((s) => (
                    <Cell key={s.id} fill={supColorLocal(s.id)} />
                  ))}
                  <LabelList
                    dataKey="count"
                    position="top"
                    style={{ fill: C.grey500, fontSize: 10 }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="glass-card" style={{ padding: 18, marginBottom: 14 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: C.grey700,
                marginBottom: 10,
              }}
            >
              Volumeme facturé mensuel (€)
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <ComposedChart
                data={monthlyChart}
                margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
              >
                <defs>
                  <linearGradient id="wsedaag" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.red} stopOpacity={0.18} />
                    <stop offset="95%" stopColor={C.red} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={C.grey100} />
                <XAxis
                  dataKey="m"
                  tick={{ fill: C.grey500, fontSize: 9 }}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={fmtK}
                  tick={{ fill: C.grey500, fontSize: 9 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area
                  type="monotone"
                  dataKey="total"
                  name="Total €"
                  fill="url(#wsedaag)"
                  stroke={C.red}
                  strokeWidth={2}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          {monthlyBySup.length > 0 && top5.length > 0 && (
            <div
              className="glass-card"
              style={{ padding: 18, marginBottom: 14 }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.grey700,
                  marginBottom: 10,
                }}
              >
                Mensuel empilé par fournisseur
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={monthlyBySup}
                  margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={C.grey100} />
                  <XAxis
                    dataKey="m"
                    tick={{ fill: C.grey500, fontSize: 9 }}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={fmtK}
                    tick={{ fill: C.grey500, fontSize: 9 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  {top5.map((s, i) => (
                    <Bar
                      key={s}
                      dataKey={s}
                      stackId="a"
                      fill={supColorLocal(s)}
                      radius={
                        i === top5.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]
                      }
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
      {tab === "distribution" && (
        <div className="glass-card" style={{ padding: 18, marginBottom: 14 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: C.grey700,
              marginBottom: 10,
            }}
          >
            Distribution des montants
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={histBuckets}
              margin={{ top: 8, right: 8, bottom: 5, left: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={C.grey100} />
              <XAxis
                dataKey="x"
                tickFormatter={(v) => `€${Math.round(v / 1000)}K`}
                tick={{ fill: C.grey500, fontSize: 8 }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: C.grey500, fontSize: 8 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTip />} />
              <Bar
                dataKey="count"
                name="Fréquence"
                fill={C.purple}
                fillOpacity={0.7}
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      {tab === "services" && (
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
        >
          <div className="glass-card" style={{ padding: 18 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: C.grey700,
                marginBottom: 10,
              }}
            >
              Dépenses par service
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={services}
                layout="vertical"
                margin={{ top: 8, right: 40, bottom: 8, left: 90 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={C.grey100} />
                <XAxis
                  type="number"
                  tickFormatter={fmtK}
                  tick={{ fill: C.grey500, fontSize: 9 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fill: C.grey700, fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  width={85}
                />
                <Tooltip content={<CustomTip />} />
                <Bar dataKey="total" name="Total €" radius={[0, 6, 6, 0]}>
                  {services.map((_, i) => (
                    <Cell key={i} fill={CC[i % CC.length]} />
                  ))}
                  <LabelList
                    dataKey="total"
                    formatter={fmtK}
                    position="right"
                    style={{ fill: C.grey500, fontSize: 10 }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="glass-card" style={{ padding: 18 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: C.grey700,
                marginBottom: 10,
              }}
            >
              Répartition par service
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={services.map((s) => ({ name: s.name, value: s.total }))}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  label={({ name, percent }) =>
                    percent > 0.04
                      ? `${name.split(" ")[0]} ${(percent * 100).toFixed(0)}%`
                      : ""
                  }
                  labelLine={false}
                >
                  {services.map((_, i) => (
                    <Cell key={i} fill={CC[i % CC.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => fmtE(Math.round(v))}
                  contentStyle={{
                    background: C.white,
                    border: `1px solid ${C.grey100}`,
                    borderRadius: 10,
                    fontSize: 11,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      <div
        style={{
          marginTop: 20,
          padding: "14px 18px",
          background: "rgba(34,197,94,.06)",
          border: `1px solid rgba(34,197,94,.2)`,
          borderRadius: 12,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ fontSize: 13, color: C.grey700 }}>
          <CheckCircle size={13} color={C.success} style={{ marginRight: 6 }} />{" "}
          EDA complète — passez aux clusters.
        </div>
        <button onClick={() => onConfirm()} className="btn-primary">
          Continuer vers les Clusters →
        </button>
      </div>
    </div>
  );
}
