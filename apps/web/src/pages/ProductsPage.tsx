import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
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

const PAGE_LIMIT = 12;

async function fetchProducts(params: { search: string; category: string; sort?: string; page: number }) {
  const res = await api.get("/products", {
    params: {
      search: params.search || undefined,
      category: params.category || undefined,
      sort: params.sort || undefined,
      page: params.page,
      limit: PAGE_LIMIT,
    },
  });
  return (res.data?.items ?? res.data ?? []) as Product[];
}

export function ProductsPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState<string>("latest");
  const [page, setPage] = useState(1);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  // Debounce search value to avoid hammering the API
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
    setAllProducts([]);
  }, [debouncedSearch, category, sort]);

  const queryKey = useMemo(
    () => ["products", { search: debouncedSearch, category, sort, page }],
    [debouncedSearch, category, sort, page]
  );

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey,
    queryFn: () => fetchProducts({ search: debouncedSearch, category, sort, page }),
  });

  // Append new pages to the accumulated list
  useEffect(() => {
    if (!data) return;
    if (page === 1) {
      setAllProducts(data);
    } else {
      setAllProducts((prev) => [...prev, ...data]);
    }
  }, [data, page]);

  const hasMore = data?.length === PAGE_LIMIT;

  const handleLoadMore = useCallback(() => {
    setPage((p) => p + 1);
  }, []);

  const products: Product[] = allProducts;

  return (
    <div className="space-y-8 animate-fade-in">
      <Helmet>
        <title>{t("hero.title")} — MME</title>
        <meta name="description" content={t("hero.subtitle")} />
      </Helmet>
       {/* ... existing header ... */}
      <div className="space-y-12">
        {/* Hero Section */}
        <div className="relative rounded-[2rem] overflow-hidden px-6 py-24 text-center text-white shadow-2xl isolate">
            {/* Background Image */}
            {/* Background Image */}
            <img
                src="/hero-bg.svg"
                alt="Sheikh Zayed Grand Mosque"
                className="absolute inset-0 w-full h-full object-cover -z-20 transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-slate-900 -z-30" />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30 -z-10" />
            
            {/* Content */}
            <div className="relative z-10 max-w-4xl mx-auto space-y-8">
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight drop-shadow-xl">
                    {t('hero.title')}
                </h1>
                <p className="text-lg md:text-2xl text-gray-100 max-w-2xl mx-auto font-medium drop-shadow-lg leading-relaxed">
                    {t('hero.subtitle')}
                </p>
                <div className="flex justify-center pt-4">
                    <Button 
                        size="lg" 
                        onClick={() => {
                            const el = document.getElementById('products-grid');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="cursor-pointer bg-primary hover:bg-primary/90 text-white border-0 rounded-full font-bold h-14 px-10 text-lg shadow-xl shadow-primary/20 transition-all hover:scale-105 hover:shadow-2xl"
                    >
                        {t('hero.cta')}
                    </Button>
                </div>
            </div>
        </div>

        {/* Filters & Sort Header */}
        <div id="products-grid" className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-6">
            <div>
                 <h2 className="text-2xl font-bold tracking-tight text-gray-900">{t('products.featured')}</h2>
                 <p className="text-muted-foreground mt-1">{t('products.featured_sub')}</p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-[180px] rounded-full border-gray-200 bg-white">
                  <SelectValue placeholder={t('products.sort_by')} />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="latest">{t('products.sort.latest')}</SelectItem>
                  <SelectItem value="price_asc">{t('products.sort.price_asc')}</SelectItem>
                  <SelectItem value="price_desc">{t('products.sort.price_desc')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-[300px_1fr]">
        <aside className="space-y-6">
          <Card className="bg-white shadow-sm border-gray-200">
            {/* ... Filters ... */}
            <CardHeader className="p-6 pb-2">
               <CardTitle className="text-lg">{t('products.filters.title')}</CardTitle>
            </CardHeader>
             <CardContent className="p-6 space-y-8">
                 <div className="space-y-4 border-b pb-6 border-gray-100">
                    <label className="text-base font-semibold leading-none text-foreground/90">{t('products.filters.search_label')}</label>
                    <div className="relative">
                       <Search className="absolute left-4 top-4 h-5 w-5 text-primary-500" />
                       <Input
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          placeholder={t('products.filters.search_placeholder')}
                          className="pl-12 h-14 text-lg bg-white shadow-sm border-gray-200 focus-visible:ring-primary-500"
                        />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">{t('products.filters.category_label')}</label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="bg-white border-gray-200">
                        <SelectValue placeholder={t('products.filters.category_placeholder')} />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="All">{t('products.filters.all_categories')}</SelectItem>
                        <SelectItem value="Food">{t('products.categories.Food')}</SelectItem>
                        <SelectItem value="Textiles">{t('products.categories.Textiles')}</SelectItem>
                        <SelectItem value="Spices">{t('products.categories.Spices')}</SelectItem>
                        <SelectItem value="Cosmetics">{t('products.categories.Cosmetics')}</SelectItem>
                        <SelectItem value="Home">{t('products.categories.Home')}</SelectItem>
                        <SelectItem value="Fashion">{t('products.categories.Fashion')}</SelectItem>
                        <SelectItem value="Art">{t('products.categories.Art')}</SelectItem>
                      </SelectContent>
                    </Select>
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
               title={t('products.empty.title')}
               description={t('products.empty.description')}
               action={
                  <Button variant="outline" onClick={() => {setSearch(''); setCategory('')}}>
                     {t('products.empty.clear')}
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
                          {t('products.card.no_image')}
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
                        {t('products.card.view')}
                      </Button>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          )}
          {/* Load More */}
          {!isLoading && !error && hasMore && (
            <div className="flex justify-center pt-8">
              <button
                onClick={handleLoadMore}
                disabled={isFetching}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-full border-2 border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all disabled:opacity-50 shadow-sm"
              >
                {isFetching ? (
                  <><Spinner size="sm" /> {t("common.loading")}</>
                ) : (
                  t("products.load_more") || "Load More Products"
                )}
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
