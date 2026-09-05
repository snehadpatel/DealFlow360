import React, { useState, useEffect } from 'react';
import { getProductCatalog, getAiRecommendation } from '../../api/salesApi';
import { Search, Plus, Minus, X, AlertTriangle, AlertCircle, Bot, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';

export default function QuotationBuilder() {
  const [catalog, setCatalog] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Builder state
  const [discountPercent, setDiscountPercent] = useState(0);
  const [customer, setCustomer] = useState('ABC Corporation');
  const [quoteId] = useState('Q-' + Math.floor(1000 + Math.random() * 9000));
  
  // AI State
  const [aiRec, setAiRec] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    getProductCatalog().then(setCatalog).finally(() => setLoading(false));
  }, []);

  // AI Recommendation Trigger
  useEffect(() => {
    if (cart.length > 0) {
      setAiLoading(true);
      getAiRecommendation(cart).then((rec) => {
        // Only show recommendation if it's not already in the cart
        if (rec && !cart.find(item => item.id === rec.product.id)) {
          setAiRec(rec);
        } else {
          setAiRec(null);
        }
      }).finally(() => setAiLoading(false));
    } else {
      setAiRec(null);
    }
  }, [cart]);

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const updateQty = (id, delta) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const addAiRecommendation = () => {
    if (aiRec) {
      addToCart(aiRec.product);
      setAiRec(null);
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  // Live Margin & Financial Calculations
  const rawSubtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const totalCost = cart.reduce((acc, item) => acc + (item.cost * item.qty), 0);
  
  const discountAmount = rawSubtotal * (discountPercent / 100);
  const netRevenue = rawSubtotal - discountAmount;
  const taxAmount = netRevenue * 0.18; // 18% GST assumed
  const finalTotal = netRevenue + taxAmount;
  
  const profit = netRevenue - totalCost;
  const marginPercent = netRevenue > 0 ? (profit / netRevenue) * 100 : 0;
  
  // Risk & Margin Indicators
  let marginStatus = { color: 'text-success-600', bg: 'bg-success-50 border-success-200', icon: CheckCircle2, text: 'Healthy' };
  let riskScore = 15 + (discountPercent * 2); // Mock risk calculation
  
  if (marginPercent < 15) {
    marginStatus = { color: 'text-warning-600', bg: 'bg-warning-50 border-warning-200', icon: AlertCircle, text: 'Watch' };
    riskScore += 20;
  }
  if (marginPercent < 10) {
    marginStatus = { color: 'text-danger-600', bg: 'bg-danger-50 border-danger-200', icon: AlertTriangle, text: 'Risky' };
    riskScore += 40;
  }
  
  // Cap risk score
  riskScore = Math.min(100, Math.max(0, riskScore));

  const filteredCatalog = catalog.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4 shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold text-textPrimary">Quotation Builder</h1>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-sm font-semibold text-textSecondary">Customer:</span>
            <span className="text-sm font-bold text-brand-500">{customer}</span>
            <ChevronRight className="w-4 h-4 text-gray-300" />
            <span className="text-sm font-bold text-textPrimary">{quoteId}</span>
          </div>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-textPrimary rounded-full text-xs font-semibold transition">
            Save Draft
          </button>
          <button disabled={cart.length === 0} className="px-4 py-2 bg-brand-500 hover:bg-brand-600 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-full text-xs font-semibold shadow-btn transition">
            Submit for Approval
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        
        {/* Left: Product Catalog */}
        <div className="flex-1 flex flex-col bg-white border border-gray-200 rounded-2xl shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-bold uppercase tracking-wider text-textSecondary mb-3">Product Catalog</h3>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-textSecondary" />
              <input 
                type="text" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                placeholder="Search products..." 
                className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-xs text-textPrimary focus:outline-none focus:border-primary-500 transition" 
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
            {loading ? (
              <div className="space-y-2 p-2 animate-pulse">
                {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-50 rounded-lg" />)}
              </div>
            ) : filteredCatalog.length > 0 ? (
              <div className="space-y-2">
                {filteredCatalog.map(product => (
                  <div key={product.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-brand-300 hover:shadow-sm transition group bg-white">
                    <div>
                      <div className="font-bold text-sm text-textPrimary">{product.name}</div>
                      <div className="flex items-center space-x-2 mt-0.5 text-xs text-textSecondary">
                        <span className="font-semibold text-brand-500">{formatCurrency(product.price)}</span>
                        <span>•</span>
                        <span>Stock: {product.stock > 100 ? '100+' : product.stock}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => addToCart(product)}
                      className="p-1.5 bg-gray-100 hover:bg-brand-500 hover:text-white text-textSecondary rounded-lg transition opacity-0 group-hover:opacity-100"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 text-xs text-textSecondary">No products found.</div>
            )}
          </div>
        </div>

        {/* Right: Cart, AI & Financials */}
        <div className="flex-1 flex flex-col gap-4 min-h-0">
          
          {/* Cart Section */}
          <div className="flex-1 flex flex-col bg-white border border-gray-200 rounded-2xl shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-wider text-textSecondary">Quotation Cart</h3>
              <span className="text-xs font-bold bg-white border border-gray-200 px-2 py-0.5 rounded-full">{cart.length} items</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-300 space-y-2">
                  <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium">Add products to build quote</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.id} className="flex flex-col p-3 border border-gray-200 rounded-lg bg-gray-50/50">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-sm text-textPrimary">{item.name}</span>
                        <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-danger-500"><X className="w-3.5 h-3.5" /></button>
                      </div>
                      <div className="flex justify-between items-end mt-3">
                        <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg p-0.5">
                          <button onClick={() => updateQty(item.id, -1)} className="p-1 text-textSecondary hover:text-textPrimary hover:bg-gray-100 rounded"><Minus className="w-3 h-3" /></button>
                          <span className="text-xs font-bold w-6 text-center">{item.qty}</span>
                          <button onClick={() => updateQty(item.id, 1)} className="p-1 text-textSecondary hover:text-textPrimary hover:bg-gray-100 rounded"><Plus className="w-3 h-3" /></button>
                        </div>
                        <span className="font-bold text-sm text-textPrimary">{formatCurrency(item.price * item.qty)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AI Recommendation Panel */}
            {(aiLoading || aiRec) && (
              <div className="border-t border-gray-200 p-4 bg-purple-50/30">
                {aiLoading ? (
                  <div className="flex items-center space-x-2 text-xs text-purple-500 font-medium animate-pulse">
                    <Bot className="w-4 h-4" />
                    <span>AI analyzing cart for upsell opportunities...</span>
                  </div>
                ) : aiRec ? (
                  <div className="border border-purple-200 bg-purple-50 rounded-2xl p-3 shadow-sm relative overflow-hidden group">
                    <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/3 -translate-y-1/3">
                      <Sparkles className="w-24 h-24 text-purple-600" />
                    </div>
                    <div className="relative z-10 flex flex-col space-y-2">
                      <div className="flex items-center space-x-1.5 text-purple-700">
                        <Bot className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">DealFlow AI Recommendation</span>
                      </div>
                      <div className="text-sm font-bold text-textPrimary leading-tight">
                        Add <span className="text-purple-600">{aiRec.product.name}</span>
                      </div>
                      <div className="text-[11px] text-textSecondary italic">
                        "{aiRec.reason}"
                      </div>
                      <div className="flex items-center space-x-4 pt-1">
                        <div className="text-xs font-bold text-success-600">+{formatCurrency(aiRec.addedRevenue)} Rev</div>
                        <div className="text-xs font-bold text-brand-500">+{aiRec.addedMarginPercent}% Margin</div>
                      </div>
                      <div className="pt-2 flex space-x-2">
                        <button onClick={addAiRecommendation} className="flex-1 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold transition shadow-sm">
                          Add to Quote
                        </button>
                        <button onClick={() => setAiRec(null)} className="py-1.5 px-3 bg-white border border-purple-200 text-textSecondary hover:text-textPrimary rounded-lg text-xs font-medium transition">
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Financials & Live Margin */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-4 shrink-0 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-textSecondary border-b border-gray-200 pb-2">Financial Summary</h3>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-textSecondary font-medium">Subtotal</span>
              <span className="font-bold">{formatCurrency(rawSubtotal)}</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-textSecondary font-medium">Discount</span>
              <div className="flex items-center space-x-2">
                <input 
                  type="number" 
                  min="0" max="100" 
                  value={discountPercent} 
                  onChange={(e) => setDiscountPercent(Number(e.target.value) || 0)}
                  className="w-16 px-2 py-1 text-right text-xs font-bold bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-primary-500"
                />
                <span className="font-bold text-warning-600">- {formatCurrency(discountAmount)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm border-t border-gray-200 pt-2">
              <span className="text-base font-extrabold text-textPrimary">Net Revenue</span>
              <span className="text-xl font-extrabold text-brand-500 tracking-tight">{formatCurrency(netRevenue)}</span>
            </div>

            {/* Live Margin Indicator */}
            <div className="grid grid-cols-2 gap-3 pt-3">
              <div className={`p-3 rounded-lg border ${marginStatus.bg} flex flex-col justify-between`}>
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">Live Margin</span>
                  <marginStatus.icon className={`w-3.5 h-3.5 ${marginStatus.color}`} />
                </div>
                <div className="mt-1">
                  <span className={`text-xl font-extrabold ${marginStatus.color}`}>{marginPercent.toFixed(1)}%</span>
                  <span className={`text-[10px] font-bold uppercase ml-2 ${marginStatus.color}`}>{marginStatus.text}</span>
                </div>
              </div>
              
              <div className="p-3 rounded-lg border border-gray-200 bg-gray-50 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-textSecondary">Risk Score</span>
                  <AlertCircle className="w-3.5 h-3.5 text-textSecondary" />
                </div>
                <div className="mt-1">
                  <span className={`text-xl font-extrabold ${riskScore > 60 ? 'text-danger-600' : riskScore > 30 ? 'text-warning-600' : 'text-success-600'}`}>
                    {Math.round(riskScore)}<span className="text-xs opacity-50">/100</span>
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
