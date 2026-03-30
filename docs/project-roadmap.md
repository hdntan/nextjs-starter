# Project Roadmap

**Last Updated**: 2026-03-30
**Current Phase**: v0.1.0 (MVP Complete)
**Next Phase**: v0.2.0 (Testing & Monitoring)

---

## Version Timeline

### v0.1.0 - MVP (Current)

**Status**: COMPLETE ✓
**Release Date**: 2026-03-30

**Features Delivered**:

- NextAuth v5 JWT authentication with credentials provider
- Server-side session + client-side Zustand token sync
- RSC + SWR hydration pattern for instant page loads
- Example domain: Articles, Courses, Events (discriminated union)
- Polymorphic item cards with factory pattern
- Shelf layout container (grid, scroll, hero variants)
- Dynamic detail pages with `[slug]` routes
- Error boundaries and loading states
- shadcn/ui component library (Button, Card, Input, Badge)
- Base UI React integration
- Zustand state management (auth + UI)
- SWR for client-side data fetching
- React Hook Form + Zod validation
- TypeScript strict mode
- ESLint + Prettier pre-commit hooks
- Commitlint conventional commits
- Correlation ID header for request tracing

**Metrics**:

- Total files: 79
- Total LOC: ~2,500
- TypeScript coverage: 100%
- Component count: 20+

---

### v0.2.0 - Testing & Monitoring

**Status**: PLANNED
**Target**: Q2 2026 (4-6 weeks)
**Priority**: HIGH

#### Features

- [ ] Unit test scaffold (Vitest)
- [ ] Integration test scaffold (test-library)
- [ ] E2E test examples (Playwright)
- [ ] Test coverage reporting (nyc/c8)
- [ ] Analytics integration (posthog, segment)
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring (web-vitals)
- [ ] Request logging middleware
- [ ] API response type validation at runtime

#### Tasks

1. **Setup Testing Infrastructure**
   - Configure Vitest for unit tests
   - Install @testing-library/react
   - Configure Playwright for E2E
   - Add coverage reporting
   - Target: >80% coverage for critical paths

2. **Create Test Examples**
   - Unit tests for utils (cn, generateCorrelationId)
   - Component tests (Button, Card variants)
   - Hook tests (useItems, useAuthStore)
   - Service tests (listItems, getItem)
   - Integration test: login flow
   - E2E test: browse → detail → logout

3. **Monitoring & Observability**
   - Error tracking setup (Sentry)
   - Analytics instrumentation
   - Performance monitoring (Core Web Vitals)
   - Request/response logging
   - Custom metrics dashboard

4. **Documentation**
   - Testing guide
   - Contributing guidelines
   - Performance benchmarks

**Success Criteria**:

- [ ] 100+ unit tests written
- [ ] All critical paths covered (>80%)
- [ ] E2E tests for main user flows
- [ ] Error tracking integrated
- [ ] Performance baseline established

**Risk Assessment**:

- Risk: Testing framework selection (Vitest vs. Jest)
- Mitigation: Evaluate both, choose for speed + TypeScript support
- Risk: Coverage burnout
- Mitigation: Focus on critical paths first (auth, data fetching)

---

### v0.3.0 - UX Polish & Dark Mode

**Status**: PLANNED
**Target**: Q3 2026 (3-4 weeks)
**Priority**: MEDIUM

#### Features

- [ ] Dark mode toggle UI
- [ ] Persist theme preference (localStorage)
- [ ] Pagination component
- [ ] Lazy image loading
- [ ] Image optimization (Next.js Image)
- [ ] Skeleton loading patterns
- [ ] Toast notifications
- [ ] Keyboard shortcuts (Cmd+K search)
- [ ] Accessibility audit (a11y)

#### Tasks

1. **Dark Mode**
   - Add theme toggle to header
   - Update Tailwind config (dark mode)
   - Persist to localStorage
   - Test all components in dark mode
   - Update CSS custom properties

2. **Image Handling**
   - Replace with Next.js Image component
   - Add blur placeholders
   - Implement responsive images
   - Optimize for Lighthouse

3. **UX Enhancements**
   - Pagination component
   - Toast notification system
   - Keyboard navigation
   - Focus management
   - Loading state improvements

