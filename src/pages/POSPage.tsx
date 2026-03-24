import { useState, useMemo } from "react";
import { useGym } from "@/contexts/GymContext";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingCart, Plus, Package, Minus, Trash2, Edit2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import type { Product } from "@/lib/types";

export default function POSPage() {
  const { products, addProduct, updateProduct, posSales, addPOSSale } = useGym();
  
  // Cart State
  const [cart, setCart] = useState<{ productId: string; quantity: number }[]>([]);
  const [checkoutSearch, setCheckoutSearch] = useState("");
  
  // Inventory State
  const [inventorySearch, setInventorySearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newProductName, setNewProductName] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [newProductCost, setNewProductCost] = useState("");
  const [newProductStock, setNewProductStock] = useState("");

  // Edit State
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editCost, setEditCost] = useState("");
  const [addStockAmount, setAddStockAmount] = useState("");

  // Filters
  const filteredProducts = useMemo(() => {
    return products.filter((p) => p.name.toLowerCase().includes(checkoutSearch.toLowerCase()));
  }, [products, checkoutSearch]);

  const filteredInventory = useMemo(() => {
    return products.filter((p) => p.name.toLowerCase().includes(inventorySearch.toLowerCase()));
  }, [products, inventorySearch]);

  // Cart Logic
  const addToCart = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    setCart(prev => {
      const existing = prev.find(item => item.productId === productId);
      if (existing) {
        if (existing.quantity >= product.stock) {
          toast.error("Not enough stock", { description: `Only ${product.stock} available.` });
          return prev;
        }
        return prev.map(item => item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item);
      }
      if (product.stock < 1) {
        toast.error("Out of stock");
        return prev;
      }
      return [...prev, { productId, quantity: 1 }];
    });
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    setCart(prev => {
      return prev.map(item => {
        if (item.productId === productId) {
          const newQuantity = item.quantity + delta;
          if (newQuantity > product.stock) {
            toast.error("Not enough stock", { description: `Only ${product.stock} available.` });
            return item;
          }
          return { ...item, quantity: Math.max(0, newQuantity) };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);
  }, [cart, products]);

  // Handlers
  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    cart.forEach(item => {
      addPOSSale({ productId: item.productId, quantity: item.quantity, date: new Date().toISOString() });
    });
    
    setCart([]);
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim() || !newProductPrice || !newProductStock || !newProductCost) return;
    addProduct({
      name: newProductName,
      price: parseFloat(newProductPrice),
      buyingPrice: parseFloat(newProductCost),
      stock: parseInt(newProductStock, 10),
    });
    setDialogOpen(false);
    setNewProductName("");
    setNewProductPrice("");
    setNewProductCost("");
    setNewProductStock("");
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setEditPrice(product.price.toString());
    setEditCost((product.buyingPrice || 0).toString());
    setAddStockAmount("0");
    setEditDialogOpen(true);
  };

  const handleEditProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    
    const priceNum = parseFloat(editPrice);
    const costNum = parseFloat(editCost);
    const stockAddition = parseInt(addStockAmount, 10) || 0;

    updateProduct(editingProduct.id, {
      price: isNaN(priceNum) ? editingProduct.price : priceNum,
      buyingPrice: isNaN(costNum) ? editingProduct.buyingPrice : costNum,
      stock: editingProduct.stock + stockAddition,
    });

    setEditDialogOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full transition-all duration-200 ease-linear">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Point of Sale (POS)</h1>
        <p className="text-sm text-muted-foreground">Manage shop inventory and sales</p>
      </div>

      <Tabs defaultValue="checkout" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="checkout">Checkout</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>

        <TabsContent value="checkout" className="space-y-4 mt-6">
          <div className="grid lg:grid-cols-[1fr_400px] gap-6">
            <Card className="flex flex-col h-[600px]">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Products</CardTitle>
                <Input 
                  placeholder="Search products..." 
                  value={checkoutSearch}
                  onChange={(e) => setCheckoutSearch(e.target.value)}
                  className="mt-2"
                />
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {filteredProducts.map((p) => (
                    <div
                      key={p.id}
                      className={`p-4 rounded-xl border flex flex-col justify-between cursor-pointer transition-all hover:shadow-md active:scale-[0.98] min-h-[120px] ${
                        p.stock === 0 ? "opacity-50 grayscale" : "bg-card hover:border-primary"
                      }`}
                      onClick={() => p.stock > 0 && addToCart(p.id)}
                    >
                      <div className="font-semibold text-sm mb-2">{p.name}</div>
                      <div className="flex items-end justify-between mt-auto pt-2">
                        <span className="font-bold text-primary">${p.price.toFixed(2)}</span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium bg-muted px-2 py-1 rounded-full">{p.stock} left</span>
                      </div>
                    </div>
                  ))}
                  {filteredProducts.length === 0 && (
                    <div className="col-span-full text-center text-sm text-muted-foreground py-10">
                      No products found. Add some in the Inventory tab.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="flex flex-col h-[600px] border-primary/20 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 w-full h-1 bg-primary"></div>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" /> Current Order
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-0">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-6 text-center">
                    <ShoppingCart className="w-12 h-12 mb-4 opacity-20" />
                    <p>Your cart is empty.</p>
                    <p className="text-sm">Click products on the left to add them.</p>
                  </div>
                ) : (
                  <div className="px-6 divide-y">
                    {cart.map((item) => {
                      const product = products.find(p => p.id === item.productId);
                      if (!product) return null;
                      return (
                        <div key={item.productId} className="py-4 flex flex-col gap-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-muted-foreground">${product.price.toFixed(2)} each</div>
                            </div>
                            <div className="font-bold tabular-nums">
                              ${(product.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2 bg-muted rounded-md p-1.5 border border-border/50">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-10 w-10 sm:h-11 sm:w-11 rounded-md" 
                                onClick={() => updateCartQuantity(item.productId, -1)}
                              >
                                <Minus className="h-4 w-4 sm:h-5 sm:w-5" />
                              </Button>
                              <span className="w-10 text-center font-bold tabular-nums text-base sm:text-lg">{item.quantity}</span>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-10 w-10 sm:h-11 sm:w-11 rounded-md" 
                                onClick={() => updateCartQuantity(item.productId, 1)}
                              >
                                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                              </Button>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-11 w-11 text-destructive hover:bg-destructive/10" 
                              onClick={() => removeFromCart(item.productId)}
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex-col gap-4 border-t bg-muted/30 pt-6">
                <div className="w-full flex justify-between items-center text-lg font-bold">
                  <span>Total Due</span>
                  <span className="tabular-nums">${cartTotal.toFixed(2)}</span>
                </div>
                <Button 
                  className="w-full h-12 text-base font-medium shadow-md transition-all active:scale-[0.98]" 
                  disabled={cart.length === 0}
                  onClick={handleCheckout}
                >
                  Complete Sale
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4 mt-6">
          <div className="flex sm:items-center justify-between flex-col sm:flex-row gap-4">
            <div className="relative w-full sm:max-w-xs">
              <Input
                placeholder="Search inventory..."
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
              />
            </div>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> Add Product
            </Button>
          </div>

          <Card className="border border-border rounded-lg overflow-hidden shadow-sm">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead className="tabular-nums">Cost Price</TableHead>
                    <TableHead className="tabular-nums">Sell Price</TableHead>
                    <TableHead className="tabular-nums">Profit Margin</TableHead>
                    <TableHead className="tabular-nums">Stock</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No products found in inventory.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInventory.map((p) => {
                      const cost = p.buyingPrice || 0;
                      const profit = p.price - cost;
                      const margin = p.price > 0 ? (profit / p.price) * 100 : 0;
                      
                      return (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium flex items-center gap-2">
                            <Package className="w-4 h-4 text-muted-foreground" /> {p.name}
                          </TableCell>
                          <TableCell className="tabular-nums text-muted-foreground">${cost.toFixed(2)}</TableCell>
                          <TableCell className="tabular-nums font-semibold">${p.price.toFixed(2)}</TableCell>
                          <TableCell className="tabular-nums">
                            <span className={profit > 0 ? "text-success font-medium" : "text-destructive font-medium"}>
                              ${profit.toFixed(2)} ({margin.toFixed(0)}%)
                            </span>
                          </TableCell>
                          <TableCell className="tabular-nums">
                            <span className={p.stock <= 5 ? "text-destructive font-bold" : ""}>
                              {p.stock}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => openEditDialog(p)}>
                              <Edit2 className="w-4 h-4 mr-2" /> Action
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* CREATE DIALOG */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddProduct} className="grid gap-4 py-4">
            <div className="grid gap-1.5">
              <Label>Product Name</Label>
              <Input value={newProductName} onChange={(e) => setNewProductName(e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label>Cost Price ($)</Label>
                <Input type="number" step="0.01" min="0" value={newProductCost} onChange={(e) => setNewProductCost(e.target.value)} required />
              </div>
              <div className="grid gap-1.5">
                <Label>Selling Price ($)</Label>
                <Input type="number" step="0.01" min="0" value={newProductPrice} onChange={(e) => setNewProductPrice(e.target.value)} required />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label>Initial Stock</Label>
              <Input type="number" min="0" value={newProductStock} onChange={(e) => setNewProductStock(e.target.value)} required />
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Save Product</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT / RESTOCK DIALOG */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit / Restock {editingProduct?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditProduct} className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label>Cost Price ($)</Label>
                <Input type="number" step="0.01" min="0" value={editCost} onChange={(e) => setEditCost(e.target.value)} required />
              </div>
              <div className="grid gap-1.5">
                <Label>Selling Price ($)</Label>
                <Input type="number" step="0.01" min="0" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} required />
              </div>
            </div>
            <div className="grid gap-1.5 pt-2 border-t mt-2">
              <Label>Add to Stock <span className="text-muted-foreground font-normal">(Current: {editingProduct?.stock})</span></Label>
              <Input type="number" min="0" value={addStockAmount} onChange={(e) => setAddStockAmount(e.target.value)} />
              <p className="text-xs text-muted-foreground">Keep at 0 to leave stock unchanged.</p>
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Update Product</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
