import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Spinner } from "../components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Search, SearchX } from "lucide-react";
import { EmptyState } from "../components/ui/empty-state";

type Product = {
  _id: string;
  title: string;
  description: string;
  priceCents: number;
  currency: string;
  category?: string;
  imageUrls?: string[];
};

async function fetchProducts(params: { search: string; category: string; sort?: string }) {
  const res = await api.get("/products", {
    params: {
      search: params.search || undefined,
      category: params.category || undefined,
      sort: params.sort || undefined,
      page: 1,
      limit: 24,
    },
  });

  return res.data?.items ?? res.data ?? [];
}

export function ProductsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState<string>("latest"); // 'latest', 'price_asc', 'price_desc'

  // ... existing query ...
  const queryKey = useMemo(
    () => ["products", { search, category, sort }],
    [search, category, sort]
  );

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => fetchProducts({ search, category, sort }),
  });

  const products: Product[] = data ?? [];

  return (
    <div className="space-y-8 animate-fade-in">
       {/* ... existing header ... */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary-900">
            Marketplace
          </h1>
          <p className="text-muted-foreground mt-2">
            Discover quality products from verified suppliers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Newest Arrivals</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[240px_1fr]">
        <aside className="space-y-6">
          <Card className="border-none shadow-none bg-transparent">
            {/* ... Filters ... */}
            <CardHeader className="px-0 pt-0">
               <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
             <CardContent className="px-0 space-y-6">
                 <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">Search</label>
                    <div className="relative">
                       <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                       <Input
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          placeholder="Search..."
                          className="pl-9 bg-white"
                        />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">Category</label>
                    <Input
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="e.g. Food, Tech..."
                      className="bg-white"
                    />
                  </div>
             </CardContent>
          </Card>
        </aside>

        <main>
          {isLoading && (
            <div className="flex justify-center py-20">
              <Spinner size="lg" />
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-6 text-destructive text-center">
              Failed to load products. Please try again later.
            </div>
          )}

          {!isLoading && !error && products.length === 0 && (
            <EmptyState
               icon={SearchX}
               title="No products found"
               description="Try adjusting your search or filters to find what you're looking for."
               action={
                  <Button variant="outline" onClick={() => {setSearch(''); setCategory('')}}>
                     Clear Filters
                  </Button>
               }
            />
          )}

          {!isLoading && !error && products.length > 0 && (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              {products.map((p) => (
                <Link key={p._id} to={`/products/${p._id}`}>
                  <Card className="h-full hover:shadow-md transition-shadow duration-200 overflow-hidden group">
                     {/* ... Card Content ... */}
                    <div className="aspect-video w-full bg-gray-100 relative overflow-hidden">
                      {p.imageUrls?.[0] ? (
                        <img
                          src={p.imageUrls[0]}
                          alt={p.title}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-gray-400 bg-gray-50">
                          No Image
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        {p.category && (
                          <Badge variant="secondary" className="backdrop-blur-md bg-white/80">
                            {p.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-lg line-clamp-1" title={p.title}>
                        {p.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 py-2 flex-grow">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {p.description}
                      </p>
                    </CardContent>
                    <CardFooter className="p-4 pt-2 border-t bg-gray-50/50 flex items-center justify-between">
                      <div className="font-bold text-lg text-primary-700">
                        {((p.priceCents ?? 0) / 100).toLocaleString()} <span className="text-sm font-normal text-gray-500">{p.currency}</span>
                      </div>
                      <Button size="sm" variant="ghost">
                        View
                      </Button>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
