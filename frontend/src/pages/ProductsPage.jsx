import React, { useState, useEffect, useCallback } from 'react'
import { Search, Plus, Check, Star, Filter, ArrowRight, ChevronDown, ChevronRight } from 'lucide-react'
import Header from '../components/Layout/Header'
import CartSidebar from '../components/Cart/CartSidebar'
import { productsAPI } from '../services/api'
import { useCart } from '../context/CartContext'

const CATEGORY_EMOJI = {
  beauty: '💄', fragrances: '🌸', furniture: '🛋️', groceries: '🛒',
  'home-decoration': '🖼️', 'kitchen-accessories': '🍴', laptops: '💻',
  'mens-shirts': '👔', 'mens-shoes': '👞', 'mens-watches': '⌚',
  'mobile-accessories': '🔌', motorcycle: '🏍️', 'skin-care': '🧴',
  smartphones: '📱', 'sports-accessories': '🏀', sunglasses: '🕶️',
  tablets: '📲', tops: '👕', vehicle: '🚗', 'womens-bags': '👜',
  'womens-dresses': '👗', 'womens-jewellery': '💍', 'womens-shoes': '👠',
  'womens-watches': '⌚', snacks: '🍿', beverages: '🥤', dairy: '🥛',
  breakfast: '🍳', fruits: '🍎', vegetables: '🥦', healthy: '💪',
  instant: '🍜', bakery: '🥖',
}

