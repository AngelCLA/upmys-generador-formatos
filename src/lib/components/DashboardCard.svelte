<script>
  let {
    href,
    icon: Icon,
    title,
    description,
    badge,
    badgeIcon: BadgeIcon,
    badgeType = 'local',
    external = false
  } = $props();
</script>

<a
  {href}
  class="dashboard-card"
  target={external ? '_blank' : undefined}
  rel={external ? 'noopener noreferrer' : undefined}
>
  <div class="dashboard-card-icon">
    {#if Icon}<Icon size={20} />{/if}
  </div>
  <div class="dashboard-card-title">{title}</div>
  <div class="dashboard-card-desc">{description}</div>
  <div
    class="dashboard-card-badge"
    class:dashboard-card-badge--local={badgeType === 'local'}
    class:dashboard-card-badge--external={badgeType !== 'local'}
  >
    {#if BadgeIcon}<BadgeIcon size={12} />{/if}
    {badge}
  </div>
</a>
