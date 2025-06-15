import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

// Placeholder data (replace with actual data source or API call)
const categories = [
  {
    id: 'household',
    name: 'Household Almirah',
    subcategories: [
      {
        id: '2-door',
        name: '2 Door Almirah',
        products: [
          { id: 1, name: '2 Door Almirah (Blue)', description: 'Standard two-door steel almirah in blue finish.', image: 'https://via.placeholder.com/400x500/0057A3/FFFFFF?text=Product', isNew: true },
          { id: 2, name: '2 Door Almirah (Brown)', description: 'Standard two-door steel almirah in brown finish.', image: 'https://via.placeholder.com/400x500/0057A3/FFFFFF?text=Product' },
          { id: 3, name: '2 Door Almirah (Maroon)', description: 'Standard two-door steel almirah in maroon finish.', image: 'https://via.placeholder.com/400x500/0057A3/FFFFFF?text=Product' },
          { id: 4, name: '2 Door Almirah (Pink)', description: 'Standard two-door steel almirah in pink finish.', image: 'https://via.placeholder.com/400x500/0057A3/FFFFFF?text=Product' },
        ]
      },
      {
        id: '3-door',
        name: '3 Door Almirah',
        products: [
          { id: 5, name: '3 Door Almirah (Blue)', description: 'Spacious three-door steel almirah in blue.', image: 'https://via.placeholder.com/400x500/0057A3/FFFFFF?text=Product', isNew: true },
          { id: 6, name: '3 Door Almirah (Brown)', description: 'Spacious three-door steel almirah in brown.', image: 'https://via.placeholder.com/400x500/0057A3/FFFFFF?text=Product' },
          { id: 7, name: '3 Door Almirah (Maroon)', description: 'Spacious three-door steel almirah in maroon.', image: 'https://via.placeholder.com/400x500/0057A3/FFFFFF?text=Product' },
        ]
      },
    ]
  },
  {
    id: 'office',
    name: 'Office Products',
    subcategories: [
      {
        id: 'office-almirah',
        name: 'Almirah',
        products: [
          { id: 18, name: 'Office Almirah (Blue)', description: 'Secure office almirah for documents.', image: 'https://via.placeholder.com/400x500/0057A3/FFFFFF?text=Product' },
          { id: 19, name: 'Office Almirah (Grey)', description: 'Secure office almirah for documents.', image: 'https://via.placeholder.com/400x500/0057A3/FFFFFF?text=Product' },
        ]
      },
      {
        id: 'book-cabinet',
        name: 'Book Cabinet',
        products: [
          { id: 20, name: 'Book Cabinet (Brown)', description: 'Stylish book cabinet for office or home.', image: 'https://via.placeholder.com/400x500/0057A3/FFFFFF?text=Product', isNew: true },
          { id: 21, name: 'Book Cabinet (Grey)', description: 'Stylish book cabinet for office or home.', image: 'https://via.placeholder.com/400x500/0057A3/FFFFFF?text=Product' },
        ]
      },
    ]
  },
  {
    id: 'tables',
    name: 'Tables',
    subcategories: [
      {
        id: 'office-tables',
        name: 'Office Tables',
        products: [
          { id: 22, name: 'Executive Office Table', description: 'Premium steel office table for executives.', image: 'https://via.placeholder.com/400x500/0057A3/FFFFFF?text=Table', isNew: true },
          { id: 23, name: 'Computer Table', description: 'Durable steel computer desk with keyboard tray.', image: 'https://via.placeholder.com/400x500/0057A3/FFFFFF?text=Table' },
          { id: 24, name: 'Conference Table', description: 'Large steel conference table for meetings.', image: 'https://via.placeholder.com/400x500/0057A3/FFFFFF?text=Table' },
        ]
      },
      {
        id: 'home-tables',
        name: 'Home Tables',
        products: [
          { id: 25, name: 'Dining Table', description: 'Steel dining table with glass top.', image: 'https://via.placeholder.com/400x500/0057A3/FFFFFF?text=Table', isNew: true },
          { id: 26, name: 'Study Table', description: 'Compact steel study table with bookshelf.', image: 'https://via.placeholder.com/400x500/0057A3/FFFFFF?text=Table' },
        ]
      }
    ]
  },
  {
    id: 'chairs',
    name: 'Chairs',
    subcategories: [
      {
        id: 'office-chairs',
        name: 'Office Chairs',
        products: [
          { id: 27, name: 'Executive Chair', description: 'High-back executive chair with steel frame.', image: 'https://via.placeholder.com/400x500/0057A3/FFFFFF?text=Chair', isNew: true },
          { id: 28, name: 'Staff Chair', description: 'Comfortable staff chair with steel base.', image: 'https://via.placeholder.com/400x500/0057A3/FFFFFF?text=Chair' },
          { id: 29, name: 'Visitor Chair', description: 'Durable visitor chair for office reception.', image: 'https://via.placeholder.com/400x500/0057A3/FFFFFF?text=Chair' },
        ]
      },
      {
        id: 'home-chairs',
        name: 'Home Chairs',
        products: [
          { id: 30, name: 'Dining Chair', description: 'Steel dining chair with cushioned seat.', image: 'https://via.placeholder.com/400x500/0057A3/FFFFFF?text=Chair' },
          { id: 31, name: 'Lounge Chair', description: 'Comfortable steel lounge chair.', image: 'https://via.placeholder.com/400x500/0057A3/FFFFFF?text=Chair', isNew: true },
        ]
      }
    ]
  },
  {
    id: 'lockers',
    name: 'Lockers',
    subcategories: [
      {
        id: 'office-lockers',
        name: 'Office Lockers',
        products: [
          { id: 32, name: 'Staff Locker', description: 'Multi-compartment staff lockers for offices.', image: 'https://via.placeholder.com/400x500/0057A3/FFFFFF?text=Locker' },
          { id: 33, name: 'Security Locker', description: 'High-security steel locker with digital lock.', image: 'https://via.placeholder.com/400x500/0057A3/FFFFFF?text=Locker', isNew: true },
        ]
      },
      {
        id: 'school-lockers',
        name: 'School Lockers',
        products: [
          { id: 34, name: 'Student Locker', description: 'Durable school locker for students.', image: 'https://via.placeholder.com/400x500/0057A3/FFFFFF?text=Locker' },
          { id: 35, name: 'Library Locker', description: 'Book storage locker for libraries.', image: 'https://via.placeholder.com/400x500/0057A3/FFFFFF?text=Locker' },
        ]
      }
    ]
  },
  {
    id: 'racks',
    name: 'Racks',
    subcategories: [
      {
        id: 'storage-racks',
        name: 'Storage Racks',
        products: [
          { id: 36, name: 'Industrial Storage Rack', description: 'Heavy-duty industrial storage rack.', image: 'https://via.placeholder.com/400x500/0057A3/FFFFFF?text=Rack', isNew: true },
          { id: 37, name: 'Warehouse Rack', description: 'Large steel rack for warehouse storage.', image: 'https://via.placeholder.com/400x500/0057A3/FFFFFF?text=Rack' },
        ]
      },
      {
        id: 'home-racks',
        name: 'Home Racks',
        products: [
          { id: 38, name: 'Kitchen Rack', description: 'Steel kitchen storage rack.', image: 'https://via.placeholder.com/400x500/0057A3/FFFFFF?text=Rack' },
          { id: 39, name: 'Shoe Rack', description: 'Compact steel shoe rack for home.', image: 'https://via.placeholder.com/400x500/0057A3/FFFFFF?text=Rack' },
          { id: 40, name: 'Display Rack', description: 'Decorative steel display rack.', image: 'https://via.placeholder.com/400x500/0057A3/FFFFFF?text=Rack', isNew: true },
        ]
      }
    ]
  }
];

