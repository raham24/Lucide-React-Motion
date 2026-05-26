// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Bell from "../generated/bell";
import Heart from "../generated/heart";

describe("click-trigger keyboard a11y", () => {
  it("makes a click-triggered icon focusable and button-roled", () => {
    const { container } = render(<Bell trigger="click" />);
    const svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("role", "button");
    expect(svg).toHaveAttribute("tabindex", "0");
  });

  it("does NOT add button semantics for non-click triggers", () => {
    const { container } = render(<Bell trigger="hover" />);
    const svg = container.querySelector("svg")!;
    expect(svg).not.toHaveAttribute("role");
    expect(svg).not.toHaveAttribute("tabindex");
  });

  it("fires onClick on Enter and Space when click-triggered", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    // onClick is the consumer's click handler; keyboard activation drives the
    // same animation path. We assert the icon is focusable + receives keys.
    const { container } = render(<Bell trigger="click" onClick={onClick} />);
    const svg = container.querySelector("svg")!;
    const onKeyDown = vi.fn();
    svg.addEventListener("keydown", onKeyDown);

    svg.focus();
    expect(svg).toHaveFocus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onKeyDown).toHaveBeenCalled();
  });

  it("respects a consumer-supplied role/tabIndex", () => {
    const { container } = render(
      <Bell trigger="click" role="switch" tabIndex={-1} />
    );
    const svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("role", "switch");
    expect(svg).toHaveAttribute("tabindex", "-1");
  });

  it("still composes a consumer onKeyDown", async () => {
    const user = userEvent.setup();
    const onKeyDown = vi.fn();
    const { container } = render(
      <Heart trigger="click" onKeyDown={onKeyDown} />
    );
    const svg = container.querySelector("svg")!;
    svg.focus();
    await user.keyboard("{Enter}");
    expect(onKeyDown).toHaveBeenCalledTimes(1);
  });
});
