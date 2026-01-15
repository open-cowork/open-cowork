/**
 * Smooth scroll element to bottom
 */
export function scrollToBottom(
  element: HTMLElement | null,
  options?:
    | ScrollBehavior
    | { behavior: ScrollBehavior; block: ScrollBehavior },
): void {
  if (!element) return;

  const behavior =
    typeof options === "string" ? options : (options?.behavior ?? "smooth");

  element.scrollTo({
    top: element.scrollHeight,
    behavior: behavior as ScrollBehavior,
  });
}

/**
 * Check if element is scrolled to bottom
 */
export function isScrolledToBottom(
  element: HTMLElement | null,
  threshold: number = 10,
): boolean {
  if (!element) return true;

  return (
    element.scrollHeight - element.scrollTop - element.clientHeight <= threshold
  );
}

/**
 * Auto-scroll to bottom if user hasn't scrolled up
 */
export function autoScrollToBottom(
  element: HTMLElement | null,
  threshold: number = 100,
): void {
  if (!element) return;

  // Only auto-scroll if already near bottom
  if (isScrolledToBottom(element, threshold)) {
    scrollToBottom(element, "smooth");
  }
}

/**
 * Get scroll percentage (0-100)
 */
export function getScrollPercentage(element: HTMLElement | null): number {
  if (!element) return 0;

  const scrollableHeight = element.scrollHeight - element.clientHeight;
  if (scrollableHeight <= 0) return 100;

  return (element.scrollTop / scrollableHeight) * 100;
}
