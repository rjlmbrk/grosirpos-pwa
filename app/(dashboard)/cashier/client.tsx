"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Minus, Trash2, ShoppingCart, ChevronDown, WifiOff, Cloud, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { createTransaction } from "@/actions/transactions";
import { searchProducts } from "@/actions/products";
import {
  addPendingTransaction,
  countPendingTransactions,
} from "@/lib/offline-db";
import { processPendingTransactions } from "@/lib/offline-sync";

interface Unit {
  id: number;
  namaSatuan: string;
  hargaJual: number;
}

interface Product {
  id: number;
  kodeBarang: string;
  namaBarang: string;
  kategori: string;
  units: Unit[];
}

interface CartItem {
  productId: number;
  productUnitId: number;
  namaBarang: string;
  namaSatuan: string;
  qty: number;
  harga: number;
  subtotal: number;
}

export function CashierClient() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);

  // Add to cart dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<number>(0);
  const [qty, setQty] = useState("1");

  // Mobile cart toggle
  const [cartOpen, setCartOpen] = useState(false);

  // Payment dialog
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [bayar, setBayar] = useState("");

  // Success dialog
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // Offline state
  const [isOffline, setIsOffline] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [offlineSuccess, setOfflineSuccess] = useState<{
    total: number;
    bayar: number;
    kembalian: number;
  } | null>(null);

  useEffect(() => {
    loadProducts("");
    searchRef.current?.blur();
  }, []);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      loadProducts(search);
    }, 300);
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [search]);

  async function loadProducts(q: string) {
    setSearchLoading(true);
    try {
      const result = await searchProducts(q);
      setProducts(result);
    } catch {
      // Search failed
    } finally {
      setSearchLoading(false);
    }
  }

  useEffect(() => {
    setIsOffline(!navigator.onLine);
    checkPendingCount();

    const handleOnline = () => {
      setIsOffline(false);
      checkPendingCount();
      processPendingTransactions().then((result) => {
        checkPendingCount();
        if (result.success > 0) {
          router.refresh();
        }
      }).catch(() => {});
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function checkPendingCount() {
    try {
      const count = await countPendingTransactions();
      setPendingCount(count);
    } catch {
      // IndexedDB not available
    }
  }

  async function handleSync() {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const result = await processPendingTransactions();
      await checkPendingCount();
      if (result.success > 0) {
        router.refresh();
      }
    } catch {
      // Sync failed
    } finally {
      setIsSyncing(false);
    }
  }

  function openAddDialog(product: Product) {
    setSelectedProduct(product);
    setSelectedUnitId(product.units[0]?.id || 0);
    setQty("1");
    setDialogOpen(true);
  }

  function addToCart() {
    if (!selectedProduct || !selectedUnitId) return;
    const unit = selectedProduct.units.find((u) => u.id === selectedUnitId);
    if (!unit) return;

    const existing = cart.findIndex(
      (c) => c.productId === selectedProduct.id && c.productUnitId === unit.id,
    );

    if (existing >= 0) {
      const next = [...cart];
      next[existing].qty += Number(qty);
      next[existing].subtotal = next[existing].qty * next[existing].harga;
      setCart(next);
    } else {
      setCart([
        ...cart,
        {
          productId: selectedProduct.id,
          productUnitId: unit.id,
          namaBarang: selectedProduct.namaBarang,
          namaSatuan: unit.namaSatuan,
          qty: Number(qty),
          harga: unit.hargaJual,
          subtotal: Number(qty) * unit.hargaJual,
        },
      ]);
    }

    setDialogOpen(false);
    setSearch("");
    searchRef.current?.focus();
  }

  function updateQty(index: number, delta: number) {
    const newQty = cart[index].qty + delta;
    if (newQty <= 0) {
      setCart(cart.filter((_, i) => i !== index));
    } else {
      const next = [...cart];
      next[index].qty = newQty;
      next[index].subtotal = newQty * next[index].harga;
      setCart(next);
    }
  }

  function removeItem(index: number) {
    setCart(cart.filter((_, i) => i !== index));
  }

  function printNota() {
    if (!checkoutState?.transaction) return;
    const t = checkoutState.transaction;
    if (!t) return;
    const tgl = new Date(t.tanggal);

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Nota</title><style>
body{font-family:'Courier New',monospace;font-size:12px;width:80mm;margin:0 auto;padding:8mm 4mm;color:#000}
h1{font-size:16px;text-align:center;margin:0 0 4px;text-transform:uppercase}
.info{text-align:center;font-size:11px;margin-bottom:8px;color:#333}
hr{border:none;border-top:1px dashed #999;margin:8px 0}
table{width:100%;border-collapse:collapse;font-size:12px}
th{text-align:left;padding:3px 0;border-bottom:1px dashed #999}
th.r{text-align:right}
td{padding:3px 0}
td.r{text-align:right}
tr.total td{padding:4px 0;border-top:1px dashed #999;font-weight:bold;font-size:13px}
.footer{text-align:center;font-size:11px;margin-top:12px;color:#666}
</style></head><body>
<h1>Toko Riswati</h1>
<div class="info">${tgl.toLocaleDateString("id-ID",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}<br>${tgl.toLocaleTimeString("id-ID")}<br>No: ${t.nomorTransaksi}</div>
<hr>
<table><thead><tr><th>Produk</th><th class="r">Qty</th><th class="r">Total</th></tr></thead><tbody>
${t.items.map((item) => `<tr><td>${item.product.namaBarang} — ${item.productUnit.namaSatuan}</td><td class="r">${item.qty}</td><td class="r">Rp${item.subtotal.toLocaleString("id-ID")}</td></tr>`).join("")}
</tbody></table>
<hr>
<table><tbody>
<tr class="total"><td>Total</td><td class="r">Rp${t.total.toLocaleString("id-ID")}</td></tr>
<tr><td>Bayar</td><td class="r">Rp${t.bayar.toLocaleString("id-ID")}</td></tr>
<tr><td>Kembalian</td><td class="r">Rp${t.kembalian.toLocaleString("id-ID")}</td></tr>
</tbody></table>
<div class="footer">Terima kasih atas kunjungan Anda</div>
</body></html>`;

    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.setTimeout(() => {
      const h = w.document.body.scrollHeight;
      const mm = Math.ceil(h * 0.264583) + 2;
      const s = w.document.createElement("style");
      s.textContent = `@page{size:80mm ${mm}mm;margin:0}`;
      w.document.head.appendChild(s);
      w.print();
      w.close();
    }, 250);
  }

  const totalItem = cart.length;
  const grandTotal = cart.reduce((sum, item) => sum + item.subtotal, 0);

  // Checkout
  const [checkoutState, setCheckoutState] = useState<{
    success?: boolean;
    error?: string;
    transaction?: {
      id: number;
      nomorTransaksi: string;
      tanggal: string;
      total: number;
      bayar: number;
      kembalian: number;
      items: {
        id: number;
        qty: number;
        harga: number;
        subtotal: number;
        product: { namaBarang: string };
        productUnit: { namaSatuan: string };
      }[];
    };
  } | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  async function handleCheckout(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSubmitting) return;

    const jumlahBayar = Number(bayar);
    if (jumlahBayar < grandTotal || jumlahBayar < 0) return;

    setIsSubmitting(true);
    setCheckoutError(null);

    if (navigator.onLine) {
      // Online: submit to server
      const formData = new FormData(e.currentTarget);
      try {
        const result = await createTransaction(undefined, formData);
        if (result && "success" in result && result.success) {
          setCheckoutState(result);
          setCart([]);
          setPaymentOpen(false);
          setBayar("");
          setShowSuccessDialog(true);
        } else if (result && "error" in result && result.error) {
          setCheckoutError(result.error);
        }
      } catch {
        setCheckoutError("Gagal terhubung ke server");
      }
    } else {
      // Offline: save to IndexedDB
      const items = cart.map((item) => ({
        productId: item.productId,
        productUnitId: item.productUnitId,
        qty: item.qty,
        harga: item.harga,
        subtotal: item.subtotal,
      }));

      const total = grandTotal;
      const kembalian = jumlahBayar - total;

      try {
        await addPendingTransaction({
          items,
          total,
          bayar: jumlahBayar,
          kembalian,
        });

        setOfflineSuccess({ total, bayar: jumlahBayar, kembalian });
        setCart([]);
        setPaymentOpen(false);
        setBayar("");
        setShowSuccessDialog(true);
        checkPendingCount();
      } catch {
        setCheckoutError("Gagal menyimpan transaksi offline");
      }
    }

    setIsSubmitting(false);
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-0px)]">
      {/* Product Search - Left */}
      <div className="flex-1 p-4 pb-28 lg:pb-4 border-b lg:border-b-0 lg:border-r border-zinc-200 overflow-y-auto">
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari Produk atau Barcode"
              className="pl-9"
            />
          </div>

          {pendingCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 gap-1.5 h-10"
              onClick={handleSync}
              disabled={isSyncing}
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{pendingCount}</span>
            </Button>
          )}

          {isOffline && (
            <div className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-md bg-amber-50 text-amber-600 text-xs font-medium">
              <WifiOff className="h-3.5 w-3.5" />
              Offline
            </div>
          )}

          <Button
            variant="outline"
            size="icon"
            className="shrink-0 h-10 w-10"
            onClick={() => setCartOpen(!cartOpen)}
            title={cartOpen ? "Tutup Keranjang" : "Buka Keranjang"}
          >
            <ShoppingCart className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-3">
          {searchLoading ? (
            <div className="space-y-3">
              {[1,2,3,4].map((i) => (
                <Card key={i}>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="h-4 w-32 bg-zinc-200 rounded animate-pulse" />
                        <div className="h-3 w-20 bg-zinc-100 rounded animate-pulse" />
                      </div>
                      <div className="h-9 w-20 bg-zinc-200 rounded animate-pulse" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : products.length === 0 ? (
            <p className="text-center text-zinc-500 py-8">
              Produk tidak ditemukan
            </p>
          ) : (
            products.map((product) => (
              <Card key={product.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm sm:text-base">{product.namaBarang}</p>
                      <p className="text-xs text-zinc-500">{product.kategori}</p>
                      <p className="text-xs text-zinc-400 mt-1">
                        {product.units.map((u) => u.namaSatuan).join(", ")}
                      </p>
                    </div>
                    <Button
                      onClick={() => openAddDialog(product)}
                      className="h-9 gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      Tambah
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Cart - Right */}
      {/* Cart */}
      <div className={`${cartOpen ? "fixed inset-0 z-50 bg-white flex flex-col" : "hidden"} lg:static lg:z-auto lg:flex lg:flex-col lg:w-2/5 lg:border-l lg:border-zinc-200`}>
        <div className="flex items-center justify-between p-4 border-b border-zinc-200">
          <h2 className="font-semibold text-zinc-900 flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Keranjang ({totalItem})
          </h2>
          <Button variant="ghost" size="icon" onClick={() => setCartOpen(false)}>
            <ChevronDown className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">

          {cart.length === 0 ? (
            <div className="text-center py-16 text-zinc-400">
              <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Belum ada item</p>
              <p className="text-sm">Cari produk dan klik Tambah</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cart.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 bg-white rounded-lg border border-zinc-200"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {item.namaBarang}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {item.namaSatuan} - Rp{item.harga.toLocaleString("id-ID")}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => updateQty(i, -1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-10 text-center text-sm font-medium">
                      {item.qty}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => updateQty(i, 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <p className="text-sm font-medium w-24 text-right">
                    Rp{item.subtotal.toLocaleString("id-ID")}
                  </p>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => removeItem(i)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        {cart.length > 0 && (
          <div className="p-4 bg-white border-t border-zinc-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-zinc-500">
                Total Item: {cart.reduce((s, i) => s + i.qty, 0)}
              </span>
              <span className="text-xl font-bold text-zinc-900">
                Rp{grandTotal.toLocaleString("id-ID")}
              </span>
            </div>
            <Button
              className="w-full h-12 text-lg gap-2 bg-blue-600 hover:bg-blue-700"
              onClick={() => setPaymentOpen(true)}
            >
              Bayar
            </Button>
          </div>
        )}
      </div>

      {/* Add to Cart Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah ke Keranjang</DialogTitle>
          </DialogHeader>

          {selectedProduct && (
            <div className="space-y-4 py-2">
              <div>
                <Label>Produk</Label>
                <p className="text-sm font-medium">{selectedProduct.namaBarang}</p>
              </div>

              <div className="space-y-2">
                <Label>Satuan</Label>
                <select
                  value={selectedUnitId}
                  onChange={(e) => setSelectedUnitId(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-md border border-zinc-300 bg-white text-sm"
                >
                  {selectedProduct.units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.namaSatuan} - Rp{u.hargaJual.toLocaleString("id-ID")}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Qty</Label>
                <Input
                  type="number"
                  min={1}
                  step={1}
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  onBlur={() => {
                    if (!qty || Number(qty) < 1) setQty("1");
                  }}
                />
              </div>

              <div>
                <Label>Harga</Label>
                <p className="text-sm font-medium">
                  Rp
                  {(
                    (selectedProduct.units.find((u) => u.id === selectedUnitId)
                      ?.hargaJual || 0) * Number(qty)
                  ).toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={addToCart}>Tambah</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pembayaran</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCheckout} className="space-y-4 py-2">
            {/* Hidden inputs for cart items */}
            {cart.map((item, i) => (
              <div key={i} className="hidden">
                <input
                  name={`items[${i}][productId]`}
                  value={item.productId}
                  readOnly
                />
                <input
                  name={`items[${i}][productUnitId]`}
                  value={item.productUnitId}
                  readOnly
                />
                <input
                  name={`items[${i}][qty]`}
                  value={item.qty}
                  readOnly
                />
                <input
                  name={`items[${i}][harga]`}
                  value={item.harga}
                  readOnly
                />
                <input
                  name={`items[${i}][subtotal]`}
                  value={item.subtotal}
                  readOnly
                />
              </div>
            ))}

            <div>
              <Label>Total</Label>
              <p className="text-2xl font-bold">
                Rp{grandTotal.toLocaleString("id-ID")}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Bayar</Label>
              <Input
                name="bayar"
                type="number"
                min={0}
                placeholder="Masukkan jumlah bayar"
                value={bayar}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "" || Number(val) >= 0) setBayar(val);
                }}
                required
              />
              <div className="flex flex-wrap gap-1.5">
                {[10000, 20000, 50000, 100000, 200000, 500000].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setBayar(String(amount))}
                    className="px-2.5 py-1 text-sm rounded-md border border-zinc-300 hover:bg-zinc-100 transition-colors"
                  >
                    Rp{(amount / 1000).toLocaleString("id-ID")}rb
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>Kembalian</Label>
              <p className="text-lg font-semibold text-blue-600">
                Rp
                {(
                  Math.max(0, Number(bayar) - grandTotal)
                ).toLocaleString("id-ID")}
              </p>
            </div>

            {checkoutError && (
              <p className="text-sm text-red-500">{checkoutError}</p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPaymentOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={Number(bayar) < grandTotal || Number(bayar) < 0 || isSubmitting}
              >
                {isSubmitting ? "Memproses..." : "Proses Pembayaran"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Success Dialog - Nota */}
      <Dialog
        open={showSuccessDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowSuccessDialog(false);
            setOfflineSuccess(null);
            setCheckoutState(null);
            router.refresh();
          }
        }}
      >
          <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-center">
                {offlineSuccess ? (
                  <span className="text-amber-600">Tersimpan Offline</span>
                ) : (
                  <span className="text-blue-600">Transaksi Berhasil</span>
                )}
              </DialogTitle>
            </DialogHeader>

            {(() => {
              const t = checkoutState?.transaction;
              if (!t) return null;
              return (
              <div className="border border-zinc-200 rounded-lg p-4 space-y-3">
                {/* Header Nota */}
                <div className="text-center border-b border-zinc-200 pb-2">
                  <p className="font-bold text-sm uppercase">Toko Riswati</p>
                  <p className="text-xs text-zinc-500">
                    {new Date(t.tanggal).toLocaleDateString("id-ID", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {new Date(t.tanggal).toLocaleTimeString("id-ID")}
                  </p>
                </div>

                {/* Info Transaksi */}
                <div className="text-center">
                  <p className="text-xs text-zinc-500">No. Transaksi</p>
                  <p className="font-semibold text-sm">
                    {t.nomorTransaksi}
                  </p>
                </div>

                {/* Items */}
                <div className="border-t border-zinc-200 pt-2 overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-zinc-500 border-b border-zinc-200">
                        <th className="text-left pb-1">Produk</th>
                        <th className="text-center pb-1">Qty</th>
                        <th className="text-right pb-1">Harga</th>
                        <th className="text-right pb-1">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {t.items.map((item) => (
                        <tr key={item.id}>
                          <td className="py-1">
                            <p className="font-medium truncate max-w-[100px] sm:max-w-[200px]">{item.product.namaBarang}</p>
                            <p className="text-zinc-400 truncate">{item.productUnit.namaSatuan}</p>
                          </td>
                          <td className="text-center py-1">{item.qty}</td>
                          <td className="text-right py-1">
                            Rp{item.harga.toLocaleString("id-ID")}
                          </td>
                          <td className="text-right py-1 font-medium">
                            Rp{item.subtotal.toLocaleString("id-ID")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Total */}
                <div className="border-t border-zinc-200 pt-2 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Total</span>
                    <span className="font-bold">
                      Rp{t.total.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Bayar</span>
                    <span>
                      Rp{t.bayar.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Kembalian</span>
                    <span className="text-blue-600 font-semibold">
                      Rp{t.kembalian.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>
              );
            })()}

            {offlineSuccess && (
              <div className="border border-zinc-200 rounded-lg p-4 space-y-3">
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <div className="p-2 rounded-full bg-amber-100">
                      <Cloud className="h-6 w-6 text-amber-600" />
                    </div>
                  </div>
                  <p className="text-sm text-zinc-500">
                    Transaksi akan tersimpan secara otomatis saat koneksi kembali
                  </p>
                </div>
                <div className="border-t border-zinc-200 pt-2 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Total</span>
                    <span className="font-bold">
                      Rp{offlineSuccess.total.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Bayar</span>
                    <span>
                      Rp{offlineSuccess.bayar.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Kembalian</span>
                    <span className="text-blue-600 font-semibold">
                      Rp{offlineSuccess.kembalian.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>
            )}

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            {checkoutState?.success && (
              <Button
                variant="outline"
                className="w-full sm:flex-1"
                onClick={printNota}
              >
                Cetak Nota
              </Button>
            )}
            <Button
              className="w-full sm:flex-1"
              onClick={() => {
                if (checkoutState?.success) {
                  router.push("/transactions");
                } else {
                  setShowSuccessDialog(false);
                  setOfflineSuccess(null);
                }
              }}
            >
              {checkoutState?.success ? "Lihat Riwayat" : "Tutup"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mobile cart toggle - hidden on desktop when cart sidebar is visible */}
      {!cartOpen && cart.length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 p-4 bg-white border-t border-zinc-200 shadow-lg lg:hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-500">
              {cart.reduce((s, i) => s + i.qty, 0)} item
            </span>
            <span className="text-xl font-bold text-zinc-900">
              Rp{grandTotal.toLocaleString("id-ID")}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              className="flex-1 h-12 text-base gap-2"
              variant="outline"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingCart className="h-5 w-5" />
              Keranjang
            </Button>
            <Button
              className="flex-1 h-12 text-base gap-2 bg-blue-600 hover:bg-blue-700"
              onClick={() => setPaymentOpen(true)}
            >
              Bayar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
