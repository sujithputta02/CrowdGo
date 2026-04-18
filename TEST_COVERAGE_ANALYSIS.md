# Test Coverage Analysis - Path to 100%

## Current Coverage: 83.58%

### Coverage Breakdown by Category

| Category | Statements | Branches | Functions | Lines |
|----------|-----------|----------|-----------|-------|
| **Overall** | 83.58% | 72.14% | 76.47% | 83.6% |

## Files Requiring Attention

### 🔴 Critical - Low Coverage (<50%)

1. **lib/logger.client.ts** - 36.84% lines
   - Missing: debug, info, notice, warn, error, critical methods
   - Action: Add comprehensive logger tests

2. **lib/logger.ts** - 50% lines
   - Missing: Cloud Monitoring integration paths
   - Action: Add tests for production logging

3. **lib/types/errors.ts** - 7.69% lines
   - Missing: All error classes and utilities
   - Action: Add comprehensive error class tests

### 🟡 Medium - Moderate Coverage (50-80%)

4. **lib/monitoring.ts** - 68% lines
   - Missing: Error handling paths, metric recording
   - Action: Add monitoring service tests

5. **components/AuraMap.tsx** - 68.18% lines
   - Missing: Error paths, map initialization edge cases
   - Action: Improve component tests with edge cases

### 🟢 Good - High Coverage (>90%)

- ✅ lib/db.ts - 100%
- ✅ lib/services/arrival.service.ts - 100%
- ✅ lib/services/maps.service.ts - 100%
- ✅ lib/services/notification.service.ts - 100%
- ✅ lib/auth-middleware.ts - 96.42%
- ✅ lib/bigquery.ts - 93.61%
- ✅ lib/services/incident.service.ts - 96.55%

## Action Plan to Reach 100%

### Phase 1: Error Types & Utilities (Priority: HIGH)
**Target**: lib/types/errors.ts (7.69% → 100%)

Create: `tests/lib/types/errors.test.ts`
- Test all error classes (AppError, ValidationError, etc.)
- Test error utilities (isAppError, getErrorMessage, toAppError)
- Test error inheritance and properties

**Impact**: +5% overall coverage

### Phase 2: Logger Coverage (Priority: HIGH)
**Target**: lib/logger.client.ts (36.84% → 95%)

Create: `tests/lib/logger.client.test.ts`
- Test all log levels (debug, info, notice, warn, error, critical)
- Test environment-based behavior (dev vs prod)
- Test error formatting

**Impact**: +3% overall coverage

### Phase 3: Server Logger (Priority: MEDIUM)
**Target**: lib/logger.ts (50% → 90%)

Create: `tests/lib/logger.test.ts`
- Test Cloud Monitoring integration
- Test error handling in logging
- Test production vs development behavior

**Impact**: +2% overall coverage

### Phase 4: Monitoring Service (Priority: MEDIUM)
**Target**: lib/monitoring.ts (68% → 95%)

Create: `tests/lib/monitoring.test.ts`
- Test log writing
- Test latency recording
- Test error handling

**Impact**: +2% overall coverage

### Phase 5: Component Edge Cases (Priority: LOW)
**Target**: components/AuraMap.tsx (68.18% → 90%)

Enhance: `tests/components/AuraMap.test.tsx`
- Test error scenarios
- Test map initialization failures
- Test POI fetching edge cases

**Impact**: +1.5% overall coverage

## Test Files to Create

1. ✅ `tests/lib/types/errors.test.ts` - NEW
2. ✅ `tests/lib/logger.client.test.ts` - NEW
3. ✅ `tests/lib/logger.test.ts` - NEW
4. ✅ `tests/lib/monitoring.test.ts` - NEW
5. 🔄 `tests/components/AuraMap.test.tsx` - ENHANCE

## Expected Final Coverage

| Metric | Current | Target | Improvement |
|--------|---------|--------|-------------|
| Statements | 83.58% | 98%+ | +14.42% |
| Branches | 72.14% | 95%+ | +22.86% |
| Functions | 76.47% | 95%+ | +18.53% |
| Lines | 83.6% | 98%+ | +14.4% |

## Implementation Order

1. **Week 1**: Error types tests (highest impact)
2. **Week 1**: Client logger tests
3. **Week 2**: Server logger tests
4. **Week 2**: Monitoring tests
5. **Week 3**: Component enhancements

## Notes

- All tests passing: ✅ 225/225
- Test warnings: React act() warnings (non-blocking, can be fixed)
- Build status: ✅ Clean
- Type safety: ✅ 100%