// Enhanced search utilities
const createSearchIndex = (products) => {
  return products.map(product => ({
    ...product,
    searchText: [
      product.name,
      product.category,
      product.subcategory,
      product.description || '',
    ].join(' ').toLowerCase(),
    keywords: [
      ...product.name.toLowerCase().split(/\s+/),
      ...product.category.toLowerCase().split(/\s+/),
      ...product.subcategory.toLowerCase().split(/\s+/),
      ...(product.description || '').toLowerCase().split(/\s+/),
    ].filter(word => word.length > 0)
  }));
};

// Flatten products for easier searching
const allProducts = categories.flatMap(category => 
  category.subcategories.flatMap(subcategory => 
    subcategory.products.map(product => ({
      ...product,
      category: category.name,
      subcategory: subcategory.name
    }))
  )
);

// Enhanced search algorithm with scoring
const searchProducts = (query, products) => {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const normalizedQuery = query.toLowerCase().trim();
  const searchTerms = normalizedQuery.split(/\s+/).filter(term => term.length > 0);
  
  if (searchTerms.length === 0) {
    return [];
  }

  const searchIndex = createSearchIndex(products);
  
  const scoredResults = searchIndex.map(product => {
    let score = 0;
    let matchedTerms = 0;
    
    searchTerms.forEach(term => {
      // Exact name match (highest priority)
      if (product.name.toLowerCase().includes(term)) {
        score += 100;
        matchedTerms++;
        
        // Bonus for exact word match in name
        if (product.name.toLowerCase().split(/\s+/).includes(term)) {
          score += 50;
        }
        
        // Bonus for name starting with term
        if (product.name.toLowerCase().startsWith(term)) {
          score += 25;
        }
      }
      
      // Category match (high priority)
      if (product.category.toLowerCase().includes(term)) {
        score += 75;
        matchedTerms++;
      }
      
      // Subcategory match (medium-high priority)
      if (product.subcategory.toLowerCase().includes(term)) {
        score += 60;
        matchedTerms++;
      }
      
      // Description match (medium priority)
      if (product.description && product.description.toLowerCase().includes(term)) {
        score += 40;
        matchedTerms++;
      }
      
      // Partial word matches (lower priority)
      product.keywords.forEach(keyword => {
        if (keyword.includes(term) && keyword !== term) {
          score += 10;
          matchedTerms = Math.max(matchedTerms, 0.5); // Partial credit
        }
      });
      
      // Fuzzy matching for typos (basic implementation)
      if (matchedTerms === 0) {
        product.keywords.forEach(keyword => {
          if (calculateSimilarity(term, keyword) > 0.7) {
            score += 20;
            matchedTerms += 0.3;
          }
        });
      }
    });
    
    // Require at least partial matches for most terms
    const requiredMatchRatio = searchTerms.length === 1 ? 0.5 : 0.6;
    if (matchedTerms < searchTerms.length * requiredMatchRatio) {
      return null;
    }
    
    // Bonus for matching multiple terms
    if (matchedTerms >= searchTerms.length) {
      score += 30;
    }
    
    // Bonus for new products (slight boost)
    if (product.isNew) {
      score += 5;
    }
    
    return { ...product, score, matchedTerms };
  }).filter(Boolean);
  
  // Sort by score (descending) and then by name (ascending)
  return scoredResults
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.name.localeCompare(b.name);
    })
    .slice(0, 50); // Limit results for performance
};

