export type AppBreadcrumb = {
  href?: string;
  label: string;
};

type ResolveAppBreadcrumbsOptions = {
  formId?: string;
  formTitle?: string;
};

/** Build the breadcrumb trail for the current app route. */
export function resolveAppBreadcrumbs(
  pathname: string,
  { formId, formTitle = "Untitled form" }: ResolveAppBreadcrumbsOptions = {},
): AppBreadcrumb[] {
  if (pathname === "/dashboard") {
    return [];
  }

  if (pathname === "/forms/new") {
    return [
      { href: "/dashboard", label: "Dashboard" },
      { label: "New form" },
    ];
  }

  if (formId && pathname === `/forms/${formId}`) {
    return [
      { href: "/dashboard", label: "Dashboard" },
      { label: formTitle },
    ];
  }

  if (formId && pathname.startsWith(`/forms/${formId}/submissions`)) {
    return [
      { href: "/dashboard", label: "Dashboard" },
      { href: `/forms/${formId}`, label: formTitle },
      { label: "Responses" },
    ];
  }

  return [];
}

/** Parent crumb used for the mobile header back action. */
export function parentBreadcrumb(
  trail: AppBreadcrumb[],
  options: {
    formId?: string;
    selectedResponseId?: string;
  } = {},
): (AppBreadcrumb & { href: string }) | null {
  const { formId, selectedResponseId } = options;

  if (formId && selectedResponseId) {
    return {
      href: `/forms/${formId}/submissions`,
      label: "Responses",
    };
  }

  if (trail.length < 2) return null;

  const parent = trail[trail.length - 2];
  if (!parent.href) return null;

  return { ...parent, href: parent.href };
}
