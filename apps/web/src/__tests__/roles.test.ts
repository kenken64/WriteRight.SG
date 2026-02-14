import { describe, it, expect } from 'vitest';
import { getNavForRole, canAccessRoute, roleConfig } from '@/lib/utils/roles';

describe('getNavForRole', () => {
  it('returns parent nav items', () => {
    const nav = getNavForRole('parent');
    expect(nav.length).toBeGreaterThan(0);
    expect(nav.some((n) => n.label === 'Rewards')).toBe(true);
    expect(nav.some((n) => n.label === 'Analytics')).toBe(true);
    expect(nav.some((n) => n.label === 'Achievements')).toBe(false);
  });

  it('returns student nav items', () => {
    const nav = getNavForRole('student');
    expect(nav.length).toBeGreaterThan(0);
    expect(nav.some((n) => n.label === 'Achievements')).toBe(true);
    expect(nav.some((n) => n.label === 'Wishlist')).toBe(true);
    expect(nav.some((n) => n.label === 'Trophy Case')).toBe(true);
    expect(nav.some((n) => n.label === 'Rewards')).toBe(false);
  });
});

describe('canAccessRoute', () => {
  it('allows parent to access /rewards', () => {
    expect(canAccessRoute('parent', '/rewards')).toBe(true);
  });

  it('blocks student from /rewards', () => {
    expect(canAccessRoute('student', '/rewards')).toBe(false);
  });

  it('blocks student from /analytics', () => {
    expect(canAccessRoute('student', '/analytics')).toBe(false);
  });

  it('allows student to access /achievements', () => {
    expect(canAccessRoute('student', '/achievements')).toBe(true);
  });

  it('blocks parent from /achievements', () => {
    expect(canAccessRoute('parent', '/achievements')).toBe(false);
  });

  it('allows both roles to access /assignments', () => {
    expect(canAccessRoute('parent', '/assignments')).toBe(true);
    expect(canAccessRoute('student', '/assignments')).toBe(true);
  });

  it('allows both roles to access /submissions', () => {
    expect(canAccessRoute('parent', '/submissions')).toBe(true);
    expect(canAccessRoute('student', '/submissions')).toBe(true);
  });
});

describe('roleConfig', () => {
  it('has labels for both roles', () => {
    expect(roleConfig.parent.label).toBe('Parent');
    expect(roleConfig.student.label).toBe('Student');
  });
});
