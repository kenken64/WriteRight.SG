interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({ icon = '📭', title, description, actionLabel, actionHref, onAction }: EmptyStateProps) {
  const ActionTag = actionHref ? 'a' : 'button';

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <span className="text-5xl mb-4">{icon}</span>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</p>
      {actionLabel && (
        <ActionTag
          {...(actionHref ? { href: actionHref } : { onClick: onAction })}
          className="mt-6 inline-flex items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
        >
          {actionLabel}
        </ActionTag>
      )}
    </div>
  );
}

/* Pre-built empty states */
export function NoSubmissions() {
  return (
    <EmptyState
      icon="📝"
      title="No submissions yet"
      description="Submit your first essay to get AI-powered feedback and start tracking your progress!"
      actionLabel="Submit an Essay"
      actionHref="/submissions/new"
    />
  );
}

export function NoAchievements() {
  return (
    <EmptyState
      icon="🏆"
      title="No achievements yet"
      description="Keep writing and submitting essays to unlock badges and rewards!"
      actionLabel="Start Writing"
      actionHref="/submissions/new"
    />
  );
}

export function EmptyWishlist() {
  return (
    <EmptyState
      icon="⭐"
      title="Your wishlist is empty"
      description="Add rewards you'd like to earn. Your parent will link them to achievements!"
      actionLabel="Browse Rewards"
      actionHref="/wishlist"
    />
  );
}

export function EmptyTrophyCase() {
  return (
    <EmptyState
      icon="🏅"
      title="No trophies yet"
      description="Unlock achievements and claim rewards to fill your trophy case!"
    />
  );
}