4. **Accessibility**
   - WCAG 2.1 AA compliance audit
   - Screen reader testing
   - Color contrast fixes
   - ARIA labels review

**Success Criteria**:

- [ ] Dark mode fully functional
- [ ] Lighthouse score >90
- [ ] WCAG AA compliance
- [ ] All interactions keyboard-accessible

---

### v0.4.0 - PWA & Offline

**Status**: PLANNED
**Target**: Q4 2026 (4-6 weeks)
**Priority**: LOW

#### Features

- [ ] Service Worker registration
- [ ] Offline page cache
- [ ] Background sync
- [ ] Install prompt
- [ ] Web app manifest
- [ ] Offline indicators
- [ ] Sync queue for mutations

#### Scope

- Cache strategy: Stale-while-revalidate
- Offline page: Read-only content from cache
- Mutations: Queue offline, sync when online
- Installation: Add to home screen (iOS/Android)

---

### v0.5.0 - Internationalization (i18n)

**Status**: PLANNED
**Target**: 2026 (6-8 weeks)
**Priority**: LOW

#### Features

- [ ] Multi-language support (EN, ES, FR, JA)
- [ ] Language switcher UI
- [ ] RTL language support
- [ ] Translation keys extraction
- [ ] Dynamic language loading

#### Implementation

- Use next-intl library
- Create translation files (JSON)
- Language-specific routes
- Fallback language (EN)

---

## Maintenance Phase

### Ongoing Tasks

#### Weekly

- [ ] Code review (PR + pair programming)
- [ ] Dependency updates check
- [ ] Performance monitoring
- [ ] Support/issue triage

#### Monthly

- [ ] Security audit
- [ ] Dependency updates (minor/patch)
- [ ] Documentation review
- [ ] Metrics review (test coverage, performance)

#### Quarterly

- [ ] Major version updates (React, Next.js)
- [ ] Architecture review
- [ ] Roadmap adjustment
- [ ] Team retrospective

---

## Known Issues & TODOs

### High Priority

- [ ] Pagination UI component (currently API only)
- [ ] Dark mode toggle (store prepared, UI missing)
- [ ] Image optimization (component prop ready)
- [ ] Comprehensive error logging

### Medium Priority

- [ ] Storybook component docs
- [ ] Performance benchmarking
- [ ] Database schema guide (consumer responsibility)
- [ ] API contract documentation (OpenAPI/Swagger)

### Low Priority

- [ ] Analytics dashboard
- [ ] A/B testing framework
- [ ] Feature flags system
- [ ] Multi-tenancy support

---

## Breaking Changes

### Future Breaking Changes (Plan Ahead)

- **v1.0.0**: Switch from credentials provider to OAuth2
- **v1.0.0**: Require API endpoint pagination format
- **v1.0.0**: Drop support for older browsers (<ES2020)

### Migration Path

- Deprecation warnings 2 versions before breaking change
- Migration guide provided with release
- Support period for N-2 versions minimum

---

## Dependency Upgrades

### Scheduled Upgrades

| Package    | Current | Target | ETA     | Notes                          |
| ---------- | ------- | ------ | ------- | ------------------------------ |
| Next.js    | 16.2.1  | 17     | Q4 2026 | Major upgrade, test thoroughly |
| React      | 19.2.4  | 20     | 2027    | Concurrent React               |
| TypeScript | 5.x     | 6      | Q3 2026 | Check breaking changes         |
| Tailwind   | 4.x     | 5      | 2027    | Monitor for API changes        |

### Update Strategy

1. Update minor/patch versions monthly
2. Major versions quarterly with full regression testing
3. Create branch for major upgrades
4. Run full test suite before merge
5. Monitor production for 1 week post-deploy

---

## Performance Goals

### Current Baseline (v0.1.0)

| Metric                             | Value  | Target |
| ---------------------------------- | ------ | ------ |
| **First Contentful Paint (FCP)**   | ~1.2s  | <1.0s  |
| **Largest Contentful Paint (LCP)** | ~2.0s  | <2.5s  |
| **Cumulative Layout Shift (CLS)**  | 0.05   | <0.1   |
| **Build Time**                     | ~5s    | <10s   |
| **Bundle Size**                    | ~140KB | <180KB |

### v0.2.0 Goals

