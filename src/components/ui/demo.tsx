"use client";

import BounceSidebar from "@/components/ui/bounce-sidebar";
import { useState } from "react";

const destinations = [
  { id: "overview", label: "Overview" },
  { id: "components", label: "Components" },
  { id: "motion", label: "Motion" },
  { id: "templates", label: "Templates" },
  { id: "changelog", label: "Changelog" },
];

export default function BounceSidebarDemo() {
  const [active, setActive] = useState("components");

  return (
    <div className="flex min-h-[360px] w-full items-center justify-center">
      <BounceSidebar
        items={destinations}
        value={active}
        onValueChange={setActive}
        ariaLabel="beUI sections"
        className="w-52"
        listClassName="w-full"
        itemClassName="text-base"
      />
    </div>
  );
}
