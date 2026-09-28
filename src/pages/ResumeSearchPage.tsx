import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, FileText, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { searchResumes } from '@/services/backendApi.service';
import { getDataset } from '@/ai/ml/rolePredictor';

const ROLES = [{ key: '', label: 'All Roles' }, ...getDataset().map(e => ({ key: e.role, label: e.display }))];

export function ResumeSearchPage() {
  const [query, setQuery]         = useState('');
  const [role, setRole]           = useState('');
  const [results, setResults]     = useState<any[]>([]);
  const [loading, setLoading]     = useState(false);
  const [searched, setSearched]   = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError]         = useState('');

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true); setError(''); setSearched(true);
    try {
      const res = await searchResumes(query, { role: role || undefined, limit: 20 });
      setResults(res.results);
    } catch {
      // Fallback: client-side search from localStorage
      setError('Backend offline — showing local results');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query, role]);

  return (
    <div className="page-content max-w-5xl space-y-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #0EA5E9, #2563EB)' }}>
            <Search className="h-4.5 w-4.5 text-white" aria-hidden="true" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold">Resume Search</h1>
            <p className="text-sm text-muted-foreground">
              Full-text search across all resumes using PostgreSQL tsvector + GIN index.
            </p>
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder='Search resumes... e.g. "Python developer" or "5 years DevOps"'
            className="pl-9"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-1"
        >
          <Filter className="h-4 w-4" />
          Filters
          {showFilters ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </Button>
        <Button
          className="bg-[#1e40af] hover:bg-[#1e3a8a] text-white"
          onClick={handleSearch}
          disabled={loading || !query.trim()}
        >
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs font-medium mb-1 block">Role</label>
                    <select
                      value={role}
                      onChange={e => setRole(e.target.value)}
                      className="w-full border rounded px-2 py-1.5 text-sm bg-background"
                    >
                      {ROLES.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {error && (
        <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
          {error}
        </div>
      )}

      {/* Results */}
      {searched && !loading && (
        <div>
          <p className="text-sm text-muted-foreground mb-3">
            {results.length > 0 ? `${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"` : `No results for "${query}"`}
          </p>

          {results.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Search className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No resumes found</p>
                <p className="text-sm mt-1">Try different keywords or upload more resumes</p>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            {results.map((r, i) => (
              <motion.div
                key={r.id ?? i}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{r.file_name ?? 'Resume'}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {r.target_role && (
                              <Badge variant="secondary" className="text-xs capitalize">
                                {r.target_role.replace(/_/g, ' ')}
                              </Badge>
                            )}
                            {r.uploaded_at && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(r.uploaded_at).toLocaleDateString()}
                              </span>
                            )}
                            {r.rank && (
                              <Badge className="text-xs bg-blue-100 text-blue-700">
                                Relevance: {Math.round(r.rank * 100)}%
                              </Badge>
                            )}
                          </div>
                          {/* Highlighted snippet */}
                          {r.headline && (
                            <p
                              className="text-xs text-muted-foreground mt-2 leading-relaxed"
                              dangerouslySetInnerHTML={{
                                __html: r.headline.replace(/<b>/g, '<mark class="bg-yellow-200 px-0.5 rounded">').replace(/<\/b>/g, '</mark>')
                              }}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {!searched && (
        <div className="text-center py-16 text-muted-foreground">
          <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm">Enter a search query to find resumes</p>
          <p className="text-xs mt-1">Uses PostgreSQL full-text search with GIN index</p>
        </div>
      )}
    </div>
  );
}