- [ ] Reduce bundle by 10% (code splitting)
- [ ] FCP <0.8s (preload optimization)
- [ ] 90+ Lighthouse score

### v0.3.0 Goals

- [ ] Image optimization (50% smaller)
- [ ] LCP <2.0s (image lazy load)
- [ ] 95+ Lighthouse score

---

## Security Roadmap

### v0.1.0 (Current)

- [x] Zod env validation
- [x] TypeScript strict mode
- [x] JWT with NEXTAUTH_SECRET
- [x] Correlation ID tracing

### v0.2.0

- [ ] OWASP Top 10 audit
- [ ] Security headers (CSP, X-Frame-Options)
- [ ] Input sanitization guide
- [ ] CORS policy documentation

### v0.3.0

- [ ] Rate limiting
- [ ] CSRF token validation
- [ ] SQL injection prevention guide
- [ ] XSS protection verification

### v0.4.0

- [ ] HTTPS-only in production
- [ ] Subresource integrity (SRI)
- [ ] Audit logging
- [ ] Penetration testing

---

## Team Capacity Planning

### Current Team (Phase 1)

- 1 Frontend Lead
- 2 Full Stack Developers
- 1 Tooling/DevOps

### v0.2.0 (Testing)

- Same team
- +20% time allocation for test infrastructure

### v0.3.0 (Polish)

- Same team
- +10% time allocation for UX refinements

### Post v0.3.0

- **Option A**: Expand to 4-5 developers (feature velocity)
- **Option B**: Maintain core team, defer optional features
- Decision point: Month 6, based on adoption metrics

---

## Metrics & Success Indicators

### Adoption Metrics

| Metric                | Target  | Current |
| --------------------- | ------- | ------- |
| Teams using template  | 5+      | TBD     |
| GitHub stars          | 100+    | TBD     |
| Issues per 1000 LOC   | <5      | TBD     |
| Time to first feature | <1 week | TBD     |

### Quality Metrics

| Metric                 | Target | Current     |
| ---------------------- | ------ | ----------- |
| Type coverage          | 100%   | 100%        |
| Test coverage          | >80%   | 0% (v0.2.0) |
| Lint warnings          | 0      | 0           |
| Documentation coverage | 100%   | 80%         |

### Performance Metrics

| Metric           | Target | Current |
| ---------------- | ------ | ------- |
| Lighthouse score | 95+    | TBD     |
| FCP              | <1.0s  | ~1.2s   |
| LCP              | <2.5s  | ~2.0s   |
| Bundle size      | <200KB | ~140KB  |

---

## Communication & Stakeholders

### Internal Updates

- **Weekly**: Team standup (30 min)
- **Bi-weekly**: Roadmap refinement
- **Monthly**: Metrics review

### External Communication

- **Release Notes**: With each version
- **Blog Posts**: Major milestones
- **Community**: GitHub Discussions
- **Documentation**: Always up-to-date

---

## Appendix: Roadmap Template

When adding new phases:

```markdown
### vX.Y.Z - Feature Name

**Status**: PLANNED
**Target**: Timeline (4-6 weeks)
**Priority**: HIGH/MEDIUM/LOW

#### Features

- [ ] Feature 1
- [ ] Feature 2

#### Tasks

1. **Task Group 1**
   - Subtask 1
   - Subtask 2

#### Success Criteria

- [ ] Criterion 1
- [ ] Criterion 2

**Risk Assessment**:

- Risk: Description
- Mitigation: Plan
```

---

## Quick Links

- **Current Issues**: GitHub Issues
- **Pull Requests**: GitHub PRs
- **Project Board**: GitHub Projects
- **Discussions**: GitHub Discussions
- **CI/CD Status**: GitHub Actions

---

## Version History

| Version | Date       | Status   | Key Milestone                  |
| ------- | ---------- | -------- | ------------------------------ |
| 0.1.0   | 2026-03-30 | Complete | MVP with auth + example domain |
| 0.2.0   | TBD        | Planned  | Testing infrastructure         |
| 0.3.0   | TBD        | Planned  | UX polish + dark mode          |
| 0.4.0   | TBD        | Planned  | PWA + offline support          |
| 0.5.0   | TBD        | Planned  | Internationalization           |
| 1.0.0   | TBD        | Future   | Production-hardened            |
