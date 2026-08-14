import { describe, expect, it } from "vitest";

import { parentBreadcrumb, resolveAppBreadcrumbs } from "./app-breadcrumbs";

describe("resolveAppBreadcrumbs", () => {
  it("returns an empty trail on the dashboard", () => {
    expect(resolveAppBreadcrumbs("/dashboard")).toEqual([]);
  });

  it("builds the new form trail", () => {
    expect(resolveAppBreadcrumbs("/forms/new")).toEqual([
      { href: "/dashboard", label: "Dashboard" },
      { label: "New form" },
    ]);
  });

  it("builds the editor trail with a live form title", () => {
    expect(
      resolveAppBreadcrumbs("/forms/abc123", {
        formId: "abc123",
        formTitle: "Event RSVP",
      }),
    ).toEqual([
      { href: "/dashboard", label: "Dashboard" },
      { label: "Event RSVP" },
    ]);
  });

  it("builds the responses trail for list and detail routes", () => {
    const options = { formId: "abc123", formTitle: "Event RSVP" };
    const expected = [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/forms/abc123", label: "Event RSVP" },
      { label: "Responses" },
    ];

    expect(resolveAppBreadcrumbs("/forms/abc123/submissions", options)).toEqual(
      expected,
    );
    expect(
      resolveAppBreadcrumbs("/forms/abc123/submissions/sub-1", options),
    ).toEqual(expected);
  });
});

describe("parentBreadcrumb", () => {
  it("returns the form title for the responses list", () => {
    expect(
      parentBreadcrumb(
        resolveAppBreadcrumbs("/forms/abc123/submissions", {
          formId: "abc123",
          formTitle: "Event RSVP",
        }),
      ),
    ).toEqual({
      href: "/forms/abc123",
      label: "Event RSVP",
    });
  });

  it("returns the responses list when a response is selected", () => {
    expect(
      parentBreadcrumb(
        resolveAppBreadcrumbs("/forms/abc123/submissions", {
          formId: "abc123",
          formTitle: "Event RSVP",
        }),
        { formId: "abc123", selectedResponseId: "sub-1" },
      ),
    ).toEqual({
      href: "/forms/abc123/submissions",
      label: "Responses",
    });
  });
});