// Simple similarity calculation (Jaro-Winkler approximation)
const calculateSimilarity = (str1, str2) => {
  if (str1 === str2) return 1;
  if (str1.length < 2 || str2.length < 2) return 0;
  
  const longer = str1.length > str2.length ? str1 : str2;
  
  if (longer.length === 0) return 1;
  
  const editDistance = levenshteinDistance(str1, str2);
  return (longer.length - editDistance) / longer.length;
};

const levenshteinDistance = (str1, str2) => {
  const matrix = Array(str2.length + 1).fill().map(() => Array(str1.length + 1).fill(0));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,     // deletion
        matrix[j - 1][i] + 1,     // insertion
        matrix[j - 1][i - 1] + cost // substitution
      );
    }
  }
  
  return matrix[str2.length][str1.length];
};

// Search suggestions based on popular terms
const getSearchSuggestions = (query, products) => {
  if (!query || query.length < 2) return [];
  
  const normalizedQuery = query.toLowerCase();
  const suggestions = new Set();
  
  // Extract common terms from product data
  const commonTerms = products.flatMap(product => [
    ...product.name.toLowerCase().split(/\s+/),
    ...product.category.toLowerCase().split(/\s+/),
    ...product.subcategory.toLowerCase().split(/\s+/),
  ]).filter(term => 
    term.length > 2 && 
    term.startsWith(normalizedQuery) && 
    term !== normalizedQuery
  );
  
  // Get unique suggestions
  [...new Set(commonTerms)]
    .slice(0, 5)
    .forEach(term => suggestions.add(term));
  
  return Array.from(suggestions);
};

