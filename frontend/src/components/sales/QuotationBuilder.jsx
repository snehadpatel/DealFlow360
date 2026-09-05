import React, { useState, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  getProducts,
  getCustomers,
  createQuote,
  updateQuote,
  submitQuote,
} from '../../api/salesRealApi';
import AIRecommendationPanel from '../ai/AIRecommendationPanel';
import {
  Search, Plus, Minus, X, AlertTriangle, AlertCircle, CheckCircle2, ChevronRight, Loader2,
} from 'lucide-react';

const CATEGORY_ORDER = ['Hardware', 'Services', 'Subscription'];

const fmtINR = (val) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

// Local preview math ONLY — shown live while editing. The authoritative
// numbers come back from the backend after Save/Submit (see `saved` state).
function previewLine(item) {
  const gross = item.price * item.qty;
  const discountAmt = gross * (item.discount_percent / 100);
  const net = gross - discountAmt;
  const cost = item.cost * item.qty;
  const tax = net * ((item.tax_rate ?? 0) / 100);
  return { gross, discountAmt, net, cost, tax, total: net + tax };
}

export default function QuotationBuilder() {
  const queryClient = useQueryClient();
  const [catalog, setCatalog] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Backend interaction state
  const [quoteId, setQuoteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(null); // backend QuoteDetailResponse

  useEffect(() => {
    Promise.all([getProducts(), getCustomers()])
      .then(([products, custs]) => {
        const prodList = Array.isArray(products) ? products : [];
        setCatalog(prodList);
        setCustomers(Array.isArray(custs) ? custs : []);
        if (custs?.length) setCustomerId(custs[0].id);
        
        // Auto-fill the cart with some initial data for demonstration purposes
        if (prodList.length >= 2) {
          setCart([
            {
              id: prodList[0].id,
              name: prodList[0].name,
              category: prodList[0].category,
              price: prodList[0].price,
              cost: prodList[0].cost,
              tax_rate: prodList[0].tax_rate,
              discount_ceiling: prodList[0].discount_ceiling,
              qty: 2,
              discount_percent: 0,
            },
            {
              id: prodList[1].id,
              name: prodList[1].name,
              category: prodList[1].category,
              price: prodList[1].price,
              cost: prodList[1].cost,
              tax_rate: prodList[1].tax_rate,
              discount_ceiling: prodList[1].discount_ceiling,
              qty: 5,
              discount_percent: 12, // Give a small discount to show the UI
            }
          ]);
        }
      })
      .catch(() => setError('Could not load catalog/customers. Is the backend running and seeded?'))
      .finally(() => setLoading(false));
  }, []);

  const selectedCustomer = customers.find((c) => c.id === customerId);

  // --- Cart mutations (any change invalidates the saved backend snapshot) ---
  const invalidate = () => setSaved(null);

  const addToCart = (product) => {
    invalidate();
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          category: product.category,
          price: product.price,
          cost: product.cost,
          tax_rate: product.tax_rate,
          discount_ceiling: product.discount_ceiling,
          qty: 1,
          discount_percent: 0,
        },
      ];
    });
  };

  const updateQty = (id, delta) => {
    invalidate();
    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i))
    );
  };

  const updateLineDiscount = (id, value) => {
    invalidate();
    const pct = Math.min(100, Math.max(0, Number(value) || 0));
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, discount_percent: pct } : i)));
  };

  const removeFromCart = (id) => {
    invalidate();
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  // Accept an AI upsell suggestion: resolve it to a real catalog product (by id
  // or name) and add it to the cart so it flows through the same backend pricing.
  const handleAddRecommendation = (rec) => {
    const match =
      catalog.find((p) => p.id === rec.productId || p.id === rec.product_id) ||
      catalog.find((p) => p.name?.toLowerCase() === (rec.productName || '').toLowerCase());
    if (match) {
      addToCart(match);
    }
  };

  // --- Live local preview totals ---
  const preview = useMemo(() => {
    return cart.reduce(
      (acc, item) => {
        const l = previewLine(item);
        acc.subtotal += l.gross;
        acc.discount += l.discountAmt;
        acc.net += l.net;
        acc.cost += l.cost;
        acc.tax += l.tax;
        acc.total += l.total;
        return acc;
      },
      { subtotal: 0, discount: 0, net: 0, cost: 0, tax: 0, total: 0 }
    );
  }, [cart]);

  const previewMarginPct = preview.net > 0 ? ((preview.net - preview.cost) / preview.net) * 100 : 0;

  // A line is over its ceiling when its discount exceeds the product ceiling.
  const overCeilingLines = cart.filter((i) => i.discount_percent > (i.discount_ceiling ?? 100));

  // --- Backend persistence ---
  const buildPayload = () => ({
    customer_id: customerId,
    items: cart.map((i) => ({
      product_id: i.id,
      quantity: i.qty,
      discount_percent: i.discount_percent,
    })),
  });

  const persistDraft = async () => {
    if (!customerId || cart.length === 0) return null;
    setError(null);
    setSaving(true);
    try {
      let result;
      if (quoteId) {
        result = await updateQuote(quoteId, {
          items: cart.map((i) => ({
            product_id: i.id,
            quantity: i.qty,
            discount_percent: i.discount_percent,
          })),
        });
      } else {
        result = await createQuote(buildPayload());
        setQuoteId(result.id);
      }
      setSaved(result);
      queryClient.invalidateQueries({ queryKey: ['salesDashboard'] });
      return result;
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save the quote to the backend.');
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    // Ensure the latest cart is persisted before submitting for approval.
    const draft = await persistDraft();
    const id = draft?.id || quoteId;
    if (!id) return;
    setSubmitting(true);
    try {
      const result = await submitQuote(id);
      setSaved(result);
      queryClient.invalidateQueries({ queryKey: ['salesDashboard'] });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit the quote for approval.');
    } finally {
      setSubmitting(false);
    }
  };

  // --- Derived display from the authoritative backend snapshot ---
  const backendMarginPct = saved?.margin_percent;
  const backendRisk = saved?.blended_risk;
  const backendRiskLevel = saved?.risk_level;
  const backendStatus = saved?.status;
  const approvalChain = (saved?.approvals || [])
    .filter((a) => a.status === 'PENDING')
    .map((a) => a.approver_role);

  const displayMargin = saved ? backendMarginPct : previewMarginPct;
  let marginStatus = { color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', icon: CheckCircle2, text: 'Healthy' };
  if (displayMargin < 15) marginStatus = { color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', icon: AlertCircle, text: 'Watch' };
  if (displayMargin < 10) marginStatus = { color: 'text-red-600', bg: 'bg-red-50 border-red-200', icon: AlertTriangle, text: 'Risky' };

  const grouped = CATEGORY_ORDER.map((cat) => ({
    cat,
    items: catalog.filter(
      (p) => p.category === cat && p.name.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  })).filter((g) => g.items.length > 0);
  const uncategorized = catalog.filter(
    (p) => !CATEGORY_ORDER.includes(p.category) && p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  if (uncategorized.length) grouped.push({ cat: 'Other', items: uncategorized });

  return (
    <div className="space-y-6 flex flex-col">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4 shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1F2937]">Quotation Builder</h1>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-sm font-semibold text-[#6B7280]">Customer:</span>
            <select
              value={customerId}
              onChange={(e) => { setCustomerId(e.target.value); invalidate(); }}
              className="text-sm font-bold text-[#F26C4F] bg-transparent border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-[#F26C4F]"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.tier})
                </option>
              ))}
            </select>
            {quoteId && (
              <>
                <ChevronRight className="w-4 h-4 text-gray-300" />
                <span className="text-sm font-bold text-[#1F2937]">#{String(quoteId).slice(0, 8)}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={persistDraft}
            disabled={cart.length === 0 || !customerId || saving}
            className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 text-[#1F2937] rounded-full text-xs font-semibold transition inline-flex items-center gap-1.5"
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Save Draft
          </button>
          <button
            onClick={handleSubmit}
            disabled={cart.length === 0 || !customerId || submitting || saving}
            className="px-4 py-2 bg-[#F26C4F] hover:bg-[#E05338] disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-full text-xs font-semibold shadow-sm transition inline-flex items-center gap-1.5"
          >
            {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Submit for Approval
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Backend result banner — proves the number is server-computed */}
      {saved && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
          <span className="font-bold uppercase tracking-wider text-slate-500">Backend result</span>
          <span>Status: <strong className="text-[#1F2937]">{backendStatus}</strong></span>
          <span>Blended risk (overage): <strong className="text-[#1F2937]">{backendRisk ?? 0}</strong> ({backendRiskLevel})</span>
          <span>Margin: <strong className="text-[#1F2937]">{Number(backendMarginPct).toFixed(1)}%</strong></span>
          {backendStatus === 'APPROVED' && (
            <span className="text-emerald-600 font-semibold">✓ Auto-approved (within all ceilings)</span>
          )}
          {approvalChain.length > 0 && (
            <span className="text-amber-600 font-semibold">Routed to: {approvalChain.join(' → ')}</span>
          )}
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        {/* Left: Product Catalog grouped by category */}
        <div className="flex-1 flex flex-col bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#6B7280] mb-3">Product Catalog</h3>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#6B7280]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-[#F26C4F] transition"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 max-h-[460px]">
            {loading ? (
              <div className="space-y-2 p-2 animate-pulse">
                {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-gray-50 rounded-lg" />)}
              </div>
            ) : grouped.length > 0 ? (
              <div className="space-y-4">
                {grouped.map((group) => (
                  <div key={group.cat}>
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">{group.cat}</div>
                    <div className="space-y-2">
                      {group.items.map((product) => (
                        <div key={product.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-[#F26C4F]/40 hover:shadow-sm transition group bg-white">
                          <div>
                            <div className="font-bold text-sm text-[#1F2937]">{product.name}</div>
                            <div className="flex items-center space-x-2 mt-0.5 text-xs text-[#6B7280]">
                              <span className="font-semibold text-[#F26C4F]">{fmtINR(product.price)}</span>
                              <span>•</span>
                              <span>Ceiling: {product.discount_ceiling}%</span>
                            </div>
                          </div>
                          <button
                            onClick={() => addToCart(product)}
                            className="p-1.5 bg-gray-100 hover:bg-[#F26C4F] hover:text-white text-[#6B7280] rounded-lg transition"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 text-xs text-[#6B7280]">No products found.</div>
            )}
          </div>
        </div>

        {/* Right: Cart + Financials */}
        <div className="flex-1 flex flex-col gap-4 min-h-0">
          <div className="flex-1 flex flex-col bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#6B7280]">Quotation Cart</h3>
              <span className="text-xs font-bold bg-white border border-gray-200 px-2 py-0.5 rounded-full">{cart.length} items</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 max-h-[340px]">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-300 space-y-2 py-8">
                  <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium">Add products to build quote</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => {
                    const overCeiling = item.discount_percent > (item.discount_ceiling ?? 100);
                    return (
                      <div key={item.id} className="flex flex-col p-3 border border-gray-200 rounded-lg bg-gray-50/50">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-bold text-sm text-[#1F2937]">{item.name}</span>
                            <span className="ml-2 text-[10px] text-slate-400">{item.category}</span>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                        </div>
                        <div className="flex justify-between items-end mt-3">
                          <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg p-0.5">
                            <button onClick={() => updateQty(item.id, -1)} className="p-1 text-[#6B7280] hover:bg-gray-100 rounded"><Minus className="w-3 h-3" /></button>
                            <span className="text-xs font-bold w-6 text-center">{item.qty}</span>
                            <button onClick={() => updateQty(item.id, 1)} className="p-1 text-[#6B7280] hover:bg-gray-100 rounded"><Plus className="w-3 h-3" /></button>
                          </div>
                          <span className="font-bold text-sm text-[#1F2937]">{fmtINR(previewLine(item).net)}</span>
                        </div>
                        {/* Per-line discount */}
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200/70">
                          <span className="text-[11px] font-medium text-[#6B7280]">Line discount %</span>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0" max="100"
                              value={item.discount_percent}
                              onChange={(e) => updateLineDiscount(item.id, e.target.value)}
                              className={`w-16 px-2 py-1 text-right text-xs font-bold bg-white border rounded focus:outline-none ${
                                overCeiling ? 'border-amber-400 text-amber-600' : 'border-gray-200 focus:border-[#F26C4F]'
                              }`}
                            />
                            {overCeiling && (
                              <span className="text-[10px] font-semibold text-amber-600" title={`Exceeds ${item.discount_ceiling}% ceiling`}>
                                over {item.discount_ceiling}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Financials */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 shrink-0 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#6B7280] border-b border-gray-200 pb-2">
              Financial Summary
              {!saved && cart.length > 0 && (
                <span className="ml-2 text-[10px] font-medium normal-case text-slate-400">(live preview — Save to compute on backend)</span>
              )}
            </h3>

            <div className="flex items-center justify-between text-sm">
              <span className="text-[#6B7280] font-medium">Subtotal</span>
              <span className="font-bold">{fmtINR(saved ? saved.subtotal : preview.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#6B7280] font-medium">Discount total</span>
              <span className="font-bold text-amber-600">- {fmtINR(saved ? saved.discount_total : preview.discount)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#6B7280] font-medium">Tax</span>
              <span className="font-bold">{fmtINR(saved ? saved.tax_total : preview.tax)}</span>
            </div>
            <div className="flex items-center justify-between text-sm border-t border-gray-200 pt-2">
              <span className="text-base font-extrabold text-[#1F2937]">Total</span>
              <span className="text-xl font-extrabold text-[#F26C4F] tracking-tight">{fmtINR(saved ? saved.total : preview.total)}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className={`p-3 rounded-lg border ${marginStatus.bg} flex flex-col justify-between`}>
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">Margin</span>
                  <marginStatus.icon className={`w-3.5 h-3.5 ${marginStatus.color}`} />
                </div>
                <div className="mt-1">
                  <span className={`text-xl font-extrabold ${marginStatus.color}`}>{Number(displayMargin).toFixed(1)}%</span>
                  <span className={`text-[10px] font-bold uppercase ml-2 ${marginStatus.color}`}>{marginStatus.text}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-gray-200 bg-gray-50 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">Blended Risk</span>
                  <AlertCircle className="w-3.5 h-3.5 text-[#6B7280]" />
                </div>
                <div className="mt-1">
                  {saved ? (
                    <span className={`text-xl font-extrabold ${backendRiskLevel === 'HIGH' ? 'text-red-600' : backendRiskLevel === 'MEDIUM' ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {backendRisk ?? 0}<span className="text-xs opacity-50"> {backendRiskLevel}</span>
                    </span>
                  ) : (
                    <span className="text-sm font-semibold text-slate-400">
                      {overCeilingLines.length > 0 ? `${overCeilingLines.length} line(s) over ceiling` : 'within ceilings'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI upsell/cross-sell — live from /ai/upsell, grounded in deal history */}
      {cart.length > 0 && (
        <AIRecommendationPanel
          quotationId={quoteId || 'draft'}
          cart={cart.map((i) => ({ id: i.id, name: i.name, category: i.category }))}
          onAddToQuote={handleAddRecommendation}
        />
      )}
    </div>
  );
}
