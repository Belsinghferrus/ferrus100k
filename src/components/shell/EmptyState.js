export function EmptyState({ title, description, icon: Icon, action }) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card/50 p-10 text-center">
        {Icon && <Icon className="mx-auto h-6 w-6 text-muted-foreground" />}
        <h3 className="mt-3 text-sm font-medium">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">{description}</p>
        )}
        {action && <div className="mt-4">{action}</div>}
      </div>
    )
  }