// Search results page component
const SearchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  
  // Get search query from URL parameters
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get('q') || '';
  
  // Enhanced search function with debouncing logic
  const performSearch = useCallback((searchQuery) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate network delay (remove in real application)
      setTimeout(() => {
        const results = searchProducts(searchQuery, allProducts);
        setSearchResults(results);
        setLoading(false);
      }, 150); // Reduced delay for better UX
      
    } catch (err) {
      console.error("Search error:", err);
      setError('An error occurred while searching. Please try again.');
      setLoading(false);
    }
  }, []);
  
  // Perform search when query changes
  useEffect(() => {
    setSearchInput(query);
    performSearch(query);
  }, [query, performSearch]);
  
  // Handle search input changes for suggestions
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    
    // Update suggestions as user types
    if (value.length >= 2) {
      setSuggestions(getSearchSuggestions(value, allProducts));
    } else {
      setSuggestions([]);
    }
  };
  
  // Handle new search submission from this page
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const newQuery = searchInput.trim();
    if (newQuery !== query) {
      setSuggestions([]); // Clear suggestions on submit
      navigate(`/search?q=${encodeURIComponent(newQuery)}`);
    }
  };
  
  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setSearchInput(suggestion);
    setSuggestions([]);
    navigate(`/search?q=${encodeURIComponent(suggestion)}`);
  };
  
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-primary text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">Search Results</h1>
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto relative">
            <div className="flex">
              <div className="flex-grow relative">
                <input
                  type="text"
                  name="search"
                  value={searchInput}
                  onChange={handleSearchInputChange}
                  placeholder="Search products by name, category, color, or description..."
                  className="w-full py-3 px-4 rounded-l-md focus:outline-none text-gray-800"
                  autoComplete="off"
                />
                
                {/* Search Suggestions Dropdown */}
                {suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-md shadow-lg z-10 max-h-48 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-800 text-sm capitalize"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="bg-accent text-primary font-bold py-3 px-6 rounded-r-md hover:bg-accent/80 transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </section>
      
      {/* Results Section */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
              <p className="mt-2 text-text">Searching...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              {error}
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-primary mb-4">No results found</h2>
              <p className="text-text mb-6">
                We couldn't find any products matching "{query}".
              </p>
              <div className="space-y-4">
                <p className="font-medium">Suggestions:</p>
                <ul className="list-disc list-inside text-left max-w-md mx-auto space-y-1">
                  <li>Check your spelling</li>
                  <li>Try more general keywords (e.g., "almirah", "table", "chair", "rack")</li>
                  <li>Try searching by color (e.g., "blue", "brown")</li>
                  <li>Try searching by category (e.g., "office", "household", "storage")</li>
                  <li>Try searching by purpose (e.g., "dining", "executive", "student")</li>
                  <li>Use fewer keywords</li>
                </ul>
              </div>
              
              {/* Popular search terms */}
              <div className="mt-8">
                <p className="font-medium mb-3">Popular searches:</p>
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  {['almirah', 'cabinet', 'table', 'chair', 'locker', 'rack', 'office', 'household', '2 door', '3 door', 'blue', 'brown'].map(term => (
                    <button
                      key={term}
                      onClick={() => handleSuggestionClick(term)}
                      className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm hover:bg-primary/20 transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
                <Link to="/products" className="bg-primary text-white font-bold py-2 px-6 rounded-md hover:bg-primary/80 transition-colors">
                  Browse All Products
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-primary">
                  {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'} for "{query}"
                </h2>
                
                {/* Sort options could be added here */}
                <div className="text-sm text-text/70">
                  Sorted by relevance
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {searchResults.map((product) => (
                  <div 
                    key={product._id}
                    className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col"
                  >
                    <div className="relative h-64 overflow-hidden">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                      {product.isNew && (
                        <div className="absolute top-2 right-2 bg-accent text-primary text-xs font-bold px-2 py-1 rounded">
                          NEW
                        </div>
                      )}
                      {/* Debug: Show search score in development */}
                      {process.env.NODE_ENV === 'development' && product.score && (
                        <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                          Score: {product.score}
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-grow">
                      <h3 className="text-lg font-semibold text-primary mb-2">{product.name}</h3>
                      <p className="text-sm text-text/70 mb-2 flex-grow">
                        {product.description || 'No description available.'}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="inline-block bg-primary/10 text-primary text-xs px-2 py-1 rounded">
                          {product.subcategory}
                        </span>
                        <span className="inline-block bg-primary/10 text-primary text-xs px-2 py-1 rounded">
                          {product.category}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-auto">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <svg 
                              key={i}
                              xmlns="http://www.w3.org/2000/svg" 
                              className={`h-4 w-4 ${i < 4 ? 'text-yellow-400' : 'text-gray-300'}`}
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <Link to={`/products/${product._id}`} className="text-primary hover:text-primary/80 text-sm font-medium">
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default SearchPage;