function ProductCard({ product }) {
  const { addToCart } = useCart()
  const [added, setAdded] = useState(false)
  const [adding, setAdding] = useState(false)

  const handleAdd = async () => {
    if (adding || added) return
    setAdding(true)
    try {
      await addToCart(product.id)
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    } finally {
      setAdding(false)
    }
  }

  const discount = product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0

  const emoji = CATEGORY_EMOJI[product.category?.toLowerCase()] || '📦'

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group relative card-hover h-full">
      {/* Product Image */}
      <div className="relative h-48 bg-gray-50/30 overflow-hidden flex items-center justify-center p-4">
        <img
          src={product.image_url}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.style.display = 'none'
            if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'
          }}
        />
        <div className="hidden w-full h-full items-center justify-center text-7xl absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100">
          {emoji}
        </div>

        {/* Badges */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md rounded-xl px-2.5 py-1 flex items-center gap-1.5 shadow-sm border border-gray-100/50">
          <Star size={12} className="text-yellow-400" fill="#FBBF24" />
          <span className="text-xs font-extrabold text-gray-700">{product.rating || '4.0'}</span>
        </div>

        {discount > 0 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-[11px] font-black px-2.5 py-1 rounded-xl shadow-md shadow-red-500/20 tracking-wide">
            {discount}% OFF
          </div>
        )}

        {!product.in_stock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px] transition-all duration-300">
            <span className="text-white text-xs font-black bg-red-500 px-4 py-2 rounded-full shadow-xl tracking-wider uppercase">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col flex-1">
        <span className="text-[10px] text-gray-400 font-extrabold tracking-widest uppercase">{product.brand}</span>
        <h4 className="text-sm font-bold text-gray-900 leading-snug mt-1.5 line-clamp-2">{product.name}</h4>
        <p className="text-[11px] text-gray-500 mt-2 font-semibold bg-gray-50 self-start px-2.5 py-1 rounded-lg border border-gray-100/50">{product.unit}</p>

        {/* Nutritional tags */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {product.is_vegetarian && (
            <span className="text-[9px] font-extrabold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full tracking-wide">VEG</span>
          )}
          {product.is_vegan && (
            <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full tracking-wide">VEGAN</span>
          )}
          {product.is_high_protein && (
            <span className="text-[9px] font-extrabold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full tracking-wide">HIGH PROTEIN</span>
          )}
        </div>

        {/* Price & Add (mt-auto pushes this to the bottom always) */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black text-gray-900">₹{product.price}</span>
              {discount > 0 && <span className="text-xs text-gray-400 font-semibold line-through decoration-gray-300">₹{product.mrp}</span>}
            </div>
            <p className="text-[10px] text-gray-400 font-medium">Incl. all taxes</p>
          </div>

          <button
            onClick={handleAdd}
            disabled={!product.in_stock || adding}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 btn-press flex items-center gap-1.5 ${added
                ? 'bg-green-50 text-green-700 border border-green-200 shadow-inner'
                : product.in_stock
                  ? 'bg-green-gradient text-white hover:opacity-90 shadow-green hover:shadow-lg'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
          >
            {added ? <><Check size={14} /> Added</> : adding ? '...' : <><Plus size={14} /> Add</>}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [departments, setDepartments] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [expandedDept, setExpandedDept] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch departments
  useEffect(() => {
    async function loadDepartments() {
      try {
        const res = await productsAPI.departments()
        setDepartments(res.data.departments || [])
      } catch (err) {
        console.error('Error fetching departments:', err)
        try {
          const catRes = await productsAPI.categories()
          setDepartments([{
            department: '📦 All Categories',
            categories: (catRes.data.categories || []).map(c => ({ slug: c, label: c.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }))
          }])
        } catch (e2) {
          setError(`Failed to load categories: ${e2.message}`)
        }
      }
    }
    loadDepartments()
  }, [])

  // Debounce search text
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchText)
      setPage(1)
    }, 300)
    return () => clearTimeout(handler)
  }, [searchText])

  // Fetch products
  const loadProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await productsAPI.list({
        category: selectedCategory === 'All' ? null : selectedCategory,
        search: debouncedSearch || null,
        page,
        limit: 12
      })
      if (page === 1) {
        setProducts(res.data.products)
      } else {
        setProducts((prev) => [...prev, ...res.data.products])
      }
      setTotal(res.data.total)
    } catch (err) {
      console.error('Error loading products:', err)
      setError(`Failed to load products: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }, [selectedCategory, debouncedSearch, page])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const handleCategorySelect = (catSlug) => {
    setSelectedCategory(catSlug)
    setPage(1)
  }

  const toggleDept = (deptName) => {
    setExpandedDept(expandedDept === deptName ? null : deptName)
  }

  const loadMore = () => {
    setPage((prev) => prev + 1)
  }

  const getActiveDeptLabel = () => {
    if (selectedCategory === 'All') return null
    for (const dept of departments) {
      for (const cat of dept.categories) {
        if (cat.slug === selectedCategory) return dept.department
      }
    }
    return null
  }
  const activeDept = getActiveDeptLabel()

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      <Header />
      <CartSidebar />

      {/* Main Content Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 flex flex-col gap-8">

        {/* Top bar with heading and search */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Explore Catalog</h1>
            <p className="text-gray-500 text-sm font-semibold mt-1.5 flex items-center gap-2">
              Browse 8 departments <span className="text-gray-300">&bull;</span> 24 categories <span className="text-gray-300">&bull;</span> 190+ products
            </p>
          </div>

          <div className="relative w-full md:max-w-md bg-white border border-gray-200 rounded-2xl flex items-center px-4 py-3 shadow-sm hover:shadow-md focus-within:ring-2 focus-within:ring-green-500/20 focus-within:border-green-400 transition-all duration-300">
            <Search size={18} className="text-gray-400 mr-3 flex-shrink-0" />
            <input
              id="search-input"
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search by product, brand, or tag..."
              className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none font-medium"
            />
          </div>
        </div>

        {/* Department-Grouped Category Navigation */}
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap items-center">
            <button
              onClick={() => { handleCategorySelect('All'); setExpandedDept(null) }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap btn-press border ${selectedCategory === 'All'
                  ? 'bg-green-gradient text-white border-transparent shadow-md shadow-green-500/20'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50 shadow-sm'
                }`}
            >
              <span>🏪</span>
              <span>All Products</span>
            </button>

            {/* Active Filter Breadcrumb integrated nicely */}
            {selectedCategory !== 'All' && (
              <div className="flex items-center ml-2 bg-white border border-gray-200 rounded-xl px-2 py-1.5 shadow-sm animate-fade-in">
                <div className="flex items-center gap-2 text-[11px] font-bold px-2">
                  <span className="text-gray-400 uppercase tracking-wider">Filter:</span>
                  {activeDept && (
                    <>
                      <span className="text-gray-600">{activeDept}</span>
                      <ChevronRight size={12} className="text-gray-300" />
                    </>
                  )}
                  <span className="text-green-700 bg-green-50 px-2 py-1 rounded-md border border-green-100 flex items-center gap-1.5">
                    {CATEGORY_EMOJI[selectedCategory] || '📦'}
                    {selectedCategory.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>
                <div className="w-[1px] h-4 bg-gray-200 mx-1"></div>
                <button
                  onClick={() => { handleCategorySelect('All'); setExpandedDept(null) }}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center"
                  title="Clear filter"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Department Accordion */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {departments.map((dept) => {
              const isExpanded = expandedDept === dept.department
              const isDeptActive = activeDept === dept.department

              return (
                <div key={dept.department} className={`rounded-2xl border overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md ${isDeptActive ? 'border-green-300 bg-green-50/20 ring-1 ring-green-100' : 'border-gray-200 bg-white'
                  }`}>
                  <button
                    onClick={() => toggleDept(dept.department)}
                    className={`w-full flex items-center justify-between px-4 py-3.5 text-left transition-colors duration-300 ${isExpanded
                        ? 'bg-gradient-to-r from-green-50/50 to-emerald-50/50'
                        : 'hover:bg-gray-50'
                      }`}
                  >
                    <span className={`text-sm font-bold truncate ${isDeptActive ? 'text-green-700' : 'text-gray-800'
                      }`}>
                      {dept.department}
                    </span>
                    <div className="flex items-center gap-2 flex-shrink-0 bg-white px-2 py-0.5 rounded-full border border-gray-100 shadow-sm">
                      <span className="text-[10px] text-gray-500 font-extrabold">{dept.categories.length}</span>
                      {isExpanded
                        ? <ChevronDown size={14} className="text-gray-400" />
                        : <ChevronRight size={14} className="text-gray-400" />
                      }
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-3 pb-3 space-y-1 animate-fade-in bg-white/50 pt-1">
                      {dept.categories.map((cat) => {
                        const isActive = selectedCategory === cat.slug
                        const emoji = CATEGORY_EMOJI[cat.slug] || '📦'
                        return (
                          <button
                            key={cat.slug}
                            onClick={() => handleCategorySelect(cat.slug)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all duration-200 btn-press ${isActive
                                ? 'bg-green-gradient text-white shadow-md shadow-green-500/20'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                              }`}
                          >
                            <span className="text-base drop-shadow-sm">{emoji}</span>
                            <span className="text-xs font-bold truncate">{cat.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Products Grid */}
        <div className="mt-2">
          {error ? (
            <div className="bg-red-50 rounded-3xl border border-red-200 p-12 text-center shadow-sm">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                <span className="text-3xl">⚠️</span>
              </div>
              <h3 className="text-lg font-black text-red-700">Error Loading Products</h3>
              <p className="text-red-600 text-sm mt-2 font-medium">{error}</p>
              <button
                onClick={() => {
                  setError(null)
                  loadProducts()
                }}
                className="mt-6 px-6 py-2.5 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors shadow-md hover:shadow-lg"
              >
                Try Again
              </button>
            </div>
          ) : products.length === 0 && !loading ? (
            <div className="bg-white rounded-3xl border border-gray-200 p-16 text-center shadow-sm">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner border border-gray-100">
                <Search size={36} className="text-gray-300" />
              </div>
              <h3 className="text-xl font-black text-gray-800">No products found</h3>
              <p className="text-gray-500 text-sm mt-2 font-medium">We couldn't find any matches for "{searchText}". Try exploring other categories!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Loading placeholder cards */}
          {loading && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-3xl border border-gray-100 p-5 animate-pulse flex flex-col h-[340px] shadow-sm">
                  <div className="w-full h-40 bg-gray-100 rounded-2xl mb-5" />
                  <div className="h-3 bg-gray-100 rounded-full w-1/3 mb-3" />
                  <div className="h-5 bg-gray-100 rounded-lg w-3/4 mb-4" />
                  <div className="flex justify-between items-end mt-auto pt-4 border-t border-gray-50">
                    <div className="h-6 bg-gray-100 rounded-lg w-1/4" />
                    <div className="h-9 bg-gray-100 rounded-xl w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Load More Button */}
        {products.length < total && !loading && (
          <div className="flex justify-center mt-4 mb-8">
            <button
              onClick={loadMore}
              className="flex items-center gap-2.5 px-8 py-3.5 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 text-sm font-extrabold rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md btn-press group"
            >
              Load More Products
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

      </div>
    </div>
  )
}