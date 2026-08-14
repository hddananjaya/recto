/** Form editor + responses use their own sticky chrome flush under the header. */
export function isFormWorkspaceRoute(pathname: string): boolean {
  if (pathname === "/forms/new") return false;

  return /^\/forms\/[^/]+(\/submissions(?:\/[^/]+)?)?$/.test(pathname);
}
